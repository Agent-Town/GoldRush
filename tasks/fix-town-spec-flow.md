# Task fix-town-spec-flow: town blender specs learn the new create→enter flow (LADDER, any lane, commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: e2e/town-tavern-blender.spec.ts openTown/installSeedAndWebglCounter (waits for start-menu-enter-town) · the CURRENT boot flow (profile-create flows STRAIGHT into town — the town/menu UX harvest sharpened it; enter-town no longer appears in that path) · e2e/menu-safe-params.spec.ts (green precedent).
## Why (found 2026-07-18 gating the town 3D promotion): the ~10 town-*-blender specs time out waiting for start-menu-enter-town — STALE FLOW, pre-existing (the promotion was proven green via a real-path probe: pilot loaded, 88 GLBs, zero errors).
## Scope: 1. Update the shared openTown/seed helpers to the real flow (seeded profile → boot lands in town directly, or create-via-UI) across the town-*-blender specs. 2. Run ALL of them both projects; report per-spec green/red with reasons for any residue.
## Firewall: spec helpers only — NO src changes.
END: READY-FOR-GATES + the per-spec table.
