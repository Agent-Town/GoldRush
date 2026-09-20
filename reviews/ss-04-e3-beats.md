# ss-04-e3-beats — drain review (fire s2460, 2026-09-03)

**Slice:** `ss-04-e3-beats` (lane-c) · **branch:** `lane/c` · **tip:** `c762c6bd2` · **base:** `87fd9a3f`
**Gate worktree:** detached `gate-s2460` (§3.0b — undecided content never entered main's working tree)
**Gated tree:** `e0f92041e` (merge) + `250718b11` (engine pin) — the pin is inside the gated tree, so the evidence below covers exactly the tree that lands.

## VERDICT: MERGE

## What it does
The Voltage Age gets its chapter. `src/story/beats.ts` gains `E3_STORY_BEATS` — ten beats covering the Canyon Works arrival, the two company representatives (the twins), the Gazette's two-offers headline, the first night round, the brown-out ledger reveal, the Moth Season, the saboteur night, the twins' defection tavern tale, the ledger-reveal headline, and the Refinery exit hook. `src/story/StoryRuntime.ts` loads that table only when `activeEpochId() === 'epoch-3-voltage'`, so E1 and E2 rides are untouched. Every beat carries a `lore/STORYBOOK.md:NNN` citation comment in source, reuses the E2 trigger vocabulary, and sets `artKey` only for the two beats whose plates exist on disk. This is CAPABILITY-LADDER L4 (the human reference law: the story loop is never cut) — a player reaching the Canyon Works previously met no twins, no ledger reveal, no Gazette.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npm run build` | green, built in 2.23s; asset-diet herald 1,158,214 B under the 1,500,000 B ceiling |
| `e2e/ss-04-e3-beats.spec.ts` (own spec) | **8 passed / 0 failed** (1.5m), desktop-chrome + mobile-chrome 390px, `--workers=1` |
| — includes negative arms | `The Claim cannot load Voltage beats in Frontier` and `epoch-2-steamworks cannot load Voltage beats` both pass on both projects |
| Adjacent `ss-01` + `ss-02` + `ss-03` + `story-loop` | 24 passed / **6 failed** (8.3m) |
| **Control**: same four suites, slice src reverted to main | 16 passed / **the same 6 failed** (7.5m) → all pre-existing, none caused by this merge |
| `ss-02-beats` (the suite the master names) | fully green both projects |
| `no-emdash-guard` + `no-emdash-scan-space-guard` | 9/9 pass (1.1s) — the LEXICON/copy half of the master's self-check |
| `npm run test:node-guards` (merged tree) | 570 tests, **563 pass / 2 fail / 5 skipped**, 682.7s |
| — failure 1, `engine-era-guard` | the engine pin this drain owed (F-2460-1 below). After the pin: **5/5 green** |
| — failure 2, `fixture-teardown` | a *consequence* of failure 1 in that run (its child-status assert aborts the test). Re-run after the pin, 610.8s: still red, but now at a **different assertion** and for a **pre-existing, already-recorded** cause — see F-2460-3 |
| Console/page errors | zero in all 8 own-spec cases; harness reported `watchErrors suppressed 0 known GLTFLoader blob error(s)` |
| Screenshots | `reviews/shots-ss-04-e3-beats/` — 6 files, desktop + mobile × arrival / twins / canyon-ride |

**Player-visibility (Mistake #10):** the spec boots at `page.goto('/')` — a plain boot, no `?debug`. The epoch is selected through the same profile/`activeEpoch` localStorage keys a player's own town selection writes.

**Canon (ADR-001 / brief §9):** no firearms; frontier-tech only. Copy is LEXICON-clean and em-dash-free (guard-verified). Both `artKey`s name plates that exist: `assets/raw/plate-contract-e3-canyon-works.png` (3,485,651 B) and `assets/raw/plate-contract-e3-moth-season.png` (3,043,049 B). `StoryRuntime.ts:189` degrades to no art when `artKey` is absent, so the eight unkeyed beats are safe.

## Merge classification
Base `87fd9a3f`, 10 paths, classified by `lane-freeze-classify`:

- **LANE-ONLY (9)** — main never touched them, taken as-is: `e2e/ss-04-e3-beats.spec.ts` (new, +175), `src/story/beats.ts` (+107), `src/story/StoryRuntime.ts` (+9/-2), and the 6 screenshots under `reviews/shots-ss-04-e3-beats/`.
- **BOTH-MOVED (1)** — `tasks/BACKLOG.md`, the ordinary ledger-append conflict.

**Conflict resolution — kept both sides, with one deliberate drop.** Main had appended 28 rows since the lane branched; the lane appended 1 (the S6 E3 row). The apparent "shared tail" `F-PT16-1` row was **not** shared: main's copy is 3,058 chars and the lane's 1,244, identical for the first 434 chars and then divergent. Main's is the newer one and records the owner's same-day reversal (*"It is ok that the Prospector can do that - it just has to work for the human, too."* → NO era bump, boards stand), superseding the lane's stale `→ era 6 "the Same Laws"` phrasing. I took **main's** row and dropped the lane's copy: a lawful retirement, not a loss.

**Verified rather than asserted** — row-key union across all three trees: main 3,642 rows, lane 3,617, merged **3,643 = main + the lane's one new row**. **Zero main rows absent from the merge.** Three lane row-keys read absent (`F-2416-1`, `F-2416-2`, `F-2408-1`); each was checked by id and survives on the merged tree under a later superseding row, so all three are lawful retirements (the union-scores-retirements-as-loss trap).

## Findings

**F-2460-1 — the engine pin this drain owed, DISCHARGED in the gated tree (not a defect).**
`src/story/**` is inside `ENGINE_SOURCE_INPUTS`, so the slice rotated the engine identity to `10c1fa66d73ba5ab527adb0991aa625cb768e24d0c6b518944e975a418871594` and `engine-era-guard` reddened. **Cause counted, not assumed:** with the slice's two src files reverted to main the guard is **5/5 green**, so main was clean and this slice is the *only* cause — one pin blesses it. Appended a same-era pin (era 5 "the Replayed Board", pins 10 → 11) whose `cause` states the content re-hash and that no simulation behaviour changed. ⓘ **The append alone did not cure it:** the registry also carries a top-level `engineHash` that must equal the latest pin, and the guard caught my incomplete edit (failing in 2.7ms instead of 44ms — a *different, earlier* assertion). Both fields now updated; diff is 7 insertions / 1 deletion, no reformatting.

**F-2460-2 — THREE STORY SPECS ARE RED ON MAIN AND NOTHING RECORDS THEM (pre-existing, NON-BLOCKING for this merge).**
`ss-01-beats.spec.ts:103`, `ss-03-beats.spec.ts:52` and `story-loop.spec.ts:185` fail on **both** projects, on main, without this slice. Proven by the reverted-src control above, which reproduced the identical 6 failures. **The runner under-reported this**: its report named only story-loop's *"existing reload-helper failure"* and folded the rest into a broad *"unrelated linked-worktree, engine-pin, Node-version, fixture, and simulation checks"* — `ss-01` and `ss-03` are named nowhere. Causes, diagnosed rather than guessed:
- **`ss-03:52`** — the spec's hardcoded `AUTHORED_IDS` list has been outgrown by the ceremony beats. It receives 6 extra ids: `e2-ceremony-valley`, `e2-ceremony-title`, `e3-ceremony-dynamo`, `e3-ceremony-tree`, `e3-ceremony-title`, `e2-railcar-arrival`. **None is an E3 *story* beat from this slice** (mine are `e3-canyon-works-arrival`, `e3-twin-representatives`, …) — the `e3-ceremony-*` three are the pre-existing ones the master explicitly required to stay.
- **`ss-01:103`** — expects the `first-contract` beat card but the queue yields `ledger-page:town_elder`; a beat-precedence change from the ledger-page work, not a story-table change.
- **`story-loop:185`** — the reload-helper failure the runner named.

These are a real open defect on main (three red story specs) and are fire-authorable as a corrective; they do not block this merge, whose own suite is 8/8 and whose control proves it changes none of them.

**F-2460-3 — `fixture-teardown` is still red on the merged tree, and it is F-2459-3, fingerprint-matched with proof (pre-existing, NON-BLOCKING).**
After the F-2460-1 pin turned `engine-era-guard` green, I re-ran `fixture-teardown` alone (610.8s) rather than inferring it. It still reds — but at a **different assertion** (`:50`, the survivor check) than in the battery (`:40`, the child-status check), because a failing child aborts the test before it ever reaches the survivor sweep. **So the pin did not break it; the pin UNMASKED it.** The survivor report names `scripts/art-staging-gitdir-link-guard.test.mjs: 11 [art-gitdir-…]` — exactly F-2459-3, which s2459 proved pre-existing by running `fixture-teardown` on an unmerged main (`57890458f`, 681.5s, identical failure). Same file, same count of 11, same `art-gitdir-` prefix; the suffixes differ only because they are `mkdtemp` randoms. Nothing this slice touches goes near that guard.

**Net state of the mandated battery on the merged tree: one red, pre-existing and already recorded (F-2459-3); zero caused by this slice.**

⚠️ **One method note, paid for in this fire and worth carrying.** My first two attempts to re-verify `fixture-teardown` used `spawnSync` with a `timeout`, which **kills the child and discards its output**: the second returned `rc=1 wall=600.0s` with **17 bytes of output**. That is my own harness's timeout wearing a failing exit code, and reporting it as a red would have been a fabricated finding — the run proved nothing in either direction. Only re-running with `stdio` redirected to a file (so output survives the kill) produced the evidence above. **A bounded probe whose failure mode is an empty capture cannot be told from the failure it is measuring; redirect to a file before you believe an rc.**
