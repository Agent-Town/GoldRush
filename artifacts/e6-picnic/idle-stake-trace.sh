#!/usr/bin/env bash
# What the ruled hold is DOING inside the canonical idle floor. Prints, per turn, the wave and the
# three stakes' (claimed, contested, timer) straight out of THE VIEW — so the claim "the hero's own
# stake never falls" is read off the run rather than argued.
set -u
cd "$(dirname "$0")/../.."
seed="${1:-e6-picnic-01}"
node scripts/gr-sim.mjs --contract e6-picnic --seed "$seed" --policy=idle 2>/dev/null \
  | node -e '
const lines = require("node:fs").readFileSync(0, "utf8").trim().split("\n");
for (const line of lines) {
  const m = JSON.parse(line);
  if (m.schema !== "goldrush.view.v1") { console.log("OUTCOME", line); continue; }
  const hold = m.now.atomic?.picnicHold;
  const hero = m.now.hero;
  console.log(`w${String(m.now.wave).padStart(2)} hp=${hero.hp.toFixed(0).padStart(3)} alive=${String(m.now.threats.alive).padStart(2)} `
    + (hold ? hold.map((s) => `${s.id.replace("sandwich-", "")}:${s.claimed ? "CLAIMED" : s.contested ? "contested" : `t${s.timer.toFixed(1)}`}`).join(" ") : "hold=absent"));
}
'
