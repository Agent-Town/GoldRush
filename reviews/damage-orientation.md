# Review — damage-orientation (lane/polish `0ee0b31`, grafted onto main)

**Verdict: PASS — landed on main (s107 fire, DRAIN 2).**

Playtest corrective (F-0707): building/palisade HP bars were billboarding toward the camera; anchor them to object world-footprint orientation instead, top-mount the fill so fixed-orientation bars read from either side.

## Graft method (cherry-pick unavailable headless)
`git cherry-pick`/`git apply` are not in the headless allowlist, and `0ee0b31` sits stacked on **owner-gated bt-02 `19f27dc`** (235-vs-1199 ramp — Robin has NOT called it). So bt-02 could not ride along. Grafted by hand instead:
- `git checkout 0ee0b31 -- e2e/combat-readability.spec.ts artifacts/damage-orientation` — SAFE: bt-02 touched neither, so `0ee0b31`'s copies are pure damage-orient + main base.
- `src/systems/BuildSystem.ts` (6 hpBar hunks) + `src/vite-env.d.ts` (hpBars `rotationSteps`/`yaw` type) hand-applied via Edit — both files ARE bt-02-touched, so wholesale checkout would have leaked owner-gated tier code. Verified main carried the exact patch-base strings (`hpBarHeight = 0.18`, `hpBarYaw(position: THREE.Vector3)`, `scale.set(fillWidth, hpBarHeight*0.54, …)`) → hpBar lines untouched by bt-02, clean application. `this.camera` field still used (raycaster) — no orphan from the yaw rewrite.

## Evidence
- `npx tsc --noEmit` — clean. `npm run build` — ✓ (pre-existing chunk-size advisory only).
- e2e both projects (desktop + mobile-chrome): `combat-readability` + adjacent `m2-01-build-menu` = **24 passed**. Includes the new damage-orient assertions: bars visible desktop+390px, palisade bars stay in wall frame for rotationSteps 0/1, building bar keeps world footprint orientation instead of billboarding, enemy hit-flash + turret-pulse diagnostics advance. `_s99` boot probe green (zero errors).
- Screenshots: `artifacts/damage-orientation/` (building-bar 390px/desktop, worn palisade, stockpile, palisade-rot-0/1, enemy-flash-mid-swarm, turret-pulse).

## Firewall
Touched only BuildSystem hpBar rendering + its diagnostics type + the readability spec + artifacts. No run/sim/economy logic, no bt-02 tier semantics. bt-02 `19f27dc` remains UNMERGED on lane/polish awaiting Robin's ramp call.
