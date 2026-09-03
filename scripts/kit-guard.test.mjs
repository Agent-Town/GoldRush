import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

import { Balance } from '../src/game/Balance.ts';

// This is a generic-damage guard, not an arsenal guard. E2 railcars pass because ordinary rig
// bolts and blast charges reach Enemy.takeDamage. The 2026-08 failure was a LOCKED pressure
// arsenal; this guard cannot measure grants, unlocks, range, aim, or fight balance.
const COMBAT_PATH = 'src/systems/CombatSystem.ts';
const ENEMY_PATH = 'src/entities/Enemy.ts';
const HOMEMAKER_PATH = 'src/systems/HomemakerBossSystem.ts';
const SALVAGE_CLAW_PATH = 'src/systems/SalvageClawBossSystem.ts';
const OLD_DIGGER_PATH = 'src/systems/OldDiggerBossSystem.ts';
const combatSource = await readFile(COMBAT_PATH, 'utf8');
const enemySource = await readFile(ENEMY_PATH, 'utf8');
const homemakerSource = await readFile(HOMEMAKER_PATH, 'utf8');
const salvageClawSource = await readFile(SALVAGE_CLAW_PATH, 'utf8');
const oldDiggerSource = await readFile(OLD_DIGGER_PATH, 'utf8');
const CombatProbe = probeClass(combatSource, 'CombatSystem', ['resolveBlastDamage', 'resolveBoltHits']);
const EnemyProbe = probeClass(enemySource, 'ClaimJumperEnemy', ['takeDamage']);
const OldDiggerProbe = probeClass(oldDiggerSource, 'OldDiggerBossSystem', ['enforceNoKillLaw']);
const doorIds = await readDoorIds();
const contracts = await readContracts();
const rows = [];

for (const contractId of doorIds) {
  test(`${contractId}: every fielded kind accepts default-kit damage`, () => {
    const contract = contracts.get(contractId);
    assert.ok(contract, `${contractId}: door contract has no manifest`);
    for (const kind of fieldedKinds(contract)) {
      const bolt = damageRatio(kind, 'bolt');
      const blast = damageRatio(kind, 'blast');
      rows.push({ contractId, ...kind, bolt, blast });
      assert.ok(bolt > 0 || blast > 0, `${contractId}: ${kind.name} rejects both rig bolts and blast charges`);
    }
  });
}

test.after(() => {
  const unique = new Map(rows.map((row) => [`${row.name}\0${row.bolt}\0${row.blast}`, row]));
  console.log('\nkind | bolt | blast | evidence');
  console.log('--- | --- | --- | ---');
  for (const row of [...unique.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`${row.name} | ${verdict(row.bolt)} | ${verdict(row.blast)} | ${row.source}; ${COMBAT_PATH}:${lineOf(combatSource, 'enemy.takeDamage(damage)')}/${lineOf(combatSource, 'enemy.takeDamage(damage);', combatSource.indexOf('private resolveBoltHits'))}; ${ENEMY_PATH}:${lineOf(enemySource, 'takeDamage(amount: number)')}`);
  }
  console.log(`kit-guard: ${doorIds.length} door contracts, ${rows.length} fielded contract-kind paths, ${unique.size} distinct damage rows`);
});

function damageRatio(kind, weapon) {
  const enemy = Object.assign(Object.create(EnemyProbe.prototype), kind.runtime, {
    alive: true,
    hp: 100,
    flashRemaining: 0,
    flashCount: 0,
    isAlive: true,
    position: { x: 0, z: 0 },
    hitRadius: 1,
    boltDamageMult: kind.boltDamageMult,
    boltDamageMultValue: kind.boltDamageMult,
    restoreBossHull(hp) { this.hp = hp; },
  });
  Object.defineProperty(enemy, 'currentHp', { get: () => enemy.hp });
  const combat = Object.assign(Object.create(CombatProbe.prototype), {
    enemies: { all: [enemy] },
    canDamageEnemy: () => true,
    vfx: { hit() {} },
    audio: { playHit() {} },
    recordDamage() {},
    recordBoltHit() {},
    killEnemy() {},
    orbitalReturn: null,
    buildingTargetsResolver: null,
  });
  if (weapon === 'blast') {
    combat.resolveBlastDamage({ x: 0, z: 0 }, 10, 1, 'hero_blast', 0);
  } else {
    combat.projectiles = {
      capacity: 1,
      isActive: () => true,
      positionAt: () => ({ x: 0, z: 0 }),
      damageAt: () => 10,
      ownerIdAt: () => 'hero',
      shooterKeyAt: () => 'hero:0:rig',
      targetIdAt: () => 1,
      deactivate() {},
    };
    combat.resolveBoltHits(0);
  }
  if (kind.postDamageLaw === 'old-digger') {
    const boss = Object.assign(Object.create(OldDiggerProbe.prototype), {
      hull: () => enemy,
      hullFloorHp: () => 0,
      lastHullHp: 100,
      damageMarks: 0,
    });
    boss.enforceNoKillLaw();
  }
  return (100 - enemy.hp) / 10;
}

function fieldedKinds(contract) {
  const kinds = specialKinds(contract.id);
  for (const variant of contract.twist?.enemyRoster ?? []) {
    const balanced = rosterBalance(contract.id, variant.id);
    kinds.push({
      name: variant.id,
      boltDamageMult: variant.boltDamageMult ?? balanced?.boltDamageMult ?? 1,
      runtime: { ...balanced, ...variant, variantId: variant.id, variantIdValue: variant.id, elite: null, eliteKind: null },
      source: sourceLine(contract, `\"id\": \"${variant.id}\"`),
    });
  }
  const baron = contract.twist?.baron;
  if (!baron) return dedupe(kinds);
  const eliteKind = baron.bossKind ?? 'baron';
  const variantId = baron.variantId ?? (baron.components?.length ? 'baron_railcar' : null);
  const components = baron.components?.length ? baron.components : [null];
  for (const component of components) {
    kinds.push({
      name: component ? `${variantId}:${component.id} [elite=${eliteKind}]` : `${variantId ?? eliteKind} [elite=${eliteKind}]`,
      boltDamageMult: component?.boltDamageMult ?? 1,
      runtime: {
        ...baron,
        ...component,
        variantId,
        variantIdValue: variantId,
        elite: eliteKind,
        eliteKind,
        eliteKindValue: eliteKind,
        bossComponentId: component?.id ?? null,
        bossComponentIdValue: component?.id ?? null,
      },
      source: sourceLine(contract, component ? `\"id\": \"${component.id}\"` : `\"${baron.variantId ? 'variantId' : 'wave'}\"`),
    });
  }
  if (variantId === 'homemaker_9000') {
    kinds.push({
      name: 'homemaker_9000:core [elite=railcar]',
      boltDamageMult: 1,
      runtime: {
        ...baron,
        variantId,
        variantIdValue: variantId,
        elite: eliteKind,
        eliteKind,
        eliteKindValue: eliteKind,
        bossComponentId: 'core',
        bossComponentIdValue: 'core',
      },
      source: `${HOMEMAKER_PATH}:${lineOf(homemakerSource, "bossComponentId: 'core'")}`,
    });
  }
  return dedupe(kinds);
}

function specialKinds(contractId) {
  if (contractId === 'e8-mare-claim') {
    return ['grapple_port', 'grapple_starboard', 'winch', 'anchor_feet'].map((component) => ({
      name: `salvage_claw:${component}`,
      boltDamageMult: 1,
      runtime: {
        variantId: 'salvage_claw',
        variantIdValue: 'salvage_claw',
        elite: null,
        eliteKind: null,
        bossComponentId: component,
        bossComponentIdValue: component,
      },
      source: `${SALVAGE_CLAW_PATH}:${lineOf(salvageClawSource, component.startsWith('grapple_') ? 'const GRAPPLE_IDS' : `spawnComponent('${component}'`)}`,
    }));
  }
  if (contractId === 'e9-dome-basin') {
    return [
      {
        name: 'old_digger:hull',
        boltDamageMult: 1,
        postDamageLaw: 'old-digger',
        runtime: { variantId: 'old_digger', variantIdValue: 'old_digger', elite: null, eliteKind: null, bossComponentId: 'hull', bossComponentIdValue: 'hull' },
        source: `${OLD_DIGGER_PATH}:${lineOf(oldDiggerSource, 'bossComponentId: HULL_ID')}/${lineOf(oldDiggerSource, 'delta * Balance.oldDigger.conventionalDamageMult')}`,
      },
      {
        name: 'maintenance_drone',
        boltDamageMult: 1,
        runtime: { variantId: 'maintenance_drone', variantIdValue: 'maintenance_drone', elite: null, eliteKind: null },
        source: `${OLD_DIGGER_PATH}:${lineOf(oldDiggerSource, 'variantId: DRONE_VARIANT')}`,
      },
    ];
  }
  return [];
}

function dedupe(kinds) {
  return [...new Map(kinds.map((kind) => [kind.name, kind])).values()];
}

function rosterBalance(contractId, kind) {
  const roster = contractId.startsWith('e6-') ? Balance.e6Roster
    : contractId.startsWith('e7-') ? Balance.e7Roster
      : contractId.startsWith('e8-') ? Balance.e8Roster
        : contractId.startsWith('e9-') ? Balance.e9Roster : null;
  return roster?.variants?.[kind];
}

async function readDoorIds() {
  const skill = await readFile('public/skill.md', 'utf8');
  const match = skill.match(/<!-- skillmd-guard:door-contracts:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- skillmd-guard:door-contracts:end -->/);
  assert.ok(match, 'public/skill.md door-contracts block not found');
  return JSON.parse(match[1]);
}

async function readContracts() {
  const found = new Map();
  for (const entry of await readdir('assets/contracts', { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('epoch-')) continue;
    const path = `assets/contracts/${entry.name}/contracts.json`;
    const source = await readFile(path, 'utf8');
    for (const contract of JSON.parse(source).contracts ?? []) found.set(contract.id, { ...contract, path, source });
  }
  return found;
}

function sourceLine(contract, needle) {
  const contractStart = contract.source.indexOf(`\"id\": \"${contract.id}\"`);
  return `${contract.path}:${lineOf(contract.source, needle, contractStart)}`;
}

function probeClass(source, className, methodNames) {
  const file = ts.createSourceFile('probe.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const declaration = file.statements.find((node) => ts.isClassDeclaration(node) && node.name?.text === className);
  assert.ok(declaration, `${className} declaration not found`);
  const methods = methodNames.map((name) => {
    const method = declaration.members.find((node) => ts.isMethodDeclaration(node) && node.name.getText(file) === name);
    assert.ok(method, `${className}.${name} not found`);
    return method.getText(file);
  }).join('\n');
  const output = ts.transpileModule(`class Probe { ${methods} }`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  return Function('Balance', 'isCombatDamageDisabled', `${output}; return Probe;`)(Balance, () => false);
}

function lineOf(source, needle, from = 0) {
  const index = source.indexOf(needle, Math.max(0, from));
  assert.notEqual(index, -1, `${needle} not found`);
  return source.slice(0, index).split('\n').length;
}

function verdict(scale) {
  return scale <= 0 ? 'no' : Math.abs(scale - 1) < 1e-9 ? 'yes' : `scaled ×${scale}`;
}
