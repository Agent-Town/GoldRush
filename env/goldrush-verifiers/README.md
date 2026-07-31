# Gold Rush verifiers environment

This v0 `verifiers` environment maps one deterministic Gold Rush contract run to one multi-turn rollout. Each model turn submits a JSON array of Standing Orders to `scripts/gr-sim.mjs`; the next `goldrush.view.v1` NDJSON record becomes the following observation. The code-scored reward is `secured` only. `waves`, `gold`, and `timeMs` are zero-weight metrics, while `num_turns` is supplied by `MultiTurnEnv` as the call-count metric.

## Requirements

- Python 3.10 or newer.
- Node.js 20 or newer.
- A Gold Rush checkout containing `scripts/gr-sim.mjs`; run from its root or pass `repo_root` to `load_environment`.

The wheel is pure Python, but the local environment starts the repository's Node runner. Hosted Environments Hub containers do not contain that runner or Node by default; a later publication slice must use a `SandboxEnv`/`CliAgentEnv` image. The package deliberately uses the documented v0 `MultiTurnEnv` API, accepting its future v1 migration risk.

The frozen evaluation data contains five Trail seeds each for `e1-dry-gulch` and `the-claim`. GR-SIM currently implements only `e1-dry-gulch`; Claim rows are frozen now for comparability but fail closed until its real objective driver exists. The default five-example ordering is therefore the five runnable Dry Gulch rows.

## Local checks

From the repository root, create or reuse the package venv and run the suite:

```bash
bash scripts/verifiers-venv.sh
```

The script prints the selected interpreter and version before bootstrapping, installs the package on the first run, and reuses the venv thereafter.

## Attended smoke

Install this package into the same Python environment as Prime CLI, authenticate the chosen model provider, then run from the Gold Rush repository root:

```bash
prime eval run goldrush --model openai/gpt-4.1-mini --num-examples 1 --rollouts-per-example 1 --env-args '{"contracts":["e1-dry-gulch"],"seeds":["e1-dry-gulch-01"]}' --skip-upload
```

**`--skip-upload` is mandatory for internal pre-publication runs.** Prime local evaluations upload results by default without it. Do not run `prime env push`; publication is owner-gated.

Every rollout retains `goldrush_tape` in state and a serialized `goldrush_tape.json` artifact containing the submitted orders, emitted views, terminal outcome, and GR-SIM stderr log. This is the Lantern-compatible replay handoff.
