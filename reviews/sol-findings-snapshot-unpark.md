# Snapshot unpark findings — 2026-07-10

## F-SOL-SNAP-UNPARK-001 — the isolated red is a dropped rapid action tap, not snapshot divergence

- **Gate evidence:** the attended failure trace for `e2e/mp-02-lockstep.spec.ts:196` reached the second weapon assertion with both clients equal but still on `blast`; expected `{ alice: 'rig', bob: 'rig' }`, received `{ alice: 'blast', bob: 'blast' }`. Roster promotion, local cameras, and the first shared weapon transition had already passed.
- **Cause:** `InputController.readIntents()` emits `weaponToggle` as a one-sample edge and clears its sub-frame tap buffer (`src/core/InputController.ts:198-240`). `LockstepClient.pump()` only submits an input when the delayed target window advances (`src/mp/LockstepClient.ts:151-168`). A Playwright `keyboard.press()` can therefore complete between submission frames, or the second press can arrive before the previously queued true inputs have drained. `Game.update()` correctly applies only a false-to-true action edge (`src/game/Game.ts:1400-1431`), so the second transition is suppressed while both clients remain deterministic.
- **Scope ruling applied:** queue item 2 / Brief #3 owns reliable discrete-action queueing. Adding a test wait would mask a real player-input defect, while changing `LockstepClient` on Brief #2 would violate its explicit input/relay firewall. No fixture or product workaround is applied on this branch.
- **Next branch:** `sol/lockstep-actions` must queue discrete action edges until they are assigned to exactly one outbound tick. The existing two-`Q` assertion remains the regression test and should be part of that branch's isolated gate.

## Evidence and remaining gate

- `npm run build` on the unchanged snapshot implementation — **PASS** (`tsc` + Vite production build).
- Required isolated command attempted:

  ```text
  npm exec -- playwright test e2e/mp-02-lockstep.spec.ts \
    --project=desktop-chrome --workers=1 --reporter=line --repeat-each=5 \
    -g "two clients promote both roster slots to real local-camera heroes and shared run credit"
  ```

- Local execution is **environment-blocked before the test body**: this managed sandbox rejects the suite's ephemeral relay listener with `Error: listen EPERM: operation not permitted 127.0.0.1`. This is not a green claim.
- The branch remains parked by evidence under the queue's move-on rule. After `sol/lockstep-actions` fixes the action loss, an unrestricted gate runner must prove this case isolated **5/5**, followed by the prior full battery. No `READY-FOR-GATES` tail is asserted here.
