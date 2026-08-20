# Review — A3 the broadcast mirror (`e7-echo-canyon` admitted)
**Slice/branch/tip:** `worktree-agent-ada3202c7f5b8074b`, base `1cb47bdca` (main @ 2026-08-20 18:05Z attended handoff). Built by a headless Opus-5 agent (owner directive 2026-08-20: remaining coding on Opus). **NOT yet drained — proposed for the attended drain.**

**Verdict: READY-FOR-GATES — GREEN on this tree.**

**What it does:** builds the ratified A3 mechanic (`specs/agent-play/door-completion-sheet.md:12`) as one consumer both engines construct, and admits `e7-echo-canyon` to the headless door on the back of it. Every playbook a player or agent USES is recorded; the next wave fields one corrupted `data_rustler` squad per use, capped at three per wave, +10% hp per repeat of the same tape. No playbook use, no mirrors. The contract declares no `secureWave` and no latch, so the mirror is pressure and neither engine's secure rule is touched.

---

## The mechanic, as built

| Piece | Where | Note |
|---|---|---|
| The consumer | `src/systems/BroadcastMirror.ts` (new) | private ctor + `create()` off the CONTRACT (never epoch, never id) + `none()` + refusal counters + presentation-stripped diagnostics. Refuses three ways: no `twist.broadcastMirror`; a `delay` it cannot honour (only `next-wave` is built); no `data_rustler` roster entry to be a copy OF. |
| The record | `Game.startPlaybookReplay` (last line of the success path) | Every browser replay entry point funnels here, so one call site covers the dev bridge, the named replay and the consent path. Identity is the canonical tape HASH, so renaming a habit does not launder its repeat count. RECORDING a tape is not a use. |
| The spawn seam | `WaveSystem` — one new optional ctor reader `mirrorSquadsForWave`, drained in `spawnDuePulses` when a new wave starts | Both engines seat it (`Game.ts`, `HeadlessContractSim.ts`) — the `capExemptCount` shape. Squads go through the ordinary `spawnAt`, so the alive cap still refuses and per-wave scaling still applies. Edges walk by squad index, not by an rng draw. |
| The shape | `shapeOfTape` | size 2–4 from action-bearing ticks · **wrecker** if the tape built works, **thief** otherwise · **faster** ×1.15 if ≥half its change-points moved · **hunt range 18** if it volleyed. |
| The rider surface | `now.broadcastMirror` (headless view) + `__THREE_GAME_DIAGNOSTICS__.broadcastMirror` | Present only where declared; carries pending shapes, repeats, lifetime counters and the ratified constants. No colours, no tape names. |
| The manifest | `broadcast_mirror` rule, sourced FROM the consumer | So a manifest row cannot promise a mechanic the run would refuse. |

**Two deliberate refusals, both written into the source.** (1) The sheet's parenthetical example — "a turret-volley playbook returns as a **ranged** squad" — is not expressible: no enemy in this engine carries a projectile, `SpawnPackOptions` has no ranged field, and `boltDamageMult` is bolt damage TAKEN (`CombatSystem.ts:891`), not dealt. Rather than stretch it (Mistake #14), a volley habit returns as a copy that **hunts** the rider from farther out, named for what it is. (2) A "the tape panned → thief" facet is left unbuilt: `data_rustler` is already `thief: true`, so the rule would produce a copy identical to the default and state nothing a rider could plan against.

**The honesty note (A4's shape, one mechanic over).** The SPAWN half is real and identical in both engines. The RECORD half cannot fire headless — `src/agent/StandingOrders.ts` declares no playbook verb (re-measured 2026-08-20) — so GR-SIM reads `recordedUses: 0` and fields nothing. That is the ratified rule, not a gap, and the day a playbook verb reaches the door the mirrors field there with no further edit. The end-to-end loop is proven where playbooks exist, in the browser.

---

## Evidence (real numbers, Node 26.4.0)

**Public-verb secure, ×2 per seed** — `artifacts/e7-echo-canyon/prover.mjs`, HARVEST/HOLD/BUILD/PICK_UPGRADE/SECURE_CHOICE only, no admission escape hatch, no balance edit. **The prover uses NO playbook and reports why:** the door has no playbook verb, so the proving runs cast no shadow and eat no mirror pressure.

| seed | run | secured | waves | kills | eventLogHash |
|---|---|---|---|---|---|
| e7-echo-canyon-01 | 1 | **true** | 20 | 914 | `fnv1a32:7d877de5` |
| e7-echo-canyon-01 | 2 | **true** | 20 | 914 | `fnv1a32:7d877de5` |
| e7-echo-canyon-02 | 1 | **true** | 20 | 910 | `fnv1a32:0a267a0b` |
| e7-echo-canyon-02 | 2 | **true** | 20 | 910 | `fnv1a32:0a267a0b` |

**Law 2 — idle must NOT secure**, ×2 per seed:

| seed | run | secured | waves | kills | eventLogHash |
|---|---|---|---|---|---|
| e7-echo-canyon-01 | 1 & 2 | **false** | 4 | 44 | `fnv1a32:1cf3c0e1` |
| e7-echo-canyon-02 | 1 & 2 | **false** | 4 | 40 | `fnv1a32:d80bdd95` |

Floors regenerated: **61 pairs, `--check` clean, 0 `secured:true`** across the whole artifact. The two new rows reproduce the artifacts' idle hashes exactly.

**Gates:**

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (`✓ built`, asset-diet ran) |
| Playwright, both projects, `--workers=1`, scratch port 5273 | **46/46** — `er01-e7-census` 8/8 · new `e7-echo-canyon-mirror` 4/4 · `ap16-4-contract-admission` · `task-025-bandits-dont-swim` · `m1-01-claim-jumpers-death` · `m2-01-build-menu`. Transcript `artifacts/e7-echo-canyon/gate-suites.txt`. |
| Plain boot, NO `?debug`, both viewports | **6/6**, zero console/page errors, screenshots `artifacts/e7-echo-canyon/boot-*.png` |
| `node scripts/null-floor-anchors.mjs --check` | 61/61 match, 0 secured:true |
| `npm run test:node-guards` | **460 pass / 7 fail** — all seven attributed, none of them this slice's; see below |

**The seven node-guard reds, in two classes, both proven not-mine.**

1. **Stale `STATUS.md` snapshot (2 reds).** `desk-declaration-guard.test.mjs` "the live board is green under this guard" refuses because line-1 of this worktree's `STATUS.md` is a handoff with no desk header; `fixture-teardown.test.mjs` re-spawns that same guard as a child and inherits it. `STATUS.md` is byte-identical to the base commit (`git status` clean for it — this slice never touches ledger files), and **the identical guard run against the parent repo's current main exits 0 / PASS** — the red is a 19-minute-stale snapshot, already cured upstream.
2. **The isolated worktree has no `node_modules` (5 reds).** `suite-red-inventory.test.mjs` ×4 and `worker-type-coverage.test.mjs` ×1 resolve a hardcoded `<root>/node_modules/...` path; Node walks UP to the parent repo for ordinary imports but not for literal paths, and this worktree carries no `node_modules` of its own. **Re-run with a `node_modules` symlink in place: 16/16 GREEN.** The symlink was then removed again so that no vite cache is shared with a live fire (Mistake #12 in reverse — do not contaminate someone else's gate).

**Same-game audit — pins moved, ATTRIBUTED by revert-and-reproduce.** 402→412 `agent-lacks`, 878→908 `equal`, 10→9 `not-offered`, 1290→1329 rows; exemptions unchanged at **6**, measurements unchanged at **10**. With the four anchors emptied in BOTH the contract and its published mask table, and every other line of this slice still in place, the audit reproduced **0/402/878/10 over 1290 rows with 6 exemptions, exactly**. So the entire movement belongs to the door admission and the consumer moves zero classifications — the expected shape: this audit's rows are buildable/ability/choice/verb/economy surfaces, `broadcast_mirror` is a mechanics RULE, and the mirror adds no verb (it is recorded from one that already existed). `docs/bench/same-game-audit.md` regenerated; `scripts/same-game-audit.test.mjs` pins updated to this tree's own regen output verbatim, with an ADMISSION MOVE block in the file's established style naming the base numbers.

---

## Merge classification

Base `1cb47bdca`; every file below is LANE-TOUCHED (this worktree is the only writer).

| file | change |
|---|---|
| `src/systems/BroadcastMirror.ts` | NEW — the consumer |
| `src/systems/WaveSystem.ts` | +1 optional ctor reader, +`spawnMirrorSquads`, +1 call line in `spawnDuePulses` |
| `src/game/Game.ts` | field + WaveSystem reader + one `noteUse` at the replay funnel + diagnostics row + run reset |
| `src/sim/HeadlessContractSim.ts` | field + WaveSystem reader + view row + diagnostics row |
| `src/agent/MechanicsManifest.ts` | `broadcast_mirror` rule sourced from the consumer |
| `src/vite-env.d.ts` | `broadcastMirror` diagnostics type |
| `assets/contracts/epoch-7-signal/contracts.json` | 4 `harvestAnchors` (the ONLY contract edit) |
| `assets/contracts/epoch-7-signal/mask-tables/e7-echo-canyon.json` | the same four, so the published mask keeps tracking the authored data |
| `assets/contracts/bench-seeds.json`, `public/skill.md`, `scripts/door-admission-baseline.json` | the admission surfaces |
| `assets/contracts/null-floors.json`, `docs/bench/same-game-audit.md`, `scripts/same-game-audit.test.mjs` | regenerated / re-pinned |
| `e2e/er01-e7-census.spec.ts` | per-id flip + the mirror's own census assertions |
| `e2e/e7-echo-canyon-mirror.spec.ts` | NEW — the browser proof + the Relay-Valley control |
| `playwright.a3-scratch.config.ts` | NEW — scratch port 5273 so this branch never touches 5188 or a lane port |
| `artifacts/e7-echo-canyon/*` | prover, battery, logs, summary, boot probe, screenshots, gate transcripts |
| `tasks/BACKLOG.md` | the ledger row |

⚠️ **Excluded deliberately:** `artifacts/056/*.png` churn from running `m2-01-build-menu` (F-1407-1 class) — untracked-in-spirit screenshot noise, not part of this slice.

---

## Findings

- **🔺 F-A3-1 (truth, non-blocking, fire-authorable — a TRIPLED debt now).** `e7-echo-canyon`'s `engineDependencies` still names `broadcast-mirror-consumer` as `missing` and asks for "the playbook broadcast-mirror, echo-band, and objective consumers". This slice built the one that is declared as a mechanic. The echo BANDS are `heightfield.mode: "visual"` — render-side by their own declaration, so there is nothing to socket — and the "objective" is `objectiveMetadata` prose with no `secureWave` and no latch, so building one would invent scope the data refuses. Not edited here: `tileParams.echoCanyonBands`/`broadcastMirrorZones`/`objectiveMetadata` and `twist.broadcastMirror` are all in `DECLARED_INERT_PATHS` (`ContractFamilies.ts:1580-1585`), which is what OBLIGES a non-empty dependency row at all (`:1714`), and that file is outside this firewall. **Same staleness as F-E7DB-1 (dead band) and F-E8LO-1 (low orbit) — cure all three in the one consolidated truth-pass master `tasks/BACKLOG.md:3` already owes.**
- **🔺 F-A3-2 (reach, MEASURED — and it clears half of a predecessor's finding).** Echo Canyon's board row is `unlock: "secured:e7-relay-valley"`, and the Relay Valley is admitted and playable, so unlike A4 and A7 this contract is reachable by a browser player TODAY — measured in the boot probe (locked → The Claim; a seeded Relay-Valley secure → Echo Canyon). **And it settles half of F-E7DB-2:** the Dead Band's row is `unlock: "secured:e7-echo-canyon"`, unreachable only because the canyon could not be played. That chain is now open at both links.
- **🔺 F-A3-3 (informational).** F-1642-1 (`tasks/BACKLOG.md:252`) lists `e7-echo-canyon` among the contracts carrying `harvestAnchors: []`. True when measured, false as of this slice; a dated snapshot, left unedited.
- **ⓘ F-E7DB-3 re-confirmed, not re-filed.** `now.seams` carries seam ids but no coordinates while `HarvestSystem` re-places `gold-seam-N` at a shuffled anchor on every respawn, so a rider can name a seam but never aim at one. This prover works around it the same way the Dead Band's did — it pans whichever seam is live.
