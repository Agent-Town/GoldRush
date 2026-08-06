# f1496-1-drill-yard-fixture-six — the E1 mechanics fixture catches up to a registry that changed five days ago

**Slice:** `lane-f1496-1-drill-yard-fixture-six.md` (FIRE-AUTHORED s1500) · **Branch:** `lane/a` · **Tip:** `5edfd4a6e` *"dyf: sync Drill Yard mechanics fixture"*
**Drained by:** s1501 fire · **Merge:** `8fa0133f5ed14cbe7eb654b699aeaf4d6fd016e6`

## VERDICT: MERGED — the slice does exactly its job on both projects, and the residual red is main's, proved by a control run rather than asserted.

## What it does

`e1-drill-yard` became the **sixth** E1 contract at `74df35dcf`. Two things in `e2e/agent-view.spec.ts` still
said five: the id assertion at `:269` and the byte-stable fixture `e2e/fixtures/e1-mechanics-manifests.json`.
This slice regenerates the fixture from `listContracts().map(deriveMechanicsManifest)` (six entries,
`e1-drill-yard` second, registry order), updates the id list, and corrects the test title from *"all five"*
to *"all six"* — the title being the reason this stayed invisible: fires reading a passing-sounding name
never asked whether the count was still true.

No production code is touched. The diff is two `e2e/` files, exactly the master's TOUCH-ONLY list.

## Evidence

Gated on the **merged tree** in a detached scratch worktree (`gate-s1501`, §3.0b — the content was
undecided when it was measured), every playwright command `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 996ms` |
| `e2e/agent-view.spec.ts` + `e2e/drill-yard-manifest.spec.ts`, both projects | **8 passed / 2 failed** |
| **CONTROL — same two specs on main, before the merge** | **4 passed / 4 failed** |
| Fixture diff | **114 insertions / 0 deletions** |
| Boot/console | the passing agent-view tests boot the game and close on `expectNoConsoleErrors`, desktop-chrome **and** mobile-chrome (390px) — clean |

**The control arm is the whole verdict.** On main, `:264` (the fixture) and `:297` (the briefing) are red on
**both** projects — 4 reds, exactly as F-1496-1 said. On the merged tree `:264` is **green on both** and only
`:297` remains. The slice removes two reds and adds none.

**The five pre-existing entries are byte-identical, not merely deep-equal.** The master asked for a
semantic-equivalence proof; the diff gives a stronger one for free — `114 insertions / 0 deletions` on the
fixture means the regeneration appended the drill yard and rewrote nothing. A deep-equal check could not
have distinguished "unchanged" from "reformatted identically"; the deletion count can.

**Corroboration the fixture was derived, not hand-written** (the master's item 1, and the thing
`f1328-1`'s reserved question turns on): the merged fixture's `e1-drill-yard` entry carries
`assay_tent_faucet`/`top_up`, `drill_bell`/`ring`, `rolling_log`×2/`strike`, `straw_man`×3/`strike`, every one
`source: "practice.stations"` or `"practice.targets"` — the same four interactables s1500 measured through
the `vite.ssrLoadModule` harness, arrived at by an independent path. And the spec's own byte-compare
(`expect(JSON.stringify(manifests)).toBe(JSON.stringify(fixtures))`) plus its per-id re-derivation loop are
**intact and green**, which is only possible if the file IS the live derivation.

## Merge classification

Base `06c5ee4cb`; `lane/a` one commit ahead, six behind. Three-way `git merge --no-ff` (never a two-dot
copy). Main had moved **neither** touched file since the merge-base, so both files are LANE-TOUCHED-only and
the ort strategy reported no conflicts. The two-dot diff shows eleven other paths — all MAIN-MOVED
(s1500's scratch cleanup, BACKLOG, goals.json, STATUS) and none of them the lane's.

## Findings

### F-1501-1 — the Drill Yard card is the only E1 contract whose board briefing does not speak its manifest. Pre-existing on main; NOT caused by this slice. (BLOCKING NOTHING — corrective authored this fire.)

`e2e/agent-view.spec.ts:297` *"the derived manifest rides THE VIEW and every E1 briefing speaks it"* loops
`listContracts()` and asserts `contract-board-mechanics-<id>`. For `e1-drill-yard` the element **does not
exist**: `src/town/TownScene.ts:2190` routes the training ground to `renderTrainingGround()` (`:2279`), a
bespoke card that renders `renderContractArt` and the flavor line but never calls `renderContractBriefing()`
(`:3265`) — the function that emits that testid at `:3282`. The ordinary card path (`:2253`) calls it.

*Failure text, identical in both arms:* `Error: element(s) not found — waiting for
getByTestId('contract-board-mechanics-e1-drill-yard')`.

**This is a ratified-spec violation, not a design fork**, which is why it is fire-authorable:
`specs/agent-play/README.md:149` (AP-11 §1) — *"every contract carries a machine-readable mechanics
declaration DERIVED FROM ITS OWN SIM DATA … **It rides the briefing**, THE VIEW's stable prefix, and
skill.md's per-contract section."* The drill yard is a contract in `listContracts()`; its briefing does not
carry the manifest. The alternative cure — exempting the training ground from the loop — would contradict
AP-11 §1 directly, so it is not an available option and no owner word is needed to rule it out.

**The player-facing half (Mistake #10):** on a plain boot, tavern → contract board, the Drill Yard card is
the only E1 card with no mechanics line. The bell, the straw targets and the rolling logs are exactly the
things a first-time player is there to learn, and the card does not name them.

*Checked before authoring, per F-1500-1's lesson:* this cure is **not** held behind the owner-blocked leaf
`f1328-1-drill-yard-census-debt`. That leaf's held commit `7c4f132f` does touch `src/town/TownScene.ts`, but
its hunk is a **comment-only** `41 → 42` count fix in `renderContractArt` (`:2780`) — a different function,
no overlap with `renderTrainingGround`. The scope-duplication trap that caught three fires on F-1496-1 does
not repeat here, and I looked rather than assumed.

### F-1501-2 — the master predicted 8/8 and the true ceiling was 6/8, because F-1496-1 named TWO reds and prescribed a cure for ONE.

F-1496-1's GATE line reads *"regenerate the fixture to six entries and update the count, **then confirm 8/8
both projects**"* — and the master inherited that number into its self-check ("Expect 8/8 desktop-chrome and
8/8 mobile-chrome"). But the same finding's first sentence names *"`:264` **+ `:297`** fail on both
projects"*, and nothing in the prescribed cure touches `:297`'s subject. The expectation was arithmetic done
on a two-item red list with a one-item cure.

The cost was small but real and worth naming: the runner did the right thing — measured 3/1 per project,
reported the numbers **as they were** rather than rounding toward the expectation, correctly refused to fix
`TownScene.ts` outside its firewall, and filed `NOT READY-FOR-GATES`. That verdict is what a truthful runner
owes; it is also, read cold by the next fire, indistinguishable from "this slice is broken". It is neither —
the slice is complete and correct, and it merged.

**The reusable shape:** *an authored master's expected pass count must be derived by asking whether the cure
covers every red the finding names — not copied from the finding's own optimistic GATE line.* A predicted
count that the cure cannot reach converts a successful run into an apparent failure, and the next reader has
to re-derive the whole thing to tell which it was. Had the master said *"expect 6/8, with `:297` remaining
and a finding owed"*, the runner would have reported READY-FOR-GATES against the truth.

## Env exceptions

None. Both arms ran in the same fire shell, same hour, `--workers=1`, port 5188 (probed free; no lanes live,
no `codex exec` running). The scratch worktree's `node_modules` is a symlink into the repo root; the
worktree is removed at the end of this fire.
