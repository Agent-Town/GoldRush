# f1605-1 — de-list the three E2 railcar contracts from the AP-07 headless door

**Slice:** `f1605-1-e2s3-door-delist` · **Branch:** `lane/b` @ `7eb621945` (runner commit) · **Base:** `c218e7697`
**Merged to main:** `312b443f12a91d56e6a20f37a537aa71166d41c6` · **Drained by:** s1606 fire, 2026-08-09
**Master:** `tasks/f1605-1-e2s3-door-delist.md` (authored + dispatched s1605) · **Goal leaf:** `f1605-1-e2s3-door-delist`

## VERDICT: MERGED — full battery green on the merged tree, scope executed exactly as authored, no findings that block.

## What it does

Owner ruling 2026-08-09 (F-E2S-3, *"de-list now, socket later"*) removes `e2-hill-mine`, `e2-trestle` and
`e2-incline` from the AP-07 headless door until an era-true pressure-to-damage socket exists for them. The
slice does three things and nothing else:

1. **`src/sim/HeadlessContractSim.ts`** — the three ids leave `SUPPORTED_CONTRACTS`, replaced by a comment
   naming the ruling and the slice that restores them. `e2-pressure-garden` stays, so E2 is not emptied.
2. **`public/skill.md`** — the guard-derived door block re-derived to match (3 lines out). This file is
   generated-shaped and is asserted against the set, so it moves in the same commit or a guard reds.
3. **The four tests whose subjects left the door are SETTLED, not deleted** — the distinction that matters:
   - `e2e/er01-e2-census.spec.ts` generates one test per E2 contract and constructs the sim with **no mode**,
     so three of its four would have gone red. They now flip to the established `er01-e4` **refusal**
     pattern — `expect(() => new HeadlessContractSim(…)).toThrow(/AP-07 supports only/)` plus a
     zero-console assertion — i.e. they still assert something true about the door rather than being skipped.
   - The two `scripts/gr-sim.test.mjs` Baron tests take `skip:` **with named causes** citing F-E2S-3 and
     naming the socket slice as their restore path.

## Evidence (measured on the MERGED tree, in a detached worktree — §3.0b)

Gate worktree `gate-s1606` @ `7e4e97d84` (`git merge --no-ff lane/b`, **ort, zero conflicts**, 4 files +15/−8).
Undecided content never entered main's working tree or index.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green, **1.05s**, asset-diet ceilings respected |
| `skill-md-door-guard` + `gr-sim.test.mjs` | **16 tests · 14 pass · 0 fail · 2 skipped** (206s) |
| `er01-e2-census.spec.ts` desktop-chrome `--workers=1` | **4 passed** (12.5s) |
| `er01-e2-census.spec.ts` mobile-chrome (390px) `--workers=1` | **4 passed** (17.0s) |
| `test:node-guards`, curated 79-file list | **425 tests · 420 pass · 0 fail · 5 skipped**, rc=0 (429s) |

**`test:node-guards` was run because the diff touches `src/sim/`** — F-1460-1's rule, and it is the gate a
slice-local spec is structurally incapable of standing in for. It is green, so this slice moves no
cross-cutting sim pin.

**The two new skips were checked, not counted** (s1605 asked the drain to do exactly this): both carry named
causes and a restore path. `gr-sim` reports 2 skipped where main reported 0; `test:node-guards` reports 5
where the standing figure is 3 — the same two, plus the three pre-existing (incl. the F-1408-2 cross-engine
probe, which is deliberately not run in a fire shell and says so in its own skip message).

### Instrument notes (stated so the next reader can reproduce, and so neither reads as a shortcut)

- **`er01-e2-census` never touches `page`.** It boots its own vite in `middlewareMode` over `process.cwd()`,
  so run from `gate-s1606` it exercises **the merged tree** and playwright's `baseURL` is never contacted.
  It was therefore run with `GR_CAPTURE_EXTERNAL_SERVER=1` pointed at a 5199 scratch dev server, purely so
  the run would not start a competing vite on **5188 while lane-a was live** with rf-34 (Mistake #12).
  Verified before relying on it: the spec's only server is the one it constructs itself.
- **One red was self-inflicted and is recorded rather than hidden.** A first attempt invoked
  `node scripts/run-node-guards.mjs` **bare**, which is not the curated list, and it failed at
  `node-guards-contention.test.mjs` (*"board did not stay quiet for 300ms"*). Re-run **alone** the same
  guard passes (1/1). The contending board was **my own bare invocation**, not lane-a and not the slice —
  a probe that dies in your own stub is evidence about the stub. The curated list was then read out of
  `package.json` rather than hand-typed, so the battery could not silently shrink.

## Merge classification

Base `c218e7697`; `main..lane/b` was **1 ahead** (`7eb621945`), `lane-usable` reporting **HOLDS** with four
paths — correct, this was genuine undrained content, and `lane-absorbed-lines` showed 3 of 5 added lines in
`er01-e2-census.spec.ts` absent from main.

| File | Class | Resolution |
|---|---|---|
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED | taken whole; main never moved it in the window |
| `public/skill.md` | LANE-TOUCHED | taken whole |
| `scripts/gr-sim.test.mjs` | LANE-TOUCHED | taken whole |
| `e2e/er01-e2-census.spec.ts` | LANE-TOUCHED | taken whole |

No MAIN-MOVED file, no three-way graft needed. `main..lane/b` is **empty** after the merge.

## Findings

**F-1606-1 (non-blocking, NO CURE PROPOSED — recorded because the next reader will meet it).**
`test:node-guards` is required by §3 for any slice touching `src/sim/`, and the curated list contains
`node-guards-contention.test.mjs`, which needs a quiet board. This drain's battery passed **with lane-a
live**, so the guard is evidently tolerant of a concurrent *lane* — what it will not tolerate is a
concurrent *node-guards board*. That is the correct discrimination and it is working as designed; it is
written down only because the failure text (*"board did not stay quiet"*) reads like a contention complaint
about the whole factory and invites a fire to conclude the required battery is unrunnable during normal
4-lane operation. **It is not.** Run the curated npm list, alone, and it is green.
**GATE: none — no defect, no cure owed.**

## What this does NOT close

**F-E2S-3 is HALF discharged, exactly as s1605 said.** The de-list has landed; **the socket half is still
owed and still needs its census-stream slice specced first.** The two `gr-sim` skips and the three er01
refusal arms are the restore targets — a future socket slice must turn them back into assertions, and their
skip messages name themselves as such so they cannot quietly become permanent.

⚠️ **The retired idle-ceiling pin is not re-aimable and must not be "fixed" by loosening it.** s1605 measured
every real bench seed under `--policy=idle`: `e1-baron` reaches waves 5/8/11/5/5 and `e3-canyon-works` 3/3
against ceilings of 26 and 20, while `e2-hill-mine` reached **18 = its ceiling exactly**. An idle rider
survives 18 waves on hill-mine *precisely because the board sells no weapon that touches the railcar* —
which is F-E2S-3's own proof. `--mode` is explicitly forbidden as a way past the door (era-false, games the
refusal).
