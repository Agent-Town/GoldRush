# lane-actor-building-clip — the head in the Complaints Desk house

**Slice:** `lane-actor-building-clip` (owner playtest complaint, 2026-08-03)
**Branch / tip:** `lane/m3` @ `722b7685c4dd852c26f614e615a8215ee54bc802`
**Base:** `053b2500b3554b6a0769aecab963793fa02c9616`
**Drained:** s1424, 2026-08-03
**Gated in:** detached scratch worktree `worktrees/gate2-s1424` on scratch port **5234** (§3.0b custody + Mistake #12 attribution hygiene — a lane runner was live on lane-c throughout)

## VERDICT: MERGE ✅

## What it does

Owner, verbatim: *"There is a person's head stuck in the Complaints Desk house."* Two authored
town-actor posts sat inside or against a building's **visual** (GLB) footprint rather than its
collider. The beauty-town shift had dropped sprite hover from ~0.08 to ~0.02 and added contact
grounding, so a clip that used to hover above notice now reads brutally at zoom.

The fix moves the two offending actors' posts **outward along their approach** — actor data
only, no building moved, sim untouched — by giving each a `portraitPost.offset` in
`src/town/townsfolk.ts` (**+2 lines, the entire source change**). It then adds the invariant to
`e2e/cast-motion-wiring.spec.ts`: **every** authored post and every loop waypoint must clear
**every** rotated visual footprint by ≥ 0.3u, plus four Assay Office evidence shots (default +
max zoom, desktop + 390px mobile) with the transient UI hidden.

The clearance helper rotates each building by its own approach yaw before measuring, so it
tests the footprint as *rendered*, not the axis-aligned box — which is the distinction the
complaint was about.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, no output |
| `npm run build` | green, `✓ built in 960ms` |
| Own spec, **desktop-chrome**, `--workers=1` | **2 passed (41.4s)**, rc 0 |
| Own spec, **mobile-chrome** (390px), `--workers=1` | **2 passed (41.7s)**, rc 0 |
| Adjacent suites (derived by grep on the changed symbols: `assay_clerk`, `portraitPost`, `actorOffsets`, `TOWN_ACTORS`) — `town-t5-townsfolk`, `en-02-e1-coverage`, `town-inhabitant-zoom` | **11 passed (55.6s) desktop, rc 0** · **11 passed (58.2s) mobile, rc 0** |
| Console / page errors | zero — the plaza spec asserts `expect(errors).toEqual([])` and it passed on both projects |
| Merge classification | `src/town/townsfolk.ts` + `e2e/cast-motion-wiring.spec.ts` + 8 PNGs, **all LANE-TOUCHED**; `git log 053b2500..main -- <both code paths>` is **empty**, so main never moved either — no graft, no conflict |

### The invariant was proved RED against the pre-fix posts

Reverting **only** `src/town/townsfolk.ts` to main and re-running the new test in the same
worktree, same shell:

```
✘ every authored town actor post clears every visual building footprint (3ms)
  Error: elder post (-7.85, 5.35)
  expect(received).toBeGreaterThanOrEqual(expected)
  Expected: >= 0.3
  Received:    0.15771814295707465
rc 1
```

That `0.1577` matches the runner's census figure for the Elder to four decimals, from an
independent execution — the guard measures the thing the census claimed, and the guard is not
merely decorative.

⚠️ **One honest caveat about that red, worth stating rather than letting a reader over-read it:**
`expect` throws on the **first** violating actor, so the RED names only the Elder. The Assay
Clerk — the actor the owner actually photographed, and by the census the worse offender at
**0.031u** — never gets measured in that run, because the assertion above her disables
everything after it. The guard is still correct (it cannot pass while any actor violates), but
its *output* under-reports the damage. Not a defect worth a corrective; recorded so nobody
later reads "one actor was RED" as "one actor was broken".

### Clearance census (runner-produced, spot-checked against my own RED)

| Actor | Post (before → after) | Nearest visual face | Clearance |
|---|---|---|---|
| **Elder** | (-7.85, 5.35) → (-6.72, 4.95) | Schoolhouse side/corner | **0.158 → 0.343** |
| **Assay Clerk** | (8.35, 5.50) → (7.00, 3.40) | Assay Office side/corner | **0.031 → 0.560** |
| Tavernkeeper / Storekeeper / Preacher / Schoolteacher / Youngsters / Newsie / Prospector | unchanged | — | 0.315 … 2.303, all already clear |

Only two of eleven were offenders; the other nine were left alone. No renderer change was
needed — existing sprite depth testing already occludes actors behind walls correctly.

### In-game review (Mistake #10: where does the PLAYER see this, in a plain boot?)

Screenshots read by this fire, not merely referenced. `artifacts/town-actor-building-clip/before/`
vs `artifacts/town-zoom/`, max zoom, both projects: **before**, the clerk stands at the office's
edge with her torso overlapping the porch posts and wall; **after**, she stands in open ground
beside the doorway, whole and framed by the building rather than inside it. Mobile shows the same
at 390px with the stick zone clear. This is the plaza a player walks into on a plain boot — no
`?debug` involved.

## Findings

**F-1424-4 (🟡 non-blocking, for the next fire's attention — NOT this slice's defect).** The
runner's report flagged `town-t5`'s fixed-key approach-bark test as *"nondeterministic: 9/10
passed… failed on desktop and passed on mobile"*, and an unrelated first-claim expectation as
reproducing against untouched `HEAD`. **Neither reproduced here: `town-t5-townsfolk.spec.ts`
went 5/5 on both projects, including the approach-bark case.** The single controlled difference
is `--workers=1` (§3.1 / F-1270-1): the runner gates in the **lane** shell at full parallelism,
this fire gated serially. That is one more datapoint that the lane shell manufactures
timing reds the fire shell does not — but it is a *lane*-side observation and §3.1's measured
finding runs the other way (fire shell starved at high worker counts), so it deserves its own
measurement before anyone concludes anything. Filed, not acted on.

## Merge

Path-scoped: `src/town/townsfolk.ts`, `e2e/cast-motion-wiring.spec.ts`, and the 8 evidence PNGs
under `artifacts/town-actor-building-clip/before/` and `artifacts/town-zoom/`. Main's working
tree carried unrelated `logs/` + `artifacts/` churn throughout; none of it was staged.
