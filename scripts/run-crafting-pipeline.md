# Offline crafting pipeline runbook

Use this when `assets/crafting-queue/pending/*.json` has orders.

1. Read every pending order and keep the request object byte-for-byte in the verdict file.
2. Propose one data-only item per order: `id`, `kind`, `rarity`, `name`, `blurb`, `cost`, `stats`.
3. Validate the proposal before it can enter `approved/`:
   - Contract shape: `assets/crafting-queue/contract.v1.json`.
   - Canon lint: no firearm terms; names stay places, ledgers, receipts, offices, rites, or other brief §9.4 language.
   - M5 stat bounds: common/uncommon/rare budgets `3/5/8`; caps are `fireRateMult <= 0.30`, `damageMult <= 0.35`, `rangeMult <= 0.30`, `moveSpeedMult <= 0.18`, `panTickMult >= -0.35`, `maxHpBonus <= 35`.
   - M5 stat-sim: reject proposals that overperform their declared rarity budget.
4. If both verdicts pass, write `assets/crafting-queue/approved/<order-id>.json`.
5. If either verdict fails, write `assets/crafting-queue/rejected/<order-id>.json` with every reason the bench should show.
6. Delete the consumed `assets/crafting-queue/pending/<order-id>.json` after the verdict file exists.
7. Run `npm run build` and `npx playwright test e2e/m5-04-offline-queue.spec.ts --project=desktop-chrome --workers=1`.

Do not wire item application during a pipeline run. That is the later M5 card-pool slice.
