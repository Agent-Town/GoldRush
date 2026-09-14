import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

// Reuse the full-loop/failure probe for the late-epoch directional repairs.
const family = process.env.GOLD_RUSH_REVIEW_FAMILY ?? 'feral_toaster';
const matches = JSON.parse(fs.readFileSync('assets/layer-contracts/characters.v2.json')).slots.filter(s => s.slot.endsWith(`.${family}`));
assert.equal(matches.length, 1, `Expected one character slot for ${family}`);
const [slot] = matches;
const id = slot.slot;
assert.ok(slot?.walk8?.enabled, `No active directional contract for ${id}`);
const hardCuts = slot.clips.walk.frameBlendMs === 0;
const directionFiles = Object.fromEntries(Object.entries(slot.walk8.directions).map(([dir, source]) => [dir, source.frames.files]));
const fallbackFiles = slot.frames.files;
assert.equal(new Set(Object.values(directionFiles).flat()).size, 64);
const entryFile = directionFiles.s[0];
const out = process.env.GOLD_RUSH_SPRITE_EVIDENCE ?? `artifacts/sol/sprite-roster-fixes-20260908/${family === 'feral_toaster' ? 'toaster' : family.replaceAll('_', '-')}-directions/runtime`;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const reports = [];
const modes = process.argv.length > 2 ? process.argv.slice(2) : ['normal', 'missing-entry', 'broken-cell', 'broken-row'];
assert.ok(modes.every(m => ['normal', 'missing-entry', 'broken-cell', 'broken-row'].includes(m)));
try {
  for (const width of [1280, 390]) {
    for (const mode of modes) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 2 });
      page.setDefaultTimeout(60000);
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      if (mode === 'missing-entry') await page.route('**/src/assets/SpriteAnimator.ts*', async route => {
        const response = await route.fetch();
        const source = await response.text();
        assert.ok(source.includes(entryFile));
        const key = JSON.stringify(`../../assets/processed/${entryFile}`) + ':';
        assert.ok(source.includes(key), 'presence-map entry found');
        await route.fulfill({ response, body: source.replace(key, '"../../assets/processed/absent-toaster-cell.png":') });
      });
      if (mode === 'broken-cell' || mode === 'broken-row') {
        const broken = new Set(mode === 'broken-row' ? directionFiles.w : [directionFiles.w[3]]);
        await page.route('**/assets/processed/*.png*', route => route.request().resourceType() === 'image' && broken.has(path.basename(new URL(route.request().url()).pathname))
          ? route.fulfill({ status: 200, contentType: 'image/png', body: 'invalid PNG: controlled decode failure' }) : route.continue());
      }
      const url = new URL(process.env.GOLD_RUSH_REVIEW_URL ?? 'http://127.0.0.1:5319/');
      url.search = '?debug&nowaves&nolevel&epoch=epoch-6-atomic&seed=toaster-directions';
      await page.goto(url.href);
      const begin = page.getByRole('button', { name: 'Begin', exact: true });
      if (await begin.isVisible()) await begin.click();
      await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.loaded);
      await page.keyboard.press('KeyP');
      const result = await page.evaluate(async ({ width, mode, id, hardCuts, directionFiles, fallbackFiles }) => {
        const THREE = await import('/node_modules/.vite/deps/three.js');
        const { SpriteAnimator, spriteAnimationDiagnostics } = await import('/src/assets/SpriteAnimator.ts');
        const { Balance } = await import('/src/game/Balance.ts');
        const check = (ok, why) => { if (!ok) throw Error(why); };
        const host = document.createElement('div'); host.id = 'toaster-review';
        Object.assign(host.style, { position: 'absolute', inset: '0 auto auto 0', width: width + 'px', zIndex: 999999, background: '#ded5b9', color: '#241b15', font: '14px sans-serif' });
        document.body.append(host);
        const renderer = new THREE.WebGLRenderer({ alpha: true, preserveDrawingBuffer: true });
        const cell = width === 390 ? 97 : 160;
        renderer.setSize(cell, cell); renderer.setPixelRatio(2); renderer.setClearColor('#ded5b9', 1);
        const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-.5, .5, .5, -.5, .1, 10);
        camera.position.z = 3;
        const material = new THREE.SpriteMaterial({ transparent: true, alphaTest: .35, depthWrite: false });
        const sprite = new THREE.Sprite(material); scene.add(sprite);
        const animator = new SpriteAnimator(id, material, sprite); const start = performance.now();
        do {
          animator.update(1 / 60, 'walk', 's'); await new Promise(requestAnimationFrame);
          if (performance.now() - start > 45000) throw Error(`${id} load timeout`);
        } while (!spriteAnimationDiagnostics()[id]?.loaded);
        const samples = [];
        for (const dir of ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se']) {
          const missingCell = mode === 'missing-entry' || (['broken-cell', 'broken-row'].includes(mode) && dir === 'w');
          const label = document.createElement('div'); label.textContent = `${dir.toUpperCase()} · frames 1–8${missingCell ? ' · original fallback' : ''}`; host.append(label);
          const row = document.createElement('div'); Object.assign(row.style, { display: 'grid', gridTemplateColumns: `repeat(${width === 390 ? 4 : 8}, ${cell}px)` }); host.append(row);
          animator.update(.25, 'idle', dir); animator.reset('walk');
          const frames = new Map(); const order = []; let sawFrameBlend = false;
          for (let step = 0; step < 310; step++) {
            animator.update(.01, 'walk', dir);
            const d = spriteAnimationDiagnostics()[id];
            check(d.frameCount === 8, 'eight-frame loop required');
            if (hardCuts) check(!d.frameBlendActive, 'clip must not blend displaced silhouettes');
            sawFrameBlend ||= !!d.frameBlendActive;
            check(missingCell || d.direction === dir, 'requested direction was not selected');
            const source = d.sourceFrameKey ?? d.frameKey;
            check((missingCell ? fallbackFiles : directionFiles[dir]).includes(source), 'wrong source family or direction');
            check(d.fps === Balance.anim.walkFps * 2, 'eight-frame gait must retain existing Balance cadence');
            const selected = animator.currentFrame.key;
            if (order.at(-1) !== selected) order.push(selected);
            // Diagnostics.frame follows the dominant crossfade; sourceFrameKey
            // names the incoming frame. Sample only when those agree.
            if (step > 200 && d.frameKey === source && !frames.has(animator.frameIndex)) {
              renderer.render(scene, camera); frames.set(animator.frameIndex, { source, png: renderer.domElement.toDataURL() });
            }
          }
          check(frames.size === 8, 'all eight frames must be visible');
          if (!hardCuts && Balance.anim.frameBlendMs > 0) check(sawFrameBlend, 'default frame blending must remain active');
          check(Math.abs(order.length - 3.1 * Balance.anim.walkFps * 2) <= 2, 'selected frames must advance at the unchanged runtime cadence');
          for (const [frame, value] of [...frames].sort((a, b) => a[0] - b[0])) {
            const img = new Image(); img.src = value.png; img.style.width = cell + 'px'; row.append(img);
          }
          animator.update(0, 'idle', dir); const held = animator.currentFrame;
          for (let i = 0; i < 20; i++) animator.update(.1, 'idle', dir);
          check(animator.currentFrame === held, 'idle must hold its own facing');
          samples.push({ direction: dir, frameSources: [...frames].sort((a, b) => a[0] - b[0]).map(([frame, value]) => ({ frame, source: value.source })), transitions: order.length, sawFrameBlend, runtimeFps: Balance.anim.walkFps * 2, idleHeld: true });
        }
        await Promise.all([...host.querySelectorAll('img')].map(i => i.decode()));
        const texture = animator.currentFrame.texture;
        const atlas = { width: texture.image.width, height: texture.image.height };
        const unique = new Set(samples.flatMap(s => s.frameSources.map(f => f.source))).size;
        check(unique === (mode === 'missing-entry' ? 8 : 64), `directional source coverage: ${unique}`);
        animator.dispose(); material.dispose(); renderer.dispose();
        return { samples, unique, atlas };
      }, { width, mode, id, hardCuts, directionFiles, fallbackFiles });
      await page.locator('#toaster-review').screenshot({ path: path.join(out, `${width}-${mode}.png`) });
      assert.deepEqual(errors, []);
      reports.push({ width, mode, errors, ...result });
      console.log(JSON.stringify({ width, mode, unique: result.unique, atlas: result.atlas }));
      await page.close();
    }
  }
  fs.writeFileSync(path.join(out, process.argv.length > 2 ? `results-${modes.join('-')}.json` : 'results.json'), JSON.stringify(reports, null, 2) + '\n');
} finally { await browser.close(); }
