# Review — lane-roster-wiring-e6 (E6 Atomic enemy roster wired into waves/pools/combat)

**Slice/branch/tip:** roster-wiring-e6 · lane/perf (lane-d) · `74a10b8c` · drained by s754 fire 2026-07-20
**Verdict:** SHIP ✅

## What it does
Wires the E6 "Atomic" enemy roster into live play: the Lawn-Shepherd herd-drive, Cure-Arms
(turn-back / power-down, no-death outcomes), and named-sprite fallbacks now field through
WaveSystem/pools at epoch 6 while E1 keeps its untagged outlaws. Adds the epoch-6 atomic
contract entries + `characters.v2` layer-contract rows, the E6ArsenalSystem hooks, and the
CombatSystem/WrangleSystem/WaveSystem/Game plumbing that lets the new roster spawn, track,
and resolve as capturable (Glowjack freed home). Player sees it in normal play: the roster is
ABSENT before the Atomic epoch and PRESENT at epoch 6 (asserted by e6-arsenal + e6-roster).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` (via build) | clean |
| `npm run build` | ✓ built in 1.29s |
| `e2e/e6-roster.spec.ts` (own spec) | 6/6 — desktop + mobile-390 |
| `e2e/e6-arsenal.spec.ts` (adjacent) | 6/6 — desktop + mobile-390 |
| `e2e/e6-wrangle.spec.ts` (adjacent, WrangleSystem) | 2/2 — desktop + mobile-390 |
| `_s106-prospector-boot-probe` (zero-console plain boot) | 2/2 — desktop + mobile-390 |

## Merge classification
Base = merge-base `488d2e0b`. All 13 files: MAIN moved NONE of them since fork
(`git diff 488d2e0b main -- <all 13>` EMPTY) → CLEAN ADDITIVE graft, no 3-way.
`git checkout lane/perf -- <13 files>` reproduced the exact lane delta. Path-scoped commit.
(Note: `e2e/e6-roster.spec.ts` was pre-staged in the main worktree from s753's partial drain —
byte-identical to lane/perf; the checkout re-materialised it with its src, resolving the
orphan tsc error that blocked the tree.)

## Findings
None blocking. E6 roster application is gated behind epoch progression (spec-asserted
absent<E6 / present=E6), so display-safe on any plain boot.
