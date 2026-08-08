# Review — f1552-1: the instrument declares itself

**Slice/branch/tip:** f1552-1 (`tasks/lane-f1552-1-wrangler-version-assertion.md`, FIRE-AUTHORED s1552) · `lane/c` · tip `dda33a0b5` · merged `18847e938ef8731460feee354901743b05748956` · drained s1554 fire, 2026-08-08 ~13:20.

**Verdict: MERGED.**

**What it does:** Four gate scripts stood up real Cloudflare processes by calling `spawn('wrangler', …)` with a bare command name — PATH resolution against a binary that appears in neither `dependencies` nor `devDependencies`. A gate that depends on an unversioned external binary can go red with an empty repo diff, which is the shape F-MP503-1 wore for a morning. The cure is an assertion, not a pin: new `scripts/wrangler-binary.mjs` exports `EXPECTED_WRANGLER_VERSION = '4.107.0'`, `resolveWranglerPath()` and `assertWranglerVersion(label, readVersion?)`, wired once into `test-multiplayer.mjs`, `test-stats.mjs`, `test-accounts.mjs` and `agent-seat-room.mjs`. Host drift becomes a named, immediate failure naming the gate, both versions, the resolved path and the remedy. `GR_WRANGLER_ANY=1` is an explicit, loud, per-run escape that cannot fire silently.

Why an assertion beat the obvious pin is recorded upstream and was not re-litigated here: a devDependency binds only npm entry points, because `node_modules/.bin` reaches PATH only when npm puts it there — and `agent-seat-room.mjs` has no npm script entry (it runs as plain `node`). The assertion reaches all four identically at zero bytes per worktree. The `4.108.0`+ pin remains a measured, unblocked option (F-1552-1), not a dead end.

**Custody note (F-1295-1):** every gate below ran in a **detached worktree** (`gate-s1554`), never in main's working tree. This was not ceremony — an attended session was committing to main throughout this drain, landing `d5b3f768f` on top of this fire's own lock commit within two minutes of it. Undecided content was never placed where a broad `git add` could sweep it.

**Evidence** (all on the MERGED tree unless stated):

| gate | result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green — 2,184 modules, built 1.49 s, asset-diet passed |
| `scripts/wrangler-version-assert.test.mjs`, run ALONE | **4/4** — positive, violation, missing, escape |
| `gate-caller-audit` + `law-pointer-guard` + `citation-title-guard`, run ALONE | **48/48**, incl. gate-caller-audit's POSITIVE CONTROL (the new npm-rooted guard is correctly rooted) and law-pointer-guard's THE REAL TREE sweep |
| `node scripts/test-accounts.mjs` | **43/43** |
| `node scripts/test-stats.mjs` | **87/87** |
| `node --check` × 5 touched scripts | all parse |
| real-binary arm, **fire shell** | PASS — found `4.107.0` at `/opt/homebrew/bin/wrangler` |
| drift arm, real path resolution | throws: `test:mp: found Wrangler 9.9.9; expected 4.107.0; resolved path /opt/homebrew/bin/wrangler. Install Wrangler 4.107.0 on PATH or set GR_WRANGLER_ANY=1 for an explicit one-run override.` |

`test-accounts` and `test-stats` are the two consumers **F-1552-4** found that no prior author had ever named; both were re-measured here on the merged tree and both match the lane run exactly (43, 87). The manufactured defect — not a green — is the deliverable, and both the unit violation arm and the live drift arm executed the throw path.

**Verified by reading, not by report:**
- All four call sites are the **first statement of an unconditionally-awaited `main()`** (`test-stats.mjs:19`, `test-accounts.mjs:17`, `agent-seat-room.mjs:68`, `test-multiplayer.mjs:38`), i.e. strictly before that script's first `spawn('wrangler'` (`:198`, `:206`, `:733` respectively). Wiring fewer than four, or wiring after the spawn, were the master's named forbidden greens; neither happened.
- `test-multiplayer.mjs` **reused** its existing version probe rather than adding a second spawn: `getWranglerVersion()` is deleted (−10 lines) and its single call site replaced. No double-spawn.
- The `wranglerVersion` field recorded in `artifacts/multiplayer-relay/test-multiplayer.json` is **unchanged in format** — `wrangler --version` on this host emits a bare `4.107.0`, so the switch from raw-output to parsed-version does not move a broadcast value. Single consumer, checked repo-wide.
- `package.json` dependencies and `package-lock.json` untouched, as the firewall required.

**Merge classification:** base `1626b53b5`. All 8 paths **LANE-TOUCHED**; main moved only `scripts/desk-birth-guard*`, `scripts/gr-sim.test.mjs`, `scripts/tmp-s1553-*` in the same window — **zero overlap**, confirmed by diffing base→main over the slice's path set. Merge clean by `ort`, no conflicts, no 3-way graft needed.

**Declared gap — read this rather than assume a full green:** the complete 77-file `test:node-guards` battery did **not** complete fire-side. Inherited from the lane run (11:59): 385/387, the two standing F-1507-1 Node-version reds (fire node v23.11.1 vs `.nvmrc` v26.4.0); the attended f-door-5 drain independently recorded the same class at 387/385/2 on v26.4.0. The slice-relevant members of that battery were extracted and run alone instead (48/48 above), which is the subset this slice can actually tax.

## Findings

**F-1554-1 — `test:node-guards` cannot be "run ALONE" on a busy board, and nothing tells you it isn't.** F-1537-1 orders the 181 s battery run alone because overlapping runs contaminate each other on shared fixtures. Measured this fire: **three concurrent `run-node-guards` processes** (pids 34453/69380/94888), only one of them this fire's; when two later exited, a **fresh pair appeared** (81257/81262). The fire's own run was starved past **35 minutes** without completing and was still alive at handoff. The other batteries belong to the lane-b Codex runner and the attended session — neither of which the fire can see, schedule against, or wait on.
The important half: **contention manufactures reds, not greens**, so a contended green is sound and a contended red is worthless — but a fire that simply obeys "run it alone" has no way to know which it is holding, and no way to comply. Cheap cure, not authored here: have the drain (or `run-node-guards` itself) `pgrep -f run-node-guards` before starting and either wait or print a one-line CONTENDED warning that downgrades any red to unattributable. Non-blocking for this slice — the affected classes were run alone and are green.

**F-1554-2 — the f-door-5 gate transcript was untracked, and its own review cited it.** `artifacts/f-door-5-gate.txt` (394 KB / 3560 lines), the evidence for the morning's most player-visible merge, sat in no object database while `reviews/f-door-5-harvest-walks.md` cited it by path. Same class as the mp-07c-2 transcript that `c2aa36222` tracked hours earlier, which makes it a recurring drain-side duty rather than one lapse. Closed in this fire at `701fc221d`. Non-blocking.

**No blocking findings.** Nothing here spawns a corrective task.
