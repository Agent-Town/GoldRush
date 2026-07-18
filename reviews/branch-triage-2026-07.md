# THE BRANCH TRIAGE — 2026-07-18, attended (owner-commissioned)
Owner words: "I don't think we need to keep so many old branches… After they are merged successfully, why do we keep them?" + "that would be a good use… to merge them" → executed attended per his follow-up ("you could do it here directly while I am gone").

## Verdict summary
- Start: 55 origin refs → **End: 13** (main + 4 lane rails + 5 PARK + 3 HARVEST-pending).
- **DRAINED first (drains outrank triage): 6 branches** — lane/perf's undrained **CP-04 child-height lever** (6e8d2444, spec 24/24 both projects) · **sol/lm-alpha-mare-claim** Mare Claim E8 landmark bodies (186c53b8, PY-CLEAN, TSC-0) · **sol/mounts-sweep-regatta-glow-relay** 3D-D mounts sweep (6165bc15, PY-CLEAN, TSC-0) · the three **marketing asset branches** (gameplay ad reel + raws, ten-eras title film, X publication cut — finished mp4/webm renders, additive merges, zero conflicts).
- **DELETED: 43 refs**, every one safety-tagged locally (`archive-del/<branch>`, 43 tags) AND permanently preserved in the archived legacy GitHub repo (all predate the 2026-07-17 migration except the two drained today).
- **Legacy remote removed** (local stale remote-tracking of the archived repo; ~90 phantom refs gone from listings).

## DELETE verdicts (verified, not name-judged)
| Group | Refs | Evidence the value is on main |
|---|---|---|
| archive/* salvage (21) | 080-save-surfaces, demo-profiles-v1, enemy-pathing-wrecker, lane-m3-mobile-overlay, lane-m4-e9-redfields, lane-perf-orphan-s589, lane-perf-tp00, lane-polish-ts04, ledger-lane-perf, m3-pre-research-chart, m4-embodiment-voice-v1, m5-03-stat-sim-harness, m6-partial-salvage, m6-r3a-apply, perf-03, polish-03, sci-copy-clarity, sol-e3-power-integration-salvage, town-t6, trestle-lane-arsenal, w1-04-scatter | Salvage lifecycle paid out: profiles v2 shipped, StatSimHarness on main, reviews/m6-r3a-audit.md present, TP-00 substrate shipped, mask-tables/mounts/drip re-landed, overlay fix shipped, e9-redfields contract live, research chart v2, embodiment drained s61-era |
| editor family (5) | ed-02-terrain-brush-evidence, ed-04-gizmos, ed-05-palette, session-b-claims ×2 | src/editor/TerrainBrush.ts + DescriptorInspector.ts (palette/tint) on main; claims files were coordination bookkeeping |
| superseded art (5) | dredge-queen-3d (v1→v2 merged), hero-3d-proof, landmark-pack + hold/landmark-pack-3dc (A/B pair, bodies swapped in), town-blender-v3 (tavern shipped) | v2/current assets on main |
| features re-landed (4) | save/save-slots (src/game/SaveSlots.ts on main), save/lane-polish-pre-ts04, town-model-audit (zero src diff vs main — evidence pngs only), e3-power-prototype + e3-pg-02-integration (proposal docs on main at ed3f7ea1; dormant code spike superseded) | file-level probes |
| drained-today → 0-ahead (2) | lm-alpha-mare-claim, mounts-sweep-regatta-glow-relay | merged this session (owner policy: merged = delete) |
| marketing → 0-ahead (3) | gameplay-advert, ten-era-title-theme-film, x-content-pilot | merged this session (assets now in marketing/) |
| debris (3) | lane/polish (retired rail, 0 ahead), main--20260707-* (stray task branch, 0 ahead), — | fully merged |

## PARK verdicts (5 — each protected by a named milestone)
| Ref | Milestone | Contents |
|---|---|---|
| sol/mp-reconnect | co-op kickoff | 2,398 ins: reconnect replay boundary, exact-tick snapshot recovery (READY-FOR-GATES, parked on snapshot prereq) |
| sol/mp-arsenal | co-op kickoff | per-rider arsenals (parked on prereq merges) |
| save/mp-03-second-hero | co-op kickoff | 4,039 ins second-hero foundation |
| save/085-four-rider | co-op kickoff (owner design fork) | four-rider party gate |
| sol/release-gate | E2 Steamworks release | release-gate workflow + budget contract drafts (parked twice on scope) |

## HARVEST verdicts (3 — masters authored, refs kept until their harvest merges, then delete)
| Ref | Master | Why re-land not merge |
|---|---|---|
| sol/audit-correctives-2 | tasks/harvest-audit-correctives.md | 878 ins of F-SOL product fixes (difficulty selector, family cloud profiles, transfer budget, truthful deploy contract, story once-beats) — 7 days stale, needs per-finding verification against current main |
| sol/town-menu-audit-upgrades | tasks/harvest-town-menu-upgrades.md | 604 ins town/menu UX sharpening — town rebuilt (v3) since; selective re-land |
| sol/perf-chunk-atlas | tasks/harvest-perf-chunk-atlas.md | 1,113 ins startup-graph split + atlas character frames — perf still a law; re-validate wins on current bundle |

Re-land law (Mistake #15): stale + drifted = never blind-merge; read the old diff, re-apply the idea on fresh main, cite the salvage ref.
