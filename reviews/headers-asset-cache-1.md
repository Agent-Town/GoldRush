# Drain review: `headers-asset-cache-1`, hashed game assets become cacheable again (the Pages merge done right, the guard models it); effective with the next deploy

**Branch** `sol/wave-lane-b` at `a6fc9c601` · **merge** `c7ad5dc24` · engine hash unchanged (`378f9213`, no pin) · drained attended 2026-10-09 07:12Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `hac1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `headers-asset-cache-1`, lane-b `sol/wave-lane-b`, `ce59e7a84` (the rules and the guard), `832445b65` (evidence and the 058 control), `41c224bd3` (the runner's evidence commit), Astra gpt-6-astra, 74,516 tokens, 2026-10-09 04:30Z to 04:35Z. Attended landing, hash unchanged (`public/` and `scripts/` only). The cache half of the owner's Option B.

**What it does.** Since 2026-09-24 every hashed game asset answered `cache-control: public, max-age=31536000, immutable, no-cache`, because the asset rules in `public/_headers` sat above a `/*` catch-all carrying `no-cache` and Cloudflare Pages merges every matching rule; browsers revalidated the whole asset tree on every load and every map change, and on the canonical route each revalidation was a Worker request (F-2987-2, the trigger of the nightly Worker-cap outages). The asset rules now come after the catch-all and detach its Cache-Control (`! Cache-Control`, the documented Pages syntax) before setting the immutable value; HTML keeps `no-cache` through the `/*.html` rules and the catch-all; all five security headers stay on every path. The headers guard parses the detach line and models the merge: it resolves the headers for `/index.html`, `/assets/x-abc123.js` and `/goldrush/assets/x-abc123.js` and asserts assets carry the immutable value only, HTML carries `no-cache`, and the five security headers are present on all three. Effective with the next deploy.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| `scripts/site-security-headers.test.mjs` | 6 of 6 (5 existing + the merge model; re-run attended on the lane tree; this landing's named guard) |
| Resolved headers (the guard's model, the report's table) | `/index.html` → `no-cache` + the five; `/assets/x-abc123.js` and `/goldrush/assets/x-abc123.js` → `public, max-age=31536000, immutable` + the five |
| `npm run build` → `dist/_headers` | carries the rules with the detach lines (checked attended) |
| tsc / build | exit 0 / exit 0 |
| `e2e/058-device-tiers.spec.ts` | one red, reproduced on the unchanged control (pre-existing; allowed by its exact title in this landing); its two Cache-Control assertions still hold |
| The evidence trace guard | 12 raw paths withheld from the auto-commit (the em-dash run's `*-results/` folders still on lane-b's disk) |
| Evidence budget | 9.8 MB added (the 058 suite's screenshots), inside the budget and the ceiling |
| Merge | `git merge-tree` clean against main (0 conflicts) |
| Second landing (06:31Z to 07:03Z) | guards 144/0, ledger battery 1,263 with 0 fail, e2e 31 passed / 16 skipped / the allowed 058 red only, Node battery 1,048 tests with ONE red: `scripts/gr-sim.test.mjs` "a reactive client can recover from rejected orders" (its 20 s recovery budget under the battery's load; the same leaf reddened lvc3's battery on main on 2026-09-29). CONTROL alone on the chain worktree right after the battery: green (`~/.goldrush/land/hac1-control-gr-sim.log`): load-class, allowed by exact title (F-HAC1-3); resumed at the pin |
| First landing (05:19Z to 05:5xZ) | named guards 143 pass / 1 fail and the ledger battery red on the same leaf, the gate-caller audit: Astra had saved a COPY of the headers guard as evidence under `artifacts/headers-asset-cache-1/final-site-security-headers.test.mjs`, and any tracked `*.test.mjs` is a guard-shaped subject with no caller (F-HAC1-2; renamed `.mjs.txt` on the lane, audit 45/45). e2e: 31 passed, 16 skipped, 1 failed: `058-device-tiers.spec.ts:195` "tier switch is render-only for a deterministic economy slice" (desktop), which the CONTROL on the UNCHANGED main tree (primary checkout, fresh vite on 5421, `--workers=1`) also fails with the same signature mismatch (`~/.goldrush/land/hac1-control-058-main.log`); Astra's own control had seen `:81` fail instead. Both are pre-existing intermittent reds of 058 on main (F-HAC1-1), allowed by exact title; the second landing is the verdict |

**Merge classification.** Base: main at the chain cut. Lane-touched: `public/_headers`, `scripts/site-security-headers.test.mjs`. New: `artifacts/headers-asset-cache-1/**`. No `src/**`.

**Findings.**
- **F-HAC1-1 (recorded, pre-existing):** `e2e/058-device-tiers.spec.ts` carries two intermittent reds on main (`:81` Settings override persistence; `:195` the deterministic economy signature across tiers); neither touches headers; a scoped corrective is owed.
- **F-HAC1-2 (fixed on the lane):** evidence copies must never carry a `*.test.mjs` or `*.test.sh` name; the gate-caller audit treats them as guards.
- **F-HAC1-3 (load-class, attributed by control):** the gr-sim reactive-client recovery budget under the battery; alone it passes.
- **Takes effect only after a deploy:** the Pages alias serves the old `_headers` until `scripts/deploy.sh` runs; the cutover runbook's first act is that deploy, before the droplet proxy and the public cache verification (`cf-cache-status: HIT` on a second asset request).
- **The 058 red (recorded):** pre-existing on the control; a scoped corrective is owed if it persists after the deploy.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 144 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=1   1 failed   16 skipped   31 passed (2.6m)  06:39Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1048 ℹ pass 1042 ℹ fail 1 ℹ skipped 5  07:03Z` |
| engine hash | `merged: 378f9213f5a7d0f63e063262bd691f2eb0c64df30a9bb3e58061fb5a45f2a817 (pinned 378f9213f5a7d0f63e063262bd691f2eb0c64df30a9bb3e58061fb5a45f2a817)` |
