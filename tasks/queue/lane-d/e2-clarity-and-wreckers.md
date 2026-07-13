# e2-clarity-and-wreckers — the Steamworks explains itself, and its monsters mean it (lane-d #2; commit prefix "feat:")
ROLE: gameplay + content. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner first E2 playtest, 2026-07-13 (~07:00-07:10 screenshots), verbatim: "I don't know what the boiler room is for." + "I don't know what these monsters are but they did not really do too much." (screenshot: steam-wrecker cluster CLUMPED into an overlapping conga near the rail)

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling of this same playtest wave, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: E2's new mechanics shipped without their teaching moments: the Boiler House has no in-run explanation; the E2 enemy trio is visually new but unnamed in play and un-threatening; wreckers clump into a single overlapping blob (no separation), reading as one confused machine pile.

## READ-FIRST: the first-run reveal/teaching affordance the game already has (research unlock reveal cards / first-claim guide in TownScene+Game — find the pattern) · the boiler/pressure system (what the Boiler House ACTUALLY does: pressure generation → battery scaling → pressurize verb) · src/entities/pools.ts E2 variant presentations + movement (separation forces — do enemies have any?) · lore/characters or enemy naming canon (rail tough / steam wrecker / coal thief names are canon) · Balance E2 enemy scalars.

## SCOPE:
1. BOILER TEACHING: first Boiler House placement (or first E2 boot with it buildable) triggers ONE short reveal card in the existing teaching voice: what it does, one sentence of fiction ("the boiler feeds pressure; pressure feeds the new machines"). Never repeats within a profile (persisted flag like hintsSeen).
2. ENEMY IDENTITY: first encounter with each E2 enemy type shows its name plate once (the existing bark/reveal affordance — "Steam Wrecker" etc.), and each gets a Claim Ledger entry (the encyclopedia pattern) with one line of fiction + one line of tactics.
3. WRECKER FEEL: (a) separation — E2 trio applies the same neighbor-separation the base enemies use (verify base enemies HAVE it; if none exists anywhere, add a minimal radius-push for the E2 trio only); (b) threat — tune the steam wrecker's building damage so ignoring one costs a building segment (E2-scoped Balance/manifest values, documented numbers), consistent with its wrecker fiction.
4. e2e `e2e/e2-clarity-and-wreckers.spec.ts`: boiler card appears once and persists dismissed; enemy name plate fires on first spawn; ledger entries exist; a scripted unattended wrecker window damages a building; separation probe (no two trio enemies within 0.4 units after 5s of shared pathing); zero console/page errors, both projects.

## Firewall
Touch ONLY: the teaching/reveal call-sites + persisted flags, ledger entry registry additions, E2 trio separation + E2-scoped damage values, the new spec, artifacts/. NO base-enemy behavior changes, NO CombatSystem resolution rules, NO wave composition, NO economy.

## Self-check
tsc + build green · new spec green both projects · en-02-e1-coverage + task-025 unmodified-green · zero console/page errors · screenshots: boiler card, name plate, separated wreckers. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + tuned numbers + the card/plate copy (canon voice).
