# Review — gauntlet-heat8-grand-field (s2409 drain)

- **Slice**: `gauntlet-heat8-grand-field` (master `tasks/gauntlet-heat8-grand-field.md`)
- **Branch / tip**: `lane/b` @ `ec2ab4cf8fb967036ae7e829dbc7aeba75261daf (archive: pruned by the A3 rewrite)` (`runner(lane-b): gauntlet-heat8-grand-field.md`)
- **Merge**: `69f95a89f7db8a570a5cacd40ccd7f032535e663 (archive: pruned by the A3 rewrite)` (main, `--no-ff`)
- **Base**: main @ `3f4c6026b` (the s2409 lock commit)

## VERDICT: MERGED — evidence complete, firewall clean, and the headline independently confirmed against the live county API rather than taken on the runner's word.

## What it does

Lands the evidence for gauntlet heat 8 — the first field run under **era 5, "the Replayed Board"**, where every
contract board except the Baron started empty and the county's ranked history restarted. Nine rigs rode the short
set (the-claim, night-shift, hill-mine) plus one Baron war-room visit each: the codex shim incumbent, four guest
CLIs (Prime Agent, OMP, Hermes, OpenClaw), ElizaOS, and — for the first time in county history, on owner-authorized
Anthropic spend — two **Claude rigs (Fable 5, Opus 5)** driven headless through the Claude Code CLI.

The result the owner asked for is on the board, and it is not the one anyone would have scripted: **the two era-5
opening standings on The Claim went to guest harnesses (OMP rank 2, OpenClaw rank 3, behind the operator's own era
probe at rank 1), the incumbent codex shim secured nothing, no rig reached the Baron, and both Claude rigs took a
field-wide platform DNF** — `spawnSync claude ETIMEDOUT`, status 143, empty stdout/stderr, no tool call and no order
emitted, after a 330s setup probe and an authoritative 1200s encounter. The master anticipated exactly this and
called it publishable field data rather than a failure; the evidence carries the verbatim argv shapes so the wall
is diagnosable rather than merely reported.

This merge is **evidence only** — 419 files, all under `artifacts/gauntlet-heat8-20260831/`, all additions.

## Evidence

| Check | Result |
|---|---|
| `drain-block-check` (§3.0, first command) | `✅ CLEAR` — leaf `gauntlet-heat8-grand-field`, `status="queued"` |
| Diff shape | 419 files, **100% under `artifacts/`**, `+71,260 / -0` — zero deletions |
| Production surface | **byte-identical to main**: no `src/`, `functions/`, `scripts/`, `assets/` or config path in the diff |
| Secret scan (firewall: "no secrets echoed") | **CLEAN** — 0 of 8 credential patterns over all **71,679** added lines (`sk-`, `sk-or-v1-`, `sk-ant-`, AKIA, `gh[pousr]_`, non-placeholder Bearer, `re_`, PEM private key) |
| Evidence completeness (self-check list) | `heat8-note.md`, `claude-invocations.md`, `eliza/install-retry.txt`, `charter.md` all **PRESENT**; 31 tapes, 62 logs, 31 reasoning files; all 9 rigs represented incl. both DNF'd Claude rigs |
| **Honesty guard** ("no unsecured attempt was posted") | **HOLDS BY MEASUREMENT** — parsed all 31 tapes: **exactly 2** carry `secured=true`, and they are exactly the 2 claimed rider submissions. No secured tape withheld, no unsecured tape submitted |
| Claimed verified tapes resolve | OMP `agent-76836aa3-…` → `omp/the-claim/attempt-1.tape.json`, `secured=true`, build `c9d86db11`, era 5 · OpenClaw `agent-357d113b-…` → `openclaw/the-claim/attempt-2.tape.json`, same |
| Operator probe chain | `probe/` holds tape + submission + `post-response.json` (`rank 1`) + `verdict-slip.json` (`assay:"verified"`, `ranked:true`, `fnv1a32:8886f412`) + `watch-reel.json` (`buildId c9d86db11`, `engineHash c0a015ae…`, `era 5`) — matching the note exactly |
| **Independent confirmation of the headline** | Live county API queried directly (see below) — **matches `heat8-note.md` row for row** |
| `npx tsc --noEmit` | clean, pre-merge baseline **and** post-merge |
| `npm run build` | green, 2.52s (pre-merge baseline; the merge adds no code, so the baseline carries by construction) |

### The control that matters: the headline, verified against the county rather than the report

The runner's headline was *"OMP verified rank 2; OpenClaw verified rank 3."* That is a claim about an external
system, so it was checked against that system (`GET https://agenttown.app/api/standings`, season 2):

| Contract | Live board, read this fire | `heat8-note.md` claim |
|---|---|---|
| `the-claim` | rank 1 **Heat 8 Era Probe** w10/g200 `verified` · rank 2 **OMP Heat 8** w10/g25 `verified` · rank 3 **OpenClaw Heat 8** w10/g0 `verified` — `retired 22` | identical |
| `e1-baron` | rank 1 **Codex Gauntlet Heat 7** w22/g319 `verified` — `retired 1` | identical |
| `e1-night-shift` | 0 rows | "empty" ✓ |
| `e2-hill-mine` | 0 rows | note says the API returned `400 bad_contract` (see F-2409-2) |

`retired 22` on The Claim is **F-2397-3 working exactly as the owner ruled**: 22 pre-era-5 rows retired off the
ranked board while remaining fetchable as archive artifacts. The era-5 reset is visibly doing its job.

## Merge classification

Trivial and total. `lane/b` was `ahead=1 behind=45`; the single ahead-commit touches **419 paths, every one of them
new files under `artifacts/gauntlet-heat8-20260831/`**, a directory that does not exist on main. There is no
LANE-TOUCHED vs MAIN-MOVED partition to resolve because **no path in the diff exists on main at all** — zero
conflicts were possible and none occurred. `git log main..lane/b` is empty after the merge (fully absorbed).

## Findings

### F-2409-1 — NON-BLOCKING, and it is a method note against myself, not against the slice: I twice built a selector narrower than my own question, and the second one was two steps from a false player-facing outage report.

While gating I ran two probes whose *selectors* silently excluded the thing they were looking for, and **both
returned the shape of a clean negative rather than an error**:

1. Filtering tapes by `*.tape.json` reported the operator probe tape **MISSING**. It exists — as `probe/tape.json`,
   which my glob could not match. Cost: nearly a false "claim without a retained artifact" finding.
2. Parsing the standings API for `rows`/`standings`/`entries` reported **0 rows on every board, every season** —
   including the season-1 archive, which by design "keeps its reels" and can never lawfully be empty. I had already
   isolated it as uniform across all six contracts, confirmed the KV was bound (the `?reel=` and `?verdict=` paths
   returned the full reel and a `verified`, `ranked:true` slip for a row the board said did not exist), and was
   pinning the mechanism to write it up as **the county boards rendering empty while verified rows exist** — a
   serious, player-facing claim.

   The response key is **`board`** (`standings.ts:450`). There was never a defect. Every board reads correctly.

The near-miss is worth recording because it is this factory's own most-repeated lesson arriving through a new door:
the streak from F-2211-1 to F-2222-1 is a catalogue of *corpora that come back empty for a reason that is not the
answer* — a `catch`, a guard, a cwd, a filename, a timezone. **A response-field name is one more, and it sits on the
reader's side rather than the tool's.** The tool was healthy and honest throughout; my parser invented the zero.

What actually saved it was ordinary discipline rather than insight: `bad_contract` on a board that provably had rows
did not add up, so I isolated instead of concluding — and isolation kept pointing at *my* end. **When a probe reports
an impossible negative about a system that is demonstrably working, suspect the probe before the system**, and read
the responder's own source for the field name rather than guessing a plausible one.

### F-2409-2 — NON-BLOCKING, cosmetic, and it is the same defect one desk over: `heat8-note.md` records Hill Mine as `400 bad_contract` where the true answer is an honest empty board.

The note states: *"Hill Mine | county API currently returns `400 bad_contract`; the exact live-build simulator
attempts are retained, but no run secured."* Queried with the parameter names the endpoint actually reads
(`?epoch=…&contract=…`, per `standings.ts:317` and `:372`), `e2-hill-mine` / `epoch-2-steamworks` returns
**`ok:true`, 0 board rows, `retired 3`** — a normal empty board, not a rejection.

This changes nothing about the field result (**no Hill Mine run secured, so nothing was submittable and nothing is
missing from the board**), and the retained attempts are unaffected. It is recorded because the note is the county's
durable account of the heat and the next reader should not inherit a phantom API defect — the same wrong-parameter
shape that cost me two probes above, which is mildly reassuring about the runner and mildly damning about the
ergonomics of that endpoint's parameter names.

### Not findings, stated so they are not re-derived

- **Both Claude rigs DNF'd.** This is a TRUE field result and the master explicitly pre-authorized it as publishable
  data. The wall is captured with verbatim argv, exit status 143 and empty streams. Diagnosing `spawnSync claude
  ETIMEDOUT` from the runner context is real, interesting work — **it is not this drain's**, and it wants its own
  slice rather than a drive-by.
- **The era-5 engine hash in the arena** reads `c0a015ae…`, i.e. the blessed era-5 pin, because the field rode the
  *deployed* build `c9d86db11` — which predates `e27259c67`. This is consistent with, and not contradicted by,
  **F-2408-1** (main's computed hash has since moved to `386f971d…` because `package.json` sits in the engine
  identity corpus). No cross-check failed.
- **`retired 22` / `retired 1`** are the era-5 lineage retirement, ruled by the owner and open on the desk as
  F-2397-3. Working as specified.
