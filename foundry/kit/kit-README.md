# THE FOUNDRY KIT — the runnable factory-in-a-box
### One command stands up the factory the Foundry book describes. The book (foundry/00–09) is the WHY; this kit is the machine. Chapter 08 is the adoption manual — the kit automates its "day one" and pre-wires stages 2–4.

## What this is
```
node foundry/kit/init.mjs /path/to/new-game "Game Name"
```
scaffolds a complete factory: the constitution seed, the implementer contract, the fire protocol, queues and ledgers, the runner, the fires' launchd plist, the dashboard, the watchdog, and the config file that parameterizes all of it. Fifteen days of Gold Rush convergent evolution, delivered as a starting position.

## Kit contents
| File | What it is |
|---|---|
| `init.mjs` | The scaffolder. Node, zero deps. Refuses non-empty targets — never overwrites anything. |
| `fire-runner.sh` | Scheduled headless-orchestrator runner (launchd → one fire per cadence). Generalized from the live Gold Rush script. |
| `lane-runner.sh` | The parallel implementer runner (one task per slot, worktree lanes) — generalized AND repaired; see `DIVERGENCES.md`. |
| `dashboard-gen.sh` | The read-only factory ledger page (goal tree, queues, drains, owner's desk). |
| `health-watch.sh` | The deterministic watchdog — watches the watchers, restarts a dead runner, notifies on everything else. |
| `test-init.sh` | The kit's own gate: scaffolds into a temp dir and asserts the whole contract. Run it after any kit change. |
| `DIVERGENCES.md` | Every behavioral difference from the live Gold Rush originals, with reasons — including the two repaired runner bugs. |

The scaffolder also instantiates every template from `foundry/09-templates/` (constitution → `CLAUDE.md`, fire protocol → `scripts/fire.md`, task master, review, specialist queue) with your game's name and paths substituted; every other `<placeholder>` is deliberately left for you — filling them IS the adoption work (book ch. 08).

## Quickstart (init → login → first master → first fire)
1. **Init:** `node foundry/kit/init.mjs ~/Projects/my-game "My Game"` — then read the scaffold's `README.md`; its 8-step ignition sequence is the short form of book ch. 08. Verify the kit first with `bash foundry/kit/test-init.sh` if you've touched anything.
2. **Git + remote FIRST:** `git init`, commit, create the remote, push. (Book Mistake #11: Gold Rush ran for weeks on one disk. You get to skip that one for free.)
3. **Login once, each tier:** run `claude` and your implementer CLI (default `codex`) interactively once so headless runs are authenticated. Two model tiers, budgeted like payroll — ch. 08 prerequisite #3.
4. **Constitution + contract:** fill the `<placeholders>` in `CLAUDE.md` and `AGENTS.md`. Write your content red-lines TODAY (they are cheap now, expensive to retrofit). Start the mistake catalog empty — but start it.
5. **First spec, first master:** one milestone in `specs/`, risk-first slices; author your first task master from `tasks/TEMPLATE-task-master.md` and drop a copy in `tasks/queue/main/`.
6. **Runner:** `bash scripts/lane-runner.sh --dry-run` to see what it would do, then run it without the flag in a terminal. Main works out of the box; lanes activate when you create their worktrees (`worktrees/README.md`). **Never edit the runner file while it runs** — bash reads scripts by byte offset; stop → edit → restart.
7. **Gate by hand ~ten times** before lighting any fires (ch. 08: the manual reps teach you what your gates need to be, and your review files become the exemplars the fires imitate). Use `reviews/TEMPLATE-review.md`. A done-move is NOT done.
8. **First fire:** `bash scripts/fire-runner.sh --dry-run`, then a manual `bash scripts/fire-runner.sh`, then schedule it: `cp scripts/com.<slug>.fire.plist ~/Library/LaunchAgents/ && launchctl load ~/Library/LaunchAgents/com.<slug>.fire.plist`. Start with a LONG cadence and drains-only authority (edit `scripts/fire.md` §2 down to A/B/F), extending the charter one clause at a time — ch. 08 stage 3.
9. **Eyes:** `bash scripts/health-watch.sh status` is the 2-second board; `bash scripts/dashboard-gen.sh` writes `logs/dashboard.html`. Schedule both on timers when you trust them (the Gold Rush cadence: dashboard 60 s, health 10 min).

## foundry.config.json — every knob in one file
Written by init; read by all four scripts at startup (baked fallbacks match live Gold Rush values).
- `fire.*` — model, cadenceSeconds, protocol path, logDir, lockStaleMinutes, logRetentionDays, optional claudeConfigDir (separate Claude auth profile for fires).
- `runner.*` — implementerBin, defaultModel/defaultEffort (per-master override: an `IMPLEMENTER: model=<m> effort=<e>` line in the task file), pollSeconds, logRetentionDays, lockPattern, cleanDirs, and `slots.<slot>.addPaths` (path-scopes that slot's auto-commit).
- `dashboard.*` — out, goalsFile, refreshSeconds, optional pendingDir (a generation-queue dir to count, if your factory has one).
- `health.logFile`.

## Book cross-reference (where each piece is explained)
Constitution & laws → ch. 01 · cast/trust (fires, runner, attended, owner) → ch. 02 · loops, claims-vs-facts, done-move discipline → ch. 03 · the mistake catalog the kit's repairs come from → ch. 04 · gates & review files → ch. 05 · canon pipeline (add at stage 7) → ch. 06 · lanes/specialists → ch. 07 · staged growth & honest costs → ch. 08 · the templates themselves → ch. 09.
