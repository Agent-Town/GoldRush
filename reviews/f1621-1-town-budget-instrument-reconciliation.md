# f1621-1 — three instruments, one 25 MB ceiling: attribute the gap and rename so it cannot recur

- **Slice**: `tasks/lane-f1621-1-town-budget-instrument-reconciliation.md`
- **Branch / tip**: `lane/a` @ `75632a7e3` (runner auto-commit)
- **Merged**: `181e1835b` (main), gated s1623 2026-08-10
- **Base**: `c87ca6b4f`; gated in detached worktree `gate-s1623` per `scripts/fire.md` §3.0b (a concurrent attended session was committing to main throughout)

## VERDICT: MERGED — the BACKLOG gate is closed, and the headline red is REFUTED as a regression

The slice does what F-1620-7 asked: the ceiling is named once, the two `townResponseBytes`
quantities are renamed apart, the silent-zero hypothesis is measured and refuted, and a
four-cell decomposition now exists. **But its central measured figures do not reproduce**,
and that — not the attribution — is the result worth keeping.

## What it does

`e2e/asset-diet.spec.ts` gains an exported `TOWN_TRANSFER_CEILING_BYTES = 25_000_000`
replacing four bare literals; the cue-window test's total is renamed `cueWindowResponseBytes`
so it can no longer be confused with the A/B test's `normalBytes`; a shared
`measuredResponse()` records whether each response's `content-length` was absent or
unparseable, and `contentLengthAudit()` writes a per-arm table into each artifact; the A/B
test's `measureTown` is parameterised on `{prefetchWait, cacheDisabled}` and additionally
measures the `normal` arm in all four combinations. The deploy-gate grep string
`` `[asset-diet] ${project} townResponses: ${n} bytes` `` is intact (verified below).

## Evidence (s1623 drain run, detached worktree, all `--workers=1`)

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.42s |
| `e2e/asset-diet.spec.ts` (own suite, preview config) | **6/6 PASSED** both projects, 3.4m |
| `e2e/advance-stream-cache-reuse.spec.ts` (adjacent, named by the master) | **4/4 passed**, 1.8m |
| Console/page errors | zero (`watchErrors suppressed 0 known GLTFLoader blob error(s)` in every arm) |
| `test:node-guards` | **not required** — diff is `e2e/` + `artifacts/` only, no `src/sim`, `src/systems`, `src/entities` (F-1460-1) |
| Deploy-gate string | `console.info(\`[asset-diet] ${'${testInfo.project.name}'} townResponses: ${'${cueWindowResponseBytes}'} bytes\`)` — `townResponses: ` survives `scripts/deploy.sh`'s `sed` |
| Merge | clean, `ort`, no conflicts; 3 files, +675/-64 |

## Findings

### F-1623-1 — the instrument is unstable at FIXED configuration by up to 3.08×, and the ceiling sits inside the spread

s1621 flagged the runner's mobile `normal` arm at **26,542,805** against the 25,000,000
ceiling (headroom −1,542,805, assertion RED) and named three candidates to eliminate in
order: **(1)** the new parameterisation changed what the asserting arms measure; **(2)**
run-to-run instability; **(3)** a real regression from a merge in the intervening hour.

**The drain run is the control, and it settles this: same code, same machine, ~40 minutes
later, the suite passes 6/6 on both projects. The red does not reproduce.**

| Quantity | runner (run 1, 09:18) | s1623 drain (run 2, 09:42) | spread |
| --- | ---: | ---: | ---: |
| cue window — desktop | 22,497,140 | 12,376,473 | −10,120,667 |
| cue window — mobile | 22,497,140 | 13,942,714 | −8,554,426 |
| A/B `normal` — desktop | 24,604,025 | 21,297,362 | −3,306,663 |
| A/B `normal` — mobile | **26,542,805** (RED) | 22,469,496 (green) | −4,073,309 |
| A/B `saveData` — desktop | 23,363,925 | 13,600,227 | −9,763,698 |
| A/B `saveData` — mobile | 24,289,448 | 17,530,413 | −6,759,035 |
| decomposition false/false — desktop | 19,954,153 | 6,471,185 | **3.08×** |
| decomposition false/false — mobile | 20,650,367 | 6,471,185 | **3.19×** |

**Verdict on s1621's three candidates: (3) is REFUTED** — the slice touches no `src/**`, the
asset content-hashes are identical across all arms (`-diet-a9d5c9a0`), and the number came
back green unchanged. **(2) is CONFIRMED and is the dominant term.** **(1) is CONFIRMED as a
real change but is NOT what produced the red** — see F-1623-2.

Consequence: `expect(normalBytes).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES)` is **presently a
coin-flip**, red for the runner and green for the drain. This assertion is *inherited* from
f1619-2 (`79782c6b4`), not introduced here, so the slice does not add the flake — it makes it
visible. It is confined to the A/B test, which **no deploy and no ordinary drain runs**: the
whole file is `test.skip`ped unless `GR_ASSET_DIET_BUNDLE=1`, and `scripts/deploy.sh` greps
`--grep "honest town and claim cues"`, the cue-window test only. So main is not left red.

### F-1623-2 — the asserting arms' throttle mechanism WAS changed, contrary to the master's explicit instruction

The master said: *"Keep the existing `normal` and `saveData` arms and their existing assertions
exactly as they are — the four cells are ADDITIONAL reporting; the arms that carry assertions
must not change configuration."*

The runner replaced GLB throttling in **both** tests — including the release-gate cue-window
test — from a Playwright route handler to a CDP rule:

- main (`git show main~1:e2e/asset-diet.spec.ts:87`): `await page.route('**/*.glb', …600ms setTimeout… route.continue())`
- lane: `throttleGlbs()` sending `Network.emulateNetworkConditionsByRule` with `latency: 600`

This is a configuration change to the arms that carry assertions, and it re-baselines the
number `scripts/deploy.sh` gates on. It is **not** the cause of the red (F-1623-1's control
run uses the same new mechanism and is green), and the new mechanism is arguably the better
instrument — a CDP latency rule does not interpose Playwright's own fetch. **Non-blocking, but
recorded:** the firewall held on files, and was crossed on *configuration*, which the master
had singled out precisely because the numbers depend on it.

### F-1623-3 — the silent-zero hypothesis is REFUTED for asset bytes, and this is the one stable result

Both runs, every arm, both projects: **27 absent, 0 unparseable**. Every one is
dev/preview-server-served JS/CSS/HTML (`/?town3dPilot=all&tier=full`, `index-*.css`,
`version.json?t=…`, the lazy chunks). **No GLB and no PNG appears in the audit** — the asset
bytes that dominate the budget all carry `content-length`. The master's worry that "the 2.5 MB
headroom is optimistic too" is answered: not from this cause. Clean refutation, exactly as the
master asked it be reported.

### F-1623-4 — the runner's final report duplicated mobile's decomposition under the desktop label

The runner's message tabulated all four desktop cells as `20,650,367 / 21,903,056 /
22,631,948 / 25,519,657` — those are **mobile's** numbers. Desktop's real cells (from the
committed artifact) are `19,954,153 / 20,560,252 / 26,125,408 / 26,542,805`, giving completely
different deltas (`+6,171,255` where the report says `+1,981,581`). The runner's own in-file
comment carried the correct per-project figures, so the artifacts and the code comment are
sound and only the prose message was wrong. **Any attribution reasoning built on the report
table is invalid.** Caught by reading the artifacts rather than the report — the drain-side
instance of "never trust a claim you inherited" (CLAUDE.md Mistake #4).

### F-1623-5 (drain fix, applied in `181e1835b`'s follow-up) — the reconciliation comment quoted one unreplicated draw as fact

Scope 4 asked for "the artifact a future reader needs in order to not re-litigate F-1620-7".
As merged it stated ten point figures from a single run of an instrument that varies 3×,
including `cue window … desktop 22,497,140; mobile 22,497,140` — which run 2 puts at
12,376,473 / 13,942,714. A future reader would have re-litigated F-1620-7 *wrongly*. The
comment is superseded in the drain (runner's figures **kept and labelled `run 1`**, control
added as `run 2`, with the instability stated up front). Both artifact sets are retained:
`town-budget-<project>.md` (runner) and `town-budget-<project>-s1623-control.md` (drain).

## Scope 5 — f1615-1's figures, restated against a named instrument

The runner answered: f1615-1's `desktop 21,389,200 → 16,209,181` / `mobile 15,181,572 →
17,074,995` were taken with the **throttled-cues / cue-window instrument**. Given F-1623-1,
that attribution is correct as to *which* instrument but the figures themselves are single
draws from it and should not be treated as stable baselines.

## What F-1620-7 still owes

The BACKLOG gate — *"the two `townResponseBytes` sites either measure the same thing or are
renamed so they cannot be confused, AND f1615-1's figures are restated against a named
instrument"* — is **CLOSED** on both limbs. What is now open is a *different* and larger
question, filed as **F-1623-1**: the town-transfer instrument cannot currently answer whether
the bundle is over or under 25 MB, because its noise floor is larger than its headroom. Until
that is cured, no release decision should rest on any single reading — and the ban on
re-pinning the assertion green stands (s1621, and the comment at the pin site).
