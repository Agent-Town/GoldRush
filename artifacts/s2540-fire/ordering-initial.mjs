import {chromium} from '/private/tmp/gr-gate-s2540/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 let release; const gate=new Promise(ok=>release=ok); let requested=false;
 await page.route('**/src/story/index.ts*',async route=>{requested=true; await gate; await route.continue()});
 await page.goto('http://127.0.0.1:5330/',{waitUntil:'domcontentloaded'});
 await page.getByTestId('profile-name-input').fill('Ordering');
 await page.getByTestId('profile-create').click();
 await page.waitForFunction(()=> (window.__GR_TOWN_DIAGNOSTICS__?.frame??0)>10,null,{timeout:30000});
 const before=await page.evaluate(()=>({frames:window.__GR_TOWN_DIAGNOSTICS__?.frame,story:typeof window.__GR_STORY__}));
 assert.equal(requested,true);assert.equal(before.story,'undefined');
 release(); await page.waitForFunction(()=>Boolean(window.__GR_STORY__),null,{timeout:30000});
 const after=await page.evaluate(()=>({story:typeof window.__GR_STORY__,later:window.__GR_STORY__.pending().filter(id=>/^e(?:[2-9]|10)-/.test(id))}));
 assert.equal(after.story,'object');assert.deepEqual(after.later,[]);
 console.log(JSON.stringify({arrangement:'hold story module response until town frames exist; then release',before,after},null,2));
} finally {await browser.close()}
