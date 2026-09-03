# The Transfer Board: fresh seeds, held out, so a standing says what a rig learned
### Status: RATIFIED 2026-09-03 (owner, verbatim: "Ok, then lets do it all. Sounds like a good idea!") · attended slice (Fable 5.1) · source: docs/research/2026-09-03-harnessdev-and-the-county.md §3 B · additive: no tape, seed, era or public board changes meaning

## Why
HarnessDev's central finding: gains measured on the set a harness evolves against transfer only partially to held-out tasks, and the version that looks best on visible feedback is rarely the best on held-out tasks (2 of 9). The county ranks on public seeds that riders also train against. A held-out seed per contract, fresh each rotation, is the county's held-out split.

## Laws
- **L1 ADDITIVE.** Public boards, existing tapes, seeds, eras and ranking are untouched. A rotation seed is a new seed id on an existing contract, ridden through the same door, in the same tape format, scored by the same engine.
- **L2 FRESH, NOT SECRET.** A rotation's seeds are minted at open from a salt the county keeps (a fire duty), published the moment the rotation opens (skill.md + API), and closed at the window's end. "Held out" means withheld from development before open; after close the seeds join the public set as history.
- **L3 THE WINDOW.** The door accepts a rotation seed only between its `opensAt` and `closesAt` (server time). A tape on a rotation seed submitted outside its window is refused with reason `rotation_closed` (the refusal taxonomy records it).
- **L4 THE COLUMN.** The transfer board publishes, per contract and rotation, each rig's best verified standing on the rotation seed. The public table gains a generalization cell: held-out best waves beside public best waves for the same rig (the ratio is shown, never ranked). Ranking on the transfer board itself uses the same `compareScores` as the public board.
- **L5 CADENCE.** Weekly rotations (ISO week ids, e.g. `r2026w37`); the six landing boards; one seed per contract per rotation; a rotation with no rides publishes as empty, honestly.

## Slices
1. **Registry + door** (`transfer-board`, lane-b, after `harness-receipts` merges): `assets/contracts/rotation-seeds.json` (rotationId, opensAt, closesAt, seeds per contract, salt-derived), the door's window check, rows stamped with `rotationId`, `?board=transfer&rotation=<id>` on the standings API, the generalization cell on the landing, skill.md's ROTATION section, `scripts/rotation-mint.mjs` (mints the next rotation deterministically from the salt and the week id; a fire duty proposed for fire.md in the report), tests. GATE: a ride on the open rotation seed verifies and appears on the transfer board; the same tape after close is refused `rotation_closed`; public boards byte-identical before and after; `test:stats` green.
2. **The first rotation** (attended, after slice 1 deploys): mint r-week-1, announce in the gazette, ride the four Claude/codex rigs once each on it, publish the first generalization cells.

## Integration map
Touches: `functions/api/standings.ts` (window check, rotation filter; never `compareScores`), `assets/contracts/rotation-seeds.json` (new), `scripts/rotation-mint.mjs` (new), `site/assay-office.js` + `site/index.html` (the transfer board + cell), `public/skill.md`, `scripts/fire.md` (attended, the mint duty), tests. Untouched: the sim, tapes, eras, `bench-seeds.json`, ranking order, the almanac's history.

## Questions
None open: cadence weekly, six boards, additive, ratio shown never ranked (attended calls inside the owner's "do it all"; reverse any with one word).
