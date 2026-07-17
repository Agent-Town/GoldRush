# Task lane-c-press-edit-visibility: the editor must SHOW what it edits (P1 — owner playtest) (LANE-C, commit prefix "fix(press):")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; artifacts/cp00-editor-harvest/report.md (§L2 gap map — items 2 and 3 are this task's map; the ED-02 blocker's "current truth" section); src/editor/TerrainBrush.ts (what raise/pond WRITE); src/world/Terrain.ts (the render-side delta consumer — where visual deltas are sampled); src/charter/** (compile path — verify deltas + waterSources survive compileCharter); src/editor/PressPanel or equivalent (the ?editor UI you will make honest).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/e2-arsenal main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.

## Why (OWNER PLAYTEST 2026-07-17, verbatim: "I used Raise twice - the map did not change even after it reloaded. I placed a Spring Pond, but I could not see it.")
ATTENDED-DIAGNOSED: raise writes valid visual-deltas but the editor view never re-renders from edited data (consumer samples at tile build); un-stamped edits are lost on reload with no UI statement; the spring pond writes legal waterSources data that has NO render consumer anywhere (cp00 gap item 2, verbatim: "no canonical descriptor fields or render consumers exist"). The engine is sound; the mirror is missing. A tool that edits invisibly is indistinguishable from a broken tool.

## Scope
1. **THE TRUTH TABLE first** (in your report): for every editor control (raise/lower/smooth, zone, water/pond, lane, gizmos): writes-to → rendered-by (consumer or NONE) → persisted-when. Fix from evidence, not assumption.
2. **LIVE PREVIEW:** brush strokes and pond placements visibly update the editor's ground view within the gesture — wire the existing render-side delta consumer (Terrain visual sampling) into an editor refresh; for the POND, implement the minimal canonical render consumer (a water disc/ring decal on the ground at the pond's position+radius, house render patterns, render-only — sim/mask untouched; this closes gap item 2 for the ONE water kind that exists).
3. **LAUNCH TRUTH:** a stamped charter's raises and ponds render in the LAUNCHED run (verify compileCharter carries both channels — the round-trip law says it must; wire the tile-build consumers if absent).
4. **THE HONESTY LAW (UI):** (a) a DIRTY indicator + "Stamp to keep — un-stamped edits are lost on reload" hint whenever edits exist; (b) any control whose channel lacks a live-preview consumer is TAGGED on the control ("renders at launch") — never silent; if any channel still has NO consumer at all after this task, its control is DISABLED with the tag ("not yet rendered — coming with <named slice>").
5. **Spec e2e/press-edit-visibility.spec.ts** (GATE-AUTHORSHIP — the owner's exact flow, both projects): (a) raise ×2 in the editor → ground sampler/screenshot-region CHANGES in preview; (b) pond placed → visible in preview AND in the launched stamped charter; (c) reload without stamping → edits gone AND the pre-reload UI showed the dirty hint (assert the hint's presence while dirty); (d) plain boot byte-identical (inert law); cp01-04 specs unmodified-green.

## Firewall
Touch ONLY: src/editor/**, src/charter compile wiring for the two channels if gaps found, the minimal pond render consumer (one new render-side module or the tile ground layer's decal path), the new spec. NO sim semantics (TileHeight.simHeight stays untouched — the cp00 boundary law), NO mask-truth changes, NO existing spec edits.

## Self-check (evidence, not vibes)
tsc + build green. New spec green both projects; cp01-04 + task-025 unmodified-green both projects. Zero console errors. Screenshots: reviews/shots-press-visibility/{raise-before-after.png, pond-preview.png, pond-in-run.png, dirty-hint.png}.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the truth table + which gaps were wired vs tagged-disabled.
