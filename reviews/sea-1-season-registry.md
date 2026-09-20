# SEA-1 — the county names its seasons

**Slice:** `sea-1-season-registry` · **branch:** `lane/b` · **tip:** `ee4e6c6a6` · **merge:** `c94983206bb15c979c259f6fb61c674a7b181685`
**Drained:** s1637, 2026-08-10 · **base:** merge-base of `main` and `lane/b` (lane was 11 behind at drain time, 1 ahead)

## VERDICT: MERGED

## What it does

The county's standings now carry a season label, and the label comes from a single checked-in
registry rather than from anywhere else.

`src/seasons/registry.ts` (new, 26 lines) exports a typed, ordered `SEASONS` list and a pure
`resolveSeasonAt(submittedAt)`. `functions/api/standings.ts` derives an additive, **GET-only**
`season` field on **both** public projections — `boardRow()` (the flat board) and `showing()` (the
grouped `byStack` / `byHarness` / `byParty` views). A row whose `submittedAt` is missing or
unresolvable gets **no `season` key at all** — absent, never a guessed default — which is what makes
the spec's retention law (*"No row is ever deleted by a season change… every standing carries its
season label; old crowns are history, not cheats"*) true of the data rather than merely asserted.

**Season 2 is deliberately OMITTED.** The master forbade guessing its start date: the spec opens
Season 2 only *"when AP-16-1..3 land under one era stamp"*, and at authoring time all three were in
flight. The runner chose omission over a `startsAt: null` placeholder and said so. That is the
correct read of the instruction, and it leaves the boundary to whoever lands the era stamp.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (`✓ built in 1.28s`) |
| `scripts/season-registry.test.mjs` | **4 / 4 pass** (67 ms) |
| `gate-caller-audit` | **PASS** — new script rooted, no new orphan, 0 unrouted |
| `npm run test:node-guards` | **446 tests / 441 pass / 0 fail / 5 skipped** (386 s) |
| `e2e/lb-01-county-standings.spec.ts` | **18 / 18** desktop-chrome + mobile-chrome (390px), 47.9 s |
| plain boot: `_s106-prospector-boot-probe` + `f1297-2-plain-boot-tape-button` | **4 / 4**, zero console/page errors |
| playwright workers | `--workers=1` on every run (§3.1) |
| custody | gated in detached worktree `gate-s1637` (§3.0b); merged + committed as ONE act (F-1589-5) |
| classification | clean `ort`, **5 paths, all LANE-ONLY**; main had not moved any of them; no graft needed |
| post-merge | `main..lane/b` **empty** |

### The battery counts its own new guard

`test:node-guards` reported **446** tests where s1636 measured **442** on the immediately preceding
main. The delta is exactly **+4**, the four `season-registry` tests. This is worth stating because a
new guard is normally *invisible to the battery that ships it*: here the arithmetic proves the guard
is genuinely executed by the battery, not merely present on disk next to it.

### Teeth proven by manufacturing the defect — not argued

One fire ago, F-1636-1 merged a slice whose headline number was a tautology (both sides of a
comparison resolved to the same expression, so the guard could not fail). That is fresh enough that
this drain refused to accept green as evidence of measurement.

**Probe:** force `resolveSeasonAt()` to `return null` unconditionally, one line, at the top of the
resolver body.

**Result — the assertions bite:**

- `scripts/season-registry.test.mjs` → **rc=1**, 2 of 4 red:
  `season resolver finds a date inside Season 1` and `season resolver treats null endsAt as
  open-ended`, both `AssertionError` *expected `'founding-season'`, actual `undefined`*.
- `e2e/lb-01-county-standings.spec.ts` → **rc=1**, 2 red: `public county rows carry submitted time…`
  and `endpoint stores optional self-declared stack…`, the latter naming the missing
  `season: 'The Founding Season'` on the rank-3 row.

Probe reverted; `git status` on `src/seasons/registry.ts` **clean / byte-identical**. These
assertions measure something. They are not the F-1636-1 shape.

### Scope 4 — the load-bearing negative, verified rather than inherited

The master's fourth scope item was a *negative*: prove the ranking did not move. The runner asserted
it; this drain re-derived it from the merge commit itself.

`git diff c9498320^1 c9498320 -- functions/api/standings.ts` contains **5 added lines and 0 deleted
lines**, in full:

```
+import { resolveSeasonAt } from '../../src/seasons/registry';
+  const season = resolveSeasonAt(row.submittedAt);
+    ...(season ? { season: season.name } : {}),
+  const season = resolveSeasonAt(row.submittedAt);
+    ...(season ? { season: season.name } : {}),
```

Lines matching ordering vocabulary (`compareScores`, `.sort`, `rank`, `readBoard`, `localeCompare`,
any comparison operator): **0**. The comparator is untouched, and `lb-01` stayed green across all 18
instances. Load-bearing negative holds.

### GET sample (from the suite's own assertions)

```json
[
  { "rank": 1, "profileName": "Robin",             "difficulty": "trail",       "season": "The Founding Season" },
  { "rank": 2, "profileName": "Before the Bench",  "difficulty": "trail" },
  { "rank": 3, "profileName": "Robin",             "difficulty": "vein-hunter", "season": "The Founding Season" }
]
```

Rank 2 is the legacy row with no resolvable `submittedAt`; the suite asserts
`expect(body.board[1]).not.toHaveProperty('season')` — absence is tested, not assumed.

## Findings

### F-1637-1 — `package.json` was edited outside TOUCH-ONLY, and it was the *right* act (non-blocking)

The firewall named the registry module, its test, `functions/api/standings.ts`, and the e2e spec.
The runner also edited `package.json`, adding `scripts/season-registry.test.mjs` to the
`test:node-guards` list.

**This is recorded, not punished — the master's scope was unsatisfiable inside its own firewall.**
Scope 3 ordered a node test "house pattern"; the house pattern *is* rooting in `package.json`,
because `gate-caller-audit` reds on any gate-shaped script that no root reaches. Obeying the
firewall literally would have produced an unrooted guard and a red gate. This is the same shape as
F-1636-2 one fire earlier — the second consecutive drain where a firewall forbade the very act its
scope required.

➡️ **Authoring rule, for `/author-task`:** *a master that orders a new guard script must put
`package.json` in TOUCH-ONLY.* Two instances in two fires makes this a pattern, not an accident.

### F-1637-2 — e2e specs call a **hardcoded production origin** unless each one remembers to stub it

While making the console-clean runs pass, the runner stubbed `**/api/telemetry` in `lb-01`, noting
in passing that *"the live endpoint hit a 429 during console-clean Playwright runs."*

That aside is the finding. Verified:

- `src/app/GameApi.ts:1` — `export const GAME_API_ORIGIN = 'https://gold-rush-3in.pages.dev';`
  a **hardcoded production origin**, not a same-origin or env-resolved one.
- `src/telemetry/runBeacon.ts:89` — `await fetch(gameApiUrl('/api/telemetry'), …)`.
- Therefore any spec that completes a run and does **not** intercept that route makes a live call to
  the deployed site from the factory's own gates.
- Of **397** e2e specs, **5** reference `api/telemetry` at all (`lb-01` as of this merge,
  `locked-win`, `release-base-path`, `terrain3d-default`, `tl-01-run-telemetry`). Stubbing is
  **per-spec opt-in**.

Two costs, one of them ours: the factory writes telemetry into production during gating, and
production rate-limiting can manufacture reds that look exactly like tree reds — the 429 above is a
real instance of the second, which cost this slice's runner a debugging detour.

⚠️ **Honest limit:** the *exposed subset* is NOT measured. Only specs that get far enough to fire the
beacon are affected, and identifying those requires more than a grep. The **mechanism** is proven and
**one instance** is proven; the blast radius is not. Do not cite a count here.

**Recommendation (class fix, not instance):** a default route stub at the config/fixture level, so
specs opt *out* of interception rather than opting in. Filed to the desk rather than fixed here —
it touches every spec's harness and is not this slice's business.

## GZ-01: no news item owed — and this is a checked answer, not a skip

Mistake #10 asks of every merge: *where does the PLAYER see this, in a plain boot?* Here the honest
answer is **nowhere yet**, and that is by design.

✓ VERIFIED — and the first probe was too narrow, which is worth recording rather than hiding.

My first check was `grep -rn "season" src/ui/ src/app/ src/game/` → zero. **That probe could not have
answered the question:** the county board does not render from any of those three directories, it
renders from `src/encyclopedia/reader.ts`, which the probe never looked at. A zero from the wrong
directories is not a negative result.

Re-run correctly, whole-tree:

- `grep -rni "season" src/` (excluding `src/seasons/`) returns hits that are **all** `mothSeason` —
  the unrelated contract twist — plus one line of scatter prose. None is the standings label.
- `grep -rn "\.season\b|season:" src/encyclopedia/ src/ui/` excluding moth → **zero**.
- `src/encyclopedia/reader.ts:58`: the `CountyStanding` type carries `submittedAt?: number` and
  **no `season` field at all**, so the label is dropped on the floor at the type boundary.

So the conclusion stands — no browser surface reads the label — but it now rests on a probe aimed at
where the rendering actually lives. The Season Page that will render it is **SEA-2**, a later slice,
and adding `season` to `CountyStanding` is that slice's first job.

SEA-1 is therefore **substrate**, not a player-visible change, and the GZ-01 filter law (*"the review
names a player-visible change"*) is not met. No gazette item is filed. The news belongs to SEA-2,
when a player can actually read a season.

## Merge classification

Base: merge-base of `main` and `lane/b`. Five paths, **all LANE-TOUCHED / MAIN-UNTOUCHED**:

| Path | Class |
|---|---|
| `src/seasons/registry.ts` | LANE-ONLY (new file) |
| `scripts/season-registry.test.mjs` | LANE-ONLY (new file) |
| `functions/api/standings.ts` | LANE-ONLY, +5 / −0 |
| `e2e/lb-01-county-standings.spec.ts` | LANE-ONLY |
| `package.json` | LANE-ONLY, one-token insert |

`package.json` was the only real conflict risk, since it is the file most likely to have moved under
a lane that was 11 behind. It was checked by parsing the guard list at all three refs rather than by
eyeballing the diff: base **64** entries, lane **65**, main **64**; lane added exactly
`scripts/season-registry.test.mjs` and dropped **none**; main had not touched the line at all
(byte-identical to base). No guard was lost in the merge. Clean `ort`, no graft.
