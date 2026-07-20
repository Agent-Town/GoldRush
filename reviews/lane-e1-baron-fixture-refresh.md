# Review — e1-baron fixture refresh (lane-e1-baron-fixture-refresh) — **REJECTED**

**Slice/branch/tip:** `lane/perf` `9d103193` ("runner(lane-d): lane-e1-baron-fixture-refresh.md")
**Merge attempted:** `b247c6ba` (`git merge --no-ff lane/perf`, base `574458e3`) → **reverted** by `0277dc07` (file-level restore of the 3 spec files to pre-merge content; `git revert`/`reset` sandbox-gated for headless fires).
**Verdict:** REJECTED — the fixture set is unlandable in either src configuration; it exposes an incomplete src wiring **and** a genuine design fork that needs an owner ruling.
**Salvage:** `lane/perf` @ `9d103193` preserved (do NOT reset lane-d until the corrective lands). Most of the runner's fixture work is correct and reusable.

## What the runner did (mostly right)
Refreshed 3 baron spec files against current baron truth, each change citing its source commit (obeyed the "no blind bumps" rule):
- Baron stat retunes — hpScale 160→**240**, contactDamageScale 4.25→**5**, buildingDamageScale 12→**16**, supportBuildingDamageScale 8→**12**, pursuitRange 45→**18** (cite `b85eb38e`). **Verified correct** — these `toMatchObject`/spawned-baron assertions passed against the live manifest+runtime (21/22 desktop green in isolation).
- Board nav `contract-page-dot-e1-baron` → `contract-chapter-tab-epoch-1-frontier`; E1 card count 1→5 (cite `330ba7bb`, The Book chapters — already on main). Correct.
- Baron unlock gate `science-complete` → `science-complete+2-secured`; launch text and a `securedContracts` seed helper (cite `c505e3f9`). **This is where it breaks** (below).

## Why it can't land (the two-sided trap)
The `science-complete+2-secured` gate lives in `src/encyclopedia/registry.ts:401-407` but was **never wired into the live town board** `src/town/TownScene.ts` (its `unlockStatus` has `science-complete`, `secured:`, `startsWith('science')` — **no `science-complete+2-secured` branch**). So on live main the Baron card's `science-complete+2-secured` unlock **falls through** to the `startsWith('science')` fallback (`TownScene.ts:2324`), which regex-parses "2" out of "+2-**secured**" and renders the nonsensical launch prompt **"Bank 2 science first"** (should read "Complete Frontier science and secure two different claims"). **This is a live UX bug on the locked Baron card — a player sees it in a plain boot (Mistake #10).**

- **Without a src fix:** fixture test `e1-baron.spec.ts:343` (the runner's updated lock test) is RED — it correctly asserts the intended prompt, which the buggy UI never renders.
- **With the obvious src fix** (I mirrored `registry.ts:401-407` into `TownScene.ts` and re-gated — the `:343` red closed, both projects): a DIFFERENT test goes red — `e1-baron.spec.ts:547` ("standard rig damage defeats the Baron…") fails at line 590. After defeating the Baron the test opens the board and expects `contract-stakes-e1-baron` / the medal line to show, but with a strict 2-secured gate the Baron card is **still locked** (beating the Baron secures only 1 claim, not 2) → stakes/medal element absent. `057-baron-rocket-cart.spec.ts:349` fails the same way.

So the fixture set requires a src gate change, and that src change collides with the existing expectation that **the Baron's stakes + earned medal are visible on the board after victory, regardless of the 2-secured launch gate.** That is a design decision, not a mechanical fix.

## F-1 (BLOCKING → OWNER DESK) — the `science-complete+2-secured` design fork
Two coupled questions for the owner:
1. **Is the 2-secured gate the intended live-board behavior for the Baron?** (registry.ts + `c505e3f9` say yes; live TownScene was never wired for it → currently shows the broken "Bank 2 science first" prompt.)
2. **If yes — after the player beats the Baron, should the Baron card still show its stakes + earned medal even when fewer than 2 claims are secured?** (test `:547`/`057:349` assume yes; a strict gate says no.) Likely intended: the *unlock-to-launch* gate is 2-secured, but a **beaten** contract shows its medal/stakes unconditionally. That needs a small src rule ("show stakes/medal if secured-before OR gate met") — an owner/attended call.

**Recommendation:** owner rules on #1 (almost certainly "yes, wire the gate — the current prompt is a live bug") and #2 (recommend: beaten Baron shows medal/stakes regardless of the launch gate). Then one **attended-authored corrective** does it coherently: (a) add the `science-complete+2-secured` branch to `TownScene.ts unlockStatus` (mirror registry.ts:401-407); (b) make the board show stakes/medal for an already-beaten Baron independent of the gate; (c) land lane/perf's fixture updates (they're correct once src matches) + add `securedContracts` seeding to `:547`/`057:349`. Gate all baron specs both projects.

## State left for the next fire
- main reverted to `c58d606d` content for the 3 baron specs → the **pre-existing 12 documented stale baron reds persist** (the exact known-red baseline s760's baron-truths drain fingerprint-matched around; `reviews/lane-baron-arrival.md` F-1). No NEW reds introduced.
- `lane/perf` @ `9d103193` kept as salvage for the corrective. No goal-tree leaf (a `fix:`/`test:` corrective).
