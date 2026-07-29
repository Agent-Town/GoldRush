# GG-03c — the Herald's art weighs the same in dev as it does in dist

**Slice:** `lane-gg-03c-herald-art-dev-path-weight.md` · **Branch:** `lane/m3` · **Tip:** `8e265ee4` · **Base:** `a4524f9e`
**Merged at:** `b5be7ab3` ⚠️ *(see F-1211-4 — that commit's message names only the goals.json fix; it carries this whole slice)*
**Drained by:** s1211 fire, 2026-07-29 · **Verdict: ✅ ACCEPTED**

## What it does

The Claim Herald stopped importing full-resolution masters on the dev path. `src/news/heraldReader.ts`'s two
`import.meta.glob` sites now point at `assets/processed/*.webp` (7 engraving cuts + 6 first-issue panels, 384×384
and 768×432 at q82) instead of `assets/raw/*.png`, which re-lands the archived GG-03 panel wiring at a weight the
dev path can carry. A new byte ceiling in `scripts/asset-diet.mjs` **follows the globs out of the source file**
rather than hard-coding a list, so the guard cannot drift from what the code actually loads, and
`scripts/herald-dev-weight.mjs` measures the real thing: bytes fetched over the wire on a plain boot.

**Where the player sees it, in a plain boot:** fresh profile → enter town → click the **Claim Herald** badge.
Issue No. 1 renders six engraved panels; ongoing items carry their matching cuts. No `?debug` (Mistake #10).

## Evidence (re-derived this fire, not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 2.02 s · asset-diet **1,099,906 B / 1,500,000 B** |
| `gazette-first-issue` + `gazette-art-wiring` + `gz-02-news-page` | **14/14** both projects, 53.3 s |
| zero console/page errors | asserted **inside** the spec (`:77`, `:94`), both tests, both projects |
| Adjacent minimum `task-025` + `m1-01` + `m2-01` | **33/33** both projects |
| `test:node-guards` | **74 checks, exit 0** (+ ticker-stats exit 0) — *after* F-1211-2 was cured |
| Plain-boot byte measurement (merged main) | **HERALD ART TOTAL 962,188 B**, total 6,189,653 B |
| Screenshots | `artifacts/gg-03c-herald-dev-path/` (desktop badge/open-issue, mobile badge/open-issue/390px) |

**The headline statistic re-derived exactly.** The runner reported 962,188 B; I re-ran
`node scripts/herald-dev-weight.mjs 5273` against a dev server on the *merged* tree and got **962,188 B**, byte for
byte. The all-image total differs slightly (6,189,653 vs the report's 6,139,042), which the report itself predicted
("varies slightly with the animation frame requests") — an honest report, not a lucky one.

**And it still works after the welcome.** `herald-dev-weight.mjs` was written on base `a4524f9e`, which predates
GG-01b (`8993da33`). GG-01b takes over a fresh profile's first town entry — the exact mechanism of F-1210-5 — so
this instrument had every reason to break. It did not: its own guard (10 decoded Herald images, none with
`naturalWidth === 0`) passed on the merged tree. The welcome does not block the Herald badge path.

**The guard was shown FAILING, not only passing.** I did not take the report's mutation on trust, and I mutated
the *subject* rather than the guard script: I overwrote `assets/processed/herald-engraving-board.webp` (36,904 B)
with its own master `assets/raw/herald-engraving-board.png` (2,243,205 B) — one file, names and count untouched, so
only the byte ceiling could object. It did:

```
[asset-diet] Herald dev-path art 3306207 bytes (1500000 byte ceiling).
Error: Herald dev-path art exceeds byte budget: 3306207 B measured > 1500000 B ceiling.
EXIT CODE: 1
```

Exit code, not a counter. Restored to 36,904 B and re-verified green.

**The spec edit strengthens its instrument.** `e2e/gazette-first-issue.spec.ts` gains per-panel assertions that the
engraving is visible, that its `src` matches the panel id, and that `naturalWidth > 0`. It is not a test edited to
agree with its slice.

**Ambient load, per F-1210-2:** `uptime` **11.77 / 11.91 / 12.32** at battery start (four lane runners live),
9.71 at the control. Every green above was earned under real load, not in a quiet box.

## Merge classification

Base `a4524f9e` **is** `git merge-base main lane/m3`, and `main..lane/m3` is the single commit `8e265ee4`.

Main moved since that base on exactly five files — `e2e/gazette-welcome.spec.ts`, `e2e/release-build.spec.ts`,
`src/game/ProfileStorage.ts`, `src/town/TownScene.ts`, `src/town/TownWelcome.ts` (all GG-01b). The slice touches
none of them. **Every file is LANE-TOUCHED-only or NEW: no 3-way judgment was required.**

Applied with `git checkout 8e265ee4 -- <8 paths>` and verified by identity rather than by eye —
`git diff --cached -- src scripts e2e` was compared byte-for-byte against `git diff a4524f9e 8e265ee4 -- src scripts e2e`:
**10,984 bytes both sides, identical.** Re-verified after each control arm restored the tree.

| Class | Files |
|---|---|
| NEW | 13 `assets/processed/*.webp`, `scripts/herald-dev-weight.mjs`, 6 × `artifacts/gg-03c-herald-dev-path/*` |
| LANE-TOUCHED only | `src/news/heraldReader.ts`, `src/news/heraldReader.css`, `scripts/asset-diet.mjs`, `e2e/gazette-first-issue.spec.ts` |
| MAIN-MOVED too | **none** |

## Findings

### 🔺 F-1211-1 (HIGH) — the release gate carries THREE reds on main, not the two F-1210-5 named

Running `release-build.spec.ts` under its real config (a private-port mirror, see below) gives **3 failed / 23 passed**:
`:21` desktop + mobile (F-1210-5's known regression) **and `:184` "later flagship URLs decline to the Claim"** on desktop,
which fails on:

```
THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5271/13e35669-…  (×3)
```

**One-variable control, same tree, same command:** with GG-03c applied → 3 failed / 23 passed; with GG-03c's four code
files reverted to main → **3 failed / 23 passed, the identical three tests**. This slice is exonerated, and `:184` is
**pre-existing on main**. It is GLTF terrain-texture loading — nothing to do with Herald WebP art.

➡️ **This matters for the lane-d corrective now in flight:** that task is scoped to `:21` and the welcome. Curing `:21`
will leave the release gate **still red on `:184`**, so a fire that merges the corrective and then reads "release gate
green" off the task's own scope will be wrong. `:184` needs its own ruling — most likely a load-sensitivity finding
(the blob-texture failures smell like the F-1208-1 class), but that is a hypothesis, not a measurement.

### 🔻 F-1211-3 (LOW) — `gz-h1-newsie.spec.ts:128` is a load-sensitive red absent from the inventory

In a 4-spec / 36-test battery, `:128 "empty Herald feed shows the quiet line"` failed on desktop — it received a Trail
Guide bark (`"We drew the store before it was real."`) where it expected `"EXTRA! No fresh ink today."`, with a
"Tearing down context exceeded the test timeout" rider. It is **not** in `logs/suite-red-inventory.md`.

I nearly mis-attributed this. My first control (clean main, suite run **alone**) passed `:128` — which looked like a
conviction, but compared a 4-spec treatment against a 1-spec control: a confounded comparison, not a one-variable one.
Re-run at **matched** conditions (suite alone, both arms, `--workers=2`):

| Arm | `:106`/`:114` | `:128` |
|---|---|---|
| GG-03c applied | 2/2 FAIL | **PASS** |
| GG-03c reverted | 2/2 FAIL | **PASS** |

Both arms agree. `:128` fails only under battery contention → inventory row candidate, not a slice defect.
(`:106` is the declaration line of the test whose assertion is `:114` — the documented 42.1% known-red at
`suite-red-inventory.md:148/149/408`. Same test, two line numbers; worth knowing before matching a fingerprint.)

### 🔻 F-1211-5 (LOW, non-blocking) — a permanent spec now writes into a one-slice artifact folder

The slice repoints `e2e/gazette-first-issue.spec.ts`'s `ARTIFACT_DIR` from `artifacts/gazette-first-issue` to
`artifacts/gg-03c-herald-dev-path`. That was right for the run's evidence, but `gazette-first-issue.spec.ts` is a
permanent suite: every future run now writes into a folder named for one drained slice, and the folder the spec is
named after goes stale. Cosmetic, no gate depends on it, and reverting it is a one-line corrective whenever the
Gazette ladder is next open.

### ✅ F-1211-2 (CURED THIS FIRE) — `tasks/goals.json` was schema-invalid, and `test:node-guards` was red on main

`npm run test:node-guards` failed on main before this drain, for two reasons, neither of them GG-03c's:

1. `gg-01b-gazette-welcome` carried `"status": "merged-with-blocking-regression"` — **outside the ten-value vocabulary**
   at `scripts/goal-tracker.test.mjs:56`. This is precisely the near-miss-value class that F-1123-1 rejected by name.
2. `lane-b-approach-convergence-class` carried `"mergeHash": "0b8db8f9"` — 8 chars where the schema requires 40, and
   `mergeHash` is a **guard input** (`drain-block-check.mjs` reads it), not a decorative pointer.

Fixed in `b5be7ab3`: status → `merged` (it *is* merged, hash ancestral), hash expanded to its full 40. **Nothing was
downgraded** — F-1210-5's full text stays in `blockedReason`, the finding stays open, the lane-d corrective stays
queued, deploy stays withheld, and a `note_s1211` on the leaf says so in as many words.

### ⚠️ F-1211-4 (MINE, DISCLOSED) — I repeated F-1210-6 one fire after reading it

s1210 disclosed that `git checkout <ref> -- <paths>` **stages** what it writes, so a later plain `git commit` takes the
whole index, and wrote the remedy: *"After any `git checkout <ref> -- <path>`, run `git status` before committing."*
I read that finding, then did `git add tasks/goals.json && git commit` with the entire GG-03c delta sitting staged —
and `b5be7ab3`, whose message names only the goals.json fix, carries all 24 files of this slice. Content is correct
and fully gated (everything in the Evidence table was measured on this exact tree); the **message** is wrong, and this
review is the correction. History is not rewritten: the hash is recorded honestly here, in the goal leaf, and in BACKLOG.

➡️ **The remedy s1210 wrote is a discipline, and a discipline that fails one fire after being written down needs a
mechanism instead.** `git commit <pathspec>` commits *only* the named paths and ignores the rest of the index, which
makes the sweep structurally impossible rather than merely discouraged. I used the pathspec form for this review's own
commit and verified afterwards that unrelated dirt stayed uncommitted. Recommended for the drain skill's step 5.

## Instrument (Retention Law — `playwright.s*.config.ts` is gitignored, so it is preserved here)

`playwright.s1211-release.config.ts` mirrored `playwright.release.config.ts` onto port **5271**. The canonical config
pins 5190 with `reuseExistingServer: false`, and lane-d was live on the F-1210-5 corrective for this very suite —
sharing the port would have produced a contention red that says nothing about the slice under gate.

```ts
export default defineConfig({
  ...baseConfig,
  testMatch: /release-build\.spec\.ts/,
  projects: baseConfig.projects?.filter((p) => p.name === 'desktop-chrome' || p.name === 'mobile-chrome'),
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5271' },
  webServer: {
    command: 'GR_RELEASE=e1 npm run build:release && npx vite preview --host 127.0.0.1 --port 5271',
    url: 'http://127.0.0.1:5271', reuseExistingServer: false, timeout: 60_000,
  },
});
```

## The through-line

s1210's lesson was that a drain minimum blind to a config is a denominator too narrow. This fire ran that config —
and the thing it caught was **not** the slice under gate. GG-03c is clean; the release suite was already carrying a
third red nobody had named. Widening the denominator does not just catch the next regression, it also tells you which
of the reds you are staring at were never yours.
