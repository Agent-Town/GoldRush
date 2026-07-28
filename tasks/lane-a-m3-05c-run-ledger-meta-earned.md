# Task lane-a-m3-05c-run-ledger-meta-earned: THE RUN LEDGER'S LAST MISSING COLUMN — record and render "meta earned" per run, and change nothing else (LANE-A, commit prefix "m3:")

**FIRE-AUTHORED s1189 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST:
- `AGENTS.md`
- `reviews/m3-05b-run-ledger.md` — **the review of the predecessor that built this page. Its "what it does" paragraph and its SAVE-COMPAT note are your brief.**
- `src/ui/RunLedger.ts` — **all 166 lines. You are extending it, and its `normalizeEntry` tolerance is the thing you must not break.**
- `src/game/RunManager.ts` — **lines 240-270 (the run-end append) and 421-433 (`awardSecuredClaim`). The datum you need is already computed three lines above the call site you are editing.**
- `src/game/MetaProgress.ts` — `META_TRACKS`, `MetaPayout`.
- `tasks/lane-a-m3-05-run-history.md` — **the original master, now a DO-NOT-QUEUE guard. Its residual item (1) is this task. Do NOT execute the rest of that file.**

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T01:2xZ: `lane/m3` was **1 ahead at `371ce258`** ("runner(lane-a): lane-a-gazette-art-wiring-hardening.md") but `git diff --name-only --diff-filter=A main..lane/m3` was **EMPTY** — its content landed on main as `bc18218c`, i.e. a FALSE-AHEAD SAFE DUPE. Re-derive it anyway; the board moves.)*

## Why (F-1131-1's residual, re-measured at the files s1189 2026-07-29)

The original M3-05 master asked the Claim Office for a Run Ledger listing *"wave, victory/death, base value, **meta earned**, weapon split"*. `d9c8676862a3cfae2eef54e09ea402177877f7d8` shipped that page and every column **except meta earned** — verified this fire: `RunHistoryEntry` (`src/ui/RunLedger.ts:6-15`) carries `at/contractId/contract/outcome/waves/gold/goldByProspector/duration`, and `renderEntry` (`:123`) renders date · contract · outcome · waves · gold-split · duration. No meta anywhere. ("Weapon split" is **not** owed — the m4-08 per-actor split superseded it, as the original master's own re-scope note anticipated.)

The datum is not missing, only unrecorded. `RunManager.ts:257` calls `awardSecuredClaim()` — which computes a four-track `MetaPayout`, banks it into `gr.meta.v1`, and stores it in `this.lastPayout` (`:429`) — and then **`:260` appends the history entry three lines later without it.** So this is one additive field written at a call site where the value is already in hand.

**Why it is worth a slice:** meta is the only *permanent* thing a run produces. A ledger of past runs that omits what each run permanently earned tells the player what they lost and not what they kept.

## ⚠️ THE TRAP: THIS PAGE IS THE PLAYER'S OWN HISTORY, AND A STRICTER READ SILENTLY DELETES IT

`normalizeEntry` (`src/ui/RunLedger.ts:75`) returns `null` for any entry failing its checks, and `readRunHistory` **filters nulls out**. It survives schema growth today only because it spreads `...value` and validates a fixed, closed set of fields — so an entry from before your change (which has **no** `metaEarned`) passes through untouched.

**If you add `metaEarned` to that validation gate, every run the player has already banked disappears from their ledger the moment they open it — and no existing test would fail.** That is the F-1174-1 vocabulary-trap shape: a field added as a *requirement* instead of as a *sibling*.

**So the binding rule: `metaEarned` is OPTIONAL ON READ, FOREVER.** A missing, malformed, or partial payout renders as an absent row — never as a rejected entry, never as `NaN`, never as `0` presented as fact.

## Scope

1. **Record it.** Extend `RunHistoryEntry` with an **optional** `metaEarned?: Partial<Record<MetaTrack, number>>` (or the equivalent — `MetaPayout` is `Record<MetaTrack, number>`), and populate it at the `appendRunHistory` call site in `RunManager.ts:260` from the payout already computed at `:429`.
   Non-secured runs (`death`, `rush`) never call `awardSecuredClaim`, so they legitimately earn nothing: write **no** `metaEarned` field for them rather than a zero-filled object. Do not make `awardSecuredClaim` fire for any new reason, and do not change what it pays.

2. **Normalise it defensively, WITHOUT gating on it.** In `normalizeEntry`, sanitise `metaEarned` if present (finite, non-negative, per-track, unknown track keys dropped) and **omit the field entirely when it is absent, unusable, or all-zero.** An entry must never be rejected because of this field. Keep the `...value` spread.

3. **Render it.** Add one `<dl>` row to `renderEntry` with `data-testid="run-ledger-meta"`, listing **only the non-zero tracks** by name, in `META_TRACKS` order. **Omit the whole row** when there is nothing to show — a death run's card must look exactly as it does today, not gain an empty field. Match the surrounding voice and markup; add no new CSS class and no new stylesheet rule.

4. **Prove the compatibility, not just the feature.** Extend `e2e/m3-05b-run-ledger.spec.ts` with assertions that:
   a. a secured run's card shows `run-ledger-meta` with its non-zero tracks;
   b. **a seeded pre-slice entry — one with no `metaEarned` key at all — still appears in the list** and shows no meta row (this is the regression that would otherwise wipe a player's history);
   c. a death-outcome entry shows no meta row.
   **Add assertions; weaken, reorder, loosen and skip nothing.** The spec must stay green on desktop **and** 390 px mobile.

## TOUCH-ONLY

- `src/ui/RunLedger.ts`
- `src/game/RunManager.ts` — **only** the `appendRunHistory` argument object at `:260`; nothing else in the file.
- `e2e/m3-05b-run-ledger.spec.ts` — additive only.
- `tasks/runs/<your run report>.md`

## NO — do not touch, for any reason

- **`src/game/MetaProgress.ts`** — the payout maths, `META_TRACKS`, the `gr.meta.v1` schema and `addMetaPayout` are all untouched. You are *reporting* meta, not changing it. (ADR-002 reserves the `agent` track's interpretation to M4 — display it, do not interpret it.)
- **`src/game/ProfileStorage.ts`** — `gr.history.v1` is already registered; no key added, no `PROFILE_DATA_KEYS` edit.
- **`awardSecuredClaim`'s body, `Balance.meta.*`, `summarizeRun`, `RunSuspend.ts`** — the suspend/resume record has its own payout codec (`RunSuspend.ts:2684`); it is **out of scope** and must not be extended.
- **Any other `e2e/**` file, any spec, `src/ui/theme.css`, `src/ui/DeathOverlay.ts`.** F-1189-1 (no ledger entry point on the death overlay) is **owner-gated** — do not "fix" it here.
- `STATUS.md`, `reviews/**`, `tasks/BACKLOG.md`, `tasks/goals.json` — fire-owned surfaces.

## Self-check before you report

- `npx tsc --noEmit` exit 0; `npm run build` exit 0.
- `npm run test:node-guards` → **61/61, exit 0.**
- `npx playwright test e2e/m3-05b-run-ledger.spec.ts` green on **both** projects — paste the pass/fail counts and confirm the count went UP (the predecessor was 6/6 per its review).
- Adjacent, both projects, unmodified-green — paste counts: `e2e/run-ledger*`, `e2e/profiles*`, `e2e/persistence*` if present, plus **`e2e/m4-08-*`** (the per-actor split feeds the same card). Any red: fingerprint it against a clean-main run and say which.
- Zero console/page errors in a **plain boot** (no `?debug`), desktop + 390 px.
- **State in your report where the PLAYER sees this** (Mistake #10): the exact click path from a plain boot to a visible meta row.
- **Paste `git diff --stat`** and confirm `src/game/RunManager.ts` changed **only** inside the `appendRunHistory` argument object.
- **Quote your final `normalizeEntry` and state plainly: can an entry lacking `metaEarned` still be returned?** If the answer is anything but an unqualified yes, you have shipped the trap above.

**If you conclude the four-track payout cannot be displayed without a design ruling (e.g. the track names are not player-facing vocabulary anywhere in the UI), STOP and report that instead of inventing labels** — check how `formatMetaProgress` and the Claim Office already name these tracks and reuse that vocabulary. A STOP with the naming evidence is a success; invented player-facing nouns are a canon violation (§9.4).

READY-FOR-GATES + report: the diff stat, the `normalizeEntry` compatibility answer, both-project spec counts before/after, the adjacent-suite table, the plain-boot click path to a visible meta row, and the track vocabulary you reused with its source.
