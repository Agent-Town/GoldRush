import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const results = { boots: [], seams: [], lifecycle: null };
try {
  for (const viewport of [{width:1280,height:800},{width:390,height:844}]) {
    for (const scene of ['menu', 'town', 'run']) {
      const page = await browser.newPage({viewport});
      const errors = [];
      page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => localStorage.setItem('gr.profile.v2',JSON.stringify({version:2,activeId:'plain-audio',profiles:[{id:'plain-audio',name:'Audio',createdAt:1,updatedAt:1,difficultyPreset:'trail',hintsSeen:[]}]})));
      const route = scene === 'run' ? '/?seed=audio-plain' : '/';
      await page.goto('http://127.0.0.1:5188'+route);
      if (scene === 'town') await page.getByTestId('start-menu-enter-town').click();
      await page.getByTestId(scene === 'run' ? 'hud-vitals' : scene === 'town' ? 'town-ui' : 'start-menu').waitFor();
      await page.waitForTimeout(2500);
      results.boots.push({viewport, scene, route, errors});
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5188/');
  results.lifecycle = await page.evaluate(async () => {
    const {SoundSystem, buildingShotGain} = await import('/src/audio/SoundSystem.ts');
    const audio = new SoundSystem();
    const context = audio.ensureContext();
    await context.resume();
    audio.unlocked = true;
    audio.desiredLoops.set('title-theme',1);
    await audio.startLoop('title-theme',1);
    const loop = audio.loops.get('title-theme');
    const sources = [...loop.musicSources];
    const events = [];
    for (const source of sources) source.addEventListener('ended', () => events.push(context.currentTime));
    const initial = loop.envelope.gain.value;
    await new Promise(r=>setTimeout(r,1050));
    const fadedIn = loop.envelope.gain.value;
    const started = context.currentTime;
    audio.stopLoop('title-theme');
    await new Promise(r=>setTimeout(r,250));
    const fadingOut = loop.envelope.gain.value;
    const stillRunning = context.state;
    await new Promise(r=>setTimeout(r,350));
    const ended = events.map(t=>t-started);
    await audio.startLoop('title-theme',1);
    audio.dispose();
    const disposalInitial = context.state;
    await new Promise(r=>setTimeout(r,650));
    return {initial,fadedIn,fadingOut,stillRunning,ended,disposalInitial,disposalFinal:context.state,
      distances:[0,10,25,60,100].map(d=>[d,buildingShotGain(d)])};
  });
  const life=results.lifecycle;
  assert(life.initial < .1 && life.fadedIn > .99 && life.fadingOut < .15);
  assert(life.ended.length===2 && life.ended.every(t=>t>=.49 && t<.56));
  assert.equal(life.disposalInitial,'running'); assert.equal(life.disposalFinal,'closed');
  for (const [name,fade,gap] of [['title-theme',3,.465],['era-e1-frontier-loop',3,.085],['era-e2-steamworks-loop',1,.180],['era-e3-voltage-loop',3,.490]]) {
    const measured = await page.evaluate(async ({name,fade,gap}) => {
      const {SoundSystem} = await import('/src/audio/SoundSystem.ts');
      const {soundUrlLoader} = await import('/src/audio/manifest.ts');
      const sr=24000;
      const decoder = new OfflineAudioContext(2,1,sr);
      const buffer = await decoder.decodeAudioData(await (await fetch(await soundUrlLoader(name)())).arrayBuffer());
      const stride=buffer.duration-gap-fade;
      const context=new OfflineAudioContext(2,Math.ceil((buffer.duration+1)*sr),sr);
      const gain=new GainNode(context); gain.connect(context.destination);
      const loop={musicSources:new Set(),envelope:gain,gain};
      const audio={context,disposed:true,loops:new Map()};
      const pass=SoundSystem.prototype.startMusicPass;
      pass.call(audio,name,loop,buffer,0,{fade,gap},true);
      pass.call(audio,name,loop,buffer,stride,{fade,gap},false);
      const rendered=await context.startRendering();
      const a=rendered.getChannelData(0), b=rendered.getChannelData(1);
      const db=x=>20*Math.log10(Math.max(x,1e-12));
      let minRms=Infinity, maxStep=0, peak=0;
      // Scan the overlap and the original wrap (including the formerly silent gap).
      for(let s=Math.floor(stride*sr); s<(buffer.duration+.5)*sr; s+=Math.round(.05*sr)) {
        let energy=0;
        for(let i=s;i<Math.min(a.length,s+.1*sr);i++) energy+=(a[i]**2+b[i]**2)/2;
        minRms=Math.min(minRms,Math.sqrt(energy/(.1*sr)));
      }
      for(let i=Math.floor(stride*sr);i<a.length;i++) {
        maxStep=Math.max(maxStep,Math.abs(a[i]-a[i-1]),Math.abs(b[i]-b[i-1]));
        peak=Math.max(peak,Math.abs(a[i]),Math.abs(b[i]));
      }
      return {name,fade,gap,stride,minSeam100msRmsDbfs:db(minRms),maxSeamSampleStep:maxStep,peakDbfs:db(peak)};
    },{name,fade,gap});
    assert(measured.minSeam100msRmsDbfs > -40, `${name} has a silent seam`);
    results.seams.push(measured);
  }
  console.log(JSON.stringify(results,null,2));
} finally {
  await writeFile('artifacts/audio-harshness-1/runtime-checks.json',JSON.stringify(results,null,2)+'\n');
  await browser.close();
}
