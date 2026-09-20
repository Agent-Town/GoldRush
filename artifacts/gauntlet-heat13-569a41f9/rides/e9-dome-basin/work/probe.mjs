import { ride } from './runner.mjs';
import fs from 'node:fs';
const r = await ride({ label: 'probe-idle', controller: null, idle: true });
fs.writeFileSync('./probe-view0.json', JSON.stringify(r.views[0], null, 1));
console.log('OUTCOME', JSON.stringify(r.outcome));
console.log('ENV', JSON.stringify(r.env));
console.log('ROWS', JSON.stringify(r.rows));
