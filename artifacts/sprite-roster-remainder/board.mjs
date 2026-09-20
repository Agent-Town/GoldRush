// Animator-board probe for the sprite-roster-remainder task.
// Models scripts/review-sprite-idle.mjs's in-page harness: it builds one SpriteAnimator per slot,
// drives `walk` through all eight headings, records every source frame key each heading reaches,
// and renders one contact board per slot (the eight headings, same gait phase, left to right).
// Usage: node artifacts/sprite-roster-remainder/board.mjs <before|after> [slot,slot,...]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const label = process.argv[2] ?? 'before';
const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
const base = process.env.GOLD_RUSH_REVIEW_URL ?? 'http://127.0.0.1:5400/';
const out = path.join('artifacts/sprite-roster-remainder', label);
fs.mkdirSync(out, { recursive: true });

const SLOTS = [
  'char.hero',
  'char.baron',
  'char.claim_jumper',
  'char.bandit_base',
  'char.bandit_thief',
  'char.e2.rail_tough',
  'char.e2.steam_wrecker',
  'char.e2.coal_thief',
  'char.e6.feral_toaster',
  'char.e6.lawn_shepherd',
  'char.e6.glowjack',
  'char.e7.rogue_automaton',
  'char.e7.data_rustler',
  'char.e8.scrap_corsair',
  'char.e8.sun_glare_shambler',
  'char.e9.feral_terraformer',
  'char.e9.claim_jump_prospect_drone',
  'char.prospector_agent',
].filter((slot) => !only || only.has(slot));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const url = new URL(base);
url.search = '?debug&nowaves&nolevel';
await page.goto(url.href);
await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.loaded, null, { timeout: 120000 });
await page.keyboard.press('KeyP');

const rows = [];
for (const slot of SLOTS) {
  const result = await page.evaluate(async (slotId) => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const { SpriteAnimator, spriteAnimationDiagnostics } = await import('/src/assets/SpriteAnimator.ts');
    const DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];
    document.getElementById('roster-board')?.remove();
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(1200, 190);
    renderer.setClearColor('#ded5b9');
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 1.25, -1.25, 0.1, 20);
    camera.position.z = 5;
    const actors = [];
    for (const [i, dir] of DIRS.entries()) {
      const material = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.05, depthWrite: false });
      const sprite = new THREE.Sprite(material);
      sprite.position.set(-7 + i * 2, 0, 0);
      sprite.scale.set(2, 2, 1);
      scene.add(sprite);
      actors.push({ dir, material, sprite, animator: new SpriteAnimator(slotId, material, sprite) });
    }
    const perDirection = [];
    for (const a of actors) {
      const start = performance.now();
      while (!a.material.map) {
        a.animator.update(1 / 30, 'walk', a.dir);
        await new Promise(requestAnimationFrame);
        if (performance.now() - start > 45000) throw new Error(`animator load timeout ${slotId}`);
      }
      const keys = new Set();
      for (let i = 0; i < 128; i++) {
        a.animator.update(1 / 30, 'walk', a.dir);
        const d = spriteAnimationDiagnostics()[slotId];
        keys.add(d.sourceFrameKey ?? d.frameKey);
      }
      // Settle the heading for the board. NEVER reset() here: reset drops the direction, and the
      // re-resolve starts an orientation fade whose OLD half is the slot fallback — which is the
      // slot's SOUTH cell, so a reset board draws eight south-facing figures no matter what the
      // contract says (measured on char.baron, 2026-09-17). Twenty in-direction updates finish any
      // fade in flight and leave every heading on the same gait phase, since every heading ran the
      // same number of updates above.
      for (let i = 0; i < 20; i++) a.animator.update(1 / 30, 'walk', a.dir);
      const d = spriteAnimationDiagnostics()[slotId];
      perDirection.push({
        direction: a.dir,
        sources: [...keys].sort(),
        resolved: d.direction ?? null,
        boardKey: d.sourceFrameKey ?? d.frameKey,
        mirrored: d.mirrored ?? null,
      });
    }
    renderer.render(scene, camera);
    const host = document.createElement('div');
    host.id = 'roster-board';
    Object.assign(host.style, { position: 'fixed', top: '0', left: '0', zIndex: '999999', background: '#ded5b9', width: '1200px' });
    const title = document.createElement('div');
    title.textContent = `${slotId} — s sw w nw n ne e se`;
    title.style.font = '15px sans-serif';
    title.style.padding = '4px 6px';
    host.append(title);
    const img = new Image();
    img.src = renderer.domElement.toDataURL();
    img.style.width = '1200px';
    host.append(img);
    document.body.append(host);
    await img.decode();
    for (const a of actors) { a.animator.dispose(); a.material.dispose(); }
    renderer.dispose();
    return perDirection;
  }, slot);

  await page.locator('#roster-board').screenshot({ path: path.join(out, `${slot.replace(/\./g, '_')}.png`) });
  const uniqueSets = new Set(result.map((r) => JSON.stringify(r.sources)));
  const distinctHeadings = uniqueSets.size;
  rows.push({ slot, distinctHeadings, directions: result });
  console.log(`${slot.padEnd(36)} distinct facings ${distinctHeadings}/8  ${result.map((r) => r.direction + '=' + shortFamily(r.sources[0])).join(' ')}`);
}

fs.writeFileSync(path.join(out, 'rows.json'), JSON.stringify({ label, errors, rows }, null, 2) + '\n');
if (errors.length) console.log('CONSOLE/PAGE ERRORS:', JSON.stringify(errors, null, 2));
await page.close();
await browser.close();

function shortFamily(key) {
  if (!key) return '?';
  return String(key).replace(/^char-/, '').replace(/-r\d+c\d+\.png$/, '').replace(/\.png$/, '');
}
