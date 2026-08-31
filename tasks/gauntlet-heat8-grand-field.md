# Task gauntlet-heat8-grand-field: every harness on era 5 — the codex shim field, AND Claude rides (Fable 5, Opus 5) (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. OPERATOR, no rider — for EVERY rig in this field, including the Claude ones.

**RUN THE PROGRAM OF `tasks/gauntlet-heat6-guests.md` (field mechanics, commons loop, firewall, honesty guards) as extended by `tasks/gauntlet-heat7-guests-party.md` (era notice in every charter, the reel-papers duty, the >3-concurrent-429 serialization lesson) — both verbatim** — with this heat's field, stakes, and the Claude-rider mechanics below.

READ FIRST: AGENTS.md; both prior masters; **specs/embodied-hand.md + the era-5 registry** (era 5 "the Replayed Board": boards carry only current-era reels, standings are re-earned each era); `public/skill.md` (current-era papers required at the door; BUILD implies travel); the commons (`~/Claude/Projects/goldrush-gauntlet/`): almanac pages incl. the era-5 notes, `baron-campaign/BOARD.md`, every rider's `memories/<rig>/`, `memories/FORMAT.md`.

Pre-flight: heat-7-guests' verbatim (safe-dupe + F-1407-1; npm install; build green; skew law: detached worktree at the LIVE deploy, own path `/tmp/heat8-<build>`; **ERA GATE: the live worktree's registry must read era 5** — else STOP; shim SSE + EPIPE re-verified; early probe submission, skew → STOP).

## Why (owner 2026-08-31, verbatim: "ok! thwn lets make a big harness and model ride - Claude models, too, Fable 5, Opus 5, the harnesses combined - lets see how it goes.")
Era 5 reset every board: the county's ranked history restarts NOW, and whoever rides this heat writes the first verified standings of the era on five contracts — with the Baron crown, freshly re-earned by codex, standing to defend. And for the first time, Claude rigs enter the field: the owner has explicitly authorized the Anthropic-subscription spend for Fable 5 and Opus 5 riders.

## The field
| rig | harness | how it rides |
|---|---|---|
| codex · gpt-5.6-sol | codex shim | charter + streaming shim (the incumbent — it defends the Baron crown and its old claims from scratch like everyone else) |
| pi (Prime Agent) · omp · hermes · openclaw | their own CLIs | charter + shim, per heat-7-guests |
| eliza | elizaOS | one bounded fresh-install retry; still broken = DNF with the exact error |
| **claude · fable-5** | **Claude Code CLI, headless** | see CLAUDE-RIDER MECHANICS |
| **claude · opus-5** | **Claude Code CLI, headless** | see CLAUDE-RIDER MECHANICS |

## CLAUDE-RIDER MECHANICS (new; the operator drives, never ghost-writes)
1. Each Claude rig rides via `claude -p "<charter>" --model claude-fable-5` / `--model claude-opus-5`, spawned from the detached live-build worktree with a CLEAN env (no `CLAUDE_CONFIG_DIR`/`CLAUDECODE` inherited — the runner env is already scrubbed; verify). Grant the rider the minimal tools it needs to play: running `node scripts/gr-sim.mjs …` and reading the repo/commons (`--allowedTools` covering node + reads; work out the exact flags and RECORD the invocation verbatim in the evidence).
2. The charter (same skeleton as the shim guests'): skill.md; the era-5 notice (papers, travel, fresh boards); their OWN memories dir — **create `memories/claude__fable-5/` and `memories/claude__opus-5/` per FORMAT.md, generation 1** (first ride in county history: the dir starts empty and their charter says so); the almanac paths; the de-spoiler law for the Baron war-room.
3. Same walls as every guest: 3 attempts per map, ~20 min walls, the short set (the-claim, night-shift, hill-mine) + one Baron war-room visit. Stacks declared truthfully: `model: claude-fable-5` / `claude-opus-5`, `harness: claude-code-cli` (+ the CLI version), `worldModel` per what the charter grants.
4. **The spend honesty**: the owner authorized the Anthropic spend for THIS heat. If a Claude ride hits a credit/availability wall (Fable 5 in particular may be usage-billed), DNF that rig with the EXACT error after ONE encounter — never burn retries against a paywall — and continue the field.
5. If `claude -p` cannot be driven non-interactively with tool grants from the runner context (a real platform wall, not an inconvenience), DNF the Claude rigs with the exact invocation + error captured — that finding is publishable field data, not a failure.

## Program (priority order)
1. The short set per rig + one Baron war-room visit each. **Era-5 stakes: every board except the Baron is EMPTY — first verified row wins the era's opening standing.** Secured → submit (era-5 papers) → poll `verified` → record the reel-papers verdict per row (heat-7 duty).
2. The Baron: campaign law (war-room, de-spoiler, hypotheses not attempt-counts within the walls). Any rig felling him under embodied rules joins the era-5 crown board against codex's standing.
3. Serialize beyond 3 concurrent completion calls (the heat-7 429 lesson, pre-learned).
4. THE COMMONS LOOP per rider (attempts, memories, patch files — scribe-labeled where a harness cannot write its own).
5. Evidence: `artifacts/gauntlet-heat8-<date>/` — the matrix (rig | map | attempts | result | verdict | papers | era-notice acknowledged), the Claude invocations verbatim, the per-rig walls/DNFs with exact errors, shim + claude health observations.

## Firewall
Heat-7-guests' verbatim (Gold Rush: `artifacts/gauntlet-heat8-*/**` + BACKLOG row only; gauntlet checkout: riders' own dirs only + the two NEW Claude memories dirs, no push; configs snapshot/restore; no secrets echoed — and `claude -p` invocations must never echo tokens/env). Zero overlap with anything live on other lanes.

## Self-check
Era gate + shim verdicts quoted; verified slips quoted per row; the matrix complete; Claude invocations + versions recorded; commons commits listed (incl. the two new rig dirs); configs restored. End: READY-FOR-GATES + report: the era-5 opening standings table, the Claude rigs' field debut verdict (rows, DNFs, or walls — whatever is TRUE), the Baron round, the embodiment observations across rigs.

## No-op / honesty guard
Both predecessors' verbatim. A field where the Claude rigs DNF on platform walls and the boards fill with shim riders is a TRUE result; a field where a Claude rig takes an era-5 opening standing is a headline; the county publishes either.
