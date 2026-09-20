# Task b4v2-picnic-stake-pressure: finish the three-stake hold WITH the ruled stake pressure — e6-picnic door-ready (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **the OWNER RULINGS (2026-08-20, verbatim): "E6 1/4 (three parked on your words) - lets unpark, there is tons of Codex subscription availble for these" and, to the question "Should enemies also press undefended stakes on multi-stake maps?" — "(1) yes"**; tasks/b4-picnic-three-stake-hold.md (the v1 master — its design stands; this v2 adds the ruling and salvages the WIP); reviews/b4-picnic-three-stake-hold.md (the s2085 hold: why v1's objective was unloseable — enemies target only the hero, so center/east discs are never entered and the hero's body permanently contests west; F-2085-1); reviews/proto-pool-recycle.md **F-PROTO-3 + F-PROTO-5: the Picnic was NEVER pool-sick on main, and v1's recorded prover hashes were STALE GLOW-MESA DEFAULTS (the prover ran its default --contract) — ALL prover evidence must be re-derived against e6-picnic explicitly**; the just-merged Flotilla's straggler targeting weight (git log --grep b2-flotilla-hulls; read HOW it biased targeting through the smallest existing seam without touching global order — mirror that pattern); src/systems/PicnicHoldSystem.ts ON YOUR LANE BRANCH (the preserved WIP).

## Pre-flight — BUILD-ON-PREDECESSOR (RESET FORBIDDEN)
`git log lane/b --not main` shows commit `1e47ec4e9` — **that is the b4 v1 WIP, deliberately preserved by the s2085 hold (PicnicHoldSystem.ts + census + engine hooks). It is NOT on main. A safe-dupe reset would DESTROY it (Mistake #2).** Verify the ahead content matches that description, then BUILD ON TOP of lane/b as it stands. STOP only if lane/b's ahead content is something else entirely or the worktree holds foreign uncommitted edits. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why (the rulings above)
v1's hold consumer was held because the objective could not be lost. The owner has now ruled stake pressure IN. This v2: (1) the ruled pressure, (2) the completed hold, (3) honestly re-derived evidence.

## Scope
1. **Stake pressure (the ruling made mechanical, hold-consumer-gated):** on contracts where the hold consumer is active (2+ heroStart stakeMarkers — today only e6-picnic), enemies gain a targeting WEIGHT toward UNDEFENDED stake discs (no hero/turret contest present), via the same seam the Flotilla's straggler weight used — never a new pathing system, never a change to any other contract's targeting (prove: bystander floors byte-unmoved). Default split: a meaningful minority of each wave presses stakes (tune so the idle floor flips honest and a defended run is challenged but winnable — report the weight you shipped and why).
2. **Complete the hold consumer** (the WIP): claim timer (6s uncontested, radius 3), hero/turret contest, per-stake claimed=LOST, all three lost ⇒ run loss (fairground wheel-loss surfacing class), ≥1 alive to the default secure terminal ⇒ hold succeeds. Both engines, socket pattern, picnic-gated. ⚠️ F-A8-7: no render imports in a both-engines module — inject from Game.ts.
3. **Agent surface + manifest** per v1's scope items 3.
4. **Prove — EVERY hash minted against e6-picnic explicitly** (F-PROTO-5): public-verb prover secures both seeds ×2 (`--contract e6-picnic --seed e6-picnic-01/-02`, report fnv1a32); **idle floors ×2 must now LOSE** (stakes fall to the ruled pressure and/or hero death — report which terminal; if idle STILL survives, STOP per Law 2 and report the mechanism).
5. **Admission completion** per v1 item 5 (anchors 3-5 in the buildZones, er01-e6-census per-id truth, skill.md fences, door baseline, floors regen `--check` all secured:false, audit regen + pins re-measured on YOUR tree verbatim with the ADMISSION MOVE comment style, attributed by revert-and-reproduce). NOTE: main's audit base moved today — read the current pins from the file, never inherit numbers from this master.

## Firewall
Touch ONLY: PicnicHoldSystem + the targeting-weight seam (hold-gated), the two engines' hooks + loss surface, e6-picnic contract block (anchors ONLY), MechanicsManifest, er01-e6-census, skill.md fences, door baseline, floors+audit regen, pins (attributed), the WIP's e2e spec (extend), BACKLOG row.
NO: global targeting order for any other contract (prove via floors/pins), WrangleSystem internals, showroom/glow-mesa/hollow anything, balance values, hero-start selection.

## Self-check
tsc + build green; full node-guards (contention → solo, say so; bracket pgrep patterns); er01-e5 + er01-e6 + ap16-4 both projects; adjacent task-025 + m1-01 + m2-01 both projects; plain boots ×2 viewports asserting the RESOLVED contract id; floors `--check` clean 0 secured:true.
End: READY-FOR-GATES + report: the weight shipped, hold semantics, secure hashes ×2 (against e6-picnic — say so explicitly), idle terminals, anchors, gate counts, pins.

## No-op / honesty guard
If idle still false-greens after the ruled pressure, STOP and report the mechanism precisely. If the prover cannot secure with unmodified balance, STOP and report the measured gap. No buffs, no minting.
