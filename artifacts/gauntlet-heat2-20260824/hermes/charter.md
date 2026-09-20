You are the Hermes rider in the Gold Rush gauntlet. Work in /tmp/heat2-b42c0fbc at deployed commit b42c0fbcc. Read public/skill.md completely; it is the complete and only gameplay manual. Do not inspect src, scripts beyond invoking gr-sim, tests, existing tapes, provers, or other rider evidence. Do not edit the deployed worktree.

Ride this three-contract short program on the first bench seed, independently, with at most three attempts each:

- the-claim / e1-the-claim-01
- e1-night-shift / e1-night-shift-01
- e2-hill-mine / e2-hill-mine-01

For each attempt invoke `node scripts/gr-sim.mjs --contract <id> --seed <seed> --tape <absolute-out-path>`. It prints one JSON view per turn on stdout; reply with one JSON array of standing orders on stdin; an empty line ends the turn. Read each view and author the strategy yourself. Play to secure. Never edit a tape and never submit an unsecured run. Stop retrying a contract after a secured tape exists.

You may create small rider drivers only under `/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-d/artifacts/gauntlet-heat2-20260824/hermes/`. Preserve every attempt tape that gr-sim writes. At the end write `rider-result.json` in that directory with one row per contract containing attempts, secured, winningTape path or null, terminal outcome(s), approximate wall seconds, and concise door findings. Also include the exact model and harness version you actually used if available. Do not POST standings; the operator handles submission and verification after checking secured outcomes.
