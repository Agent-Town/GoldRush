# Heat 15 — the Regatta's heat — the operator's note

**Operator:** an attended-hosted Claude agent (Opus, the owner's Anthropic subscription), hosting
headless `claude -p` riders (Claude Opus 5, Claude Code CLI 2.1.272) from a DETACHED arena at the
deployed production build. No Codex anywhere (`tasks/CODEX-WALL`).
**Master:** `tasks/heat-15-regatta.md` (slice 4 of `specs/agent-play/e5-regatta-steerable-boat.md`).
**Owner's words the heat rides under, verbatim:** 2026-09-20 "A14 - do it" · 2026-09-22 "F-RB2-2:
gangway-reach only" · 2026-09-17 "All on the Anthropic subscription".
**Branch:** `heat15/regatta`, cut from main `d7781f976`, path-scoped to
`artifacts/gauntlet-heat15-cd24d12d/**` only.

---

## 1. The arena and the pre-flight

| check | measurement |
|---|---|
| production build | `curl -s https://agenttown.app/goldrush/version.json` → `{"build":"cd24d12d","builtAt":"2026-09-22T03:08:14Z"}` |
| does it carry the gangway rule? | **yes** — `git merge-base --is-ancestor df5261526 cd24d12d2` → true. `df5261526` is the F-RB2-2 gangway landing; production descends from it. The master's STOP condition ("production predates the gangway rule") did not fire. |
| arena | DETACHED worktree at `cd24d12d2` under `…/scratchpad/wt-heat15-arena`, registered in `git worktree list` (F-HEAT13-4: the git link must survive the heat). `node_modules` SYMLINKED from the primary checkout — no install, no disk cost. |
| the arena's own papers | an idle probe of `e5-regatta` wrote a tape carrying `buildId cd24d12d2`, `engineHash 52a84bc29feb…`, `era 6`, **`viewVersion 3`** — version 3 is the Regatta's own view bump (pin #21). |
| era | still **6, "the Re-surveyed Claims"** — it did NOT roll since heat 14. Thirty pins now stand under it; heat 14 rode pin #8. |
| toolchain | `/opt/homebrew/bin` first: Node v26.4.0, `claude` 2.1.272. One rider at a time under `nice -n 5` (a Codex lane task, `f-corr4-18-river-pack`, shared this host throughout). |
| Opus headroom (F-HEAT13-1) | probe 1 and probe 2 before the first ride: `rc=0`, `result: "OK"`, `is_error: false`, `api_error_status: null`. Re-probed between rides; see §4. |

### The skew probe — BOTH PROOFS PASS, before any ride

**Proof 1, the refusal.** Heat 13's VERIFIED probe reel, re-POSTed byte-identical (`the-claim`,
tape `agent-1c9d4989-b6c73b19-…`, papers `era 5 / engineHash 09838c35…`):

> HTTP **400** · `{"ok":false,"error":"reel_not_current","message":"This reel rode era 5; the county accepts era 6 'the Re-surveyed Claims'."}`

**Proof 2, the acceptance.** The same orders replayed order-for-order through THIS arena
(`probe/probe-driver.mjs`) secured `w10 / 335 g / 300 s` at `eventLogHash fnv1a32:1c431865` —
**byte-identical to heat 14's replay of the same orders**, across twenty-two intervening era-6 pins
— and the door answered:

> `{"ok":true,"stored":true,"rank":null}` → slip `assay: "verified"`, `assayHash: fnv1a32:b131e18e`,
> `ranked: false` (the `operator-probe` law, `public/skill.md:52` — a probe never touches the board).
> WATCH papers on the wire: `buildId cd24d12d2`, `engineHash 52a84bc2…`, `era 6`, `viewVersion 3`.

The probe rode its own `anonId` (`sha256('heat15-probe')`), so it spent none of the riders' 30-per-hour
budget (F-HEAT14-7).

---

## 2. The board before the heat

`receipts-before.json`, measured from the live API (`/api/standings`, all 38 ledger contracts),
**2026-09-22T03:16:04Z**:

| number | value |
|---|---|
| board contracts measured | 38 (`e1-drill-yard` answers 400 — it is the training ground, not a board) |
| verified rows standing | **30** |
| reels counted retired | 56 |
| whose rows are they? | **all 30 carry `harness: heat14-operator`, `model: claude-opus-5`** — every standing row in the county is this rider's own |
| `e5-regatta` | rank 1 · reel `agent-3137e409-af61f6c2-95cd-4fdc-b022-4dfe45a49b5a` · **w12 / 200 g** · assayed `1789829862878` (2026-09-21) · 1 reel retired |

This is the stake the riders were given, verbatim in the charter: *your own row stands on this map,
and the map has been rebuilt underneath it*.

---

## 3. What changed on this map since the rider last rode it

Four era-6 pins, quoted to the riders verbatim from `assets/engine-era.json`:

- **#17 `e5-regatta-boat-01`** — the Claim-Boat becomes a steerable body on both engines; embark and
  disembark by position; two status-channel refusals; its physics in the E5 contract.
- **#18 `e5-regatta-boat-02`** — the race counts the boat as its only racer while a body is aboard;
  deserters forfeit; the beacon radius **3 → 6** by measurement.
- **#21 `e5-regatta-boat-03`** — the view publishes `now.regatta` on both engines (**view schema
  2 → 3**); `NOT_ABOARD` and `UNREACHABLE_WATER` join the published refusals.
- **#29 `f-rb2-2-gangway-reach`** (owner 2026-09-22, "F-RB2-2: gangway-reach only") — disembark only
  onto standable ground within one plank of the gangway; `CLAIM_BOAT_GANGWAY_REACH` = deck
  half-width 4.4 m + one plank 2 m = **6.4 m**, equal in every direction, measured from the deck
  anchor. A bow-ward intent lands inside her own 8.8 × 28.5 m deck and steps nobody.

No new verb came with any of it: the helm is `MOVE_HERO` while aboard.

---
<!-- §4 the rides, §5 the receipts delta, §6 winnability, §7 findings: written as the heat lands -->
