// Sets (or clears) twist.draft.fieldKitFromWave on the e7-relay-valley row, preserving the file's
// exact 2-space formatting. `node set-kit.mjs <wave|none>`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const P = path.join(REPO, 'assets/contracts/epoch-7-signal/contracts.json');
const j = JSON.parse(fs.readFileSync(P, 'utf8'));
const row = j.contracts.find((c) => c.id === 'e7-relay-valley');
const arg = process.argv[2];
if (arg === 'none') delete row.twist.draft;
else row.twist.draft = { fieldDressingFromWave: Number(arg) };
fs.writeFileSync(P, JSON.stringify(j, null, 2) + '\n');
process.stderr.write('twist.draft = ' + JSON.stringify(row.twist.draft ?? null) + '\n');
