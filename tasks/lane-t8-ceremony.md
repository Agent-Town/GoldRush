> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, verified s1131 2026-07-27).** Done-move `tasks/failed/shipped-s896-t8-ceremony-5012ad42.md`; merge **`5012ad42`** ✓ ancestor of main = **true**, subject *"feat: T8 THE COLONY SEED — era door E8→E9 (SAGA WALL 3/5, F-REH-01 P0)"*. Ceremony machinery on main: `src/ceremony/CeremonySystem.ts` + `src/ceremony/stages.ts`. See F-1131-6.

# Task lane-t8-ceremony: T8 — the era door E8→E9 (slice 3/5 of THE SAGA WALL, commit prefix "feat:")

You are Codex, implementer for Gold Rush (worktree per queue lane).
CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST: tasks/lane-t6-t10-ceremonies.md (THE DRAFT — authored by the saga-rehearsal from F-REH-01; your slice is its T8 section; the draft is the single source for scope/gates) · src/ceremony/scripts.ts + CeremonySystem.ts (T3/T4/T5 = the working precedents: script shape, HAND primitives, arm() → activateEpoch) · lore/STORYBOOK.md E8 (the ceremony's canon: its beats, sounds, kept-image) · the successor-manifest fix your slice requires (assets/contracts/epoch-8-orbital/manifest.json successor: null → the real successor).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (F-REH-01, P0 release-blocker: the saga arms only E1→E6 — no doors past T5; VERIFIED in code + live by the rehearsal)
## Scope: implement THE DRAFT's T8 slice completely — the ceremony script (canon beats, played-not-watched law: the HAND drives, idle arms nothing) · the door render path · successor wiring (manifest + arm seam) · persistence (armed era survives reload). Extend e2e/ceremony-framework.spec.ts with the T8 cases per the T4/T5 grammar (door-ready, hand-gates, arms-exactly-once, kept-image, zero console, both projects).
## Firewall: per the draft. activateEpoch stays the only arming seam; NO other eras' scripts touched.
END: READY-FOR-GATES + the ceremony's beat list as shipped.
