# Task 040: stop the runaway pending-order generator (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; s71/s72 fire handoffs in STATUS.md (RUNAWAY flag); vite.config.ts crafting middleware; src/crafting/ (CraftingQueue, AssayBench). Pre-flight: zero staged/modified TRACKED files (`??` untracked expected — list briefly, proceed).

## Why (fire-flagged 2026-07-06 s71, live bleeding)
`assets/crafting-queue/pending/` keeps refilling with IDENTICAL `local_prospector` brass-pan orders — s71 found dupes, s72 batch-verdicted TEN of them. Something posts the default-profile sample order repeatedly (suspects: a boot path that re-posts the sample/demo order every page load — and gate runs boot browsers constantly; or a bench init that posts when history is empty). Every dupe burns an assayer fire slot. The 036 fix cleaned the m5-04 TEST harness; this is a different, runtime path.

## Scope
1. **Root-cause it**: find exactly what posts orders without an explicit player action (grep the post path callers; boot the dev server twice with `?debug` and without, diff pending/ — it must NOT grow on boot).
2. **Fix at the source**: sample/demo orders must never auto-post. Posting happens ONLY on an explicit bench submit.
3. **Dupe guard (belt + braces)**: the middleware rejects a pending write whose id already exists in pending/, approved/, or rejected/ (contract ids are deterministic by design — use that); respond with a distinguishable status the bench can show ("already at the works").
4. **Sweep**: move the existing identical brass-pan dupes out of pending/ (a `_dupes/` sibling folder is fine — rm is not allow-listed); keep exactly one canonical copy if none is verdicted yet (s72 may have verdicted them all — check approved/rejected first; if verdicted, pending copies are pure dupes).
5. **e2e**: boot → no new pending file appears; boot again → still none; explicit post → exactly one; re-post same text same profile → guarded, bench shows the notice; m5-04 suite + pending-clean law still green.

## Firewall
Touch ONLY: the auto-post source you identify, vite.config.ts middleware (dupe guard), bench notice copy, e2e. NO changes to: contract validation rules, verdict file shapes, assayer protocol (fires own it), 036's harness fixes, sim systems.

Self-check: tsc/build green; the boot-twice proof recorded in your report (ls pending/ before/after); full m5-04 + m2-01 + lane-c-activations green both projects; task-025 + m1-01 unmodified green. End: READY-FOR-GATES + root cause named + files + results.
