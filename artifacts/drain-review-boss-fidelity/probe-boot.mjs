import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch({ channel: 'chromium', headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs=[], warns=[];
p.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text().slice(0,300)); if (m.type()==='warning') warns.push('warn: '+m.text().slice(0,200)); });
p.on('pageerror', e => errs.push('pageerror: '+e.message.slice(0,400)));
p.on('requestfailed', r => errs.push('reqfail: '+r.url().slice(-80)+' '+(r.failure()?.errorText)));
await p.goto(url, { waitUntil:'load', timeout: 90000 });
for (const s of [3,8,15,25,40]) {
  await p.waitForTimeout(s*1000 - (s===3?0:0));
  const st = await p.evaluate(() => ({ grtest: Boolean(window.__GR_TEST__), diag: Boolean(window.__THREE_GAME_DIAGNOSTICS__), frame: window.__THREE_GAME_DIAGNOSTICS__?.frame ?? null, canvas: Boolean(document.querySelector('canvas')), body: document.body.innerText.slice(0,160).replace(/\n/g,' | ') }));
  console.log('t~'+s+'s', JSON.stringify(st));
  if (st.frame && st.frame > 10) break;
}
console.log('ERRORS('+errs.length+'):'); for (const e of errs.slice(0,12)) console.log('  '+e);
console.log('WARNS('+warns.length+'):'); for (const w of warns.slice(0,6)) console.log('  '+w);
await b.close();
