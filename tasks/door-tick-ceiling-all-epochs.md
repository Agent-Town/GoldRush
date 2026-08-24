# Task door-tick-ceiling-all-epochs: the per-contract ceiling reads ONE bundle; the door admits TEN (lane-c, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2280, from F-2280-1, measured at the drain of `door-tick-ceiling-v2`. No new design question: this extends a ruling the owner's fork already settled, to the contracts it was scoped away from.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST:
- `AGENTS.md`
- **`reviews/door-tick-ceiling-v2.md` §Findings → F-2280-1** — this is your WHY, with the measured table. Read it before anything else.
- `tasks/door-tick-ceiling-v2.md` and `tasks/door-tick-ceiling.md` — **their scope rulings remain BINDING and are not restated here.** In particular: per-contract derivation with explicit margins, **never** a raised or deleted global constant, because `MAX_PLAYBOOK_TICKS` is a load-bearing browser-recorder DoS bound.
- `src/playbook/PlaybookFormat.ts` — `DURATION_CONTRACTS` and `maxRunTapeTicksForContract` as shipped.
- `functions/api/standings.ts` — `CONTRACT_BUNDLES` / `CONTRACT_EPOCHS`, the ten-bundle list the door actually admits.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template — ahead content already on main = SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; **STOP on un-merged ahead content or foreign edits.** FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

**Dispatch citation check (hard STOP if it fails):** `grep -Fc "the door admits TEN" reviews/door-tick-ceiling-v2.md` must return **1**. Zero means your lane is stale — refresh it and re-read; do NOT proceed on a stale tree.

## Why

`door-tick-ceiling-v2` cured the ceiling correctly and shipped a per-contract table — but it builds `DURATION_CONTRACTS` from `assets/contracts/epoch-1-frontier/contracts.json` **alone**, while the door assembles `CONTRACT_EPOCHS` from **ten** bundles. Every non-E1 contract therefore falls through to the flat 18,000.

Measured at the s2280 drain across all 10 bundles / 42 contracts, applying the slice's own formula, **4 contracts are structurally unwinnable through the public door for exactly the F-2276-1 reason**:

| contract | needs | effective today |
|---|---|---|
| `e2-trestle` | 23,144 | 18,000 |
| `e2-incline` | 21,601 | 18,000 |
| `e3-canyon-works` | 18,001 | 18,000 |
| `e4-dust-flats` | 18,001 | 18,000 |

This is **not a regression** — it is the pre-cure behaviour, preserved, and v2 scoped its table to the six E1 contracts deliberately because E1 is launch week. The formula already handles wave cadence and baron grace correctly for these four; only the bundle list is narrow.

## Scope

1. Build the duration table from **every** contract bundle the door admits, resolved from the same source of truth rather than a second hardcoded list — a hardcoded list of what the filesystem already knows is a defect awaiting a rename. If `standings.ts` and `PlaybookFormat.ts` must agree on the bundle set, make one import the other's list rather than maintaining two.
2. **The floor and the margins are unchanged.** No contract's ceiling may DECREASE. `maxRunTapeTicksForContract` must still return `MAX_PLAYBOOK_TICKS` for any contract without duration-bearing semantics, and for any id it does not know.
3. **The recorder's DoS bound stays exactly where it is.** `MAX_PLAYBOOK_TICKS` remains 18,000 and remains `validatePlaybook`'s default. Do not raise it, do not delete it, do not make it contract-aware. If you cannot widen the table without touching it, **STOP and say so** — that is a real finding.
4. Extend the pinned table in `scripts/test-standings.mjs` to cover the four contracts above with their computed ceilings, alongside the existing six E1 pins, and keep the both-validators assertion shape (door AND assayer accept the ceiling, refuse ceiling+1).

## Firewall

**Touch ONLY:** `src/playbook/PlaybookFormat.ts` · `functions/api/standings.ts` **only if** the bundle list must be shared · `scripts/test-standings.mjs` · your `tasks/BACKLOG.md` row.

**NO:** no change to `MAX_PLAYBOOK_TICKS` · no change to `RunTapeRecorder` or `PlaybookSession` truncation (that is F-2280-2, a separate and owner-facing question) · no ranking, worker or sim/gameplay behaviour changes · no other `src/` files.

⚠️ **Path-scoped `git add` is still whole-FILE (F-2273-2).** If a concurrent writer has dirtied one of your files, do NOT sweep their hunk in — report it.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean; `npm run build` green; `node scripts/test-standings.mjs` green **on both arms** (kv + sqlite); **`npm run test:node-guards` green** (you are touching `src/`, so the cross-cutting sim pins apply — F-1460-1); the full 42-contract ceiling table printed in your report, with the four changed rows called out and every other row proven UNCHANGED.

End: **READY-FOR-GATES** + report: the table as shipped, how the bundle set is now derived, and proof that no contract's ceiling decreased.

## No-op / honesty guard

If widening the table turns out to require weakening the recorder bound or duplicating the bundle list in a way that will rot, **STOP and name it precisely.** A correct STOP is a better outcome than a cure that trades one narrow list for another.
