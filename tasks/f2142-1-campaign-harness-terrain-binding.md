# Task f2142-1: bind the campaign harness's terrain to the contract it was asked to run (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2142, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; **`artifacts/f2142-canyon-terminal/REPORT.md`** (the whole evidence chain for this slice — read it before scope 0, including its two self-corrections); `scripts/gr-sim-campaign.mjs` (your only production subject — the URL at `:17`, the module loads at `:21`–`:47`); `src/world/Terrain.ts:78`–`:86` and `:238` (the binding you are NOT allowed to touch); `src/meta/ContractFamilies.ts:1323`–`:1345` + `:2328` (`activeContractSelection` and `currentSearch` — the mechanism, READ-ONLY); `tasks/BACKLOG.md` — the F-2142-1 row.

**SEQUENCING LAW / STALENESS CHECK — verify the premise before building. Run:**

```
grep -Fc "const location = new URL('http://gr-sim-campaign.local/?debug');" scripts/gr-sim-campaign.mjs
```

It **must return 1** (verified on main by the authoring fire at dispatch time, immediately before `cp`). That line IS the defect. **If it returns 0, your lane is stale or someone has already moved this line — STOP and report "campaign harness URL line not found"; do NOT improvise a different insertion point and do NOT edit `Terrain.ts` instead.**

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION, always expected and never a STOP (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

ⓘ **At authoring time `lane/b` was `ahead=0 behind=30`, tracked-dirt 0, untracked 0 — USABLE** (`node scripts/lane-usable.mjs lane-b`, run twice: before and after the authoring commit).

⚠️ **THE LANE WAS NOT PRE-REFRESHED, AND YOU MUST NOT READ THAT AS AN OVERSIGHT — IT IS STATED SO YOU CAN CHECK IT.** The authoring fire's shell is denied git operations inside lane worktrees, so it could not run the refresh itself. **The F-1424-3 ordering hazard is nevertheless avoided, which is the part that matters:** this master and all of its cited evidence were committed to `main` **BEFORE** the `cp` that dispatched it, so the `git checkout -B lane/b main` in your own pre-flight above is what brings the citation into the lane — and main already contains it. **Run the staleness grep AFTER your pre-flight reset, not before.** If it returns 0 *after* a successful reset to main, that is a real finding and a STOP, not a stale lane.

## Why (F-2142-1, measured by s2142 — the full chain is in `artifacts/f2142-canyon-terminal/REPORT.md`)

`scripts/gr-sim-campaign.mjs:17` fabricates a browser location for the modules it is about to load:

```js
const location = new URL('http://gr-sim-campaign.local/?debug');
```

`?debug`, and **no `contract=`**. `ContractFamilies.activeContractSelection()` reads that query
(`currentSearch()`, `:2328`), finds no requested id, and returns the **fallback** contract. And
`src/world/Terrain.ts:78` binds `const ACTIVE_CONTRACT = activeContract()` at **module-evaluation
time**, deriving `CLAIM_WIDTH`/`CLAIM_HEIGHT` (`:85`–`:86`) and the `buildZones` that `isBuildable`
(`:238`) tests against.

So the harness runs the sim with the **right manifest** — `this.manifest = loadContract(this.contractId)`
(`HeadlessContractSim.ts:690`) — on the **fallback's ground**. Manifest right, terrain wrong.

**Measured, same probe, same seed, same player, same checkpoint, only the URL differing:**

| | `?debug` (today) | `?debug&contract=e3-canyon-works` |
|---|---|---|
| `Terrain.CLAIM_WIDTH × CLAIM_HEIGHT` | **64 × 64** | **96 × 112** |
| both base pylons' buildable disc (r 2.5) | **0 / 317** | **317 / 317** |
| beacons built by the census player | **0** | **5** |
| `canyonConnect.powered` | **0** / 2 | **1** / 2 |
| terminal wave | **2** | **8** |

The canyon's two base pylon sites sit at `z = ±36` — outside a 64-wide claim's half-extent of 32 — so
`sentry_beacon` is refused `out_of_zone` there, and since both are **cut-vertices** on the only wire
paths from `sub-hall` to either gallery, `powered` can never leave 0.

⭐ **What this cost: two censuses and seven fires.** f2086 and f2135 both measured `powered 0/2` and
reasoned about beacon cost and deadline margin. The number was never about the beacons.

⚖️ **This is the sibling half of F-2120-1.** That slice cured the harness's **board selection**
(`--contract` refuses loudly on four arms) and its `GATE:` was declared open — closing F-2086-1's
stated danger, *"the harness succeeds and returns numbers about the wrong contracts."* It is only
half closed: selection moved, the fabricated environment did not.

⚠️ **THE CLASS IS ALREADY KNOWN — READ THIS BEFORE YOU THINK YOU ARE CURING SOMETHING NEW.**
`F-A10-1` / `F-2134-1` own the mechanism and got there first: `tasks/BACKLOG.md:24` files it as an
engine debt, and the s2134 row measured that **22 of the 36 contracts declaring `buildZones` have
their own first zone's centre rejected by `Terrain.isBuildable` under SSR — `e3-canyon-works` among
them, by name** — concluding *"the bench is not applying the wrong zones, it is applying the wrong
ground."* What is new is only the **route and the remedy**: F-2134-1's mechanism is `currentSearch()`
returning `''` with **no** `globalThis.location`, whereas this harness **sets** one and merely omits
the parameter — which is exactly why the harness is curable in one line while the general case is not.

🚫 **YOU ARE NOT DOING THE F-2134-1 REWIRE, AND YOU MUST NOT DRIFT INTO IT.** Its successor —
*"route the NINETEEN legality reads through `currentContract()`"* — **re-baselines every bench floor,
pin and admission exemption in the repo** (the s2138 row records that widening `gr-sim.test.mjs:630`'s
assertion would red 22 contracts), and it is attended-gated. This slice must leave every one of those
numbers untouched. If your diff moves a pin, you have drifted; stop and report.

## Scope (numbered, each testable)

0. **Re-derive the premise before you build** (quote all three in your report):
   - the staleness grep above → must be **1**.
   - `grep -n "contract=" scripts/gr-sim-campaign.mjs` → must show **no** `contract=` in the URL today.
   - `grep -n "args = parseArgs" scripts/gr-sim-campaign.mjs` → confirm `args` is parsed **above** `:17`, so `args.contract` is already available where the URL is built. **If it is not, STOP and report** — the whole cure depends on that ordering and you must not reorder the file to create it.

1. **Name the contract in the fabricated URL when, and only when, `--contract` was supplied.** Build the query so that `--contract <id>` yields `?debug&contract=<id>` and its **absence yields the byte-identical string it produces today**. URL-encode the id. Nothing else about the line changes.

2. **Do not move the assignment.** It must stay above `createServer` and above every `ssrLoadModule`, because the binding happens at module-evaluation time and a correct value set one line too late is no cure at all. Confirm in your report that the assignment still precedes `:21`.

3. **🚨 THE BACKWARD-COMPATIBILITY CONTROL — LOAD-BEARING, AND IT OUTRANKS THE FEATURE.** `scripts/gr-sim-campaign.test.mjs:71` pins `fnv1a32:4f363fd5` for the five-leg E1 walk. That test drives the harness with `--test-fixture` (`:168`), which takes the `fixtureOutcome()` branch (`gr-sim-campaign.mjs:97`–`:101`) and **never constructs `HeadlessContractSim`**, so it never touches `Terrain` and **your change must not move it**. Run `node --test scripts/gr-sim-campaign.test.mjs` and paste the result.
   - **Pin unchanged → PROCEED.**
   - **Pin MOVED → STOP AND REPORT.** Do not re-pin, do not update the fixture, do not "accept" the new number. A re-pin is lawful only with a named cause (F-1441-3), and "my slice moved it" is a finding for a fire to rule on. **A stop here is a success.**

4. **Pin the cure with a test that measures the BINDING, not the string.** A test asserting the URL contains `contract=` would pass while the binding stayed broken — it would be testing your own edit back to yourself. Load `/src/world/Terrain.ts` through a vite SSR module runner under each of the two URLs in **separate module graphs**, and assert `CLAIM_WIDTH`/`CLAIM_HEIGHT` is `64 × 64` under `?debug` and **`96 × 112`** under `?debug&contract=e3-canyon-works`.
   ⚠️ **The two loads MUST NOT share a module graph** — `Terrain`'s consts evaluate once, and `activeContractSelection` additionally memoises on the search string, so a second load in the same runner will hand you the first load's answer and the test will pass for the wrong reason. Use a fresh `createServer` per arm and assert the two arms actually differ. Put it in a new focused `scripts/campaign-harness-terrain.test.mjs` and **root it into `test:node-guards` in `package.json`** (`gate-caller-audit` will red if you add the script and forget to root it — F-2141-4's lesson).

5. **Reproduce the cure end-to-end THROUGH THE HARNESS ITSELF, as evidence rather than as a test.**

   🔴 **CORRECTED s2142 AFTER THE FIRST RUN STOPPED HERE — THE ORIGINAL INSTRUCTION WAS DEFECTIVE AND THE RUNNER WAS RIGHT TO REFUSE IT (F-2142-3). The retired text is kept below, not deleted.** It read: *"Run the probe the finding was measured with, unchanged … `node scripts/f2142-canyon-terminal-probe.mjs --player … --contract e3-canyon-works …` … With the cure in place, the harness's own default URL path is what the probe now exercises."* **That last clause is false, and the authoring fire wrote the probe itself, so the error is entirely mine.** `scripts/f2142-canyon-terminal-probe.mjs:44` builds its **own** `globalThis.location` from its own `--search` default of `?debug`, and it **never imports or invokes `scripts/gr-sim-campaign.mjs`** — it re-implements the harness's loop. So no edit to the harness can ever change what that probe reports, and the task's own NO list forbids editing the probe. **The step was unsatisfiable as written: it demanded evidence that the instrument could not produce, from a file the firewall protected.** The first run reported exactly this (*"it independently hard-codes `?debug`; it never invokes or imports the changed campaign harness"*), reverted its churn, and STOPPED without touching the banked file. **That is a firewall success, not a failure.**

   ➡️ **DO THIS INSTEAD — drive the SANCTIONED HARNESS COMMAND, which is the thing your diff actually changes:**
   ```
   F2135_CENSUS_RUN=f2142-1-after F2135_CENSUS_FILE=artifacts/f2142-1-cure/census.json \
   node scripts/gr-sim-campaign.mjs --player scripts/f2135-canyon-census-player.mjs \
     --contract e3-canyon-works --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json \
     --output artifacts/f2142-1-cure/campaign --checkpoint artifacts/f2142-1-cure/checkpoint.json
   ```
   🚨 **THE TWO ENV VARS ARE MANDATORY, NOT DECORATION — OMIT THEM AND YOU SILENTLY CORRUPT BANKED EVIDENCE (F-2142-4, and the authoring fire did exactly this to itself).** `scripts/f2135-canyon-census-player.mjs:10` defaults its output to `artifacts/f2135-canyon-census/census.json` — the **banked artifact of the f2141-1 drain** — and `persist()` (`:53`–`:74`) **appends in place, replacing the run whose id matches** and recomputing `comparison.identical`. s2142 re-used this player in a probe without setting either var and overwrote banked `run-1` with a 540-row run, flipping the cited `"identical": true` to **false**; it was caught by `git status` afterwards and restored byte-identically (SHA-256 `9676bf9f…a455be`, verified by **content compare against `HEAD`**, never by the absence of dirt — F-1295-1). **Set both vars, and before you report, confirm `git status` shows `artifacts/f2135-canyon-census/census.json` UNMODIFIED.** If it is modified, restore it with `git checkout HEAD -- artifacts/f2135-canyon-census/census.json` and say so in your report.
   **Expect it to STILL THROW — and expect the throw to have MOVED.** `gr-sim-campaign.mjs:113` throws `e3-canyon-works ended unsecured at wave N` whenever the leg does not secure, and the leg is not expected to secure. **The evidence is `N`:** it was **2** before the cure and the s2142 control reached **8**. Paste the verbatim exception. **A wave materially past 2 is the cure working end-to-end;** still `wave 2` means your edit lands after module evaluation — re-read scope 2. ⓘ This is ~4–5 minutes; budget for it. Nothing here needs the probe, and the probe stays banked and unedited.

6. **Report, do not fix, the multi-leg half (F-2142-2).** One process holds one binding; a multi-leg walk changes contract between legs and **cannot** re-bind. State in your report which legs of a real (non-fixture) multi-leg walk remain wrong under your cure. **Do not attempt to fix it** — the options (a process per leg, or a re-bindable terrain) are a design fork reserved for an attended session.

## Firewall

**TOUCH-ONLY:** `scripts/gr-sim-campaign.mjs` · a new `scripts/campaign-harness-terrain.test.mjs` · `package.json` (only to root that one script into `test:node-guards`) · `artifacts/f2142-1-cure/**`.

**NO:**
- `src/**` — **especially `src/world/Terrain.ts` and `src/meta/ContractFamilies.ts`.** Making the terrain re-bindable is F-2142-2, an attended design fork, and it is NOT this slice. If you believe the only correct cure is there, **STOP and report that**; a reported refusal is a firewall success.
- `scripts/gr-sim-campaign.test.mjs` — the backward-compatibility control must stay unmodified to be worth anything.
- `scripts/f2135-canyon-census-player.mjs`, `scripts/f2142-canyon-terminal-probe.mjs`, `artifacts/f2135-canyon-census/**`, `artifacts/f2142-canyon-terminal/**` — banked evidence; read and cite, never edit.
- `assets/contracts/**` — the canyon's geometry is correct; nothing here is a contract-data fix.
- Any re-pin of any hash, floor or fixture, anywhere.
- `tasks/**`, `STATUS.md`, `reviews/**`, `CLAUDE.md` — the drain writes those. If a citation in `CLAUDE.md` or `scripts/fire.md` has rotted because of your diff, **report the shift with old and new line numbers; do not edit the law file.**

## Self-check before you report

- `npx tsc --noEmit` rc=0 · `npm run build` rc=0.
- `node --test scripts/gr-sim-campaign.test.mjs` — **pin `fnv1a32:4f363fd5` still asserted and green** (scope 3).
- `node --test scripts/campaign-harness-terrain.test.mjs` — both arms, and they differ (scope 4).
- `node scripts/gate-caller-audit.test.mjs` — green, proving the new script is rooted (scope 4).
- The **verbatim harness exception** from scope 5, with its wave number (expected: materially past 2).
- All three scope-0 greps quoted.
- Zero console/page errors is N/A — this slice renders nothing and no e2e is required.

**READY-FOR-GATES.** Report: the three scope-0 greps · the exact diff to the URL line · the pin result from scope 3 · both arms of the new test with their measured dimensions · the scope-5 harness exception with its wave number · your scope-6 statement about which multi-leg legs remain wrong · and any law-file coordinate your diff rotted (named, not edited).

---

## RE-RUN NOTE (s2142) — WHAT THE FIRST RUN ALREADY DELIVERED, SO YOU DO NOT REDO IT

The first dispatch (`20260821-215424`, 114,627 tokens) **completed the implementation and every gate except scope 5**, then stopped on the defective instruction now corrected above. Its lane work is on `lane/b`. **Verify each of these yourself rather than inheriting them** — they are listed so you can confirm rather than rebuild:

- URL now conditionally appends the encoded contract; **assignment still line 17, before `createServer` at line 21** (scope 2 satisfied).
- New binding test: fallback **64 × 64**, Canyon Works **96 × 112**, arms differ, **separate vite servers** (scope 4 satisfied — the separate-graph requirement was honoured).
- `scripts/gr-sim-campaign.test.mjs` **6/6, `fnv1a32:4f363fd5` unchanged** (scope 3 satisfied — the pin did NOT move).
- `gate-caller-audit` **26/26** (the new script is rooted).
- `npx tsc --noEmit` and `npm run build` both pass. No law-file coordinates moved.
- Scope 6 answered: a real multi-leg walk stays wrong after the first `the-claim` leg — `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron` all retain the first module binding.

⚠️ **`artifacts/f2142-1-cure/` holds the FAILED probe output from the retired scope 5.** It is retained (Retention Law), and it is **not** evidence for this slice; do not cite it. Overwrite or supersede it with the scope-5 harness transcript.
