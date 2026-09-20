# e3-voltage-socket — make Blackout Ridge's current agent-visible (cures F-ER01-E3-1)

**Slice:** `lane-e3-voltage-socket` (era-socket class #2, after `lane-e2-pressure-socket` / `6fd24a3b`)
**Branch / tip:** `lane/a` @ `fa131a8c` ("vsock: make Blackout Ridge current agent-visible")
**Merge:** `9af152ab4c25802a649c1147fd013ed540f306cb` (`--no-ff` onto main @ `e7e414d7 (archive: pruned by the A3 rewrite)`)
**Drained:** s1467 fire, 2026-08-06
**Master:** `tasks/lane-e3-voltage-socket.md` (FIRE-AUTHORED s1466) · **Goal leaf:** `e3-voltage-socket`

## VERDICT: MERGE — gates green on the merged tree, scope held exactly, retention obeyed.

## What it does

`HeadlessContractSim` now runs the **production** `PowerGraphSystem` and samples the locked
`DayNightCycle` for contracts whose twist carries `powerGrid` + `dayNightCycle` — which today is
`e3-blackout-ridge` alone. The manifest derives its vocabulary **from those consumers**: the existing
`BUILD capacitor_bank` grammar, `REPAIR_UNDER` for authored trunk frames, deterministic current
allocation across intact wires and online nodes, the two 0.05 Wh stores, and the locked cycle's
0.645–0.86 darkness band.

**Zero new operations were invented.** The master's honesty clause said explicitly that "the
vocabulary is honest" beats "the vocabulary is long", and the slice took that branch rather than
minting levers to look complete — the census line records it plainly: *"No new operation was added."*

Blackout Ridge therefore enters `SUPPORTED_CONTRACTS` and the E3 census moves **AGENT-READY 0 of 4 →
1 of 4**. The other three contracts stay rejected on their own stated grounds.

## Evidence (measured on the MERGED tree, in a detached worktree — §3.0b custody)

Gated in `gate-s1467/` (`gate/s1467`, merge `c621f781`), never in main's working tree, so nothing
undecided was ever exposed to a concurrent writer. Scratch dev server on **port 5231** with
`GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL` — lane-b was live throughout and 5188 is
`strictPort`, so the gate could not contend with it (Mistake #12).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npx vite build` | **green**, built in 1.35s |
| `npm run test:node-guards` | **rc=0** — mandatory here, the slice touches `src/sim/` (F-1460-1) |
| ↳ `scripts/gr-sim.test.mjs` (Baron pin) | **held** — the slice moved no cross-cutting sim number |
| ↳ `nul-audit` (final leaf) | **CLEAN** |
| `e2e/er01-e3-census.spec.ts` (own spec) | **8 passed / 53.2s**, desktop + 390px, `--workers=1` |
| `er01-e2/e4/e5/e6-census.spec.ts` (adjacent) | **32 passed / 1.7m** — E2's numbers did NOT move |
| console/page errors | **zero** — the census spec asserts captured `console.error`/`console.warn` |

All playwright runs used `--workers=1` (§3.1 — a fire-shell default-worker run is a known-unreliable
instrument, not evidence).

## Merge classification

Base `e7e414d7 (archive: pruned by the A3 rewrite)`; one lane commit; **no conflicts**, `ort` clean in both the gate worktree and main.

| File | Class |
|---|---|
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED (57 of 66 added lines absent from main) |
| `src/agent/MechanicsManifest.ts` | LANE-TOUCHED (47 of 55) |
| `e2e/er01-e3-census.spec.ts` | LANE-TOUCHED (91 of 103) |
| `docs/bench/e3-readiness-census.md` | LANE-TOUCHED (9 of 10) |
| `tasks/BACKLOG.md`, `tasks/goals.json` | BOTH-MOVED — the lane appended its receipt while this fire appended F-1467-1/-2; auto-merged cleanly, both sets of lines present |

## Findings

**F-1467-3 (non-blocking, informational — for whoever authors the next E3 socket).**
The census's remaining three findings are **not** independently authorable right now, and the reason
is file-level rather than design-level: E3-2 (Moth Season), E3-3 (Canyon Works) and E3-4 (Fairground)
each need `src/sim/HeadlessContractSim.ts`, `src/agent/MechanicsManifest.ts`,
`e2e/er01-e3-census.spec.ts` and `docs/bench/e3-readiness-census.md` — **the same four files this
slice just rewrote**. s1467 measured that collision live: while this slice was still running on
lane-a, `lane-usable` reported exactly those four as its tracked dirt. Authoring E3-2 in parallel
would have produced a four-way conflict on an unmerged base.

➡️ **They are sequenced, not blocked.** With this merge landed the next socket is authorable
immediately, and E3-2 remains the cheapest (its `src/systems/MothSwarm.ts` is present and its twist
is `mothSeason` + `dayNightCycle`, the second half of which this slice has now socketed). **E3-4 still
needs its missing crowd objective authored on its own governed surface first**, per the census — that
part is unchanged by this merge.

**No blocking findings.** The slice held its firewall exactly: it did not touch `src/game/Game.ts`,
did not touch Balance values, and left F-ER01-E3-2/-3/-4 alone while reporting on them.

## Retention

The original F-ER01-E3-1 text is **retained verbatim** as a blockquote under a ✅ CURED banner rather
than being overwritten — the Retention Law's requirement, and the slice did it unprompted.
