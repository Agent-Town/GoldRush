# RELEASE E1 — THE FRONTIER EDITION (five maps, pushed out, fed back)
STATUS: RATIFIED 2026-07-22 (owner, verbatim: "the five maps would be my choice. Then lets work on the things that are missing for that. Of course we don't have to stop working on the full game, but it would be nice to be able to push something out and get feedback. Can you work on this? I will then test and tune this first and then we deploy that to agenttown.app with a fixed version.")

## The shape
- **The game ships as E1 complete**: the Claim (locked-win at 10 + the rush), Dry Gulch, Night Shift, Twin Banks, and the Baron as the finale. The book ends at the frontier — for now.
- **The factory keeps building E2-E10 behind the frontier** (owner: "we don't have to stop working on the full game"); each later era releases when it reaches E1's testing depth. Era releases are Gazette beats.
- **Two deploys**: the rolling dev production (gold-rush-3in.pages.dev, unchanged) and THE FIXED VERSION at agenttown.app — a pinned, owner-blessed build (git tag per release; deploy owner-gated).

## The slices
- **RF-01 — THE RELEASE FRONTIER**: a data flag (`releaseFrontier: 'epoch-1-frontier'`) capping the shipped book. The secrets law already hides E2+; the T1 door renders an in-world HORIZON BEAT instead of arming (no meta-speak — the era turns when the wider world sends word). Debug/era doors unaffected (testing continues past the frontier). Frontier-off = full game (one flag).
- **RF-02 — THE TRAIL GUIDE** (un-shelved by this release; the first external tester's "did not exactly understand what to do"): the first-run bark track through the Prospector/plaza voices — 8-12 contextual teaching beats (first pan, first gold, first build, wave telegraph, breath-catch), each once, dismissible, era-1 voice; plus the first-boot "First time prospecting?" → greenhorn offer.
- **RF-03 — THE BUG OFFICE (owner pivot, verbatim: "the Assay Office is not really used... Maybe we could turn it into a bug report building instead for now during the testing? So then the players could upload screenshots and describe bugs they found IN the game ABOUT the game - very meta and fun. They will then land with you and me...")**: during the testing era, the assay bench door opens THE COMPLAINTS DESK — in-world clerk takes a report: player description + auto-attached SCREENSHOT of the moment (canvas capture, downscaled) + honest diagnostics (contract, wave, position, build, tier) + optional prospector-name for credit. Reports POST to a new Pages Function → KV (the telemetry pattern; size-capped JPEG; rate-limited; zero PII beyond the chosen name). Read side: a token-gated /api/bugs list + a fetch script for the attended session — reports land with Robin and me for triage. Crafting orders retreat behind ?debug for the testing era (they return with M5's public debut).
- **RF-04 — THE BOUNTY** (owner announces: prizes for the top-3 bugs): the desk shows the bounty line in-world; report ids are shown to the reporter so they can claim credit. Copy owner-approved before deploy.
- **RF-05 — THE FIXED VERSION**: release tagging (vE1.x), a deploy target for agenttown.app (the owner's project; wiring owner-gated), the census-E1 gate green + save-compat green + THE FRONTIER-PHYSICAL assertions green as the tag precondition.


## THE FRONTIER IS PHYSICAL (owner 2026-07-22: "we don't allow users to hack their ledger download and then they are able to access the laters epochs")
A client flag can always be flipped; therefore the FIXED VERSION is a **build variant**, not a mode:
1. **Absent, not hidden**: the release build EXCLUDES E2-E10 from the bundle — contracts, manifests, plates, era assets, ceremony scripts beyond T1 are not emitted (build-env-scoped globs). A hacked ledger, edited localStorage, or typed URL finds nothing to load.
2. **Debug stripped**: `?debug`, `&era=`, and the __GR_TEST__ seam are compiled OUT of the release build (dev production keeps them all — testing never stops).
3. **Imports HEAL, never reject** (save-compat law upheld): a ledger claiming epoch-7 imports fine — the reconcile pass CLAMPS any beyond-frontier state to the frontier (the reconcileActiveEpoch healing precedent). When E2 releases, the same ledger un-clamps forward automatically. Hacked saves come home politely.
4. The rolling dev deploy is unaffected and full-game; only the agenttown.app fixed version is frontier-physical.

## The launch gate (all must hold on the tagged build)
Census green on the 5 E1 maps · locked-win + rush verified · Baron 22/22 · Trail Guide plays for a fresh profile · Bug Office round-trips a report with screenshot · save-compat fixture green · zero console on all five boots, both projects.

## Owner desk (batched)
Q1. Bounty copy + prize (his announcement). Q2. agenttown.app wiring word when he's ready. Q3. The tag moment (after his test-and-tune pass).
