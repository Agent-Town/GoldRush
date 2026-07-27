# 082 — Town T6 Claim Ledger nav alignment

Branch: `lane/m3`  
Base: `59d94c71`  
Scope: one assertion in `e2e/town-t6-surfaces.spec.ts`

## Runtime check

The seeded plain menu rendered exactly:

`["Enter Town", "Claim Ledger", "Profile", "Settings"]`

This matches the task's expected shipped menu. No conditional Continue or Load button rendered.

## Town T6 before / after

| Project | Test | Before | After |
| --- | --- | --- | --- |
| desktop-chrome | plain menu thins to town, profile, settings | FAIL — expected array omitted `Claim Ledger`; actual array shown above | PASS |
| desktop-chrome | Schoolhouse opens the existing Research chart and returns to the square | PASS | PASS |
| desktop-chrome | Assay porch opens the existing crafting order status panel | FAIL — `assay-bench` not found at line 125 | FAIL — identical `assay-bench` failure at line 125 |
| desktop-chrome | run launch remains reachable through the tavern board | PASS | PASS |
| desktop-chrome | town surfaces stay readable at 390px | FAIL — `assay-bench` not found at line 170 | FAIL — identical `assay-bench` failure at line 170 |
| mobile-chrome | plain menu thins to town, profile, settings | FAIL — expected array omitted `Claim Ledger`; actual array shown above | PASS |
| mobile-chrome | Schoolhouse opens the existing Research chart and returns to the square | PASS | PASS |
| mobile-chrome | Assay porch opens the existing crafting order status panel | FAIL — `assay-bench` not found at line 125 | FAIL — identical `assay-bench` failure at line 125 |
| mobile-chrome | run launch remains reachable through the tavern board | PASS | PASS |
| mobile-chrome | town surfaces stay readable at 390px | FAIL — `assay-bench` not found at line 170 | FAIL — identical `assay-bench` failure at line 170 |

Before: 4 passed, 6 failed.  
After: 6 passed, 4 failed.

The two-result improvement is exactly the assertion change on desktop and mobile. The four unrelated assay-surface failures were present before the edit and remained fingerprint-identical after it; they were not changed under this task's firewall.

## Gates

- `npx tsc --noEmit`: PASS.
- `e2e/044-start-screen.spec.ts`, both projects: 14/14 PASS.
- `e2e/profile-first-boot.spec.ts`, both projects: 12/12 PASS.
- `e2e/m1-01-claim-jumpers-death.spec.ts`, both projects: 8/8 PASS.
- Adjacent total: 34/34 PASS.
- Console/page errors: none reported by the passing Town T6 boot probes or adjacent suites.

READY-FOR-GATES
