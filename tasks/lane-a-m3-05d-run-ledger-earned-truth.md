# Task lane-a-m3-05d-run-ledger-earned-truth: THE LEDGER LIES TO THE PLAYER WHO PRESSED THEIR LUCK — make "meta earned" true for a rush-death, and give the four track names ONE owner (LANE-A, commit prefix "m3:")

**FIRE-AUTHORED s1191 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST:
- `AGENTS.md`
- `reviews/m3-05c-run-ledger-meta-earned.md` — **the review of the predecessor that built this column. Findings F-1190-1 and F-1190-2 in it ARE this task; read them before you read anything else.**
- `src/game/RunManager.ts` — **lines 88-93 (which reason a death gets), 229-279 (`startRun` / `endRun` and the append you are editing), 288-310 (`secureRun`), 157-170 (`applySuspendRunState`), 422-434 (`awardSecuredClaim`), 592-597 (`trackLabel`).**
- `src/ui/RunLedger.ts` — **all ~166 lines; `renderEntry` at `:136` is where the labels are re-derived.**
- `src/game/MetaProgress.ts` — `META_TRACKS` (`:2`), `MetaTrack` (`:4`), `MetaPayout`. **This file is the new home of the label vocabulary.**
- `src/core/EventBus.ts:15` — `RunEndReason = 'death' | 'secured' | 'rush'`. Exactly three values, today.

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T02:2xZ: `lane/m3` was **1 ahead at `b70f4db1`** ("runner(lane-a): lane-a-m3-05c-run-ledger-meta-earned.md") but `git diff --name-only --diff-filter=A main lane/m3` was **EMPTY**, and the two-dot diff contains **no `src/` or `e2e/` path at all** — its content landed on main as `91c22f2e`, i.e. a FALSE-AHEAD SAFE DUPE. Re-derive it anyway; the board moves.)*

## Why (two findings from s1190's drain of `91c22f2e`, both re-measured at the code by s1191 before this master was written)

**(1) F-1190-2 — you can bank meta, press your luck, die, and the ledger says you earned nothing.** ✓ VERIFIED this fire, path by path: `secureRun` (`RunManager.ts:288`) calls `awardSecuredClaim()` at `:293`, which permanently adds the payout to `gr.meta.v1` and saves it (`:428-429`). If the player then takes **Stay for the Rush** and dies, `install`'s `hero_died` handler ends the run with reason **`'rush'`**, not `'death'` (`:91-92`, via `stayedForRushRunId`). The history append at `:269` is guarded by `reason === 'secured'`, so the entry gets **no `metaEarned` key** — and the Run Ledger shows a blank row for meta the player **keeps forever**.

This is a flaw in the *predecessor master's premise*, not in its implementation: that master explicitly bound `rush` to no `metaEarned`, and the runner **escalated rather than silently widening its own firewall** — the correct call. It lands on exactly the press-your-luck path the game is built to encourage.

**(2) F-1190-1 — one player-facing vocabulary, two authorities.** ✓ VERIFIED: `trackLabel` (`RunManager.ts:592`) maps `territory/science/hero/agent` → `Territory/Science/Hero/Agent` and is **module-private — never exported**. So `RunLedger.ts:145` re-derives the same four words with `` `${track[0].toUpperCase()}${track.slice(1)}` ``. The output is **byte-identical today**, which is precisely why every gate on `91c22f2e` was green. The exposure: `F-1185-1` is an open naming item and ADR-003 reserves *"the Prospector"* for the agent, so a future canon rename would leave the **Claim Office overlay and the Run Ledger saying different words on adjacent screens, with no test failing** — each spec asserts its own literal string.

## ⚠️ THE TRAP: THE OBVIOUS FIX FOR (1) IS RIGHT TODAY FOR A REASON THAT LIVES THREE FUNCTIONS AWAY

`reviews/m3-05c-run-ledger-meta-earned.md` recommends widening the guard to **`reason !== 'death'`**. That is *behaviourally correct today* — s1191 checked it — but only through a three-step inference: `'rush'` is reachable only when `stayedForRushRunId === runId`, which is set only by `stayForRush()` (which requires `securedRunId === runId`, `:219`) or by `secureRun`'s auto-rush branch (`:307`, three lines after the award) — **so every `'rush'` run happens to have been paid.**

**Do not ship the coincidence.** The row's claim is *"this run earned this"*, and the field that states exactly that is already on the class:

```ts
this.paidRunId === this.runId && this.lastPayout
```

`awardSecuredClaim` sets both together (`:430-431`); `startRun` increments `runId` every run (`:231`) so the pair self-expires; and `applySuspendRunState` maintains **both** across a suspend/resume (`:160` `paidRunId`, `:165` `lastPayout`) — ✓ verified, which is why the existing assertion at `e2e/m3-05b-run-ledger.spec.ts:98` will still hold.

`reason !== 'death'` is a **proxy** that a fourth `RunEndReason` would silently break, mis-crediting a run with the *previous* run's payout. `paidRunId === runId` is the thing itself. **Note honestly: the two are indistinguishable by any test the current three-value type permits — so the reason to prefer the exact one is structural, and you must not invent a fake test to "prove" the difference.** This is the same disease as finding (2), one level down: a claim that is green because two spellings coincide.

## Scope

1. **Make the row truthful.** At `RunManager.ts:269`, replace the `reason === 'secured'` condition on the `metaEarned` spread with the exact predicate **`this.paidRunId === this.runId && this.lastPayout`**. Change nothing else in `endRun`: `awardSecuredClaim` must still fire only for `reason === 'secured'` (`:257`) — **this slice changes what the ledger REPORTS, never what a run PAYS.**
   A plain death (never secured) must still write **no** `metaEarned` field, exactly as today.

2. **Give the vocabulary one owner.** **Move** `trackLabel` out of `RunManager.ts` into `src/game/MetaProgress.ts` and **export** it, typed on `MetaTrack`. Then:
   - `RunManager.ts:389` imports and calls it (behaviour unchanged);
   - `RunLedger.ts:145` imports and calls it **in place of** the inline `` `${track[0].toUpperCase()}${track.slice(1)}` ``.
   **`MetaProgress.ts` is the home because it already owns `META_TRACKS`, and because BOTH files already import from it** (`RunLedger.ts:2`, `RunManager.ts`) — so this adds **zero new import edges**. Do **not** instead export it from `RunManager.ts` and import that into the UI: that would create a new `src/ui → src/game/RunManager` edge, and the predecessor's drain already had to re-run the node-only collection guards over a much smaller new edge.
   After the move, **no ad-hoc capitalisation of a track name may remain anywhere in `src/`.**

3. **Prove (1) with the scenario that exposed it.** Extend `e2e/m3-05b-run-ledger.spec.ts` — follow the existing in-file harness at `:75-98` (`memoryStorage()` + `install(...)` + `restoreSuspend`), do not invent a new one — with a case that:
   a. restores a **secured + rush** run carrying a known `payout`;
   b. ends it by a hero death (so the recorded `outcome` is `'rush'`);
   c. asserts the newest history entry has `outcome: 'rush'` **and** `metaEarned` equal to that payout.
   Then add the rendered counterpart: a seeded `'rush'` entry **with** `metaEarned` shows `run-ledger-meta`, and its outcome cell still reads "Rush ended" (`RunLedger.ts:154`).

4. **Prove nothing regressed.** The existing assertions at `:98` (secured run records its payout), `:174` (a pre-slice entry with **no** `metaEarned` key stays **visible**) and `:176` (a death entry shows **no** meta row) must pass **unmodified**. **Add assertions; weaken, reorder, loosen and skip nothing.** Green on desktop **and** 390 px mobile.

## TOUCH-ONLY

- `src/game/RunManager.ts` — **only** the `metaEarned` condition inside the `appendRunHistory` argument object, the removal of the local `trackLabel`, and the import that replaces it.
- `src/game/MetaProgress.ts` — **only** the addition of the exported `trackLabel`. No change to `META_TRACKS`, `MetaPayout`, `addMetaPayout`, `cleanTrack`, `freshMetaProgress`, `loadMetaProgress`, `saveMetaProgress` or the `gr.meta.v1` schema.
- `src/ui/RunLedger.ts` — **only** the label call in `renderEntry` and its import.
- `e2e/m3-05b-run-ledger.spec.ts` — additive only.
- `tasks/runs/<your run report>.md`

## NO — do not touch, for any reason

- **`awardSecuredClaim`'s body, `Balance.meta.*`, `summarizeRun`, `secureRun`, `stayForRush`, `startRun`.** What a run *pays* is out of scope. If you find yourself changing when meta is awarded, you have left the slice.
- **`normalizeEntry` / `readRunHistory` / `RUN_HISTORY_LIMIT` (`RunLedger.ts:75-110`).** The predecessor's drain verified byte-for-byte that an entry lacking `metaEarned` is still **returned**; that gate is closed and correct. **Adding `metaEarned` to it would silently delete every run the player has banked, and no existing test would fail.**
- **`src/game/RunSuspend.ts`** — it has its own payout codec; `applySuspendRunState` already maintains `paidRunId` and you are relying on that, not changing it.
- **`src/core/EventBus.ts`** — do **not** add a fourth `RunEndReason` to make a test possible. If you believe one is needed, that is a STOP.
- **`src/ui/DeathOverlay.ts`** — F-1189-1 (no ledger entry point after a death) is **owner-gated**. Do not "fix" it here.
- **`src/game/ProfileStorage.ts`**, `src/ui/theme.css`, any other `e2e/**` file, any spec.
- `STATUS.md`, `reviews/**`, `tasks/BACKLOG.md`, `tasks/goals.json` — fire-owned surfaces.

## Self-check before you report

- `npx tsc --noEmit` exit 0; `npm run build` exit 0.
- `npm run test:node-guards` → **61/61, exit 0.** (If the npm script trips on its internal `&&`, run its halves directly and say so.)
- `npx playwright test e2e/m3-05b-run-ledger.spec.ts` green on **both** projects — paste pass/fail counts and confirm the count went **UP** (the predecessor was **10/10** per `reviews/m3-05c-run-ledger-meta-earned.md`).
- Adjacent, both projects, unmodified-green — paste counts: `e2e/meta-presence*` (**16/16** per the predecessor), `e2e/run-suspend*` (it exercises `applySuspendRunState`, the function this slice's predicate depends on), plus `e2e/m4-08-*` and `e2e/profiles*` if present. Any red: fingerprint it against a clean-main run and say which. **`run-suspend.spec.ts:193` is a known load-sensitive flake (F-1180-2) — if it fails, say so explicitly rather than counting it as new.**
- **Because scope 2 moves a symbol between modules, re-run the collection/import guards on your final tree and paste the result** — a new or reshaped import edge is exactly what they exist to catch.
- Zero console/page errors in a **plain boot** (no `?debug`), desktop + 390 px.
- **State where the PLAYER sees this** (Mistake #10): the exact click path from a plain boot to a **rush-outcome** ledger card showing a meta row.
- **Paste `git diff --stat`**, and paste the **final text of the changed line at `RunManager.ts:269`**.
- **Paste the output of a repo-wide search proving scope 2 is complete** — no remaining ad-hoc capitalisation of a track name in `src/` (e.g. search `src/` for `toUpperCase` near `track`), and `trackLabel` defined in exactly **one** file.

**Two pre-declared STOPs, both SUCCESSES if they fire:**
- If `paidRunId`/`lastPayout` turn out **not** to be reliably set on some path that reaches `endRun` (i.e. you find a run that was paid but whose `paidRunId !== runId`, or one unpaid whose predicate is true), **STOP and report the path with evidence** rather than falling back to `reason !== 'death'`. That would mean the finding's premise is wrong and the owner needs to see it.
- If moving `trackLabel` into `MetaProgress.ts` breaks a guard, a layering rule in `AGENTS.md`, or the node-only collection, **STOP and report which**, rather than routing the import through `RunManager.ts` instead.

READY-FOR-GATES + report: the diff stat, the final `:269` line, the both-project spec counts before/after, the adjacent-suite table (with `run-suspend` called out), the collection-guard result for the moved symbol, the single-authority search output, and the plain-boot click path to a rush card showing a meta row.
