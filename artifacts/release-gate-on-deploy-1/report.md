# release-gate-on-deploy-1 — report

**Implementer:** Claude Opus 5, scratch worktree `/Users/robin/Claude/Projects/wt-rel1`, branch
`fix/release-gate-on-deploy-1`, cut from main at `91ededde0`. Node 26.4.0 (`/opt/homebrew/bin` first).
Every vite/preview server and playwright batch ran inside one command under the attended drain lock;
the deploy was never run; the store was never touched.

**Control:** `/Users/robin/Claude/Projects/wt-rel1-control`, detached at main `27744e8c8` (main had
advanced past the branch base by the time the control was cut, so the control is clean main *today*,
which is the stronger comparison). Removed after use.

**Items 1, 2, 3 and 4 are DONE. `npm run build:release` is still RED, on a THIRD cause that is
pre-existing on clean main and outside this task's firewall** (F-RGD-1 below). That is the one thing
the master asked for that this branch does not deliver, and it cannot be delivered from inside the
firewall: the cure is a one-line regex narrowing in `scripts/assert-release-build.mjs`, explicitly
listed under NO.

---

## Item 1 — the hauler leaves the E1 bundle (DONE)

`src/entities/Vehicle.ts:10` named the body with a static
`new URL('../../assets/pilots/map-rebuild-spike/landmarks/motor-hauler/motor-hauler.glb', import.meta.url)`.
That was the only path by which `motor-hauler.glb` reached every build.

**The obvious cure was tried first and MEASURED WRONG.** `__GR_RELEASE_E1__ ? '' : new URL(...)` (the
shape `src/world/Terrain3dClaimPilot.ts:179` uses for its later-era registry) still emitted
`motor-hauler-DGEx9v27-diet-c2bea0ac.glb` into the E1 dist. Vite resolves and emits an asset in its
**transform** hook, long before the dead branch is folded away; tree-shaking cannot un-emit a file.
The pilot's later-era GLBs stay out of the E1 bundle for a different reason: the release plugin
physically strips its `'e2-'..'e10-'` lines (`vite.config.ts:230-234`), so those `new URL` calls never
reach the asset plugin at all. A reader who copies that ternary as an asset-exclusion pattern will be
wrong, which is why the measurement is written into the file.

**The cure that works:** the URL now comes from the lazy `?url` glob the release plugin already
narrows for every other landmark consumer. `vite.config.ts:118` rewrites the exact glob string
`'../../assets/pilots/map-rebuild-spike/landmarks/**/*.glb'` to the five E1 map directories, and
`src/world/Terrain3dClaimPilot.ts:222` is the reference reader. In an E1 build the hauler key is
simply not in the map and `buildBody` keeps the placeholder chassis, exactly as it already does on
the lite tier; `bodySource` stays `'placeholder'`, already one of the three values that method can
leave behind.

**No caller needed the gate.** The master allowed one; none was required. `src/game/Game.ts:5085` and
`src/sim/MotorSocket.ts:250` construct `Vehicle` unchanged, because the placeholder body already
existed for the lite tier and the GLB was always an async upgrade.

### `ls dist/assets | grep -c motor-hauler`

| Build | Before (control, clean main `27744e8c8`) | After (candidate) |
|---|---:|---:|
| `GR_RELEASE=e1 npm run build` | **1** (`motor-hauler-DGEx9v27-diet-c2bea0ac.glb`) | **0** |
| `npm run build` (full) | **2** | **2** |

WARNING: the master predicted 1 for the full build. The true number is **2**, before and after: the
`.glb` plus a 99-byte JS chunk `motor-hauler-BimIhQrg-diet-c2bea0ac.js` whose whole body is
`var e=new URL("motor-hauler-...glb",import.meta.url).href;export{e as default}`. That chunk is the
landmark glob's lazy entry for this asset and already existed on main (imported by
`Terrain3dClaimPilot-*.js`); it is not something this change added. The E1 count of 0 covers both.

Other evidence: `GR_RELEASE=e1 node scripts/assert-release-build.mjs` no longer reports
`motor-hauler` (it now stops at F-RGD-1 instead). `node scripts/first-town-payload.mjs` on the E1
build: **34,341,349 B before, 34,341,349 B after** — identical, so at or below today's number as the
self-check requires (the hauler is in no first-town family, so its departure could not lower it).

---

## Item 2 — the assertion joins the deploy path (DONE)

`scripts/deploy.sh:108` builds with `npm run build`; only `npm run build:release` appends
`scripts/assert-release-build.mjs`, and its one non-test caller was the preview alias script. So the
instrument that proves the published bundle is E1-only ran everywhere except on the path that
publishes to players. `vite.config.ts`'s own F-CELL-5 comment already said exactly that.

Added at **`scripts/deploy.sh:134-142`**, immediately after the build and before `dist/version.json`
is written, aborting with the build's own shape (`note "ABORT: ..."; finish build_failed 3`) because a
leaked later-era asset is a red build. Two conditions, both load-bearing, neither a hedge:

1. **`${GR_RELEASE:-e1}` = e1.** The block above the build documents `GR_RELEASE` as an owner-word
   override for a full build. The assertion only describes an E1 bundle (it refuses outright unless
   `GR_RELEASE=e1`) and would abort a deliberate full deploy on the very assets it was told to ship.
   The gate follows the build's own variant, and the default is `e1`, so the normal production deploy
   always asserts.
2. **The script is on disk.** `scripts/test-deploy-contract.sh:7` copies `deploy.sh` ALONE into a
   throwaway tree with stub `npm`/`wrangler`, and `scripts/deploy-budget.test.mjs` copies it plus the
   payload script; neither copies the assertion, so an unguarded `node` call would turn all of their
   cases into instrument failures. This is the same absent-script door the payload gate documents for
   the same one caller at `scripts/deploy.sh:208-213`.

Both non-asserting branches say so out loud in the deploy log (`RELEASE NOT ASSERTED: ...`), so a
silent skip is not possible.

Evidence: `bash -n scripts/deploy.sh` clean · `node --test scripts/deploy-budget.test.mjs` **27/27** ·
`bash scripts/test-deploy-contract.sh` rc=0 (`deploy contract PASS`) ·
`bash scripts/test-deploy-site-contract.sh` rc=0 (`deploy-site contract PASS`) ·
`GR_GUARD_NO_ARTIFACT=1 node --test citation-title-guard no-emdash-guard deploy-mirror-allowlist`
**20/20**. **`scripts/deploy.sh` was never executed.**

`npm run build:release` green locally: **NO — blocked by F-RGD-1**, which is not the hauler and not
this branch.

---

## Item 3 — the two harvest reds. VERDICT: THE TEST WAS STALE

Root cause, measured, not inferred: **the seam moved and the test did not.**

`e1-dry-gulch` carried no `harvestAnchors` of its own until commit **`7c2744e5a`** (2026-09-12,
"Astra's map art inventory and repair campaign as found uncommitted", committed by the owner for
retention and explicitly *not gated*), so its seams came from `DEFAULT_NODE_ANCHORS`
(`src/world/Terrain.ts:163-170`) and the third one sat at **x = -1.5**. The test stood at
(-2.5, -6.4): distance **1.0**, inside `Balance.goldSeam.channelRange` **1.6**, so
`harvest.channeling` turned true. That commit authored the contract's own six anchors — identical to
the defaults in count and order except the third, which moved to **x = -5.5**. The old standing spot
is **3.0** from it, so the hero was parked outside channel range and the flag could never turn true.
It had walked *past* the seam, because the approach was authored to reach a seam that used to lie
further east. `harvest.channeling` itself never moved (`src/systems/HarvestSystem.ts:441`,
`[...channels].some(c => c.node !== null)`), and the commit did not touch the spec.

Every commit that ever touched `assets/contracts/epoch-1-frontier/contracts.json` (42 of them) was
walked and `e1-dry-gulch`'s `tileParams.harvestAnchors` printed at each: the value changes exactly
once, `null` to the six authored anchors, at `7c2744e5a`.

**It is not the build.** The anchors reach the E1 build and the dev build through the same contract
JSON; the plugin's only `contracts.json` rewrite is the `epoch-*` to `epoch-1-frontier` redirect,
which resolves to the same file for an E1 contract; and the failing predicate is a distance between
two numbers that are identical in both variants. The measured arithmetic (3.0 > 1.6) accounts for the
red completely, so no build-vs-dev discriminator was needed.

**Cure (one line, inside the firewall's "only if item 3 finds the test stale"):** the approach's final
step to (-2.5, -6.4) is gone; the hero stops at (-4.5, -6.4) — the waypoint this same walk already
stood on and proved standable — **1.0** from the seam (1.12 at the helper's 0.12 arrival tolerance,
still inside 1.6). The second leg's (-9, 6.7) seam is the second anchor, unmoved by that commit, so
it is untouched. No assertion, timeout or fixture was weakened; a red there still means the harvest is
broken. Because the anchor count and order did not change, the RNG-selected active seam set
(`activateInitialNodes`, 2-3 of 6) is unchanged too, so the cure cannot be an accident of which seams
happened to be live.

### Release-suite counts, before and after

Both arms ran the unchanged `e2e/release-build.spec.ts` on both projects, `--workers=1`, under the
lock, through `artifacts/release-gate-on-deploy-1/release-suite.config.ts` (see that file for why the
owning config cannot start on a tree whose `build:release` is red, and for the two config-relative
paths that had to be re-anchored). Astra measured the pre-task 26/30 the same way. Logs:
`release-suite-control.log`, `release-suite-candidate.log`.

| Arm | Result | Failing rows |
|---|---|---|
| Control, clean main `27744e8c8` | **26 passed / 4 failed** (1.7 m) | `:24` first player, desktop + mobile, both at `:330` on `harvest.channeling`; `:244` dist assertion, desktop + mobile, on `motor-hauler-DGEx9v27-diet-c2bea0ac.glb` |
| Candidate | **28 passed / 2 failed** (2.0 m) | `:244` dist assertion, desktop + mobile, on the four `char-jumper-e4-codex-v1-r*c*.png` (F-RGD-1) |

The control reproduces the master's and Astra's measurement exactly, at the exact cited line. On the
candidate **both first-player rows pass**, and the hauler is gone from the dist assertion's complaint:
the only rows left are the pre-existing name collision, which the control proves is not this branch's.

---

## Item 4 — the rotted ledger citation (DONE)

Both F-PERFC-1 rows in `tasks/BACKLOG.md` cited `deploy.sh:80`. The build call is at
`scripts/deploy.sh:108` (+28 lines of drift), so a reader following `:80` landed in the `lockf` block
and could have concluded the call had gone. Both rows re-pointed with a dated note; no row deleted, no
verdict changed, the desk item left standing (its portraits half is the owner's to rule). The notes
record that the deploy-should-assert half is now cured at `scripts/deploy.sh:134-142` and reversible
on one owner word, and point here for the findings below.

---

## Findings raised, all outside this task's firewall

### F-RGD-1 — `build:release` is red on clean main for a NAME COLLISION, not a leak (blocks the "build:release green" gate)

With the hauler gone, `assert-release-build.mjs` stops one check later:

```
Error: [release-build] later era assets emitted: char-jumper-e4-codex-v1-r0c0-...png,
  char-jumper-e4-codex-v1-r0c1-...png, char-jumper-e4-codex-v1-r1c0-...png,
  char-jumper-e4-codex-v1-r1c1-...png
```

Those four files are **E1 content**, and the "e4" in their name is not an era. They are the Claim
Jumper's per-direction Codex walk plates, named `char-jumper-{s,e,se,sw,ne,nw}4-codex-v1` — compass
direction plus cell count — authored on the owner's word of 2026-09-19 ("Yes, please use Codex to
generate these strips") and documented in `assets/layer-contracts/characters.v2.json` at the
`char.claim_jumper` slot. That slot is not `char.e<n>.*`, so `releaseE1CharacterImports`'s filter
(`vite.config.ts:266`) correctly keeps it and the sheets ship.

The failing check is `scripts/assert-release-build.mjs:54`,
`/(?:^|[.-])e(?:[2-9]|10)(?:[.-]|$)/` against the hash-stripped module name:
`char-jumper-e4-codex-v1-r0c0` matches on `-e4-`. Only the **east** plate collides (`se4`/`ne4` have a
letter before the `e`; `s4`/`sw4`/`nw4` have no `e`), which is why it is exactly four files.

This is **F-1382-1's own class returning on a new name** — that finding is written into the script at
`:47-52`, where a rolldown hash `e4-RHTJh` was read as an E4 leak and "held the release door shut on
CLEAN MAIN".

**PRE-EXISTING, MEASURED ON CLEAN MAIN:** the control's `GR_RELEASE=e1` dist contains the same four
files (`ls dist/assets | grep -c char-jumper-e4` = **4** on both trees). It was invisible because
`assert-release-build.mjs` fails fast: the plate/GLB check at `:46` threw on the hauler before
execution ever reached `:54`. Curing the hauler did not create this; it uncovered it.

**Cure (its own task, one file, one line):** narrow `:54` so a genuine era suffix is still caught but a
compass-direction token is not. The firewall here forbids `scripts/assert-release-build.mjs`, and
renaming the plates is store work, so neither half was attempted. The task that cures it should also
decide whether `char-jumper-e4-codex-v1` is a name worth keeping: a compass token that collides with
an era token will collide again.

### F-RGD-2 — nothing proves the release assertion is present for the deploy to call

`scripts/deploy-budget.test.mjs:289-295` pins `scripts/first-town-payload.mjs` and its declaration as
present in the real repo, precisely so the payload gate's absent-script door cannot become a silent
way out. The release assertion's new absent-script door (item 2, condition 2) has no such row:
deleting `scripts/assert-release-build.mjs` would leave the deploy logging `RELEASE NOT ASSERTED` and
publishing anyway. Cure: add it to that guard's existence check. Out of firewall
(`scripts/deploy-budget.test.mjs` is not in the touch list).

### F-RGD-3 — one citation rots by 19 lines

`reviews/sol-phone-hud-entry.md:32` cites `e2e/release-build.spec.ts:330` for F-HUD-3 (the same
harvest red, attributed by Astra as pre-existing). Item 3's comment block moves that poll to `:349`.
`reviews/` is not in the touch list, so it is recorded here rather than edited. For the record,
F-HUD-3's red is now root-caused: it is the stale coordinate above, not the phone HUD work.
`STATUS.md`'s citations of this spec (`:308`, `:311`) and `logs/suite-red-inventory.md`'s (`:185`) are
all below the edit and unaffected.

---

## Commits (branch `fix/release-gate-on-deploy-1`)

| Hash | Item | Subject |
|---|---|---|
| `e3a3404cd` | 1 | the E4 hauler body leaves the E1 bundle |
| `564d0d49f` | 2 | the release assertion runs on the production deploy path |
| `c935563e1` | 3 | an instrument that can measure the release suite on a tree whose build:release is red |
| `a33e8972b` | 3 | the Dry Gulch harvest approach walks to the seam where it now is |
| `d8727c8d8` | 4 | the F-PERFC-1 rows cite the deploy line the build call is on |

## Self-check

| Check | Result |
|---|---|
| `npx tsc --noEmit` (covers `src`, `e2e`, `functions`) | rc=0 |
| `npm run build` | rc=0; full-build `motor-hauler` count **2** |
| `GR_RELEASE=e1 npm run build` | rc=0; `motor-hauler` count **0** |
| `GR_RELEASE=e1 npm run build:release` | **rc=1 — F-RGD-1 only** (`build-release.log`); the hauler no longer appears |
| release suite, both projects, own config | **28/30** candidate vs **26/30** control; only the F-RGD-1 dist rows left |
| `e2e/e4-roads-and-convoys.spec.ts` + `e2e/m2-01-build-menu.spec.ts`, full variant, both projects | **20 passed / 2 failed** (`e2e-full-build.log`) |
| — the 2 reds | `:69` only, both projects, **fingerprint-matched to the recorded known red**: `assay replay failed: malformed tape` on `artifacts/e4-roads-and-convoys/e4-dust-flats-floor.tape.json`, verbatim `logs/suite-red-inventory.md:1704` (F-OMA-5, pre-existing on main, the fixture predates ADR-005) |
| — the Hauler rows | `:123` errand publication, `:160` "human parity: a Motor plain boot mounts its declared Hauler and tar", `:197` "a plain-boot Dust Flats player gathers tar and calls the Hauler with recorded inputs" — **all green, both projects.** This is the runtime proof that the full build still loads the body |
| `e2e/m2-01-build-menu.spec.ts` | green, both projects, zero failures |
| `node --test scripts/e4-roads-and-convoys.test.mjs` (node door) | **11/11** (`e4-node-door.log`) |
| `node scripts/first-town-payload.mjs` (E1) | **34,341,349 B**, identical to the control, so at or below today's number |
| `GR_GUARD_NO_ARTIFACT=1 node --test citation-title-guard no-emdash-guard deploy-mirror-allowlist` | **20/20** |
| `node --test scripts/deploy-budget.test.mjs` | **27/27** |
| `bash scripts/test-deploy-contract.sh` / `test-deploy-site-contract.sh` | rc=0 / rc=0 |
| dist file count, E1 | control **1118** → candidate **1117**: exactly one file left, the hauler |

**Module-graph proof for the full build** (built to a temp outDir so `dist/` was untouched): the chunk
`Game-*.js`, which contains `Vehicle:Hauler`, imports `motor-hauler-BimIhQrg-diet-c2bea0ac.js`, which
resolves `motor-hauler-DGEx9v27-diet-c2bea0ac.glb`. On main only `Terrain3dClaimPilot-*.js` imported
that chunk. So the asset is still emitted AND still reachable from `Vehicle`, and the worker's second
rollup pass inherits the same narrowing (`vite.config.ts` `worker.plugins`), which is why the E1 count
of 0 holds across both passes.

**FACTORY CHURN from the spec runs, listed and NOT committed** (outside the firewall, classes (a)/(b)
of the pre-flight exception): `reviews/shots-e4-vehicles-plain-boot/desktop-chrome.png` and
`mobile-chrome.png` modified (the e4 spec rewrites them), `artifacts/056/` and
`artifacts/mill-horizon-copy/` created (the release spec's own screenshot sink).

**Never run:** `scripts/deploy.sh`. **Never touched:** the store, `vite.config.ts`,
`scripts/assert-release-build.mjs`, `scripts/asset-diet.mjs`, any contract, the sim, `wrangler*.toml`,
`specs/**`, `STATUS.md`, other worktrees. The control worktree was removed after use.
