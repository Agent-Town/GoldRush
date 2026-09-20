# Rail and mask-table reconcile verdict

- **Canyon Works:** the published mask table was wrong. Shipped `tileParams` contains two rails; the table contained only the depot loop. The west-rim line is now copied verbatim from `assets/contracts/epoch-3-voltage/contracts.json`.
- **Dust Flats:** no relocation was needed. The task premise was stale: `e4-dust-flats.json` is already under `epoch-4-motor/mask-tables/`, no E3 copy exists, and git history shows it was introduced at the E4 path.
- **Blackout Ridge:** the shipped contract now has a mask table extracted from its `tileParams` and authored spawn/day-night data. It is riverless, so its water agreement is the empty-water contract.

No contract `tileParams` or runtime source changed.

Verification: `node --test scripts/e3-mask-tables.test.mjs` passed 5/5; `npm run build` passed.
