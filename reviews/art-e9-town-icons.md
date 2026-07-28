# Review — `art-e9-town-icons` (attempt 2)

**Slice:** THE E9 TOWNSFOLK — 4 fresh portraits + 1 identity-preserving Moon-Born-Child aging edit + a five-up contact sheet.
**Runner commit:** `f88ded97` (`runner(art): art-e9-town-icons.md`, 2026-07-28T13:56:17+07:00) — the ART slot commits straight to main.
**Run report:** `tasks/runs/20260728-125817-art-e9-town-icons.md`
**Predecessor:** attempt 1 → `stopped-lawful-s1166-band-unreachable-in-5-attempts` (F-1166-2/F-1166-3).
**Drained by:** s1169 fire, 2026-07-28.

## Verdict

**ACCEPT** — with one non-blocking content finding (F-1169-5) that belongs to the owner and to the *next* art master, not to this batch.

Every criterion the master actually set is met, and **I re-measured all of them on an independent instrument rather than reading the report's table.** §3.0 `drain-block-check`: **✅ CLEAR** (`e9-art-town-icons`, status `queued`), run as the first command.

Attempt 1's diagnosis is vindicated: s1166 raised the cap 5→10 and made the neutral-backdrop clause binding, and the canal reeve — the role that parked after five misses — landed on **attempt 2**.

## Evidence — re-derived, not accepted

Instrument: `logs/session-scratch/s1169-art-verify.mjs`, written from the definition in the master (mean `R−B` over the top-left and top-right 60×60 corners), decoding via `sharp`. It shares no code with the runner's instrument.

**Instrument control FIRST** (the six pinned E1 portraits) — because a verdict from an unvalidated instrument is worthless:

| E1 control | my mean | report's pinned | Δ |
|---|---:|---:|---:|
| `tf-assay-clerk` | 137.82 | 137.82 | 0.004 |
| `tf-elder-rowan` | 133.95 | 133.95 | 0.001 |
| `tf-mei` | 105.34 | 105.34 | 0.001 |
| `tf-preacher` | 124.50 | 124.50 | 0.002 |
| `tf-schoolteacher` | 140.41 | 140.41 | 0.001 |
| `tf-storekeeper` | 143.86 | 143.86 | 0.003 |

**CONTROL PASS** — all six reproduce within 0.004, and exactly one (`tf-mei`) flags below the 120 floor, which is the known pinned answer.

**Subjects** — all five delivered portraits, measured by me:

| file | dims | TL | TR | mean | report | Δ | band 124–145 | floor 120 | sha256 == native source |
|---|---|---:|---:|---:|---:|---:|---|---|---|
| `tf-canal-reeve-e9.png` | 1254×1254 RGB/3 | 133.55 | 135.88 | **134.72** | 134.72 | 0.005 | ✓ | ✓ | **✓** |
| `tf-ice-quarry-chief-e9.png` | 1254×1254 RGB/3 | 137.17 | 142.22 | **139.69** | 139.69 | 0.002 | ✓ | ✓ | **✓** |
| `tf-greenkeeper-e9.png` | 1254×1254 RGB/3 | 130.53 | 130.24 | **130.38** | 130.38 | 0.004 | ✓ | ✓ | **✓** |
| `tf-weather-warden-e9.png` | 1254×1254 RGB/3 | 138.28 | 136.00 | **137.14** | 137.14 | 0.002 | ✓ | ✓ | **✓** |
| `tf-moon-born-child-e9.png` | 1254×1254 RGB/3 | 142.44 | 141.68 | **142.06** | 142.06 | 0.003 | ✓ | ✓ | **✓** |

The three checks s1167 and s1168 specifically ordered for this batch:

1. **Provenance by HASH, not by the run's sentence.** I recomputed sha256 of each delivered file and compared it to the *native source* hash the report names. **All five byte-identical.** That is a proof of "no post-processing" that no prose can substitute for — no resize, crop, format round-trip, key, channel multiply, curve, level or tone operation survives a hash match.
2. **Did any portrait clear 145 and get RETAKEN rather than corrected downward?** **None cleared 145** (max 142.06). The report lists every discard with its number, including two below-band greenkeeper attempts (123.09) and a below-band child attempt (123.34) — **discarded natively, not lifted by arithmetic.** The E8 calibration crime is not repeated; run in reverse it would have been equally fatal.
3. **Pairing matrix under a SECOND kernel** (a bare 0.00 under the construction kernel is tautological). The report gives Lanczos3 (true pairings 0.00, wrong-pair controls 26.63–33.09) **and** an independent `nearest` re-slice. Two kernels, true pairings separating cleanly from controls.

**Firewall verified at source, not accepted from the report:** `git show --stat f88ded97` is **6 pure additions** under `assets/` (5 raws + 1 contact sheet, every one `Bin 0 → N`), plus `LEDGER.md +1`, the 120px review strip, and the run report. **Zero of the 22 prior portraits were modified**, and the E8 edit source `tf-moon-born-child-e8.png` is untouched.

**Reference tier — extraction correctly WITHHELD.** Consumer probe `grep -rn "tf-" src/` returns exactly one hit and it is `'utf-8'` in `src/charter/CharterShare.ts:43`. No consumer references these files, so there is no contract to wire, **no gazette item, and no deploy** — nothing player-visible moved.

**Canon (brief §9) — checked on the image, not on the prompt.** No firearms: the weather warden's instrument is a compact open vane-ring with rounded cups — **no barrel, bore, long axis, aim pose, mount or sight** — which was this batch's named canon-risk atom, and it holds. No letters or numerals anywhere (the canal reeve is the letters trap: her office is records, and she carries keys, not a ledger). Illustrated, warm, not gory. No peoples depicted as enemies. Neutral aged-parchment ground on all five — F-1166-3's binding backdrop clause did its job; there is no red sky and no environmental spill.

**LEDGER row 65** was written by the runner and its numbers match mine exactly.

## Findings

- 🔺 **F-1169-5 (NON-BLOCKING, OWNER'S DESK — a content-quality gap the numeric contract cannot express).** **Four of the five faces read as one woman.** The canal reeve, ice quarry chief, greenkeeper and weather warden share an apparent age, a dark curly updo, the same three-quarter head angle, the same warm half-smile, and the same rust-red jacket palette; at 120px they are told apart **entirely by prop** (gauge keys / ice chip / seedling / vane-ring), not by face. The grown moon-born child is genuinely distinct — younger, different bun, broader smile — and correctly identity-linked to her E8 self, so the *edit* half of this batch is a clear success. ⚠️ **This is not a firewall breach and not a missed gate:** the master asked for "new woman" and "clearly different apprentice" in prose, and **every measured criterion this pipeline owns — warmth band, corner floor, magenta purity, provenance, pairing, canon — is silent on facial variety.** The engraved-sepia style anchor actively pushes toward homogeneity. ➡️ **Recommendation (owner call, and I deliberately did not act on it): add a distinctness criterion to the next town-icons master** — e.g. require each fresh portrait to differ from its batch siblings *and* from the shipped roster on at least two of {apparent age, hair silhouette, head angle, build}, self-reported per role. ⛔ **I did NOT reject on this**, and the reason is Mistake #14 run backwards: inventing a rejection criterion mid-drain, against art that met every stated bar, would be as wrong as stretching a contract to accept something. Generator proposes, contract disposes — **and the contract's silence here is the finding.** Nothing player-facing ships from this batch today (extraction withheld), so the cost of deciding this later is zero.
- 🔻 **F-1169-6 (non-blocking, recorded — 5th instance).** `f88ded97` again swept `logs/.goal-tree.html`, `logs/dashboard.html` and `logs/task-stats.jsonl` into an art commit (**F-1162-1**). The fix has been inert **>7 h** across five instances because **it needs a lane-runner restart, which a fire cannot perform.** Still on the owner's desk. Side effect worth noting for the next fire: this is why the three churn files that four consecutive fires left dirty are now clean — the runner committed them, it did not resolve them.
- ⓘ **Non-finding, recorded so it is not re-litigated:** the greenkeeper's `#50674c` conditioning did not retain an exact pixel; the selected attempt sits **2.45 RGB-distance** from the swatch, which is *tighter* than the shipped E9 terrain precedent's 7.87 at row 52. Accepted on the precedent, and no local colour correction was applied to reach it.

## Art staging audit (ART-SLOT LAW — I touched the slot, so both buckets are reported)

`node scripts/art-staging-audit.mjs`:
- **AT RISK (in no object database — dies with this disk): 748 files, 566.47 MB.** Unchanged; this is the standing owner item **F-1120-2**, concentrated in `worktrees/art/assets/motion-pilot` (735 files, 556.96 MB). **Not created by this batch.**
- **LOCAL-ONLY (in git here, on no origin ref — one push from safe): 0 files, 0 KB.** Nothing owed.
- ✅ **This batch's own bytes are NOT at risk:** the runner committed all six deliverables to main in `f88ded97`, so the E9 raws never entered the untracked hole that F-1045-1 named.
