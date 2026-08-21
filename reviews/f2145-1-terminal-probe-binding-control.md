# f2145-1 — the terminal probe's terrain control stops lying

**Slice:** `f2145-1-terminal-probe-binding-control` · **branch:** `lane/b` · **lane tip:** `1a9f35183`
**Base:** `cddff2050` · **merge:** `fe1bbeaa4b07a753b8607df96ac03f70ddb1eacd` · **drained:** s2146, 2026-08-22
**Master:** `tasks/f2145-1-terminal-probe-binding-control.md` (authored s2145 from F-2145-2)

## VERDICT: MERGED

The cure is correct, it is firewalled exactly as ordered, and its guard has teeth I proved
myself rather than inherited. One red in the cross-cutting battery; it is F-2143-4, inherited,
controlled at pre-merge main **before** this merge existed.

## What it does

`scripts/f2142-canyon-terminal-probe.mjs` carried a terrain control that could only ever say one
thing. It destructured `ACTIVE_CONTRACT` out of `/src/meta/ContractFamilies.ts` — a symbol that
module **never exported** — so the binding was `undefined`, and the comparison
`(ACTIVE_CONTRACT?.id ?? null) === args.contract` collapsed to a confident-looking, permanent
`false`. Four census attempts leaned on a control that was structurally incapable of agreeing
with them.

The cure rebuilds the control on symbols that actually exist, and makes the failure mode loud:

- `CLAIM_WIDTH` / `CLAIM_HEIGHT` are read from the `/src/world/Terrain.ts` namespace, which binds
  them from `ACTIVE_CONTRACT.tileParams` at **module-evaluation** time — the real question the
  control was always trying to ask.
- `contractDimensions` comes from the already-resolved `contract.tileParams.dimensions`.
- Every one of those reads is followed by an explicit `undefined` **throw**. A cross-module
  `undefined` can no longer flow into a comparison and be reported as a definite answer.
- `matchesRequestedContract` is now a real dimension comparison, and `activeContractId` is
  reported as `null` when it does not match rather than being asserted from a phantom binding.
- Report schema bumped `goldrush.f2142.canyon-terminal.v1` → `.v2`, so a consumer cannot silently
  read a v2 control as a v1 one.

`scripts/canyon-terminal-probe-binding.test.mjs` (new, 34 lines) parses the probe for every symbol
destructured out of an `ssrLoadModule(...)` call — both the direct form and the `Promise.all` form —
and asserts each is exported by its source module. Rooted into `test:node-guards` in `package.json`
in the same commit, so `gate-caller-audit` does not red it as an un-rooted gate.

## Evidence — measured on the merged tree in detached `gate-s2146` (§3.0b)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, clean |
| `npm run build` | rc 0, `✓ built in 1.23s` |
| `canyon-terminal-probe-binding` (slice's own guard) | **1 pass / 0 fail** |
| `gate-caller-audit` | **PASS** — every gate-shaped subject reached or grandfathered; 3 owner escalations, **unrouted: 0** |
| `test:node-guards` (cross-cutting, run ALONE) | **492 tests · 486 pass · 1 fail · 5 skipped · 493.4 s** |
| Guard teeth, manufactured by the drain | red rc=1 → restored green rc=0 (below) |
| e2e / screenshots | **not owed** — no `src/**`, no render surface, no player-facing change |

### The single red is inherited, and was controlled before the merge existed

`same-game report exemption reasons and citations match source` →
`stale exemption reason for 'e2-incline'`. **This is F-2143-4**, open since s2143.

- **Structure:** the guard reads only `docs/bench/same-game-audit.md` and
  `CONTRACT_ADMISSION_EXEMPTIONS`. This merge touches **neither** — its three paths are
  `package.json` and two `scripts/*.mjs`.
- **Control:** a separate detached worktree `ctl-s2146` at **pre-merge** `7b2e2a698` ran the guard
  standing alone → **2 pass / 1 fail**, same test, same message verbatim. That control was taken
  *before* this merge was created, so it cannot be an artifact of it.
- **Not cured here**, deliberately: see F-2146-1 below. The regeneration already exists,
  uncommitted, in main's working tree under a concurrent writer.

### Guard teeth — proved by manufacturing the defect, not by watching a green

A passing guard never executes its violation path, so its green is not evidence about its red
(the s1299/s1300 standard). The runner pasted a red; I reproduced one independently, on a scratch
copy via the guard's own `CANYON_TERMINAL_PROBE` env override, so the real probe was never touched:

```
REAL binding      : { listBoardContracts } <- /src/meta/ContractFamilies.ts
MANUFACTURED      : ACTIVE_CONTRACT re-added to that destructure (scratch copy only)
MANUFACTURED RED  : rc=1 | AssertionError: ACTIVE_CONTRACT is not exported by /src/meta/ContractFamilies.ts
RESTORED GREEN    : rc=0 (pass 1 / fail 0)
real probe untouched: true
```

That is the F-2145-2 defect exactly, re-created and then re-cured.

### The runner's own control, and why I did not re-run it

The runner's report pastes both arms of the acceptance criterion — the whole point of the master
was that a control which cannot be made to say **both** things has not been fixed:

```json
{"activeContractId":"e3-canyon-works","claimWidth":96,"claimHeight":112,"contractDimensions":{"width":96,"height":112},"matchesRequestedContract":true}
{"activeContractId":null,"claimWidth":64,"claimHeight":64,"contractDimensions":{"width":96,"height":112},"matchesRequestedContract":false}
```

The two arms are internally consistent and diagnostic: the bare-`?debug` arm resolves Terrain
against the default **64×64** claim while the contract still declares **96×112**, which is exactly
the mismatch the control exists to detect. I did **not** re-run it: the probe spins its own vite
server and replays a full census leg (two arms ≈ the cost of a census run), and the binding claim
it rests on is independently established above by the guard plus the manufactured red. Recorded as
a deliberate scope call, not an oversight — a fire with budget may re-run it for a third
confirmation.

## Merge classification

Base `cddff2050`. `main..lane/b` = 1 commit (`1a9f35183`). All three paths **LANE-ONLY** —
`lane-usable.mjs` reported `paths=3`, every one of them `HELD LANE-ONLY`, main had moved none.
**No conflicts, no graft.** `main..lane/b` empty after the merge.

| path | classification |
|---|---|
| `package.json` | LANE-ONLY (1 added line — the guard prepended to `test:node-guards`) |
| `scripts/canyon-terminal-probe-binding.test.mjs` | LANE-ONLY (new file, 30 added lines) |
| `scripts/f2142-canyon-terminal-probe.mjs` | LANE-ONLY (20 of 23 added lines absent from main) |

Merged and committed as **one act**, never staged (§3.0b / F-1589-5). Main's working tree carries
a concurrent writer's dirt throughout (`artifacts/`, `logs/`, `docs/bench/`, `assets/contracts/`,
`scripts/assay-replay.mjs`) — **none of it mine, none of it touched, none of it added.**

## Findings

**F-2146-3 (non-blocking, no cure owed — a note on the guard's denominator).** The new guard
matches the **destructure-of-`ssrLoadModule`** shape. The cure itself also reads
`const { CLAIM_WIDTH, CLAIM_HEIGHT } = Terrain;` at `:115`, where `Terrain` is a **namespace**
bound at `:109` — a shape the guard's two regexes do not cover. This is **not a hole**, because
that path is defended by the explicit `undefined` throws the master ordered, and defence-in-depth
is the better answer here than widening a regex. It is recorded so a later reader does not assume
the guard is universal over the probe's cross-module reads, and so nobody "simplifies" the throws
away believing the guard has them covered.

**F-2146-4 (non-blocking, process — the runner's red COUNT was contention, and running the battery
alone is what showed it).** The runner reported `471 pass, 7 fail, 1 cancelled` and attributed the
reds to "inherited/environmental … contention-driven child timeouts". Run **alone** on the merged
tree, as `fire.md` §3 requires, the same battery returns **486 pass / 1 fail / 0 cancelled**. The
runner's *attribution* was sound; its *count* was inflated 7× by the load it was running under.
Two consequences worth carrying: a runner's red count is not a fingerprint and must never be
inherited as one (Mistake #4); and the "run it ALONE" rule earns its cost here in exactly the way
F-1537-1 predicted — six of seven reds evaporated with no code change.

**Battery drift, recorded not filed.** 492 tests / 493.4 s here, against F-2099-1's
**472 / 404.7 s** at s2099. The sequence is now 284 → 363 → 424 → 472 → **492** tests and
55.6 → 181.3 → 280.9 → 404.7 → **493.4 s**. It only ever moves up; budget **≥9 min** for this
battery now, not the 8 the s2145 handoff advised.

## Where does the PLAYER see this, in a plain boot?

**Nowhere, and that is correct.** This slice touches no `src/**`, no render surface and no
contract data — it repairs a fire-and-lane *instrument* and adds a guard over it. No GZ-01 item
is owed (GZ-01's filter is a player-visible change).
