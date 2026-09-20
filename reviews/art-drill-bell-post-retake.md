# art-drill-bell-post-retake — the bell stops looking like a gallows

**Slice:** `art-drill-bell-post-retake` (FIRE-AUTHORED s1445, from s1445's own drain verdict)
**Slot:** art · **Run:** `tasks/runs/20260804-005701-art-art-drill-bell-post-retake.md.log` (502 KB, 122,964 tokens)
**Done-move:** `20260804-005701-art-drill-bell-post-retake.md`
**Drain:** s1446, 2026-08-04
**Goal leaf:** `e1-drill-bell-post-retake` — `drain-block-check --strict` **CLEAR** (leaf id read, not just the exit code; F-1437-2)

## VERDICT: ACCEPTED — F-1445-4 CLOSED. The bell post is consumable.

The retake removes both halves of the gallows read. The prop may now be wired by
`lane-drill-yard-affordances` alongside its two accepted siblings; **the s1445 consumption gate is
lifted.**

## What it does

s1445 rejected `prop-drill-bell-post.png` on canon (F-1445-4): a tall single upright with a **long
cantilevered overhanging arm**, and a pull-rope hanging **free from the clapper to an open loop at
body height**. Silhouette = scaffold, loop = noose — hanging imagery, forbidden by
`docs/GOLD_RUSH_BRIEF.md` §9 (*illustrated, warm, never gory*).

The retake replaces the geometry with a **symmetric two-post yoke**: a crossbar spanning flush
between two braced uprights, the bronze bell centred beneath it on a bracket and shackle, clapper
visible and connected to nothing. The hemp rope is a **tight flat coil wound around a cleat on the
right upright** — it begins, remains and terminates against the post.

Two native retakes were taken; the first was discarded by the generator itself because a rope
segment still crossed open air below the bell. That self-rejection is the behaviour the master
asked for and it worked.

## Evidence

| Check | Instrument | Result |
|---|---|---|
| Provenance | `sha256` re-derived at drain | `56236ca0ee22555857f113388aa82e9387782c6e30062272e19406d245653399` — **identical to the run file's claim** |
| Landed blob | `sha256` of `assets/raw/prop-drill-bell-post.png` after copy | **byte-identical** to the gated file |
| Dimensions | `sharp.metadata()` | 1254×1254 RGB, 3 channels, no alpha — matches both accepted siblings |
| Exact `#ff00ff` | full raw-buffer scan, 1,572,516 px | **0** |
| Mean luminance | measured | **0.508** (reference plate 0.455; siblings 0.451 / 0.525 — inside the set's range) |
| 96px silhouette | downscaled to 96px, viewed | bell in a frame; the bell dominates |
| Letters / numerals / pseudo-writing | full-size + crop review | none |
| Canon §9 | full-size review | no firearms, no weapons, no people, no bodies, no gore |
| Set cohesion | 4-up comparison board | matches faucet station + straw target: same line weight, ground, camera, padding |

**Artifact:** `artifacts/drill-bell-post-retake/comparison-board.png` — REJECTED s1445 | RETAKE s1446 |
faucet station | straw target, side by side at equal scale. The rejected plate's gallows read is
unmistakable next to the retake; this is the image to look at if the verdict is ever questioned.

## THE GALLOWS CHECK — answered by looking, not by reading the run file

**This is the whole point of the slice, so it was measured directly and independently.**

The generator answered its own gallows check and passed itself. **That is exactly what happened in
s1445 too** — the original run's self-QA recorded *"PASS — post, bell, rope"* on a gallows, because
every box it ticked was genuinely ticked and the hazard was not one of the boxes
(*a generator's self-QA only checks the boxes it was given*). **So the run file's answer was treated
as a claim, not as evidence.** I viewed the full-size image, a 96px downscale, and two crops.

Stranger's one-sentence read at 96px, written before consulting the run file's wording:
> *A bronze bell hanging in a small braced wooden frame.*

- **Cantilever / projecting beam:** GONE. Crop `/tmp/crossbar.png` confirms the crossbar spans
  between the two uprights and terminates flush at them — nothing projects outward.
- **Free rope in open air / terminal loop:** GONE. Crop of the right upright shows ~5 tight
  parallel wraps around a vertical cleat, flat against the post, both ends tucked. No segment
  crosses open air; no loop hangs anywhere in the frame.
- **Does "scaffold", "gallows", "noose" or "hanging" honestly apply?** **No.**

⚠️ **One honest caveat recorded rather than smoothed over:** a two-post frame with a crossbar is
*generically* also the shape of a two-post gallows, and a tight parallel-wrapped rope coil shares
its winding with a hangman's knot. The discriminator in both cases is the same and it is decisive
here: **a gallows reads as a gallows because of the loop suspended below the beam, and there is no
loop.** What hangs from this crossbar is a large centred bell that occupies most of the frame.
I am recording this because the reading is a judgement about an image, and the next reader deserves
the reasoning rather than a tick.

## Merge classification

Art raws-only drain. No `src/`, no specs, no e2e, no extraction, no processing, no contract wiring —
**wiring is the lane's, per the master's own firewall.**

| Path | Class | Note |
|---|---|---|
| `assets/raw/prop-drill-bell-post.png` | LANE-TOUCHED (overwrite) | rejected pre-image preserved in git as blob `82a971c377486d9ad8fc6e871f6d1865996ceb87` (committed `0c71b5ba`) — **RETENTION LAW satisfied by history, not by a second file** |
| `assets/raw/codex-art-run-art-drill-yard-stations.md` | LANE-TOUCHED | retake section appended: run dirs, self-QA table, gallows check, final prompt |
| `assets/LEDGER.md` | MAIN-ONLY | row 70 retake note; main's ledger is a **different document** from `worktrees/art/assets/LEDGER.md` and was **not** copied across |

⚠️ `worktrees/art/` is not a git worktree, so all three artefacts were **AT RISK in no object
database** until this drain committed them.

## Findings

- ✅ **F-1445-4 CLOSED.** The gallows read is cured on both counts. Consumption gate lifted.
- 🟢 **F-1446-1 (non-blocking, process observation).** The generator's self-QA now *does* carry the
  gallows check as an explicit row, because s1445's master put it there — and it caught its own
  first retake. The cure worked. But note what actually fixed it: **the hazard became a box.** The
  general lesson is unchanged and still unmechanised — a self-QA table can only ever check the
  boxes someone wrote for it, so **the drain must look at the image regardless of how good the
  table is.** No corrective task; this is a standing reading habit.
- 🟡 **F-1446-2 (bookkeeping, ELEVENTH consecutive fire).** `drain-block-check` answered CLEAR here
  only because s1445 registered the leaf while authoring. The wider debt is unchanged: **526 of 762
  masters carry no goal leaf.** Ten previous fires have filed this finding. Writing it up an
  eleventh time will not fix it — **it wants the attended ruling F-1443-1 asked for: should
  authoring hard-STOP without a leaf?**
