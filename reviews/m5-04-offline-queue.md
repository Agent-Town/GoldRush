# Review — M5-04 offline crafting queue bridge (lane-b)

**Verdict: GREEN — integrated to main (s50 fire).** Scope exactly per task + owner decision s9ag(1): offline queue, no runtime API, install()/no Game.ts.

## Diff inventory (worktree lane-b vs b231a85; main had ZERO divergence on the 3 shared files — clean overlay merge)
- NEW `src/crafting/CraftingQueueContract.ts` — types + canonical-id maker/sanitizer. Sanitize recomputes the id from (text, profile, timestamp) and requires equality → arbitrary filenames/path traversal are dead at the contract layer. Slug charset [a-z0-9_], profile/text length caps, version pinned 1.
- NEW `src/crafting/CraftingQueue.ts` — eager import.meta.glob over `assets/crafting-queue/{approved,rejected}/*.json`, full runtime validation; approval requires BOTH contractVerdict.ok AND simVerdict.ok (generator proposes, contract+sim dispose — brief §10 law upheld in data). Per-profile filtering. `postPendingOrder` falls back to "JSON ready" display when no middleware (prod build) — offline philosophy preserved.
- NEW `src/crafting/AssayBench.ts` — `AssayBench` (Map-keyed accepted log → idempotent ingest) + `AssayBenchPanel` DOM card. **`install()` is `?debug`-gated** (m4-01 `__GR_AGENT__` precedent) — bench invisible to normal players; player-facing activation belongs to a later M5 slice. Keydown/keyup stopPropagation isolates typing from game hotkeys (T/X live under ?debug — good catch). escapeAttr on profile echo. HMR dispose wired in main.ts.
- MOD `src/main.ts` (+3 lines) — install + dispose. No Game.ts, Economy, CombatSystem touch. Zero sim-code diff → full regression not triggered by the s9b rule.
- MOD `src/styles.css` (+90) — .assay-bench parchment/teal, additive only.
- MOD `vite.config.ts` (+75) — dev-only middleware `POST /__goldrush/crafting-queue/pending`: JSON-parse guard, contract sanitize, resolve+startsWith root guard (second belt), 4KB body cap, 405 on non-POST. `configureServer` = never in prod bundle.
- NEW `e2e/m5-04-offline-queue.spec.ts` (3 tests) — exact-shape disk assert w/ cleanup, deterministic `queueNow`, idempotence double-ingest probe, reason codes, zero-error gates.
- NEW fixtures `assets/crafting-queue/` — contract.v1.json (the durable artifact), worked pending/approved pair (Brass Pan Receipt), rejected example (`make a rifle with infinite range` → canon_banned_term; correct §9.2 usage — rifles are conventional firearms, not frontier-tech).
- Worktree tasks/* deletions = Mac-runner bookkeeping, EXCLUDED from the merge (main already current).

## Gates (merged tree /tmp/gr-s50 = main 26dfd35 + slice)
- tsc EXIT:0; vite build green (602ms).
- **Official spec in-VM: 3/3 failed — 100% `ERR_INSUFFICIENT_RESOURCES`, zero functional failures** (9/24/23 refusal lines, nothing else; both VM disks ≥98% full this fire). s26 refusal class, Mac authoritative per s46/s48/s49 precedent. Mac in-lane run: `worktrees/lane-b/test-results/.last-run.json` = passed (23:14L, s48 record).
- **Refusal-tolerant probe, same asserts, same tree, calm window: ALL GREEN with zero refusals AND zero other errors** — `reviews/shots-m5-04/verdicts-{a,post,mobile}.json` + `probe-m5-04.cjs`:
  - ab_off (no ?debug): bench ABSENT, boot clean → slice dormant in normal play (A/B leg: refusals, when they occur, hit main's own texture loads with slice inert).
  - approved profile: history exactly 1 = "Brass Pan Receipt (common)", reject pile 0.
  - rejected profile: 2 reasons, codes [canon_banned_term, power_budget], history 0.
  - post: disk file created at exact canonical path, disk === displayed JSON, exact shape {version:1, id, text, profile, timestamp} w/ deterministic stamp; cleaned up after.
  - mobile 390: bench visible, history 1.
- Shots: `shots-m5-04/` desktop approved/rejected/posted + 390. Parchment/teal on-brief (matches m3-06 picker palette).

## Findings (minors, carried — none blocking)
1. **F-m5-04-1**: bench (fixed, top-left, z-30) occludes hero-HP chip on desktop and most HUD chips at 390. Debug-only today; the player-facing activation slice MUST add collapse/toggle + safe-area layout.
2. Eager glob bundles every approved/rejected JSON into the main chunk — fine now, revisit when the pipeline starts producing volume (lazy glob or manifest).
3. `contract.v1.json` (assets/crafting-queue/) is the durable pipeline artifact — **crafting-fork note (Robin owes-7): lane-b's shape is now the INCUMBENT on main.** Lane-a's m5-01 `src/crafting` must reconcile to it (or Robin rules otherwise) at lane-a's drain.

## Follow-ups for the pipeline side (fires/Codex, M5-05+)
- Generator job: consume pending/ → emit approved|rejected with real m5-01 contract + m5-03 sim verdicts (fixtures model the format).
- Card-pool injection of approved items stays M5-05 per task fence.
