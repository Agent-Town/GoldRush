from __future__ import annotations

import asyncio
import contextlib
import json
import re
import shutil
from pathlib import Path
from typing import Any, Sequence

import verifiers as vf
from datasets import Dataset

__all__ = ["GoldRushEnv", "load_environment"]

_DATA = Path(__file__).with_name("data") / "eval_dataset.jsonl"
_TERMINAL_OUTCOMES = {"secured", "rider-down"}


def _outcome(state: dict[str, Any]) -> dict[str, Any]:
    value = state.get("outcome")
    return value if isinstance(value, dict) else {}


def secured(state: dict[str, Any]) -> float:
    return float(_outcome(state).get("secured") is True)


def waves(state: dict[str, Any]) -> float:
    return float(_outcome(state).get("waves", 0))


def gold(state: dict[str, Any]) -> float:
    return float(_outcome(state).get("gold", 0))


def timeMs(state: dict[str, Any]) -> float:
    return float(_outcome(state).get("timeMs", 0))


class GoldRushEnv(vf.MultiTurnEnv):
    def __init__(
        self,
        eval_dataset: Dataset,
        *,
        repo_root: str | Path | None = None,
        runner_path: str | Path | None = None,
        node_binary: str = "node",
        **kwargs: Any,
    ) -> None:
        node = shutil.which(node_binary)
        if node is None:
            raise RuntimeError("Gold Rush verifiers require Node.js >=20, but 'node' was not found on PATH.")
        self.node = node
        self.runner = Path(runner_path) if runner_path else _find_runner(repo_root)
        self._node_checked = False
        self._node_check_lock = asyncio.Lock()
        rubric = vf.Rubric(
            funcs=[secured, waves, gold, timeMs],
            weights=[1.0, 0.0, 0.0, 0.0],
        )
        super().__init__(eval_dataset=eval_dataset, rubric=rubric, max_turns=64, **kwargs)

    async def setup_state(self, state: dict[str, Any]) -> dict[str, Any]:
        await self._ensure_node()
        info = state.get("info", {})
        if isinstance(info, str):
            info = json.loads(info)
        if not isinstance(info, dict):
            raise ValueError("Gold Rush dataset info must be a JSON object.")

        process = await asyncio.create_subprocess_exec(
            self.node,
            str(self.runner),
            "--contract",
            str(info["contractId"]),
            "--seed",
            str(info["seed"]),
            cwd=self.runner.parent.parent,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        state["_gr_process"] = process
        tape = {
            "version": 1,
            "contractId": info["contractId"],
            "seed": info["seed"],
            "difficulty": info["difficulty"],
            "events": [],
            "outcome": None,
            "stderr": [],
        }
        state["goldrush_tape"] = tape

        view = await self._read_json(process, "initial view")
        self._require_view(view)
        tape["events"].append({"kind": "view", "value": view})
        state["_gr_last_view"] = view
        state["prompt"] = [*state["prompt"], self._message({"view": view})]
        self._publish_tape(state)
        return state

    async def env_response(
        self, messages: list[Any], state: dict[str, Any], **_: Any
    ) -> list[dict[str, str]]:
        process = state.get("_gr_process")
        if process is None or process.stdin is None:
            raise RuntimeError("GR-SIM is not running for this rollout.")

        raw = self._message_text(messages[-1])
        try:
            orders = json.loads(raw)
            if not isinstance(orders, list):
                raise ValueError("standing orders must be a JSON array")
        except (json.JSONDecodeError, ValueError) as error:
            return [self._message({"error": str(error), "view": state["_gr_last_view"]})]

        process.stdin.write((json.dumps(orders, separators=(",", ":")) + "\n").encode())
        await process.stdin.drain()
        kind, value = await self._read_sim_reply(process)
        event = {"kind": "orders", "value": orders, "accepted": kind == "view"}
        if kind == "rejected":
            event["error"] = value
            state["goldrush_tape"]["events"].append(event)
            self._publish_tape(state)
            return [self._message({"error": value, "view": state["_gr_last_view"]})]

        view = value
        self._require_view(view)
        state["goldrush_tape"]["events"].extend(
            [event, {"kind": "view", "value": view}]
        )
        state["_gr_last_view"] = view
        if not self._terminal(view):
            self._publish_tape(state)
            return [self._message({"view": view})]

        outcome = await self._read_json(process, "outcome")
        state["outcome"] = outcome
        state["goldrush_tape"]["outcome"] = outcome
        state["goldrush_tape"]["events"].append({"kind": "outcome", "value": outcome})
        await self._finish_process(process, state)
        final = [self._message({"view": view, "outcome": outcome})]
        state["final_env_response"] = final
        self._publish_tape(state)
        return final

    @vf.stop
    async def contract_complete(self, state: dict[str, Any]) -> bool:
        return isinstance(state.get("outcome"), dict)

    @vf.cleanup(priority=-100)
    async def close_sim(self, state: dict[str, Any]) -> None:
        process = state.pop("_gr_process", None)
        state.pop("_gr_last_view", None)
        if process is None:
            return
        if process.returncode is None:
            process.terminate()
            try:
                await asyncio.wait_for(process.wait(), 2)
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
        await self._capture_stderr(process, state)
        self._publish_tape(state)

    async def _ensure_node(self) -> None:
        if self._node_checked:
            return
        async with self._node_check_lock:
            if self._node_checked:
                return
            process = await asyncio.create_subprocess_exec(
                self.node,
                "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()
            version = stdout.decode().strip()
            match = re.fullmatch(r"v(\d+)(?:\.\d+){0,2}", version)
            if process.returncode != 0 or match is None:
                detail = stderr.decode().strip() or version or "no version returned"
                raise RuntimeError(f"Could not verify Node.js >=20: {detail}")
            if int(match.group(1)) < 20:
                raise RuntimeError(f"Gold Rush verifiers require Node.js >=20; found {version}.")
            self._node_checked = True

    async def _read_sim_reply(self, process: asyncio.subprocess.Process) -> tuple[str, Any]:
        assert process.stdout is not None and process.stderr is not None
        stdout_task = asyncio.create_task(process.stdout.readline())
        stderr_task = asyncio.create_task(process.stderr.readline())
        await asyncio.wait({stdout_task, stderr_task}, return_when=asyncio.FIRST_COMPLETED)
        if stdout_task.done() and stdout_task.result():
            stderr_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await stderr_task
            return "view", self._decode_json(stdout_task.result(), "view")

        for task in (stdout_task, stderr_task):
            task.cancel()
        for task in (stdout_task, stderr_task):
            with contextlib.suppress(asyncio.CancelledError):
                await task
        line = stderr_task.result().decode().strip() if not stderr_task.cancelled() else ""
        if line.startswith("gr-sim rejected orders:"):
            return "rejected", line.removeprefix("gr-sim rejected orders:").strip()
        await process.wait()
        remainder = await process.stderr.read()
        detail = "\n".join(part for part in [line, remainder.decode().strip()] if part)
        raise RuntimeError(f"GR-SIM exited before the next view: {detail or 'no diagnostic'}")

    async def _read_json(self, process: asyncio.subprocess.Process, label: str) -> Any:
        assert process.stdout is not None
        line = await process.stdout.readline()
        if line:
            return self._decode_json(line, label)
        await process.wait()
        assert process.stderr is not None
        detail = (await process.stderr.read()).decode().strip()
        raise RuntimeError(f"GR-SIM exited before emitting {label}: {detail or 'no diagnostic'}")

    @staticmethod
    def _decode_json(line: bytes, label: str) -> Any:
        try:
            return json.loads(line)
        except json.JSONDecodeError as error:
            raise RuntimeError(f"GR-SIM emitted invalid {label} JSON: {error}") from error

    @staticmethod
    def _require_view(value: Any) -> None:
        if not isinstance(value, dict) or value.get("schema") != "goldrush.view.v1":
            raise RuntimeError("GR-SIM emitted a value that is not a goldrush.view.v1 view.")

    @staticmethod
    def _terminal(view: dict[str, Any]) -> bool:
        log = view.get("appendLog")
        return bool(
            isinstance(log, list)
            and log
            and isinstance(log[-1], dict)
            and log[-1].get("outcome") in _TERMINAL_OUTCOMES
        )

    @staticmethod
    def _message(value: Any) -> dict[str, str]:
        return {"role": "user", "content": json.dumps(value, separators=(",", ":"))}

    @staticmethod
    def _message_text(message: Any) -> str:
        content = message.get("content") if isinstance(message, dict) else getattr(message, "content", None)
        if not isinstance(content, str):
            raise ValueError("The rider response must contain JSON text.")
        return content.strip()

    async def _finish_process(self, process: asyncio.subprocess.Process, state: dict[str, Any]) -> None:
        return_code = await process.wait()
        await self._capture_stderr(process, state)
        if return_code != 0:
            raise RuntimeError(f"GR-SIM exited with status {return_code} after emitting an outcome.")

    @staticmethod
    async def _capture_stderr(process: asyncio.subprocess.Process, state: dict[str, Any]) -> None:
        if process.stderr is None:
            return
        text = (await process.stderr.read()).decode().strip()
        if text and "goldrush_tape" in state:
            state["goldrush_tape"]["stderr"].extend(text.splitlines())

    @staticmethod
    def _publish_tape(state: dict[str, Any]) -> None:
        tape = state.get("goldrush_tape")
        if tape is None:
            return
        state.setdefault("artifacts", {})["goldrush_tape.json"] = json.dumps(
            tape, separators=(",", ":"), sort_keys=True
        )


def load_environment(
    contracts: str | Sequence[str] | None = None,
    difficulty: str = "trail",
    seeds: str | Sequence[str] | None = None,
    repo_root: str | Path | None = None,
) -> vf.Environment:
    if difficulty != "trail":
        raise ValueError("GR-SIM currently supports only the trail difficulty.")
    wanted_contracts = _selection(contracts)
    wanted_seeds = _selection(seeds)
    rows = []
    for line in _DATA.read_text().splitlines():
        row = json.loads(line)
        info = json.loads(row["info"])
        if wanted_contracts and info["contractId"] not in wanted_contracts:
            continue
        if wanted_seeds and info["seed"] not in wanted_seeds:
            continue
        rows.append(row)
    if not rows:
        raise ValueError("No frozen Gold Rush evaluation rows match the requested contracts and seeds.")
    return GoldRushEnv(Dataset.from_list(rows), repo_root=repo_root)


def _selection(value: str | Sequence[str] | None) -> set[str]:
    if value is None:
        return set()
    values = [value] if isinstance(value, str) else list(value)
    if not values or any(not isinstance(item, str) or not item for item in values):
        raise ValueError("contracts and seeds must contain non-empty strings.")
    return set(values)


def _find_runner(repo_root: str | Path | None) -> Path:
    candidates = [Path(repo_root)] if repo_root else [Path.cwd(), *Path.cwd().parents]
    for root in candidates:
        runner = root.resolve() / "scripts" / "gr-sim.mjs"
        if runner.is_file():
            return runner
    raise RuntimeError(
        "Could not find scripts/gr-sim.mjs. Run from the Gold Rush repository root or pass repo_root."
    )
