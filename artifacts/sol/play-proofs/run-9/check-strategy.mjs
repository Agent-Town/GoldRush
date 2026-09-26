import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.createSourceFile('driver.ts', fs.readFileSync('e2e/native-proofs/driver.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const fn = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === 'maintain');
const js = ts.transpileModule(fn.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const piece = (id, index, hp = 0) => ({ id, index, hp, maxHp: 50, wrecked: hp === 0, repairCost: 10, x: index * 4, z: 0 });
async function run(defences, restoration, wave = 10) {
  const row = { contract: 'e9-old-canal', notes: [], restoration };
  const now = { defences, wave, sim: 300, gold: 40, repairs: 0, buildables: [{ id: 'turret', count: 2, maxCount: 8, cost: 30 }] };
  const visits = [], builds = [];
  const context = vm.createContext({ RESTORE_GROUND: true, HOLD_GROUND: false,
    read: async () => now, takeUpgrades: async () => {},
    journey: async (_p, _r, x, z, tolerance) => { visits.push({ x, z, tolerance }); return true; },
    fund: async () => true, build: async (...args) => { builds.push(args.slice(2, 5)); return true; },
    Date, Math });
  vm.runInContext(js + ';this.maintain = maintain;', context);
  await context.maintain({ waitForTimeout: async () => { now.repairs++; } }, row, { x: 2, z: 0 }, Date.now() + 1000, [], new Set());
  return { row, visits, builds };
}
const priority = await run([piece('sentry_beacon', 0), piece('turret', 1)]);
assert.equal(priority.visits[0].x, 4, 'equally wrecked turret wins');
assert.equal(priority.visits[0].tolerance, 1.2);
const recent = await run([piece('turret', 1), piece('sentry_beacon', 0)], { wrecks: { 'turret:1': [9] }, dead: [], abandoned: [], spent: false });
assert.ok(recent.row.restoration.abandoned.includes('turret:1'), 'second wreck in two waves abandons');
assert.equal(recent.visits[0].x, 0);
const old = await run([piece('turret', 1)], { wrecks: { 'turret:1': [8] }, dead: [], abandoned: [], spent: false });
assert.equal(old.row.restoration.abandoned.length, 0, 'older wreck does not count');
const repeated = await run([piece('turret', 1)], { wrecks: { 'turret:1': [10] }, dead: ['turret:1'], abandoned: [], spent: false });
assert.equal(repeated.row.restoration.wrecks['turret:1'].length, 1, 'one persistent wreck is not two deaths');
const late = await run([], undefined, 16);
assert.deepEqual(late.builds, [['turret', 2, -4]], 'late reserve buys choke replacement');
assert.equal(late.row.restoration.spent, true);
console.log('PASS: turret ties, radius, repeat-wreck abandonment, rolling window, persistent-wreck deduplication, late replacement');
// Verify native upgrade success is a tier increase, not merely incidental repair spend.
{
  const strong = piece('turret', 2, 45);
  const weak = piece('turret', 1, 20);
  const now = { defences: [weak, strong], wave: 16, sim: 480, gold: 40, repairs: 0, hero: { x: 0, z: 0 }, buildMode: true };
  const hp = [{ id: 'turret', index: 1, tier: 1 }, { id: 'turret', index: 2, tier: 1 }];
  const row = { contract: 'e9-old-canal', notes: [] };
  const visits = [];
  let label = 'Upgrade to T2 (150g)';
  let enabled = true;
  const page = {
    evaluate: async (fn, arg) => fn(arg), waitForTimeout: async () => {},
    getByTestId: id => ({
      isVisible: async () => id !== 'hud-build-menu', isEnabled: async () => enabled, innerText: async () => label,
      click: async () => { if (id === 'upgrade-confirm') { hp[1].tier++; now.gold -= 20; } else now.buildMode = false; },
    }),
  };
  const context = vm.createContext({ RESTORE_GROUND: true, HOLD_GROUND: false, Date, Math,
    window: { __THREE_GAME_DIAGNOSTICS__: { build: { hp } } },
    read: async () => now, takeUpgrades: async () => {},
    journey: async (_p, _r, x, z, tolerance) => { visits.push({ x, z, tolerance }); now.hero = { x, z }; return true; },
    build: async () => { throw new Error('successful upgrade must not also buy replacement'); },
  });
  vm.runInContext(js + ';this.maintain = maintain;', context);
  await context.maintain(page, row, { x: 2, z: 0 }, Date.now() + 1000, [], new Set());
  assert.equal(visits[0].x, 8, 'highest-HP standing turret selected');
  assert.equal(visits[0].tolerance, 1.2);
  assert.equal(row.restoration.spent, true);
  assert.equal(hp[1].tier, 2);
  console.log('PASS: strongest standing turret upgraded through prompt; tier increase verified; build mode closed');
  label = 'need 150g'; enabled = false; now.buildMode = true; now.gold = 40;
  let requested = 0;
  context.fund = async (_page, _row, amount) => { requested = amount; now.gold = amount; return true; };
  const poor = { contract: 'e9-old-canal', notes: [] };
  await context.maintain(page, poor, { x: 2, z: 0 }, Date.now() + 1000, [], new Set());
  assert.equal(requested, 150, 'fund the advertised upgrade price, not the 40-gold repair reserve');
  assert.equal(poor.restoration.spent, false, 'funding alone is not a purchase');
  assert.equal(now.buildMode, false);
  console.log('PASS: unaffordable native upgrade funds the displayed price with build mode closed');
}
