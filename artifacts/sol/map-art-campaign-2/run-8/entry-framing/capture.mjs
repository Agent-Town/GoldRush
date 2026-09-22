// Ordinary boots; the route adds read-only camera/scene handles and frame samples.
// Only the before arm suppresses the new entry hook. No debug flag or sim hook.
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const id = process.argv[2], root = 'artifacts/sol/map-art-campaign-2/run-8/entry-framing';
const name = id.replace(/^e\d+-/, '');
const durationOnly = process.argv.includes('--duration');
const entry = JSON.parse(readFileSync(`assets/pilots/map-rebuild-spike/${name}-terrain-contract.json`)).entryLandmark;
assert.ok(entry);
const out = `${root}/${id}`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const width of [1280, 390]) for (const arm of (durationOnly ? ['after'] : ['before', 'after'])) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 }, deviceScaleFactor: 1, isMobile: width === 390, hasTouch: width === 390 });
    page.setDefaultTimeout(120000);
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/src/game/Game.ts*', async route => {
      const response = await route.fetch(); let body = await response.text();
      if (arm === 'before') body = body.replace('this.cameraRig.tryEntryGlance(this.activeContract.id, this.scene, this.renderer);', '/* baseline: no entry glance */');
      const line = 'this.cameraRig.update(delta, cameraTarget, this.localActor.velocity);';
      assert.equal(body.split(line).length, 2);
      body = body.replace(line, `${line}
        window.__ENTRY_CONTEXT__ = {rig:this.cameraRig, camera:this.camera, scene:this.scene, renderer:this.renderer};
        if (window.__ENTRY_RECORD__) {
          const r=window.__ENTRY_RECORD__, c=this.camera;
          r.seconds=(r.seconds??0)+delta;
          if (r.samples.length<600) r.samples.push({t:performance.now(),presentationSeconds:r.seconds,elapsed:this.cameraRig.entryGlance?.elapsed??null,checked:this.cameraRig.entryChecked,position:c.position.toArray(),quaternion:c.quaternion.toArray(),focus:this.cameraRig.focus.toArray()});
        }`);
      await route.fulfill({ response, body });
    });
    await page.goto('http://127.0.0.1:5303/');
    await page.evaluate(async id => { (await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true); (await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch(id); }, id);
    await page.goto(`http://127.0.0.1:5303/?contract=${id}&seed=map-art-campaign-2`);
    await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted' && window.__ENTRY_CONTEXT__);
    assert.equal(await page.evaluate(() => typeof window.__GR_TEST__), 'undefined');
    await page.evaluate(() => { window.__ENTRY_RECORD__ = { samples: [] }; });
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible()) await dismiss.click();
    const row = { width, arm, entry, errors, frames: {} };
    const shot = async label => {
      row.frames[label] = await page.evaluate(mountId => {
        const {rig,camera,scene,renderer}=window.__ENTRY_CONTEXT__, model=scene.getObjectByName(mountId);
        return { t:performance.now(), elapsed:rig.entryGlance?.elapsed??null, pixels:rig.bodyPixels(model,scene,renderer), position:camera.position.toArray(), quaternion:camera.quaternion.toArray(), focus:rig.focus.toArray(), hero:window.__THREE_GAME_DIAGNOSTICS__.heroPos, timeAlive:window.__THREE_GAME_DIAGNOSTICS__.timeAlive };
      }, entry.mountId);
      await page.screenshot({ path: `${out}/${label}-${width}.png` });
    };
    if (arm === 'before') {
      await page.waitForTimeout(500);
      await shot('rest');
    } else {
      await page.waitForFunction(() => window.__ENTRY_CONTEXT__.rig.entryChecked);
      row.triggered = await page.evaluate(() => window.__ENTRY_RECORD__.samples.some(s => s.elapsed !== null));
      if (durationOnly) await page.waitForTimeout(4500);
      else {
        if (row.triggered) await page.waitForFunction(() => (window.__ENTRY_CONTEXT__.rig.entryGlance?.elapsed ?? 0) >= 1.1);
        else await page.waitForTimeout(1100);
        await shot('peak');
        await page.waitForFunction(() => !window.__ENTRY_CONTEXT__.rig.entryGlance);
        await page.waitForTimeout(1500);
        await shot('return');
      }
      // Freeze only the CAMERA poses for diagnostic body census, after ordinary captures.
      // No sim advance, teleport, hidden HUD or gameplay change was used above.
      row.census = await page.evaluate(mountId => {
        const {rig,camera,scene,renderer}=window.__ENTRY_CONTEXT__, model=scene.getObjectByName(mountId);
        const position=camera.position.clone(), quaternion=camera.quaternion.clone();
        const samples=window.__ENTRY_RECORD__.samples, picked=[];let last=-Infinity;
        const start=samples.find(s=>s.checked)?.t??samples[0].t;
        try {
          for(const s of samples){
            if(s.t<start||s.t-start>4000||s.t-last<50)continue;last=s.t;
            camera.position.fromArray(s.position);camera.quaternion.fromArray(s.quaternion);camera.updateMatrixWorld(true);
            picked.push({...s,seconds:(s.t-start)/1000,pixels:rig.bodyPixels(model,scene,renderer)});
          }
        } finally {camera.position.copy(position);camera.quaternion.copy(quaternion);camera.updateMatrixWorld(true);}
        return {method:'Depth-tested opaque landmark body at recorded live camera poses; final frozen scene; at least 50 ms between samples.',samples:picked};
      }, entry.mountId);
      writeFileSync(`${out}/${durationOnly?'duration':'camera'}-trace-${width}.json`, JSON.stringify(await page.evaluate(() => window.__ENTRY_RECORD__), null, 2)+'\n');
    }
    row.dataset = await page.evaluate(() => ({...document.querySelector('#game-canvas').dataset}));
    rows.push(row);
    writeFileSync(`${out}/${durationOnly?'duration':'captures'}.json`, JSON.stringify(rows, null, 2)+'\n');
    assert.deepEqual(errors, []);
    console.log(id, width, arm, Object.fromEntries(Object.entries(row.frames).map(([k,v])=>[k,v.pixels])), row.triggered);
    await page.close();
  }
} finally { await browser.close(); }
