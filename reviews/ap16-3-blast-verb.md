# AP-16-3 — BLAST_AT: the blast charge reaches the agent door

**Slice:** lane-c-ap16-3-blast-verb · **Branch:** `lane/c` · **Tip:** `14e13c469`
**Merge:** `eba8d15ea5b6aee63a8aa5fd633a09e795e2f829`
**Drained:** s1638, 2026-08-10 · gated in detached worktree `gate-s1638` (§3.0b), merged as ONE act (F-1589-5)

## VERDICT: MERGED — with one recorded instrument gap (F-1638-3), on the same reasoning that merged ap16-1.

## What it does

Closes seed class (3) of the SAME-GAME LAW — the owner's *"I use the grenade a lot… crucial"*. The
standing-order grammar gains a seventh verb, `BLAST_AT`, with range and cooldown rejection that speak
in the door's own surprise vocabulary (`COOLDOWN: Blast Charge ready in Nms`, `OUT_OF_RANGE: …`).

The part that matters for the LAW: `HeadlessContractSim.blastAt()` routes through **the same pooled
`CombatSystem.launchLob`** the browser hero uses, with `Balance.blast.*` damage, radius, air-time and
cooldown, the same `1 + wave × dmgPerWave` scaling, and the same `blastDamageMult` /
`blastRadiusMult` / `blastCooldownMult` upgrade stats. It is not a parallel implementation that
happens to agree — it is the human code path. `now.blastReadyInMs` rides the view so an agent can see
its own cooldown, and `public/skill.md` documents the door.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.77 s |
| `npm run test:node-guards` | **446 tests / 441 pass / 0 fail / 5 skipped**, 296.8 s, run ALONE (required — diff touches `src/sim/` + `src/agent/`, F-1460-1) |
| gr-sim hash drift | **ZERO** — no re-pins, so the sim's replayed behaviour is unmoved |
| `ap16-3-blast-verb` + `ap-standing-orders` + `skillmd-door` + `front-door-parity` | **20/20** desktop + 390px |
| plain boot `_s106-prospector` + `f1297-2-tape-button` | **4/4**, zero console/page errors |
| Playwright flags | `--workers=1` throughout (§3.1), scratch port 5234, external server serving the gate tree |
| Post-merge `main..lane/c` | empty |

**Zero drift is the load-bearing number here.** A new verb that reaches the shared combat pool is
exactly the kind of change that moves replayed sim outcomes; that it moves none means `BLAST_AT` is
inert until an agent actually orders it. The Baron pins stand.

### Merge classification

5 paths. `e2e/ap16-3-blast-verb.spec.ts`, `public/skill.md`, `src/agent/StandingOrders.ts`,
`src/agent/View.ts` — **LANE-ONLY**, main untouched since base `719c86d6`.
`src/sim/HeadlessContractSim.ts` — **BOTH-MOVED** (main moved it via ap16-1's buildable unification),
**auto-merged clean by `ort`**, no graft required. ✓ VERIFIED by running the merge, not by assuming
the bucket meant loss — BOTH-MOVED is a triage bucket, not a verdict.

## Findings

**F-1638-3 — THE AUDIT NOW CONTRADICTS THE DOOR, AND ITS GUARD *PINS* THE CONTRADICTION. Non-blocking,
but it is the F-1636-1 shape recurring one fire later on the ability surface.**

✓ VERIFIED on the merged tree: all **42** blast ability rows still read
`"no reachable standing-order path reaches this hero ability"`, direction `agent-lacks`, evidence
`Game.ts:614 · StandingOrders.ts:9` — while `e2e/ap16-3-blast-verb.spec.ts` proves in the same tree
that `BLAST_AT` kills a headless cluster. The sentence is now simply false.

The sharp part is not the stale row, it is the guard. `scripts/same-game-audit.test.mjs` asserts:

```js
assert.ok(has('the-claim', 'ability', 'hero:0:blast', 'agent-lacks'), 'blast-charge gap must remain visible');
```

That assertion is **satisfied only while the gap exists**. Now that the gap is closed, the guard
requires the audit to keep reporting a gap that is gone — so whoever fixes the ability rows will find
`test:node-guards` going RED *because they fixed it*, and the cheapest reading of that red is "my fix
broke a guard" rather than "the guard outlived its subject."

This is why the row is filed rather than quietly patched: the fix is one line, but it belongs to
whoever owns the ability rows, and the reason must be on the record first. The generator hardcodes
every non-`:rig` ability as unavailable — which is precisely what legitimately **STOPPED this task's
runner** at its firewall (F-1636-2), and it is out of this slice's scope by design.

**Why merged anyway:** the finding is against the *instrument*, not the *behaviour*. `BLAST_AT` is
correct, fully gated, drift-free, and it is one of the two lanes ap16-4 has been waiting on. Holding a
correct, gated verb over a reporting artifact would strand the board's stated #1 priority — the same
call s1636 made for ap16-1, and this drain re-makes it deliberately rather than by inheritance.

**Scope note:** the runner stopped short of `READY-FOR-GATES` **honestly**, naming the firewall
contradiction instead of reaching outside it. That is the behaviour the firewall law asks for, and it
cost nothing — everything inside the scope was complete and green.
