# Task lane-queue-guard-ancestry-union: make the queue guard's "already shipped" test independent of which English word a drain happened to write (lane-a, commit prefix "guard:")

**FIRE-AUTHORED s1118 (attended review welcome). SCOPED `scripts/` CHANGE — one file, plus its evidence file. No `src/`, no `e2e/`.**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4).
> `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run
> quietly falls back to the default effort.

READ FIRST: `AGENTS.md`; `scripts/drain-block-check.mjs` **in full** (187 lines — you are changing two of them, but the file's header comment is the contract you must not break); `reviews/queue-shipped-guard.md` (the predecessor that built `--queue`, merged `d39e831a`); `tasks/goals.json` (data only — **do not edit it**).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1118 pre-measured this for you and you must still re-verify it yourself: `lane/m3` was 1 ahead at `4fd208b4`, whose single added file `reviews/lane-cw-02-wrecker-movement-diagnosis.md` is blob `d75e012a`, **byte-identical to main's copy** — a SAFE DUPE, so the reset is loss-free. The worktree was CLEAN, zero dirt lines.)*

## Why (F-1117-1, measured; and F-1118-3, measured this fire — read both before you design anything)

`scripts/drain-block-check.mjs --queue` exists to stop **Mistake #8**: queueing a master whose work is already on main (the original cost a 824,000-token Codex crash). It decides "already shipped" at `:174` by looking the leaf's `status` string up in `TERMINAL_SHIPPED_STATUSES` (`:33`), currently `new Set(['merged','shipped'])`.

**That whitelist has been wrong three times in two days**, and each time the missing word was only discovered by a victim:

- built with `{'merged'}` — s1116's runner found a second live word, `shipped` (8 leaves), and added it;
- s1117 ran the guard on a master **drained 20 minutes earlier** and got **`✅ CLEAR … status="diagnosed"`, exit 0** — because three drains had written the lifecycle as `diagnosed`. Two of those were verified ancestors of main, i.e. **two live Mistake-#8 landmines reading CLEAR.** s1117 defused both by hand (`c81f57e1`).

A whitelist of English words is the wrong **shape** for the question "is this work already on main?", because that question has an exact, string-independent answer: **`mergeHash` present AND `git merge-base --is-ancestor <mergeHash> main`.**

### ⛔ BUT THE OBVIOUS FIX IS A TRAP, AND s1118 MEASURED IT BEFORE WRITING THIS TASK

s1117 proposed ancestry as a **replacement** for the whitelist. **Do not do that.** s1118 ran the numbers over all **126** leaves in `tasks/goals.json` (status census: `merged` 115 · `shipped` 8 · `diagnosed` 2 · `blocked` 1; 121 carry a `mergeHash`):

| Question | Measured answer |
|---|---|
| Leaves that ancestry would catch which the whitelist does **not** already catch | **0** |
| Terminal-status leaves whose `mergeHash` is **NOT** an ancestor of main (orphans) | **2** — `m1-m2-resource-guards`, `factory-diet-gate-honesty` |
| Terminal-status leaves with **no `mergeHash` at all** | **3** — `town-plaza-slot-diagnostics`, `m2-05-geometry-settle`, `contract-art-key-adoption` |

So **replacing** the whitelist with ancestry would refuse **5 fewer** already-shipped masters than today while catching **zero** new ones — it would *mint five fresh Mistake-#8 landmines in the name of fixing one.* These are not hypothetical: `m1-m2-resource-guards` records `d93b1505`, which is **not** an ancestor, while its real shipping commit `f7cd0103` ✓ **is** (s1118 verified both with `git merge-base --is-ancestor`). The work is genuinely on main; only the recorded hash is wrong (F-1116-2's pre-amend-orphan shape).

➡️ **THEREFORE THE DESIGN IS A UNION (LOGICAL OR), NOT A REPLACEMENT.** Refuse to queue when **either** test fires. That keeps all 123 of today's refusals, costs nothing today, and buys the real prize: the **next** unknown status word — a fourth one *will* be invented — is refused automatically by the ancestry arm, without anyone having to notice it first.

## Scope (numbered; each item is testable)

1. **Add a defensive ancestry helper to `scripts/drain-block-check.mjs`.** Given a `mergeHash` string, return `true` only if the commit exists AND is an ancestor of `main`. It must **never throw and never hang**: use `execFileSync('git', [...])` (never a shell string), wrap in try/catch, return `false` on any failure, and pass a timeout. A hash naming a commit that no longer exists must return `false`, not crash. Verify the object exists (`git cat-file -e <hash>^{commit}`) before asking about ancestry, because `merge-base --is-ancestor` on an unknown object is an error, not a `false`.

2. **Make the `--queue` refusal a union at `:174`.** It must fire when `TERMINAL_SHIPPED_STATUSES.has(leaf.status)` **OR** the leaf's `mergeHash` is ancestry-confirmed. **Print which arm fired** — a fire reading the output must be able to tell "refused because status=merged" from "refused because the hash is on main though the status said `diagnosed`". The existing two output lines (the `⛔ ALREADY SHIPPED` line and the `mergeHash="..."` line) must remain, so existing readers do not regress.

3. **THE FIREWALL-CRITICAL CONSTRAINT — the DEFAULT contract must stay byte-identical.** `fire.md` §3.0 pins the **default** (no-`--queue`) invocation as law for every drain in the factory. Therefore **no git subprocess may run on the default path at all** — put the ancestry call strictly inside the `--queue` branch. This is both a correctness rule and a speed rule (§3.0 is advertised as costing one second). Prove it as described in the self-check.

4. **Mutation controls, BOTH directions** (this is the part that makes the task worth running — a green test proves nothing here):
   - **Positive:** temporarily point a *terminal* leaf's status at a nonsense word (e.g. `"banana"`) **in a scratch copy of `goals.json`, never the real file** — with a real ancestor `mergeHash`, `--queue` must STILL exit 1. That is the whole point of the change: it must refuse a word nobody enumerated.
   - **Negative:** a leaf with a **non**-ancestor `mergeHash` and a non-terminal status must STILL exit 0. Use the real live case rather than inventing one: `calibrate-suite-workers` records `9614b7eb`, which ✓ s1118 verified is **`lane/perf`'s branch TIP and NOT an ancestor of main**, while its own recorded outcome reads *"GOAL NOT MET"*. It must stay CLEAR — a fire must still be able to re-queue genuinely unfinished work.
   - Report both as a table with the exact commands and exit codes.

5. **Write the evidence file** to `reviews/queue-guard-ancestry-union.md`: what changed, the two mutation controls, the default-contract sweep from the self-check, and the before/after refusal counts over all leaves.

## Firewall

**TOUCH-ONLY:** `scripts/drain-block-check.mjs` · `reviews/queue-guard-ancestry-union.md` (new).

**NO:**
- **NO `src/` files. NO `e2e/` files.** Neither is involved.
- **NO edits to `tasks/goals.json`.** It is the guard's *input*; editing it to make a test pass is writing the guard from the answer sheet. Scratch copies for scope 4 are fine — in a temp path, deleted before you finish.
- **NO edit to the `--all` path** (`:103-111`) and **NO edit to the BLOCKED path** (`:119-156`). Owner gates must keep working exactly as they do; the `rf-34` leaf is live and owner-gated.
- **NO removal of `TERMINAL_SHIPPED_STATUSES`** and no removal of any word already in it. This is a union — the whitelist arm stays, for the five leaves measured above that only it can catch.
- **NO shell-string subprocess** (`execSync` with interpolation). A `mergeHash` comes from a JSON file; treat it as untrusted input and pass it as an argv element.
- **NO new dependency, no network, no `npm install` of anything new.**
- **NO widening of scope into the 524 leafless masters** (F-1116-1). They exit `UNKNOWN` and that is an attended decision, not yours.

## Self-check (evidence, not vibes)

⚠️ **`npx tsc --noEmit` DOES NOT COVER `scripts/`** — `tsconfig` `include` is `["src","e2e","playwright.config.ts"]` (s1116 verified this at source). **So tsc passing tells you NOTHING about this change, and you must say so plainly in your report.** The CLI runs below **are** the gate.

1. `npx tsc --noEmit` clean and `npm run build` green — report both, and state explicitly that they are **vacuous** for a `scripts/`-only diff.
2. **Default-contract proof (the firewall-critical one).** Sweep the default invocation over **every** leaf `taskFile` in `goals.json` plus these shapes, using **both** plain and `--strict`, against a pristine `git show main:scripts/drain-block-check.mjs` copy AND your modified one, and diff the two outputs: they must be **byte-identical, zero diffs**. Include: a branch name (`lane/m3`), `--all`, and a `do-not-drain`-marked done-move filename. Report the total invocation count and the diff count. (s1116 did exactly this sweep for the predecessor — 260 invocations, 0 diffs. Match or exceed that shape.)
3. **Queue-mode sweep over every leaf**, before and after. Report the refusal counts both ways and confirm: **no leaf that was refused before is cleared now** (this is the regression that matters), and `rf-34` still takes the **BLOCKED** path, not the shipped-notice path.
4. The two mutation controls from scope 4, as a table with commands and exit codes.
5. `git diff --name-only main...HEAD` pasted verbatim — it must list **exactly** the two files in TOUCH-ONLY and nothing else.

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

**A STOP is a success if you can name what stopped you.** In particular: if you find that the union cannot be implemented without a git call on the default path, **stop and say so** rather than sacrificing the §3.0 contract — that contract protects every drain in the factory, and this guard protects only the authoring step.

End: READY-FOR-GATES + which arm refused which leaves, the default-contract diff count, both mutation-control results, and the before/after refusal counts.
