# Review — blocked-storage boot fix (rf-19 + rf-20, drained together)

**Slice:** `lane-blocked-storage-boot.md` + `lane-blocked-storage-boot-2.md` (lane-a, one stack)
**Branch / tip:** `lane/m3` `76ded07bdfe0d3e1d541ab878f1e1fd41d356d3b`
**Merge-base:** `fce1660032edb6eaa2ffd74ff8be16c381569c06`
**Drained by:** s1083 fire, 2026-07-26
**Goal leaves:** `rf-19-blocked-storage-boot` · `rf-20-blocked-storage-boot-2`

## VERDICT: MERGE — and the fix is proven load-bearing by my own mutation control, not the lane's.

## What it does

The game could **fail to start** in any browser that *throws* on storage access rather than
returning `null` — Safari "Block All Cookies", third-party-blocked iframes, some private-window
configurations. Three unguarded reads sat on the plain boot path, and each one was found only
after the one before it was fixed:

1. `ProfileStorage.rawGet()` — an unguarded `storage.getItem` sitting **four lines below** its
   own guarded sibling `browserStorage()`. The throw escaped via `readLegacyDifficulty()` on the
   boot path (F-1077-5).
2. `ProfileStorage.rawSet()` — the same asymmetry in the write direction (fixed pre-emptively,
   the cured-defect-survives-in-the-sibling lesson).
3. `TileStateStore.readSnapshot()` — a direct `this.storage.getItem` that **bypassed the very
   helper just guarded**, reached via `E6TileConsumerSystem.readState() → new Game → startGame`.
   Its own class **already guarded the WRITE** (`commitAtRunEnd():99`); only the read was forgotten.

All three now degrade instead of throwing. `readSnapshot` routes a rejected read through the
existing `parseSnapshot(null)` → `emptySnapshot()` path and **caches** it, so a blocked browser
degrades **once** rather than throwing on every frame that reads tile state. The fallback is not
invented: it is the ordinary "no tile state saved yet" first-boot state every caller already handles.

18 insertions, 4 deletions, 2 files. No new dependency, no changed return type, no shared helper.

## Merge classification

| File | Classification | How resolved |
|---|---|---|
| `src/game/ProfileStorage.ts` | **LANE-TOUCHED only** | byte-identical graft |
| `src/game/TileStateStore.ts` | **LANE-TOUCHED only** | byte-identical graft |

`git diff fce16600 main -- <both files>` is **EMPTY** — main never moved either file since the
merge-base, so there was no MAIN-MOVED side and no 3-way was needed. Post-graft
`git diff 76ded07b -- <both files>` is **EMPTY**: the merged tree is byte-identical to the lane tip.
Both lane commits were taken (`a86bc334` + `76ded07b`); the stack is drained whole, which is why
**two** goal leaves close here.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** (3.4s) |
| `npm run build` | **exit 0**, `✓ built in 1.13s` |
| Battery: `task-024-blast-aim-presets` · `profile-first-boot` · `m3-06-demo-profiles` · `board-gating-and-profiles` · `tp00-tile-persistence` · `e6-tile-consumers`, both projects, `--workers=1` | **52 passed / 0 failed (3.2m), exit 0, summary line present** |
| **The oracle** — `task-024:130` "difficulty preset falls back to default when profile storage is blocked" | ✅ **PASS desktop (3.7s) + mobile-390 (3.2s)** — this is the F-1077-5 red going green |
| `tile-identity-pass`, isolated | 1 passed / 3 failed — **pre-existing, see below** |
| Plain-boot probe, cwd-proven server | **0 errors · 0 warnings · 0 pageErrors**, desktop + 390 |

### The mutation control — performed at my own hands (F-1080-B)

The lane reported a control; a drain does not inherit one. I reverted **both** files to main's
committed version and re-ran the oracle:

```
MUTATED EXIT: 1
  ✘  [desktop-chrome] task-024-blast-aim-presets.spec.ts:130  (30.1s)
  ✘  [mobile-chrome]  task-024-blast-aim-presets.spec.ts:130  (30.2s)
    Test timeout of 30000ms exceeded.
    Error: page.waitForFunction: Test ended.
  2 failed
```

Then restored, and verified the restored tree is byte-identical to `76ded07b` — **the tree I
measured is the tree that merged.** The failure text reproduces the lane's report verbatim. So
the guards are load-bearing: without them the game never reaches frame 10 under blocked storage,
and `task-024:130` is a genuine regression net rather than decoration.

### `tile-identity-pass` — the lane's blocker, re-verified independently and it does NOT block

The lane STOPPED rather than claim READY-FOR-GATES because this suite was red, and reported it
pre-existing. **I did not inherit that**, per the handoff's explicit instruction:

| Run | Code | Load | Result |
|---|---|---|---|
| Control A | **clean main** | suite isolated | 1 passed / **3 failed** |
| Control B | **clean main** | suite isolated | 1 passed / **3 failed** (identical identities) |
| Grafted | **lane content** | suite isolated | 1 passed / **3 failed** (identical identities) |

Same failing identities in all three: `:81` desktop, `:57` mobile, `:81` mobile. Load held
constant, code varied — the graft neither causes nor cures them. Two of the three are
**hash-determinism** failures *within a single test* (`:57` mobile: `expect(second.hash).toBe(first.hash)`,
`04454b25…` vs `d374cf2c…`) and the rest are `THREE.GLTFLoader: Couldn't load texture blob:…`
console errors. Neither class can be moved by adding a `try`/`catch` around a storage read.

⚠️ **Clean main is WORSE than the lane reported**: the lane recorded `2/4` (2 passed) while both my
clean-main controls give `1/4`. That is a **load** difference, not a contradiction — the lane ran
the suite inside a 7-suite battery. It is recorded as **F-1083-2** because a suite whose pass count
moves with ambient load is already telling you its determinism is broken.

### The warn channel — a gap the suites structurally cannot see

The new guard degrades via `console.warn`, and every existing spec's `collectErrors` filters on
`message.type() === 'error'` (`e2e/profile-first-boot.spec.ts:19-25`). So no green suite could
answer the master's own question: *does the guard stay silent in a normal boot?* Added
`scripts/probe-plain-boot-console.mjs`, which reports **every** console type on a plain `/` boot
entered as a player does (create profile → wait frames > 10, no `?debug`, no swallowed waits):

```
--- desktop (1280x800) ---   console types: debug, info
  errors: 0 · warnings: 0 · pageErrors: 0 · "Tile state read failed" warns: 0
--- mobile-390 (390x844) --- console types: debug, info
  errors: 0 · warnings: 0 · pageErrors: 0 · "Tile state read failed" warns: 0
PROBE CLEAN
```

The scratch server's listener `cwd` was proven to be this repo root before a single number was
trusted (F-1077-3). The guard fires only under blocked storage, as designed.

## Findings

**F-1083-1 — the storage-read class is guarded in 3 places out of ~33, and `rawGet` cannot be reused.**
Non-blocking (this drain strictly reduces boot risk), but it names the real end of the thread.
`grep -rn "storage\.getItem\|localStorage\.getItem" src/` returns **59 direct storage calls across
21 files**; this drain guards three of them. The reason it has now taken three rounds of
whack-a-mole is **structural, not diligence**: `rawGet`/`rawSet` are declared `function`, **not
`export`ed** (`ProfileStorage.ts:484,492`), so the other 20 files *cannot* reuse the guard even if
they wanted to — every future fix is forced to be another local `try`/`catch`. This is the exact
shape of F-1080-1 (`bumpCounter`/`clientIpHash` copied four times because it was module-private).
➡️ Codex's own report enumerated the **boot-path subset** with call chains: `accountSync.install →
readSession` · `hasLegacyProfileData` / `migrateLegacySuspendResources` · `StartMenu.render →
readSaveSlots` · `reconcileActiveEpoch` · `loadResearchState → loadMetaProgress` ·
`E7SignalSystem → readMilestones` · `readTownName`. **Corrective authored this fire** as
`tasks/lane-blocked-storage-boot-3.md` (goal leaf `rf-22`): export one guarded accessor, re-point
those named sites, leave the other ~26 alone.

**F-1083-2 — `tile-identity-pass` is non-deterministic AND load-sensitive, and it has now blocked a
lane report from claiming READY-FOR-GATES.** Two of its four tests compare a fingerprint hash
against a second render *of the same seed* and get a different value; a third floods
`THREE.GLTFLoader: Couldn't load texture blob:` console errors. Its pass count also moves with
ambient load (2/4 in a battery, 1/4 isolated). **Owner/attended: this suite is currently a gate
that cannot be passed**, so it will keep stopping honest lanes exactly as it stopped this one.
Either repair the determinism or mark those two tests known-red with a fingerprint, but do not
leave it as a silent tax on every future lane. No corrective queued — diagnosing a renderer
determinism failure is not fire-authorable.

**F-1083-3 (non-blocking, deferred design edge, raised by the lane's own independent review and
recorded here so it is not lost).** If a read fails *transiently* and a later write succeeds, the
cached empty snapshot can overwrite tile state that was never seen. The master explicitly required
caching the empty fallback and forbade retries and shadow storage, so this is a
**persistence-policy** decision, not a defect in the delivered scope. It only bites a browser that
throws once and then recovers — which is not a mode any named target browser exhibits (Safari's
block is a standing setting, not a flap). Recorded, not queued.

## Firewall compliance

The lane's TOUCH-ONLY was `src/game/TileStateStore.ts` (+ the predecessor's `ProfileStorage.ts`),
and exactly those two files are modified. `ProfileStorage.ts` is byte-identical to how the
predecessor left it at `a86bc334`, as the master demanded — verified, not taken on report.

**Process note worth keeping:** the predecessor run (`rf-19`) is filed as `stopped-firewall`, and
that stop was **correct behaviour, not a failure** — its master's scope item 3 ordered a file its
own firewall forbade (F-1082-1), and Codex obeyed the firewall. Both halves of the work merge here.
