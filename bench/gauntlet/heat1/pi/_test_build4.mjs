import { spawn } from 'child_process';

// Test: Can we even build without any harvest interference?
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
        const hp = parsed.now.hero?.hp;
        const standing = parsed.now.works?.standing || 0;
        const bk = parsed.now.works?.byKind || {};
        const wrecked = parsed.now.works?.wrecked || 0;
        
        // Detailed logging
        console.log(`T${turn} W${w} g:${g} hp:${hp} stand:${standing} wreck:${wrecked} pali:${(bk.palisade||[]).length} sentry:${(bk.sentry_beacon||[]).length} sluice:${(bk.sluice||[]).length}`);
        
        // Wave 0: Build with goldGte:0 (no condition) - if we start with 0 gold, this should fire if placement is valid
        if (w === 0) {
          // Just build a palisade - no condition, no harvest
          const orders = [
            { verb: 'BUILD', what: 'palisade', where: {x: 0, z: 8}, when: {goldGte: 0} },
          ];
          sim.stdin.write(JSON.stringify(orders) + '\n');
        } else if (w === 1 && g >= 0) {
          // Wave 1: try building more
          const orders = [
            { verb: 'HARVEST', seam: 'gold-seam-2' },
            { verb: 'BUILD', what: 'palisade', where: {x: 0, z: 8}, when: {goldGte: 0} },
            { verb: 'BUILD', what: 'sentry_beacon', where: {x: -6, z: 8}, when: {goldGte: 0} },
            { verb: 'BUILD', what: 'stockpile', where: {x: 3, z: 8}, when: {goldGte: 0} },
          ];
          sim.stdin.write(JSON.stringify(orders) + '\n');
        } else {
          const orders = [
            { verb: 'HARVEST', seam: 'gold-seam-2' },
            { verb: 'HOLD', pos: {x: 0, z: 12} },
          ];
          sim.stdin.write(JSON.stringify(orders) + '\n');
        }
        turn++;
        if (turn > 100) { sim.kill(); process.exit(0); }
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
setTimeout(() => { sim.kill(); process.exit(0); }, 60000);