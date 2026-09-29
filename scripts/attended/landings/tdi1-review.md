**Slice / branch / tip:** `e7-tape-drawer-inheritance-1`, lane-a `sol/open-findings-astra`, four commits (attempt 1 `0d7949951` + `3614d705a`, attempt 2 `39f42724e` + `f1a4fb214`), Astra gpt-6-astra, 234,073 tokens in all, 2026-09-28 06:58Z to 07:31Z. Attended pinned landing under `land-held.sh`, after the music toggle (pinned landings one at a time); the fires' diff-selected wrapper cannot finish a `src/**` landing's full Node battery (F-2737-1).

**What it does.** Closes F-SPH2-2: since `7c2744e5a` (2026-09-12) a `?contract=` boot took the contract's epoch for everything, so a profile that had reached the Signal Era lost its Tape Reel on every earlier map. One exported helper in `src/meta/ContractFamilies.ts` returns the campaign epoch's order for a contract boot when it is the higher; the mount at `src/game/Game.ts:1925` uses it. Explicit `?epoch=` previews (the debug boots the spec's `open()` helper uses) keep the previewed map's own state, which is what the acceptance spec encodes and what attempt 1 had missed. `activeEpochId()`'s map-content semantics are unchanged; no gameplay or sim change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| `e2e/e7-playbook-surface.spec.ts` ("the tape drawer arms at the Signal Era and remains inherited afterward"), both projects | exit 1 → 0; 4 of 4 passed; the spec untouched |
| Plain-boot probes | 2 of 2: a fresh E6 profile has no drawer; an E7 profile keeps it on E1 and E6 maps with the correct map epochs |
| Adjacent (the audit spec, m2-01, task-025 and the rest of the task's list) | 26 of 26 |
| tsc / build / console and page errors | green; zero errors in the checked boots |
| Evidence | 1,156,332 B kept in the tree; the first attempt's 577,200,597 B of traces and results moved to `~/.goldrush/evidence/e7-tape-drawer-inheritance-1/` |
| tsc / release build / payload / halo / null floors / release suite / the four specs / ledger battery / pin | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New: `artifacts/e7-tape-drawer-inheritance-1/**` (compact). Lane-touched: `src/game/Game.ts` (the mount condition), `src/meta/ContractFamilies.ts` (one exported helper). `src/**` changed: `hash: pin`, measured last. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-SPH2-2 closed** by this landing.
- **Attempt 1 read the spec as contradictory** (the E7-seeded profile's E6 preview expecting no drawer); it was not: the spec distinguishes an epoch preview from a contract boot. Recorded in the task's attempt-2 paragraph; no new finding.
- **Owner's desk:** nothing new.
