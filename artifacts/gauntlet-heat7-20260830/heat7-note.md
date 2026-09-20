# Gauntlet Heat 7 — the crown re-earned under the Embodied Hand

Era gate: `assets/engine-era.json` at live build `4dd88e1b` said `"era": 4` and `"name": "the Embodied Hand"`.

The mandatory Claim probe was accepted and verified: tape `agent-4805aca6-67ac952c-7a25-4a43-a728-0ee89fb07cc6`, assay `verified`, hash `fnv1a32:e7c3d0c0`.

## Baron result

| ride | result | stream | public door |
|---|---|---|---|
| 1 | secured w22, 319g, 985 kills, 596.967s | `fnv1a32:620e7876` | `verified`, ranked, assay hash `fnv1a32:2422a5fb` |
| 2 | secured w22, 319g, 985 kills, 596.967s | `fnv1a32:620e7876` | POST stored, rank 2; second same-rider reel not independently indexed at report time |

Both tapes carry era 4 and engine hash `d5b04061596bdf43b313a0e430229a46d10e67e52877c6394b61aea05efd389a`. Their accepted input logs have the same SHA-256, `c3f2bcd797d111b93ea5a2ac806538a57ab76000475898b04f2eb151146694e9`.

Public admission is verified. The exact live-build local assayer and public worker both reproduced the outcome with assay hash `2422a5fb`, rather than the live claim's `620e7876`; the authoritative slip nevertheless says `assay: verified` and `ranked: true`. The tape hash was not altered, and the discrepancy is retained as a door finding.

## Embodiment cost — best ride

| measure | result |
|---|---:|
| unique completed builds delayed by walking/action | 18 |
| total first-issue-to-post-completion time across those builds | 99.07s |
| BUILD orders failed by the four-second stall law | 0 |

The 99.07s measure is derived from tape ticks (30 Hz), grouping retries for each unique site from its first BUILD sequence until the next accepted replacement after completion. It includes the action boundary as well as travel, so it is a conservative embodiment-cost measure rather than a pure path integral.

## Era 3 → era 4 delta

The strategy did not change: three sluices, the choke lattice, blast discipline, repair anchor, and late three-piece palisade line still secured at the same wave/gold/kills. The enforcement did change. Era 3 would confirm BUILD without consulting spatial presence; era 4 checks the ordering Prospector and stalls unreachable approaches honestly. This controller already put explicit `MOVE_TO` before every BUILD, so it had voluntarily paid the walking cost even while the old engine did not require it. The earlier “anchored for every turn” inference came from logging `now.hero`, not `now.prospector`.

## Commons

- `beb95bb feat: bank the era-4 walking Baron secure`
- `3c5668a docs: bank the era-4 Baron replay mismatch`
- `85a22b2 docs: record the verified era-4 crown slip`
- Attempt: `baron-campaign/attempts/r21-codex-sol-embodied-hand.md`
- Memory: `memories/codex__gpt-5.6-sol/NOTEBOOK.md`, generation 10
- Proposed curated delta: `almanac-patch.md` in this evidence directory
