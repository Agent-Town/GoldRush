# Review — `art-gazette-first-issue` (GG-02: six engravings + masthead for the Greenhorn's Gazette)

**Slot:** art · **Commit:** `8dff01fbc7f29a643de357cc1bd60d974a667302` "runner(art): art-gazette-first-issue.md"
**Drained by:** s1205 fire, 2026-07-29. **Tier:** reference (full-bleed, no `#ff00ff` key) → **no extraction, no wiring** — GG-03 owns the swap, per the task's own firewall.

## Verdict

✅ **ACCEPT.** All seven plates landed, are byte-identical to main, and both canon-risk atoms pass an
**independent** visual verify (I opened the PNGs; I did not inherit the run note's QA claim).

## Landing — verified by hash, not by name

This is an ART-slot task, so the commit is Codex's own rather than the runner's, and the output went
to **repo-root `assets/raw/`**, not `worktrees/art/`. Every file was hash-compared against main:

| File | main blob | disk blob | |
|---|---|---|---|
| `gazette-masthead.png` | `0ccaeae19c4c` | `0ccaeae19c4c` | ✅ |
| `gazette-panel-claim-goal.png` | `c00c25b008a9` | `c00c25b008a9` | ✅ |
| `gazette-panel-seams-gold.png` | `f86e6de5af24` | `f86e6de5af24` | ✅ |
| `gazette-panel-the-works.png` | `4adcfb9bc544` | `4adcfb9bc544` | ✅ |
| `gazette-panel-the-arms.png` | `fe9eecc88c2d` | `fe9eecc88c2d` | ✅ |
| `gazette-panel-freeing-fevered.png` | `fb66e6a50742` | `fb66e6a50742` | ✅ |
| `gazette-panel-town-serves.png` | `e32166c8f9ea` | `e32166c8f9ea` | ✅ |
| `codex-art-run-art-gazette-first-issue.md` | `d8f4cf7b823a` | `d8f4cf7b823a` | ✅ |

⚠️ **Name-identity was deliberately not the test** — F-1054-1 was exactly a name that matched main
over bytes that were in no object database. `8dff01fb` also carries the LEDGER row (+1 line) and the
66-line run note. **Nothing here is AT RISK: all eight files are in main's object database.**

## Canon verify — the two risk atoms, opened and read

**Panel 4, "The Arms" (ADR-001 — the batch's canon-risk atom): PASS, no firearm.** The Prospector is
the round brass automaton with the teal dial, miner lamp, hover base and jointed arms. The emitter is
a **broad open brass ring** throwing three expanding teal rings at practice bullseyes — **no tube, no
barrel, no muzzle, no bore, no grip, no trigger, no stock, no magazine, no gun silhouette.** Frontier-tech,
exactly as ADR-001 requires. No people are targeted (the targets are wooden bullseye posts), no gore,
no letters or numerals. The run note records that this panel needed two correction passes for exactly
this property; the shipped result is clean.

**Panel 5, "Freeing the Fevered" (lore/story-arc.md §THE GOLD FEVER — victims, never villains): PASS.**
An ordinary frontier neighbour in plain workclothes, gold motes **streaming out of** his eyes, face
dazed and frightened rather than menacing, with a bare unarmed hand extended toward him from frame-left.
He reads unmistakably as **a person being freed, not an enemy being killed.** No weapon, no wound, no
gore. This is the panel the GG-01 drain flagged as the copy-level canon risk ("kill the bandits" wording
would be a violation); the art matches the ruling.

Both plates hold the style anchor — engraved sepia ink on parchment, fine crosshatching, restrained
teal accent, illustrated and never photoreal — and neither carries readable letters or numerals.

## Findings

**F-1205-7 (non-blocking, for GG-03) — the helping hand in panel 5 is a HUMAN arm, not the
Prospector's brass one.** Rolled sleeve and cuff, clearly flesh. The task brief said only "a helping
hand extended" so this violates nothing, but the Gazette is the Prospector's own reference layer and
GG-03 will place this panel next to copy about what *the player* does. Worth an eyeball at the wiring
slice: if the panel is captioned as the player's action, a human arm slightly mis-attributes it.
Cosmetic, display-safe, and cheaper to notice now than after the swap.

**F-1205-8 (non-blocking, watch) — panel 4 frames combat as a target range.** Three bullseye posts.
That is canon-*safe* (it is practice, not violence against people, and it keeps the emitter pointed at
nothing living) and arguably a good teaching choice for a tutorial panel. Recording it only because
"The Arms" is the panel most likely to draw an owner opinion, and the target-range read is a framing
decision nobody explicitly ratified.

## Duties

- **ART-SLOT LAW — both buckets reported** (`node scripts/art-staging-audit.mjs`, run this fire):
  **AT RISK 748 files / 566.47 MB** (in no object database — dies with this disk; `staging/motion-pilot`
  556.96 MB, `staging/contact-sheets` 9.51 MB, `staging/requests` 3 KB) · **LOCAL-ONLY 0 files / 0 KB.**
  That AT-RISK figure is the standing **F-1120-2 / F-1193-2** hole, unchanged by this drain and **not
  caused by it** — this batch's bytes are all safely on main. It remains owner-gated: one ruling on
  "may a fire convert `worktrees/art` into a real git worktree?" closes it.
- **Extraction/wiring: correctly WITHHELD.** Reference tier, full-bleed, no `#ff00ff` key — same
  precedent as LEDGER rows 48–54 (e7/e8/e9/e10 batches). GG-03 owns the swap.
- **GZ-01: not owed.** The art is unwired, so no player can see it in a plain boot — the house rule for
  reference-tier batches is "unwired → no gazette" (LEDGER rows 48–54 say so explicitly). It earns its
  news item at GG-03, when the panels actually appear in the Herald.
- **LEDGER:** row present (added in `8dff01fb`).
