# f1508-1 — E1_CONTRACTS stale broadcast

**Slice:** `lane-f1508-1-e1-contracts-stale-broadcast.md`
**Branch:** `lane/a` · **tip** `daf19a203` · real content `6c95062ee` · **base** `557a78c70`
**Drained by:** s1509 fire, 2026-08-07
**Gate worktree:** `gate-s1509` (detached at `86e49e5d8`, §3.0b custody — the lane content never entered main's working tree until the verdict was MERGE)

## Verdict

**MERGE** — with one finding that narrows, but does not overturn, the runner's own evidence.

## What it does

`e2e/072-era-activation.spec.ts:23` pasted a five-id literal `E1_CONTRACTS`. The
epoch-1 manifest legitimately grew a sixth contract (`e1-drill-yard`) on 2026-08-01 at
`f86b28b34`, three days after the red-inventory snapshot (2026-07-29) that recorded this
spec CLEAN. The literal therefore went stale and `:226` reddened on main — the
"broadcast an expected value your merge changes" class, not a regression. This slice
replaces the literal with `loadEpoch(FRONTIER).contracts.map(({ id }) => id)`, so the
expectation tracks the manifest. Two lines, one file.

## Evidence (measured s1509 on the merged tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, clean |
| `npm run build` | rc 0, built in 1.14s; asset-diet within ceilings |
| `e2e/072-era-activation.spec.ts` desktop + mobile | **9 passed / 1 skipped** (55.6s) |
| Adjacent: `drill-yard`, `drill-yard-manifest`, `field-book`, `sci-04-contract-registry`, `contract-bundle-validation`, both projects | **18 passed** (50.7s) |
| Console/page errors | zero; only the known `render_demotion` warns for `e1-drill-yard` |
| Determinism artifact | `absentKeyHash === explicitE1Hash === ef44d2c0…` — **independently reproduced the lane's value** on a clean tree |

Merge classification: base `557a78c70`; main moved **zero** of the lane's paths since
that base (`git log 557a78c70..main -- e2e/072-era-activation.spec.ts` empty), so
`e2e/072-era-activation.spec.ts` is LANE-TOUCHED / MAIN-UNMOVED — a clean apply, no graft.
Merged path-scoped: the spec plus `artifacts/072-era-activation/preflip-determinism.json`.
The lane's two PNG deltas were **not** merged (F-1330-3 evidence churn).

## Findings

### F-1509-1 — the runner's non-vacuity probe is TRUE but NARROWER than it reads; roster-drift coverage now lives only in `field-book.spec.ts` (non-blocking, recorded)

The master required a manufactured-defect probe proving the derived expectation is not
vacuous, and the runner supplied one: injecting `e2-hill-mine` reddened the `toEqual`.
That is real — but it proves detection of **cross-epoch leakage**, not of **same-epoch
roster drift**, and the run report's phrasing ("still catches later-epoch leakage") is
easy to read as the stronger claim.

`listContracts(epochId = DEFAULT_EPOCH_ID)` is literally `return loadEpoch(epochId).contracts`
(`src/meta/ContractFamilies.ts:981-983`). Both sides of the assertion now derive from the
same manifest, so a change to the E1 roster moves them together.

**Measured, not reasoned** (s1509, in `gate-s1509`): removing `e1-twin-banks` from
`assets/contracts/epoch-1-frontier/contracts.json` and re-running —

- `072-era-activation.spec.ts:226` → **1 passed** (blind to the roster change)
- `field-book.spec.ts:66` → **1 failed** (its literal six-id list at `:104` caught it)

Probe reverted; `assets/` verified clean; the determinism artifact regenerated to its
clean value afterwards (the mid-probe run had written a third hash, `5bd0340c…`, which was
**not** merged).

**So coverage is not lost — it moved**, which is exactly the shape s1508 cited from the
`f1504-1` precedent, and the merge is correct. ⚠️ **The standing hazard: `field-book.spec.ts:104`
is now the ONLY assertion of the E1 roster.** A future fire "tidying" that literal into a
derived expression — the very cure applied here, applied one file over — would delete the
last check with no red to announce it. Anyone touching that line should read this finding
first.

Non-blocking: no corrective task. The cure is right; the note exists so the next reader
does not repeat it in the one place it would do harm.
