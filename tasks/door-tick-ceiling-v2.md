# Task door-tick-ceiling-v2: the two-site ceiling — per-contract duration at the door AND at the assayer (lane-c, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2279, re-authoring `door-tick-ceiling` with its firewall LIFTED after a correct firewall STOP. No new scope, no new design question: the same ruling the v1 master already made, extended to the second file that enforces the same number.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST:
- `AGENTS.md`
- **`reviews/door-tick-ceiling-stopped.md`** — the v1 STOP and its measured cause. This is your WHY; read it before anything else.
- `tasks/door-tick-ceiling.md` — the v1 master. **Its scope items 1–5 and its no-op/honesty guard remain BINDING and are not restated in full here.** Only the firewall changes.
- `artifacts/gauntlet-heat5-20260824/heat5-note.md` §Door findings 1–3 — the original measured defects.
- `functions/api/standings.ts` (the submission ceiling + body-size limit), `src/playbook/PlaybookFormat.ts` (`MAX_PLAYBOOK_TICKS`, `validatePlaybook`), `src/game/RunTape.ts` (`validateRunTape` delegates at `:324`), `scripts/assay-replay-agent.mjs` (calls `validateRunTape` before replay).
- `assets/contracts/` — where a contract's own duration semantics live; night-shift secures at wave 25 / DAWN, structurally past 300 s.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template — ahead content already on main = SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; **STOP on un-merged ahead content or foreign edits.** FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

**Dispatch citation check (hard STOP if it fails):** `grep -Fc "sites must move together or not at all" reviews/door-tick-ceiling-stopped.md` must return **1**. (Key verified against the file on main at authoring time — F-1425-2; the first draft of this key differed by one capital letter and matched **nowhere**, which would have read as a stale lane and sent you chasing a phantom refresh.) Zero means your lane is stale — refresh it and re-read; do NOT proceed on a stale tree.

## Why (v1 stopped correctly; the cure is bigger than its firewall was)

v1 was sent to widen the door and found the same 18,000 enforced twice. Measured 2026-08-24 and re-measured at the drain: `MAX_PLAYBOOK_TICKS = 18_000` (`src/playbook/PlaybookFormat.ts:11`) is applied by `validatePlaybook` at `:90`; `validateRunTape` delegates to it; `assay-replay-agent.mjs` calls that before replay. So the heat-5 night-shift winning tape (`durationTicks: 22501`) fails `assay replay failed: malformed tape` **even with the standings validator fully widened** — reproduced by running the instrument. v1 reverted rather than ship half. That was right.

**The harm of a one-site cure is worse than the status quo**: the county would ACCEPT a submission its own assayer then refuses as malformed, moving the rejection from the door to the audit and telling an honest rider their winning reel is corrupt.

## Scope

1. **Everything in v1's scope items 1–5, unchanged** — the ceiling derives from each contract's own semantics (secure wave × wave schedule, overtime rules, plus an explicit safety margin that includes the recording seam's final-tick entry, the c-era `durationTicks = max(elapsed, lastEntryTick + 1)` law); a contract without special semantics keeps today's 18,000 behaviour; the 413/body-size disposition; both backends through the L1 seam; the per-contract ceiling table pinned for the six E1 contracts plus night-shift's 22,501 accepted and a beyond-margin refusal.
2. **NEW — the second site moves with the first.** `MAX_PLAYBOOK_TICKS` must stop being a single global constant that two subsystems read for two different questions. The playbook recorder's ten-minute bound and the assay replay's lawful-duration bound are **not the same law** and must not remain the same number by accident. Give the replay path a contract-aware bound derived from the same table as item 1, and leave the browser recorder's DoS bound intact.
3. ⚠️ **THE DoS BOUND IS LOAD-BEARING AND MUST SURVIVE — this is the one thing that turns a good cure into a bad one.** `MAX_PLAYBOOK_TICKS` bounds what a *browser* will record and replay; an unbounded playbook is an abuse door. Do NOT simply raise it, and do NOT delete it. The shape v1's master already ruled and this master re-affirms: **per-contract derivation with explicit margins, which keeps a bound everywhere while honouring each contract's own law.** If you cannot keep an effective bound on the recorder path, STOP and say so — that is a real finding, not a failure.
4. The v1 gate, now actually reachable: **the stranded night-shift winning tape must reach `verified` through the local flow** (spawn the ledger service + worker locally, or prove via the validator unit + the replay instrument — state which you did), AND `node scripts/assay-replay-agent.mjs artifacts/gauntlet-heat5-20260824/e1-night-shift/winning-tape.json` must exit 0. The twin-banks 18,001 case accepted; an absurd-duration reel still refused **on both paths**.

## Firewall

**Touch ONLY:** `functions/api/standings.ts` · **`src/playbook/PlaybookFormat.ts`** (the lift) · **`src/game/RunTape.ts`** (the lift, only where it delegates the duration bound) · `scripts/assay-replay-agent.mjs` **only if** the contract-aware bound must be threaded through it · `public/skill.md` IF the compact-JSON guidance lands (**re-pin its guards in the same commit**) · the suites covering the above · your `tasks/BACKLOG.md` row.

**NO:** no ranking changes · no worker changes beyond the validator · no sim/gameplay behaviour changes (this is a *validation* boundary, not a simulation one) · **no other `src/` files** — the lift is exactly the two named above and nothing further.

⚠️ **Path-scoped `git add` is still whole-FILE (F-2273-2).** If a concurrent writer has dirtied one of your files, do NOT sweep their hunk in — report it.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean; `npm run build` green; `npm run test:stats` + the standings suites green **on both arms**; **`npm run test:node-guards` green** (you are touching `src/`, so the cross-cutting sim pins apply — F-1460-1); the night-shift tape's acceptance proven **through the replay instrument, quoted**; the per-contract ceiling table shown in your report; `skillmd-guard` green if `public/skill.md` was touched.

End: **READY-FOR-GATES** + report: the ceiling law as shipped (the per-contract table), the night-shift proof with the exact command and its output, how the recorder's DoS bound is preserved and what it is now, and the 413 disposition.

## No-op / honesty guard

If the two bounds turn out to be genuinely inseparable without weakening the recorder, **STOP and name it precisely** — that is a publishable finding and the third fork goes to the owner. Do not ship a cure that widens the door and leaves the assayer refusing; that is the exact failure this re-author exists to prevent. A second correct STOP is a better outcome than a partial fix.
