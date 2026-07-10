# reviews/073-tier-param-crash.md — POST-HOC GATE (s286, 2026-07-10)

**Slice:** 073-tier-param-crash (main slot; from swarm finding [high] `reviews/swarm-48h-confirmed.json` — "Tier URL param triggers infinite read→save→notify recursion, crashing the Start Menu").
**Branch/tip:** main. **Merged at:** `277c22b` (see MERGE CLASSIFICATION — arrived UNGATED, mislabeled).
**Verdict:** ✅ **PASS (post-hoc).** The already-on-main code is correct and gated green after the fact.

## What it does
1. **Breaks the recursion structurally** — `savePerformanceTierOverride` (`src/game/PerformanceTier.ts:163`) now early-returns when the value is unchanged: `if (readStoredOverride() === value) return value;` before the `setItem` + notify. The URL-param apply path no longer re-enters the read→save→notify cycle. (Scope item 1: idempotent apply — one line, the fix the evidence supports.)
2. **Moves the tier key device-local** — `PERFORMANCE_TIER_STORAGE_KEY` removed from `PROFILE_DATA_KEYS` and `LATE_PROFILE_DATA_KEYS` in `src/game/ProfileStorage.ts`, so it no longer travels with the cloud-synced profile (a device-hardware-specific value should not follow the profile across devices). New `DEVICE_LOCAL_MIGRATION_KEYS` + `migrateDeviceLocalDataKeys()` / `readDeviceLocalDatum()` read-through migration preserve existing per-profile-scoped values. (Scope item 2.)

## Evidence (post-hoc gate, s286)
| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (561 modules, built 400ms; only pre-existing >900kB chunk-size warning) |
| `e2e/058-device-tiers.spec.ts` (scratch 5199, desktop-chrome + mobile-chrome) | 7 passed / 9 self-skipped (capture/webkit-gated) |
| — `:110` "tier URL param does not recurse when the Start Menu re-renders" | PASS both projects (the crash repro — now green) |
| — `:129` "profile transfer excludes the device-local tier key and migrates old scoped values" | PASS both projects |
| — `:195` "tier switch is render-only for a deterministic economy slice" | PASS both projects |

## Merge classification — ⚠ arrived UNGATED via runner broad-add
073's uncommitted main-slot src (`PerformanceTier.ts` +1, `ProfileStorage.ts` +24, `e2e/058-device-tiers.spec.ts` +80, `artifacts/058`) was swept onto main **inside the runner's ART commit `277c22b` ("runner(art): art-kit-era-9-retake")** by a broad `git add` in the art slot (= repo root), comingled with 071 and the legit kit-era-9 art. It merged with NO gate battery, NO review, and MISLABELED; the commit also deleted `tasks/queue/main/073-tier-param-crash.md`. This is the **F-en02-1 / F-058-1 recurring runner defect** (identical to 058's tier CORE swept into e5 art `91c4c3e`, and mp-02 code swept via `ff46a53`). This s286 post-hoc gate is the retroactive drain; the code itself is intact and correct.

## Findings
- **F-073-1 (recurring, corrective/attended owed — NOT new):** the art/main-slot runner performs a broad `git add` that sweeps uncommitted main-slot src into art commits. Third+ observed instance (058 core `91c4c3e`, mp-02 `ff46a53`, now 071+073 `277c22b`). Root fix belongs in the runner (path-scoped adds per slot) — attended/runner-owner. Tracked in BACKLOG.
- **F-073-2 (env, non-blocking, PROVEN):** the first combined 6-worker run showed the two heaviest 057 combat-sim tests timing out; unrelated to 073. See `reviews/071-skyrocket-capture-gate.md` F-071-2.
