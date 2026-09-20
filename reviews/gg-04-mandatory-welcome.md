# gg-04-mandatory-welcome — the town greets every new face, unasked

- **Slice:** GG-04, `tasks/lane-mandatory-welcome.md` (owner-authored, `33fbc24b` 2026-07-30)
- **Branch/tip:** `lane/e2-arsenal` `40ea99a4` (lane-c runner, 2026-07-30T10:41:52+07:00)
- **Merged as:** `bd4c5c189ce4c412d5e4d148298c96fb47960994` — **by cherry-pick of `40ea99a4` alone**
- **Drained by:** s1255 fire, 2026-07-30
- **Goal leaf:** `gg-04-mandatory-welcome`

## VERDICT: ACCEPTED — merged.

The slice does what the owner ruled, its own new assertions are stronger than the ones
they replace, and every red in the battery was discharged by a measurement rather than by
an inventory lookup.

## What it does

Profile creation asks for a name and nothing else. The "First time prospecting?" radio
pair leaves both creation renderers (`StartMenu.ts`, `ProfileManager.ts`) and the preset
defaults to Trail. The welcome then arms itself for genuinely fresh ledgers and stays
quiet for imported or pre-existing ones.

The load-bearing change is an **inversion, not an addition**, and it is the thing to
understand before touching this code again:

| | before | after |
|---|---|---|
| `TownWelcome.beginFirst` fires when | key is **absent** (`!== '1'`) | key is exactly **`'0'`** |
| `createProfile` | wrote no welcome key | writes `'0'` at **both** creation branches |
| `ProfileTransfer` normalize (restore **and** import) | passed the key through | forces `'1'` |

So "fresh" is now a thing the creation path **asserts**, rather than a thing the runtime
**infers from silence**. Two consequences worth stating plainly:

1. **Pre-existing profiles have no key at all**, so `null !== '0'` and they never see the
   welcome. That is the ruling's "never uninvited" — intended supersession, not a
   regression. Anyone reading a bug report of the shape "my old save never got the
   welcome" should start here.
2. A hostile import cannot arm the welcome. The new spec proves it by importing a ledger
   that carries `TOWN_WELCOME_SEEN_KEY: 0` (numeric) and asserting the stored value comes
   out `'1'`.

**Retrigger is untouched.** `TownScene.ts:1010` retriggers through `replayWalk()`, which
never consults the key — so the inversion cannot have broken it. Verified by reading every
reader of `TOWN_WELCOME_SEEN_KEY` in `src/`, not by assuming scope 3's "byte-unchanged".

The `beginFirst` catch arm also changed from swallow-and-continue to `return false`: a
storage failure now suppresses the welcome instead of running it unpersisted. Reasonable
(an unpersistable welcome would replay forever), and `profile-first-boot.spec.ts:264`
("blocked profile storage boots without offering an unusable first profile") passes.

## Merge classification

| item | finding |
|---|---|
| Base | `40ea99a4`'s parent is `6c44c6f3`; `merge-base(main, 6c44c6f3)` = `bd3804f4` |
| MAIN-MOVED files | **ZERO** — `git diff bd3804f4 main` over all ten code paths is **empty** |
| 3-way needed | No |
| Applied delta | **byte-identical** to `git diff 6c44c6f3 40ea99a4`: 19,317 B, sha256 `d5ae48dd03638dbb` on both sides |
| Conflicts | none (`cherry-pick -n` rc=0) |

**Why a cherry-pick and not a merge — this is the trap on this branch.** `lane/e2-arsenal`
is 2 ahead of main, and the *older* commit `6c44c6f3` (`ap-06b-panel-ladder-and-voice`) is
a **terminal-closed** goal leaf: `drain-block-check` refuses it with `⛔ CLOSED`, because it
was a lawful case-(b) STOP superseded by `lane-c-agent-rung-honest-gate`. Merging the
branch would have landed owner-gated work past a lawful stop. Only `40ea99a4`'s own delta
was taken; the graft carries zero AP-06b content.

## Evidence

All on the merged tree. Playwright at `--workers=1` per F-1212-2.

| gate | result |
|---|---|
| `tsc --noEmit` | rc=0, 4.4 s |
| `npm run build` | rc=0, 26.6 s |
| own specs ×4, both projects | **38/38**, 246.4 s (`profile-first-boot`, `gazette-welcome`, `gazette-first-issue`, `trail-guide`) |
| release suite, own config | **26/26** rc=0, 161.0 s — the spec the master's self-check names |
| adjacent ×6, both projects | **83 passed**, 3 reds all discharged below |
| `test:node-guards` | **156/156** rc=0 — exactly s1253's predicted baseline; I added no arms, so the next fire still starts from 156 |
| `test:task-guards` | rc=0, 750 masters / 0 invisible |
| `test:citations` | rc=0 **after the fix this merge made necessary** (see F-1255-2) |
| `test:gate-callers` | rc=0 |
| `goal-tracker` | 2/2 |
| `drain-block-check.test.mjs` | 14/14 |
| `test:guards` | 9/10 — sole red is F-1253-2, below |
| console/page errors | zero, **asserted inside the specs** (`collectErrors` / `assertNoErrors`) |
| plain-boot proof | `page.goto('/')`, no `?debug`, at `profile-first-boot.spec.ts:44` |
| screenshots | `artifacts/profile-first-boot/{desktop,mobile}-chrome-name-only-creation.png` (390 px mobile included) |

### Adjacency was derived by grep on the CHANGED SYMBOLS, then narrowed

A naive grep for the changed testids returned ~140 specs, because `start-menu` and
`difficultyPreset` appear in nearly every fixture. The real adjacency is the removed
control and the changed functions: three specs (`m3-06-demo-profiles`, `second-rider`,
`task-024-blast-aim-presets`) still reference `greenhorn` and the runner did **not** update
them — I checked each rather than assuming the runner's five-spec list was complete. All
three concern the greenhorn **difficulty preset value**, not the removed
`greenhorn-question` radio, so all three are correctly untouched. **The preset is not
orphaned by this slice**: it stays reachable through the separate `profile-difficulty`
select, gated at `m3-06-demo-profiles.spec.ts:75`.

### The three reds

**1. `restore-validation.spec.ts:656`, both projects — PRE-EXISTING, proved by control.**
It matches inventory rows 201/202 (88.1%) by title. That was *not* treated as sufficient,
because this slice genuinely executes inside `normalizeDatum` — the exact code the test
name says it is testing ("strict normalization and restore"). So a **clean-main control**
was run: graft parked to a patch, subject restored to HEAD (verified: `TownWelcome.ts:50`
back to `=== '1'`, no welcome key in `ProfileTransfer.ts`, greenhorn radio back in
`StartMenu.ts`), test re-run. **2/2 red without the slice**, with the reason string
identical to the character:
`root.hero.position.y: 0.14559222393281415 != 0.2763519114255905`.
Graft then re-applied and re-verified byte-identical (sha256 `d5ae48dd03638dbb`).

**2. `save-slots.spec.ts:142` mobile-chrome — LOAD FLAKE, and it is in no inventory
(F-1255-1).** Desktop passed in the same battery (18.7 s); mobile timed out at 33.4 s at
`waitForSavedWave` (`:147`). Re-run in isolation on the **merged** tree: **2/2 green**,
13.0 s and 17.3 s. That is the decisive arm — if this slice caused it, isolation on the
merged tree would still fail. Mechanism agrees: `:147` is a gameplay-progression wait
reached via `seedProfile`, which writes its fixture directly and therefore never gets the
`'0'` key that arms the welcome.

**3. `test:power-budget` — F-1253-2's known load ceiling.** 0.669 ms p95 vs a 0.500 ms cap
inside the battery; 3/3 quiet-box PASS at 0.352/0.355/0.361 ms. This slice stages **zero**
`src/systems/` bytes (`git diff --cached --stat -- src/systems/` empty), so the measured
code is byte-identical to HEAD. Already on the owner's desk.

## Findings

- **F-1255-1 (non-blocking, inventory upkeep).** `e2e/save-slots.spec.ts:142` *"manual save
  creates a curated slot, preserves auto, and loads through the suspend restore path"* is
  load-dependent on mobile-chrome and appears in **no** row of `logs/suite-red-inventory.md`.
  Measured this fire: red at 33.4 s inside a 6-suite battery, green 2/2 in isolation
  (13.0 s / 17.3 s), desktop green throughout. A drain that hits it has nothing to attribute
  it to, which is how a real regression gets waved through as "probably load". Wants an
  inventory row with a measured rate.
- **F-1255-2 (discharged in the merge commit).** This merge invalidated a live citation.
  GG-04 **renames** both tests that the owner's-desk item at `tasks/BACKLOG.md:1372` cited:
  `trail-guide.spec.ts:201` *"first boot asks the greenhorn question once and sets the
  preset"* → *"first boot asks only for a name and uses the default preset"*, and `:223`
  *"profile-title first boot offers the same greenhorn choice once"* → `:221` *"profile-title
  first boot also asks only for a name"*. `test:citations` caught it and was right. Re-pointed
  in the same commit as the event, including the semantic change (those tests now assert the
  control's **absence**), not just the coordinates. **The item's owner-facing call is
  unchanged** — the plain-boot first-run bark-beat gap it asks about is untouched by GG-04.
- **F-1255-3 (non-blocking, tooling).** The inherited gate driver
  `logs/session-scratch/s1254/gates.mjs` **overwrites its own transcript on every
  invocation**, so in a multi-battery drain only the last arm survives as evidence — a
  retention hole in the very script whose job is to leave evidence. Fixed in the s1255 copy
  (append + per-battery ISO stamp). Worth folding into whatever the next fire copies from.
  Separately, `control-revert.mjs` first used `URL.pathname` for the patch path, which
  percent-encodes the space in "Gold Rush"; `git apply` silently found no file and the
  restore did nothing. **Its own sha256 guard caught it** (`BYTE-IDENTICAL: false`) rather
  than letting an unrestored subject pass as restored — the cure is `fileURLToPath`.

## Owner-facing

Nothing in this slice needs a ruling. One thing to know as a player: **existing profiles
will never be shown the welcome**, by design of the ruling. If you want your own long-lived
profile to see it once, that is a one-line ask and not a bug.
