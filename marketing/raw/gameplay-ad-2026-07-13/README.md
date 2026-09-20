# Gameplay advertisement capture sources — 2026-07-13

Status: **RAW — scripted development-build footage; not a publishable edit**

These silent `1920x1080`, `25 fps` captures were recorded from `origin/main` at `b17da7a4` with the repository's existing Playwright/Factory Channel rigs. They show the current female Hero and the Prospector; no family profile names or debug GUI are visible.

| File | Capture result | Use |
|---|---|---|
| `dry-gulch-spring-rush-2026-07-13-ad.webm` | Factory Channel assertions PASS: Dry Gulch contract, seam yield, 16 enemies spawned | Current-build Dry Gulch defense proof; the ad crops away the Factory Channel QA overlay. |
| `sluice-line-economy-16x9-2026-07-13.webm` | Marketing rig PASS | Current-build tiered sluices and stockpile proof. |
| `prospector-at-work-16x9-2026-07-13.webm` | Marketing rig PASS | Current-build trust ladder, permissions, receipts, Hero, and Prospector proof. |

The scenarios are seeded and use test setup to reach the visual beat quickly. They are real engine footage, not an organic progression run. The finished advertisement therefore labels every gameplay section `REAL GAMEPLAY | WIP BUILD` and makes no progression-speed claim.

## Adjacent capture-rig findings

- The optional `demolish-sad-plank` shot no longer opens `building-context-prompt` through its old setup path.
- The current `science-chart-open` shortcut timed out waiting for `start-menu-research`.

Neither issue was changed for marketing. The advertisement drops the teardown gag and uses the existing no-Hero research-ledger capture for its UI insert.
