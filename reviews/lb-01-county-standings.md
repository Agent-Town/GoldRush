# LB-01 — County Standings: the county records prospectors

**Slice:** `lane-county-standings.md` (attended-authored, owner directive 2026-07-29, `specs/agent-play/README.md` §AP-06)
**Branch:** `lane/m4` · **Tip:** `d7edcd3b` · **Base:** `4fdbc950` · **Drained:** s1212
**Verdict:** ✅ **MERGE** — READY-FOR-GATES honoured, firewall respected, zero MAIN-MOVED, and the endpoint matches the house security pattern.

## What it does

Gives the county a memory. A new Pages Function `functions/api/standings.ts` accepts a POST of one score row per `{contractId, epochId}` — validated against shipped contract ids, size-capped, rate-limited per IP-hash *and* per anonId, stored in KV as a kept top-100 — and serves the board back on GET. The client submits fire-and-forget at the secure/Rush-completion path through `gameApiUrl`, so an offline or failing submit is silent and never blocks the ceremony. The Claim Ledger gains a **COUNTY STANDINGS** page with per-contract tabs for the active epoch (rank, name, waves, time, gold) in house parchment style, with the empty state *"The county waits for its first name."*

**The ladder is blind by design:** no species/agent/human field exists anywhere in the schema, per the owner's directive that agents later enter the same door. The spec's `no human/agent reveal` is enforced by *absence*, which the spec's own test asserts (`endpoint keeps each prospector's best row and returns no audit identifiers`).

## Evidence (all on the MERGED tree, all at `--workers=1`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.36 s**; GG-03c herald ceiling intact (1,099,906 B) |
| Own spec `lb-01-county-standings.spec.ts` | **12/12**, both projects (40.6 s) |
| **Release suite** (`playwright.release.config.ts`) | **26/26** — matters here: the submit is `__APP_BUILD__`-gated and must not fire in dev without opt-in |
| Drain minimum + AP-06 regression (task-025, m1-01, m2-01, boot probe, ap-standing-orders) | **35/36** — the one casualty re-measured **8/8 green isolated** (see below) |
| `test:node-guards` | **74/74, exit 0** |
| `en-01-claim-ledger.spec.ts` (the UI this extends) | **2/2** |
| Plain boot, zero console/page errors, desktop + 390px | green (`_s106-prospector-boot-probe` in the minimum) |
| Screenshots | `artifacts/county-standings/desktop-chrome.png`, `mobile-chrome.png` + 3 critique captures — **present and committed** |

**The single casualty:** `m2-01-build-menu.spec.ts:178` (mobile), *"palisade footprint rejects overlap while allowing edge-touch chaining"*. This slice touches `Game.ts`'s build/demolish path, so it was **not** waved off — re-measured `--repeat-each=4` × 2 projects **on the treatment tree: 8/8 green**. A real break in palisade footprint logic would fail in isolation too. Known combined-battery load ceiling (F-1180-2 / F-1212-2b), not a regression.

## Security review (new public endpoint)

| Check | Finding |
|---|---|
| Rate limiting | ✅ per IP-hash **and** per anonId via `bumpCounter` with TTL; 429 `rate_limited` |
| CORS | ✅ allowlist + preview regex `^https://[a-z0-9-]+\.gold-rush-3in\.pages\.dev$` + localhost only |
| Secrets | ✅ none; KV via `context.env.TELEMETRY ?? context.env.ACCOUNTS` |
| Input validation | ✅ contract ids validated against shipped set, sizes capped, top-N bounded at 100 |
| Identifiers | ✅ anonId is `crypto.getRandomValues` hex, profile-scoped; hashes via `crypto.subtle` |

Matches the `_bugs.ts` / `telemetry.ts` sibling discipline the task named. No finding.

## Merge classification

Base `4fdbc950`. `lane/m4` carried two commits; `c162bd1a` is the **already-merged approach-convergence safe dupe** (landed in the attended `79be48db`). Only the tip's own delta was grafted.

| File | Class | Resolution |
|---|---|---|
| `functions/api/standings.ts` | **NEW** | free |
| `e2e/lb-01-county-standings.spec.ts` | **NEW** | free |
| `artifacts/county-standings/*` (5 PNG) | **NEW** | free (task-required evidence) |
| `src/game/Game.ts` | LANE-TOUCHED only | clean apply (+155) |
| `src/encyclopedia/reader.ts` | LANE-TOUCHED only | clean apply (+184) |
| `src/encyclopedia/reader.css` | LANE-TOUCHED only | clean apply (+122) |

`git diff 4fdbc950 main` over all five source paths is **empty** — main never moved them. **Zero MAIN-MOVED, zero conflicts.**

**Firewall probe:** the task's NO list forbids Economy and sim. Grepping the `Game.ts` delta for `this.economy` / `spend` / `addGold` / `Balance.` / `sim.` returns **nothing** — the +155 lines are action-recording and the submit hook only. Firewall respected.

## Findings

### F-1212-4 — "the one-line gitignore fix" for artifact churn (F-1204-2) is probably the WRONG remedy, which is why seven fires have now paid it
My batteries regenerated **28 unrelated tracked PNGs** (`artifacts/056`, `m4-07`, `m4-07-panel`, `m4-08-attribution`, `m4-10`, `m4-re-land`, `agent-rung-clarity`, `prospector-presence`); I reverted them by hand, the **seventh** fire to do so. The standing owner's-desk line calls this *"one gitignore line"*. **It cannot be.** This very drain was *required* to commit five artifact PNGs as its evidence (`artifacts/county-standings/`), and the AP-06 corrective will need the same. A blanket `artifacts/` ignore would silently stop evidence from landing — trading a 5-minute chore for a Retention-Law hole. The real remedy is at the **writer**: specs that capture screenshots as a side effect of an unrelated run should write to `test-results/` (already ignored), leaving `artifacts/` for deliberate evidence. That is a spec-side change across several files, not a one-liner — which is the honest reason it has survived seven fires, and it should be re-scoped on the desk rather than re-promised.

## Non-blocking notes
- **GZ-01 PAID** — this is a player-visible change (a new Claim Ledger page), so a news item is appended to `marketing/outbox/gazette-queue.md` for this merge.
- Runner's own deferral, recorded: *"Replay verification and standings-specific consent remain later AP-06 scope."* Opt-out is honoured via the existing profile setting; a standings-specific consent surface is not yet built.
- The submit is dev-gated by `__APP_BUILD__ !== 'dev'` plus an explicit `TELEMETRY_DEV_SEND_STORAGE_KEY === '1'` opt-in, asserted by its own spec — dev play will not pollute the live board.
