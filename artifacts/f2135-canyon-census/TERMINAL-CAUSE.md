# The wave-8 terminal has a cause: the rider goes down

**Fire:** s2145 · **Date:** 2026-08-21 · **Companion to:** `REPORT.md` (attempt 4, merged `59de9467f (archive: pruned by the A3 rewrite)`)
**Evidence:** `terminal-cause-s2145.json` (schema `goldrush.f2142.canyon-terminal.v1`, 0.72 MB, banked beside this note)

## What this supersedes

`REPORT.md` §4 records **`NOT ESTABLISHED`** for *"what ends the run at wave 8"*, and names the instrument that would answer it: *"a trace or sanctioned harness artifact that emits the terminal `run_ended` event and its `reason` before Gate B throws."* That verdict was correct **for the harness**, and attempt 4 was right to refuse to guess.

It is superseded here, not by building that instrument, but because **the instrument already existed**: `scripts/f2142-canyon-terminal-probe.mjs`, written during the s2142 investigation, re-runs the same leg through the same `HeadlessContractSim` loop and — instead of throwing at Gate B — reads the terminal state the harness discards. `REPORT.md` stands as written; this note adds the answer it could not reach.

## The answer

**`terminalCause: rider-down (dead)`.** The terminal view carries **`hp: 0`** at wave 8. The run does not end on a contract condition, a deadline, or a bank: `HeadlessContractSim.terminal` is `this.dead || this.secureChoice === 'bank'` (`src/sim/HeadlessContractSim.ts:1308` — the probe's header cites `:1331`, a rotted coordinate; the code is intact), and `defaultedSecure: 0` with `secured: false` leaves only `dead`.

Terminal `outcome()`, in full:

```json
{ "secured": false, "waves": 8, "timeMs": 259000, "gold": 95, "kills": 126,
  "calls": 540, "defaultedPicks": 6, "defaultedSecure": 0, "eventLogHash": "fnv1a32:fb21d525" }
```

Terminal view: **59 enemies alive of 185 spawned, 33 of them wreckers**, threat state `active`, edge `south`. Works standing **5 `sentry_beacon` + 2 `lantern_post`, 2 wrecked**. Hero hp first touches ≤20 at turn 341 (wave 7) and reaches 0 during wave 8.

⚠️ **That is the MECHANISM and it is where this note stops.** The established input (`artifacts/f2086-canyon-census/REPORT.md`) is that both branches require **all six** authored beacon sites; the run ends with five standing and two wrecked, 95 g in hand. **Whether that is under-defended play, an unaffordable rebuild loop, or a contract that cannot be held on this seed is a BALANCE question, and it stays reserved to the owner under `F-E2S-4`.** `failed: true` remains a measurement, not a verdict (F-2143-2). *This thread has already lost three attempts to confident readings of under-determined evidence — do not extend this one.*

## Controls run before the verdict was believed

1. **Same arrangement as the sanctioned harness, proven twice.** The probe was booted with `--search '?debug&contract=e3-canyon-works'`, byte-identical to the URL the cured harness builds at `scripts/gr-sim-campaign.mjs:17`. Empirically: the probe's 540 trace rows and the census's 540 rows agree on `wave`, `powered` and `failed` at **every single turn — 0 mismatches**. Same seed, same checkpoint, same player, same run.
2. **Not a stale-terrain artifact.** `Terrain.CLAIM_WIDTH/HEIGHT` read **96 × 112**, the canyon's authored claim — not the 64 × 64 fallback whose appearance was the whole of the cured `f2142-1` defect.
3. **The ground is not the obstacle.** All six authored beacon sites are `centreBuildable: true` and `centreWalkable: true` on this terrain; four have a fully buildable 2.5 wu admission disc (317/317 samples), the two rim sites 245/317.

## ⚠️ One field in that artifact LIES — do not read `terrainBinding.matchesRequestedContract`

The banked JSON reports `terrainBinding: { activeContractId: null, matchesRequestedContract: false }`. **That is false, and it is false on every run this probe will ever make.** `f2142-canyon-terminal-probe.mjs:115` destructures `ACTIVE_CONTRACT` from `/src/meta/ContractFamilies.ts`, which **does not export it** — it is a module-local `const` in `src/world/Terrain.ts:78` and `src/world/props.ts:6`. The destructure yields `undefined`, so `undefined?.id ?? null` is always `null` and the comparison is always `false`.

The block is the probe's own **control** — its header says it exists to decide *"whether the refusals are a fact about the contract or about the harness's URL"* — so the failure mode is the expensive kind: a reader taking it at face value concludes the terrain binding is still broken and **re-opens `F-2142-1`, a closed and cured finding**. The truthful binding evidence sits three lines away in the same object (`claimWidth`/`claimHeight`, control 2 above), which is exactly why this went unnoticed. Filed as **F-2145-2**; the two `claimWidth`/`claimHeight` fields are trustworthy and were the ones used here.

## Reproduce

```sh
node scripts/f2142-canyon-terminal-probe.mjs \
  --player scripts/f2135-canyon-census-player.mjs \
  --contract e3-canyon-works \
  --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json \
  --search '?debug&contract=e3-canyon-works' \
  --out /tmp/canyon-terminal.json
```

Read-only: writes nothing but its `--out`, mutates no shipped file, changes no player, contract, seed or harness. **`GATE C` is unchanged** — the probe takes the same pinned `benchSeeds[contract.id][0]`, so `e3-canyon-works-02` remains unmeasured.
