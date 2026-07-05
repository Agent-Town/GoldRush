# s38 — batch-006 processing + integration (icons tranche 2 + blast + favicon)

Date: 2026-07-05 (scheduled fire, orchestrator asset-pipeline lane)
Inputs: `assets/requests/batch-006.md`, `assets/requests/codex-art-run-002.md` (7 raws, all run-QA PASS, 1254×1254)
Authority: asset pipeline (CLAUDE.md §5/§7) + one sanctioned §5 fix (index.html favicon links, 3 lines — pre-authorized in batch-006.md wiring note).

## What shipped

| Asset | Processing | Integration |
|---|---|---|
| icon-panning/prospecting/beacon/gold/mend/blast | `extract-alpha` default gray key, `--size 512` → `assets/processed/` (keyed 63–88%) | Live on landing via UpgradeOverlay lazy glob (`ui.upgrade.icon.<family>`); blast slot row ADDED to `m1-upgrade-icons.v1.json` |
| favicon-source | `--full-bleed --size 48/32/16` → `public/favicon-{48,32,16}.png` | index.html: `data:,` placeholder → 2× `rel="icon"` (32/16) + 1× `rel="apple-touch-icon"` (48) |

All 12 upgrade families are now icon-backed (blast was live since M2-06 with parchment fallback).

## Verification (evidence, not vibes)

- **Structure probe** (node/pngjs): all 6 icons corners alpha-0, opaque 11.8–37.0%. Favicons decode at exact 48/32/16.
- **Gray-residue probe**: panning 17px, gold 9px (AA scatter, ignore), prospecting **350px → pixel-inspected visually: the loupe's glass lens with nugget behind it — intentional art, NOT key residue.** Decision: NO `--pocket-mean` rerun (it would have deleted the lens). Logged in contract notes. Lesson: s12's firerate pocket precedent does not generalize — inspect before re-keying.
- **Canon/style visual review** (direct image inspection): prospecting PASS (brass/wood/ochre, bold silhouette), blast PASS (comic keg, teal fuse spark, no menace/warning marks — §9.2 clean), favicon judged at 48 (bold roundel; **16px readability verdict belongs to Robin's browser tab**).
- **Build**: `npm run build` green; all 3 favicons copied into `dist/`, 3 link tags present.
- **Permanent icon gate**: `e2e/ui-upgrade-icons.spec.ts` — **1/1 desktop-chrome (8.7s), 1/1 mobile-chrome (9.4s)** (icon-backed family ⇒ image decodes; the s12 no-assert debt's repayment did its job on the first new tranche).
- **Boot probe**: desktop 1280×720 + 390×844, `?debug`, ZERO console errors / page errors.
- **In-game visual**: `shots-s38-batch-006/upgrade-overlay-desktop.png` — Patent Office offer drew `panning` live: brass pan icon renders crisp at card size, family-consistent next to batch-002's firerate coil + mobility boot. Boot shots desktop + 390 attached.

Env note: VM cooperative this fire — `/tmp/pw-browsers` chromium-1228 SURVIVED (s10 pattern), npm warm cache (976ms install), xdamage stub rebuilt from `scripts/xdamage-stub.c`.

## Not done / carried

- **batch-005 prompts still unwritten — deliberate.** After lifting icons t2 out, its remaining scope is props + death/level-up flourishes = decoration tier (§7 lowest). One batch in flight: batch-006 only closed this fire. Queue on an art-idle fire.
- Favicon 16px legibility: Robin eyeballs a browser tab; regenerate per batch-006 prompt if it muds.
- Mac full regression will sweep the icons spec again on real hardware (Robin-owes item 1, unchanged).
