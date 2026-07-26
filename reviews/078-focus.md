# 078-focus-and-ledger-reverts — drain review (s1104)

**Slice:** `lane-078-focus-and-ledger-reverts` (F-1101-2 corrective)
**Branch:** `lane/e2-arsenal` · **Lane tip:** `47f21b29` (code at `58ef3478`)
**Base:** `ffd89089` (verified ancestor of main)
**Merge:** `5ec26bce` onto main
**Verdict:** ✅ **MERGED — all three reverted fixes restored, 078 goes 1/4 → 4/4 on both projects.**

## What it does

s1102 root-caused `e2e/078-ux-hygiene.spec.ts` (frozen since `cd76c7f0`, 2026-07-10) failing 3/4 because
two stale-base landings of 2026-07-11 silently reverted three fixes made on 2026-07-10. This slice
restores exactly those three, and nothing else:

1. **`src/encyclopedia/reader.ts`** — the ledger regains its focus contract: `openClaimLedger` records
   `document.activeElement`, `closeClaimLedger` restores it when notifying, and a `trapLedgerFocus`
   helper re-adds the Tab/Shift-Tab wrap inside the dialog.
2. **`src/encyclopedia/state.ts`** — unknown ledger ids in storage are no longer destroyed on write-back.
   `readStoredDiscovered` is now a *filtered wrapper* over a new unfiltered `readStoredDiscoveryValues`,
   and `discoverLedgerEntry` writes against the unfiltered set. **RULING 5 is honoured** — the discovery
   filter still exists on the read path used by the UI; it was not deleted, only split.
3. **`src/town/TownScene.ts`** — `'[data-contract-launch]:not(:disabled), [data-contract-close]'` was a
   CSS selector *list*, which returns the first match in **document order**, not in preference order, so
   Close won whenever it preceded Launch. Split into an explicit `??` so Launch is genuinely preferred.

Player-visible: the Claim Ledger returns focus to whatever opened it and traps Tab while open; the
contract board focuses **Launch** on open.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | ✓ built in 1.62s |
| `078-ux-hygiene` desktop-chrome `--workers=1` | **4 passed (8.6s)** |
| `078-ux-hygiene` mobile-chrome `--workers=1` | **4 passed (9.0s)** |
| Adjacent: `en-01-claim-ledger` + `en-02-e1-coverage` + `en-03-epoch-pages`, both projects | 14 collected, **13 passed, 1 failed** → F-1104-3, fingerprinted pre-existing |
| Adjacent: `town-t3-board`, both projects | 12 collected, **10 passed, 2 failed** → fingerprinted pre-existing, byte-identical |
| Boot probes: `profile-first-boot` + `town-fresh-boot-textures`, both projects | **14 passed (39.3s)**, zero console/page errors |
| Screenshots | `reviews/shots-078-focus/` — 4 (launch-focused + ledger-focus-restored, desktop + mobile-390) |

**Merge classification:** lane touched `src/encyclopedia/{reader,state}.ts`, `src/town/TownScene.ts` and 4
PNGs; main moved only `STATUS.md`, `tasks/*`, `logs/suite-runs/*` since the base. **Disjoint — no file
moved on both sides, so no graft was required.** Clean `ort` merge.

## Findings

### F-1104-1 — the master's self-check named two spec files that do not exist (method defect)
Step 5 of `tasks/lane-078-focus-and-ledger-reverts.md` orders the adjacent run as
`e2e/en-01-ledger.spec.ts e2e/en-02-ledger.spec.ts e2e/en-03-epoch-pages.spec.ts`. **The first two names
have never existed** — the real files are `en-01-claim-ledger.spec.ts` and `en-02-e1-coverage.spec.ts`.
Playwright treats a positional argument as a *filename filter*, so a name matching nothing contributes
**zero tests and does not fail**: running the master's literal command collects **2 tests** and exits **0**,
while the honest command collects **14**. A gate that silently shrinks 14→2 and still prints green is the
same class as F-1094-1 (`npm test` collecting 0 tests for nine days). Non-blocking here — I ran the real
filenames — but **task masters must cite spec paths that were `ls`-verified when authored.**

### F-1104-2 — two 8-day-dead playwright zombies were permanently blocking F-1101-1 (REAPED this fire)
The `lane-calibrate-suite-workers` run (`20260727-044706`) STOPped at its quiescence gate, correctly,
reporting "two foreign Playwright processes". Measured: pids **24303 / 24384**,
`npm exec playwright test --config playwright.accounts.config.ts` out of `worktrees/lane-b`, started
**Sat Jul 18 09:49:38 2026** (8d19h), `ppid 1` (orphaned), **total CPU 0:00.26 and 0:00.54 — with zero
growth across two samples 45s apart.** Dead, not busy. Because the gate tests for *existence*, these
corpses would have STOPped the calibration **on every future dispatch, forever**. Reaped with SIGTERM
behind an identity check (accounts-config playwright only; abort on any codex/runner/claude match);
**0 playwright processes remain.** This is the recurrence the memory note "accounts playwright + resident
claude = attended — but CHECK CPU" warns about: liveness is CPU, never pid-existence.

### F-1104-3 — `en-02-e1-coverage.spec.ts:244` is flaky on BOTH trees (pre-existing, not this merge)
First sample looked like a regression: failed on merged, passed on clean-main control. **Repeating it
disproved that** — merged **1 pass / 1 fail**, control **1 pass / 1 fail**, identical. The failure is never
in a ledger assertion; it is in the `approachSchoolhouse` helper, where `hold(page,'KeyA',1150)` and
`hold(page,'KeyS',900)` are **wall-clock** holds whose distance travelled depends on how many frames the
box renders in that window. Load-sensitive by construction — F-1101-1's class. Not a blocker; worth a
deterministic-stepping fix on the ladder.

### F-1104-4 — the queued calibration master uses a `pgrep` flag macOS does not have
Codex reported `pgrep -fc "Chrome for Testing"` prints usage instead of a count on this host, so the
master's Chrome census reads as junk rather than a number. Fixed in place this fire (see handoff) —
the master had not yet been re-dispatched, so no run was harmed.

### Carried forward from the implementer (non-blocking, owner-gated)
The restored Tab trap collects focusables by selector and so **ignores hidden ancestors on E2 pages**;
the broader `inert` alternative remains **RULING 6, owner-gated** and was correctly not implemented.

### Pre-existing red, confirmed independently (s1103's rider)
`town-t3-board.spec.ts:161` fails on **both** projects at `:203`, expecting
`data-contract-art-key="contract-dry-gulch"` but receiving `"plate"`. s1103 flagged this for confirmation
"from its own control run, do not wave it through". Confirmed on a **detached clean-main worktree at the
pre-merge commit `06c427f3`**: byte-identical message, same two projects. **Not this slice's.** It is a
genuine manifest/markup mismatch and wants its own corrective.
