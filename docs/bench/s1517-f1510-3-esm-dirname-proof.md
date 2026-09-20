# s1517 — the F-1510-3 successor's directory source, PROVED IN THE SUBJECT TREE

Date: 2026-08-07
Fire: s1517
Subject: the one conjunct `eb301c3a` (s1516, negative result) refuted — how the Playwright config
learns the tested tree's directory when `__dirname` is undefined.

## Why this document exists

[F-1516-1] recorded the exact failure this fire set out not to repeat: s1516 priced the F-1510-3
successor with a probe in `/tmp/s1516-pw-probe`, a directory with **no `package.json`**, so Playwright
transpiled its config to **CommonJS** where `__dirname` exists. The probe returned a real sha and read
as conclusive. This repo is `"type": "module"` (`package.json:5`), so the identical config loads as
**ESM** and `__dirname` is undefined — which is precisely how the lane run stopped.

Its REC, verbatim: *"when a probe is built OUTSIDE the subject tree for isolation, state in the
pricing which properties of the subject the probe does NOT reproduce, and treat every one of them as
unproved."*

➡️ **So this pricing was measured inside a worktree of THIS repository** — same `package.json`, same
`playwright.config.ts`, same Playwright 1.61.1, same pinned Node 26.4.0 — in a detached gate worktree
`gate-s1517` (§3.0b custody: undecided content never entered main's working tree). The worktree was
removed at the end; `git worktree list` shows zero `s1517` entries.

## What was measured

### 1. The negative result reproduces, and `import.meta.dirname` is the cure

A temporary probe inserted into `gate-s1517/playwright.config.ts`, run via `npx playwright test --list`:

```text
S1517_PROBE import.meta.url=file:///Users/robin/Claude/Projects/Gold%20Rush/gate-s1517/playwright.config.ts
S1517_PROBE import.meta.dirname=/Users/robin/Claude/Projects/Gold Rush/gate-s1517
S1517_PROBE typeof __dirname=undefined
S1517_PROBE cwd=/Users/robin/Claude/Projects/Gold Rush/gate-s1517
```

`typeof __dirname=undefined` is `eb301c3a`'s finding, reproduced independently. `import.meta.dirname`
resolves.

### 2. It is CONFIG-ANCHORED, not merely equal to cwd — the discriminating run

The run above cannot distinguish "the config's directory" from "wherever I happened to be". Re-run
from the repo root against the worktree's config:

```text
$ npx playwright test --config gate-s1517/playwright.config.ts --list
S1517_PROBE import.meta.url=file:///Users/robin/Claude/Projects/Gold%20Rush/gate-s1517/playwright.config.ts
S1517_PROBE import.meta.dirname=/Users/robin/Claude/Projects/Gold Rush/gate-s1517
S1517_PROBE typeof __dirname=undefined
S1517_PROBE cwd=/Users/robin/Claude/Projects/Gold Rush
```

`dirname` = the config's tree; `cwd` = somewhere else. **The value tracks the tested tree, which is
the property the gate sentence requires.** It is therefore strictly better than `process.cwd()`, which
would have been the obvious alternative and would have named the wrong tree in exactly this
arrangement.

⚠️ **A trap for whoever reaches for the other candidate.** The seam in
`docs/bench/f1510-3-inventory-revision-metadata-negative-result.md` offers
`fileURLToPath(import.meta.url)` as an alternative. It works, but note the URL above is
**percent-encoded** — `Gold%20Rush`. This repository's path contains a space, so a hand-rolled
`import.meta.url.replace('file://','')` yields `/Users/robin/…/Gold%20Rush/…`, a path that does not
exist. `import.meta.dirname` returns the decoded path and avoids the question entirely. Prefer it.

### 3. The full mechanism serialises end-to-end — a REAL run, not `--list`

The candidate cure landed in `gate-s1517/playwright.config.ts`, then one real spec:

```text
$ npx playwright test _s106-prospector-boot-probe.spec.ts --project=desktop-chrome \
    --workers=1 --reporter=json
config.metadata = {"revision":"f56843b5b51b6265aef49bb1872aa48539ec074b","dirty":true,"actualWorkers":1}
stats = {"expected":1,"skipped":0,"unexpected":0,"flaky":0}
wall_s = 4.0
```

`f56843b5b…` is `gate-s1517`'s HEAD (main's tip at the time). `dirty: true` is correct — the config
itself was modified in that worktree.

🔑 **This settles the last conjunct without inheriting it.** `actualWorkers: 1` is Playwright's
injected key sitting alongside the two user-declared keys, in one object, in a real report. s1516
proved this by reasoning from `node_modules/playwright/lib/runner/index.js:6092` and s1516's failing
run showed it with fallback values; here it is with **live** values, in this tree.

### 4. The arrangement that preserves line 50 — measured, because the obvious one FAILS

The first implementation put the import and helper at the top of the file. It works, and it reds the
board:

```text
$ node scripts/law-pointer-guard.mjs
FAIL — 3 pointer problem(s):
  POINTER DRIFT scripts/fire.md -> playwright.config.ts:50
  POINTER DRIFT .claude/skills/drain/SKILL.md -> playwright.config.ts:50
  POINTER DRIFT tasks/goals.json[calibrate-suite-workers-v2] -> playwright.config.ts:50
      was: "workers: isFireShell ? 1 : undefined,"
      now: "// release-base-path.spec.ts → playwright.release-base.config.ts (release under /goldrush/ @5191)"
```

19 inserted lines pushed `workers:` from `:50` to `:69`. This is constraint (b) of the s1516 pricing,
**demonstrated rather than predicted** — and it rots three law surfaces a lane runner may not edit.

➡️ **The arrangement that holds:** the `metadata:` key goes **below** the `workers:` line inside
`defineConfig`, and the `import` plus a **`function` declaration** go at the **bottom of the file**.
ESM `import` declarations are hoisted and are legal anywhere at module top level; `function`
declarations hoist too, so the helper is callable from the object literal above it. Nothing is
inserted at or above `:50`. Re-measured in that shape:

```text
$ grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts
50:  workers: isFireShell ? 1 : undefined,

$ node scripts/law-pointer-guard.mjs
  pointers      : 26  (checked 23, illustrative 2, known-rotten 1)
PASS — every law-surface pointer still lands on the line it was written for.

$ npx tsc --noEmit
(rc 0, no output)

$ npx playwright test _s106-prospector-boot-probe.spec.ts --project=desktop-chrome \
    --workers=1 --reporter=json
config.metadata = {"revision":"f56843b5b51b6265aef49bb1872aa48539ec074b","dirty":true,"actualWorkers":1}
```

Identical capture, zero pointer rot. **A `const helper = () => …` will not work** — temporal dead
zone — and would force the helper above `:50`.

### 5. Constraint (a) re-measured on today's main, not inherited

```text
git status --porcelain                       → 142 entries
git status --porcelain --untracked-files=no  →   6 entries
```

s1516 measured 128 / 8; today it is 142 / 6. The ratio is the point, not the numbers: a `dirty`
marker built on bare `--porcelain` labels essentially every run dirty and carries no information.
**`--untracked-files=no` is mandatory.**

⚠️ **Stated as unproved, per the F-1516-1 discipline I am applying to my own work:** the run in §3
used bare `--porcelain`. The tracked-only flag is a one-token change to an `execFileSync` argument
list and does not touch the module system, the hoisting, or the serialisation — but **I did not
re-run the end-to-end capture with the flag in place**, and the successor's self-check requires the
runner to do so. I am not claiming a measurement I did not take.

## The proved diff

Saved verbatim at `logs/session-scratch/s1517-proved-config-diff.patch`. Shape:

```diff
@@ playwright.config.ts @@
   workers: isFireShell ? 1 : undefined,
+  metadata: captureRevision(),
@@ end of file @@
+import { execFileSync } from 'node:child_process';
+
+function captureRevision(): { revision: string; dirty: string | boolean } {
+  try {
+    const cwd = import.meta.dirname;
+    const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
+    const dirty = execFileSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8' }).trim().length > 0;
+    return { revision, dirty };
+  } catch (error) {
+    console.error('revision metadata could not be recorded: ' + String(error));
+    return { revision: 'unrecorded', dirty: 'unrecorded' };
+  }
+}
```

The successor master mandates `--untracked-files=no` on the `status` call per §5, and a trailing
newline (the probe patch ends without one).

## What remains for the lane

Only scopes 2 and 3 of the s1516 master carry real risk now, and both were already proved
red-then-green by the `eb301c3a` runner against the pre-change reducer
(`tests 10 / pass 7 / fail 3`, each failure the expected missing-output assertion for its arm). The
config half — the half that stopped the last run — is measured here.

Related: [F-1510-3], [F-1514-1], [F-1516-1].
