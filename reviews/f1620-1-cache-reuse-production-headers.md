# f1620-1 — advance-stream cache reuse under production headers

**Slice:** `tasks/lane-f1620-1-cache-reuse-production-headers.md` (FIRE-AUTHORED s1620, from F-1620-1 + F-1620-2)
**Branch / tip:** `lane/c` @ `c0623cfac` (runner commit 2026-08-10T08:51:52+07:00)
**Merge:** `0f9a109d9c79695d6a4c3af19b09f81abb756d87` — drained s1621
**Gated in:** detached worktree `worktrees/gate-s1621` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGE. F-1620-2 is ANSWERED, and the answer is a SPLIT one — most of the double-download was the dev server, and a precisely-located residue is not.

## What it does

Adds a second arm to `e2e/advance-stream-cache-reuse.spec.ts` that walks the same five doors against a **real Vite preview server started in-process** (`vite`'s `preview()` API, `port: 0`, `strictPort: false`) serving `Cache-Control: public, max-age=31536000, immutable` — i.e. the header Cloudflare Pages will send — and compares it door-for-door against the dev-server arm. It also implements F-1620-1: `classify()` now reads `response.status`, so a 304 revalidation (~127 B, body from cache) is scored **REVALIDATED** instead of being mis-bucketed as DOUBLE-DOWNLOAD. Four buckets, both arms, both projects, written to `artifacts/advance-stream-cache-reuse-headers-<project>.md`.

Both tests assert only **instrument validity**, never an outcome — the master required that the answer not be pinned as a regression assertion until it is known, and the runner honoured it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | CLEAN, 4.6 s |
| `npm run build` | GREEN, 17.8 s |
| Own spec, both projects, `--workers=1` | **4/4 passed, 52.6 s**, rc 0 |
| Adjacent `advance-stream.spec.ts` + `advance-stream-walkthrough.spec.ts`, both projects | **12/12 passed** (see FLAKE below) |
| `test:node-guards` | Correctly OUT per F-1460-1 — diff is one `e2e/` file + `artifacts/**`, zero `src/sim`·`src/systems`·`src/entities`. Checked, not run. |
| Console/page errors | Zero — the spec's own `collectErrors` asserts it in both arms |
| Screenshots / perf | None owed; this slice renders nothing new |

### The measurement, across all FOUR available runs (runner ×2 projects, drain ×2 projects)

**Production arm (`immutable`) — what reproduces EXACTLY in 4/4 runs:**

| Door | DOUBLE-DOWNLOAD | REVALIDATED | OVERLAP | CACHE-HIT |
|---|---:|---:|---:|---:|
| menu | 0 | 0 | 0 | 0 |
| **town** | **0** | 0 | 0 | **10** |
| **contract1** | **7** | 0 | **8** | **0** |
| **contract2** | **0** | 0 | **8** | **2** |

`town-return` is the one production row that wanders (runner desktop 4 DD / 6 HIT · runner mobile 2 / 8 · drain desktop 0 / 10 · drain mobile 0 / 10) and must not be quoted as a fixed number.

**Dev arm — `CACHE-HIT = 0` at every door in 4/4 runs**, as F-1620-2 predicted it must be: the Vite dev server answers `no-cache`, so the browser is *obliged* to revalidate and a true hit is impossible by construction.

### The invariant the four runs expose, which no single run could show

The dev arm's **DOUBLE-DOWNLOAD / REVALIDATED split is unstable, but their SUM is not.** At the `town` door the split reads 8+2, 5+5, 4+6, 2+8 across the four runs — **exactly 10 every time.** Same at `town-return`: 2+8, 3+7, 4+6, 4+6 — **10 every time.**

➡️ **Practical rule: quote the SUM, never the split.** F-1620-1 corrected the headline from 29 to 18 by splitting out revalidations; this shows the split itself is the unstable half of that number, so "18" is no more quotable than "29". The stable, defensible statement is *"all 10 town assets are re-requested on the dev server, and 0 are re-downloaded under production headers."*

## Findings

**F-1621-1 (MEASURED, reproduces 4/4 — the real residue, and it is NOT a header problem).** Under production `immutable` headers the `contract1` door still shows **7 DOUBLE-DOWNLOAD + 8 OVERLAP**, identically in every run, on both projects, in both the runner's and the drain's measurements. Production headers fix the town door completely and do not touch this one. ⚙️ **A mechanism is available and is stated as a hypothesis, not a verdict:** OVERLAP is *concurrent in-flight duplicate requests*, and **no cache policy can deduplicate a request against a response that has not arrived yet** — a cache can only serve what it already holds. If that is right, the cure is request coalescing in `src/assets/AdvanceStream.ts` (one in-flight promise per URL), not a header or a build change. ⚠️ **This is additive to F-1620-4** (the prefetch issuing the same URL 2–3×, still visible in the merged artifacts' `Prefetch bytes` column as `7904347<br>7904347`) and plausibly the *same* root cause seen from the demand side. **GATE: none owed to the owner. This is now the largest open lead on the asset path, and unlike its predecessor it is perfectly reproducible.**

**F-1621-2 (FLAKE, proved by three measurements — non-blocking).** `e2e/advance-stream.spec.ts:100` **"launch aborts pending prefetch before the run requests its own map"** failed once on `desktop-chrome`, timing out 8 s waiting for `__GR_TOWN_DIAGNOSTICS__.activePrompt === 'tavern'` after an 850 ms keyboard walk. ✓ **Proved NOT attributable to this merge, three independent ways:** (1) a **main-equivalent control** — the merged code file reverted to main's blob, identical command, same shell and hour — passed **12/12 in 51.4 s**; (2) the **merged tree re-run** of the identical command passed **12/12 in 64.7 s**, so the red does not reproduce on the tree that produced it; (3) the same test **passed on `mobile-chrome` inside the red run itself**. ⓘ **And no causal path exists:** the adjacent command names only `advance-stream.spec.ts` and `advance-stream-walkthrough.spec.ts`, so the merged file is never loaded in either arm. 📉 `red-inventory-lookup` reports this spec `CLEAN-IN-INVENTORY` but on a **12-day-stale snapshot** (threshold 7, 344 commits since) and explicitly instructs a control run before attribution — which is what was taken. Consistent with F-1618-2 / F-1270-1: a timing-sensitive keyboard-walk assertion in the fire shell. **GATE: none owed. Worth a flake entry so the next drain does not re-derive this; do NOT re-pin or weaken the assertion on one red.**

**F-1621-3 (corroboration, no action).** The dev arm's `Wire bytes` column varies enormously run-to-run at the same door (`town`: 572,322,552 · 455,245,300 · 352,871,564 · 331,848,907). This independently confirms **F-1620-3** — the column must never be cited as a bandwidth figure — now on a second instrument.

## Merge classification

Base `2a2b26c7`; `lane/c` 1 ahead, `paths=5`, classifier reads **LANE-ONLY 5 / DUPLICATE 0 / MAIN-ONLY 0 / BOTH-MOVED 0** — main had moved none of them, so no graft was required and the merge is a clean `--no-ff`.

| Path | Class |
|---|---|
| `e2e/advance-stream-cache-reuse.spec.ts` | LANE-TOUCHED (+155/−26) |
| `artifacts/advance-stream-cache-reuse-headers-desktop-chrome.md` | LANE-ONLY, new (+180) |
| `artifacts/advance-stream-cache-reuse-headers-mobile-chrome.md` | LANE-ONLY, new (+183) |
| `artifacts/advance-stream-cache-reuse-desktop-chrome.md` | LANE-TOUCHED, regenerated evidence (+33/−36) |
| `artifacts/advance-stream-cache-reuse-mobile-chrome.md` | LANE-TOUCHED, regenerated evidence (+24/−23) |

The merged artifacts are the **runner's**; the drain's own regenerated copies stayed in the throwaway gate worktree and were never committed.

## Firewall compliance

`src/assets/AdvanceStream.ts` was firewalled BY NAME and is **untouched** — correct, and the whole point: a task that measures the prefetch path must not alter it. The runner reported F-1620-4 as a finding rather than acting on it, exactly as instructed.
