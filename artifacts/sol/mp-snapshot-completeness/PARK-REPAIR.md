# Park repair — two-Hero weapon-toggle isolation

- Branch: `sol/mp-snapshot-completeness`
- Parked parent: `701fb49`
- Gate source: `reviews/sol-snapshot-gate-park.md` on main
- Date: 2026-07-10

## Diagnosis

The failure was not a roster-promotion or rewind race. Fable's retained failed
trace showed the first Bob `KeyQ` had reached both peers by lockstep tick 78, then
the second press at wall time 8828 ms leaving both peers on Blast through tick
224. Throughout that window both clients reported `desyncs=0`, `resyncs=0`,
`paused=false`, and `error=null`.

`InputController` emits `weaponToggle` as a one-sample pulse. Before this
repair, `LockstepClient.pump()` serialized that sample only when the send-ahead
window had an open outbound tick. A pulse sampled while the window was full was
cleared before it was ever sent. `Game` also treated the pulse as a held edge,
so adjacent queued pulses could collapse.

## Repair

- `LockstepClient` now retains each sampled weapon-toggle pulse until it owns
  exactly one outbound tick. Backfill ticks no longer duplicate a single pulse.
- `Game` consumes the wire value as the pulse it is. The existing
  `lastWeaponToggleIntent` field and assignments remain for RunSuspend v2
  schema/hash compatibility, but no longer gate the action.

The same transport shape can affect other one-sample actions. That wider action
protocol remains explicitly assigned to Brief #3 (`sol/lockstep-actions`), so
this parked-gate repair does not broaden into it.

## Verification on the repaired tree

```text
npm exec -- tsc --noEmit
PASS

git diff --check
PASS

npm run build
PASS (existing >900 kB chunk warning only)

npm run test:mp
PASS — multiplayer relay checks passed (456)

npm exec -- playwright test e2e/mp-02-lockstep.spec.ts \
  --project=desktop-chrome --workers=1 --repeat-each=5 \
  -g "two clients promote both roster slots" --reporter=line
5 passed (1.8m)

npm exec -- playwright test e2e/mp-02-lockstep.spec.ts \
  --project=desktop-chrome --workers=1 --reporter=line
6 passed (1.5m)

npm exec -- playwright test e2e/m2-06-arsenal-blast-charge.spec.ts \
  e2e/task-053-weapon-cycling-audit.spec.ts \
  --project=desktop-chrome --project=mobile-chrome --workers=1 \
  -g "toggle defaults|weapon cycling" --reporter=line
3 passed, 1 intentionally skipped (1.5m)
```

The broader two-file weapon run was 13 passed / 1 skipped / 2 failed. Both
failures were the unrelated turret line-of-sight assertion at
`m2-06-arsenal-blast-charge.spec.ts:155`; the exact desktop and mobile cases
also failed 2/2 on Fable's untouched detached `701fb49` worktree with the same
`expected 0, received 1` fingerprint. They are baseline reds, not caused by
this repair.

## Review

Independent review confirmed the no-slot pulse-loss mechanism and the
exactly-once queue. It also caught the need to retain the snapshot compatibility
latch; the final diff includes that correction. The local `codex review`
command could not run because Codex CLI 0.133 does not support the configured
`gpt-5.6-sol` model; no global tooling or configuration was changed.
