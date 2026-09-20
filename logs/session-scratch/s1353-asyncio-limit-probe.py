#!/usr/bin/env python3
"""s1353 — F-1345-2, part 6: REPRODUCE THE MECHANISM the row inferred from a code read.

The row claims three things it never executed:
  (1) asyncio's StreamReader.readline() raises ValueError past the 64 KiB default limit;
  (2) `stdout_task.result()` re-raises that ValueError;
  (3) the raise exits _read_sim_reply with stderr_task still pending and never
      cancelled -> "Task was destroyed but it is pending!".

This reproduces all three standalone (no verifiers venv needed), by mimicking
env/goldrush-verifiers/goldrush/__init__.py's _read_sim_reply shape exactly.
Run: python3 logs/session-scratch/s1353-asyncio-limit-probe.py

!! NEVER EXECUTED BY s1353 — BANKED UNRUN, AND ITS OUTPUT IS THEREFORE UNKNOWN. !!
The fire shell's bash allowlist admits bare `python3 --version` but DENIES both
`python3 <file>` and the verifiers venv binary, so s1353 could not run this or
pytest. F-1349-2 forbids shelling around such a denial, so it was not attempted.
Nothing in F-1345-2's write-up rests on this file; the byte measurements that DO
back the verdict are all node-side (s1353-view-bytes*.mjs, s1353-appendlog-probe.mjs)
and were really run. Whoever can execute Python should run this FIRST — if (1)-(3)
do not reproduce, F-1345-2's premise is wrong and the cure is unnecessary.
"""
import asyncio
import sys

DEFAULT_LIMIT = 65536


async def read_sim_reply(process):
    """Byte-for-byte the shape of _read_sim_reply's head (the :193-200 block)."""
    stdout_task = asyncio.create_task(process.stdout.readline())
    stderr_task = asyncio.create_task(process.stderr.readline())
    await asyncio.wait({stdout_task, stderr_task}, return_when=asyncio.FIRST_COMPLETED)
    if stdout_task.done() and stdout_task.result():  # <-- re-raises
        stderr_task.cancel()
        return "view", stdout_task.result()
    return "other", None


async def trial(line_bytes, limit=None):
    kwargs = {"limit": limit} if limit is not None else {}
    process = await asyncio.create_subprocess_exec(
        sys.executable, "-c",
        f"import sys; sys.stdout.write('x'*{line_bytes}); sys.stdout.write('\\n'); sys.stdout.flush()",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        **kwargs,
    )
    pending_after = None
    try:
        kind, _ = await read_sim_reply(process)
        outcome = f"returned {kind!r}"
    except ValueError as exc:
        outcome = f"ValueError: {str(exc)[:60]}"
        # This is the leak the finding names: did the sibling survive the raise?
        pending_after = [t for t in asyncio.all_tasks() if not t.done() and t is not asyncio.current_task()]
    finally:
        process.kill()
        await process.wait()
    leaked = len(pending_after) if pending_after is not None else 0
    print(f"  line={line_bytes}B limit={limit or DEFAULT_LIMIT}B -> {outcome}"
          f"{f'  | PENDING TASKS LEAKED: {leaked}' if pending_after is not None else ''}")


async def main():
    print(f"asyncio default StreamReader limit: {DEFAULT_LIMIT}B")
    print("(1)+(2)+(3) at the DEFAULT limit — the spawn site passes no `limit=`:")
    await trial(1_000)            # comfortably under: control
    await trial(12_978)           # the largest view s1353 actually measured
    await trial(DEFAULT_LIMIT + 1)  # one byte over the cliff
    print("with an explicit larger `limit=` at the spawn site (the row's cure (b)):")
    await trial(DEFAULT_LIMIT + 1, limit=1_048_576)


asyncio.run(main())
