import { readFile, writeFile } from 'node:fs/promises';

const source = JSON.parse(await readFile('artifacts/gauntlet-heat5-20260824/e1-baron/attempt-4-tape.json', 'utf8'));
for (const entry of source.inputLog.entries) {
  if (entry.t < 15_000) continue;
  for (const action of entry.a) for (const order of action.orders ?? []) {
    if (order.verb === 'HOLD') order.pos = { x: 0, z: -4 };
  }
}
source.id = 'baron-door-audit-h11-forward-rig';
source.createdAt = Date.now();
source.kept = true;
source.inputLog.name = source.id;
source.inputLog.durationTicks = 20_349;
await writeFile('artifacts/baron-door-audit-20260825/h11-forward-rig-tape.json', `${JSON.stringify(source, null, 2)}\n`);
