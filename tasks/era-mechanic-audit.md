# Task era-mechanic-audit: does every E3–E9 door contract exercise its era's mechanic? (lane-d, INVESTIGATE — report only, commit prefix "docs:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; `specs/epoch-saga/CAPABILITY-LADDER.md` §2 (the ladder table: one era, one mechanic, one reasoning problem) and §3 L1 (THE LADDER LAW: a contract that does not exercise its era's mechanic is a reskin, not an era); `assets/contracts/epoch-*/contracts.json` (the thirty-nine door contracts; `twist` keys per contract); `src/sim/HeadlessContractSim.ts` (which era systems the headless sim instantiates per contract: `PressureSystem`, `PowerGraph`, `DeepwaterSocket`, `AtomicSocket`/`DecaySystem`, `E7SignalSystem`; grep each); `src/systems/` and `src/sim/` (verified 2026-09-02: files exist for pressure, power, deepwater, decay, signal; NONE were found by name for vehicles (E4), gravity/air (E8) or persistent tiles (E9)); `scripts/gr-sim.mjs` (headless rides).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (attended analysis 2026-09-02, CAPABILITY-LADDER §0: "NOT verified: vehicles (E4), the boat (E5), gravity (E8), persistence (E9): treat as open")
The door serves all ten eras contract-first. The benchmark's honesty depends on each era being a different reasoning problem, not the Claim with a new palette. Nobody has measured which of the thirty-nine contracts actually invoke their era's system.

## Scope (READ-ONLY on `src/**`: this task changes no code)
1. For each door contract E3–E10: trace which era system(s) the headless sim instantiates for it (file:line), and which `twist` flags enable them; run one headless ride per contract (`node scripts/gr-sim.mjs --contract <id> ...`, bench seed, idle or a scripted floor policy) and record whether the mechanic's events appear in the event log (name the event kinds you grep for).
2. Produce `docs/audits/2026-09-02-era-mechanic-audit.md`: a table (contract · era · signature mechanic per the ladder · system present? · invoked in a ride? · verdict EXERCISES / RESKIN / PARTIAL · evidence) plus a summary per era, and the list of era mechanics with NO engine system (expected: E4 vehicles, E8 gravity/air, E9 persistence: confirm or refute with evidence).
3. For every RESKIN or PARTIAL verdict, write ONE line proposing the smallest slice that would make the contract exercise its mechanic (a proposal, not a task; the attended session authors from it).
4. BACKLOG row summarizing the counts.

## Firewall
Touch ONLY: `docs/audits/2026-09-02-era-mechanic-audit.md` (new), `artifacts/era-mechanic-audit/` (ride logs), BACKLOG row. NO changes to `src/**`, `assets/**`, `scripts/**`, `e2e/**`, contracts, or other tasks' fresh work. Reporting an adjacent problem is good; fixing it here is a violation.

## Self-check (evidence, not vibes)
Every verdict cites file:line AND a ride log path; the table covers all E3–E10 door contracts (count stated, matched against `public/skill.md`'s list); `git status --short` shows only the audit doc, artifacts and the BACKLOG row.
End: READY-FOR-GATES + the per-era summary and the no-system list.

## No-op / honesty guard
If a contract cannot be ridden headless (name the refusal), record it as UNRIDDEN with the reason rather than guessing its verdict.
