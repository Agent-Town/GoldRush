import { spawn, execSync } from 'child_process';

// Test: harvest first, then build
const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02']);
let buf = '';
let turn = 0;

// Strategy: harvest gold seam 2 (closest to start), then build when we have gold
const orderSets = [
  // Turn 0 (Wave 0): Move to nearest active seam and harvest
  [
    {verb:'MOVE_TO',pos:{x:-9,z:6.7}},
    {verb:'HARVEST',seam:'gold-seam-2'},
    {verb:'BUILD',what:'palisade',where:{x:0,z:10},when:{goldGte:10}},
    {verb:'HOLD',pos:{x:-9,z:6.7}}
  ],
  // Turn 1 (Wave 1): Keep harvesting, queue more defenses
  [
    {verb:'MOVE_TO',pos:{x:-9,z:6.7}},
    {verb:'HARVEST',seam:'gold-seam-2'},
    // Try to build near ford (south approach)
    {verb:'BUILD',what:'palisade',where:{x:-4,z:2},when:{goldGte:10}},
    {verb:'BUILD',what:'palisade',where:{x:4,z:2},when:{goldGte:10}},
    {verb:'HOLD',pos:{x:-9,z:6.7}}
  ],
];

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
        const works = parsed.now.works?.standing || 0;
        const bk = JSON.stringify(Object.keys(parsed.now.works?.byKind || {}));
        const sx = parsed.now.hero?.x;
        const sz = parsed.now.hero?.z;
        const ord = JSON.stringify(parsed.now.orders?.map(o => o.verb));
        console.log(`T${turn} W${w} g:${g} hp:${hp} thr:${t} wks:${works} pos:(${sx},${sz}) bk:${bk} ord:${ord}`);
        
        // Build persistent order set that evolves
        const orders = [
          {verb:'MOVE_TO',pos:{x:-9,z:6.7}},
          {verb:'HARVEST',seam:'gold-seam-2'},
          {verb:'BUILD',what:'palisade',where:{x:-4,z:2},when:{goldGte:10}},
          {verb:'BUILD',what:'palisade',where:{x:4,z:2},when:{goldGte:10}},
          {verb:'BUILD',what:'sentry_beacon',where:{x:0,z:8},when:{goldGte:15}},
          {verb:'REPAIR_UNDER',pct:50},
          {verb:'FALLBACK_IF',threat:{enemiesGte:8},pos:{x:0,z:12}},
          {verb:'HOLD',pos:{x:0,z:12}}
        ];
        // Add more builds based on wave
        if (w >= 2 && g >= 20) {
          orders.push({verb:'BUILD',what:'palisade',where:{x:-6,z:5},when:{goldGte:10}});
          orders.push({verb:'BUILD',what:'palisade',where:{x:6,z:5},when:{goldGte:10}});
        }
        if (g >= 40) {
          orders.push({verb:'BUILD',what:'sluice',where:{x:-7,z:3},when:{goldGte:40}});
        }
        if (g >= 50 && w >= 2) {
          orders.push({verb:'BUILD',what:'turret',where:{x:0,z:1},when:{goldGte:50}});
        }
        
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
setTimeout(() => { sim.kill(); process.exit(0); }, 90000);