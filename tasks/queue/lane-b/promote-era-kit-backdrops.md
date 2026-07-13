# promote-era-kit-backdrops — every era dresses its menus (lane-b; commit prefix "feat:")
ROLE: asset promotion. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-13 — owner: "menu updates to make them visually aligned with the epoch of the player" — the SYSTEM ships (EraBackdrop glob → kit-era-N per epoch, start menu + town surfaces consume it), but only kit-era-1 and kit-era-2 are PROMOTED; eras 3-10 fall back to nothing.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## READ-FIRST: src/ui/EraBackdrop.ts (the glob contract: assets/processed/kit-era-N.png) · how kit-era-1/2 were promoted (dimensions/compression convention — compare raw vs processed file) · assets/raw/kit-era-3..10 (the complete chain, LEDGER #44/#45) · e2e/ui-era-dressing.spec.ts (gate grammar).

## SCOPE:
1. Promote kit-era-3 through kit-era-10 raws → assets/processed/kit-era-N.png at the exact convention kit-era-1/2 use (dimensions/format/size budget — report the numbers; full-bleed reference plates, NO keying).
2. Verify the loader resolves every era 1-10 (unit-light: the glob map contains all ten; the start menu + a town surface render each without 404) — extend ui-era-dressing.spec with an all-eras loader assertion (data-driven over listEpochs, not hardcoded).
3. Byte budget: these ride lazy loaders (never boot-critical) — assert boot bytes unchanged vs baseline.
4. LEDGER: mark the kit chain PROMOTED 1-10 same-commit.

## Firewall
Touch ONLY: assets/processed/kit-era-{3..10}.png, the era-dressing spec (additive assertion), assets/LEDGER.md, artifacts/promote-era-kits/. NO raws, NO EraBackdrop.ts logic, NO menu markup.

## Self-check
tsc + build green · ui-era-dressing green both projects · boot-bytes unchanged · a 10-thumb contact strip. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + per-plate size table.
