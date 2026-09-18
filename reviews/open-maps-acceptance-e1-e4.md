# Drain review — `open-maps-acceptance-e1-e4`: a secure-wave instrument for Astra's six unfinished maps, two measured improvements landed, four maps held with their reasons, and the finding that a plain boot's strategy spread is larger than any map-data cure (attended drain, 2026-09-18)

**Slice/branch/tip:** `feat/open-maps-acceptance-e1-e4` @ `8dcbc51d4` — seven commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `3548b5757`; master `tasks/open-maps-acceptance-e1-e4.md`; the implementer's report and per-run JSONL transcripts: `artifacts/open-maps-acceptance-e1-e4/`. **Merged as** `e2969cb57` onto main `ba5ffb6a2` (`git merge --no-ff`, zero conflicts), floors re-recorded on the merged tree, era-6 pin #9 appended after them, landed by fast-forward at the hash the ledger row names.
**Owner words, verbatim:** 2026-09-15 "I think what Astra started is worth it" · 2026-09-18 "We have about 18 hours left and about 50% of the subscription - what can we do to use it?" · "nono go ahead and start more jobs".

## VERDICT: LANDED for what it proved — the instrument, the Hill Mine's cadence, the Long Road's way-station seams; nothing is called "accepted" that was not

## 1. What the implementer measured (`e2e/playability-secure.spec.ts`: a plain boot, `?timescale=4`, no debug seam, a plain strategy from the card's own verbs; the question: secure wave → secure → bank → reload → return)
| map | secure wave | BEFORE on main (desktop) | AFTER | landed |
|---|---|---|---|---|
| e1-dry-gulch | 20 | **secured** wave 20 / 600.1 s, 175 HP | secured once more (84 HP), then 0 of 6 in a 3 × 2 run (waves 16–19) | nothing — no data change was needed or made |
| e1-twin-banks | 20 | dead wave 16 / 504.7 s | dead wave 17 with a fords cure | the cure (`spawnEdges` four → north/south) landed, measured (+1 wave, a harsher idle floor on 3 of 5 seeds) and **reverted** — it reds `e2e/e1-twin-banks.spec.ts:160`, outside the firewall; filed with its diff (F-OMA-4) |
| e1-night-shift | 25 | dead wave 15 / 460.0 s, no light | dead wave 16 carrying a lantern post | nothing in data — the card's own verb belongs in the instrument's strategy |
| e1-baron | 20 | dead wave **23** / 609.5 s — past the secure wave | dead wave 20 | **held**: `Game.waitsForBaronDefeat()` (`src/game/Game.ts:6361`, consumed at `:6268`) secures nothing while the Baron lives, and the card says so (F-OMA-2) |
| e2-hill-mine | 12 | dead wave **3** / 95.3 s, 0 buildings, 50 gold | **wave 9** / 379.2 s on the run that measured the cadence (one later run died in wave 1 — the spread is enormous) | `twist.waveCadenceMult` absent → **0.75**; E2 census pin re-pointed with cause |
| e4-long-road | 12 | dead wave 4 / 127.9 s, "seam … unreachable on foot", "could not fund turret (cost 50, purse 25)" | the funding note gone; still dead at wave 3–4 | `harvestAnchors` → two per way-station ground; the mask table re-published. **Held:** the win is gated by `MotorSocket.objectiveAllowsSecure` (`src/sim/MotorSocket.ts:258`, the convoy must reach (190, 0)) and the card's goals never name the errand (F-OMA-3) |

**No map is green three runs on both projects, and this review claims none.** The headline finding (F-OMA-1): the instrument's own strategy spread on UNCHANGED Dry Gulch data (secured at wave 20, then waves 16–19) is larger than any data cure measured — exposure, not spawn geometry, decides these runs. Astra's "native" acceptance runs carried a strategy; a plain-boot bar without one is noise for secure-wave maps. The instrument now declares its strategy, so the next pass measures against something.

**Floors** re-recorded twice on the branch and once on the merged tree: only the Hill Mine's two pairs move (`-01` 72,467 → 75,700 ms, waves 2 → 1; `-02` 82,267 → 56,700 ms), nothing secures with no orders; `--check` clean.

## 2. Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| tsc / `npm run build` | rc=0 / rc=0 | <TSC_BUILD> |
| the smoke for the six maps, both projects | 12/12 | — |
| task-025 + m1-01 + m2-01, both projects | 34/34 | — |
| `e3-mask-tables` / E2 + E4 censuses / skill.md render + guards | 30/30 / 8/8 / unchanged, 20/20 | mask tables 30/30 |
| adjacent map suites | 19 passed / 8 failed — all eight pre-existing by measurement twice (`e2-hill-mine.spec.ts:75/184/250`, `e4-roads-and-convoys.spec.ts:69` "malformed tape" `e4-dust-flats-floor.tape.json`) — F-OMA-5, inventory rows | — |
| null floors | `--check` 83/83, twice | <FLOORS> |
| engine era | hash reported | <PIN> |
| full `test:node-guards`, Node 26 | not run (the drainer's) | <BATTERY> |

## 3. Findings
- **F-OMA-1 (method):** a plain boot's strategy variance dominates on secure-wave maps; acceptance needs a declared strategy per map (the instrument now carries one) and several runs per arm — the same lesson as the host-speed gates.
- **F-OMA-2 (design, owner's eye, not blocking):** the Baron is a boss map: outliving wave 20 does not secure; a plain player must beat him. Is the bar "beat the Baron" (as the card says) or "reach wave 20 alive"? The card's word stands unless the owner says otherwise.
- **F-OMA-3 (card copy, fire-authorable):** the Long Road's win is gated by the convoy's arrival at (190, 0), and its `briefing.goals` never name that errand; a player who reads only the card cannot know how to win. Re-voice the goals to name the errand (one line, the census pin follows).
- **F-OMA-4 (held, one word):** the Twin Banks fords cure (two lane edges) buys one wave and needs `e1-twin-banks.spec.ts:160` re-pointed; the implementer's diff is in the report.
- **F-OMA-6 (drain cure):** `scripts/e4-roads-and-convoys.test.mjs` pins the Long Road's floor-policy run as a change detector (`fnv1a32:bf0c9c2c`); the two way-station anchors moved that run under the same waves and kills, and the idle row did not move; re-pointed to the measured `fnv1a32:a9b8b881` with the cause written in.
- **F-OMA-5 (pre-existing on main):** four adjacent-suite reds, two on the Hill Mine's own spec, attributed twice; inventory rows added at the drain.

## 4. What was touched
`e2e/playability-secure.spec.ts` (new, manual under `GR_PLAYABILITY_SECURE=1`), `assets/contracts/epoch-2-steamworks/contracts.json` (`e2-hill-mine` cadence), `assets/contracts/epoch-4-motor/contracts.json` (`e4-long-road` anchors) and its mask table, `e2e/er01-e2-census.spec.ts` (one pin with cause), `assets/contracts/null-floors.json` (re-recorded), `artifacts/open-maps-acceptance-e1-e4/**`; at the drain `assets/engine-era.json` (pin #9), `logs/suite-red-inventory.md` (F-OMA-5), this review, `tasks/goals.json`, `tasks/BACKLOG.md`.
