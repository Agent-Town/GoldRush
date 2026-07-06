# Task 033: offline crafting pipeline — FIRST GENERATION RUN + bench UX (MAIN slot, after 031)

You are Codex, implementer for Gold Rush. Claude orchestrates and gates. READ: AGENTS.md; src/crafting/* (incumbent m5-04 shapes); assets/crafting-queue/ (contract.v1.json + pending/).

CONTEXT: Robin built the Assay Office in-game and asked "how can I use it?" — the POSTING half works (bench posts pending orders), but the GENERATION half has NEVER run: pending orders sit unanswered forever. This task closes the loop for the first time and makes the bench self-explanatory.

## Part A — run the offline pipeline (the M5 design, brief §10: generator proposes, contract + validation disposes)
1. For EACH order in assets/crafting-queue/pending/ (includes 2 test orders from e2e, treat them as real): generate a crafted-item proposal (YOU are the generator — item name, ledger-voice blurb, kind, rarity, stat deltas) honoring assets/crafting-queue/contract.v1.json.
2. Validate against the contract + stat-sim bounds (M5 lab validator; reject anything out of bounds — write at least one deliberate near-limit case honestly: approved if legal, rejected with reasons if not).
3. Write results as the m5-04 fixture shapes: approved/ and rejected/ (with reasons) per profile; pending orders consumed (moved/marked per CraftingQueue semantics). Both-verdicts-ok law: e2e must tolerate either verdict for any given order.
4. Add a small `scripts/run-crafting-pipeline.md` runbook documenting exactly how future runs work (a fire or Robin can trigger it; later this becomes a scheduled shift).

## Part B — bench UX (F-m5-04-1 + Robin "I don't know how to do anything with it")
1. Esc (and a visible ✕) closes the bench panel; panel no longer occludes HUD chips (reposition or collapse).
2. First-open hint strip (ledger voice, one sentence): "Write what you need — the Assayer takes orders now, fills them between sessions." Blurb on the Assay Office build tile updated to match this promise.
3. When an APPROVED item exists for the profile: bench history shows it with an equip/claim affordance IF item application is already wired (check ProfileManager/stat pipeline); if application is NOT yet wired, show it as "arrived — collection opens soon" and note the gap honestly in your report (item-application is its own slice, do NOT build it here ad hoc).

## Firewall
Touch ONLY: assets/crafting-queue/** (fixtures), src/crafting/* (panel UX + close), src/game/buildables.ts (blurb string only), src/styles.css (bench polish), e2e/m5-04-offline-queue.spec.ts (extend for close/hint, keep both-verdicts law), new runbook doc. NO Economy/Combat/Game.ts/Balance beyond the blurb. No commits.

Self-check: tsc/build clean; m5-04 suite + lane-c office test green; bench closes with Esc; at least one approved + one rejected fixture exists post-run. End: READY-FOR-GATES + files + results.
