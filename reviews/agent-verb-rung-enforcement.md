# agent-verb-rung-enforcement — the owner's 07-30 verb-rung ruling reaches the gate that enforces it

- **Slice:** `lane-c-agent-verb-rung-enforcement` (authored s1282, F-1282-1)
- **Branch / tip:** `lane/e2-arsenal` @ `f324e804` (runner commit, 2026-07-31T09:57+07)
- **Base / merge-base:** `d5d8c1a5`
- **Drained by:** s1283
- **Verdict:** ✅ **MERGE.** Scope delivered exactly, the behaviour change is measured through the real entry point, and the guard that pins it was proven falsifiable on four arms.

## What it does

`requiredLevel()` in `src/agent/StandingOrders.ts` is the **first** of two gates in `permissionDenial` — it refuses an order and returns before the ability table is ever consulted. It read `if (order.verb === 'BUILD' || order.verb === 'HARVEST') return 3;`, which is the owner's ruling for BUILD and the value he overruled for HARVEST. The slice splits that line: **BUILD stays 3, HARVEST becomes 2.** It then extends the s1281 conformance guard — which previously pinned only the two *ability* tables — to pin the **verb** table as well, by reading `StandingOrders.ts` and asserting `{HARVEST: 2, BUILD: 3}`.

This is the third and final joint of a four-fire chain: s1279 recorded the ruling, s1280 found the enforcer rather than the advertisement, s1281 moved the ability tables, and s1282 discovered the ability table is the *second* gate and the ruling had never reached the first.

## Merge classification

Three paths, all **pure LANE-TOUCHED** — `git diff d5d8c1a5..main` over all three is **empty**, so main never moved them and no graft was required. Grafted by path-scoped `git checkout lane/e2-arsenal -- <paths>`, then verified byte-identical to the lane tip (`git diff lane/e2-arsenal -- <paths>` empty).

| Path | Δ | Class |
|---|---|---|
| `src/agent/StandingOrders.ts` | +2 / −1 | LANE-TOUCHED |
| `scripts/agent-rung-conformance.test.mjs` | +6 | LANE-TOUCHED |
| `logs/session-scratch/s1282-lane-c/verb-rung-mutation.mjs` | +49 (new) | LANE-TOUCHED (evidence) |

⚠️ The two-dot `git diff main..lane/e2-arsenal` shows ~12 extra files as deletions. Those are **stale-base phantoms** — the lane forked at `d5d8c1a5`, before this fire's own commits. The three-dot (merge-base) diff above is the real delta. Recorded because the phantom list includes this fire's own authored master, and a reader taking the two-dot at face value would conclude the lane deleted it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green |
| `npm run test:node-guards` | **190 pass / 0 fail** (s1282 was 189 — the +1 is this slice's new conformance test; delta derived, not inherited) |
| Own spec `e2e/ap-standing-orders.spec.ts` `--workers=1` | **4/4**, both projects |
| Adjacent battery (6 specs, 58 tests) `--workers=1` | 55 pass / 3 fail — **all 3 attributed, see below** |
| Panel suites m4-09 + m4-10 re-run on restored graft | **16/16**, both projects |
| Boot probe `_s106-prospector-boot-probe` + `profile-first-boot` | **14/14**, desktop + 390px, zero console/page errors |

Transcript: `logs/session-scratch/s1283/gates-transcript.txt` (append-only).

### The behaviour change, measured through the real entry point

Re-ran s1282's own probe (`logs/session-scratch/s1282/harvest-rung-probe.mjs`) — the same instrument that measured the defect — on the merged tree. Every rung and ability granted, so permission level is the only variable:

| Order | s1282 (before) | s1283 (after merge) |
|---|---|---|
| **HARVEST @ L2** | `PERMISSION_DENIED: HARVEST requires permission rung 3; current rung is 2.` | ✅ **ACCEPTED** |
| HARVEST @ L1 | denied ("rung 3") | denied, message now correctly reads **"requires permission rung 2"** |
| **BUILD @ L2** | PERMISSION_DENIED | **PERMISSION_DENIED** — correct, the owner ruled BUILD = 3 |
| BUILD @ L3 | ACCEPTED | ACCEPTED |
| CONTROL `REPAIR_UNDER` @ L2 | ACCEPTED | ACCEPTED — the harness can still say yes |

➡️ **A level-2 Prospector can now be given a HARVEST standing order.** This is the first time that sentence is true; s1281 reported it, but measured the ability table rather than the control flow, and the upstream gate still refused (F-1282-1).

### The guard is falsifiable — four arms, all correct

`logs/session-scratch/s1282-lane-c/verb-rung-mutation.mjs` mutates **temp copies**, never the repo:

| Arm | Expected | Got |
|---|---|---|
| `MUT-HARVEST-3` | rc=1 | **rc=1** |
| `MUT-BUILD-2` | rc=1 | **rc=1** |
| `MUT-HARVEST-DELETED` (vacuity arm) | rc=1 | **rc=1** |
| `CONTROL-RESTORED` | rc=0 | **rc=0** |

The deletion arm is the one that matters: the guard reads the rung by regex, so a miss yields `NaN` rather than a silent pass. Verified it fails closed. ✓ Also checked by inspection that a revert to the original combined-return form (`'BUILD' || 'HARVEST'`) fails **both** assertions — the BUILD regex stops matching and the HARVEST regex recovers `3`.

### The three adjacent reds — attributed by a control arm, not by argument

Rather than assert the reds were pre-existing, the identical 58-test battery was re-run with the graft **reverted** to clean main, same shell, same `--workers=1`:

| Red | Treatment | Control | Verdict |
|---|---|---|---|
| `m2-07:349` "blast clump TTK at wave 20+ stays within 2x wave-10" | red (desktop + mobile) | red (desktop) | **Documented known red** — `logs/suite-red-inventory.md:169-170,461`, measured 22/26 (84.6%) pass on both projects. Combat-balance code, untouched by this slice. |
| `m4-06:196` "Prospector floats above terrain while following hero probe points" | red (desktop) | **green** | Load flake — **passes in isolation, 12.4 s**. Submits no standing orders and never calls `setAgentLevel`, so no causal path exists from `requiredLevel()`; the failing assertion is an 8 s follow-distance `.poll`. |
| `m4-06:395` "permission-denied receipts do not send the Prospector to the denied target" | **green** | red (mobile) | Load flake, and it reds on the arm **without** the change. |

💡 **The reds move between arms** — each m4-06 failure is green in the other arm — which is the signature of a load-sensitive flake population, not a regression. A regression reds deterministically in treatment and never in control. Totals: treatment 55/58, control 56/58; the only red common to both is the documented one.

## Findings

**None blocking.** No corrective spawned.

- 🔎 **F-1283-2 (non-blocking, observational).** `m4-06:196` and `m4-06:395` are both load-sensitive at `--workers=1` in the fire shell and neither is in `logs/suite-red-inventory.md`. They are not new (m4-06:395 reds on clean main) but they are undeclared, so the next drain will re-litigate them exactly as this one did. Worth a rate measurement and an inventory row. Not authored here — F-1252-1 (the inventory's scope ruling) is on the owner's desk, and adding rows under an unsettled scope would pre-empt it.

## Owner-facing

The ruling now holds end-to-end. Remaining from the owner's 07-30 sentence: **`place_building` at level 3 has still never been declared** — that is the adapter re-land's scope (`tasks/lane-c-ap-06b-adapter-reland.md`, authored s1283), not this slice's. `auto_pan`'s panel *row* remains inert until that same re-land supplies `game.panAt` (F-1280-1 ⑶).
