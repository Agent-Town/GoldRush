# Review: ss-05-e4-beats — the Motor Frontier chapter as data (lane-a, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `ss-05-e4-beats` · `lane/a` · commits `ff9ed4217` (slice) + `60510114d` (ledger row) over `fccd17254` · merge `373638978` (no-ff; the E6 merge repaired beats.ts by hand: both chapters had appended before the same trailing export and git aligned their identical structural lines as context — base + E4 block + E6 block + one trailing export).
**Verdict:** MERGED. E4 joins E1–E3 as a chapter the human path can play (L4): 14 beats loaded when the active epoch is `epoch-4-motor`, every beat citing `lore/STORYBOOK.md` (lines 191–235), tavern tales and Gazette headlines in the E2/E3 single-table shape, mystery and LEXICON laws held, no new speakers (the chapter's mechanic, wildcatter and road boss have no portraits and are voiced by registered speakers, as `ss-04` did for the twins), `artKey` only on the five beats whose plates exist on disk.

## Evidence
| Gate | Result |
|---|---|
| `e2e/ss-05-e4-beats.spec.ts` (runner, own port 5301; plain boot, no `?debug`) | 10/10 desktop + 390px, zero console/page errors; negative arms prove Frontier and Voltage cannot load Motor beats |
| Adjacent `ss-01`..`ss-04` + `story-loop` | 32 passed / 6 failed — the same six (`ss-01:103`, `ss-03:52`, `story-loop:185`, both projects) reproduce on a control with the two src files reverted to main → pre-existing, recorded as F-2460-2 |
| tsc / build / no-emdash guards | 0 / green / 1/1 + 8/8 |
| Attended on the merged tree | see the drain commit message (tsc, era pin, build, spec + adjacent, node-guards) |
Screenshots: `reviews/shots-ss-05-e4-beats/{desktop,mobile}-chrome-{arrival,first-flivver,dust-flats-ride,land-yacht-dread,freed-hands}.png` (scaled, 8.6 MB total).

## Findings
- **F-SS05-1 (real story bug, fire-authorable / tonight):** four declared story signals — `science-threshold` (`src/story/signals.ts:8`), `wave-complete` (`:6`), `rung-promotion` (`:13`), `first-boot` (`:2`) — have no emitter anywhere in `src/` outside the story module; six shipped E1 beats depend on them (`beats.ts:69` first-wave-five, `:108`/`:117` the two deputy promotions, `:126`/`:135`/`:144` science-first-pick, science-mastery, baron-shadow) and can never fire in play — only `e2e/ss-02-beats.spec.ts` (its synthetic-signal helper near line 149, outside any test body) emits them synthetically. The E4 dust-chart beat rides `run-return-town` instead, with the reason in a source comment. Verified attended (see the drain commit message for the emitter census).
- **F-SS05-2 (method):** `npm run test:node-guards` redirected to a file produced an unreliable capture (concurrent children clobbered the log); the runner ran the named guards individually and left the full battery to the drain.
- **Housekeeping:** the runner's adjacent runs left 407 MB of gitignored `test-results/` traces in the lane worktree; disk only.
