# s1232 — F-1232-1 mutation battery (retention mirror)

Raw evidence for F-1232-1. Mirrored into git per the RETENTION LAW; nothing here
was deleted from disk.

Subject: `scripts/run-guards.mjs`'s header claim — *"These cover `scripts/**` and
the worker code, which tsc does NOT type check"*.

---

## 0. The denominator (why the claim was false)

`test:node-guards` is a hand-written roster of 19 test-file names. Walking the
import graph out of those 19 plus the other guard entrypoints
(`test-ticker-stats`, `test-accounts`, `test-multiplayer`,
`check-power-graph-budget`, `run-guards`, `task-guard-audit`, `test-stats`):

```
total scripts/*.mjs : 174
reachable           : 31
UNREACHABLE         : 143
  ...of those, not a _s* one-shot        : 103
  ...of those, referenced by sh/pkg/skills: 56
```

The 56 live-but-unreachable include `art-staging-audit.mjs`,
`drain-block-check.mjs`, `extract-alpha.mjs`, `status-line1.mjs`,
`assert-release-build.mjs`, `diff-release-assets.mjs`, `asset-diet.mjs`,
`mint-prize-codes.mjs`, and the 19-file `anim-pass-*` art chain.

## 1. Pre-cure state of the tree (so the guard could not be tautological)

```
scripts/*.mjs      174 scanned, 4.3s serial, PRE-EXISTING BREAKS: 0
scripts/*.sh        23 scanned,             breaks: 0
rehearsal/**/*.mjs  25 scanned,             breaks: 0
foundry/kit         1 .mjs + 5 .sh,         breaks: 0
```

## 2. HOLE ARMS — measured BEFORE any cure was written

### Arm A — `scripts/art-staging-audit.mjs` (mandated by the ART-SLOT LAW)

Planted `if (true) { const x = 1;` (unclosed) at the first real code line.
Confirmed a genuine break first: `node --check` rc=1, `SyntaxError: Unexpected
token '{'`.

> A first attempt planted the same line at index 40 and `node --check` returned
> **rc=0** — it had landed inside the file's header block comment. Recorded
> because it is the whole lesson in miniature: a mutation is a hypothesis, and an
> unvalidated one produces a green that means nothing.

```
npx tsc --noEmit   rc=0
npm run build      rc=0
run-guards.mjs     rc=0
  PASS  rc=0  17s  test:node-guards
  PASS  rc=0   0s  test:power-budget  p95=0.340ms
  PASS  rc=0   4s  test:stats
  PASS  rc=0   2s  test:accounts
  PASS  rc=0   4s  test:mp
  PASS  rc=0  80s  test:deploy-contract
  PASS  rc=0   1s  test:deploy-site-contract
  PASS  rc=0   0s  test:task-guards
  guards: 8/8 passed
```

### Arm B — `scripts/deploy-site.sh` — **CAUGHT** (the negative result)

Planted an unterminated `if [ -d site ]; then`. `bash -n` rc=2.

```
run-guards.mjs  rc=1
  ...
  FAIL skip-no-wrangler: expected stdout to contain 'SKIP: wrangler not installed',
       got: .../repo/scripts/deploy-site.sh: line 70: syntax error: unexpected end of file
  deploy-site contract FAIL (7 assertion failure(s))
  guards: 7/8 passed -- RED: test:deploy-site-contract
```

`deploy-site.sh` is gated only because `test-deploy-site-contract.sh` **executes**
it in a temp repo. Coverage in `scripts/` is a side effect of execution, never of
reading the tree. That is why the cure is a parse check over the whole tree rather
than one more name on the roster.

Both subjects restored byte-identical:
`git ls-files -s` → `00ef147d…  scripts/art-staging-audit.mjs`,
`184bdb0b…  scripts/deploy-site.sh`; `git status --porcelain scripts/` empty.

## 3. THE CURE

`scripts/script-tree-parse.test.mjs`, wired into `test:node-guards` (already in
`GATE_GUARDS`, so it runs on every drain regardless of paths touched).

```
✔ every scripts/**/*.mjs parses    (604.8ms)
✔ every scripts/**/*.sh parses     (  9.8ms)
✔ every rehearsal/**/*.mjs parses  (105.3ms)
✔ every foundry/**/*.mjs parses    ( 23.8ms)
✔ every foundry/**/*.sh parses     (  3.1ms)
tests 5 · pass 5 · fail 0 · duration_ms 783.5
```

Concurrency pool of 8: 4.3s serial → 0.6s for the 174-file walk.

## 4. CURE ARMS — 6/6, each red checked by assertion NAME and asserted to be the ONLY red

```
A scripts/.mjs law-mandated (art-staging-audit) | rc=1 | RED=["every scripts/**/*.mjs parses"]   | targeted=YES | ONLY=YES | restored=YES
B scripts/.sh  no contract test (health-watch)  | rc=1 | RED=["every scripts/**/*.sh parses"]    | targeted=YES | ONLY=YES | restored=YES
C rehearsal harness (lib.mjs)                   | rc=1 | RED=["every rehearsal/**/*.mjs parses"] | targeted=YES | ONLY=YES | restored=YES
D _s* throwaway (_s150_lock.mjs)                | rc=1 | RED=["every scripts/**/*.mjs parses"]   | targeted=YES | ONLY=YES | restored=YES
E foundry/kit/init.mjs                          | rc=1 | RED=["every foundry/**/*.mjs parses"]   | targeted=YES | ONLY=YES | restored=YES
F foundry/kit/fire-runner.sh                    | rc=1 | RED=["every foundry/**/*.sh parses"]    | targeted=YES | ONLY=YES | restored=YES

6/6 CLEAN: true
```

Arm D exists to prove the header's "`_s*` included on purpose" is a real property
and not a decorative sentence. Arms E/F cover `foundry/kit`, which s1230 counted
as "1 file" and is in fact 1 `.mjs` + 5 `.sh`.

## 5. THE BEFORE/AFTER — the identical defect through the real drain gate line

Arm A replanted, cure in place:

```
node scripts/run-guards.mjs --changed-since 21eee40a
  run-guards: 5 file(s) changed since 21eee40a
  FAIL  rc=1  16s  test:node-guards
  PASS  rc=0   0s  test:power-budget  p95=0.316ms
  PASS  rc=0   0s  test:task-guards
  guards: 2/3 passed -- RED: test:node-guards
rc=1   (read from spawnSync().status, never the printed counter — F-1125-1)
```

**Same break, same command: rc=0 at the start of this fire, rc=1 at the end.**

## 6. Residual — stated so it cannot be mistaken for done

1. The count **floors** and the missing-directory assertions are structural
   (`assert.ok` on a walked count) and are **NOT mutation-proven**. Proving them
   means removing files from the tree, which the RETENTION LAW makes the wrong
   move for a probe; the cheapest honest proof is a fixture tree, and I did not
   build one.
2. Parsing is the **floor, not the ceiling** — this cannot see a wrong flag, a bad
   path, or a logic error, and it is no substitute for a contract test for any
   script that has one.
3. `scripts/` also holds **4 `.py`** and **2 `.ts`** files that nothing checks;
   `site/styles.css` (11.8 KB) is still read by nothing (s1231's residual,
   untouched).
