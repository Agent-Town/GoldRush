# f1619-1 — advance-stream cache reuse: is the WARM re-request a `page.route` artifact?

**Slice:** `f1619-1-advance-stream-cache-reuse` · **branch:** `lane/c` · **tip:** `edd808a4b` · **drained:** s1620, 2026-08-10

**VERDICT: MERGE.** The probe answers F-1616-3 on its own terms — the re-request is **NOT** a `page.route` artifact — but the drain narrows the headline number and adds a scope limit the finding must carry. See F-1620-1 and F-1620-2.

## What it does

Adds ONE new e2e spec, `e2e/advance-stream-cache-reuse.spec.ts` (235 lines), that walks the same five doors as `e2e/advance-stream-walkthrough.spec.ts` (`menu` → `town` → `contract1` → `town-return` → `contract2`) with **no `page.route`, no `context.route`, no network emulation at all**, and instruments the network through CDP (`Network.requestWillBeSent` / `requestServedFromCache` / `responseReceived` / `loadingFinished`) rather than Playwright `request` events. Every non-prefetch GLB fetch is bucketed DOUBLE-DOWNLOAD / OVERLAP / CACHE-HIT, and two tables are emitted to `artifacts/advance-stream-cache-reuse-<project>.md`.

It is a measurement slice: **zero `src/**` changes**, and it deliberately asserts *neither* direction of the unknown — only `errors === []` plus two anti-vacuity assertions (at least one prefetch reached `loadingFinished`; at least one demand fetch was observed). That restraint is correct and was specified; a spec that asserted the answer would have baked a guess into a gate.

## Evidence (all re-run by the drain on the MERGED tree, not inherited)

Gated in a detached worktree (`gate-s1620`, §3.0b), `lane/c` + `main` merged there first — **clean merge by 'ort', zero conflicts**, main's 9 changed files disjoint from the slice's 4.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, clean |
| `npm run build` | rc 0, ✓ built in 1.73s |
| `e2e/advance-stream-cache-reuse.spec.ts --workers=1` | **2/2 passed, 36.0s** (desktop-chrome + mobile-chrome) |
| Adjacent `e2e/advance-stream.spec.ts --workers=1` | **10/10 passed, 24.0s** (shares the prefetch primitives) |
| Comparison arm `e2e/advance-stream-walkthrough.spec.ts --workers=1` | **2/2 passed, 38.7s** |
| `git diff --stat main...lane/c -- e2e/advance-stream-walkthrough.spec.ts` | **EMPTY** — the A/B's control arm is byte-identical, so the comparison is valid |
| `npm run test:node-guards` | **correctly OUT** per F-1460-1 — diff is one new `e2e/` file + artifacts, zero `src/sim`, `src/systems`, `src/entities` |
| Console/page errors | `expect(errors).toEqual([])` green in both projects |

No screenshots and no perf table: this slice renders nothing new.

### The bucket counts reproduce exactly

Four independent runs (runner ×2 projects, drain ×2 projects):

| Door | DOUBLE-DOWNLOAD | OVERLAP | CACHE-HIT |
|---|---:|---:|---:|
| menu | 0 | 0 | 0 |
| town | 10 | 0 | 0 |
| contract1 | 7 | 8 | 0 |
| town-return | 10 | 0 | 0 |
| contract2 | 2 | 8 | 0 |

**Identical in all four runs, both projects.** That stability is the strongest thing in the slice.

## Findings

### F-1620-1 — the DOUBLE-DOWNLOAD bucket over-counts: it scores 304 revalidations as full re-downloads. `classify()` captures HTTP status and never reads it.

✓ VERIFIED by reading the code: `fetch.status = response.status` is set at `e2e/advance-stream-cache-reuse.spec.ts:68`, and `status` appears nowhere else in the file — `classify()` branches only on `servedFromCache || fromDiskCache || fromPrefetchCache`, then on `encodedDataLength > 0`. A **304 Not Modified** has none of those cache flags set and an `encodedDataLength` of ~127 bytes (headers only, body served from cache), so **every revalidation lands in DOUBLE-DOWNLOAD.**

That is not hypothetical — it is visible in the artifact as the `127` entries. Splitting the bucket by transfer size:

| Project | revalidation-sized (<1 KB) | genuine full re-transfer | redundant payload |
|---|---:|---:|---:|
| desktop-chrome | 11 | **18** | **46.0 MB** |
| mobile-chrome | 15 | **14** | **42.3 MB** |

So the defensible figure is **18 full re-downloads carrying ~46 MB**, not 29. The defect is still large and still real — a five-door walk re-transfers ~46 MB it had already fetched — but a follow-up must not build a regression assertion on `29`. **Non-blocking:** the raw per-URL table carries the byte counts, so the artifact contains everything needed to recompute; the bucket label is what is wrong, not the measurement.

### F-1620-2 — CACHE-HIT = 0 is FORCED BY THE DEV SERVER and is not evidence about the prefetch. The probe removed one confound and inherited another.

✓ VERIFIED independently by the drain, not taken from the runner's report. `playwright.config.ts:69` runs the harness against `npm run dev` — the **Vite dev server**. Probing it directly on a scratch port:

```
GLB status 200
  cache-control: no-cache
  etag: W/"7904068-1786323900779"
  last-modified: Mon, 10 Aug 2026 01:05:00 GMT
conditional replay status 304
```

Under `Cache-Control: no-cache` the browser **must revalidate before reusing any entry**, so a CACHE-HIT — a fetch served entirely from cache with no network trip — is **impossible by construction** in this harness. The `0` in that column is the server's doing, not the prefetch's failure. It reads like the sharpest number in the table and it is the least informative one.

⚠️ **Therefore the finding's reach must be stated narrowly.** What is settled: the re-request is not caused by `page.route` — it reproduces with zero interception, identically, four times over. What is **NOT** settled: whether the deployed game does this. Cloudflare Pages serves hashed assets with long-lived `immutable` headers, which is a materially different cache contract from `no-cache`. **The honest verdict is "not an interception artifact", not "real property of play".** The runner reached the same limit unprompted and said so; this drain verified it rather than inheriting it.

*Hypothesis for the follow-up, labelled as inference and NOT measured:* the 18 full re-transfers revalidate to `200` rather than `304` while the 11 cheap ones get `304`, despite a stable weak ETag. The likeliest cause is **cache eviction under volume** — the town door alone pulls tens of MB of multi-megabyte GLBs through a fresh ephemeral profile. Do not cite this as a result; it is the next probe's question.

### F-1620-3 — the `Wire bytes` column is run-to-run unstable by up to 3× and must not be cited as a bandwidth figure.

Same door, same build, same shell, four runs:

| Door | runner desktop | drain desktop | runner mobile | drain mobile |
|---|---:|---:|---:|---:|
| town | 366,060,611 | 305,594,651 | 547,132,847 | 182,286,179 |
| town-return | 49,503,048 | 25,946,082 | 50,910,518 | 27,714,414 |

The bucket counts were identical across those very same runs, so the instability is in the byte attribution, not in the walk. The column sums `encodedDataLength` over every fetch attributed to whichever door was current when `requestWillBeSent` fired, and the advance stream prefetches ahead across door boundaries — so long-running prefetches get charged to whichever door happened to be open. **Non-blocking** (the column is informational and the per-URL table is sound), but any future slice quoting a MB figure should compute it per-URL.

### F-1620-4 — the prefetch itself fires two or three times per URL. Separate from, and possibly larger than, the finding this probe was written to settle.

Visible in the `Prefetch bytes` column throughout: `7904347<br>7904347`, `1219823<br>1219823`, and on mobile `7904347<br>7904347<br>7904347`. Many carry the **complete asset each time**. The runner flagged this unprompted and correctly did not act on it — `src/assets/AdvanceStream.ts` was firewalled. Filed for the ladder, not for this drain.

### F-1620-5 (observation) — the comparison arm's mobile `town-return` row is not deterministic.

`artifacts/advance-stream-walkthrough-mobile-chrome.md` moved `WARM 4 / COLD 6` → `WARM 2 / COLD 8` at `town-return` between the merged run and main's committed copy. The spec passes either way (it asserts no counts there), but the WARM column that F-1616-3 was originally raised from **varies ±2 run-to-run at that door**. Worth knowing before anyone pins it.

## Merge classification

Base: `main` at `b8cdc72e8`. Lane 1 ahead, 4 behind at gate time.

| Path | Class | Resolution |
|---|---|---|
| `e2e/advance-stream-cache-reuse.spec.ts` | LANE-ONLY (new, 235 lines) | added verbatim |
| `artifacts/advance-stream-cache-reuse-desktop-chrome.md` | LANE-ONLY (new) | added verbatim |
| `artifacts/advance-stream-cache-reuse-mobile-chrome.md` | LANE-ONLY (new) | added verbatim |
| `artifacts/advance-stream-walkthrough-mobile-chrome.md` | LANE-TOUCHED (1/1) | comparison-arm regeneration; evidence artifact, see F-1620-5 |

No MAIN-MOVED file overlaps the slice. `git diff --numstat` deletions read `0` on every source path. Firewall honoured in full: no `src/**`, no `package.json`, no `playwright.config.ts`, no `scripts/**`, no `reviews/*.md` written by the runner, and the comparison arm byte-identical.

## Disposition

**MERGE.** F-1620-1 and F-1620-3 are instrument-accuracy findings against a probe whose raw data is sound and preserved; F-1620-2 is a scope limit on the conclusion, not a defect in the slice; F-1620-4 is new ladder work. None blocks. The follow-up slice — fix the prefetch duplication and re-measure against a **preview/production-headers** server, with `classify()` reading `status` — is the natural next rung, and is now specified by these findings rather than by a guess.

**GATE for the follow-up: none owed to the owner.** F-1616-3's allowance was "any fire may take the probe (one per fire)"; that probe is now taken and answered. The remaining question is an engineering one, not a design fork.
