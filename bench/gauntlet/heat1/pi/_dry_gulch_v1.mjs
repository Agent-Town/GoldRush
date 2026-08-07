/**
 * Interactive player for e1-dry-gulch - test turret placement
 * Try harvest + build turret strategy
 */
import { spawn } from 'child_process';

const CONTRACT = 'e1-dry-gulch';
const SEED = 'e1-dry-gulch-01';

async function play() {
  const sim = spawn('node', [
    'scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED
  ], { stdio: ['pipe', 'pipe', 'pipe'] });

  let buf = '';
  let turnCount = 0;
  let resolved = false;

  let gold = 0, wave = 0, hp = 100, maxHp = 100;
  let turretCount = 0, palisadeCount = 0;
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
    turretCount = bk.turret ?? 0;
    palisadeCount = bk.palisade ?? 0;
  }

  function generateOrders() {
    const orders = [];
    const activeSeams = seams.filter(s => s.active && s.remaining > 0);
    
    // Build turrets as we can afford them
    // Try a few positions
    if (turretCount < 1 && gold >= 50) {
      orders.push({ verb: 'BUILD', what: 'turret', where: { x: 0, z: 11 }, when: { goldGte: 50 } });
    }
    if (turretCount < 2 && gold >= 120) {
      orders.push({ verb: 'BUILD', what: 'turret', where: { x: 0, z: 14 }, when: { goldGte: 120 } });
    }

    // Harvest active seams
    for (const s of activeSeams) {
      orders.push({ verb: 'HARVEST', seam: s.id });
    }

    // HOLD at claim
    orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });

    return orders;
  }

  function processLine(line) {
    if (!line.trim()) return undefined;
    turnCount++;
    try {
      const parsed = JSON.parse(line);
      if (parsed.secured !== undefined) return parsed;
      if (parsed.schema === 'goldrush.view.v1') {
        parseView(parsed);
        const status = hp > 0 ? `hp:${hp}` : 'DOWN';
        if (turnCount <= 20 || turnCount % 5 === 0 || hp <= 0) {
          console.log(`[T${turnCount}] W${wave} g:${gold} ${status} e:${enemiesAlive} t:${turretCount} p:${palisadeCount} rider:${needsRider}`);
        }

        if (needsRider && hp <= 0) return undefined;

        const orders = generateOrders();
        if (!resolved) {
          sim.stdin.write(JSON.stringify(orders) + '\n');
          // Show first orders
          if (turnCount === 1) console.log('  Orders:', JSON.stringify(orders));
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
      stderrBuf += chunk.toString();
      if (chunk.toString().includes('rejected'))
        console.error('  ⚠️', chunk.toString().trim().slice(0, 200));
    });

    sim.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        try {
          for (const l of (buf + stderrBuf).split('\n')) {
            try { const o = JSON.parse(l.trim()); if (o.secured !== undefined) { resolvePromise(o); return; } } catch(_) {}
          }
        } catch(_) {}
        resolvePromise({ secured: false, waves: wave, gold: gold, error: `closed(code=${code})` });
      }
    });

    sim.on('error', (err) => {
      if (!resolved) { resolved = true; resolvePromise({ secured: false, error: err.message }); }
    });

    setTimeout(() => {
      if (!resolved) { resolved = true; sim.kill('SIGKILL'); resolvePromise({ secured: false, waves: wave, gold: gold, error: 'timeout' }); }
    }, 300000);
  });
}

async function main() {
  console.log('=== DRY GULCH PLAYER v1 ===\n');

  let lastOutcome = null;
  for (let i = 1; i <= 10; i++) {
    console.log(`\n━━━ Attempt ${i} ━━━`);
    lastOutcome = await play();
    console.log(`Result:`, JSON.stringify(lastOutcome, null, 2));

    if (lastOutcome.secured) {
      console.log('\n✅✅✅ SECURED!');
      const { writeFileSync } = await import('fs');
      const { resolve, dirname } = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = dirname(fileURLToPath(import.meta.url));
      writeFileSync(resolve(__dirname, 'gauntlet-outcome.json'), JSON.stringify(lastOutcome));
      writeFileSync(resolve(__dirname, 'gauntlet-report.md'),
        `# Gauntlet Report — Dry Gulch (e1-dry-gulch-01)\n\nSecured on attempt ${i}!\n\n\`\`\`json\n${JSON.stringify(lastOutcome, null, 2)}\n\`\`\``);
      return;
    }
    console.log(`→ secured=${lastOutcome.secured} waves=${lastOutcome.waves} gold=${lastOutcome.gold}`);
  }

  console.log(`\nFailed after 10 attempts.`);
  const { writeFileSync } = await import('fs');
  const { resolve, dirname } = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  writeFileSync(resolve(__dirname, 'gauntlet-report.md'),
    `# Gauntlet Report — Dry Gulch (e1-dry-gulch-01)\n\nFailed after 10 attempts.\n\nLast outcome:\n\`\`\`json\n${JSON.stringify(lastOutcome, null, 2)}\n\`\`\``);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });