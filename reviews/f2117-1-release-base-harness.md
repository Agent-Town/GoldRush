# f2117-1 — root `playwright.release-base.config.ts` behind `test:release-base`

**Slice:** `f2117-1-root-release-base-harness`
**Branch:** `lane/d` · **Tip:** `21ba3542c` · **Base:** `9a8a345b3`
**Merge:** `96e9236d433b163cb77db119da8d0bf3b8f82bc2` (main)
**Drained by:** s2161 fire, 2026-08-22 · **Run:** `20260822-055732-lane-d-f2117-1-root-release-base-harness.md.log`

## VERDICT: MERGED — every acceptance condition re-measured on the merged tree, not inherited

## What it does

`playwright.release-base.config.ts` tests that the release bundle boots correctly beneath the
`/goldrush/` sub-path — the configuration `scripts/deploy-alias.sh:14` actually ships to the live
`goldrush-base` alias. Until this slice, that config was named by **no npm script, no shell script
and no gate**: its spec is `testIgnore`d out of the default gate on the stated grounds that
"coverage moves to the owning config", and for this member the owning config had no runner. The
suite ran only if typed by hand, and nothing had ever typed it.

The slice does three things: moves the pinned port `5191 → 5295` (all three references) because an
18-day-old `vite preview` squats 5191 and answers `/goldrush/` with HTTP 200 — i.e. it looks
*healthy* to the config's own `url` probe, so with `reuseExistingServer: false` the suite could not
start at all; adds `"test:release-base"` to `package.json`; and records the new script in
`scripts/gate-caller-baseline.json` as a **grandfathered** subject rather than rooting it into a
pre-merge battery.

The grandfather — not a root — is the correct call and is deliberately left as an owner decision.
The config's `webServer` runs a full `npm run build:release` before a single assertion, so rooting
it would tax every src-touching drain permanently. That is gate policy, on the same precedent as
`npm:test:asset-diet` (52.3 s, desked) and `halo-reextraction-check` (+28%, desked).

## Evidence (measured on the merged tree in a detached worktree, §3.0b)

Gated in `worktrees/s2161-gate` (detached at main, `git merge --no-ff lane/d`), **never in main's
working tree** — a live attended session held main's tree throughout (see F-2161-3).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green — `✓ built in 2.43s`; asset-diet 84% GLB / 87% PNG cut |
| `npm run test:release-base --workers=1` | **2 passed (39.4 s)** — `desktop-chrome` + `mobile-chrome` |
| `claimed-spec-harness-guard` | **`WARN: 1 of 3`**, naming only `accounts-sync.spec.ts` (was **2 of 3**) |
| `gate-caller-audit` | **PASS** · `unrouted: 0` · `grandfathered: 25` (was 24) · roots 115, reached 185 |
| baseline integrity | 24 pre-existing entries **byte-unchanged**, proven by parse-compare (added 1, removed 0, changed 0) |
| port move | `5295` in all three places; the only `5191` left is the explanatory comment |

**The acceptance signal is the repo's own instrument, not the runner's prose.** The transition
`WARN: 2 of 3 → 1 of 3` is computed by `deriveHarnessMap()` inside
`scripts/claimed-spec-harness-guard.mjs`, a file the master firewalled the runner out of touching.
It flipped, and it names only the one remaining runnerless spec.

**The suite that had never once been run in this repo is green.** That is precisely what s2117 could
not prove and therefore correctly refused to wire — an npm alias whose suite reds is worse than none.

`test:node-guards` (404.7 s) is **not** in this battery and is not owed: the diff touches
`package.json`, one playwright config and one JSON baseline — no `src/sim/`, `src/systems/` or
`src/entities/`, which is the F-1460-1 trigger.

Boot-probe and desktop+mobile duties are discharged **by the acceptance suite itself**:
`release-base-path.spec.ts` asserts a clean boot with zero console/page errors, and it ran on
`desktop-chrome` (1280×800) and `mobile-chrome` (Pixel 5, 390×844). No separate screenshots: this
slice renders nothing and changes no player-facing surface.

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `package.json` | LANE-TOUCHED / MAIN-UNMOVED | clean, +1/-0 |
| `playwright.release-base.config.ts` | LANE-TOUCHED / MAIN-UNMOVED | clean, +4/-3 |
| `scripts/gate-caller-baseline.json` | LANE-TOUCHED / MAIN-UNMOVED | clean, +1/-0 |

`git diff 9a8a345b3 main -- <all three>` is **empty**: main never moved any of them since the base,
so no three-way graft was needed and the `ort` merge reported no conflicts. Every changed path is
inside the master's TOUCH-ONLY list; nothing in the NO list was touched.

## Findings

### F-2161-1 — the grandfather's cost citation is a quiet-machine floor, and it is the number the owner will price the rooting decision with (NON-BLOCKING)

The baseline reason records `2/2, rc=0, 18.73s`, honestly measured by the runner. Re-measured on the
merged tree at load average 12.1 with a concurrent attended battery: **39.4 s — 2.1×**. Neither
number is wrong; the suite's cost is dominated by a full `build:release`, which is exactly the term
that stretches under load.

This matters because the reason text's *purpose* is to price a decision the owner has to make
(root it, or leave it grandfathered). A drain-time gate is precisely when the machine is busiest, so
the realistic per-drain tax is the ~39 s figure, not the ~19 s one. Recorded rather than edited: the
runner's number is a correct measurement of what it measured, and rewriting another agent's honest
evidence line would be worse than annotating it. **Suggested disposition:** whoever takes F-2159-1's
gate-policy question to the owner should carry this as a range (**≈19 s quiet / ≈39 s under load**),
not a point estimate.

### F-2161-2 — an uncommitted attended goal leaf cites a fire's lock commit as its `mergeHash` (REPORT-ONLY, not mine to fix)

While gating, main's working tree held an uncommitted attended edit to `tasks/goals.json` adding a
leaf `b4v4-picnic-admission` with:

```
"mergeHash": "780b2ab9b11eed5eba07b62d1d6436dbbd46f0f5"
```

`780b2ab9b` is **this fire's lock commit**, whose entire diff is `STATUS.md | 1 insertion, 1
deletion`. The picnic content it claims to record landed at **`79d9a874e`** (`feat: e6-picnic
ADMITTED — the flipped stakes …`). Verified by `git show --stat` on both.

This is the *HEAD-splice-is-correct-exactly-once* shape: a helper that stamps `mergeHash: <current
HEAD>` is right only while HEAD is still the merge commit, and here a fire took the lock in between,
moving HEAD one commit past it. `goal-tracker.test.mjs` cannot catch it — the value is a valid
40-hex hash of a real commit, so the schema assertion passes; only the *provenance* is wrong.

**Not acted on, deliberately:** it is a live attended session's uncommitted work, and editing another
writer's working-tree file is the contention this repo serialises against. It may well be corrected
before it commits. Flagged so that if it does commit, the next reader knows the leaf's hash points at
a commit containing none of its content.

### F-2161-3 — gated in a detached worktree because main's tree was contested throughout (NO DEFECT, recorded as method)

A live attended session (pid 40448) ran its own drain battery in main's working tree for this fire's
entire duration — `tsc → build → same-game-audit → null-floor-anchors → playwright` on
`playwright.s-att-drain.config.ts` (port 5273) — and actively wrote `tasks/goals.json`,
`tasks/BACKLOG.md` and `artifacts/056/*.png` while I gated.

Per the ATTENDED-COEXISTENCE LAW this blocked nothing: the dirt was disjoint from the slice, the
index was clean, and the merge touched none of the contested paths. Ports were disjoint (5273
attended / 5295 mine), so neither instrument could poison the other. Recorded because the **39.4 s**
figure in F-2161-1 is only interpretable alongside it.

## Duties

- **GZ-01: no news item owed.** The filter law asks whether the review names a player-visible
  change. This slice adds a test runner and moves a test port; nothing the player can see changes.
- **Item 6 (report-do-not-act):** the 18-day-old `vite preview` on 5191 (pid 29695) is still up,
  still serving Gold Rush HTML at both `/` and `/goldrush/` with HTTP 200. Not killed — killing by
  an inherited pid is forbidden and it may be an attended session's. It is now routed *around*, not
  fixed.
- **Item 7 (report-do-not-act):** the remaining `1 of 3`, `accounts-sync.spec.ts`, needs
  `wrangler pages dev` plus KV bound on port `8788` — a port with historical corpse trouble. Pricing
  it is a separate task; no accounts harness was authored here.
