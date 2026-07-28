# Review — `lane-a-town-info-note-dead-reckoning`

**Slice:** F-1174-2, the `world-info-notes` town dead-reckoning realign (authored s1174, run `20260728-164306`)
**Branch / tip:** `lane/m3` @ `ced4484f` (`runner(lane-a): lane-a-town-info-note-dead-reckoning.md`), base `781acfe0`
**Merged to main:** `011e85fc`, path-scoped, 5 files
**Drained by:** s1175 fire, 2026-07-28
**§3.0 `drain-block-check`:** `✅ CLEAR — lane-a-town-info-note-dead-reckoning.md [factory-town-info-note-dead-reckoning] status="queued"` — run as the first command of the drain, before classification.

## Verdict

**ACCEPTED — outcome (a), the branch the master declared lawful, reached through the observe-first STOP gate rather than around it.**

## What it does

`e2e/world-info-notes.spec.ts`'s town test walked to four buildings by holding movement keys for fixed wall-clock durations — timings authored 2026-07-08 (`66bb9f46`) and never retimed. `d1f549d5` (07-19) put `townPropAt` into `sampleTown`'s `walkable` term eleven days later, so the plaza grew colliders under a route that assumed it was empty. The slice replaces all four timed legs with one local helper, `approachTownBuilding(page, id)`, which reads the target's `approach` from `__GR_TOWN_DIAGNOSTICS__.plaza.slots` **by id**, teleports via the town's own `teleport(x, z)`, and polls `activePrompt` until it equals that id. The wall-clock `hold` helper is deleted (no remaining callers — verified by grep and by a clean `tsc`).

**Zero `src/`.** The slice consumes the diagnostics seam s1109 shipped (`425d2a9a`, *"town-t1-square asserts shape not literals"*); it adds none. **No coordinate literal** survives in the test — which is the whole point, and an improvement on `ceremony-framework.spec.ts:119`, which hardcodes a copied `approach`.

## Scope 1 — the observation that earned the (a) verdict

The runner instrumented the **unmodified** walk and measured all four legs on both projects (assertions suppressed for that one run so legs 3 and 4 could be reached at all):

| project | leg | target | published approach | arrival | Δ | activePrompt |
|---|---:|---|---|---|---:|---|
| desktop | 1 | tavern | (-4.9, -4.9) | (-5.41, -3.60) | 1.40 | tavern |
| desktop | 2 | claim_office | (4.9, -4.9) | (5.63, -3.61) | 1.48 | claim_office |
| desktop | 3 | schoolhouse | (-6.6, 2.4) | (-5.63, -3.59) | **6.07** | tavern |
| desktop | 4 | assay_office | (6.6, 2.4) | (5.63, -3.59) | **6.07** | claim_office |
| mobile | 3 | schoolhouse | (-6.6, 2.4) | (-5.60, -3.45) | **5.93** | tavern |
| mobile | 4 | assay_office | (6.6, 2.4) | (5.60, -1.58) | **4.10** | **null** |

The mid-hold sampling the master demanded is what discriminates the two candidate faults, and it came back unambiguous — desktop x during the Claim Office `KeyD` hold: `-3.68, -1.98, -0.13, 1.87, 3.37, 4.67, 5.63, 5.63, 5.63, 5.63`. **The hero stops advancing and then holds still for the last four samples while `props` reads `loaded`.** That is a stall against geometry, not a timing shortfall — the distinction the master required be kept separable, and it was.

Verdict sentence as written: *"**(a) NAVIGATION / FIXTURE FAULT.** … When an arrival remains inside the interaction radius, `activePrompt` does fire. This is not case (b)."*

## Evidence (re-run by the drain on the merged tree, not inherited)

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.76 s** |
| `e2e/world-info-notes.spec.ts`, both projects, **`--workers=1`** | **4 failed / 10 passed** (baseline on clean main: **6 failed / 8 passed**) |
| target row `:290` *town shells use info notes beside opens-soon prompts* | **passes on BOTH projects** (was `:289`, red on both) |
| remaining reds | `:196` + `:319` on each project — **both firewalled by the master, neither touched** |
| adjacent `e2e/town-t1-square.spec.ts` + `e2e/town-t3-board.spec.ts`, `--workers=1` | 2 failed / 14 passed — see below |
| console / page errors | zero; the target's own `assertNoErrors` passes on both projects |
| load during the battery | 1-min loadavg **8.11** — stated because load invalidates reds, not passes; every green above is a green under load |

**Worker count is stated deliberately** (F-1173-5): this file reads a different red count under default parallel workers, so any comparison against these numbers that omits `--workers=1` is comparing two instruments.

### The adjacent red is pre-existing, and here is the proof rather than the assertion
`town-t1-square.spec.ts:74` *"menu enters town square, prompts at four shells, exits, then starts normal run"* fails on both projects. Fingerprint: `getByTestId('town-approach-prompt')` expected `"order status"`, received `"Assay Office ... the clerk takes complaint"` — a **content** mismatch, with the prompt present and firing. It is listed at that exact file **and line `74`, for both projects**, in `logs/suite-red-inventory-compact.json`, the shared inventory measured on main (shipped `7a457025`) **before** this slice existed. The merged diff touches one spec file plus artifacts and **no `src/`**, so it has no mechanism to reach another spec's prompt text.

## Merge classification

Base `781acfe0`; five files, all path-scoped:

| file | classification |
|---|---|
| `e2e/world-info-notes.spec.ts` | **MAIN-UNMOVED** — main's blob equals the base blob, so the lane version applies cleanly; **no 3-way graft needed** |
| `artifacts/world-info-notes/{desktop,mobile}-chrome-town-claim-office-note.png` | pure additions (absent at base **and** on main) |
| `logs/session-scratch/lane-a-town-info-dead-reckoning-observation.md` | pure addition — **retained deliberately** per the RETENTION LAW; the master ordered it kept |
| `tasks/runs/20260728-164306-…md` | pure addition |

No conflicts. Main had moved only in `tasks/` and `STATUS.md` (this fire's own authoring commit) — disjoint.

## Firewall audit (verified at source in the diff, not taken on trust)

- **All of `src/**` — untouched.** `git show --name-only` lists no `src/` path.
- **`:321-341`, the OPEN OWNER FORK** (F-1141-3 + F-1164-1, one constant at `src/styles.css:1620`): untouched; still red at its new line `:319` on both projects, exactly as the master required. The runner did not "helpfully" pre-empt Robin's decision.
- **`:195` building notes** (different fingerprint, separately owned): untouched; still red at its new line `:196`.
- **Every assertion survived.** All four `expectNote(...)` calls with their exact `objectClass` + text, the `town-approach-prompt` text on all four buildings, `town-open-board`, and `town-rename` are all present in the merged file. **No assertion was deleted to reach a green** — the failure mode the master named explicitly.
- Mutation control performed and restored: the Claim Office leg aimed at the published `plaza.gate` reproduced `Expected substring: "Claim Office" / Received string: ""` at that leg's own line `:306`. The cure can fail.

## Findings

**F-1175-4 (non-blocking, methodological — for the record, no corrective owed).** The scope-1 observation ran with **assertions suppressed**, and the walk it measured is **wall-clock dead reckoning** — so the trajectory it recorded is not strictly the trajectory of the assertion-bearing run that failed (leg-1 assertions cost real time, and every later leg's arrival depends on it). That matters for one specific line of the report: the observation shows leg 2 arriving at Δ1.48 **with `activePrompt` = `claim_office`**, whereas the original failing run saw the DOM prompt resolve **14× to `<div hidden="">`** at the same leg. Those two facts are not reconcilable on a single trajectory, and the report does not remark on it.

**It does not weaken the (a) verdict, and the reason is worth stating precisely:** case (b) asks whether the prompt fires *at the published approach*, and the **cure itself now answers that directly** — it teleports to exactly that point and polls `activePrompt`, and it passes on both projects. So (b) is excluded by the cure's own green, on the exact trajectory in question, not by the observation's inference. The observation's load-bearing contribution is legs 3/4 (Δ 4.10–6.07) and the four-sample stall series, and both are independent of the timing question.

*Reusable shape: when an instrumented re-run has to disable the assertions to reach its later legs, it has changed the clock that a wall-clock fixture is measured against — so its intermediate readings are evidence about the game, not about the failing run.*

## Gazette (GZ-01 filter law)

**No item.** The merge moves **zero `src/`** — `git show --name-only 011e85fc` lists one spec file, two artifacts, one scratch note and one run report. Nothing a player can see changed, so the filter correctly withholds.
