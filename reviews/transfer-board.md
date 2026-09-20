# Review — transfer-board (lane-b)

- **Slice:** `tasks/transfer-board.md` (spec `specs/transfer-board.md`, RATIFIED 2026-09-03)
- **Branch / tip:** `lane/b` @ `19c2e9f12` (runner auto-commit)
- **Gated in:** detached worktree `gate-s2472` off `677135a87` (§3.0b)

## Verdict

**HOLD — NOT MERGED.** The runner stopped at the task's own honesty guard and did not return READY-FOR-GATES. Its stop is **correct and control-proven**: the registry path the master and spec both name puts a new `.json` inside the engine identity corpus, so merging as-is rotates the engine hash and every existing reel is refused `reel_not_current` at the county door.

This is a firewall success, not a failure. The runner reported the coupling instead of editing `scripts/assay-replay-agent.mjs`, which its firewall forbids.

## The measurement (single variable, control asserting its own validity first)

`scripts/assay-replay-agent.mjs:36–44` lists `assets/contracts` as a **whole-directory** entry, and `collectEngineFiles` recurses it collecting every `.json`. Of the 13 files in `main...lane/b`, **exactly one** falls inside `ENGINE_SOURCE_INPUTS` — so the experiment has one variable and no confound.

| Tree | `computeEngineHash()` |
|---|---|
| main @ `677135a87` (control) | `2a06eb514e3037efc403fc59f4540bbca31ef8947ee1e58cd56cf157a5aecd47` |
| + **only** `assets/contracts/rotation-seeds.json` | `43f54a2035012ed9a5f7271c2faa71381d61a41b1b56f8137c6c65f0dea7c7b7` |
| + the same file at `assets/rotations/rotation-seeds.json` | `2a06eb51…` — **byte-identical to base** |

The control asserts its own validity: main's computed hash **equals `assets/engine-era.json`'s declared `engineHash`** for era 5, which is what proves the door accepts today's reels and therefore that a rotation is a real regression rather than a number moving in a vacuum. The runner quoted different hashes (`8ccbfe16…` → `826b8227…`) because it measured against an older base; the **direction** reproduces exactly.

## Findings

**F-2472-3 — BLOCKING (this drain), and the cure is cheaper than the one proposed.** The registry cannot live at `assets/contracts/rotation-seeds.json`.

The runner's smallest resolution was *"authorize excluding door-only `rotation-seeds.json` from `computeEngineHash`"* — i.e. **narrow the engine identity corpus**, which is a judgement about what "the engine" is, has owner-dispatched precedent (`e6d904e20` engine-surface-narrowing), and is on the desk as a live question. **It is not needed.** Measured above: simply putting the file outside `assets/contracts/` returns the hash to base with **no change to the identity law at all**.

🔑 **And the relocation is what makes the ratified spec self-consistent, so it is not an override of it.** `specs/transfer-board.md` law **L1 ADDITIVE** states: *"Public boards, existing tapes, seeds, **eras** and ranking are untouched."* The path named in the same spec's scope list (`:15`, `:19`) violates that law by construction. A law outranks an incidental path in a scope list, and the file is genuinely door/scheduling data — read by the standings door to decide an admission window — not data the sim loads. `assets/contracts` is in the corpus because contract *manifests* define sim behaviour; a rotation calendar does not.

➡️ **Corrective authored this fire:** `tasks/transfer-board-v2-registry-outside-engine-corpus.md`, queued to lane-b as a **BUILD-ON-PREDECESSOR** master (F-2089-1) declaring all 13 held paths, so the lane's existing implementation is extended rather than `reset --hard` over it (Mistake #2). Scope is the relocation, its two readers, the mint script's output path, and a re-gate — the implementation itself is sound and stays.

⚠️ **One line for the owner, blocking nothing:** the ratified spec's own text still names the old path in its scope and touch lists. It should be amended to `assets/rotations/rotation-seeds.json` with a sentence saying why (the engine corpus). A fire does not edit a ratified spec's rulings (§7.7), so this is flagged, not done.

**F-2472-4 — NON-BLOCKING, for whoever drains v2.** `public/skill.md` and `scripts/skillmd-guard.test.mjs` are both `BOTH-MOVED` on this lane, and both were moved again on main by drain 1 of this same fire (`9b9397c8e`, the contract-list generator). `skillmd-guard.test.mjs` is now a **four-time** conflict site, and F-2469-1's hazard there is a keep-both union that nests one `test()` inside another — a file that will not parse while a presence-check for each side's strings passes happily. **Parse the union and count top-level `test(` per line; never diff it.** Note also that `public/skill.md` now carries generated fences: a rotation section added by hand outside those fences is fine, but anything inside them must come from the renderer or `skillmd-contracts-guard` reds.

## What was NOT gated, stated plainly

No gate battery was run on a lane/b merge, because the merge itself is refused. tsc, build, `test:stats`, the e2e and the node battery are **unmeasured** for this slice on a merged tree, and this review claims nothing about them. The only measurement this review makes is the engine-hash one above, which is what decides the verdict.
