# reviews/release-door-hash-false-positive.md — F-1382-1

**Slice:** corrective, fire-authored (s1382) · **Branch:** main · **Tip:** see drain commit
**Verdict:** ✅ MERGED — and it **refutes F-1381-1**, the blocking finding it was sent to diagnose.

## What it does

`scripts/assert-release-build.mjs` guards the E1 release door: no later-era asset may be emitted into
the E1-only bundle. Its `laterEraNamed` check matched `/(?:^|[.-])e(?:[2-9]|10)(?:[.-])/` against the
**whole basename**. Dist basenames are `<module>-<hash>-diet-<fingerprint><ext>` (`vite.config.ts:51-53`),
and rolldown's `[hash]` is 8 chars of **base64url — which includes `-`**. So a hash may *read* as an era
tag. This fix matches the era pattern against the **module name only**, and anchors the tail with `$`
so a genuine era suffix is still caught once the hash is stripped.

## The finding it overturns

s1381 held lane-d `authored-bundle-validation` as **BLOCKING**, reporting that the slice *"REGRESSES the
E1 release build"* — an *"E4 sprite chunk in the E1-only bundle"*. That attribution was supported by a
control plus three arms, and **the control was wrong**.

- The leaked name `char-bandit-base-sheet-walk8-r2c6-e4-RHTJh-diet-a9d5c9a0.js` is **not an E4 asset**.
  It is the **E1** frame `char-bandit-base-sheet-walk8-r2c6` carrying content hash **`e4-RHTJh`**.
- Its contents are one line: a `new URL(...)` wrapper pointing at
  `char-bandit-base-sheet-walk8-r2c6-Djmulw-f-diet-a9d5c9a0.png` — **no `e4` anywhere**.
- **No `-e4` bandit asset exists in the repo** (`find assets -iname '*bandit*e4*'` → empty).

## Evidence table

| # | Check | Result |
|---|-------|--------|
| 1 | Toolchain verified live **before** trusting any red (`npx tsc --version` → 6.0.3) | ✅ — the control s1381 lacked |
| 2 | Reproduce at lane tip `0f2544f2`, detached worktree | ❌ RED, `later era assets emitted: char-bandit-…-e4-RHTJh-…js` |
| 3 | **CONTROL: clean main `009251c7`, identical command** | ❌ **RED — identical error, identical hash** |
| 4 | Regex match located | `-e4-` at index 33 = the `…-r2c6` **/** `e4-RHTJh` boundary |
| 5 | Bundle name structure | **1869/1869** files are `<name>-<8-char base64url>-diet-<8hex>` |
| 6 | Hashes containing a hyphen | **187 / 1869 (10%)** — e.g. `DS-hLfUM`, `D-L29rwl`, `Djmulw-f` |
| 7 | Files tripping the regex | **exactly 1**, and its match lies inside the hash region |
| 8 | **Manufactured probe:** append one comment to `scripts/asset-diet.mjs` (fingerprint only) | ✅ **GREEN** |
| 9 | **Probe control:** was it green because the asset LEFT? | ❌ No — **1869 files still**, same sprite emitted, hash `e4-RHTJh` → `D2vmZunU` |
| 10 | End-to-end: clean main **+ fix**, `GR_RELEASE=e1 npm run build:release` | ✅ **rc=0**, 1874 files, 262-stem denominator |
| 11 | `npx tsc --noEmit` | ✅ clean |
| 12 | `npm run test:node-guards` (incl. 3 new cases) | ✅ **rc=0 GREEN** |
| 13 | **New tests RED at the pre-fix guard** | ✅ **only test 8 reds**; controls 9/10 stay green |

Item 9 is the one that matters. A gate that turns green is not evidence until you show it went green
for the right reason — here, with a **byte-for-byte identical asset set**.

## Why s1381's control came back green — UNVERIFIED

I did not reproduce s1381's green control and **I will not guess at it**. What is measured: the same
command on clean main is **RED today**, and main's `src/` has not moved between s1381's run and mine
(the only commits since are STATUS/tasks/goals bookkeeping). s1381 recorded a genuine instrument
failure in the same fire — a deleted `node_modules` symlink producing rc=127 that it *nearly* recorded
as a real red. A control mismeasured in the opposite direction is the most likely explanation, but it
is a **hypothesis**, not a finding.

## Blast radius — the release door has been shut on main

`build:release` is the webServer command for `playwright.release.config.ts`. While this guard was red on
main, **the release suite could not start at all**. Any "release suite green" claim taken in that window
is suspect — which is exactly what **F-1381-2** independently noticed from the other side.

The fingerprint `a9d5c9a0` derives from `scripts/asset-diet.mjs`, last changed **2026-07-30 `5e129079`**.
That is the likely start of the window (**INFERRED — I did not bisect it**).

## Findings

- **F-1382-1 (this fix, landed).** Era detection must not read hash text. Guarded by three new cases in
  `scripts/assert-release-build.test.mjs`, one of which reds at the pre-fix guard.
- **F-1382-2 (open, non-blocking).** The class is wider than the instance: **any** dist-name check that
  matches an unanchored pattern against a full basename can fire on hash text. Audited the siblings this
  fire — `leakedAssets` and `laterEraAssets` are both **stem-anchored at `^`** and are therefore *not*
  exposed; `laterEpoch` matches file **contents** for the literal `epoch-N-`, which a hash cannot mint.
  So the exposure was genuinely one check, not a family — recorded so the next reader need not re-derive it.
- **F-1381-1 → REFUTED.** The lane-d slice does not regress the release build.
- **F-1381-2 → still open**, and now sharper: the release suite could not have run on *either* tree.

## What did NOT change

The lane-d slice is **still blocked** and **still unmerged** — for a different and true reason: it has
never been gated against a working release door. Its goal leaf now says so. `lane/perf` still holds the
undrained slice; **do not refill lane-d** (LANE-SAFETY LAW).

## Custody note (§3.0b)

Diagnosis ran in two detached scratch worktrees (`worktrees/gate-s1382` at the lane tip,
`worktrees/ctl-s1382` at main). **No lane content ever entered main's working tree.** The only edits
committed to main are this corrective's own files. Both worktrees pruned at close.
