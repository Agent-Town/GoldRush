import { expect, test, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type ValveKnobs = {
  name: string;
  hpScalePerWave: number;
  budgetCeiling: number;
  sluiceT3Cost: number;
  sluiceT3PanRateMult: number;
  sluiceT3YieldMult: number;
  turretT3Cost: number;
  palisadeT3Cost: number;
};

type CurveRow = {
  wave: number;
  incomeRate: number;
  cumulativeIncome: number;
  reserveSpend: number;
  bankedGold: number;
  affordableT3Count: number;
  t3Sluices: number;
  t3Turrets: number;
  incomingDps: number;
  deployedDps: number;
  dpsRatio: number;
  waveBudget: number;
  enemyHp: number;
};

const beforeTask047: ValveKnobs = {
  name: 'before',
  hpScalePerWave: 1.12,
  budgetCeiling: 42,
  sluiceT3Cost: 320,
  sluiceT3PanRateMult: 1.9,
  sluiceT3YieldMult: 2.7,
  turretT3Cost: 400,
  palisadeT3Cost: 250,
};

const afterTask047: ValveKnobs = {
  name: 'after',
  hpScalePerWave: Balance.waves.hpScalePerWave,
  budgetCeiling: Balance.waves.budgetCeiling,
  sluiceT3Cost: Balance.tiers.sluice[2].cost,
  sluiceT3PanRateMult: Balance.tiers.sluice[2].panRateMult,
  sluiceT3YieldMult: Balance.tiers.sluice[2].yieldMult,
  turretT3Cost: Balance.tiers.turret[2].cost,
  palisadeT3Cost: Balance.tiers.palisade[2].cost,
};

const reportPath = path.resolve('test-results/task-047-late-game-valves.json');
const waveSeconds = Balance.waves.waveInterval;
const strongEconomyReserveByWave25 = 1_500;
const manualPanRate = 0.4;
const sluiceUptime = 0.58;
const damagePicks = 8;
const fireRatePicks = 6;
const blastPicks = 7;

test('task-047 seeded late-game probe moves T3 and wave-35 curves into band', async ({}, testInfo: TestInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'task-047 balance probe runs once');

  const before = simulate(beforeTask047);
  const after = simulate(afterTask047);
  const report = { seed: 'task-047-late-game-valves', knobs: { before: beforeTask047, after: afterTask047 }, before, after };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const body = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(reportPath, body);
  await testInfo.attach('task-047-late-game-valves', { body, contentType: 'application/json' });

  expect(row(before, 31).affordableT3Count).toBeLessThan(2);
  expect(row(before, 35).dpsRatio).toBeLessThan(0.65);
  expect(row(after, 31).affordableT3Count).toBeGreaterThanOrEqual(2);
  expect(row(after, 35).dpsRatio).toBeGreaterThanOrEqual(0.7);
  expect(row(after, 35).dpsRatio).toBeLessThanOrEqual(1.2);

  for (let wave = 1; wave <= 10; wave += 1) {
    expect(relativeDelta(row(after, wave).incomingDps, row(before, wave).incomingDps), `wave ${wave} incoming DPS`).toBeLessThanOrEqual(0.05);
    expect(row(after, wave).incomeRate, `wave ${wave} income rate`).toBe(row(before, wave).incomeRate);
    expect(row(after, wave).affordableT3Count, `wave ${wave} T3 count`).toBe(row(before, wave).affordableT3Count);
  }
});

function simulate(knobs: ValveKnobs): CurveRow[] {
  const rows: CurveRow[] = [];
  let gold = 0;
  let cumulativeIncome = 0;
  let affordableT3Count = 0;
  let t3Sluices = 0;
  let t3Turrets = 0;
  const t3Queue = [
    { kind: 'sluice', cost: knobs.sluiceT3Cost },
    { kind: 'turret', cost: knobs.turretT3Cost },
    { kind: 'turret', cost: knobs.turretT3Cost },
    { kind: 'palisade', cost: knobs.palisadeT3Cost },
  ] as const;

  for (let wave = 1; wave <= 35; wave += 1) {
    const incomeRate = economyRate(wave, knobs, t3Sluices);
    const income = incomeRate * waveSeconds;
    gold += income;
    cumulativeIncome += income;
    const reserveSpend = Math.min(strongEconomyReserveByWave25, (strongEconomyReserveByWave25 * wave) / 25);

    while (affordableT3Count < t3Queue.length && gold >= reserveSpend + t3Queue[affordableT3Count].cost) {
      const item = t3Queue[affordableT3Count];
      gold -= item.cost;
      affordableT3Count += 1;
      if (item.kind === 'sluice') t3Sluices += 1;
      if (item.kind === 'turret') t3Turrets += 1;
    }

    const waveBudget = waveBudgetFor(wave, knobs);
    const enemyHp = Balance.enemy.hp * Math.pow(knobs.hpScalePerWave, wave);
    const incomingDps = (waveBudget * enemyHp) / waveSeconds;
    const deployedDps = deployedDpsFor(wave, t3Turrets);
    rows.push({
      wave,
      incomeRate: round2(incomeRate),
      cumulativeIncome: Math.round(cumulativeIncome),
      reserveSpend: Math.round(reserveSpend),
      bankedGold: Math.round(gold),
      affordableT3Count,
      t3Sluices,
      t3Turrets,
      incomingDps: Math.round(incomingDps),
      deployedDps: Math.round(deployedDps),
      dpsRatio: round2(deployedDps / incomingDps),
      waveBudget,
      enemyHp: Math.round(enemyHp),
    });
  }
  return rows;
}

function economyRate(wave: number, knobs: ValveKnobs, t3Sluices: number): number {
  const t2Sluices = wave >= 12 ? 3 : wave >= 8 ? 2 : wave >= 5 ? 1 : 0;
  const t2Rate = (Math.round(Balance.sluice.goldPerCycle * Balance.tiers.sluice[1].yieldMult) * Balance.tiers.sluice[1].panRateMult) / Balance.sluice.cycleSeconds;
  const t3Rate = (Math.round(Balance.sluice.goldPerCycle * knobs.sluiceT3YieldMult) * knobs.sluiceT3PanRateMult) / Balance.sluice.cycleSeconds;
  return manualPanRate + (Math.max(0, t2Sluices - t3Sluices) * t2Rate + t3Sluices * t3Rate) * sluiceUptime;
}

function waveBudgetFor(wave: number, knobs: ValveKnobs): number {
  const linear = Balance.waves.pulseBase + Balance.waves.pulsePerWave * wave;
  const kneeWave = Math.max(0, Balance.waves.kneeWave);
  if (wave <= kneeWave) return Math.max(1, Math.round(linear));
  const kneeBudget = Balance.waves.pulseBase + Balance.waves.pulsePerWave * kneeWave;
  const ceiling = Math.max(kneeBudget, knobs.budgetCeiling);
  const excess = Math.max(0, linear - kneeBudget);
  const eased = ceiling - (ceiling - kneeBudget) * Math.exp(-excess / Math.max(0.01, Balance.waves.kneeSharpness));
  return Math.max(1, Math.round(Math.min(ceiling, eased)));
}

function deployedDpsFor(wave: number, t3Turrets: number): number {
  const heavySparkDamage = Math.min(3, damagePicks) * 0.3 + Math.max(0, damagePicks - 3) * 0.05;
  const heroDps = Balance.sparkRig.damage * (1 + heavySparkDamage) * Balance.sparkRig.fireRate * (1 + fireRatePicks * 0.25);
  const powderStacks = Math.min(2, blastPicks);
  const quickFuseStacks = Math.min(2, Math.max(0, blastPicks - powderStacks));
  const blastCooldown = Balance.blast.cooldown * (1 - quickFuseStacks * 0.15);
  const blastDps = (Balance.blast.damage * (1 + powderStacks * 0.25) * (1 + wave * Balance.blast.dmgPerWave)) / blastCooldown;
  const beaconDps = Balance.beacon.maxCount * (Balance.beacon.damage + Balance.beacon.damagePerWave * wave) * Balance.beacon.fireRate;
  const t2TurretDps = Balance.turret.damage * Balance.tiers.turret[1].damageMult * Balance.turret.fireRate * Balance.tiers.turret[1].fireRateMult;
  const t3TurretDps = Balance.turret.damage * Balance.tiers.turret[2].damageMult * Balance.turret.fireRate * Balance.tiers.turret[2].fireRateMult;
  return heroDps + blastDps + beaconDps + (Balance.turret.maxCount - t3Turrets) * t2TurretDps + t3Turrets * t3TurretDps;
}

function row(rows: CurveRow[], wave: number): CurveRow {
  const found = rows.find((entry) => entry.wave === wave);
  if (!found) throw new Error(`Missing wave ${wave}`);
  return found;
}

function relativeDelta(next: number, base: number): number {
  return Math.abs(next - base) / Math.max(1, Math.abs(base));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
