# Task f2466-1-kit-guard-coverage-declaration: the kit guard refuses an empty door list and declares which contracts it actually asserted on (lane-a, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s2466, from that fire's own drain review of the guard this task edits.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; `reviews/kit-guard-generic-damage.md` (the drain review that found this — read its **Findings → F-2466-1** section and its **Teeth** table, both of which this task is authored from); `tasks/BACKLOG.md` row **F-2466-1**; `scripts/kit-guard.test.mjs` (the whole file — it is 252 lines and you are editing it); `assets/contracts/epoch-1-frontier/contracts.json` (look at `e1-drill-yard`'s `twist`, which is `{"secureWave":0}` — that is the shape this task is about); `public/skill.md` (the `skillmd-guard:door-contracts` block the guard reads its subject set from).

SEQUENCING LAW: verify the guard this task edits actually exists on main — `test -f scripts/kit-guard.test.mjs` must succeed AND `grep -q "kit-guard.test.mjs" package.json` must succeed (it is a `test:node-guards` leaf). If either fails, STOP and report "kit-guard-generic-damage not landed". ⚠️ Probe those two ARTIFACTS, never `git log --oneline | grep` for the slice name — a subject grep is satisfied by any commit that merely *announces* the thing (Mistake #16, and F-2457-2 recorded this exact gate deadlocking a sibling task).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-2466-1, measured s2466 at the drain of `kit-guard-generic-damage`, merge `0e8fd990e5feca236b2f00904373e72cc16ab4e8`)

The guard is sound for what it asserts, and this task does not question its damage logic. What it fixes is that **the guard cannot tell you what it did not check**, in two ways — both MEASURED during the drain, neither inferred:

1. **Five of its 36 door-contract tests assert nothing and pass.** `scripts/kit-guard.test.mjs:32` opens `for (const kind of fieldedKinds(contract)) {`, and for a contract that fields zero kinds that loop body never runs, so the test registers **no assertion at all** and `node --test` reports it green. The five are `e1-drill-yard`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `the-claim` — measured directly against the manifests as the only door contracts fielding zero kinds through `twist.enemyRoster`/`twist.baron`. **Proof by mutation:** with `Enemy.takeDamage` made a total no-op (every kind immune to everything), the guard reds **31 of 36** — those exact five stay green. So the real asserting set is **31**, while the guard's own footer at `scripts/kit-guard.test.mjs:48` prints `${doorIds.length} door contracts` = **36**.

2. **An empty door list passes green.** `scripts/kit-guard.test.mjs:24` reads `const doorIds = await readDoorIds();` and `:28` opens `for (const contractId of doorIds) {`. `readDoorIds()` asserts the `public/skill.md` block *exists* (`:208`) but never that it is *non-empty*. **Lever proven before this task was written (§0.7):** replacing that block's JSON with `[]` makes the guard report **1 test / 1 pass / 0 fail, rc=0** — green having checked zero contracts — against a control of **36 tests / 36 pass**.

⚖️ **Severity, stated honestly so you do not over-build:** this is **NOT** a false green about damage. Those five contracts do field enemies at runtime, through a default roster their manifest does not express; nothing is broken and the realised cost is zero. The problem is purely that a **shrinking subject set is indistinguishable from a passing one** — the shape this factory has cured repeatedly (F-2208-1: declare on the happy path too; F-2217-1: an empty subject set is not a clean board).

## Scope

1. **Refuse an empty door list.** In `readDoorIds()`, after the existing block-exists assertion, assert the parsed array is non-empty — a door list of zero is an instrument failure, never a clean board. Message must name the file and the marker so the reader knows which corpus went empty.
2. **Declare the asserting set, always — including the happy path.** Extend the `test.after(...)` footer at `scripts/kit-guard.test.mjs:41-49` so that, in addition to today's counts, it prints (a) how many door contracts contributed **at least one** asserted kind, (b) how many contributed **zero**, and (c) the **names** of the zero ones. Today that must read 31 asserting / 5 zero, naming the five. The line must print on a fully green run — a declaration that appears only on failure re-creates the ambiguity it removes (F-2208-1).
3. **Do NOT make a zero-kind contract a red.** ⚠️ This is a firewall on the *cure*, not a nicety: five door contracts are legitimately in that state today, so a hard assertion would red on ordinary correct operation and be excused into uselessness inside a week (F-1460-1, the `cross-engine` fate). **Declare, do not refuse.** The only new refusal in this task is scope 1.
4. **Mutation proof, both arms, quoted in the report.**
   - (a) Empty the `door-contracts` JSON block in `public/skill.md` to `[]` → the guard must now RED with your scope-1 message (it currently passes at 1 test / 1 pass / rc=0). Revert.
   - (b) On the unmutated tree, capture the scope-2 declaration line verbatim and confirm it reads 31 asserting / 5 zero and names `e1-drill-yard`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `the-claim`.
   Quote both, and confirm `git status --short` is clean after each revert.

## Firewall

Touch ONLY: `scripts/kit-guard.test.mjs`.

NO changes to: `src/systems/CombatSystem.ts`, `src/entities/Enemy.ts`, or any damage number or scale — the guard must keep measuring the shipped path, and moving that path invalidates every row in its table; `assets/contracts/**` — do NOT "fix" the five contracts by giving them an `enemyRoster` they do not have, that is a content change wearing a test fix's clothes; `public/skill.md` — mutate it for proof 4(a) and revert, never ship a change to it; `package.json` — the guard is already a `test:node-guards` leaf and needs no re-wiring; any other `scripts/*.test.mjs`; other tasks' fresh work.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean. `npm run build` green. `npm run test:node-guards` green **with the count stated** (it was **607 tests / 602 pass / 0 fail / 5 skipped, rc=0** at `0e8fd990e`, run alone; state what you measure and expect ~1265 s — run it ALONE, never beside another battery, because a contended battery manufactures reds on both sides of a handoff, F-2462-1/F-2462-3). The focused guard `node --test scripts/kit-guard.test.mjs` green at **36 tests / 36 pass** with the new declaration line visible in its output. Both mutation arms of scope 4 quoted, each with its revert confirmed clean.

End: READY-FOR-GATES + the verbatim declaration line, both mutation-arm results, and the `test:node-guards` count.

## No-op / honesty guard

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. If the five zero-kind contracts have changed in number by the time you run (main moves), that is EXPECTED and is not a reason to stop: report the new number, make the declaration state it, and say so. If you conclude scope 1 or scope 2 is the wrong cure, STOP and report your reasoning rather than substituting a different design — the finding is measured and the review file records the measurements, so argue against those.
