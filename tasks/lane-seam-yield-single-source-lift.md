TASK: lane-seam-yield-single-source-lift — FIRE-AUTHORED s1380 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree (lane-a = worktrees/lane-a, branch lane/m3). One task, firewalled.

WHY (re-authored after a CORRECT firewall STOP, 2026-08-02):
The predecessor master `lane-seam-yield-single-source.md` was UNACHIEVABLE AS WRITTEN, and Codex was
right to refuse it. Its run log (`tasks/runs/20260802-064330-lane-a-lane-seam-yield-single-source.md.log`,
104,543 tokens) ends: "BLOCKED — not `READY-FOR-GATES` ... The existing e2e canary references the
deleted field, making `tsc` and build fail. Authorize this third-file test update to finish."
The contradiction, verified at source by s1380: the predecessor's SCOPE named the dry-gulch e2e suite
as its PROOF ("behavior byte-identical, proven by the dry-gulch e2e suite") while its TOUCH-ONLY said
"Game.ts yield read · Balance (removal) · nothing else" — and `e2e/e1-dry-gulch.spec.ts:183` is itself
a THIRD reader of the field being deleted. A task cannot forbid touching the file it nominates as its
own evidence. This master lifts the firewall by exactly one file; nothing else about the predecessor
changes. (Finding F-1380-1.)

PREMISE RE-VERIFIED AT SOURCE (s1380 — do not spend tokens re-deriving it, but do not defer to it
either: if you observe otherwise, STOP and report the disagreement):
 · Exactly THREE readers exist on main: `src/game/Balance.ts:849` (the definition),
   `src/game/Game.ts:7296` (the id-keyed special case), `e2e/e1-dry-gulch.spec.ts:183` (the test).
 · The change IS behavior-preserving: the `e1-dry-gulch` contract's TWIST declares
   `"seamYieldMult": 1.4` at `assets/contracts/epoch-1-frontier/contracts.json:124-128`, and BOTH the
   browser path (`Game.ts:589` bornContract → ContractFamilies `activeContract`) and the headless path
   (`HeadlessContractSim.ts:121` `loadContract`) resolve from that SAME JSON bundle. `Math.max(0.1, 1.4)`
   is a no-op, so both branches of the deleted conditional returned the identical number.
 · ⚠ THE HEADLESS BENCH CANNOT PROVE THIS SLICE, AND ITS GREEN MUST NOT BE PRESENTED AS IF IT COULD.
   `HeadlessContractSim` read `twist.seamYieldMult` BEFORE this change and still reads it after, so it
   never executed the code being removed. Its unchanged hash (`fnv1a32:3d75c580`) is a control that is
   structurally blind to the edit. RUN it as a no-regression check; do NOT report it as evidence that
   the browser yield is unchanged. The dry-gulch e2e is the only instrument that reads the changed path.

START STATE — BUILD ON THE EXISTING LANE COMMIT, DO NOT RESET:
`lane/m3` is ahead of main by exactly ONE commit, `9ef521e5` ("runner(lane-a): lane-seam-yield-single-source.md"),
which already contains the two correct production deletions (`Balance.ts` −3, `Game.ts` −1) and nothing
else. `node scripts/lane-usable.mjs lane-a` reports HOLDS on those two paths — that is CONTENT MAIN HAS
NEVER SEEN, not debris. Confirm the tip is still `9ef521e5` and continue on top of it. If the tip differs,
STOP and report rather than re-deriving the deletions.

PRE-FLIGHT: this tree is EXPECTED to be ahead of main — that is not a stop condition here. What must hold
is that every dirty tracked blob is reachable in git. If anything beyond the commit named above is
present, STOP and report.

SCOPE (numbered, each testable):
 1. `e2e/e1-dry-gulch.spec.ts:183` — re-point the expected value to THE SAME SINGLE SOURCE the runtime now
    uses (the contract twist), e.g. through the existing `loadContract('e1-dry-gulch').twist.seamYieldMult`
    from `src/meta/ContractFamilies` — the loader both runtime paths already use. Do NOT hardcode 1.4 at
    :183, and do NOT reintroduce a compatibility field on `Balance`: either would preserve the second
    source this slice exists to remove.
 2. Leave `e2e/e1-dry-gulch.spec.ts:184` EXACTLY AS IT IS. It asserts the diagnostics value `.toBe(1.4)` as
    a literal, and that independence is the point: :183 proves the WIRING, :184 proves the VALUE did not
    move. Two instruments, only one of which depends on the source being changed.
 3. Grep-prove zero survivors: `grep -rn "contracts.dryGulch" src/ e2e/ scripts/` returns nothing.
 4. No yield VALUES change anywhere: 1.4 before, 1.4 after.

TOUCH-ONLY: `e2e/e1-dry-gulch.spec.ts` (THE LIFT — the one file the predecessor lacked) ·
  `src/game/Game.ts` yield read · `src/game/Balance.ts` (removal only).
NO: yield VALUES · other twists · other contracts · `src/sim/HeadlessContractSim.ts` · any other spec
  file · any compatibility shim for the removed field.

SELF-CHECK (report the actual numbers, not adjectives):
 · `npx tsc --noEmit` clean · `npm run build` green
 · dry-gulch e2e green BOTH projects with `--workers=1`, desktop + 390px mobile
 · adjacent by grep: any suite referencing `seamYieldMult` (`e2e/town-t3-board.spec.ts:150` does) —
   run it and report unmodified-green
 · headless dry-gulch determinism run: report the hash AND state plainly that it is a no-regression
   check, not proof of the browser path (see the ⚠ above)
 · zero console/page errors in the boot probes

READY-FOR-GATES + report: the before/after read path, the grep zero-survivors output, both e2e project
results, and the headless hash WITH its stated limitation.
