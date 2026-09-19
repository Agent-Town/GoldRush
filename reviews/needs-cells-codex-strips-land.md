# Drain review — `needs-cells-codex-strips-land`: the Codex strips processed and wired — six Claim Jumper facings landed at the live band, the Steam Wrecker's south-east parked for its heading, the dormant slot's wake measured to an owner question (attended drain, 2026-09-19)

**Slice/branch/tip:** `art/needs-cells-codex-strips-land` @ `e0f7b8ae1` — commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `de7eacd17`; master `tasks/needs-cells-codex-strips-land.md`; report `artifacts/needs-cells-codex-strips/land-report.md`. **Merged as** `899826209` onto main, null floors re-recorded on the merged tree, era-6 pin #12 appended (`assets/layer-contracts` is in the engine corpus), landed by fast-forward.
**Owner words, verbatim:** 2026-09-18 "Yes, please use Codex to generate these strips." · 2026-09-19 "Anthropic was reset already".

## VERDICT: LANDED — six of seven rows landed and wired at the family's live band; the Steam Wrecker's south-east parks a fourth time, now for a measured reason (it faces south-west); the Claim Jumper's wake is one cosmetic owner word

## 1. The seven rows (extracted from the NATIVE 1,254² Codex renders, not the 1,024² self-parked copies; per-row scale to the live band)
| row | scale | heights px | band | flip-compare | verdict |
|---|---|---|---|---|---|
| Steam Wrecker `se` | 0.8881 | 240 / 234 / 244 / 252 @512 (spread 18) | 228–252 | 4/4 distinct | **PARKED** — heading (F-NCS-4); lamp lit 162 / 168 / 147 / 153 px, the first time all four held |
| Claim Jumper `s` | 0.3852 | 164 / 160 / 166 / 172 @256 | 156–176 | 4/4 | LANDED + WIRED |
| `e` | 0.4368 | 166 / 164 / 166 / 166 | 156–176 | 4/4 | LANDED + WIRED |
| `se` | 0.4249 | 164 / 158 / 162 / 176 | 156–176 | 4/4 | LANDED + WIRED |
| `sw` | 0.4223 | 166 / 160 / 168 / 170 | 156–176 | 4/4 | LANDED + WIRED |
| `ne` | 0.4197 | 166 / 162 / 168 / 168 | 156–176 | 4/4 | LANDED + WIRED |
| `nw` | 0.4110 | 164 / 159 / 166 / 170 | 156–176 | 4/4 | LANDED + WIRED |
`char.claim_jumper.walk4` now names real cells for all eight headings (its north and west from the 2026-09-18 batch); the sheet-b out-of-band rows are gone.

## 2. Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| tsc / build / `GR_RELEASE=e1` | 0 / 0 / 0 | 0 / 0 / 0 on Node 26 (merged tree) |
| first-town payload | 34,644,278 B of 52,000,000 | 34,645,358 B of 52,000,000 (the Claim Jumper is first-town) |
| halo guard | PASS 379 / 0 / 696 / **2,127** (re-pinned; F-NCS-2) | PASS 379 / 0 / 696 / 2,127 on the merged tree |
| `character-direction-assets`, the sprite review scripts | 2/2 · hero-clip-groups, review-sprite-idle green; review-enemy-sprites rc=1 reproduced on a base control (the hero never leaves frameKey pending) | — |
| e2e (`e2-enemies`, `e1-baron`, `eight-winds-enemies`, `e2-hill-mine`), plain boots | 17 fail / 32 pass / 3 skip vs a base-tree control 16 / 33 / 3 — identical sets but e1-baron mobile :489, green on a re-run (a known timeout row); plain boots 0/0 at both viewports on all three maps | reused |
| null floors | — | re-recorded on the merged tree: 83 of 83 unchanged (318.5 s, check 293.4 s) |
| engine era | `cc3fd5d4…` → `674fdcea…` reported; the pin is the drain's | pin #12 `e7cbf090…`, guards 9/9 |
| full `test:node-guards` | three rows, one cause: the drain's pin (bench-seeds, engine-era-guard and the sweep's echo); power-budget 0.356/0.381/0.369 ms PASS alone | 929 tests: 927 pass / 1 fail / 5 skipped — the contention advisory only (a foreign battery ran beside it); no signal death, no TAP stall; `character-direction-assets` rc=1 in the gate script is the drain's own typo (no such npm script; the guard runs inside the battery and passed) |

## 3. Findings
- **F-NCS-1 (measurement, corrects s2627):** the fire's 2026-09-18 landing scaled five jumper rows to `char-jumper-sheet-walk4-b` rows 0 and 2 (146–156 px), rows the same day's Higgsfield batch had already replaced with `north4-v1`/`west4-v1`; the live band is 156–176 @256 and the six rows now sit in it.
- **F-NCS-2 (cured, was red on clean main for a day):** the halo guard's PNG denominator stayed at 2,103 while s2627 landed twenty cells (2,123); every battery since carried the red. Re-pinned to 2,127 with both terms named.
- **F-NCS-3 (dissolved):** the scale blocker the fire recorded (F-2627-1, ×1.079 upscale) never existed — the native 1,254² render extracts in band at 0.888.
- **F-NCS-4 (parked, owner's desk F-2627-1 rewritten):** both Codex takes turn the Steam Wrecker the wrong way: the lamp-offset instrument (LEDGER row 65's porthole, extended from "lit" to "where") reads the candidate as the landed `sw`'s heading, and eyes-on agrees (lamp, teal panel and near wrench all on the `sw` side). A true south-east needs a regeneration with the heading pinned in the prompt (Codex, one sheet).
- **F-NCS-5 / item 4 (parked with the diff, owner's desk NEW):** nothing draws `char.claim_jumper` because `82543f273` (2026-07-12, "wire-e1-bandit-variants") swapped six construction sites in `pools.ts` from the jumper slot to `charBanditBase`/`charBanditThief`; the base enemy family is the Claim Jumper by name, type and lore, only its texture source moved. Waking it changes which body the player fights in every E1 map (plus the replay reel's `LanternWorldStage` map) — cosmetic, reversible, an owner word.
- **F-NCS-6 (a second gate to the wake):** `SpriteAnimator.pickWalkSheet` prefers `walk8` when it is enabled and its cells exist, and `char.claim_jumper.walk8` is ACTIVE with all 32 production cells — so repointing the body alone would draw the walk8 sheet whose diagonals alias to the side rows; the wake needs `walk8` disabled (or its diagonals re-cut) in the same word.
- **Reds attributed by the implementer:** e2e 17 fail / 32 pass / 3 skip against a base-tree control 16 / 33 / 3 — identical sets except `e1-baron` mobile :489, green on a re-run (a known timeout row); `review-enemy-sprites.mjs` rc=1 reproduced on the base control (the hero never leaves `frameKey: pending`); `test:power-budget` 0.672 ms contended, 0.356/0.381/0.369 ms PASS alone; the three battery rows on the branch were the drain's pin (cleared here).

## 4. What was touched
`assets/raw/` (the seven native renders under their final names), `assets/processed/**` (28 new cells + sidecars), `assets/layer-contracts/characters.v2.json`, `src/assets/{slots,generated}.ts`, `character-runtime-frames.json`, `scripts/halo-reextraction-check.mjs` (declarations + pin 2,127), `assets/LEDGER.md` (the batch row; the wrecker's parked line rewritten), `artifacts/needs-cells-codex-strips/**`; at the drain `assets/engine-era.json` (pin #12), the null-floor anchors, this review, `tasks/goals.json` (two leaves), `tasks/BACKLOG.md`, `STATUS.md`, the desk register.
