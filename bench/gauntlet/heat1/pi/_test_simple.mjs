import { spawn } from 'child_process';

const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02']);
let buf = '';
let turn = 0;

const orders = [
  [{verb:'BUILD',what:'palisade',where:{x:0,z:10},when:{goldGte:10}}],
  [{verb:'BUILD',what:'palisade',where:{x:2,z:10},when:{goldGte:10}}],
  [{verb:'BUILD',what:'palisade',where:{x:-2,z:10},when:{goldGte:10}}],
  [{verb:'BUILD',what:'sentry_beacon',where:{x:0,z:8},when:{goldGte:15}}],
  [{verb:'BUILD',what:'sluice',where:{x:-10,z:3},when:{goldGte:40}}],
  [{verb:'HOLD',pos:{x:0,z:12}}]
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
        console.log('TURN ' + turn + ' W' + w + ' g:' + g + ' hp:' + hp + ' thr:' + t + ' works:' + works + ' bk:' + bk);
        if (turn < orders.length) {
          sim.stdin.write(JSON.stringify(orders[turn]) + '\n');
        } else {
          sim.stdin.write(JSON.stringify(orders[orders.length-1]) + '\n');
        }
        turn++;
      }
    } catch(e) {
      console.log('PARSE ERROR:', line.slice(0,100));
    }
  }
});

sim.stderr.on('data', (chunk) => {
  const m = chunk.toString().trim();
  if (m && !m.includes('ExperimentalWarning')) console.log('STDERR:', m);
});

sim.on('close', () => process.exit(0));
setTimeout(() => { sim.kill(); process.exit(0); }, 60000);