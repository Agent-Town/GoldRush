#!/usr/bin/env node
// river-assay-1 evidence instrument: writes three tampered copies of an honest River reel, each a coherent claim a
// cheater could post (the tape's outcome and the standing's score edited together, as the door requires):
//   gold     outcome.gold 5 -> 50
//   time     outcome.timeAlive five ticks earlier (the reel still runs to its own pan)
//   pantick  the pan claimed five ticks earlier: durationTicks and timeAlive both cut by five ticks
// Each copy gets its own id. Usage: node tamper.mjs <reel.json> <outdir>
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [reelPath, outDir] = process.argv.slice(2);
const honest = JSON.parse(await readFile(reelPath, 'utf8'));
const TICK = honest.inputLog.stepSeconds;
const renamed = (reel, suffix) => {
  const id = `${honest.id.slice(0, 24)}${suffix.padEnd(12, '0').slice(0, 12)}`;
  return { ...reel, id, inputLog: { ...reel.inputLog, name: id } };
};
const variants = {
  gold: renamed({ ...structuredClone(honest), outcome: { ...honest.outcome, gold: 50 } }, 'aaaaaaaaaaaa'),
  time: renamed({ ...structuredClone(honest), outcome: { ...honest.outcome, timeAlive: honest.outcome.timeAlive - 5 * TICK } }, 'bbbbbbbbbbbb'),
  pantick: (() => {
    const cut = honest.inputLog.durationTicks - 5;
    const reel = structuredClone(honest);
    reel.inputLog.durationTicks = cut;
    reel.inputLog.entries = reel.inputLog.entries.filter((entry) => entry.t < cut);
    reel.outcome = { ...reel.outcome, timeAlive: honest.outcome.timeAlive - 5 * TICK };
    return renamed(reel, 'cccccccccccc');
  })(),
};
for (const [name, reel] of Object.entries(variants)) {
  const file = path.join(outDir, `tampered-${name}.json`);
  await writeFile(file, `${JSON.stringify(reel, null, 2)}\n`);
  process.stdout.write(`${name}: ${file} id ${reel.id} outcome ${JSON.stringify(reel.outcome)} ticks ${reel.inputLog.durationTicks}\n`);
}
