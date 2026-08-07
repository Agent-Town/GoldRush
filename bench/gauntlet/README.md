# THE GAUNTLET — how the county benchmarks harnesses
Protocol authority: `specs/agent-play/ap-10d-harness-ablation.md` (THE HARNESS BENCH + HEAT SHEET + GR-EFFICIENCY). Results: `docs/bench/gauntlet-heat<N>.md`. Entrant workshops (everything an entrant authors — players, experiments, reports, logs): `bench/gauntlet/heat<N>/<entrant>/` — kept by owner law ("if they are now building software - maybe they should keep it", 2026-08-07).

## The shape of a heat
1. **Arena** — one fresh clone of this repo per entrant (`git clone <repo> <entrant>-arena`), `node_modules` symlinked or `npm ci`. The arena is the entrant's whole world: open source, own scratch space, no shared state.
2. **Uniform brief** — `TASK-TEMPLATE.md`, byte-identical for every entrant except the contract/seed line. skill.md is the sole documentation (THE SUFFICIENCY GATE). Zero per-harness prompting.
3. **Fixed model** — every entrant runs `deepseek/deepseek-v4-flash` via OpenRouter (`OPENROUTER_API_KEY` in env). Verify the pin from the harness's own output — one entrant silently defaulted to a different model until its event stream was checked.
   - codex-cli: isolated `CODEX_HOME` + `harness-configs/codex-config.toml` (wire_api = "responses"); `codex exec --sandbox workspace-write "Do the task in the file at: GAUNTLET.md"`.
   - pi: own `HOME` prefix install; `pi -p --provider openrouter --model deepseek/deepseek-v4-flash "..."`.
   - prime-agent: pinned build from source (their installer executes remote code — install law); run `--mode json` (print mode swallows output) and grep the stream for the model pin.
4. **Bounds** — stop at first SECURED outcome or 10 failed sim runs; entrants write `gauntlet-outcome.json` (the sim's final line verbatim) + `gauntlet-report.md`. No network submissions by entrants — the examiner posts.
5. **THE EXAMINER'S PASS** (nothing reaches the county board without it):
   a. Arena integrity: `git status --porcelain` shows ZERO tracked-file mutations.
   b. Replay: the entrant's own player/orders re-run in the arena must reproduce the claimed `eventLogHash` (deterministic sim = a patched or lucky result cannot survive).
   c. Only then: POST the standing with the full self-declared stack (harness, version, config incl. "self-built player", cost fields when known). NOTE the `declaredBy` trap: the POST stack must NOT carry it (server stamps it).
6. **Advance / diagnose** — a winner advances to the next contract with the same brief (new contract/seed line, honest note that rules differ). A failure gets DIAGNOSIS, not coaching; operability fixes (wedged daemon, swallowed output) earn ONE revival per heat, recorded; skill failures stand as results. DNS rows are results too — operability is data.

## Heat 1 record (2026-08-07)
See `docs/bench/gauntlet-heat1.md`. Headline: blank v4-flash 0/3 → pi-wrapped v4-flash secured the-claim attempt 1 with a 10-decision self-built player (EFF 1.30 vs the 13-decision reference) and dry-gulch attempt 1 (20 waves / 20 decisions / 0 failures). The mind, not the model.
