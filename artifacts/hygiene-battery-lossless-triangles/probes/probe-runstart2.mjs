import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
const location = new URL('http://probe.test/?debug&contract=e7-relay-rush&seed=e7-relay-rush-01');
globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { saveMetaProgress } = await vite.ssrLoadModule('/src/game/MetaProgress.ts');
  const { saveResearchState } = await vite.ssrLoadModule('/src/meta/ResearchTree.ts');
  const replayMod = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  const tape = JSON.parse(readFileSync('artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json', 'utf8'));
  class FakeStorage { #m = new Map(); getItem(k){return this.#m.has(k)?this.#m.get(k):null;} setItem(k,v){this.#m.set(k,String(v));} removeItem(k){this.#m.delete(k);} key(i){return [...this.#m.keys()][i] ?? null;} get length(){return this.#m.size;} clear(){this.#m.clear();} }
  const storage = new FakeStorage();
  saveMetaProgress(storage, tape.runStart.meta);
  saveResearchState(storage, tape.runStart.research);
  const progressed = new HeadlessContractSim({ contractId: tape.contract, seed: tape.seed }, { storage });
  const a = JSON.stringify(tape.runStart, null, 1).split('\n');
  const b = JSON.stringify(progressed.runStart, null, 1).split('\n');
  let shown = 0;
  for (let i = 0; i < Math.max(a.length,b.length) && shown < 20; i += 1) if (a[i] !== b[i]) { console.log(`line ${i}: declared=${a[i]} | progressed=${b[i]}`); shown += 1; }
  if (!shown) console.log('IDENTICAL after install');
} finally { await vite.close(); }
