import { spawn } from 'child_process';

const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02']);
let buf = '';
let turn = 0;

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
        const bk = JSON.stringify(Object.keys(parsed.now.works?.byKind || {}));
        const sx = parsed.now.hero?.x;
        const sz = parsed.now.hero?.z;
        const standing = parsed.now.works?.standing || 0;
        console.log(`T${turn} W${w} g:${g} hp:${hp} thr:${t} wks:${standing} pos:(${sx},${sz}) bk:${bk}`);

        // Build orders based on state
        const orders = [];
        
        // Harvest active seams
        const seams = (parsed.now.seams || []).filter(s => s.active);
        for (const s of seams) {
          orders.push({ verb: 'HARVEST', seam: s.id });
        }
        
        // BUILD palisades on the NORTH BANK (river is z=-5 to z=5, ford at x=0)
        // Place palisades along z=6 (just north of river) and z=16 (north perimeter)
        if (w < 3) {
          // Early: defend the ford crossing
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: -3, z: 6}, when: {goldGte: 10} });
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: 3, z: 6}, when: {goldGte: 10} });
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: -6, z: 6}, when: {goldGte: 10} });
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: 6, z: 6}, when: {goldGte: 10} });
          // Sentry beacon
          orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: {x: 0, z: 8}, when: {goldGte: 15} });
          // Sluice near river (placement: river-adjacent)
          orders.push({ verb: 'BUILD', what: 'sluice', where: {x: -8, z: 5}, when: {goldGte: 40} });
        } else {
          // Later waves: more perimeter + turrets
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: -8, z: 16}, when: {goldGte: 10} });
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: 8, z: 16}, when: {goldGte: 10} });
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: -3, z: 16}, when: {goldGte: 10} });
          orders.push({ verb: 'BUILD', what: 'palisade', where: {x: 3, z: 16}, when: {goldGte: 10} });
          orders.push({ verb: 'BUILD', what: 'turret', where: {x: 0, z: 6}, when: {goldGte: 50} });
          orders.push({ verb: 'BUILD', what: 'stockpile', where: {x: 0, z: 10}, when: {goldGte: 60} });
        }
        
        // Repair + hold
        orders.push({ verb: 'REPAIR_UNDER', pct: 50 });
        orders.push({ verb: 'FALLBACK_IF', threat: {enemiesGte: 10}, pos: {x: 0, z: 12} });
        orders.push({ verb: 'HOLD', pos: {x: 0, z: 12} });
        
        sim.stdin.write(JSON.stringify(orders) + '\n');
        turn++;
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