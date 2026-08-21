# Task f2145-1-terminal-probe-binding-control: make the canyon terminal probe's binding control capable of returning both answers (lane-b, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2145, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; **`scripts/f2142-canyon-terminal-probe.mjs`** (the subject — read the whole file, especially its header and the `terrainBinding` block); `artifacts/f2135-canyon-census/TERMINAL-CAUSE.md` (the s2145 note that measured this defect, and the run whose artifact carries it); `artifacts/f2135-canyon-census/REPORT.md` (attempt 4's census, whose `NOT ESTABLISHED` the probe answered); `reviews/f2142-1-campaign-harness-terrain-binding.md` (the cure this control falsely reports as absent); `src/world/Terrain.ts` (read, never edit — the real home of `ACTIVE_CONTRACT`).

## WHY — a control that can only ever return one answer

`artifacts/f2135-canyon-census/terminal-cause-s2145.json`, banked by s2145 from a run whose terrain is **provably correct**, reports:

```json
"terrainBinding": { "activeContractId": null, "claimWidth": 96, "claimHeight": 112,
                    "contractDimensions": null, "matchesRequestedContract": false }
```

`claimWidth`/`claimHeight` are right (96 × 112 **is** the canyon's authored claim, not the 64 × 64 fallback). `activeContractId` and `matchesRequestedContract` are **wrong, and are wrong on every run this probe will ever make**: `f2142-canyon-terminal-probe.mjs:115` destructures `ACTIVE_CONTRACT` from `/src/meta/ContractFamilies.ts`, and **that module does not export it**. It is a module-local `const` — `src/world/Terrain.ts:78` and `src/world/props.ts:6` — with four call sites and zero exports (measured s2145 by grepping all of `src` and `scripts`). The destructure yields `undefined`, so `undefined?.id ?? null` is `null` and the comparison is `false`, unconditionally.

That block is the probe's declared **control**. Its own header (lines 110–114) says it exists *"CONTROL, before any verdict is read off `isBuildable`"*, to decide whether refusals are *"a fact about the contract or about the harness's URL"*. So the cost is not a cosmetically wrong field: a reader who trusts it concludes the terrain binding is **still broken** and re-opens **F-2142-1**, which is cured and merged at `8656ca1f1f1d71edcfec33fd3467ed45a31e4d59`. This thread has already lost three census attempts to a terrain-binding artifact; a control that manufactures that same symptom is the most expensive thing that could be left in `scripts/`.

It survived because the truthful evidence sits three lines away in the same object, so the artifact reads as coherent and only the quoted half lies. **Owner directive is not involved; this is a fire-side instrument defect (F-2145-2).**

## Scope — numbered, each item testable

1. **Make the binding control read the binding, and fail LOUD rather than false.** In `scripts/f2142-canyon-terminal-probe.mjs`, replace the `ACTIVE_CONTRACT` destructure from `ContractFamilies.ts` with a control built from symbols those modules actually export. `Terrain` is already loaded at line 109 and already yields the two fields that are correct today (`CLAIM_WIDTH`, `CLAIM_HEIGHT`); the requested contract's authored dimensions are already in hand as `contract.tileParams.dimensions` (the board contract resolved at line 73). Compare those two, and report `matchesRequestedContract` from that comparison.
2. **Any symbol the probe reads across a module boundary must be asserted defined before it is compared.** If a symbol the control depends on is `undefined`, the probe must **throw with a message naming the symbol and the module** — never flow `undefined` into a comparison that then reports a definite-looking `false`. This is the actual class defect: a destructure of a non-exported name fails silently in JS.
3. **Keep the artifact's shape readable by existing readers.** `TERMINAL-CAUSE.md` and `terminal-cause-s2145.json` are cited, retained evidence. The `terrainBinding` object may gain fields and may correct the two lying ones, but **do not rename or remove `claimWidth`, `claimHeight` or `matchesRequestedContract`** — those three names are quoted in the note and in the ledger. Bump `schema` to `goldrush.f2142.canyon-terminal.v2` so a reader can tell the two artifact generations apart.
4. **Fix the two rotted coordinate citations in the probe's header**, by CONTENT not by memory: it cites `HeadlessContractSim.terminal` at `:1331`; the code is intact but now sits at **`src/sim/HeadlessContractSim.ts:1308`** (`private get terminal(): boolean` → `return this.dead || this.secureChoice === 'bank';`). Re-measure the line yourself and write what you measure. If it has moved again, write the number you measured and say so in your report.
5. **Guard it — and PROVE the guard by manufacturing the defect, not by watching it pass.** Add `scripts/canyon-terminal-probe-binding.test.mjs` asserting that **every symbol `f2142-canyon-terminal-probe.mjs` destructures out of an `ssrLoadModule(...)` call is actually exported by that module**. Resolve the module's real exports (read the source and check for an `export` of that name — do not boot vite). The guard must red when a destructured name is absent from its module's exports. **Demonstrate the red**: temporarily reintroduce the `ACTIVE_CONTRACT`-from-`ContractFamilies` destructure on a scratch copy, show the guard exits non-zero naming that symbol, restore, and paste both outputs in your report. A guard whose violation path never executed is not evidence.
6. **Root the new guard** in an existing npm test script so `gate-caller-audit` does not red it as an un-rooted gate. Read how the neighbouring `scripts/*.test.mjs` files are rooted and follow that, in the same commit that adds the file.
7. **Re-run the probe end-to-end and show the control now discriminates.** Run the reproduce command from `TERMINAL-CAUSE.md` (below) and report the new `terrainBinding` object. `matchesRequestedContract` must now be **`true`**. Then run it **once with `--search '?debug'`** (the pre-cure URL, no `contract=`) and report that object too: that arm must show the control returning the OTHER answer. **A control that cannot be made to say both things has not been fixed.** Both runs are read-only.

```sh
node scripts/f2142-canyon-terminal-probe.mjs \
  --player scripts/f2135-canyon-census-player.mjs \
  --contract e3-canyon-works \
  --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json \
  --search '?debug&contract=e3-canyon-works' \
  --out /tmp/f2145-1-cured.json
```

⚠️ **Both probe runs write to `/tmp` only. Do NOT overwrite `artifacts/f2135-canyon-census/terminal-cause-s2145.json`** — it is the cited artifact that recorded the defect, and the Retention Law makes it evidence, not a stale file. If you believe a v2 artifact should be banked, say so in your report and let the drain rule on it.

## Sequencing law — gate on CONTENT, never on `git log -N`

Each must return **exactly 1** after the pre-flight. **Zero means your lane is not what this master was written against — STOP and report the count. Do not proceed and do not "fix" it:**

- `grep -Fc "const { ACTIVE_CONTRACT } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');" scripts/f2142-canyon-terminal-probe.mjs`
- `grep -Fc "    matchesRequestedContract: (ACTIVE_CONTRACT?.id ?? null) === args.contract," scripts/f2142-canyon-terminal-probe.mjs`
- `grep -Fc "const ACTIVE_CONTRACT = activeContract();" src/world/Terrain.ts`

All three were measured at **1 on main** by the authoring fire at 2026-08-21T23:58Z (F-1425-2: a key is proved against the source file on main before it is written down).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.**

ⓘ The authoring fire measured this lane at **`ahead=0 behind=33`, tracked-dirt 0, untracked 0** (`node scripts/lane-usable.mjs lane-b`, 23:52Z) — so the reset above is expected to be a plain fast-forward onto main and should hold nothing. **If it holds anything, that is new since 23:52Z and IS a STOP.**

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

Cleanliness: `git status --short` in the worktree must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`.**

## Firewall

**TOUCH-ONLY:**
- `scripts/f2142-canyon-terminal-probe.mjs`
- `scripts/canyon-terminal-probe-binding.test.mjs` (new)
- `package.json` — **only** the one line that roots the new guard in an existing test script (scope 6)

**NO — do not touch, for any reason:**
- `src/**` — every file, especially `src/world/Terrain.ts`, `src/meta/ContractFamilies.ts` and `src/sim/HeadlessContractSim.ts`. **The sim is not the subject.** If you believe the real cure is to export `ACTIVE_CONTRACT`, **report that as a finding and do NOT do it** — that is a sim-surface API change and an attended call, and it would move a module-evaluation-time binding that four census attempts already depend on.
- `scripts/gr-sim-campaign.mjs`, `scripts/f2135-canyon-census-player.mjs`, `scripts/f2135-canyon-epoch3-checkpoint.mjs` — the sanctioned harness and player. Read and RUN them; never edit. Attempt 4 withdrew the player lift after it flew 540 turns unchanged; **a player that cannot fly is a Law 2 STOP and a finding, not a repair.**
- `artifacts/f2135-canyon-census/**` — including `terminal-cause-s2145.json`, `TERMINAL-CAUSE.md`, `census.json`, `REPORT.md`, `epoch3-checkpoint.json` and `attempt-3-superseded/**`. Cited, retained evidence.
- `assets/contracts/**` — no contract, no bench seed, no re-pin.
- Any pinned hash or expected-value constant anywhere. **Re-pinning is forbidden without a named cause** (F-1441-3).
- `tasks/**`, `STATUS.md`, `CLAUDE.md`, `reviews/**`, `tasks/BACKLOG.md`, `tasks/goals.json` — the fire owns all bookkeeping. If a coordinate cited in a law file has rotted, **report it; do not re-base it yourself.**

## Self-check — name the exact commands and paste real output

- `npx tsc --noEmit` — clean.
- `npm run build` — green; paste the `✓ built in` line.
- `node --test scripts/canyon-terminal-probe-binding.test.mjs` — green, with the **manufactured red** from scope 5 pasted beside it (both outputs, or the scope item is not done).
- `npm run test:node-guards` — **required**: you are adding a guard to it and `gate-caller-audit` + `law-pointer-guard` both live there. ⓘ Budget **≥8 minutes** and **run it ALONE** — it was `472 tests / 404.7 s` at s2099 and `489 / 499.3 s` at s2144 on a contended shell, and it only ever grows. If it reds, **fingerprint the failure against main before assuming it is yours**: `same-game report exemption reasons and citations match source` / `stale exemption reason for 'e2-incline'` is **F-2143-4, a known inherited red** — established by a controlled second worktree at pre-merge main in s2144. Report it as inherited; **do NOT regenerate the bench report to make it green** — that destroys the red's attribution and the file is dirty in main under a concurrent writer.
- Both probe runs from scope 7, with both `terrainBinding` objects pasted in full.
- No `?debug` gate is involved and nothing here renders — **no screenshots and no e2e are owed.** Say so explicitly rather than skipping silently.

## Report

**READY-FOR-GATES.** In your report, state: the measured line number for `HeadlessContractSim.terminal` (scope 4); both `terrainBinding` objects (scope 7) and whether the control returned **both** answers; the manufactured-red output and the restored-green output for the new guard (scope 5); the three sequencing grep counts; exactly which lines of `package.json` you touched; anything you were tempted to fix in `src/**` and deliberately did not, as a finding.
