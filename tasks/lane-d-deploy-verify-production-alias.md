# lane-d — deploy: verify the host the FAMILY opens, and repair the contract test that stopped guarding it (F-1050-1 + F-1050-2 + F-1052-1)

**FIRE-AUTHORED (attended review welcome)** — s1052, 2026-07-26.
**ROLE:** Codex implementer. **WORKDIR:** `worktrees/lane-d` (branch `lane/perf`).

> ✅ **PRE-FLIGHT (safe — verified by the authoring fire, 2026-07-26T01:4xZ).**
> `git rev-list --count main..lane/perf` = **0**: the lane holds no unmerged content, so the standard
> reset-to-main pre-flight is loss-free. No SAFE-DUPE reasoning is needed for this lane.
> `scripts/deploy.sh` on main is current at `00f5d464` and **no other task is editing it** (all six queues
> were empty when this was authored) — so unlike its two predecessors, this master has no sequencing gate.
> Still: re-read the file on main before writing. Do not trust the line numbers quoted below.

## READ FIRST (paths, not memory)
- `scripts/deploy.sh` — **as it exists on main now**, not as quoted here.
- `scripts/test-deploy-contract.sh` — the contract test. **It is currently RED. Read it before you touch it.**
- `reviews/deploy-verify-published.md` §Findings — F-1050-1 and F-1050-2 in their author's own words.
- `logs/deploy-result.json` — the artifact the real 2026-07-25 deploy wrote. It is the proof of F-1052-1.

## WHY (quoted evidence, dated)

**F-1050-1** (`reviews/deploy-verify-published.md:101-108`, s1050, verbatim): *"`URL` is `grep -oE …` — for
Cloudflare Pages that is the **deployment-specific** hostname (`https://<hash>.gold-rush-3in.pages.dev`),
which is guaranteed to serve the bytes just uploaded. The URL the family opens is the **production alias**
(`https://gold-rush-3in.pages.dev`), and F-1049-1 was discovered precisely by reading *that* host. A
deployment can verify green at its own hostname while the alias still serves an older build."*

That is the whole defect in one sentence: **the confirmation asks the one host that cannot disagree.**
F-1049-1 — the family sitting 174 commits behind while the log said `DEPLOYED ok` — was found by reading
the alias. The fix that closed it does not read the alias. The next successful deploy would therefore print
`VERIFIED published <hash>` on evidence that could not have caught the original bug.

**F-1052-1 — NEW, found by the authoring fire, and it is why this is worth a lane rather than a rider.**
`scripts/test-deploy-contract.sh:35` asserts the result JSON's keys are exactly `commit,outcome,ts,url`.
The shipped `deploy.sh:20` writes **five** fields — `logs/deploy-result.json`, written by the real deploy
attempt of 2026-07-25T17:49:02Z, reads verbatim:

```
{"outcome":"deploy_failed","url":"","publishedBuild":"00f5d464","commit":"00f5d464fc…","ts":"2026-07-25T17:49:02Z"}
```

Sorted, that is `commit,outcome,publishedBuild,ts,url`. **The assertion throws on every one of the seven
`run_case` calls, so the whole file is red** — and it has been since `00f5d464` added `publishedBuild`.
Two consecutive deploy correctives shipped without their own contract test ever being run. This is the same
family as F-1049-1 / F-1047-1 / F-1044-1, one layer down: **a guard nobody runs is not a guard.**
*(Authoring fire's honesty note: script execution is permission-gated for fires, so this red is proven by
reading `:20` against `:35` and against the real artifact above — it was NOT executed. Your first act is to
run it and paste the actual failure.)*

A second break in the same file, independent of the first: `run_case strict-success` expects
`deployed`/rc 0, but the stub prints `https://stub-gold-rush.pages.dev` and the confirmation leg then makes
a **real network fetch** to a domain that does not exist → `unreachable` → `deploy_unverified`/rc 7.
So the test is not merely red, it is also **non-hermetic** — it reaches the internet to decide a unit result.

Owner stake (CLAUDE.md §4.1, DEPLOY LAW): *"the family plays the latest gated build at the Pages URL."*
The Pages URL in that sentence is the alias. Verify the sentence the law actually makes.

## SCOPE (numbered, each independently testable)

1. **Confirm against the production alias — the host the family opens.**
   Introduce one configurable value near the top of `deploy.sh`:
   `PAGES_PRODUCTION_URL="${GR_PAGES_PRODUCTION_URL:-https://gold-rush-3in.pages.dev}"` (the default is the
   host already hardcoded in `scripts/second-rider.mjs:7` and `scripts/fetch-bugs.mjs:9` — do not invent a new one).
   The post-deploy confirmation fetches **`$PAGES_PRODUCTION_URL/version.json`** and compares its `build`
   to `PUBLISHED_BUILD`. Match → `note "VERIFIED published <build> at <alias>"` → `deployed`.
   Mismatch or unreachable → `deploy_unverified`, with the message naming **the alias and what it actually
   serves**, e.g. `UNVERIFIED: uploaded <published> but https://…pages.dev/version.json says <live>`.
   **Do not reason about which host wrangler happened to print.** The captured `$URL` stays exactly as it is —
   it is the deployment receipt and belongs in the log and in `deploy-result.json`. This scope item changes
   only *which host the confirmation asks*.

2. **Give the alias a bounded chance to propagate — do not invent a new false red.**
   Cloudflare promotes a deployment to the alias asynchronously. A single immediate fetch can report a stale
   alias for a deploy that is perfectly fine. Retry the alias fetch a small, bounded number of times
   (suggested: up to 3 attempts, ~15s apart, ≤60s total, each with the existing ~20s timeout) and stop at the
   first match. Log one line per attempt so the wait is visible rather than mysterious. **Bounded** is the
   word that matters: this must never become an unbounded wait, and the never-block law (`deploy.sh:3-4`)
   is unchanged — default mode still exits 0 on every path.

3. **F-1050-2 — say the real condition when wrangler exits 0 with no URL.**
   Per `reviews/deploy-verify-published.md:110-116`: when `DEPLOY_RC` is 0 **and** `URL` is empty, that case
   is exactly the F-1049-1 signature and must say so — use the explicit
   `"wrangler exited 0 but published no URL"` wording *regardless of what the capture holds*, instead of
   falling through to the last-non-empty-line fallback that produced
   `FAILED: pages deploy — Uploading... (1335/3053)`. When `DEPLOY_RC` is non-zero, keep the existing
   `ERROR`-line extraction exactly as it is — that extraction is a predecessor's proven work (F-1048-4).

4. **Repair `scripts/test-deploy-contract.sh` so it guards the CURRENT contract (F-1052-1).**
   - Update the key assertion to the real field set (`commit,outcome,publishedBuild,ts,url`) and assert
     `publishedBuild` is a non-empty string on the paths that reach the upload.
   - Make it **hermetic**: no case may touch the network. Point `GR_PAGES_PRODUCTION_URL` at a throwaway
     local `node` HTTP server started by the test (bind `127.0.0.1` on an ephemeral port; shut it down in the
     existing `trap … EXIT`). This is the same knob scope 1 adds — a real config value, not a test-only seam.
   - Keep all seven existing cases passing, and **add these**, each of which must fail if scope 1–3 is reverted:
     a. alias serves the just-published build → `deployed`, strict rc 0, and the log says `VERIFIED`;
     b. alias serves an **older** build → `deploy_unverified` (strict rc 7), message naming both builds;
     c. alias unreachable/HTTP 500 → `deploy_unverified`, never a hang, never a crash;
     d. alias stale on the first attempt then correct → `deployed` (proves scope 2's retry, and proves it
        terminates);
     e. wrangler exits **0 printing no URL** → `deploy_failed` **and** the logged reason is the explicit
        no-URL wording, not a progress line (this is the F-1050-2 regression test, and it also re-arms the
        F-1049-1 guard permanently).
   - The test must be runnable in one command and print a clear PASS line, as it does today.

5. **Do not regress the predecessors.** The `lockf` serialization, the immutable `mktemp -d` snapshot, the
   wrangler-log error extraction, the `publishedBuild` field, the budget leg, and the never-block law are all
   shipped work from `ab528c3f` and `00f5d464`. This task is **additive** to them. Do not "tidy" them.

## FIREWALL
**TOUCH-ONLY:** `scripts/deploy.sh` · `scripts/test-deploy-contract.sh` · this task file's done-move.
**NO:** any `src/` file · `scripts/asset-diet.mjs` (**it is the subject of an OPEN OWNER DECISION — see
BACKLOG OWNER'S DESK, F-1051-2; touching it is out of scope in the strongest terms**) · the `25000000`
budget constant · `e2e/*` · `playwright*.config.ts` · `package.json` · `.env.local` (read-only; never commit
a token) · any other lane's files.

**DO NOT RUN A REAL DEPLOY.** The upload is a measured **423.4 MB** and currently fails at ~15.5 min with
`UND_ERR_HEADERS_TIMEOUT` on the owner's line (F-1050-3, owner-gated). A real deploy would burn 15 minutes,
fail, and prove nothing this task needs. **Every claim below is provable with the stubbed contract test.**
Likewise: **do not touch auth.** Five CF API calls returned HTTP 200 and zero 401/403 — `wrangler login`
is the wrong move and the owner has been told so in writing.

## SELF-CHECK (paste real output; a claim without output is not evidence)
- [ ] **The red, before you fix it.** Run `bash scripts/test-deploy-contract.sh` on the **unmodified** file
      first and paste the failure. If it unexpectedly passes, **stop and report that** — F-1052-1 would then
      be wrong, and a master built on a wrong premise must not be implemented around.
- [ ] **The green, after.** Paste the full PASS output of the repaired test, showing the new cases (a)–(e) by name.
- [ ] **Scope 1 proven by reversion:** point `GR_PAGES_PRODUCTION_URL` at a local server serving a *stale*
      build id while the deployment "succeeds", and show the outcome is `deploy_unverified`, not `deployed`.
      Paste the log line. This is the exact shape of F-1049-1, and it must now be caught.
- [ ] **Scope 2 proven to terminate:** paste the retry lines from case (d), plus wall-clock, showing it
      matched on a later attempt and did **not** exceed the bound.
- [ ] **Scope 3 proven:** paste the `FAILED: pages deploy — wrangler exited 0 but published no URL` line
      from case (e) — and confirm no progress line appears in it.
- [ ] `npx tsc --noEmit` clean · `npm run build` green (neither file is TS; the repo must stay green regardless).
- [ ] One full **default-mode** run exits **0** (never-block law intact) — paste the exit code.
- [ ] `git diff --stat` shows **exactly two files**: `scripts/deploy.sh` and `scripts/test-deploy-contract.sh`.
      Zero `src/`. Zero `scripts/asset-diet.mjs`.
- [ ] Any stub/server you created lives outside the repo (or is removed); `git status` shows no stray files.

**READY-FOR-GATES.** Report: the before-red paste, the after-green paste with the new case names, the
stale-alias log line, the retry lines with wall-clock, the no-URL wording line, and `git diff --stat`.
