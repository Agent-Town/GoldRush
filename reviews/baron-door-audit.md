# baron-door-audit — does a lawful Baron secure exist under today's door and engine?

**Slice:** `baron-door-audit` · **branch:** `lane/a` · **tip:** `6c9e4540c` · **gated + merged:** s2290
**Merge:** ✅ **MERGED s2290 at `abf6b7464cfa527949c3873894a5548ea0a9bb1b`**

## VERDICT: MERGED — the audit's verdict SURVIVES the attended retraction, on the retraction's own evidence; but its supporting reasoning has a hole, and its owner fork is priced against a strategy it never tried.

The runner did the work it was asked for and its measurements are honest — I re-derived both of
them rather than inheriting them. What it could not know is that a **post-AP-16 agent Baron secure
was recorded on 2026-08-13** and was invisible to its evidence sweep for the same filename-pattern
reason that made the attended session's own sweep a false negative twelve hours earlier. Attended
filed that as a RETRACTION and left this drain a standing order: *"the running baron-door-audit's
premise ('no secure found') is corrected by this row — its drain must reconcile against
`6b1fcdce0`."* That reconciliation is the substance of this review, and its answer is not the one
either side expected.

## What it does

Audits whether `e1-baron`'s admission rests on evidence earned under a game that still exists,
then tries to re-prove it through the current public door. Nine new artifacts under
`artifacts/baron-door-audit-20260825/` — an evidence-trail memo, an attempts log, two new
non-repeating hypothesis tapes with their drivers, a verification table, and a priced owner-fork
memo. No admission flip, no balance edit, no door edit: findings and evidence only, exactly as the
firewall required.

## Evidence

| check | where | result |
|---|---|---|
| `npx tsc --noEmit` | merged tree, `.gate-s2290` | **rc=0** |
| `npm run build` | merged tree | **green, 1.54 s**, asset-diet ceiling respected (herald 1,158,214 B of 1,500,000 B) |
| merge | `main` ← `lane/a` | **clean, no conflict** (verified by `merge-tree` before touching main) |
| changed paths | merged vs main | **10** — 9 artifacts + 1 BACKLOG row |
| of those, RUN SURFACE | — | **0** |
| firewall | `artifacts/baron-door-audit-*/**` + own BACKLOG row | **HELD exactly** |

**Battery call, recorded rather than quietly taken.** F-1460-1's mandatory trigger is
`src/sim/`|`src/systems/`|`src/entities/`. This slice touches none of them — it touches no code at
all — so the ~530 s `test:node-guards` was not re-run. The slice is structurally incapable of
changing what any test executes.

### The runner's headline is a claim, so it was re-derived (Mistake #4)

Both rows of the runner's own `verification.md` reproduce **exactly** on the merged tree, via
`scripts/assay-replay.mjs`:

| tape | runner claimed | this drain measured | agrees |
|---|---|---|---|
| `gauntlet-heat5-20260824/e1-baron/attempt-4-tape.json` (unchanged) | `fnv1a32:79cbfb15`, unsecured, w20, 538.467 s | `fnv1a32:79cbfb15`, `secured:false`, `waves:20`, `timeAlive:538.467` | ✅ |
| `baron-door-audit-20260825/h11-forward-rig-tape.json` (its mutation) | `fnv1a32:00d2c4f7`, unsecured, w20, 538.467 s | `fnv1a32:00d2c4f7`, `secured:false`, `waves:20`, `timeAlive:538.467` | ✅ |

Its arithmetic checks too: 49,025 ÷ 53,346.893 = 91.90 % remaining, i.e. **8.10 % burned**, i.e.
**12.34× short**; and the knife-edge dial it derives, `hpScale 240 → 19.44`, is exactly that burn
fraction applied to the current value — a correct derivation, not a guess.

## The reconciliation attended ordered — F-2290-1

**The audit's verdict survives, and it survives on the retraction's own evidence.** The word doing
the work is **retained**, and the retraction stepped past it.

| question | measured |
|---|---|
| does `6b1fcdce0` exist? | **yes** — 2026-08-13T00:54:26+07:00, *"🏆 FIRST AGENT BARON SECURE — codex gpt-5.6-sol wave 22"* |
| does it postdate AP-16 (`8465f6b33`, 2026-08-10)? | **yes** — `git merge-base --is-ancestor` confirms |
| what does it claim? | `secured: true`, `waves: 22`, `eventLogHash: fnv1a32:f5365f4c`, `runsSoFar: 6` |
| what did it LAND? | **two files** — `codex-sol-r1-outcome.json` and `codex-sol-r1-player.mjs` |
| the tape its own outcome names (`"tape": "run-6-tape.json"`) | **NOT IN THE REPO** — `git ls-files` matches nothing, in any directory |
| tracked occurrences of `f5365f4c` anywhere | **two**, and neither is evidence: the outcome file's own self-report, and a BACKLOG row citing it |

So the county's one claimed agent Baron secure is, in the repository, **a self-reported number with
no replayable artifact behind it**. "Verified ×2" was true when someone ran it; nothing retained
lets anyone re-run it now. That is precisely the audit's finding — *"unsupported by retained
public-verb two-secure evidence"* — and it is **strengthened**, not corrected, by the record the
retraction found.

⚖️ **Stated honestly and not inflated: this is not an accusation that the secure was faked.** The
player, the outcome and the campaign are all consistent, and the run almost certainly happened as
described. What is missing is the artifact that would let the county *demonstrate* it, which is a
different and lesser claim than fraud — but it is exactly the claim `e1-baron`'s admission rests on.

**But the audit's supporting reasoning has a real hole, and it is the same hole.** It dated the
admission trail to `1a4831df7` (2026-08-03 — a boss-driver test that boosts the rig to 1,000 damage
and the hero to 100,000 HP, correctly judged not a lawful door ride) and concluded the evidence
predates AP-16. That is true *of the commit it found*. It never found `6b1fcdce0`, twelve hours of
attended work away, for the same reason attended's own `find -name *baron*` missed it: **the
campaign files carry no `baron` in their names.** Three independent sweeps have now failed on that
one discoverability defect. It is not a judgement error; it is a missing index.

## F-2290-2 — the owner fork is priced against a strategy nobody tried

The audit recommends **(b) ACCEPTED-ELITE**, reasoning that *"eleven distinct current-door
hypotheses remain 12.34× short."* That reasoning is sound about the eleven. It is silent about a
twelfth, which is the only one that has ever worked.

`bench/gauntlet/heat3/codex-sol-r1-player.mjs` **is retained** — 195 lines, a full public-door
build plan (3 sluices, 4 turrets, 6 beacons, 3 palisades, 2 stockpiles, tiered upgrades, a scored
`pickUpgrade`). Unlike a tape, **a player is a strategy, not a fixed input stream** — and this
morning's own `gauntlet-heat5b-reearn` drain (merged `77c85566a`, four hours ago) established
exactly which of the two survives an engine patch: *"structural knowledge survives, tick-coupled
timing does not."* The Aug-13 stream is engine-skewed and worthless; **the Aug-13 strategy is not**,
and it was never re-ridden.

⚠️ **One caveat that must ride with this, because it could invalidate the whole idea and I have not
measured it:** that plan builds **palisades**, and the attended row on main argues the pre-law door
offered agents a palisade e1 humans never had — the finding that birthed AP-16. The run postdates
AP-16 by three days, so the palisade was presumably in the manifest-derived buildable set it was
gated against; but *presumably* is not *measured*, and if it was not, the strategy is unavailable
and the fork's pricing stands unchanged.

➡️ **This is one cheap, well-posed measurement and it should precede the owner's ruling**: re-ride
`codex-sol-r1-player.mjs` at the current engine and door, first bench seed. It resolves the palisade
question and the reprove question in the same run. **Do not flip the admission on it either way** —
that is the owner's fork, and this only prices it.

## Findings

- **F-2290-1** — the county's only claimed agent Baron secure (`6b1fcdce0`, `fnv1a32:f5365f4c`)
  retains **no tape**. Its own outcome names `run-6-tape.json`; that file is in no commit. The
  admission is therefore unsupported by retained evidence, as the audit found, and the retraction
  does not overturn it. **Non-blocking** — it concerns the historical record, not this slice.
  Owner-relevant: it is the factual basis of the fork below.
- **F-2290-2** — the owner fork's recommendation is priced against eleven hypotheses and omits the
  one retained strategy that has ever secured this contract post-AP-16. **Non-blocking**, but it is
  a cheap measurement that should precede the ruling. Fire-authorable as a single re-ride.
- **F-2290-3** — three independent sweeps (heat-5's study, attended's `find`, this audit) each
  missed `6b1fcdce0` because the campaign files carry no contract name. The evidence is
  discoverable only by reading commit subjects. **Non-blocking**; the cure is an index entry, which
  the attended retraction already proposed as its consequence ④.

🔺 **OWNER FORK (unchanged by this drain, re-priced by it):** (a) HP-only knife-edge
`hpScale 240 → 19.44`, a 91.9 % boss cut; (b) **ACCEPTED-ELITE** per the e9 precedent, honest
exemption, non-debt; (c) standing bounty while exempt. The runner recommends **(b)**. This drain
does not dispute that recommendation — it asks that **F-2290-2's single re-ride be measured first**,
because the recommendation's own reasoning is a count of failed hypotheses, and the count is
missing the one that succeeded.
