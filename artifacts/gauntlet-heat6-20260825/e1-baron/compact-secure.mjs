import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const [sourcePath, targetPath] = process.argv.slice(2);
if (!sourcePath || !targetPath) throw new Error('usage: compact-secure.mjs <source-tape> <target-tape>');
const tape = JSON.parse(readFileSync(sourcePath, 'utf8'));
const location = new URL(`http://gr-sim.local/?debug&contract=${tape.contract}&seed=${tape.seed}`);
globalThis.location = location;
globalThis.window = { location };

const arena = '/tmp/heat6-61681a77';
const vite = await createServer({ root: arena, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const [{ HeadlessContractSim }, { applyDifficultyPreset, normalizeDifficultyPreset }] = await Promise.all([
    vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
    vite.ssrLoadModule('/src/game/Balance.ts'),
  ]);
  applyDifficultyPreset(normalizeDifficultyPreset(tape.difficulty));
  const sim = new HeadlessContractSim({ contractId: tape.contract, seed: tape.seed });
  const entries = new Map(tape.inputLog.entries.map((entry) => [entry.t, entry]));
  const kept = [];
  while (!sim.isTerminal) {
    const tick = Math.round(sim.timeAlive * 30);
    const entry = entries.get(tick);
    if (entry) {
      const verbs = entry.a[0]?.orders?.map(({ verb }) => verb) ?? [];
      const spin = verbs.length > 0 && (verbs.every((verb) => verb === 'BLAST_AT')
        || verbs.join(',') === 'SET_WEAPON,SET_WEAPON,BLAST_AT,HOLD');
      if (!spin || sim.currentTurn().view.now.blastReadyInMs === 0) kept.push(entry);
      for (const action of entry.a) sim.submitOrders(action.orders);
    }
    sim.advanceOneTick();
  }
  tape.inputLog.entries = kept;
  tape.id = `agent-${randomUUID()}`;
  writeFileSync(targetPath, `${JSON.stringify(tape)}\n`);
  console.log(JSON.stringify({ id: tape.id, entries: kept.length, bytes: JSON.stringify(tape).length, outcome: sim.outcome() }));
} finally {
  await vite.close();
}
