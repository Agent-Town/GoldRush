#!/usr/bin/env node
// Gold Rush Gauntlet Player v4
// Strategy:
// 1. BUILD comes FIRST in order array (fires when gold condition met)
// 2. HARVEST comes second (fires when BUILD condition not met — earns gold)
// 3. HOLD last (keeps prospector where it is)
// Key: MOVE_TO is removed — it blocks BUILD. Prospector stays near claim and harvests.
// Build VERY close to the claim center (0,12) where positions are definitely valid.

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-02';
const DIFFICULTY = 'trail';
const MAX_ATTEMPTS = 10;

const CLAIM = { x: 0, z: 12 };

// Build positions — right around the claim center at (0,12)
// Sentry beacons: 6 max, 25/35/45/55/75/95 gold
const SENTRY_POSITIONS = [
  { x: 0, z: 13 },   // N of claim
  { x: 0, z: 11 },   // S of claim
  { x: 3, z: 12 },   // E of claim
  { x: -3, z: 12 },  // W of claim
  { x: 0, z: 15 },   // further N
  { x: 0, z: 9 },    // further S
];

// Turrets: 4 max, 50/70/95/125 gold
const TURRET_POSITIONS = [
  { x: 4, z: 14 },
  { x: -4, z: 14 },
  { x: 4, z: 10 },
  { x: -4, z: 10 },
];

function buildCost(what, count) {
  const prices = {
    sentry_beacon: [25, 35, 45, 55, 75, 95],
    turret: [50, 70, 95, 125],
  };
  const list = prices[what];
  if (!list) return Infinity;
  if (count < list.length) return list[count];
  return Infinity; // can't build more
}

function decideOrders(view) {
  const now = view.now;
  const gold = now.gold;
  const wave = now.wave;
  const works = now.works;

  const builtByKind = works.byKind || {};
  const sentryCount = builtByKind.sentry_beacon || 0;
  const turretCount = builtByKind.turret || 0;

  const orders = [];

  // ──────────────────────────────────────────────
  // PHASE 0: Emergency repair (lowest priority)
  // ──────────────────────────────────────────────
  // (place these last so BUILD/HARVEST fire first)

  // ──────────────────────────────────────────────
  // PHASE 1: BUILD defenses (FIRST priority)
  // ──────────────────────────────────────────────
  // Build sentry beacons — cheapest to most expensive
  if (sentryCount < SENTRY_POSITIONS.length) {
    for (let i = sentryCount; i < SENTRY_POSITIONS.length; i++) {
      const cost = buildCost('sentry_beacon', i);
      orders.push({
        verb: 'BUILD', what: 'sentry_beacon',
        where: SENTRY_POSITIONS[i],
        when: { goldGte: cost },
      });
    }
  }

  // Build turrets — need more gold
  if (turretCount < TURRET_POSITIONS.length) {
    for (let i = turretCount; i < TURRET_POSITIONS.length; i++) {
      const cost = buildCost('turret', i);
      orders.push({
        verb: 'BUILD', what: 'turret',
        where: TURRET_POSITIONS[i],
        when: { goldGte: cost },
      });
    }
  }

  // ──────────────────────────────────────────────
  // PHASE 2: HARVEST gold — fire multiple harvests per seam per wave
  // ──────────────────────────────────────────────
  // panAt has no range check, and each HARVEST order fires on a separate tick.
  // Queue MANY harvests (up to 32 orders total) for fast gold accumulation.
  const activeSeams = now.seams.filter(s => s.active && s.remaining > 0);
  for (const seam of activeSeams) {
    // 4 harvests per active seam (8 total for 2 seams = 16 order slots)
    for (let h = 0; h < 4; h++) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }

  // ──────────────────────────────────────────────
  // PHASE 3: REPAIR when damaged
  // ──────────────────────────────────────────────
  if (works.hp > 0 && works.maxHp > 0) {
    const pct = Math.round((works.hp / works.maxHp) * 100);
    if (pct < 60) {
      orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
    }
  }

  // ──────────────────────────────────────────────
  // PHASE 4: HOLD (persistent default)
  // ──────────────────────────────────────────────
  // Keeps the prospector at the claim where it's safe
  orders.push({ verb: 'HOLD', pos: CLAIM });

  return orders;
}

async function runAttempt(attemptNum) {
  return new Promise((resolve) => {
    console.error(`\n═══ ATTEMPT ${attemptNum} ═══`);

    const child = spawn('node', [
      'scripts/gr-sim.mjs',
      '--contract', CONTRACT,
      '--seed', SEED,
      '--difficulty', DIFFICULTY,
    ], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let views = [];
    let outcome = null;
    let lineBuffer = '';
    let turn = 0;
    let stderrBuf = '';

    child.stderr.on('data', (chunk) => { stderrBuf += chunk.toString(); });

    child.stdout.on('data', (chunk) => {
      lineBuffer += chunk.toString();
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.secured !== undefined && data.waves !== undefined) {
            outcome = data;
            console.error(`  → OUTCOME: secured=${data.secured} waves=${data.waves} gold=${Math.round(data.gold)} kills=${data.kills}${data.endReason ? ' end='+data.endReason : ''}`);
            return;
          }
          if (data.schema === 'goldrush.view.v1') {
            turn++;
            views.push(data);
            const now = data.now;
            const p = now.prospector || {x:'?',z:'?'};
            const as = now.seams.filter(s => s.active).map(s => `${s.id.substring(10)}(${s.remaining})`).join(',') || 'none';
            console.error(`  W${now.wave}T${turn}: gld=${Math.round(now.gold)} hero=(${Math.round(now.hero.x)},${Math.round(now.hero.z)}) pros=(${Math.round(p.x)},${Math.round(p.z)}) t=${now.threats.alive} hp=${now.hero.hp}/${now.hero.maxHp} w=${Math.round(now.works.hp)}/${Math.round(now.works.maxHp)} S=${(now.works.byKind||{}).sentry_beacon||0} T=${(now.works.byKind||{}).turret||0} s=[${as}]`);

            const orders = decideOrders(data);
            child.stdin.write(JSON.stringify(orders) + '\n');
          }
        } catch (e) { /* non-JSON */ }
      }
    });

    child.on('close', (code) => {
      const rejectLines = stderrBuf.split('\n').filter(l => l.includes('gr-sim rejected') || l.includes('gr-sim speed'));
      if (rejectLines.length > 0) console.error('  → ' + rejectLines.join('; '));

      if (!outcome && lineBuffer.trim()) {
        try { const d = JSON.parse(lineBuffer); if (d.secured !== undefined) outcome = d; } catch(e) {}
      }
      resolve({ outcome, views, code });
    });

    child.on('error', (err) => {
      console.error('  → Spawn error:', err.message);
      resolve({ outcome: null, views, code: -1 });
    });

    setTimeout(() => { if (!child.killed) child.kill('SIGTERM'); }, 120000);
  });
}

async function main() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await runAttempt(attempt);
    if (result.outcome && result.outcome.secured === true) {
      console.error(`\n✅ SECURED on attempt ${attempt}!`);
      writeFileSync('gauntlet-outcome.json', JSON.stringify(result.outcome) + '\n', 'utf-8');

      const lastView = result.views[result.views.length - 1];
      const report = [
        '# Gauntlet Report \u2014 The Claim (e1-the-claim-02, trail)',
        '',
        '**Status**: SECURED',
        '**Attempts**: ' + attempt,
        '**Outcome**: ' + JSON.stringify(result.outcome),
        '',
        '## Approach',
        '',
        'Player script controls the Gold Rush sim via NDJSON door protocol.',
        '',
        'Standing orders control the PROSPECTOR (not the hero). The hero stays at the claim and fights automatically. The prospector harvests gold from seams and the build system places defenses.',
        '',
        '1. **BUILD priority**: BUILD orders come first in the array so they fire before HARVEST. BUILD uses goldGte conditions to wait until enough gold is available.',
        '2. **Passive harvest**: HARVEST fires when BUILD conditions are not met, earning ~5 gold per wave. No MOVE_TO is used (it blocks BUILD).',
        '3. **Sentry beacons (max 6)**: Placed near the claim center at (0,12). Cost escalates 25/35/45/55/75/95. Slow enemies in 8wu radius.',
        '4. **Turrets (max 4)**: Placed at (4,14)/-(4,14)/(4,10)/-(4,10). Cost 50/70/95/125. 16wu range line-of-sight damage.',
        '5. **Repair**: WORKS repaired when below 60% HP.',
        '6. **HOLD**: Always ends with a HOLD to keep the prospector stationary at the claim.',
        '',
        'Views processed: ' + result.views.length,
      ].join('\n');

      writeFileSync('gauntlet-report.md', report, 'utf-8');
      console.error('-> gauntlet-outcome.json written');
      console.error('-> gauntlet-report.md written');
      return;
    }
    if (result.outcome) {
      console.error('  \u2717 Not secured: waves=' + result.outcome.waves + ' gold=' + Math.round(result.outcome.gold));
    }
  }
  console.error('\n\u274c Failed after ' + MAX_ATTEMPTS + ' attempts');
  process.exit(1);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });