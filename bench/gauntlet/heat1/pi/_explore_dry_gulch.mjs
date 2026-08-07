/**
 * Exploration script for e1-dry-gulch
 * Runs with idle policy to see what happens without orders
 */
import { spawn } from 'child_process';

async function explore() {
  const sim = spawn('node', [
    'scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'e1-dry-gulch-01', '--policy', 'idle'
  ], { stdio: ['pipe', 'pipe', 'pipe'] });

  let buf = '';
  let turnCount = 0;

  sim.stdout.on('data', (chunk) => {
    buf += chunk.toString();
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      turnCount++;
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.secured !== undefined) {
          console.log('\n=== OUTCOME ===');
          console.log(JSON.stringify(parsed, null, 2));
          return;
        }
        if (parsed.schema === 'goldrush.view.v1') {
          const n = parsed.now;
          const s = parsed.stablePrefix;
          console.log(`\n[T${turnCount}] Wave ${n.wave} | gold:${n.gold} | hp:${n.hero.hp}/${n.hero.maxHp} | enemies:${n.threats.alive}${n.threats.state !== 'quiet' ? ` (${n.threats.state} edge:${n.threats.edge})` : ''}`);
          console.log(`  Works: ${JSON.stringify(n.works.byKind)}`);
          console.log(`  Seams active: ${n.seams.filter(s => s.active).map(s => `${s.id}(${s.remaining})`).join(', ')}`);
          if (n.orders && n.orders.length > 0) {
            console.log(`  Orders: ${JSON.stringify(n.orders)}`);
          }
          if (parsed.almanac?.nextWave) {
            const nw = parsed.almanac.nextWave;
            console.log(`  Next wave: ${nw.wave} in ${nw.arrivalInSeconds}s - ${nw.composition?.map(c => `${c.count}x ${c.label}`).join(', ') || 'unknown'}`);
            console.log(`  Expected gold: ${parsed.almanac.projection?.expectedGold?.toFixed(1)}`);
          }
        }
      } catch(e) {
        // Not JSON
      }
      if (turnCount > 80) {
        console.log('\n=== CUTOFF reached ===');
        sim.kill();
        process.exit(0);
      }
    }
  });

  sim.stderr.on('data', (chunk) => {
    const msg = chunk.toString();
    if (msg.includes('rejected')) console.error('STDERR:', msg.trim());
  });

  sim.on('close', (code) => {
    console.log(`\nSim closed with code ${code}`);
    process.exit(0);
  });

  // Wait up to 30s
  setTimeout(() => {
    if (!sim.killed) {
      sim.kill();
      console.log('\n=== TIMEOUT ===');
      process.exit(0);
    }
  }, 30000);
}

explore().catch(e => { console.error(e); process.exit(1); });