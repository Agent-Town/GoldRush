# ER-02 rehearsal harness — the rider, not the game

Preserved here rather than in `rehearsal/` because this shift's firewall was
`reviews/**` + tapes + the BACKLOG leaf, and because a review whose evidence cites an
instrument that dies with its worktree is a review nobody can re-check.

**Nothing here implements a game verb.** Every order goes through the shipped
`StandingOrders`/`ToolSurface` path inside `src/sim/HeadlessContractSim.ts`; every view
comes from the shipped `src/agent/View.ts`.

- `play.mjs` — the command clock's inbox. Two transports: `--transport=cli` spawns
  `scripts/gr-sim.mjs` **unmodified** and speaks its NDJSON; `--transport=inproc`
  replicates that CLI's own loop in-process, which is the only way to reach a difficulty
  preset (F-ER02-3). The two are proved equal on trail by `eventLogHash` before any
  vein-hunter number is quoted — see the review §2.1.
- `mkplan.py` — the plan generator. One plan shape for every arm.
- `run.sh` — absolute-path runner; shell cwd drift silently mis-aimed two probe batches
  before it existed (R-E2-5).

Re-run one card arm from the repo root:

    node reviews/e2-rehearsal/harness/play.mjs \
      --contract=e2-trestle --seed=e2-trestle-01 \
      --plan=<a plan from ../plans/> --out=/tmp/er02-recheck --maxTurns=2000

`--maxTurns` is not optional on an unfamiliar plan: an uncapped livelocked run wrote
3,074 turns and 76 MB before it was killed (F-ER02-1).
