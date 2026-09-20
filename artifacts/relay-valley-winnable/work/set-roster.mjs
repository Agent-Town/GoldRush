import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const P = path.join(REPO, 'assets/contracts/epoch-7-signal/contracts.json');
const j = JSON.parse(fs.readFileSync(P, 'utf8'));
const row = j.contracts.find((c) => c.id === 'e7-relay-valley');
const arg = process.argv[2];
for (const e of row.twist.enemyRoster) { if (arg === 'none') delete e.contactDamageScale; else e.contactDamageScale = Number(arg); }
fs.writeFileSync(P, JSON.stringify(j, null, 2) + '\n');
process.stderr.write('roster = ' + JSON.stringify(row.twist.enemyRoster) + '\n');
