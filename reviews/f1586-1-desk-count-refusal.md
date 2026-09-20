# F-1586-1 — live desk count refusal

## Slice

- Branch: `lane/a`
- Base/tip before runner auto-commit: `b8336f8568fea2e5d4f5c33e60ea7afb94092209`
- Verdict: **READY-FOR-GATES**
- Scope: live declared-vs-keyed refusal at tolerance ±1; the archived previous-desk mismatch remains advisory.
- Merge classification: main advanced to `6d1de0c746ae6b95a4e54dbd5aa3d4ad5e1cf793` during the run, but none of the three implementation/report paths moved on main. The slice is path-disjoint; no rebase or conflict resolution was attempted.

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

---

# DRAIN VERDICT — s1588

**MERGED `2bf54ebb1d681e5ceb5379d0a69464fd2b52fc98`.** §3.0 `drain-block-check` CLEAR before classification.

## Merge classification

Merge-base `b8336f8568fea2e5d4f5c33e60ea7afb94092209`. All four paths **LANE-TOUCHED / MAIN-MOVED: none** — proved, not assumed, with `git diff --name-only b8336f85 main -- <the four paths>` returning empty. No 3-way graft was owed and none was performed. `git log main..lane/a` is empty after the merge.

**Custody (§3.0b):** undecided content never entered main's working tree. The battery ran in a detached worktree at main's tip with lane/a's four blobs placed into it — which, main being untouched on all four, *is* the merge result. Main's post-merge `desk-carryforward-guard.mjs` hashes `53223da8…`, identical to the gated bytes.

## Evidence (merged tree, this fire)

| Gate | Result |
|---|---|
| `drain-block-check` | CLEAR |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green, **1.48s** |
| `node --test scripts/desk-carryforward-guard.test.mjs` | **22/22**, all seven specified arms (a)–(g) present |
| `test:ledger-guards` root | **145/145** |
| `test:ledger-guards` chained leaves | **12/12** green |
| `test:node-guards` | **410 tests / 407 pass / 0 fail / 3 skipped**, 427.8s, run ALONE |
| `law-pointer-guard` | did not red; nothing re-based |
| Playwright | **not owed and not claimed** — no `src/**`, `e2e/**`, `src/sim/`, `src/systems/`, `src/entities/`, so F-1460-1 does not bind |

The 3 node-guards skips are the fire-shell cross-engine arms, which annotate themselves as NOT coverage (F-1408-2). The runner saw 410/410 in a lane shell; the difference is the shell, not the tree.

## What I verified beyond the runner's report

**The red was manufactured in BOTH directions.** The runner probed only the loosening arm (`> Infinity` → the two defect arms fail `0 !== 1`), which I reproduced exactly. But that probe leaves the ±1 boundary unpinned from below: with tolerance disabled the s1533-protection arm still passes, so it discriminates nothing. I therefore also set the threshold to `> 0` — the zero-tolerance design s1533 refuted — and the protection arm reds alone (21 pass / 1 fail). So `> 1` is the *only* value that greens all 22: the tolerance is enforced by the suite from above and below, not merely described in a comment.

Restore verified byte-identical by sha256 (`53223da8…`) after each probe.

## Findings

**F-1588-1 (non-blocking, filed).** The first live desk this gate will ever evaluate is s1587's, and it reads **declared 27 / keyed 26 / delta +1** with **zero unkeyed segments** — 26 🔺 segments, 26 unique ids, no duplicates. So the +1 is a plain off-by-one in the declared number, notable only because s1587's own declaring commit message asserts "delta 0". It PASSES at ±1, which is the vindication: shipped at zero tolerance, this guard would have reddened the very next handoff over a counting slip. The corpus argument for ±1 was confirmed by live data within one fire of landing.

**F-1588-2 (non-blocking, filed).** The live-desk refusal is placed *before* the `dropped`/`silent` reporting and exits immediately. A desk that both miscounts by >1 and silently drops a carried item therefore reports only the count defect; the drop surfaces just on the next run, after the count is repaired. Both conditions exit 1, so no defect escapes the gate — this costs a round trip in diagnosis, not correctness. Not fixed here: it is a deliberate ordering choice inside the slice's own firewall and reordering it belongs to whoever next touches that site.

**Runner's adjacent finding did not reproduce.** The ambient-Node friction is a lane-shell property: this fire's shell is already Node **26.4.0**, matching `.nvmrc`, so the runtime-contract test and the `localStorage` warning arm both passed here with no suppression needed beyond the battery's own `NODE_NO_WARNINGS`. Recorded so a later reader does not chase a repo defect that is a shell difference.
