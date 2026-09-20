# AP-07 GR-SIM evidence

Command:

```sh
node scripts/gr-sim.mjs --contract e1-dry-gulch --seed bench-001 \
  < artifacts/gr-sim/ap-07/bench-001-orders.jsonl
```

The runner advances at a fixed 1/30-second timestep, uses the production
simulation systems without `WebGLRenderer` or DOM ownership, reads exact
Standing Orders JSON arrays, and emits exact `goldrush.view.v1` JSON at each
wave boundary and surprise. It fails closed for contracts other than
`e1-dry-gulch`; adding another contract requires its real objective driver.

## Determinism

- Run A stdout: 7 lines, 13,678 bytes
- Run B stdout: 7 lines, 13,678 bytes
- `cmp` result: byte-identical
- SHA-256, both runs:
  `63f42fac6a07b14666d885627dd37508bd30eab6babb68477e829943314129f5`
- Run A speed: 1.57 waves/s
- Run B speed: 1.61 waves/s
- Outcome:
  `{"secured":false,"waves":4,"timeMs":135667,"gold":4,"kills":37,"calls":5,"eventLogHash":"fnv1a32:3d75c580"}`

The full stdout is in `bench-001-transcript.jsonl`; the five stdin calls are
in `bench-001-orders.jsonl`. The final View contains the `hero_down` surprise,
`needsRider: true`, one production-built palisade, and one wrecker.

`--policy=idle` also completed without waiting for stdin at 1.66 waves/s:

```json
{"secured":false,"waves":4,"timeMs":140633,"gold":0,"kills":39,"calls":0,"eventLogHash":"fnv1a32:f335e4fc"}
```

## Gates

- `npx tsc --noEmit`: pass
- `git diff --check`: pass
- `node --test scripts/gr-sim.test.mjs`: 1/1 pass
- `npm run test:node-guards`: 157/157 pass, including GR-SIM
- `npm run build`: pass; 2,164 modules; asset-diet gate pass
- `npm run test:release -- --workers=1`: 26/26 pass across desktop and
  mobile-390, including zero console/page errors
- M1/M2/M3 core (`m1-01`, `m2-01`, `m3-01`): 30/30 pass across desktop and
  mobile-390

The exhaustive unmodified `m1-*`, `m2-*`, `m3-*` board was also run:
205/222 passed. The 17 inherited failures were in m1-03 grace, m1-06
investment/upgrade HUD, m2-03 knee budget, m2-04 thief palisade finiteness,
m2-05b lull floor, m2-06 turret LOS, and m2-07/m2-07b combat pressure.
An isolated rerun of those lines produced 1/20 pass, confirming the existing
red fingerprint rather than a GR-SIM seam: all browser-facing edits are
no-`document` guards, while the new runner is not imported by browser code.

An independent uncommitted-diff review found fake cross-contract objective
handling, duplicated building simulation, incomplete thief/wrecker contexts,
and an unregistered regression test in the first draft. The final version
fails closed to Dry Gulch, reuses the production BuildSystem and enemy
contexts, and registers its one deterministic check in `test:node-guards`.


---

## SUPERSEDING NOTE — appended 2026-08-01 (s1316 drain of `ap-07-the-claim-pin-lift`, merge `38b20154`)

The sentence at line 14 above — *"It fails closed for contracts other than `e1-dry-gulch`; adding another
contract requires its real objective driver."* — was **true of this run** and is **left verbatim** per the
Retention Law. It is recorded here as **SUPERSEDED**, not corrected, because two later readers found the
second clause misleading and a third measured why.

- **First clause, still true in kind:** GR-SIM still fails closed. The pin is now a SET rather than a
  constant (`SUPPORTED_CONTRACTS`, `src/sim/HeadlessContractSim.ts:34`), and the throw **enumerates its
  members**, so the message cannot go stale the way this sentence did.
- **Second clause, FALSIFIED for `the-claim`** (F-1314-5, s1314, by running the sim rather than reading
  about it): `the-claim` needed **no new objective driver at all**. Its objective is data —
  `twist.secureWave: 10` — and `startWave` already read that field with no contract branch. It was
  admitted by moving the pin and nothing else.
- **Second clause, still TRUE for `e1-twin-banks`** (F-1314-5b): its `twist` declares only
  `secureWave: 20` while its briefing promises *hold both banks*, so the stated objective has no
  machine-readable form. Admitting it means inventing a loss mechanic — a design fork, **owner-gated**,
  not a pin-lift.

**Why this note exists** (F-1314-2, s1314): the sentence stated one undifferentiated rule over two
contracts whose answers are opposite. s1312 read it and inferred a cheap pin-lift; s1313 read it and
inferred heavy driver work; **both were right about one contract and wrong about the other, and neither
could have got the full answer from it.** This run's *measured* content — determinism, byte-identical
replays, the hashes — has held up perfectly under every re-check since, including two independent
reproductions of `fnv1a32:3d75c580`. Only the one generalising sentence ever cost anything.

Appended rather than edited because F-1314-2 asked for this sentence to be replaced while the pin-lift
master firewalled the file as **NO** (an artifact records a past merge; editing it falsifies the ledger).
Both instructions were correct; the Retention Law's own pattern — supersede, never delete — is what
satisfies them together.

💡 **Prose in an evidence artifact inherits the credibility of the numbers beside it.** Keep the numbers;
qualify the prose in place, at the bottom, dated — never by editing the record.
