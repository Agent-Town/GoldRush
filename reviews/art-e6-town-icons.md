# art-e6-town-icons — drain review (s1154 fire)

- **Slice:** `art-e6-town-icons` (E6 townsfolk portraits, reference-tier, portraits-only split)
- **Slot:** ART · **Master:** `tasks/art-e6-town-icons.md` (authored s1153, `4f1bd815`)
- **Runner commit:** `c7601082` "runner(art): art-e6-town-icons.md" — **committed directly onto `main`**, see F-1154-1
- **Run log:** `tasks/runs/20260728-052657-art-art-e6-town-icons.md.log` (292,724 tokens, READY-FOR-GATES)
- **Goal leaf:** `e6-art-town-icons` · **§3.0 `drain-block-check`: ✅ CLEAR** (run as the first command of the drain)
- **Screenshots:** `reviews/shots-art-e6-town-icons/e6-portraits-120px-strip.png`

## VERDICT: **PASS — merged (already on main at `c7601082`)**, with three non-blocking findings (F-1154-1/-2/-3).

The art itself is good and the firewall held completely. Every number below was **re-measured by this
fire**, not copied from the runner's report; where the runner's figure and mine differ, the difference
is explained and controlled rather than waved through.

## What it does

Six E6 townsfolk portraits — Reactor Steward, Kitchen Chemist, Appliance Wrangler, Diner Carhop,
Combine Defector, Depot Clerk — plus a six-up contact sheet, all in the engraved-sepia plate hand
pinned by `assets/LEDGER.md` row 60. Reference tier: full-bleed, no `#ff00ff` key, **no extraction,
no `assets/processed/`, no consumer wired**. The Depot Clerk is an identity-preserving *aging edit*
of `tf-assay-clerk` (consistency law), not a fresh generation. `icons-e6.png` stayed out of scope,
exactly as the master's split required.

## Evidence — measured this fire

| Criterion (master §self-check) | Bar | Measured by s1154 | |
|---|---|---|---|
| Deliverables present | 7 | 7 (6 portraits + sheet) | ✅ |
| Canvas / channels | 1254×1254 RGB, no alpha | all 7 `1254×1254`, `alphaCh=false`, **transparent px = 0** | ✅ |
| Full-bleed, NO key | zero `#ff00ff` | **0 exact-magenta, 0 near-magenta px** on all 7 | ✅ |
| Reads at ~120px | distinct at 120px | **actually downscaled all six to 120px and viewed** (strip committed) — cap+lens / raised hood+spoons / brim+copper coil / cap+sundae tray / teal suit+slab / spectacles+gray all separate cleanly | ✅ |
| Ground warmth R−B | inside 130–145 | **TL60: 143.6 / 143.3 / 131.6 / 144.2 / 142.8 / 131.9** — all in band | ✅ |
| — same guard, opposite corner | (unspecified by the bar) | **TR60: 145.1 / 141.1 / 117.7 / 135.9 / 136.8 / 133.7** — Appliance Wrangler **117.7, below band** | ⚠️ F-1154-2 |
| Contact sheet content | six raws, correct order | all 6 cells match **their own** raw at **MAE 3.2–4.2**; positive control shows a wrong pairing scores **45–60** | ✅ |
| Depot Clerk identity | holds Assay Clerk | viewed side-by-side full size: same round spectacles, moustache + soul-patch, hair part/wave, head angle, three-quarter framing; ages via gray temples/moustache + brow lines; **exactly one chrome element** (pneumatic parcel capsule on the strap) | ✅ |
| Canon §9 | no letters / firearms / gore | verified visually at full size **and** 120px: **the Defector's catalog is blank with blind-embossed holes only — the canon rider held.** No type anywhere, no firearms, no gore | ✅ |
| Firewall — E1 sources | byte-intact | all six `tf-*.png` **blob-identical** across `c7601082` (`git rev-parse` before/after) | ✅ |
| Firewall — code | no `src/e2e/scripts/public` | **0 files** in the commit | ✅ |
| Firewall — tier | no processed/keyed output | **no `assets/processed/`, no `icons-e6`, no `generated.ts`, no contracts** in the commit | ✅ |
| tsc | rc=0 | **rc=0** | ✅ |
| build | rc=0 | **rc=0** (single command, **no pipe** — a pipeline masks the exit code) | ✅ |

### The instrument was validated before it was trusted

My first pass averaged **four** corners and every portrait read "OUT of band" (94–116). Rather than
report that, I ran the **same instrument over the already-accepted E1 batch**, whose true verdict is
recorded at row 60 (five portraits in 130–145, `tf-mei` the outlier at **104**).

- **TL/TR corners on E1:** assay-clerk 137.2/138.5 · elder-rowan 137.3/130.6 · schoolteacher 141.8/139.1 ·
  storekeeper 144.4/143.3 · preacher 124.1/124.9 · **mei 106.4/104.2** → reproduces row 60's band *and*
  reproduces mei's 104 almost exactly.
- **4-corner mean on E1:** 122.8 / 99.9 / **105.7** / 92.8 / 118.8 / 130.6 → does **not** reproduce the
  band, and would not have flagged mei at all.

➡️ **The convention's real instrument is the TOP corner(s), and my four-corner mean was the wrong
tool.** The runner used the right one. The "OUT" readings in my first pass were an artefact of my
instrument, not a defect in the art — which is exactly why the control was run before the claim.

### The contact-sheet MAE discrepancy is a resampler, not an error

The runner claimed **0.0** MAE per cell; my box-downsampler gives **3.2–4.2**. That gap is the
resampler, not the art: on the **E1** sheet — whose true MAE row 60 measured as **0.2** — my same
instrument gives **3.3–6.7** on correct pairings. The discriminating scale is what matters, and a
**positive control** supplies it: comparing a cell to the *wrong* portrait scores **45–60**. At 3.2–4.2
every E6 cell is unambiguously its own raw.

## Findings

### F-1154-1 — a bare `git commit` in the art runner published a stale INDEX (MEDIUM, process)
`c7601082` carries the **8 real deliverables** (6 portraits + sheet + LEDGER) and **420 files that are
not this slice**.

⚠️ **My first reading of this was wrong, and the correction is the finding.** I wrote it up as "the
runner swept the whole dirty tree with an unscoped `add`" — the familiar shape. Then I read
`scripts/lane-runner-v3.sh:82` and the ART/repo-root branch is **already correctly scoped**:

```sh
( cd "$wd" && git add -A -- assets artifacts && git commit -q -m "runner($slot): $name" )
```

That pathspec **cannot** stage `.wrangler/tmp/**`. So the `add` is not the leak — the **bare
`git commit` that follows it is**, because a commit with no pathspec publishes *the entire staged
index*, including whatever someone else left staged.

✅ **Verified by content, not inference — 75 files in the commit lie outside `assets|artifacts`**, and
the added ones are dated debris from **long-departed fires**: `logs/session-scratch/s1126-*.mjs`,
`s1134-handoff.txt`, `s1134-line1.txt` (status `A`), plus the 18 `.wrangler/tmp` bundles and 50
modified `reviews/shots-*` / `logs/*`. Those s1126 and s1134 scratch files were staged **days** ago
and sat in the index unnoticed until this art run's commit adopted them.

🔑 **This is the sibling-script class, not a new bug.** `019e943a` (s1109) cured exactly this family
for **lane** commits — but it cured the *`add`* on the **lane** branch (`:95`), and the defect that
actually bit lives in the *`commit`* on the **art** branch (`:82`). Both branches still end in a
pathspec-less `git commit`, so **the lane path carries the identical latent hazard** even though its
`add` is now excluded correctly.

**Fixed here (both branches, the class not the instance):** the commit on `:82` and `:95` now carries
its own pathspec, so it can only ever publish the paths that slot is allowed to write. ⚠️ The runner
was **live** (pid 35584) when I edited it, so the fix is **inert until the runner next restarts** —
called out in the handoff rather than assumed.

- **Not on origin** at discovery (`git log origin/main..main` was exactly this one commit), so nothing
  was published. I did **not** rewrite history: the commit contains real, wanted deliverables, and the
  Retention Law prefers a forward correction to a rewrite.
- ✅ **Verified harmless to code:** 0 files under `src/`, `e2e/`, `scripts/`, `public/`; tsc and build
  both green afterwards.
- 🔑 **Consequential side effect, worth the owner's attention:** this incidentally committed the
  **~300-file `artifacts/` churn of F-1136-3** — the tree state that made *every* main-slot
  tracked-clean pre-flight a guaranteed STOP. **`git status` is now clean, so the main slot is
  pre-flightable again.** That unblocks the main lane, but it resolved an **open owner fork by
  accident**, which is the owner's call to keep or revert, not a fire's.
- **Also fixed here (additive, reversible):** `.wrangler/` added to `.gitignore` so the scratch cannot
  be re-staged. **Owner-gated remainder:** `git rm --cached .wrangler/tmp/**` to untrack the 18
  already-committed scratch files (an index deletion — not a fire's call).
- **Standing hazard this exposes, worth more than the incident:** *any* bare `git commit` in this repo
  publishes whatever is staged, and this tree demonstrably accumulates stale staged files across
  sessions. The house law already says path-scoped `git add`; on this evidence it should say
  **path-scoped `git commit`** too.

### F-1154-2 — the F-1120-1 ground-warmth guard is under-specified, and one portrait fails the unstated half (LOW, convention)
Row 60 says "ground warmth R−B"; row 61 says "60×60 corner"; the master says "report the number".
**None of them names which corner** — and these portraits vary a lot across the frame. Under **TR60**
the **Appliance Wrangler reads 117.7** against its own **TL60 of 131.6**: a 14-point spread along one
top edge, below the band on one corner and inside it on the other.

Non-blocking, because the precedent tolerates it: the **accepted** E1 `tf-preacher` reads 124.1/124.9
and was never flagged, while mei at ~105 was. But E7–E10 all cite this convention, so it will recur.
**Recommendation:** pin the statistic in the LEDGER convention — *"mean R−B over the TL+TR 60×60
corners, band 130–145"* — so the guard stops depending on which corner the runner happens to sample.

> **RESOLVED s1155 — pinned in row 60, but NOT as recommended above; the recommendation was tested and
> failed.** Measuring all 12 shipped `tf-*` portraits (`logs/session-scratch/s1155-ground-warmth-corners.mjs`):
> the **corner** half of the recommendation is right and now binding (**mean R−B over TL+TR**; a 4-corner or
> whole-image mean false-fails **10 of 11** accepted portraits and is banned). The **band** half is wrong —
> *130–145* retroactively fails two accepted portraits, `tf-preacher` **124.5** and `tf-appliance-wrangler`
> **124.6**. Row 60's own "the other five's tight 130–145 band" was therefore inaccurate when written:
> preacher was 124.1 and was accepted without comment. **Pinned as: flag below 120, observed accepted range
> 124–145** — 15 points of margin above `tf-mei` (105.3), 4.5 below the lowest accepted portrait.
> Mechanism checked by eye, not assumed (`logs/session-scratch/s1155-corner-crops.png`): **no headwear
> intrudes into any sampled corner** — the statistic reads ground tone and hatching density, and mei is
> visibly pale and under-hatched where preacher and appliance-wrangler are merely darker in the same hand.

### F-1154-3 — row 60's contact-sheet ordering claim is wrong, and row 61 inherited it (LOW, ledger accuracy)
Row 60 states the E1 sheet is the six raws *"in the master's exact order — mean abs per-channel diff
**0.2 on all 6 cells**"*. A full **6×6 pairing matrix** says otherwise: the E1 sheet's actual order is

`assay-clerk · elder-rowan · mei · `**`storekeeper · preacher · schoolteacher`**

Every cell matches **unambiguously** (4.3–5.8) against **33+** for all other pairings, so this is a
mislabel, not a measurement gray zone. Row 60's own *prose* ("bare-headed mustache / black wide-brim /
curly") actually describes the sheet's true visual order — it is the **file list** that is out of step.

Row 61's *"the sheet mirrors row 60's 3×2 order"* therefore inherits a false premise. **The E6 art is
unaffected and is in fact the better-behaved of the two:** E6's sheet is in **its own raw-list order**,
verified cell-by-cell. Only the LEDGER prose needs correcting.

> **RESOLVED s1155 — CONFIRMED by independent re-derivation, and row 60 + row 61 both corrected.**
> Re-measured from scratch (`logs/session-scratch/s1155-sheet-pairing-matrix.mjs`), not inherited: the E1
> sheet's true order is **assay-clerk / elder-rowan / mei / storekeeper / preacher / schoolteacher**, exactly
> as claimed above — **6/6 bijective, MAE 0.18–0.24 true vs 33.3–65.9 for all 30 wrong pairings (gap ×165–199)**.
> **The instrument was validated on the E6 sheet first, and that control earned its keep:** the script's FIRST
> run sliced the letterboxed, square-celled E6 sheet as `height/2` bands, cut padding into every cell, and
> returned a meaningless 4/6 non-bijective result. The E1 sheet's exact 3×2 geometry (1152×768 = 384² cells)
> would have hidden that bug completely and handed me a "confirmed" verdict from a broken tool. With square
> centered cells the control recovers E6's known order **6/6 at MAE 0.14, gap ×202–265**.
> **One refinement to the finding above:** both sheets are near-bit-faithful (**MAE 0.14–0.24**), reproducing
> row 60's original 0.2. s1154's 3.2–6.7 was its own resampler — so that gap needed no "resampler difference"
> caveat in the first place; the sheets are simply clean.

## Merge classification

Not a lane graft — the runner committed straight to `main`, so there is no base to classify against
and no 3-way merge was performed. `git merge-base --is-ancestor c7601082 main` → **true**. The drain's
work was gating, not merging.

## Tier / release duties

**Reference tier — extraction WITHHELD by design**, per the master's NO list and row 60's precedent:
no consumer exists (`grep tf- src/` still returns only `utf-8` inside `CharterShare.ts`), so nothing is
wired, no `assets/processed/` output was produced, and **no player-visible surface changed**.
⇒ **no gazette item, no deploy.**
