// s1468: Goal Registration Law — the authored master's leaf lands in the SAME commit.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const raw = readFileSync(P, 'utf8');
const g = JSON.parse(raw);

// find the sibling leaf so the new one lands in the same array (same parent as the E3-1 socket)
let parentArr = null, sibIdx = -1;
(function walk(n) {
  if (Array.isArray(n)) {
    const i = n.findIndex(x => x && x.id === 'e3-voltage-socket');
    if (i >= 0) { parentArr = n; sibIdx = i; }
    return n.forEach(walk);
  }
  if (n && typeof n === 'object') Object.values(n).forEach(walk);
})(g);

if (!parentArr) { console.error('sibling e3-voltage-socket not found'); process.exit(1); }
if (parentArr.some(x => x && x.id === 'e3-moth-socket')) { console.error('leaf already exists'); process.exit(1); }

const leaf = {
  id: 'e3-moth-socket',
  title: "E3 census 2 of 4: socket Moth Season's swarm + light-state consumer into GR-SIM and derive its decoy-versus-radius vocabulary (cures F-ER01-E3-2)",
  status: 'queued',
  taskFile: 'lane-e3-moth-socket.md',
  lane: 'lane-a',
  note: "s1468 fire (FIRE-AUTHORED). Era-socket class #3, template tasks/lane-e3-voltage-socket.md (drained 3ac90dd8). Cheapest of the three remaining E3 gaps because e3-moth-season's twist is secureWave/dayNightCycle/mothSeason/enemyRoster and the dayNightCycle half is ALREADY socketed by the Voltage slice — only mothSeason is missing. It carries no powerGrid, which is what firewalls PowerGraph out. Authoring measured three things so the runner need not re-derive them: (1) the census's \"decoy-versus-radius trade\" is one expression, MothSwarm.ts:83 targetScore = coverageAt * radius * radiusWeight * (targetWeight ?? 1), picked highest at :84 with a deterministic id.localeCompare tie-break, damaged at :115 — radius is the cost side, targetWeight the decoy side; (2) more light means more moths — Game.ts:5461 filters swarm inputs to lantern/powered-lamp and :4996 scales the per-wave count by that count, so lighting up is not free and that consequence belongs in the RULES; (3) motesPerSwarm's globalThis.matchMedia at MothSwarm.ts:29 LOOKS like the determinism seam the E2 socket had to fix in PressureSystem, but its only consumer is syncVisuals() at :167 writing instance matrices — render-only, cannot reach the event log, and the master explicitly tells the runner NOT to 'fix' it. Citation key measured to return exactly 1 on main before dispatch (F-1425-2), deliberately apostrophe-free and single-line.",
};

parentArr.splice(sibIdx + 1, 0, leaf);
writeFileSync(P, JSON.stringify(g, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
console.log('leaf inserted after e3-voltage-socket:', leaf.id, '/ status', leaf.status);
