// F-NCS-5 / F-NCS-6 — the eight-heading probe, carried forward from
// `artifacts/needs-cells-art-batch/direction-probe.mjs` with two changes and no others: the default
// base is this task's port (5309) and the output file carries a PHASE so the BEFORE and AFTER arms
// sit beside each other. Owner ruling 2026-09-19, verbatim: "I agree with all your recommendations
// on the decisions - good work", taking (a) on F-NCS-5: wake the Claim Jumper.
//
//   PHASE=before node artifacts/rulings-play-2026-09-19/direction-probe.mjs
//
// Eight-heading resolution probe, modelled on scripts/review-enemy-sprites.mjs: spawn one body per
// family through the real EnemyPool, then drive its animator to each of the eight headings and read
// back the cell the runtime actually selects. This is the "each new heading renders its own facing"
// proof: before this batch four of the machines' headings resolved to a SIDE row's cells.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
const BASE = process.env.NCB_BASE ?? 'http://127.0.0.1:5309';
const OUT = 'artifacts/rulings-play-2026-09-19';
const PHASE = process.env.PHASE ?? 'after';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`${BASE}/?debug&nowaves&nolevel`);
await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.loaded);
const out = await page.evaluate(async () => {
  const THREE = await import('/node_modules/.vite/deps/three.js');
  const { EnemyPool } = await import('/src/entities/pools.ts');
  const camera = new THREE.OrthographicCamera(-4, 4, 2, -2, 0.1, 100);
  const pool = new EnemyPool(camera);
  const cases = [
    ['char.baron', { eliteKind: 'baron' }],
    ['char.claim_jumper', { jumper: true }],
    ['char.e2.steam_wrecker', { variantId: 'steam_wrecker', wrecker: true }],
    ['char.e2.coal_thief', { variantId: 'coal_thief', thief: true }],
  ];
  const rows = [];
  for (const [slot, params] of cases) {
    pool.recycleAll();
    const e = pool.spawn(new THREE.Vector3(-2, 0, 0), { ...params, carriedLantern: false });
    const tick = () => { pool.update(1 / 60, () => new THREE.Vector3(8, 0, 0), () => false); pool.applyRenderInterpolation(1); };
    const start = performance.now();
    do { tick(); await new Promise(requestAnimationFrame); if (performance.now() - start > 45000) { rows.push({ slot, error: 'load timeout' }); break; } }
    while (!(pool.spriteAnimations.get(e.id)?.animator?.currentFrame));
    const sa = pool.spriteAnimations.get(e.id);
    if (!sa) { rows.push({ slot, error: 'no animator' }); continue; }
    const byDirection = {};
    for (const d of ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw']) {
      sa.animator.reset('walk');
      sa.animator.update(0, 'walk', d, false, 3, 3);
      byDirection[d] = sa.animator.currentFrame?.key ?? null;
    }
    rows.push({ slot: sa.slotId ?? slot, byDirection });
  }
  return rows;
});
await browser.close();
const stem = (k) => (k || '').replace(/-r\d+c\d+\.png$/, '');
for (const r of out) {
  if (r.error) { console.log(r.slot, 'ERROR', r.error); continue; }
  console.log(`\n${r.slot}`);
  const seen = new Map();
  for (const [d, k] of Object.entries(r.byDirection)) {
    const s = stem(k);
    seen.set(s, (seen.get(s) ?? []).concat(d));
    console.log(`  ${d.padEnd(3)} ${k}`);
  }
  const shared = [...seen.entries()].filter(([, ds]) => ds.length > 1);
  console.log(`  distinct plates: ${seen.size}/8` + (shared.length ? `; shared: ${shared.map(([s, ds]) => `${ds.join('+')}=${s}`).join(', ')}` : '; every heading its own plate'));
}
console.log('\nconsole/page errors:', errors.length);
writeFileSync(`${OUT}/direction-probe-${PHASE}.json`, JSON.stringify({ at: new Date().toISOString(), rows: out, errors }, null, 1));
