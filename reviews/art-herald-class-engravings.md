# art-herald-class-engravings — the ongoing Herald's reusable class engravings (GG-03d)

- **Slice:** GG-03d, `tasks/art-herald-class-engravings.md` (owner-authored, `2370f8bf` 2026-07-30)
- **Slot:** ART. Codex `image_gen`, native run `019fb103-5aac-7b02-83e6-3845851b9213`
- **Bytes landed in:** `b00194fa` — **the art runner's own commit**, not a fire's (see the contamination note)
- **Drained by:** s1255 fire, 2026-07-30
- **Goal leaf:** `gg-03d-herald-class-engravings`

## VERDICT: ACCEPTED — verification and bookkeeping only; there was no merge to perform.

All eight plates were already on main. This drain is the *ceremony*, and the ceremony turned
out to be **smaller than the inherited note claimed** — see the next section, which is the
most important thing on this page.

## ⚠️ The inherited "what is owed" list was wrong, and the master says so

`tasks/goals.json`'s `note_s1254` recorded that this batch still owed **"extract-alpha,
contract wiring, in-game review, LEDGER, review file."** Three of those five are **forbidden
by the master's own firewall**, which reads verbatim:

> FIREWALL: generate + save only; wiring is the heraldReader class-map (separate small lane slice after this batch).

So extraction, contract wiring and in-game review are **out of scope**, and a drain that
performed them would have exceeded the firewall — exactly the GG-02 precedent, where the
s1205 drain recorded *"EXTRACTION AND WIRING CORRECTLY WITHHELD — reference tier, full-bleed,
no `#ff00ff` key."* The same three facts hold here:

1. The master specifies **full-bleed** plates, and the run note confirms **opaque RGB** —
   there is no `#ff00ff` key, so `extract-alpha` has nothing to key on. The tool does not
   merely go unused; it is inapplicable.
2. The LEDGER row written with the batch already says so itself: **"n/a full-bleed raw
   engravings; no extraction"** and **"PENDING-INTEGRATION; `heraldReader` class-map is a
   separate lane slice."**
3. The run note's own Firewall section: *"Generation and raw save only. The `heraldReader`
   class-map is a separate small lane slice and remains untouched."*

**What was actually owed, and is now done:** provenance verification, independent canon
review, LEDGER/run-file confirmation, the ART-SLOT LAW audit, this review file, and the goal
leaf. The note was written in good faith by a fire that never opened the master — a small,
cheap instance of Mistake #4 (inherit vs verify), and it would have cost the next fire a
firewall violation dressed as diligence.

## Evidence

### Provenance — verified by BLOB HASH, not by name (F-1054-1's lesson)

All eight files: disk blob == `HEAD:` blob.

| file | bytes | blob (disk == main) |
|---|---:|---|
| `assets/raw/gazette-class-board.png` | 4,109,113 | `931a74e8fbeb` |
| `assets/raw/gazette-class-trail.png` | 4,749,143 | `d474ccff4fb8` |
| `assets/raw/gazette-class-river.png` | 4,611,546 | `d80c2eb4ab1c` |
| `assets/raw/gazette-class-science.png` | 4,084,259 | `5470b38c732d` |
| `assets/raw/gazette-class-ledger.png` | 4,574,761 | `c9bc294368f9` |
| `assets/raw/gazette-class-threat.png` | 4,625,463 | `e8ba8e142462` |
| `assets/raw/gazette-class-growth.png` | 4,615,949 | `57068a102105` |
| `assets/raw/gazette-class-ceremony.png` | 4,049,458 | `b8bb6bcaeeef` |

**The run note's own SHA-256 table was re-derived, not trusted: 8/8 MATCH.** A report's
statistics get re-measured before its conclusions are honoured.

### Canon — I OPENED THE PLATES rather than inheriting the run note's QA claim

House precedent (LEDGER rows 48–54, and the s1205 GG-02 drain). Three plates reviewed at
full resolution, chosen as the batch's risk atoms:

- **`gazette-class-threat.png` — the ADR-001 atom. PASS.** A dust wall rolling over a dark
  ridge at dusk; foreground trail **empty**; two brass-and-teal beacon lanterns. **No
  attacker, no weapon of any kind, no firearm silhouette, no gore, no injury, and no people
  depicted as a threat.** The menace is weather and distance. Flags are blank cloth.
- **`gazette-class-growth.png` — the "people" atom. PASS.** Neighbours hauling a rope over a
  pulley to raise a timber frame, a brass agent steadying the post. Cooperative and warm;
  no weapon, no gore, nobody is a villain.
- **`gazette-class-board.png` — the "no letters or numerals" atom, and the likeliest
  violator (a claim board of pinned paper). PASS.** Every pinned sheet is **blank**; the only
  marks are pictograms (mountains, pines, a river course, a zigzag) and wax seals bearing
  pictogram devices. No text, no digits.

All three hold the style anchor: engraved sepia on parchment, fine crosshatching, restrained
agent-tech teal, illustrated and never photoreal.

### ART-SLOT LAW (`fire.md` §2E) — BOTH buckets, measured this fire, not cited

`node scripts/art-staging-audit.mjs`, 4 areas, 972 files:

| bucket | count | size |
|---|---:|---:|
| **AT RISK** (in no object database — dies with this disk) | **748 files** | **566.47 MB** |
| **LOCAL-ONLY** (in git here, on no origin ref) | **0 files** | **0 KB** |
| SALVAGED | 6 | — |
| DIVERGED | 21 | — |
| SHIPPED (blob-identical to main) | 197 | — |

**LOCAL-ONLY has gone 19 files / 67.79 MB → 0.** s1253 measured those 19 as owing a push and
s1254 cited the figure unchanged; s1254's backup push (`be9d9457..d93d1619`) evidently cleared
them. Worth stating because it is the one bucket a fire can actually discharge on its own.

**AT RISK is unchanged at 748 / 566.47 MB and is NOT this batch's doing** — these eight
plates are all on main. It is the standing F-1120-2 hole (`worktrees/art/` is not a git
worktree, so its output is untracked by default), owner-gated on F-1193-2 / F-1242-1.

### The batch's own commit is contaminated — F-1253-3, confirmed

`b00194fa` is titled for this art task but was made with a **repo-root broad `add`**, so
besides these 8 plates and the run note it also swallowed the entire s1253 fire (guard
scripts, `package.json`, session scratch, regenerated `artifacts/asset-diet/*.png`). That is
why this review classifies **per file** and cites blob hashes rather than the commit: the
commit is not a description of this batch. Nothing was lost, and history rewriting is
forbidden (§7.7), so the ledger is the pointer. **The fix is the class, not the instance:
path-scope the art runner's commit step — still open on the owner's desk.**

## Duties

- **LEDGER:** row already present at `assets/LEDGER.md:224` (`herald.class_engravings`),
  landed with the batch, and it correctly records `PENDING-INTEGRATION` and `no extraction`.
- **Run file:** `assets/raw/codex-art-run-art-herald-class-engravings.md` — present, with a
  measured self-QA table, the verbatim anchor, all 8 prompts, and 0 retakes.
- **GZ-01 — NO news item, and the reason is the house rule, not laziness.** These plates are
  unwired (`PENDING-INTEGRATION`), so **no player can see them in a plain boot**; the standing
  rule for reference-tier batches is "unwired → no gazette" (stated explicitly at LEDGER rows
  48–54, and applied by the s1205 GG-02 drain). This set earns its item when the `heraldReader`
  class-map slice ships.

## Findings

- **F-1255-4 (non-blocking, for the wiring slice).** The brass agent in
  `gazette-class-growth.png` is drawn as a **rotund, moustachioed brass figure in a bow tie** —
  characterful and canon-safe, but noticeably a *character design decision* made inside an art
  batch whose firewall was "generate and save". The class-map slice will caption this plate
  beside player-facing copy about what the **Prospector** does, so it wants an owner eyeball
  for consistency with the established Prospector (ADR-003). Same shape as F-1205-7, which
  flagged a human arm where the Prospector's brass one was expected.
- **F-1255-5 (bookkeeping, discharged here).** `tasks/goals.json`'s `note_s1254` listed three
  firewall-forbidden acts as "owed" for this batch (above). Corrected in the leaf in this
  drain's commit. **Durable half: a pre-classification written by a fire that has not read the
  master is a hypothesis, and the master's FIREWALL is the cheapest place to check it** — one
  `Read` would have caught it, and the note was persuasive enough to have been acted on.
