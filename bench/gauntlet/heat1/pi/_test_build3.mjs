import { spawn } from 'child_process';

const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02']);
let buf = '';
let turn = 0;
let lastWave = -1;

sim.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  const lines = buf.split('\n');
  buf = lines.pop() || '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.secured !== undefined) {
        console.log('OUTCOME:', JSON.stringify(parsed));
        sim.stdin.end();
        setTimeout(() => sim.kill(), 100);
        return;
      }
      if (parsed.schema === 'goldrush.view.v1') {
        const w = parsed.now.wave;
        const g = parsed.now.gold;
        const t = parsed.now.threats?.alive || 0;
        const hp = parsed.now.hero?.hp;
        const bk = Object.keys(parsed.now.works?.byKind || {});
        const standing = parsed.now.works?.standing || 0;
        if (w !== lastWave || turn % 30 === 0) {
          console.log(`T${turn} W${w} g:${g} hp:${hp} thr:${t} wks:${standing} bk:[${bk.join(',')}]`);
          lastWave = w;
        }
        
        // Get current build counts
        const beacons = (parsed.now.works?.byKind?.sentry_beacon || []).length;
        const palisades = (parsed.now.works?.byKind?.palisade || []).length;
        const sluices = (parsed.now.works?.byKind?.sluice || []).length;
        const turrets = (parsed.now.works?.byKind?.turret || []).length;
        const stockpiles = (parsed.now.works?.byKind?.stockpile || []).length;
        const boilers = (parsed.now.works?.byKind?.boiler_house || []).length;
        const assays = (parsed.now.works?.byKind?.assay_office || []).length;

        // Order set: harvest first for gold, then build non-overlapping
        const orders = [
          { verb: 'HARVEST', seam: 'gold-seam-2' },
          { verb: 'HARVEST', seam: 'gold-seam-1' },
        ];

        // Palisades at z=6 (bank, north of river which is z=-5 to z=5)
        // Palisade footprint: {w:1, d:3} so they need 3z spacing
        if (palisades < 6) {
          const paliZ = 6;
          const paliX = [-8, -4, 0, 4, 8, 12];
          if (palisades < paliX.length) {
            orders.push({ verb: 'BUILD', what: 'palisade', where: {x: paliX[palisades], z: paliZ}, when: {goldGte: 10} });
          }
        }

        // Sentry beacon (footprint 1x1) - place away from palisades
        if (beacons < 2) {
          const bx = beacons === 0 ? -10 : 10;
          orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: {x: bx, z: 5.5}, when: {goldGte: 15} });
        }

        // Stockpile (footprint 1.5x1.5) - at claim center
        if (stockpiles < 1) {
          orders.push({ verb: 'BUILD', what: 'stockpile', where: {x: 0, z: 10}, when: {goldGte: 60} });
        }

        // Sluice (footprint 2x1, river-adjacent) - near river south bank
        if (sluices < 2) {
          const sx = sluices === 0 ? -10 : 10;
          orders.push({ verb: 'BUILD', what: 'sluice', where: {x: sx, z: -4.5}, when: {goldGte: 40} });
        }

        // Turrets (footprint 1x1) - on the bank
        if (turrets < 2) {
          const tx = turrets === 0 ? -5 : 5;
          orders.push({ verb: 'BUILD', what: 'turret', where: {x: tx, z: 6}, when: {goldGte: 50} });
        }

        // Boiler house (2x2) 
        if (boilers < 1 && g >= 70) {
          orders.push({ verb: 'BUILD', what: 'boiler_house', where: {x: -6, z: 12}, when: {goldGte: 70} });
        }

        // Assay office (2x1.5, river-adjacent)
        if (assays < 1 && g >= 75) {
          orders.push({ verb: 'BUILD', what: 'assay_office', where: {x: 6, z: 12}, when: {goldGte: 75} });
        }

        orders.push({ verb: 'REPAIR_UNDER', pct: 50 });
        orders.push({ verb: 'FALLBACK_IF', threat: {enemiesGte: 10}, pos: {x: 0, z: 12} });
        orders.push({ verb: 'HOLD', pos: {x: 0, z: 10} });

        sim.stdin.write(JSON.stringify(orders) + '\n');
        turn++;
        if (turn > 2000) { sim.kill(); }
      }
    } catch(e) {
      console.log('PARSE ERR');
    }
  }
});

sim.stderr.on('data', (chunk) => {
  const m = chunk.toString().trim();
  if (m && !m.includes('ExperimentalWarning') && !m.includes('localStorage')) console.log('STDERR:', m);
});

sim.on('close', () => process.exit(0));
setTimeout(() => { sim.kill(); process.exit(0); }, 120000);