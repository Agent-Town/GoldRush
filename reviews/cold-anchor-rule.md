# Review — cold-anchor-rule (one era breathes at a time)

- **Slice:** cold-anchor-rule (lane-a #2, "fix:") — ACCRETION LAW v2 / COLD-ANCHOR RULE
- **Branch/tip:** lane/m3 @ `17a8c017` (`runner(lane-a): cold-anchor-rule.md`)
- **Merged as:** `21e6ee2b` (`Merge branch 'lane/m3'`) onto main `b4bbf436`; base (merge-base) `0fa91dc4`
- **Drain:** s642 fire, 2026-07-16
- **Verdict:** ✅ SHIPPED — gates green, on-firewall, owner-ruled behavior implemented.

## What it does
Enforces the owner ruling "one era breathes at a time." `addAnchorEmitters` previously mounted particle emitters for a building's *native* era (`candidate.era`), so inherited relic buildings from earlier eras kept breathing (steam plumes on an E2 relic standing in an E4 town). The signature's optional `era?` is now a required `activeEra`, and the emitter candidate filter keys on the **active** era only (`ANCHOR_EMITTERS.filter(c => c.era === activeEra)`). Call sites pass `activeEpoch().order` (building/dynamo pilots) or the in-scope `activeEra` (plaza props) instead of each model's own era. Inherited anchors stay in the GLB geometry as relics but never emit outside their era: E2 → steam only; E3 → arc flicker only (steam anchors present-but-dormant); E4 → dust only (arc + steam dormant).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (704ms) |
| cold-anchor-rule + wire-era-anchor-emitters + town-era-switch, both projects | **18/18 passed** (33.4s) |
| task-025 + m1-01 + m2-01 (baseline adjacent), both projects | **32/32 passed** (3.4m) |
| Console/page errors | zero (specs register console.error + pageerror listeners; all green) |
| Perf | wire-era p95 budget held (`e4P95 ≤ e3P95 * 1.15`), asserted in-suite |

Six visual artifacts land under `artifacts/cold-anchor-rule/` — `{desktop,mobile}-chrome-{e2-steam-only,e3-arc-only,e4-dust-only}.png` — the matrix made visible.

## Era → emitter matrix (the ruling)
| Active era | Emits | Dormant (relic anchors present in GLB) |
|-----------|-------|----------------------------------------|
| E2 Steamworks | steam plumes | — |
| E3 Voltage | arc flicker | steam |
| E4 Motor | dust puffs | arc + steam |

## Merge classification (base `0fa91dc4`)
| File | Class | Note |
|------|-------|------|
| `src/town/TownTavernPilot.ts` | LANE-TOUCHED | main == base (`f492397a`); emitter filter + 3 call sites; no MAIN-MOVED, clean apply |
| `e2e/wire-era-anchor-emitters.spec.ts` | LANE-TOUCHED | prior-slice spec co-updated: E4 scenario now asserts arc anchors dormant (34/68 → 0/0) under the new rule — a *necessary* update, the old assertion is invalidated by the ruling |
| `e2e/cold-anchor-rule.spec.ts` | NEW | cycles E2/E3/E4, asserts only active era breathes |
| `artifacts/cold-anchor-rule/*.png` (6) | NEW | visual matrix |

No conflicts; `ort` merge, clean. Firewall respected: only the emitter-mount era filter + spec + artifacts touched; no removals outside scope (diff read line-by-line — the only src change is the `era?` → `activeEra` filter and its 3 call sites).

## Findings
- **F-1 (non-blocking, informational):** the master carried no `tasks/goals.json` leaf (author did not register one per the Goal Registration Law). The drain added `world-cold-anchor` under `world-buildings` in the same drain bookkeeping and flipped it `merged` @ `21e6ee2b...`. No corrective needed.
- No blocking findings.
