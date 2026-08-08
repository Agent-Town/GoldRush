# F-1586-1 — live desk count refusal

## Slice

- Branch: `lane/a`
- Base/tip before runner auto-commit: `ebc1cab1adf9f8cb83faf360fc6b33e6c8b725ce`
- Verdict: **READY-FOR-GATES**
- Scope: live declared-vs-keyed refusal at tolerance ±1; the archived previous-desk mismatch remains advisory.
- Merge classification: main advanced to `c66d90f6491624337ca7ad3d61cbca379c344204` during the run, but none of the three implementation/report paths moved on main. The slice is path-disjoint; no rebase or conflict resolution was attempted.

## What changed

`analyse()` now reads the live desk's declared count, keyed count, and unkeyed segment openings using the existing `deskItems()` parser. `main()` refuses only when `|declared - keyed| > 1`, names the repair, and leaves count-less headers and ACTIVE locks alone. The previous desk calculation and advisory remain non-gating because archived desks are immutable history.

The comment at the advisory preserves s1533's evidence: 60 counted post-cure desks, 11 agreements and 49 mismatches, nearly all by one. That measurement correctly rejected zero tolerance. The independently re-derived full corpus has an empty delta 2–3 band, so ±1 admits the desks s1533 protected while separating the observed defect band.

## Independent corpus derivation

The probe in `artifacts/s1586-desk-histogram/derive.mjs` was written and run before reading `logs/session-scratch/s1586/**`. It walks current line 1 plus every archived handoff/lock line and imports the production `deskTail()` and `deskItems()` functions.

| Delta (declared − keyed) | Desks |
|---:|---:|
| -1 | 1 |
| 0 | 48 |
| +1 | 30 |
| +4 | 1 |
| +7 | 7 |
| +8 | 2 |
| +9 | 10 |
| +16 | 4 |
| +18 | 1 |
| +19 | 7 |
| +22 | 1 |

- Counted desks: **112**.
- Delta 2–3 band: **empty**. Deltas 5–6 are also empty.
- Last 25 counted desks refused at ±1: **2/25 (8%)** — `s1585` declared 24/keyed 20/delta +4; `s1583` declared 23/keyed 1/delta +22.
- Comparison with the fire's probes: **agreed exactly** on the count, full histogram, empty band, recent refusal count, offenders, and s1585's four unkeyed segments.

## Worked refusal: real s1585 segments

The +4 fixture uses the four real openings:

```text
🔺 **rf-34-hero-y-restore-roundtrip BLOCKED owner-fork**
🔺 **e3-fairground-socket BLOCKED owner-fork**
🔺 **bt-04-homestead-automation BLOCKED owner-fork**
🔺 **f1328-1-drill-yard-census-debt BLOCKED disputed**
```

Its refusal text is:

```text
desk-carryforward-guard: REFUSING — the live OWNER'S DESK declares 24 item(s), but 20 can be keyed (tolerance: +/-1).
Unkeyed segment opening text:
  **rf-34-hero-y-restore-roundtrip BLOCKED owner-fork**
  **e3-fairground-socket BLOCKED owner-fork**
  **bt-04-homestead-automation BLOCKED owner-fork**
  **f1328-1-drill-yard-census-debt BLOCKED disputed**
Repair: key each item by an F-ID or a `backticked-slug` at the very front of its 🔺 segment.
```

The previous-side regression fixture declares 5, keys 1, prints the existing advisory, and exits 0 when the live desk is clean. Archived mismatch therefore still cannot gate.

## Manufactured red

Before the red, the intended guard SHA-256 was `53223da861a0f2ae51723cca767b6b761dd2b5116a25a475955d7a845f686176`. I temporarily changed the live threshold from `> 1` to `> Infinity`, producing exactly two failures:

```text
ℹ tests 22
ℹ pass 20
ℹ fail 2

✖ s1585 live delta +4 refuses and names its four real unkeyed slugs
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
0 !== 1
actual: 0
expected: 1

✖ s1583 dot-separated live delta +22 refuses
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
0 !== 1
actual: 0
expected: 1
```

After restoration, the SHA-256 was again `53223da861a0f2ae51723cca767b6b761dd2b5116a25a475955d7a845f686176`, proving the file was byte-identical to the intended cure; the focused suite returned 22/22.

## Evidence

| Gate | Result |
|---|---|
| Citation checks after reset | `F-1586-1` = 1; advisory sentence = 1 |
| Independent histogram probe | 112 counted; exact histogram above; recent refusals exactly s1583/s1585 |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green; Vite **1.34s** |
| `node --test scripts/desk-carryforward-guard.test.mjs` | **22 tests / 22 pass / 0 fail / 0 skip** |
| `npm run test:ledger-guards` | root **145/145**, then findings-state, blocker-panel, ruling-propagation, citations, both desk leaves, archive/owed audits, three shell guard suites, and NUL audit all green |
| `law-pointer-guard` | did **not** red; no coordinate was rebased |
| `NODE_NO_WARNINGS=1 npm run test:node-guards` under `.nvmrc` Node 26.4.0 | **410 tests / 410 pass / 0 fail / 0 skip**, chained ticker/findings/blocker/ruling/desk/NUL leaves green |
| `git diff --check` | clean |

The first node battery used ambient Node 23.11.1 and correctly reddened the runtime contract, including the test whose diagnosis says `.nvmrc` pins 26.4.0. A pinned-Node rerun reached 409/410 because Node 26 emits an experimental `localStorage` warning to stderr in the cross-engine gr-sim arm. The final pinned run suppressed runtime warnings only; it changed no code or assertions and passed 410/410. This adjacent runtime-warning friction was deliberately not fixed outside the firewall.

At `test:ledger-guards` time, STATUS.md line 1 was the live **s1586 ACTIVE lock**, so both desk guards SKIPPED. That green read no live handoff and is not evidence for this cure; the fixture suite is. Main has since archived s1586's handoff, independently verified at **declared 24 / keyed 24 / delta 0**, so its first live evaluation should pass.

No Playwright was owed or claimed: this slice touched no `src/**`, `e2e/**`, simulation, system, or entity path.

## Adjacent findings deliberately not fixed

- Ambient Node 23.11.1 violates the repository's pinned Node 26.4.0 test-timeout semantics.
- Pinned Node 26 emits an experimental `localStorage` warning that one gr-sim assertion treats as stderr failure unless warnings are suppressed.
