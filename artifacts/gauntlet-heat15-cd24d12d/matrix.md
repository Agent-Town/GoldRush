# Heat 15 — the Regatta's heat — matrix (updated after EVERY ride)

Operator: an attended-hosted Claude agent (Opus, the owner's Anthropic subscription), hosting from a
DETACHED arena at the DEPLOYED build `cd24d12d2` (`https://agenttown.app/goldrush/version.json`,
2026-09-22T03:08:14Z), which descends from the gangway landing `df5261526`. Rig: Claude Opus 5
(`claude-opus-5`) via Claude Code CLI **2.1.272**, headless `claude -p`, ONE rider at a time under
`nice -n 5` (a Codex lane task shares this host). Charters are delivered on STDIN (F-HEAT14-2);
this heat's charter opens at 1,107,620 B, past the host's 1,048,576 B ARG_MAX, so stdin is now the
only lawful transport, not merely the cheaper one.

ONE BOARD, THREE RIDES: `e5-regatta`, bench seed `e5-regatta-01`, identical stake and wall on all
three. Ride 1 is the heat's row; rides 2 and 3 measure variance. The rides are NOT independent
samples — the rig's self-memory law appends each landed ride to the notebook the next charter
carries, so ride 2 reads ride 1's lessons and ride 3 reads both (F-HEAT15-4).

| # | contract | seed | stake | gen | outcome | waves | gold | timeAlive | wall | tape / eventLogHash | door verdict | notebook |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | e5-regatta<br>`r1` | `e5-regatta-01` | map-rebuilt | 134 | **SECURED** | 12 | 0 | 272s | 1114s | `attempt-1-tape.json` · `agent-cce8d603-90fa4316-29bb-4db7-ae4c-f310682d2f1f`<br>fnv1a32:d7eb1903 | verified `fnv1a32:f3a9c00c` | gen 134<br>slip `agent-cce8d603-90fa4316-29bb-4db7-ae4c-f310682d2f1f` |
| 2 | e5-regatta<br>`r2` | `e5-regatta-01` | map-rebuilt | 135 | **SECURED** | 12 | 200 | 272s | 685s | `attempt-1-tape.json` · `agent-ae781bc1-722225b2-0bc4-4766-8655-01e3a8380133`<br>fnv1a32:136a45a0 | verified `fnv1a32:b92da1bf` | gen 135<br>slip `agent-ae781bc1-722225b2-0bc4-4766-8655-01e3a8380133` |
| 3 | e5-regatta<br>`r3` | `e5-regatta-01` | map-rebuilt | 136 | **SECURED** | 12 | 200 | 272s | 1125s | `attempt-1-tape.json` · `agent-de3fcdf5-5ada3c41-51a4-4e6c-98be-3421199f0b4b`<br>fnv1a32:86d55c20 | ⚠ not submitted | gen 136 |

**Ridden 3 · secured 3 · not secured 0 · never ridden 0.** Reels accepted by the door 2, refused 1
(ride 3, `reel_not_current` on the engine pin — F-HEAT15-1, a concurrent lane task moved a symlinked
`ENGINE_SOURCE_INPUTS` path mid-heat). Rows gained on the county board: **0** — both accepted reels
were assayed and VERIFIED and neither was promoted, because this rider's own heat-14 row ties or
beats them (F-HEAT15-4). Receipts delta 30 → 30 verified, 56 → 56 retired.

Every ride boarded the boat and finished the course; the five beacons fell in order on all three,
within 0.40 s of each other. No rider was ever refused `NOT_ABOARD`; `UNREACHABLE_WATER` was answered
once, provoked deliberately by gen 136 after its race was over. Nobody disembarked; nothing forfeited.
