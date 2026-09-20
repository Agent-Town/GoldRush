# sim-terrain-read-canonicalization — drain review (s2494)

**Slice:** `tasks/sim-terrain-read-canonicalization.md` (lane-d)
**Branch / tip:** `lane/d` @ `1ae47d6c6e0a2f5d5c8da8691dd4410da18737b7`
**Merged as:** `1ce199744d2b24b31f1b726c20795808bd959ffc` (parents `ef51fefe8` main, `1ae47d6c6` lane)
**Base:** `39d4883c31a6632ad481905a20deaffaed563b4f`
**Gate worktree:** `gate-s2494` (detached, §3.0b), scratch port 5199 (5188 was held by lane-c's live run)

## VERDICT: MERGED — and it is a HONESTY-GUARD STOP, not a scope failure

The master asked the runner to push every sim-path terrain read onto the motion canonicalization
grid, on F-E4-2's theory that a transcendental in `visualY` was what made an E4 run replay
differently in Chromium than in node. The master also carried a no-op / honesty guard: *"If the
drift originates outside the terrain reads (name the operation with file:line), STOP after the
proof harness and report the true source."*

**The runner built the proof harness, the proof disproved the premise, and it stopped.** It retained
**no** sim terrain-read change and named the real source with coordinates: the browser worker shim
writes `window.location` (`src/replay/BrowserAgentTapeWorker.ts:15`) while contract selection reads
`globalThis.location` (`src/meta/ContractFamilies.ts:2382`), so the worker booted `the-claim`;
`WaveSystem.keepSpawnOutOfDeepWater` (`src/systems/WaveSystem.ts:688-693`) then relocated the E4
spawn against the wrong terrain. First divergent tick 223 — the first enemy spawn — node keeping it
at `z=34` and Chromium moving it to `z=32`.

**That is a firewall success, and it is the second one this factory has banked in two fires.** What
lands here is the harness, not a fix.

## What it does, and why the timing matters

The source fix the lane's own row points at — `reel-contract-routing-hazard`, F-E8MC-3 — **shipped
one fire earlier as `a671486e2`**. So this slice's four-reel whole-run gate, which was RED on the
lane's own base by construction, is **GREEN on the merged tree**. It is now the standing regression
gate for that cure.

Two harnesses land:

1. `e2e/e4-roads-and-convoys.spec.ts` — the both-engine test is promoted from *sub-wave digests
   under the first wave boundary* to a **whole-run hash comparison across all four Motor reels**,
   collecting every row before asserting (`expect(mismatches).toEqual([])`) so a future regression
   reports all four maps rather than dying on the first. Each map replays in its own disposable
   page, because the harness self-navigates after a replay.
2. `e2e/true-reel-harness.spec.ts` — the Claim control gains a pinned `controlHash`
   (`fnv1a32:a45ba9ac`) and a **second, terrain-reading fixture** (`e4-dust-flats`), so the class
   this slice investigated reds forever rather than only on the Claim.

## Evidence (merged tree, measured — not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean**, 16.1 s |
| `npm run build` | **green**, 32.2 s (`✓ built in 2.49s`, asset-diet within ceiling) |
| `true-reel-harness.spec.ts` desktop-chrome | **2/2 pass**, 72.0 s |
| `true-reel-harness.spec.ts` mobile-chrome 390px | **2/2 pass**, 119.0 s |
| `e4-roads-and-convoys.spec.ts` desktop-chrome | **2/3**, 139.1 s — the 1 red is pre-existing, see below |
| `e4-roads-and-convoys.spec.ts` mobile-chrome 390px | **3/3 pass**, 282.9 s |
| zero console/page errors | asserted inside every passing test |
| `test:node-guards` (F-1460-1 trigger) | **DOES NOT FIRE** — diff touches 0 files under `src/sim/`, `src/systems/`, `src/entities/` (0 `src/` files at all) |

**The headline table — all four Motor reels, claimed = node = Chromium, on BOTH projects**
(`artifacts/e4-roads-and-convoys/both-engines-{desktop,mobile}-chrome.json`, regenerated on the
merged tree):

| contract | claimed | node | browser | ticks (node = browser) |
|---|---|---|---|---|
| `e4-dust-flats` | `fnv1a32:086670cf` | `fnv1a32:086670cf` | `fnv1a32:086670cf` | 2995 |
| `e4-long-road` | `fnv1a32:9cdc36d6` | `fnv1a32:9cdc36d6` | `fnv1a32:9cdc36d6` | 4033 |
| `e4-gusher-county` | `fnv1a32:ca739103` | `fnv1a32:ca739103` | `fnv1a32:ca739103` | 7395 |
| `e4-boneyard` | `fnv1a32:4ef6662b` | `fnv1a32:4ef6662b` | `fnv1a32:4ef6662b` | 3670 |

Claim control unmoved: `the-claim` `fnv1a32:a45ba9ac` claimed = node = browser, 2350 ticks, both
projects. Hill Mine worker (main's own added test) `fnv1a32:0cdd3e78` claimed = node = browser.

## The one red is PRE-EXISTING, and I measured that rather than asserting it

`e4-roads-and-convoys.spec.ts:143` *"human parity, measured"* failed once on desktop. **All of its
own assertions passed** — plain boot mounts no Hauler, `?debug&vehicles` mounts one at `x=-20,z=-8`.
Only its trailing `expect(errors).toEqual([])` tripped, on
`THREE.GLTFLoader: Couldn't load texture blob:…` — an asset-load race inside code this diff does
not contain.

Discriminated by a **reverted-files control in the same tree, same server, same load**
(`git checkout main -- e2e/e4-roads-and-convoys.spec.ts`, asserted byte-identical to `main:` first):

| arm | runs | red | signature |
|---|---|---|---|
| merged tree | 3 | **1** | `GLTFLoader: Couldn't load texture blob:…` |
| control (main's own byte-identical spec) | 3 | **2** | *same signature* |

Main reds this test **more often** than the merged tree does. It is a flake on main, fingerprint-matched,
not this slice's. Mobile passed it 3/3.

⚠️ **Load condition stated, because it is the parameter that decides this (F-2462-1):** every arm ran
with lane-c mid-playwright at load average **45–48 on 16 CPUs**. Both arms paid the same contention
by construction, which is exactly why the differential is the readable number and the raw red is not.

## Merge classification

Re-derived on this merge, **not inherited** — and the inherited claim was half wrong. s2493's handoff
said *"its two spec files were ALSO touched by drain 2"*; measured, only one was.

| file | class | resolution |
|---|---|---|
| `e2e/e4-roads-and-convoys.spec.ts` | **LANE-ONLY** — main did not move it since base (`git log base..main -- <path>` empty) | taken whole; verified byte-identical to `lane/d:` |
| `e2e/true-reel-harness.spec.ts` | **BOTH-MOVED** — main moved it at `b86f02028` (drain 2) | **UNION**, by hand |
| `tasks/BACKLOG.md` | **BOTH-MOVED** — both sides appended one row | **UNION**, both rows verbatim |

**The spec union, and why it loses nothing:** the lane rewrote test 1 into a loop over a `fixtures`
array; main appended a whole second test (the Hill Mine module worker) and added two consts for it.
Resolution keeps the lane's `fixtures` array **and** main's `hillMinePath`/`hillMine` consts, and both
tests. Main's top-level `fixturePath`/`fixture` consts are dropped — **not a loss**: that same path is
the first entry of the lane's `fixtures` array, now carrying an added control-hash assertion, and no
surviving code references the old consts (verified: 0 remaining `fixturePath` references, 2 tests
present). **Proven by execution, not by reading:** both tests ran and passed on both projects.

**The BACKLOG union, verified by set difference against both parents** (the s2493 method, because a
naive row count scores a lawful retirement as a loss): **0 rows absent from main**; **1 row absent
from lane/d**, and I READ it rather than assuming — it is the `e4-roads-and-convoys READY-FOR-GATES`
row, which main carries in its **superseding** form `READY-FOR-GATES → ✅ SHIPPED 7f5c590a1`. A
lawful retirement, correctly kept in main's newer state.

## Findings

**F-2494-1 — the harness that proves a cure can only be gated AFTER that cure ships, and this one was
sequenced by luck rather than by design.** This slice's four-reel gate asserts an equality that was
FALSE on its own lane base and became TRUE only when `a671486e2` merged sixteen minutes earlier. Had
this drain been taken first — and it was the older done-move, so the ordinary "oldest first" rule
pointed that way — the gate would have redded honestly and a fire could have read that red as the
slice's own defect. s2493 took the newer lane-c drain first for an unrelated reason (contention
immunity), and that accident is what made this drain clean.
*Non-blocking, no corrective task.* The general rule is worth more than a mechanism here: **when a
lane STOPS at an honesty guard and names a corrective, its own harness is a gate on that corrective,
so drain them in dependency order — the harness AFTER the fix — regardless of done-move age.** A guard
cannot express this: "does this spec assert something another undrained slice provides?" is a
judgement, and a red on it would fire on every legitimate build-on-predecessor pair (F-1460-1's
`cross-engine` fate).

**F-2494-2 (non-blocking, no owner word) — `e4-roads-and-convoys.spec.ts:143` is a flaky zero-console
assertion on main.** 2 of 3 control runs red on a GLTFLoader texture blob under load. It is not this
slice's and I did not touch it; recorded so the next fire recognises the signature instead of
re-deriving it. **Deliberately NOT "fixed" by widening the assertion** — that is F-1441-3's
raise-it-until-it-goes-green, and the test's zero-console arm is doing real work on the other runs.

## What the ledger now says

`tasks/sim-terrain-read-canonicalization.md`'s leaf flips `queued → merged` at the hash above. The
lane's BACKLOG row stands verbatim as the record of the STOP, with a closing note added in the drain
bookkeeping commit stating that the corrective it names has since shipped as `a671486e2` — because
read alone, that row points a future reader at work that is already done.

**F-E4-2 is retired as an attribution.** The height-arithmetic story was wrong; the divergence was
contract routing, it is fixed, and the four maps now prove it on every gate run.
