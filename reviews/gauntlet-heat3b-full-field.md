# Review — gauntlet-heat3b-full-field

- **Slice:** `gauntlet-heat3b-full-field` (heat 3, the full field)
- **Branch / tip:** `lane/b` @ `c713cf7f7` ("runner(lane-b): gauntlet-heat3b-full-field.md")
- **Merge base:** `a951e1fd9ce26fecc6d3abf1db4fb4591c074451`
- **Merged to main:** `407f89f422f4a7eaccea8183e4949284a06653f5`
- **Drained by:** fire s2274, 2026-08-24
- **Gate worktree:** detached `gate-s2274/` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGED — evidence-only slice, gates green, one non-blocking finding (F-2274-1)

## What it does

Heat 3's full field: the operator installed Prime Agent (Prime Intellect), OMP and elizaOS
at current versions, re-rode Hermes and OpenClaw, and pointed every guest at the heat-3a
subscription shim, then reconned the paper trio (Tycho / VISTA / AVO) for runnable public code.

**The heat's result is a single, sharp, unanimous finding:** Prime Agent `0.8.0`, OMP `18.0.4`,
Hermes `0.20.0` and OpenClaw `2026.7.1-2` **all reached** `POST /v1/chat/completions` and **all
four config-DNF'd on the same wall** — `400 "Streaming is not supported"`. Modern harness loops
consume SSE and refuse non-streaming endpoints; the heat-3a shim answers non-streaming.
**One cure, four riders.** elizaOS `1.7.2` DNF'd earlier, at install. Paper trio: Tycho has public
code but is coupled to ARC-AGI-3 rendered frames and scorecards; VISTA and AVO have no runnable
public harness. Zero rides started, zero tapes produced, zero submissions, **zero subscription
tokens on any arm** (the shim rejected each call before launching `codex exec`).

This is a DNF-heavy heat, which the master's own law declares publishable ("A DNF-heavy field is
a publishable heat"). It is also the direct cause of `gauntlet-heat3c-shim-streaming` being
authored — this slice measured the single blocker that master exists to cure.

## Evidence

| gate | result |
| --- | --- |
| `npx tsc --noEmit` (merged tree) | **clean**, no diagnostics |
| `npm run build` (merged tree) | **green, 2.25 s**; `[asset-diet]` herald 1,158,214 B under the 1,500,000 B ceiling |
| Credential scan (merged tree) | 19 subjects · **17 scanned** · 2 symlinks skipped · 8 secret patterns · **3 matches, all the literal placeholder** `HEAT3_SHIM_KEY` / `${HEAT3_SHIM_KEY}` against a localhost-only shim — **zero real credentials** |
| Payload file modes | 17 × `100644`, **2 × `120000` (symlinks — F-2274-1)** |
| Merged tree vs main | **20 paths**: 19 under `artifacts/gauntlet-heat3-20260824/`, 1 × `tasks/BACKLOG.md` |
| Spec / sim suites | **not in scope, and this is a structural fact, not a waiver** — the diff contains no `src/`, `e2e/`, `scripts/`, `functions/`, `assets/` or `package.json` path, so no playwright spec and no `src/sim`-`src/systems`-`src/entities` trigger (§3) applies |
| Lane classifier after merge | `lane/b` **`ahead=1` → `ahead=0`, paths 20 → 0** — the merge demonstrably absorbed the lane |

Deliverable completeness against the master's self-check: `heat3-note.md` carries the full
**15-row matrix** (5 arms × 3 contracts, every row staged-DNF'd with its stage and error), the
**3 paper-trio recon verdicts**, a per-arm cost table, shim latency observations, and 5 door
findings. Guest global configs restored (the note records the OpenClaw approvals-file restore
explicitly); ride worktree removed; `tracked-dirt=0` in the lane confirms it.

## Merge classification

Base `a951e1fd9`. Per-file:

- **19 × LANE-TOUCHED, main never moved them** — all new files under
  `artifacts/gauntlet-heat3-20260824/`. Pure additions, no conflict possible.
- **1 × BOTH-MOVED — `tasks/BACKLOG.md`.** Both sides prepended a row. Resolved **keeping both**:
  main's current rows first (newest at top), then the lane's completion row immediately above the
  `HEAT 3 — THE FULL FIELD` charter row it completes, which is exactly where the lane put it.

**The resolution was verified by ROW SET, not by eye.** First check flagged 1 lane row as "lost";
audited against the merge base rather than believed: the row
(`🟡 F-2272-2 … CORRECTIVE AUTHORED`) is **present in the base, untouched by the lane, and deleted
by main** — s2273 retired it when F-2272-2 was cured. Git's 3-way correctly took main's
retirement; the first check was simply comparing against the lane's stale base copy.
Re-run against the correct predicate — *main's current rows ∪ rows the lane genuinely added* —
the resolution is **exact: expected 3292, resolved 3292, 0 missing, 0 invented**, retirements preserved.

A second, live re-verification was owed and taken: main moved mid-drain (a concurrent attended
session landed the heat5 bookkeeping), so the final merged `BACKLOG.md` was re-checked directly —
**attended's heat5 row and the lane's heat3b row both survive, 0 conflict markers.**

## Findings

### F-2274-1 — the payload carries two absolute symlinks that dangle everywhere but this machine (NON-BLOCKING)

`artifacts/gauntlet-heat3-20260824/openclaw/state/plugin-skills/browser-automation` and
`.../canvas` are committed as mode `120000` symlinks pointing at
`/opt/homebrew/lib/node_modules/openclaw/dist/extensions/...`.

They are **incidental captured install state, not evidence** — the targets are outside the repo,
so on any other machine (or after an OpenClaw upgrade or uninstall on this one) they are broken
links. They carry no readable content for a future reader and they are the only two payload
members the credential scan could not read.

**Not blocking, and merged as-is deliberately:** they sit inside the slice's declared firewall
(`artifacts/gauntlet-heat3-20260824/**`), they are not run surface, and rewriting a runner's
evidence during a drain is the "stretch the vocabulary" failure. Faithfully landing what the
runner produced is the correct call; the judgement belongs on the record instead.

**Recommendation (cheap, no urgency):** a future heat's evidence step should record plugin-skill
provenance as a text line (`name → resolved target → version`) rather than committing the link.
No corrective task authored — this is a one-line convention note for the next heat master, not
work worth a lane slot.

### F-2274-2 — heat5 was dispatched with its master uncommitted, and the runner consumed it before the commit (NON-BLOCKING, already cured this fire)

The concurrent attended session authored `tasks/gauntlet-heat5-best-effort.md`, its `goals.json`
leaf and its BACKLOG row, dispatched it to `tasks/queue/lane-c/`, and **the runner picked it up
into `tasks/running/lane-c--20260824-173605-…` while all three were still uncommitted on disk.**

This is the §2E dispatch-order law exactly (F-1424-3: *commit the master and its evidence FIRST,
refresh the lane SECOND, `cp` THIRD*). The order matters for two reasons that both applied here:
a live run was executing against a master that existed only as untracked disk (a disk loss would
have taken the master with the run still going), and the run's provenance was unanchored to any
commit.

**Cured in this fire, before the drain:** s2274 committed all three path-scoped at `2df85f734`
(fire.md §2A — "uncommitted bookkeeping … commit them first"), so the live lane-c run is now
anchored to a committed master. Recorded rather than merely fixed because the ordering is a law
with a named finding behind it, and this is its second observed instance.

## Chain state — what this merge unblocks

This drain is the head of a three-deep blocked chain, which is why it mattered more than its own
20-file diff suggests:

| task | run | outcome |
| --- | --- | --- |
| `gauntlet-heat3b-full-field` | `20260824-163258` | **REAL — drained here** |
| `gauntlet-heat3c-shim-streaming` | `20260824-170500` | **STOP, zero edits, 42,925 tokens** — "heat-3b undrained. `lane/b` still has commit `c713cf7f7` ahead of `main`… Per the task's LANE-SAFETY guard, I stopped without edits." |
| `gauntlet-heat4-streaming-field` | `20260824-170644` | **STOP, zero edits, 41,684 tokens** — "streaming shim not landed. Live `main` probe returned HTTP 400 JSON: `Streaming is not supported`" |

Both STOPs are **firewall successes, not failures** — each runner correctly refused to reset a
lane holding undrained predecessor output, and refused to ride against an unlanded gate. Neither
is a drain; both are zero-diff, and their done-moves are renamed `stopped-` accordingly rather
than `drained-`.

**With `c713cf7f7` merged, heat3c's stated blocker is gone** and it is re-queueable as-is
(its own pre-flight now finds `main..lane/b` empty — verified: `lane/b` reads `ahead=0` after
this merge). heat4 stays blocked until heat3c lands the streaming shim; re-queueing it before
that only reproduces its STOP.

**Cost of leaving the chain blocked: 84,609 tokens already spent on two zero-diff STOPs**, and
every further cycle would have spent more on the same two refusals.
