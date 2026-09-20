import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chromium',headless:true}),page=await browser.newPage();
try{
 await page.goto('http://127.0.0.1:5247/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&tier=full&seed=homemaker-9000');
 await page.waitForFunction(()=>window.__GR_TEST__&&window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId==='e6-glow-mesa');await page.waitForTimeout(1000);
 const rows=await page.locator('img').evaluateAll(images=>images.map(i=>({src:i.getAttribute('src'),currentSrc:i.currentSrc,complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,visible:i.getClientRects().length>0,outer:i.outerHTML.slice(0,500)})));
 for(const r of rows.filter(i=>i.visible&&i.complete&&!i.naturalWidth)){const response=await page.request.get(r.currentSrc);r.response={status:response.status(),contentType:response.headers()['content-type'],bodyPrefix:(await response.text()).slice(0,80)};}
 await writeFile('artifacts/boss-fidelity/e6-homemaker/bundle-preview-v12/image-inspection.json',JSON.stringify({scope:'Visible DOM images in the isolated full bundle. Diagnostic only; no product edits.',rows},null,2)+'\n');
}catch(e){throw e;}finally{await browser.close();}
