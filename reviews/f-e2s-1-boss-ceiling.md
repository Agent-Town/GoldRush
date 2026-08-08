# Review — f-e2s-1: the boss fight fits inside the door

- **Slice:** f-e2s-1 boss-ceiling (`tasks/lane-fe2s1-boss-ceiling.md`, done-move `20260808-074109-lane-fe2s1-boss-ceiling.md`)
- **Branch/tip:** `lane/d` @ `ed9a0398c` (runner auto-commit), base `866f6aaa4`
- **Merged to main:** `c732d2c40568bfba48e702bc36057dfcd4418f5d` (s1544 fire, 2026-08-08)
- **Gated in:** detached worktree `gate-s1544` (§3.0b custody — a concurrent attended session was committing to main throughout this drain)

## Verdict

**MERGE.** Both defects the master named are cured, the cure is confined to the four firewall
files, and the highest-risk surface — the pinned Baron outcomes — is proven unmoved.

## What it does

Securing a baron contract headless requires killing the boss group, but the wave ceiling was
`secureWave + 2` and it **threw** — exit 1, no outcome line. On `e2-hill-mine` the boss lands at
wave 12 against a ceiling of 14: a two-wave kill window. On `e3-canyon-works` and `e4-dust-flats`
the boss lands *at* the ceiling, so those contracts were unsecurable headless by arithmetic. This
is why the county board carries zero E2+ agent standings — the door could not finish the contract.

Two changes. (a) The ceiling becomes `max(secureWave, baron.wave) + BOSS_GRACE_WAVES` (6) when the
twist has a baron, unchanged `secureWave + 2` otherwise — mirrored in `gr-sim.mjs:63-66` and
`HeadlessContractSim.ts:48/451` so neither truncates the other. (b) The throw becomes a lawful
terminal outcome: the sim emits its normal terminal view, then the normal outcome line with
`secured: false` and one extra field `endReason: "wave-ceiling"`, **exit 0** — a loss is a result,
not an error.

`endReason` is spliced conditionally (`gr-sim.mjs:89`, `...(endReason ? { endReason } : {})`), so
non-ceiling outcomes stay byte-identical. That is the property the pins below actually test.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npm run build` | rc=0, vite built in 1.18s, asset-diet within ceilings |
| `node --test scripts/gr-sim.test.mjs` (slice's own suite) | **13/13 pass, 0 fail**, 100.4s |
| `npm run test:node-guards` (F-1460-1, mandatory — slice touches `src/sim/`) | **rc=0, 0 fail, 3 skipped**, 226.0s |
| Manual probe `--contract e2-hill-mine --seed e2-hill-mine-01 --policy idle` | **exit 0**, outcome is the final stdout line |
| `public/skill.md` section isolation vs f-door-1 | verified — see below |

Probe outcome line, verbatim:

```json
{"secured":false,"waves":18,"timeMs":540000,"gold":0,"kills":125,"calls":0,"eventLogHash":"fnv1a32:02f9b952","endReason":"wave-ceiling"}
```

`waves: 18` = 12 + 6, i.e. the boss-grace ceiling, not the old 14. Exit code measured separately
via `spawnSync` (`status=0, signal=null`) rather than read off a pipeline, since a `| tail` would
have reported the tail's status.

### Pin stability — the part that mattered

F-1460-1's lesson is that a slice-local suite cannot see a cross-cutting sim pin, and this slice
edits Baron ceiling arithmetic, which is exactly the pin-moving class. Every pin held:

```
✔ the E2 Baron fights keep their pinned outcomes (13679.19ms)
✔ the Baron driver runs the declared fight and keeps medal writes off headless (14837.52ms)
✔ the Claim driver consumes declared water and posts RunManager secure at wave 10 (5480.67ms)
✔ gr-sim places Night Shift fixtures from the contract (14650.25ms)
✔ Twin Banks consumes its declared crossings and build zones before securing at wave 20 (19307.32ms)
✔ the frozen Claim environment rows equal the five pinned bench seeds (0.53ms)
✔ gr-sim ends an idle Baron run at its grace ceiling (5144.13ms)   ← new, scope 3
```

The runner independently reports the same suite green on **both** Node engines the bench law names
(v23.11.1 13/13, v26.4.0 13/13) and the skill.md guard 5/5. This drain re-measured v23.11.1 only;
the v26.4.0 arm is the runner's evidence, not re-derived here.

### New ceiling per boss contract (runner's table, unmodified)

| Contract | Secure | Boss | New ceiling |
|---|---:|---:|---:|
| e1-baron | 20 | 20 | 26 |
| e2-hill-mine | 12 | 12 | 18 |
| e2-trestle | 12 | 12 | 18 |
| e2-incline | 12 | 12 | 18 |
| e3-canyon-works | 12 | 14 | 20 |
| e4-dust-flats | 12 | 14 | 20 |
| e5-deepwater-claim | 12 | 1 | 18 |
| e6-glow-mesa | 12 | 8 | 18 |

## Merge classification

Base `866f6aaa4`; main had moved **7 commits** by merge time. Four paths, all inside the firewall:

| File | Class | Resolution |
|---|---|---|
| `scripts/gr-sim.mjs` | LANE-TOUCHED | clean, main never moved it |
| `scripts/gr-sim.test.mjs` | LANE-TOUCHED | clean, main never moved it |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED | clean, main never moved it |
| `public/skill.md` | **BOTH-MOVED** | auto-merged by `ort`, verified by reading |

`public/skill.md` is the one that needed care. s1543's handoff warned that three lanes would land
on this one doc file and ordered serial drains with per-diff section isolation confirmed. f-door-1
merged first (`99f0d60a4`, attended, adding the cost-curve sentence); this slice rewrites the
ceiling sentence at `:34`. Post-merge both are present and in their own sections — `:34` carries
the `wave-ceiling` text, `:93` carries f-door-1's `costRule: "ceil-to-5"` text. Neither file was
re-flowed. **The serial-drain concern is discharged with evidence, not assumed.**

## Findings

- **F-1544-1 — OWNER, non-blocking (scope 5, the master asked for a report, not a fix).**
  Canyon Works and Dust Flats spawn their bosses at wave 14 against secure wave 12. The grace
  ceiling now makes both finishable (ceiling 20), so nothing is broken — but the fight still
  *starts* two waves after the contract's secure wave, which is a balance/design intent question
  no gate can answer. No contract JSON was touched. **REC: accept as-is** — the arithmetic bar is
  gone, and a two-wave delay reads as deliberate pacing rather than a defect. One owner word closes it.

- **F-1544-2 — CLOSED IN THIS DRAIN, recorded because it explains two false dones.**
  `mp-07a` and `mp-07b` both STOPPED at their lane-safety pre-flights (88,105 tokens across the
  two, zero files touched) because `lane/b` held undrained f-door-1 and `lane/d` held undrained
  f-e2s-1. Both were done-moved into `tasks/done/` looking like completions — Mistake #1's shape.
  f-door-1 merged at `99f0d60a4` and f-e2s-1 merges here, so **both blockers are now cleared** and
  both masters are re-queued by this fire. The guard behaved exactly as designed; it protected
  this slice's 41 lines from a `reset --hard`. No cure owed.

## Non-blocking notes

- The runner reports an independent review caught a non-terminal `held` view mid-implementation and
  fixed it so the existing verifier receives its `rider-down` terminal sentinel *before* the
  truthful `wave-ceiling` outcome. Visible in the probe output above (appendLog wave 18 is
  `rider-down`, the outcome line is `wave-ceiling`) and consistent with scope 2.
- Node-only slice; no rendering surface, so no screenshots and no browser boot probe. The master
  says so in as many words ("Zero console errors n/a (node-only)").
