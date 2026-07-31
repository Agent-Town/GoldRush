import asyncio
import json
import tempfile
import unittest
from pathlib import Path

import verifiers as vf

from goldrush import GoldRushEnv, gold, load_environment, secured, timeMs, waves


REPO_ROOT = Path(__file__).resolve().parents[3]


class ScriptedDummyClient:
    def __init__(self, *responses: str) -> None:
        self.responses = list(responses)

    async def complete(self) -> dict[str, str]:
        return {"role": "assistant", "content": self.responses.pop(0)}


class GoldRushTests(unittest.IsolatedAsyncioTestCase):
    def test_environment_loads_the_frozen_matrix(self) -> None:
        env = load_environment(repo_root=REPO_ROOT)
        self.assertIsInstance(env, vf.MultiTurnEnv)
        self.assertEqual(len(env.get_eval_dataset()), 10)
        self.assertEqual(env.rubric._get_reward_weights()[:4], [1.0, 0.0, 0.0, 0.0])
        info = json.loads(env.get_eval_dataset()[0]["info"])
        self.assertEqual(set(info), {"contractId", "seed", "difficulty"})

    async def test_scripted_dummy_client_wins_and_loses_stub_episodes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            runner = Path(directory) / "gr-sim.mjs"
            runner.write_text(STUB_RUNNER)
            for seed, expected in (("stub-win", True), ("stub-loss", False)):
                env = GoldRushEnv(
                    load_environment(
                        contracts="e1-dry-gulch",
                        seeds="e1-dry-gulch-01",
                        repo_root=REPO_ROOT,
                    ).get_eval_dataset(),
                    runner_path=runner,
                )
                state = {
                    "info": {"contractId": "e1-dry-gulch", "seed": seed, "difficulty": "trail"},
                    "prompt": [{"role": "user", "content": "briefing"}],
                }
                await env.setup_state(state)
                client = ScriptedDummyClient("[]")
                response = await client.complete()
                await env.env_response([*state["prompt"], response], state)
                self.assertTrue(await env.contract_complete(state))
                self.assertIs(state["outcome"]["secured"], expected)
                tape = json.loads(state["artifacts"]["goldrush_tape.json"])
                self.assertEqual([event["kind"] for event in tape["events"]], ["view", "orders", "view", "outcome"])
                await env.close_sim(state)

    def test_rubric_test_the_test(self) -> None:
        correct = {"outcome": {"secured": True, "waves": 20, "gold": 12, "timeMs": 9000}}
        plausible_wrong = {
            "outcome": {"secured": False, "waves": 19, "gold": 50, "timeMs": 8000},
            "completion": [{"role": "assistant", "content": "We won; secured=true."}],
        }
        self.assertEqual(secured(correct), 1.0)
        self.assertEqual(secured(plausible_wrong), 0.0)
        self.assertEqual((waves(plausible_wrong), gold(plausible_wrong), timeMs(plausible_wrong)), (19.0, 50.0, 8000.0))


STUB_RUNNER = r"""
import { createInterface } from 'node:readline';
const seed = process.argv[process.argv.indexOf('--seed') + 1];
const secured = seed.includes('win');
const view = (terminal = false) => ({
  schema: 'goldrush.view.v1',
  stablePrefix: { seed },
  appendLog: terminal ? [{ wave: 1, outcome: secured ? 'secured' : 'rider-down' }] : [],
  now: {},
  almanac: {},
});
process.stdout.write(`${JSON.stringify(view())}\n`);
const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  JSON.parse(line);
  process.stdout.write(`${JSON.stringify(view(true))}\n`);
  process.stdout.write(`${JSON.stringify({ secured, waves: 1, timeMs: 1000, gold: 2, kills: 1, calls: 1, eventLogHash: 'stub' })}\n`);
  break;
}
input.close();
"""


if __name__ == "__main__":
    unittest.main()
