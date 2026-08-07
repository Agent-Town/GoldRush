/**
 * Gauntlet Player v3 — The Claim, seed e1-the-claim-02
 * 
 * Strategy: harvest both active seams, build palisades + turret, survive to wave 10.
 * byKind values are COUNTS (integers), not arrays.
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-02';

// Palisade positions around the claim (0,12)
const PALISADE_POSITIONS = [
  { x: -4, z: 8 },   // south-west
  { x: 4, z: 8 },    // south-east
  { x: -4, z: 16 },  // north-west
  { x: 4, z: 16 },   // north-east
  { x: -8, z: 10 },  // left flank
  { x: 8, z: 10 },   // right flank
  { x: -8, z: 14 },  // left flank north
  { x: 8, z: 14 },   // right flank north
  { x: -3, z: 12 },  // center-left
  { x: 3, z: 12 },   // center-right
];

const TURRET_POSITIONS = [
  { x: -6, z: 9 },
  { x: 6, z: 9 },
  { x: 0, z: 14 },
];

async function play() {
  const sim = spawn('node', [
    'scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED
  ], { cwd: __dirname, stdio: ['pipe', 'pipe', 'pipe'] });

  let buf = '';
  let turnCount = 0;
  let resolved = false;

  // Tracking state
  let gold = 0, wave = 0, hp = 100, maxHp = 100;
  let palisadeCount = 0, turretCount = 0, sentryCount = 0, sluiceCount = 0;
  let stockpileCount = 0, boilerCount = 0, assayCount = 0;
  let enemiesAlive = 0;
  let seams = [];
  let needsRider = false;

  function parseView(view) {
    if (!view.now) return;
    gold = view.now.gold ?? 0;
    wave = view.now.wave ?? 0;
    hp = view.now.hero?.hp ?? 100;
    maxHp = view.now.hero?.maxHp ?? 100;
    enemiesAlive = view.now.threats?.alive ?? 0;
    seams = view.now.seams ?? [];
    needsRider = view.now.needsRider ?? false;

    const bk = view.now.works?.byKind ?? {};
    palisadeCount = bk.palisade ?? 0;
    sluiceCount = bk.sluice ?? 0;
    sentryCount = bk.sentry_beacon ?? 0;
    turretCount = bk.turret ?? 0;
    stockpileCount = bk.stockpile ?? 0;
    boilerCount = bk.boiler_house ?? 0;
    assayCount = bk.assay_office ?? 0;
  }

  function getActiveSeams() {
    return seams.filter(s => s.active && s.remaining > 0);
  }

  function generateOrders() {
    const orders = [];
    const activeSeams = getActiveSeams();

    // 1. BUILD palisades (cheap, 10g each)
    for (let i = palisadeCount; i < PALISADE_POSITIONS.length; i++) {
      orders.push({
        verb: 'BUILD', what: 'palisade', where: PALISADE_POSITIONS[i],
        when: { goldGte: 10 }
      });
    }

    // 2. BUILD sentry beacon (slows enemies, 25g base)
    if (sentryCount < 2 && wave >= 2) {
      const cost = Math.ceil(25 * Math.pow(1.3, sentryCount) / 5) * 5;
      orders.push({
        verb: 'BUILD', what: 'sentry_beacon',
        where: sentryCount === 0 ? { x: -3, z: 9 } : { x: 3, z: 9 },
        when: { goldGte: cost }
      });
    }

    // 3. BUILD turret (kills enemies, 50g base)
    for (let i = turretCount; i < 2; i++) {
      const cost = Math.ceil(50 * Math.pow(1.35, i) / 5) * 5;
      orders.push({
        verb: 'BUILD', what: 'turret', where: TURRET_POSITIONS[i],
        when: { goldGte: cost }
      });
    }

    // 4. BUILD sluice (passive income, 40g, river-adjacent)
    if (sluiceCount < 2 && wave >= 3) {
      const pos = sluiceCount === 0 ? { x: -3, z: 10 } : { x: 3, z: 10 };
      orders.push({
        verb: 'BUILD', what: 'sluice', where: pos,
        when: { goldGte: 40 }
      });
    }

    // 5. HARVEST active seams
    for (const s of activeSeams) {
      orders.push({ verb: 'HARVEST', seam: s.id });
    }

    // 6. REPAIR buildings
    if (wave >= 3) {
      orders.push({ verb: 'REPAIR_UNDER', pct: 50 });
    }

    // 7. FALLBACK if overwhelmed
    orders.push({
      verb: 'FALLBACK_IF', threat: { enemiesGte: 20 }, pos: { x: 0, z: 12 }
    });

    // 8. HOLD at claim
    orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });

    return orders;
  }

  function processLine(line) {
    if (!line.trim()) return;
    turnCount++;
    try {
      const parsed = JSON.parse(line);
      if (parsed.secured !== undefined) return parsed;
      if (parsed.schema === 'goldrush.view.v1') {
        parseView(parsed);
        const status = hp > 0 ? `hp:${hp}` : 'DOWN';
        console.log(`[T${turnCount}] W${wave} g:${gold} ${status} e:${enemiesAlive} p:${palisadeCount} t:${turretCount} s:${sluiceCount} bea:${sentryCount} rider:${needsRider}`);

        if (needsRider && hp <= 0) {
          // Hero is down - this is a death notification. No point sending orders.
          return undefined;
        }

        const orders = generateOrders();
        if (!resolved) {
          sim.stdin.write(JSON.stringify(orders) + '\n');
        }
      }
    } catch (e) {
      try {
        const o = JSON.parse(line);
        if (o.secured !== undefined) return o;
      } catch(_) {}
    }
    return undefined;
  }

  return new Promise((resolvePromise) => {
    let stderrBuf = '';

    sim.stdout.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const raw of lines) {
        const result = processLine(raw);
        if (result && !resolved) {
          resolved = true;
          sim.stdin.end();
          setTimeout(() => { if (!sim.killed) sim.kill(); }, 100);
          resolvePromise(result);
          return;
        }
      }
    });

    sim.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderrBuf += text;
      if (text.includes('rejected'))
        console.error('  ⚠️', text.trim().slice(0, 200));
      if (text.includes('speed'))
        console.error('  ⚡', text.trim());
    });

    sim.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        try {
          const lastLine = buf.trim().split('\n').pop();
          const o = JSON.parse(lastLine);
          if (o.secured !== undefined) { resolvePromise(o); return; }
        } catch(_) {}
        resolvePromise({ secured: false, waves: 0, error: `closed(code=${code})` });
      }
    });

    sim.on('error', (err) => {
      if (!resolved) { resolved = true; resolvePromise({ secured: false, error: err.message }); }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        sim.kill('SIGKILL');
        resolvePromise({ secured: false, error: 'timeout' });
      }
    }, 180000);
  });
}

async function main() {
  console.log('=== GOLD RUSH GAUNTLET v3 — THE CLAIM (e1-the-claim-02) ===');

  let lastOutcome = null;
  for (let i = 1; i <= 10; i++) {
    console.log(`\n━━━ Attempt ${i} ━━━`);
    lastOutcome = await play();
    console.log(`Result:`, JSON.stringify(lastOutcome, null, 2));

    if (lastOutcome.secured) {
      console.log('\n✅✅✅ SECURED!');
      writeFileSync(resolve(__dirname, 'gauntlet-outcome.json'), JSON.stringify(lastOutcome));
      writeFileSync(resolve(__dirname, 'gauntlet-report.md'),
        `# Gauntlet Report\n\nSecured on attempt ${i}!\n\n\`\`\`json\n${JSON.stringify(lastOutcome, null, 2)}\n\`\`\``);
      return;
    }
    console.log(`→ secured=${lastOutcome.secured} waves=${lastOutcome.waves} gold=${lastOutcome.gold}`);
  }

  console.log(`\nFailed after 10 attempts.`);
  writeFileSync(resolve(__dirname, 'gauntlet-report.md'),
    `# Gauntlet Report\n\nFailed after 10 attempts.\n\nLast outcome:\n\`\`\`json\n${JSON.stringify(lastOutcome, null, 2)}\n\`\`\``);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });