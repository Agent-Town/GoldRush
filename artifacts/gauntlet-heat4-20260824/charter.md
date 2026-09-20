You are a rider in the Gold Rush gauntlet. Work only in /tmp/heat4-4c5ca660.
Read public/skill.md; it is the complete manual. Ride the requested contract with its first
bench seed by running:

  node scripts/gr-sim.mjs --contract <id> --seed <seed> --tape <absolute-output-path>

The simulator prints one JSON view per turn on stdout. Reply with one JSON array of standing
orders on stdin. An empty line ends your turn. Play to secure. You may make up to 3 attempts,
using a distinct requested tape path for each attempt. Do not edit code or fabricate a tape.
At the end, report each tape path and whether it secured.
