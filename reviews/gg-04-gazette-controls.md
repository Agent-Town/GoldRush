# GG-04 — the Gazette learns which finger does what

**Slice:** `lane-gazette-controls` (GG-04) · **branch:** `lane/e2-arsenal` · **lane tip:** `a9d02d78`
**Base:** `f82c7156` · **Merged to main:** `4adf4341a8242203e5c529479d71623f702a4faf` (s1427)
**Gated in:** detached worktree `gate-s1427` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGED

---

## What it does

The owner watched a playtest on 2026-08-03 and said the first issue teaches concepts but never
controls — verbatim: *"the use of the grenade with the Q button, the B button to build buildings -
the players have to understand which buttons to press to do what."*

This slice adds a seventh full-width Gazette panel, **THE PROSPECTOR'S HANDS**, and gives THE ARMS
and THE WORKS one inline control sentence each. All of it is **input-aware**: desktop sessions
render the keyboard set, touch sessions render the HUD button names, selected by
`prefersTouchControls()` (`(pointer: coarse), (max-width: 760px)`).

The substantive engineering is scope 2, the drift-proof law. `HERO_INPUT_BINDINGS` in
`src/core/InputController.ts` becomes the single source of truth: it gains `buildSlots` and
`restart` entries, and `InputController.update()` stops comparing hardcoded key literals
(`this.keys.has('KeyU')`, `down('Digit1') || down('Numpad1') ? 0 : …`) and reads the table instead.
`src/news/greenhornGazette.ts` derives every key name in the copy from that same table. Controls
copy is now structurally unable to lie about a rebound key.

**Copy shipped, verbatim.** Desktop: *"Move with WASD or the arrow keys; aim and pan with the
mouse. / Q hurls the Blast Charge. B opens Build; 1–6 choose works, R rotates, and Space or Enter
places. / U takes an upgrade. P pauses, M mutes, and Escape backs out."* Touch: *"Move with the
Touch Stick; drag the view to aim and pan. / Weapon Toggle hurls the Blast Charge. Build opens the
works; choose one, then Confirm places it. / Rotate turns a work before placing it; Catch Your
Breath pauses the claim."*

Canon holds: the copy says **Blast Charge** throughout, never "grenade" (ADR-001).

---

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green**, built in 1.12s |
| `e2e/gazette-first-issue.spec.ts` | **6/6** — 3 tests × desktop-chrome + mobile-chrome |
| Derivation guard, **manufactured red** | **2 failed** (see below) |
| `e2e/gazette-welcome.spec.ts` + `e2e/gz-02-news-page.spec.ts` | **green** |
| `npm run test:release` (28 tests) | **28/28 passed** (2.5m) |
| Console / page errors | **zero**, asserted in-spec both projects |
| Screenshots | `artifacts/gg-04-gazette-controls/` — 7 files, desktop 1280×800 + mobile 390px |

All Playwright run with `--workers=1` (§3.1).

### The derivation guard is non-vacuous — proved by breaking it, not by its green

`gazette-first-issue.spec.ts:127` mutates `HERO_INPUT_BINDINGS.weaponToggle[0]` to `KeyV` and
`build[0]` to `KeyN`, then asserts the copy follows and contains no stray `Q` or `B`. A green there
is not evidence about the red (s1299/s1300 standard), so I manufactured one: hardcoding the arms
sentence to `"Press Q to hurl the Blast Charge"` in `greenhornGazette.ts` produced

```
Error: expect(received).not.toMatch(expected)
Expected pattern: not /\bQ\b|\bB\b/
Received string: "…Press Q to hurl the Blast Charge; aim with the mouse. …V hurls the Blast Charge…"
  2 failed  [desktop-chrome] + [mobile-chrome] › :127 › control copy follows renamed source bindings
```

Probe reverted; `greenhornGazette.ts` restored byte-identical before the merge.

### The InputController refactor is behaviour-preserving — checked key by key, not assumed

The master's firewall says *"NO: actual bindings/behavior changes"*, and the diff rewrites eight
`previous*` latch assignments from key literals to table lookups. That is only mechanical if every
rebound action is single-code. It is: `upgrade: ['KeyU']`, `build: ['KeyB']`, `mute: ['KeyM']`,
`debugXp: ['KeyX']`, `debugPlant: ['KeyG']` — all one code, so `keys.has('KeyU')` and
`upgrade.some(c => keys.has(c))` are identical. `rotateBuild` and `weaponToggle` already listed both
their codes in the old literal form. `buildSlots.findIndex(anyDown)` preserves the old
Digit1→Digit6 priority order exactly. **No behaviour changed; the firewall holds.**

### Reds, attributed

Two reds appeared in the adjacent batch. Neither is this merge's.

- **`ss-03-beats.spec.ts:52` (both projects) — PRE-EXISTING.** Fingerprint matches
  `logs/suite-red-inventory.md:217-218` (deep-equality at `:53`, `BOTH`). Confirmed by a **control
  run on clean main** (`9a9164f5`): 2 failed, same two tests. ⚠️ Note for future readers: the
  `1/6 (16.7%)` beside this test in the *Masking candidates* table at `:376` is a
  **failing-line / body-lines ratio, not a pass rate**.
- **`tp02-green-waypoint.spec.ts:162` (mobile) — NEIGHBOUR LOAD, not the merge.** It failed once
  inside a 4-file invocation, then passed **6/6 alone on the merged tree** and **6/6 alone on clean
  main**. Recorded as F-1427-3.

---

## Merge classification

Base `f82c7156`; `git log f82c7156..main` over the five source paths is **empty** — main never
touched them. All five are **LANE-TOUCHED-only**, no conflicts, `ort` clean:

`e2e/gazette-first-issue.spec.ts` · `src/core/InputController.ts` · `src/news/greenhornGazette.ts`
(new) · `src/news/heraldReader.css` · `src/news/heraldReader.ts` · plus 7 screenshot artifacts.

The two-dot diff's deletion entries are **stale-base phantoms** — the lane sits 10 behind main and
those paths are s1425/s1426 work the lane never saw, not deletions.

---

## Findings

**F-1427-1 — no goal leaf existed for this master (bookkeeping).** `drain-block-check.mjs` returned
`UNKNOWN — no goal leaf matches`, which is *not* a clearance. This master was attended-authored in
`433c59c7` without registering its leaf, contrary to the Goal Registration Law. **Fixed in this
drain's bookkeeping commit** — leaf added as `merged` with the merge hash. Non-blocking.

**F-1427-2 — the drift-proof law covers keys, but three touch labels are still hardcoded
(non-blocking, real).** Scope 2 forbids "a hardcoded second list". Derivation is genuine for every
action carrying a `Touch*` code — but `build: ['KeyB']` carries none, so `controlLabels()`'s touch
branch returns the literal `build: 'Build'`, and the copy also hardcodes `'Touch Stick'` and
`'Catch Your Breath'`. **All three are correct today — verified, not assumed:**
`src/ui/BuildButton.ts:63` renders `'Build'` and `src/ui/Hud.ts:195` renders `"catch your breath"`.
So this is a *drift risk, not a lie*: rename the HUD Build button and the Gazette will keep the old
name with nothing to catch it, which is precisely the failure mode scope 2 exists to close — just
on the touch side, where the bindings table has no vocabulary to express a button. The honest cure
is to give the table touch codes for those actions (or a parallel touch-label table the HUD also
consumes), not to widen the copy. Laddered, not blocking: the panel is correct as shipped.

**F-1427-3 — a spec went red in a 4-file batch and green alone on both trees (non-blocking,
instrument).** §3.1 settled *worker count*; this is *batch size*, which it does not address.

⚠️ **I nearly filed this with an uncontrolled confound, and the check is the point.** The s1138
lesson on this class says isolation moves *two* variables at once: your own worker count says
nothing about a **lane runner** on the same box. So I went back and timed the arms against the run
logs rather than assuming:

| Arm | When | `lane-a` (finished **09:51:08**) | `lane-d` (finished **10:10:13**) |
|---|---|---|---|
| 4-file batch — **RED** | ~09:56–10:00 | done | **LIVE** |
| tp02 alone, clean main — green 6/6 | 10:01:28 | done | **LIVE** |
| tp02 alone, merged tree — green 6/6 | 10:03:00 | done | **LIVE** |

`lane-d` was live across **all three** arms, so the external contender is held roughly constant and
**batch size is the term that actually varied**. That is what makes this a finding rather than a
guess. Residual caveat, stated rather than buried: `lane-d`'s own load profile varies over its run,
so this is a controlled-enough comparison, not a matched-pair measurement.

The practical rule for gates: attribute a red only after the spec runs alone, never let a batch red
stand as a merge verdict without a control — **and record what else was running when you took it.**

---

## Owed / laddered

- **BACKLOG:** mint a bespoke `gazette-panel-prospectors-hands` engraving — panel 7 currently reuses
  the THE ARMS plate (placeholder-first, per scope 4). Registered this drain.
- **F-1427-2** cure, when someone next touches the bindings table.
