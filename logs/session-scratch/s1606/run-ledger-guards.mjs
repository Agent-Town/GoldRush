// s1606 — run test:ledger-guards EXACTLY as package.json declares it. The script is a SHELL CHAIN
// (`&&` between a node --test block, six npm sub-scripts, two node audits and three bash guards),
// so it must go through a shell: splitting it on whitespace and handing the pieces to `node --test`
// makes `&&`, `npm`, `run` and the .sh files look like test files and manufactures failures that
// belong to the invocation, not the board. `npm run` itself is refused by this fire's bash
// allowlist — the gate denies the operator, not the factory.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const script = JSON.parse(readFileSync('package.json', 'utf8')).scripts['test:ledger-guards'];
const r = spawnSync(script, { shell: '/bin/bash', stdio: 'inherit' });
console.log(`[ledger-guards] rc=${r.status}`);
process.exit(r.status ?? 1);
