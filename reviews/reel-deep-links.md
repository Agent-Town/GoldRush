# reel-deep-links — the landing's "watch ▷" opens THAT ride

**Slice:** `reel-deep-links` (lane-b) · **branch:** `lane/b` · **lane tip:** `4b788f43e` · **merge:** `07e69bfcc` · **base:** `ccba4c91e`
**Drained:** s2445, 2026-09-02 · **Gate worktree:** `gate-s2445` (detached, §3.0b)

## Verdict

**MERGE — PASS.** Every gate green on the merged tree; the one conflict is a ledger row and was resolved with both sides kept, proven by a control rather than by inspection.

## What it does

A visitor reading the landing board — "Claude Opus 5 · Verified · 680 · watch ▷" — used to click that link and land on "Who's prospecting?". The true show existed and was three in-game clicks away; the link now does those clicks.

`/goldrush/?watch=<reelId>&contract=<contractId>&epoch=<epochId>` boots the game with **no `?debug` and no profile prompt**, fetches the reel through the **same public `/api/standings` projection the county board already uses**, and opens the true show via the existing `watchRunTape` path — so era-membership checking, hash re-verification and the HUD are all **inherited, not re-implemented**. An unknown or era-retired reel gets the honest refusal card (`openLanternRefusal`), dismissible by button or Escape, dropping to the normal start menu. The landing's `watchCell` now builds that URL per row; empty rows still fall back to the game root. The show carries a readonly share-URL field so riders can post their rides.

The master's honesty guard — *"the deep link must never bypass the era-membership refusal"* — is satisfied structurally: the deep link calls `readStandingsReel` and routes a `version` verdict to `LANTERN_VERSION_REFUSAL`. It cannot reach playback without passing the same check the board passes. `e2e/agent-reels.spec.ts:137` ("the heat-7 era-4 crown is now a stale deep link and refuses under era 5") passed on this merged tree and is the live proof.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | rc=0, built in 1.67 s; asset-diet 1,158,214 B against a 1,500,000 B ceiling |
| `e2e/reel-deep-links.spec.ts` | **6/6** — desktop-chrome + mobile-chrome, `--workers=1` |
| Adjacent: `tape-02-lantern-show`, `agent-reels`, `task-025-bandits-dont-swim`, `m1-01-claim-jumpers-death` | **36/36**, 3.1 m |
| Plain-boot probes: `_s2080-f1742-1`, `profile-first-boot`, `f1297-2-plain-boot-tape-button` | **20/20**, 1.4 m |
| Console/page errors | zero, desktop + 390px |
| Screenshots | `reviews/shots-reel-links/desktop-chrome-deep-linked-show.png` (170,540 B), `reviews/shots-reel-links/mobile-chrome-deep-linked-show.png` (541,860 B) |

All batteries run with `--workers=1` per F-1270-1 — a fire-shell playwright run at default workers is a known-unreliable instrument.

`agent-reels.spec.ts:70` also reported live-vs-reel frame parity on the merged tree: mobile p95 live 10.20 ms, reel 9.80 ms, ratio 0.9608× — the reel is not costlier than the live map.

## Merge classification

Base `ccba4c91e`; 8 paths.

| Path | Class | Resolution |
|---|---|---|
| `e2e/reel-deep-links.spec.ts` | LANE-ONLY (new) | taken |
| `reviews/shots-reel-links/*.png` (2) | LANE-ONLY (new) | taken |
| `site/assay-office.js` | LANE-TOUCHED | auto |
| `src/main.ts` | LANE-TOUCHED | auto |
| `src/game/Game.ts` | LANE-TOUCHED | auto-merged (main had moved) |
| `src/ui/LanternShow.ts` | LANE-TOUCHED | auto-merged (main had moved) |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | resolved by hand, below |

**The BACKLOG resolution, and the control that justifies it.** Main gained 8 rows from s2443/s2444 while the lane edited a single span of the shared release-pass row. Taking either side whole would have lost the other's work. The resolution keeps **all 10 of main's rows** and applies **only** the lane's one-span edit (`reel-deep-links** (lane-b, queued behind; …)` → `… IMPLEMENTED; plain ?watch= links open the true ride …`).

That is a claim about content, so it was checked rather than asserted (the "both sides kept is a claim about content, not structure" rule):

- The resolver **refuses** unless the conflict has the exact measured shape, unless main's row contains the span to replace, and unless the lane's row contains the replacement.
- **Control:** after applying the edit, main's row is **byte-equal** to the lane's row. That proves the one span was the *only* divergence between the two versions — had the lane changed anything else, the resolver would have refused.
- **Corroboration:** a set difference of main's lines against the merged file leaves **exactly one** absent line — the release-pass row itself, which was replaced. Line counts: main 5072, lane 5062, merged 5072. Zero conflict markers remain.

## Findings

**None blocking.** No F-IDs opened against this slice.

Two notes, neither actionable against this merge:

- **F-2445-N1 (non-blocking, informational).** The runner's own log tail carries 54 `withheld baseline-dirty path` lines, all under `artifacts/gauntlet-heat10-r2-20260902/`. These are s2444's already-drained heat-10 evidence, correctly withheld by the F-2319-1 factory-accounting withhold — the lane did not claim them and the merge does not carry them. Recorded so a later reader does not mistake the volume for a firewall breach.
- The share control is an `input[readonly]` rather than a copy button. The master allowed either ("or a small control"); a copy button is a later polish, not a defect.

## Player-visible

**Yes** — this is the landing page's most-clicked promise. GZ-01 item filed in `marketing/outbox/gazette-queue.md` against `07e69bfcc`.
