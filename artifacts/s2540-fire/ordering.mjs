import {chromium} from '/private/tmp/gr-gate-s2540/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 let release, arrived; const gate=new Promise(ok=>release=ok); const requestedGate=new Promise(ok=>arrived=ok); let requested=false;
 await page.route('**/src/story/index.ts*',async route=>{requested=true; arrived(); await gate; await route.continue()});
 await page.goto('http://127.0.0.1:5330/',{waitUntil:'domcontentloaded'});
 let timer; try {await Promise.race([requestedGate,new Promise((_,bad)=>{timer=setTimeout(()=>bad(new Error('story request absent')),30000)})]);}finally{clearTimeout(timer)}
 const before=await page.evaluate(()=>({story:typeof window.__GR_STORY__}));
 assert.equal(requested,true);assert.equal(before.story,'undefined');
 release(); await page.waitForFunction(()=>Boolean(window.__GR_STORY__),null,{timeout:30000});
 const after=await page.evaluate(()=>({story:typeof window.__GR_STORY__,later:window.__GR_STORY__.pending().filter(id=>/^e(?:[2-9]|10)-/.test(id))}));
 assert.equal(after.story,'object');assert.deepEqual(after.later,[]);
 console.log(JSON.stringify({arrangement:'hold story module response; observe absent reader; then release',before,after},null,2));
} finally {await browser.close()}
