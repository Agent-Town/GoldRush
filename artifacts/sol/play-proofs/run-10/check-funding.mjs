import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.createSourceFile('driver.ts', fs.readFileSync('e2e/native-proofs/driver.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const fn = source.statements.find(n => ts.isFunctionDeclaration(n) && n.name.text === 'fund');
const js = ts.transpileModule(fn.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
async function funding({ enabled = true, contract = 'e1-twin-banks', wave = 14, gold = 40, arrivalWave = wave } = {}) {
  const node = { id: 'seam', x: 0, z: -12, active: true };
  const state = { wave, gold, hero: { x: 0, z: -12 }, nodes: [node], physics: { active: false } };
  const row = { contract, notes: [] };
  let journeys = 0, waits = 0;
  const context = vm.createContext({ RESTORE_GROUND: enabled, Date, Math,
    read: async () => state, takeUpgrades: async () => {},
    journey: async () => { journeys++; state.wave = arrivalWave; return true; },
  });
  vm.runInContext(js + ';this.fund = fund;', context);
  const result = await context.fund({ waitForTimeout: async () => { waits++; state.gold = 150; } }, row, 150, Date.now() + 1000, [], new Set());
  return { result, journeys, waits, notes: row.notes };
}
assert.deepEqual(await funding(), { result: false, journeys: 0, waits: 0, notes: ['restore-ground funding held: wave=14, gold=40, target=150'] });
assert.deepEqual(await funding({ gold: 150 }), { result: true, journeys: 0, waits: 0, notes: [] });
assert.deepEqual(await funding({ wave: 13, arrivalWave: 14 }), { result: false, journeys: 1, waits: 0, notes: ['restore-ground panning stopped: wave=14, gold=40, target=150'] });
for (const options of [{ wave: 13 }, { enabled: false, wave: 17 }, { contract: 'e9-old-canal', wave: 17 }]) {
  assert.deepEqual(await funding(options), { result: true, journeys: 1, waits: 1, notes: [] });
}
console.log('PASS: wave-14 funding stop; funded actions allowed; crossing the threshold stops panning; pre-14, default and Old Canal funding unchanged.');
