# gauntlet-heat3c-shim-streaming — drain review (s2275)

**Slice:** `gauntlet-heat3c-shim-streaming`
**Branch:** `lane/b` · **Lane tip:** `b24861b5f` · **Merge base:** `693747c95`
**Merged to main at:** `2e75540c1`
**Gated in:** detached `gate-s2275/` on the MERGED tree (§3.0b), worktree removed after.

## VERDICT: MERGE — the one wall four riders died on is gone, proven by a before/after control that spends zero owner allowance.

## What it does

The localhost Codex subscription shim now answers `"stream": true` with standard OpenAI-shape
Server-Sent Events instead of refusing with HTTP 400. A streaming request receives four `data:`
frames — an assistant-role chunk, a content-or-tool-call chunk, a finish chunk carrying `usage`,
then `[DONE]` — over `text/event-stream`. Client disconnect now propagates: an `AbortController`
is wired to the request's `aborted` and the response's `close` events and its signal is handed to
`execFile`, so aborting the HTTP request terminates the in-flight `codex exec` child rather than
orphaning it. `docs/ops/codex-shim.md` gains a **Streaming fidelity** section stating the caveat
plainly: this is *protocol*-compatible buffered streaming — the shim waits for `codex exec --json`
to finish and then emits the chunks — **not** token-by-token latency.

This is the cure that heat3b identified. That heat put Prime Agent 0.8.0, OMP 18.0.4,
Hermes 0.20.0 and OpenClaw 2026.7.1-2 against the shim, and **all four DNF'd on the same wall:
`400 Streaming is not supported`.** One cure, four riders.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, 5.6 s |
| `npm run build` (merged tree) | **rc=0**, 17.3 s; asset-diet ceiling respected (Herald dev-path art 1,158,214 B against a 1,500,000 B ceiling) |
| `npm run test:codex-shim` (merged tree, `CODEX_HOME` pinned at an empty dir) | **7 tests · 4 pass · 0 fail · 3 skipped**, 233.9 ms |
| — pure arm: `streaming completion emits role, content, finish usage, and DONE` | ✔ 18.95 ms |
| — pure arm: `client abort terminates the codex child process` | ✔ 148.17 ms (`pgrep` before/after: zero orphans) |
| — security arm: `browser-origin requests cannot spend subscription quota` | ✔ 1.13 ms |
| — 3 live arms | **skipped LOUDLY** — `# Codex subscription auth is absent` |
| Wall control, ARM A (merged tree, fake `completeFn`) | **HTTP 200**, `text/event-stream; charset=utf-8`, **4 SSE data lines**, terminator `data: [DONE]` |
| Wall control, ARM B (main pre-merge, same probe) | **HTTP 400**, `{"message":"Streaming is not supported","type":"unsupported_value"}`, 0 SSE lines |
| Lane absorption | `git log main..lane/b` **empty**; `main:serve.mjs` == `lane/b:serve.mjs` |

**Live-arm evidence is INHERITED, and here is why that is a fact rather than an assumption.**
The merged tree's `serve.mjs`, `serve.test.mjs`, `codex-shim.md` and `package.json` blobs are
**byte-identical** to the lane tree the runner gated (`cb664484f5`, `0c045fb0fa`, `f5ec712e65`,
`282a086ae5` — checked all four). The runner's live measurement therefore describes exactly this
code: **3 chunks, usage 16,741 prompt + 8 completion = 16,749 tokens, 11.903 s streaming vs
10.515 s non-streaming**, plus an abort arm proving zero orphan processes. Its headline was 20/20
after a second-opinion review found and fixed an early-disconnect race (the `if (response.destroyed) return;`
guard in the `catch`).

**I deliberately did NOT re-run the live arms.** They spend Robin's Codex subscription allowance
(~16.7k prompt tokens per round trip), `lane-c` was concurrently BUSY on heat5 against the same
subscription, and **F-2272-1 — a live item on the owner's desk — is precisely the question of what
that cost should buy.** Re-spending it to re-measure byte-identical code would have pre-empted the
owner's own open decision. §3's "the drain's own re-run is a free control" is scoped to *free*.

**Instead the drain built a control that costs nothing and tests the thing that actually matters.**
Both probe arms use a fake `completeFn`, so no Codex process is ever launched. ARM A is the merged
tree; ARM B is the identical probe with its import repointed at `main:server/codex-shim/serve.mjs`
pre-merge. **The control asserts its own validity (F-2215-1): ARM B still produces the wall**, so the
probe genuinely discriminates and ARM A's green is not the silence of a probe that failed to run.
Raw wire bytes for both arms, and the probe source, are banked at
`artifacts/gauntlet-heat3c-20260824/wall-probe-before-after.md`.

## Merge classification

Base `693747c95`. Main moved **only `STATUS.md`** (the s2274 handoff and my own s2275 lock commit);
the lane touched four files, none of them `STATUS.md`.

| File | Class |
|---|---|
| `docs/ops/codex-shim.md` | LANE-TOUCHED |
| `server/codex-shim/serve.mjs` | LANE-TOUCHED |
| `server/codex-shim/serve.test.mjs` | LANE-TOUCHED (purely additive: +84 / −0) |
| `tasks/BACKLOG.md` | LANE-TOUCHED (top row rewritten in place: RE-QUEUED → COMPLETE) |
| `STATUS.md` | MAIN-MOVED-ONLY |

**Zero BOTH-MOVED, zero conflicts, no 3-way resolution required** — the `ort` merge was structurally
trivial and I verified absorption by blob identity rather than by the merge's own exit code.

## Scope of the battery, stated as a structural fact and not as a waiver

The diff touches `docs/`, `server/codex-shim/` and `tasks/BACKLOG.md`. It contains **no `src/`,
`e2e/`, `scripts/` or `package.json` path**, so:

- no playwright spec exercises any changed line, and no boot probe is in scope — nothing
  player-visible moved, so there is no "where does the PLAYER see this" answer to give (Mistake #10
  does not apply to a bench-side developer bridge);
- `test:node-guards` is **not** mandated: the F-1460-1 path rule keys on `src/sim/`, `src/systems/`
  and `src/entities/`, and none of the four files is under any of them. Nothing in this diff can move
  a number the sim replays.

`test:ledger-guards` runs as the last act of this fire, **after** the bookkeeping commit, per s1301.

## Findings

### F-2275-1 — the SAFE-DUPE pre-flight's `git clean -fd` destroyed untracked material, and the RETENTION LAW has no mirror step in front of it *(non-blocking; convention note, no corrective task)*

The runner reported it in its own words, unprompted: *"The mandated `git clean` removed untracked
heat runtime/cache directories, which Git cannot recover."* **Reporting it rather than hiding it is a
firewall success** and is the only reason this finding exists at all.

The master's pre-flight (line 6) prescribes the standard SAFE-DUPE arm —
`git checkout -B lane/b main && git clean -fd` — which is the recipe used across the whole factory.
But `clean -fd` removes **any** untracked file, and `CLAUDE.md` §4.10b's Retention Law requires that
factory artifacts be *mirrored into git before any hygiene pass*. The lane pre-flight is a hygiene
pass with no mirror step in front of it. The law's existing carve-out covers `.git/*.stale*` and
`tmp_obj_*` as *"git's own scratch, not factory history"*; a lane worktree's untracked heat runtime
state is neither of those, and it is exactly the class of material the ART-SLOT clause treats as
at-risk.

**Priced honestly rather than inflated: nothing cited was lost.** heat3b's payload is intact — all
**19** files under `artifacts/gauntlet-heat3-20260824/` are tracked on main, merged at `407f89f42`.
What died was un-mirrored runtime/cache state from the heat harnesses. **What it was, and whether any
of it was worth keeping, is UNMEASURED and now unmeasurable** — which is the finding: the loss is
silent and unbounded by construction, and this is the first run to report one out loud.

**No corrective task and no guard is proposed, deliberately.** "Runtime cache vs evidence" is a
judgement, so a guard on it would fire on every ordinary lane refresh and be excused into uselessness
inside a week (F-1460-1, the `cross-engine` fate). The right shape is a **convention line in the next
heat master**: have the heat write its runtime state under a path the master declares, and commit or
explicitly disclaim it before any pre-flight reset. That pairs naturally with F-2274-1's
recommendation (record plugin-skill provenance as text rather than committing dangling symlinks) —
**both are one line in the next heat master, not a lane slot.**

### F-2275-2 — abort listeners are not removed on the early-error paths *(non-blocking, cosmetic, no action)*

`request.once('aborted', abort)` and `response.once('close', abort)` are registered before
`readJson`, but removed only in the `finally` around the completion call. A request that fails
earlier — malformed JSON, unknown model, or the 429 concurrency refusal — never reaches that
`finally`, so the `close` listener survives until the response object is collected. It then aborts a
controller no longer awaited by anything. **Harmless**: no leak of consequence, no orphan process, no
wrong answer. Recorded for completeness because I read the path, not because it needs a fix.

## What this unblocks

**heat4 (`gauntlet-heat4-streaming-field`) is now unblocked.** It STOPPED at s2274 with zero edits
and 41,684 tokens for exactly one reason, in its own words: *"streaming shim not landed. Live `main`
probe returned HTTP 400 JSON: `Streaming is not supported`."* **That premise is now measurably
false on main** — ARM A above returns HTTP 200 and SSE from the merged tree, and the merge has
landed. Re-queueing heat4 is therefore a **CHANGED-PREMISE** retry under §7.5, not the forbidden
identical one.
