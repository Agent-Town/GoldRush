# assay-office-claim-ledger — county tallies in the Claim Ledger

**Slice:** `assay-office-claim-ledger` · **Branch:** `lane/lane-a` · **Tip:** `86b97a8106357e4f925448f81105889856cc62fc` · **Base:** `00e648bd1a8e29ef43357b101891d7300acd43cb`
**Merged to main:** `da2997b3e1b0e2fe9b2e4e954d938864dbd2f17a` · **Drained:** s1787, 2026-08-15
**Gated in:** detached worktree `/tmp/gr-s1787-assay.YCT6oh`; merged to main as one act

## VERDICT: MERGE — the county's anonymous tallies now have their owner-ruled home inside the Claim Ledger.

## What it does

The existing Claim Ledger gains an Assay Office tab with runs today, past seven days, all time, deepest wave, typical run, and busiest claim. It reuses the existing `/api/stats` reader and `gameApiUrl` routing, fetches once whenever the page opens, aborts the read when the view closes, and leaves a quiet in-world message for empty, invalid, or unavailable responses.

The page keeps the owner-approved privacy line and tallying-clerk voice. It adds no endpoint, polling loop, write path, telemetry event, or simulation change.

## Evidence

| Gate | Result |
|---|---|
| Policy | `drain-block-check --strict` **CLEAR** |
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green; Vite build and asset-diet checks passed |
| New `assay-ledger.spec.ts` | **4/4 passed**, desktop + 390px mobile, `--workers=1` |
| Existing `assay-ledger-page.spec.ts` | **8/8 passed**, both projects |
| Required `task-025` + `m1-01` + `m2-01` canaries | **32/32 passed**, both projects |
| Release base/API-origin gate | **4/4 passed** on scratch port 5231; the long-lived lane-d preview on 5191 was left untouched |
| Combined browser evidence | **48/48 passed**; the 44-test main battery ran in 5.1m |
| Plain boot / runtime errors | the new tests enter from plain `/`; console and page-error collections are empty in both projects |
| Screenshots | `artifacts/assay-ledger/{desktop,mobile}-chrome.png` |
| Node guard battery | not triggered: no `src/sim/`, `src/systems/`, or `src/entities/` path changed |

Visual target: the Assay Office remains a first-class Claim Ledger page, all six figures stay legible, and the 390px layout wraps controls and cards without clipping or overlap. Both supplied captures meet it.

## Merge classification

Main moved none of the six touched paths after base `00e648bd1`; the final main merge was a clean `ort` merge with no conflict or graft.

| Path | Classification |
|---|---|
| `src/encyclopedia/liveStats.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — shared one-shot fetch, formatting, disposal |
| `src/encyclopedia/reader.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — existing view row gains the Assay Office page |
| `src/encyclopedia/reader.css` | LANE-TOUCHED / MAIN-UNTOUCHED — responsive page/card styling |
| `e2e/assay-ledger.spec.ts` | new, lane-only browser proof |
| `artifacts/assay-ledger/*.png` | new, lane-only visual evidence |

## Findings

No blocking or corrective finding. The firewall is exact: no API, site, town-entry, simulation, balance, telemetry-write, existing-spec, or public-skill file changed.
