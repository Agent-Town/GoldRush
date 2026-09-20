import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
await p.goto('http://127.0.0.1:5305/?debug&nowaves&nolevel');
await p.waitForTimeout(20000);
const d = await p.evaluate(() => {
  const g = window.__THREE_GAME_DIAGNOSTICS__;
  return { present: !!g, keys: g ? Object.keys(g).slice(0, 12) : null,
    anims: g?.spriteAnimations ? Object.keys(g.spriteAnimations) : null,
    hero: g?.spriteAnimations?.['char.hero'] ?? null };
});
console.log(JSON.stringify(d, null, 1));
console.log('errors:', errs.length ? errs.slice(0, 6) : 'none');
await b.close();
