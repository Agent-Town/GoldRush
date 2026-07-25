# Task lane-b-deploy-honest-and-serialized: the deploy must report WHY it failed, and must not upload a `dist/` another process is rewriting (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED s1048, 2026-07-25 (attended review welcome).** Closes **F-1048-4** and **F-1048-5**, both
measured by this fire while gating `e718b7cc` — not inherited, not reasoned about.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`).
CODEX: model=gpt-5.6-sol effort=high

READ FIRST (paths, not memory):
- `AGENTS.md`
- `scripts/deploy.sh` — the whole file (it is ~76 lines). Note its stated law at `:3-4`, `STRICT` at `:8`,
  `finish()` at `:22-27`, the wrangler/auth checks at `:60-63`, the deploy at `:67`, the **failure note at `:74`**
- `reviews/asset-diet-budget-runnable.md` — the drain that found both defects, with the log evidence
- `logs/deploy.log` — the primary evidence. Search it for `21:25:49`, `21:41:37`, `ENOENT`, and `23:03`

> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
>
> (Sanity-check rather than trust me: at authoring time `lane/m4`'s only ahead commit was `e37a1d67`, which merged to main as **`e718b7cc`** — a safe dupe.)

## Why (measured by the s1048 fire while gating the asset-diet budget slice)

`bash scripts/deploy.sh` ran end-to-end for **969s and exited 0** — the never-block law works — and the new
budget leg behaved perfectly. **Then wrangler failed and nothing was published.** Two separate defects made
that outcome both likely and hard to diagnose.

**F-1048-4 — the failure note misdiagnoses its own failure.** `:74` prints the *same hardcoded guess* for
every wrangler failure: *"auth expired? project missing? owner: wrangler login / pages project create
gold-rush"*. `logs/deploy.log` holds **two wrangler failures today with entirely different causes, and
neither is auth**:
- `21:41` — `Error: {"errno":-2,"code":"ENOENT","syscall":"open","path":".../dist/assets/index-CQNr9KPZ-diet-576343bc.js"}`
- `23:03` — an empty `Error: {}` after 15.5 minutes of uploading

The real wrangler output **is already captured** in `$CAPTURE` and `cat` into `$LOG` at `:73` — the note just
doesn't use it. **An owner following the printed advice would run `wrangler login`, succeed, and still fail.**

**F-1048-5 — `deploy.sh` takes no exclusive lock, and a second run rewrites `dist/` under the first one's
upload.** The log proves the mechanism: the `21:25:49` run began uploading at `21:26:03`; a **second
invocation started building at `21:41:37`**, rewriting content-hashed filenames in `dist/` while the first
upload was still enumerating them — hence `ENOENT` on a file that existed when the upload started and was
gone when it was read. Uploads take **15+ minutes** against a ~118MB `dist`, and **DEPLOY LAW has every fire
call this script**, so overlap is likely rather than exotic. This is Mistake #12 (Gate Contamination)
reaching the deploy path.

## Scope (numbered, each independently testable)

1. **Reproduce before you change anything, and put the evidence in your report.** Run `bash scripts/deploy.sh`
   and paste the `[deploy]` lines plus the wrangler error from `logs/deploy.log`. State plainly whether the
   failure you observe is the ENOENT class, the empty-`Error: {}` class, or something new. **If it now
   succeeds, say so** — that is a legitimate outcome and changes nothing about scopes 2–3, which are about
   the failure PATH, not about whether it fired today.

2. **F-1048-4 — report the captured error instead of guessing.** Change `:74` so the failure note surfaces
   the **actual wrangler output** (e.g. the last non-empty line, or the first line matching `Error`/`ERROR`,
   truncated to something readable) alongside the `see $LOG` pointer. Keep a *short* generic hint only as a
   trailing suffix, and only when the captured text is empty. **The test:** an operator reading one `[deploy]`
   line must be able to tell an auth failure from a missing-file failure from a timeout **without opening the
   log**.

3. **F-1048-5 — serialize the deploy.** Two runs must not upload concurrently. Take an **exclusive lock**
   around the build+budget+upload section (`mkdir` is the portable atomic primitive; a lockfile carrying the
   pid so a *stale* lock can be detected and reclaimed is better). If the lock is held by a live pid: **log
   it and exit 0 in default mode** — this is a skip, not a failure, and `:3-4`'s never-block law applies.
   Release the lock on every exit path, including the `finish()` ones and signals — verify by reading
   `finish()` and the existing `trap` at the budget leg before you write yours.
   *Alternative, if you judge it stronger — say why in your report:* upload from an **immutable snapshot** of
   `dist/` (copy or hardlink to a temp dir, `wrangler pages deploy <snapshot>`), which removes the race at the
   source rather than serializing around it. Either is acceptable; a lock that leaks on a `finish()` path is not.

4. **The never-block law is the firewall around all of this.** After your change, in default (non-`--strict`)
   mode, `bash scripts/deploy.sh` must **still exit 0** for: wrangler missing · token missing · budget over ·
   lock held · wrangler failing. Prove each of the five you can reach, with the exit code printed. `STRICT=1`
   behaviour must be unchanged for existing cases.

5. **Do not chase the `Error: {}` cause.** It is recorded **UNVERIFIED** on purpose (most plausible: an upload
   timeout on the owner's <10Mbit line). Scope 2 exists precisely so the *next* occurrence identifies itself.
   If your scope-1 run happens to reveal the cause, **report it — do not fix it here.**

6. **No-op guard.** If you are about to exit without changes, WRITE WHY into your report first.

## Firewall

**Touch ONLY:** `scripts/deploy.sh`.

**NO changes to:** the asset-budget leg merged as `e718b7cc` (its threshold, its `--grep`, its `sed`, its
temp-cwd isolation — all of it is load-bearing and was just gated) · `:3-4`'s never-block law or `finish()`'s
`exit 0` default · the `.env.local` / `CLOUDFLARE_API_TOKEN` auth path (a fire cannot re-auth — F-1024-4) ·
anything under `src/` or `e2e/` · `package.json` · new dependencies (`flock` is NOT on macOS by default —
if you reach for it, you have left the firewall).

## Self-check before you report (evidence, not vibes)

- `bash -n scripts/deploy.sh` clean, and `shellcheck scripts/deploy.sh` if available (report, don't install).
- Scope 1's before-evidence and an after-run, both pasted with their `[deploy]` lines and exit codes.
- **The five never-block cases from scope 4, each with its printed exit code.**
- **A demonstrated lock collision:** start one run, start a second while the first holds the lock, paste the
  second's skip line and its **exit code 0**. (Two terminals, or background the first — your choice.)
- **A demonstrated honest diagnostic:** force a wrangler failure you control (e.g. a bogus
  `CLOUDFLARE_API_TOKEN` in the environment for one run, or a temporarily bad project name) and paste the
  `[deploy]` line proving the **real** cause is now visible without opening the log. Restore anything you
  touched and prove it with `git diff`.
- `npx tsc --noEmit` clean · `npm run build` green (this task touches no TS, so these are regression checks).

END: **READY-FOR-GATES** + scope 1's reproduction verdict, the five never-block exit codes, the lock-collision
paste, the honest-diagnostic paste, and one plain sentence on which approach you took for scope 3 and why.
