---
verdict: MERGE
slice: assay-cf-lifecycle
base: 14e13416fbbcb6139f9999656db1c5a4996700f2
merge: 49aab8f1d63a2175e47e85b54659fead6caaa6da
date: 2026-08-15
---

# Assay CF lifecycle — drain review

## Verdict

MERGE. Taped rows enter `pending`; tapeless and rejected rows are retained but never ranked; pending/verified state is public; rejection reasons stay private. The worker queue and verdict routes fail closed behind `ASSAY_WORKER_SECRET` and `x-assay-key`.

## Gate evidence

- `npx tsc --noEmit` — pass.
- `npm run build` — pass; asset-diet ceilings green.
- `npm run test:stats` — stats 87 + assay lifecycle 31 pass.
- `npm run test:accounts` — 43 pass.
- `node scripts/gate-caller-audit.mjs` — pass; assay harness is rooted through `test:stats`.
- Plain boot probe — desktop 1280x800 and mobile 390x844: 0 console errors, 0 warnings, 0 page errors.

## Independent-review findings closed before merge

- **F-1793-1 (P1, closed):** client-controlled duplicate tape IDs and hashes produced identical locators, allowing a verdict to stamp the wrong row. Locators now carry a stable row identity derived from the standing, submission time, and input hash; the mutation test uses two identical tape IDs and hashes and proves only the selected row changes.
- **F-1793-2 (P1, closed):** retained tapeless/rejected rows had lost the old board-size ceiling. Unranked retention is capped at 100 newest rows; the 101-row mutation keeps the newest and never grows the KV value unboundedly.
- **F-1793-3 (P2, closed):** the new 29-check harness had no automated caller. It is now a 31-check harness chained into the established `test:stats` worker gate.

No player-visible surface changed, so no screenshot or Gazette item is owed.
