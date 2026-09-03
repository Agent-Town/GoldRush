# Review — refusal-taxonomy

**Slice:** `refusal-taxonomy` (lane-d) — HarnessDev §3 F, owner-approved 2026-09-03
**Branch:** `lane/d` — runner commit `d9b46e435`
**Gated tip:** `75e86f1c3934f4aaf2258df13b7f948f3e3d0c2f`
**Merged to main:** `75e86f1c3934f4aaf2258df13b7f948f3e3d0c2f` — fast-forward of the gated commit itself
**Drained by:** s2470

## Verdict

**PASS — MERGED.** One finding filed (**F-2470-1**, non-blocking, and it is about a *guard's* future coverage, not about anything unsafe in this slice).

## What it does

The door already named every refusal and then forgot it. A rider evolving its charter could not see that it had been refused eleven times for duration and twice for an unstamped era.

- Every refusal branch in `functions/api/standings.ts` now routes through `refuseSubmission(...)` instead of `error(...)` — **same status, same reason code, same message**, plus a recorded row.
- New `functions/api/refusals.ts` (151 lines) with `GET /api/refusals?rider=<anonId>|?profile=` returning per-reason counts and the last N refusals, rate-limited like the other read endpoints.
- `server/ledger/storage.mjs` gains an additive `refusals` table (+ two indices) and `recordRefusal`/`readRefusals`.
- `public/skill.md` documents the endpoint and the full reason list under HONESTY LAWS, pinned by `skillmd-guard`.
- The enumeration is **executable**: a test asserts every refusal branch in `standings.ts` appears in the taxonomy, and a second test proves that enumeration **bites** by manufacturing a dropped reason in a child process.

**Ranking untouched** — no change to `SCORE_KEYS`, `compareScores`, or accepted-row semantics.

## Evidence

Gated on the **merged tree** in a **detached worktree** (`gate-s2470`, §3.0b).

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 5.2 s |
| `npm run build` | **rc=0**, 18.2 s |
| `npm run test:stats` (the master's named suite) | **rc=0**, 7.6 s — **87 / 215 / 215 / 26**, both KV *and* sqlite refusal paths returning a sample |
| `skillmd-guard.test.mjs` (the conflicted file) | **rc=0**, **13 / 13**, 0 skipped |
| — incl. lane/d's own mutation proof `the refusal enumeration BITES an unrecorded branch` | **PASS, 2415 ms** — it really spawned its child; not skipped |
| — incl. main's `pins the harness receipt law` + `pins optional declared tokens` | **PASS** — both sides of the conflict genuinely execute |
| `function-cors-allowlist` + `door-admission-ratchet` + `worker-type-coverage` + `site-contract` + `ledger-backup-pull` | **rc=0**, **13 / 13**, incl. *"every functions/**/*.ts is type-checked"* (covers the new `refusals.ts`) |
| e2e door specs, desktop **and** 390px mobile, `--workers=1` | **8 failed / 34 passed — IDENTICAL TO MAIN**, see the differential below |

**Note the `test:stats` count is higher than the runner's** (215/215 vs its 207/207). Main gained checks from the s2469 harness-receipts drain in between, so my re-run is the honest number — this is exactly why the drain's own re-run is a free control on the runner's headline (F-2166-2).

### The e2e differential — the reds are main's, not this slice's

The four door-adjacent specs are **already red on main**, so per §3 this drain is gated on a **differential** rather than on a green. A control worktree (`ctrl-s2470`) was checked out at main *without* this slice and run with the identical command:

| Arm | rc | Result | Output |
|---|---|---|---|
| **CONTROL** (main, no slice) | 1 | **8 failed / 34 passed** | 25051 B |
| **MERGED** (main + slice) | 1 | **8 failed / 34 passed** | 25051 B |

The same 8 tests fail at the same lines in both arms, and the two runs are **byte-identical in length**. The failures are `assay-season-roll` ×2, `cosmetic-grants` ×1, `field-book` ×1, each in both projects — all UI/board/wardrobe assertions, none in the submission path.

**`lb-01-county-standings.spec.ts` — the main door spec — passes entirely in both arms**, including its `bad_payload` assertion at `:323`. That case is a *declared-harness-without-version* failure, which still returns `bad_payload`; it is not intercepted by the new early `unsecured` branch. I checked that specific fixture rather than assuming.

The control asserted its own validity before its result was believed (F-2215-1): `ran=true`, 34 tests genuinely passed, so its silence on the submission path is a measurement and not a harness failure.

⚠️ `red-inventory-lookup` reports **NOT-IN-INVENTORY** for these, but its snapshot is **22 days stale** with 203 commits touching `e2e/`/`src/` since, and the tool says so itself — *"absence here is not evidence either way."* I did not rely on it. The same-hour control on the same machine is the stronger evidence.

## Merge classification

Base: lane 1 commit ahead, 30 behind. One conflict.

| File | Class | Resolution |
|---|---|---|
| `functions/api/refusals.ts` | LANE-ONLY (new) | added |
| `functions/api/standings.ts`, `public/skill.md`, `scripts/test-standings.mjs`, `tasks/BACKLOG.md` | BOTH-MOVED | clean auto-merge |
| `scripts/test-ledger-worker.mjs`, `server/ledger/*.mjs` | LANE-TOUCHED | clean |
| **`scripts/skillmd-guard.test.mjs`** | **BOTH-MOVED — CONFLICT** | **union, resolved at the syntactic boundary — see below** |

### The conflict, and why a naive union would have shipped a broken file

This is **F-2469-1's exact hazard**, one fire after it was filed. The hunk straddled a syntactic boundary: *both* sides' final `test(` was left open, closed by a **single shared `});` below the `>>>>>>>` marker**. A keep-both-sides union therefore produces `test(` nested inside `test(`, unterminated — a file that does not parse, while a presence-check for each side's strings passes happily, because both sides' strings really are present.

Resolved by closing HEAD's open `test()` explicitly, then letting the shared closer terminate lane/d's last test. The resolver asserted its reading of the structure *before* editing (shared closer is `});`, HEAD tail is the digest-recipe assert, lane tail is a closing brace) and refused if any of those did not hold.

**Verified by parsing and running, never by grepping for each side's strings:**

- `node --check` → **OK**
- **13 top-level `test(`, 0 nested** (regex on `^test(` vs `^  test(`)
- Test-name set algebra: main **10** ∪ lane **11** = merged **13**, with `main missing: []`, `lane missing: []`, `extras invented: []`
- The file then **ran 13/13**, so both sides' assertions actually execute — which is the only proof that matters

## Findings

### 🔴 F-2470-1 — the ledger-mirror exposure guard cannot see the table this slice adds (NON-BLOCKING, realised cost ZERO)

`scripts/ledger-mirror-exposure.mjs` is the instrument protecting LB-01's **one-way door**: a mirror row committed to git is undone only by a force-push, which is deny-listed here (F-2353-2). It enumerates every table in each mirror, but harvests keys only from tables carrying a `key` column:

```js
// scripts/ledger-mirror-exposure.mjs:143
if (!cols.includes('key')) continue;
```

This slice adds a `refusals` table whose columns are `id, reason, contract_id, anon_id, profile_name, refused_at` — **no `key` column**. So the table is skipped in full, and every row in it is invisible to the classifier. `readMirror` does collect a `tables` array, but **`tables` is never reported, declared, or asserted anywhere** — measured by grep, its only other occurrence in the file is the `unreadable` fallback at `:153`.

Live output today, verbatim:

```
keys inspected          : 67
account-class rows      : 0
✅ CLEAN — every key in every mirror is county-standings class.
   Nothing here carries account data; these mirrors are safe to commit.
```

That last sentence is an affirmative, worded all-clear about **the whole mirror**, produced from a `key`-column-only corpus. It is **F-2221-1's polarity** — the worst shape this factory has catalogued: narrow the corpus, then print good news *in words*.

⚖️ **Severity stated honestly and deliberately not inflated. NOTHING UNSAFE SHIPS IN THIS SLICE, and it is not a false green today:**
- The mirrors on disk contain **zero** refusal rows — the table does not exist in them yet — so every `CLEAN` reported so far is **TRUE**.
- The data the table will carry (`anonId`, `profileName`, `contractId`, `reason`, timestamp) is **county-standings class by the master's own design** (*"no personal data beyond what standings already publish"*) and is explicitly lawful under the standing gate's wording: *"a plaintext ledger of county standings is fine, account data is not."*
- So this is **not a blocker** and no corrective task is queued against the merge.

🎯 **What earns it a finding is the DIRECTION and the arming schedule.** The gate is currently held shut only by the sign-in outage (F-2353-2: *fixing F-MAIL-0829 is what arms it*). From today the ledger has **two shapes of table**, and the guard's axis can only express one. A future slice that puts account-class data in any non-KV table gets `✅ CLEAN` and an invitation to commit.

🛠️ **Cure (small, unclaimed):** declare the corpus the guard actually inspected — report `tables` and name any table skipped for having no `key` column, **on the happy path too** (F-2208-1). That converts a silent narrowing into a visible one without adding a refusal, so it cannot be excused into uselessness (F-1460-1). The `tables` array is already collected; only the reporting is missing.

💡 **Reusable:** this is **F-2358-1 / F-2389-1** again — do not ask how *wide* a selector is, ask whether **its axis can express the defect at all**. A key-prefix classifier cannot express "a table with no keys," at any prefix list length, forever.

### Non-blocking observations (recorded, not filed)

- **The door's reason for an unsecured submission became more specific.** On main, `secured !== true` fell through `validateScore` (`standings.ts:968`) to `bad_payload`; the slice adds an early branch returning `unsecured` with *"Only a secured claim can enter the standings."* Same 400, finer reason — which is the point of a refusal taxonomy, and the master's READ-FIRST list names `unsecured` as a reason to enumerate. I grepped `src/`, `e2e/`, `site/` for consumers of these codes: the only three are two cosmetic-grants assertions (a different endpoint) and `lb-01:323` (a stack failure, still `bad_payload`). **No consumer breaks**, verified rather than assumed.
- **The request body is now read before the season check**, where the old comment specifically noted it was refused *before* the body was read (RETENTION LAW). This is safe: the size/parse guards still fire first *inside* `readJson` (its `reel_too_large`/`bad_json` throws are caught and converted to refusals), the season check still refuses before any board write, and refusals are written to the separate `refusals` table — never appended to a closed season's board. The runner rewrote the comment to say so.
- **`recordRefusal` is optional** (`refusals.ts:33`) and guarded at `:92`, so a storage without it degrades rather than throwing — which is why the e2e fixtures' `makeKv()` (get/put only) does not 500. Verified by running the specs, not by reading the guard.
- The runner reported the full node battery under **factory contention** (590 passed with simulation/worktree/concurrency failures) and said so plainly. That is **F-2462-1/F-2462-3** — a contended battery manufactures reds on both sides of a handoff — and reporting it rather than hiding it is correct behaviour.
