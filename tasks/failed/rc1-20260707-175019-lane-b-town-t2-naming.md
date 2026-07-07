# Task town-T2: the founding naming — "What will you call this place?" (LANE-B, branch lane/m4, commit prefix "town:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; **specs/town-v1/README.md T2 (BINDING) + laws §1/§2**; town-T1's TownScene (this builds on it — REQUIRE its merge, see sequencing); ProfileStorage (per-profile keys pattern); the run-start "claim remembers" recap + Run Ledger (both gain the town name). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: town-T1 MERGED to main (verify `src/town/TownScene.ts` exists on main — file probe, not log grep; absent → STOP and report "T1 not landed").

## Scope (per spec T2 — the moment the place becomes THEIRS)
1. First town entry per profile → the founding prompt: ledger-styled card, "What will you call this place?" — text input 2–18 chars, letters/digits/spaces/'-, light profanity filter (word-list, warm rejection: "The Elder suggests a different name."), confirm shows "Founded: <Name>, 2026" beat.
2. Name persists per profile (`profileDataKey`); town header shows it; **the run-start recap greets with it ("<Name> remembers: …")**; the Run Ledger footer carries "the claim of <Name>" line; rename free at the claim office shell (simple prompt reuse, spec default 3).
3. Fresh-profile e2e path + existing-profile migration (profiles created before T2 get the founding prompt on next town entry — no data reset).
4. Mobile: input works at 390px (native keyboard, no zoom-jump).

## Firewall
Touch ONLY: town naming UI + persistence key (additive, migration-safe), town header, recap/ledger name lines, claim-office rename prompt, e2e. NO changes to: run sim, scoreboard keys, other town shells, menu flow beyond what T1 shipped.

## Self-check
tsc/build; new `e2e/town-t2-naming.spec.ts`: fresh profile → prompt → name persists across reload → recap greets by name → rename works → filter rejects warmly → second profile names independently; town-t1 spec + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (founding card, named header, named recap, 390px input) into artifacts/town-t2/. Commit on lane/m4. End: READY-FOR-GATES + results.
