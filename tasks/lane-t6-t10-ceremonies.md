> ⛔ **SUPERSEDED BY ITS OWN CHILDREN — DO NOT QUEUE (Mistake #8 guard, verified s1131 2026-07-27).** This umbrella master has **no done-move of its own** — because it was executed as four separate rungs, and **all four shipped, each ✓ verified an ancestor of main:** T6 `de956491` · T7 `d976837f` · T8 `5012ad42` · T10 `be762583` (*"the Charter Press — saga finale door reachable in plain play"*, done-move `shipped-s958-t10-ceremony-be762583.md`); T9 shipped too (`tasks/done/shipped-s1063-lane-t9-ceremony-review-t9-ceremony.md`). Ceremony machinery on main: `src/ceremony/CeremonySystem.ts` + `src/ceremony/stages.ts`, `e2e/ceremony-framework.spec.ts`. **Queueing the umbrella would re-derive five shipped era doors.** See F-1131-6.

# DRAFT (UNQUEUED) — T6–T10: the five missing inter-era ceremonies (THE SAGA WALL)
> Authored by the saga-rehearsal session 2026-07-22 as a P0 corrective draft. NOT queued. Owner/attended must slice this — it is five ceremonies + five successor wirings, too large for one runner task; decompose per the numbered slices below. Prefix when queued: per-slice.

## ROLE / WORKDIR
Attended-authored spec-slices → lane runner per ceremony. Each slice is one ceremony end-to-end (door → hand → arm → persist).

## WHY (evidence, dated)
The saga-rehearsal (reviews/saga-rehearsal-2026-07-22.md, F-REH-01, ✓ VERIFIED in code and proven live at E6) found the ten-era saga arms only **E1→E6**. Entering E7 there is no door and no arming path:
- `src/ceremony/scripts.ts` `CEREMONY_SCRIPTS` stops at T5 (t3-the-refinery, t4-the-boat, t5-the-deep-reactor). No T6/T7/T8/T9/T10 scripts.
- `assets/contracts/epoch-{6,7,8,9}/manifest.json` all carry `successor: null`; `activateEpoch()` (src/meta/ContractFamilies.ts:948-960) refuses a null successor. The E7→E8 special-case (line 949) is never called by any town UI.
- The storybook designs all ten interstitials in buildable precision: lore/STORYBOOK.md §THE INTERSTITIALS (T6 THE CALCULATING HOUSE — mount the plate; T7 THE STARSHIP — the umbilical release + component contracts; T8 THE COLONY SEED — type the name THE RIVERWARD; T9 THE GENERATION ARK — carry the tree-seed up the ramp; T10 THE CHARTER PRESS — the child's hands on the lever). Each names its HAND, STAGE, SOUND, KEPT IMAGE.
- E7–E10 content (contracts, tiles, bosses, research trees, arsenals) already ships and passes e2e — reachable only via `?debug&era=N` (src/meta/DebugEraSeed.ts pinRuntimeEpoch). The transitions are the only missing layer.

## SCOPE (each item independently testable; slice one ceremony per runner task)
1. **T6 THE CALCULATING HOUSE (E6→E7).** Add ceremony script `t6-the-calculating-house` (epochId epoch-6-atomic, HAND = the held plate-mount input; KEPT IMAGE = plate above the door) OR a bespoke TownScene door mirroring the dynamo pattern. Wire `epoch-6-atomic` successor → `epoch-7-signal` (manifest + activateEpoch). Completion arms E7, persists ACTIVE_EPOCH + EPOCH_CEREMONY, refuses a second arm.
2. **T7 THE STARSHIP (E7→E8).** Ceremony `t7-the-starship` (HAND = umbilical release). Note the storybook's component-contract victory lap is a larger design question — MVP: the final release arms E8. Respect the existing `e7SignalExitBeatReady()` gate (ContractFamilies.ts:951) — the ceremony door should read `needs-…` until the exit beat fires, mirroring the T4 `needs-science` pattern.
3. **T8 THE COLONY SEED (E8→E9).** Ceremony `t8-the-colony-seed` (HAND = type the name; default THE RIVERWARD). Wire epoch-8 successor → epoch-9-redfields.
4. **T9 THE GENERATION ARK (E9→E10).** Ceremony `t9-the-generation-ark` (HAND = carry the tree-seed up the ramp). Wire epoch-9 successor → epoch-10-deepsky.
5. **T10 THE CHARTER PRESS.** Not an inter-era transition — the finale handing-on already has its own path (e10FinaleSystem → river lever, VERIFIED working in the rehearsal). Confirm the science-ceiling → Charter Press entry exists in normal play (the rehearsal reached it only via `?e10static`/`e10Finale.close()` debug). Slice: the real in-town trigger for the Press once E10 science completes.

## FIREWALL
TOUCH-ONLY (per slice): `src/ceremony/scripts.ts`, `src/ceremony/CeremonySystem.ts` (if framework), `src/town/TownScene.ts` (if bespoke), the single epoch's `manifest.json` (successor), and that ceremony's e2e spec. NO gameplay/combat/economy edits. NO touching a sibling era's manifest in the same commit.

## SELF-CHECK / GATES (per slice)
- New ceremony e2e (model on e2e/ceremony-framework.spec.ts): door derives correctly, HAND gates the arm (idle = no arm), completion arms the successor exactly once (second activateEpoch refused), kept image stored, ACTIVE_EPOCH + EPOCH_CEREMONY persist across reload, zero console/page errors.
- e2e/072-era-activation.spec.ts + ceremony-framework.spec.ts stay green (T1–T5 untouched).
- The saga-rehearsal's own driver (rehearsal/segments/*) can then traverse E6→E7→…→E10 on ONE profile with NO `&era=` — that is the acceptance proof this whole draft exists for.
- tsc clean, build green, both projects, desktop + 390px.

READY-FOR-GATES when queued per-slice + report: which era armed, kept-image stored, reload-persistence, and a one-profile E6→E7 traversal screenshot.
