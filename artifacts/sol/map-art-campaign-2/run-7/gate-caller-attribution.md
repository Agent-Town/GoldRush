# New union test requires one roster entry

After Picnic was committed, `test:gate-callers` correctly identified `scripts/landmark-collision.test.mjs` as a new tracked test without a persistent battery caller. The earlier pre-commit 3/3 result did not include this then-untracked file; it is not evidence that the committed state passes. The scoped command explicitly runs all six union assertions, which pass, but the permanent battery still needs the same test.

The concrete fix is to add `scripts/landmark-collision.test.mjs` to the `node scripts/run-node-guards.mjs ...` arguments in package.json's `test:node-guards` script. This is outside the task's explicit file firewall; permission was requested on 2026-09-22. Until authorized and rechecked, this gate is **HELD**, not a baseline failure. No baseline exclusion, naming bypass, or assertion change was made.

[Prepared one-line roster patch](package-test-roster.patch) is reviewable and unapplied. It leaves every existing test and battery command in place.
