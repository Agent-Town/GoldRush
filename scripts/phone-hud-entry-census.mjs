#!/usr/bin/env node
// Run against the lane's dev server: node scripts/phone-hud-entry-census.mjs before|after
// Plain launch, no debug flags or simulation hooks. Run-6's colour-key mask is unchanged.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';

export const EVIDENCE = 'artifacts/sol/map-art-campaign-2/run-8/phone-hud';
export const MAPS = ['e8-low-orbit', 'e9-seed-run', 'e10-archive-world', 'e7-dead-band', 'e7-relay-rush', 'e6-glow-mesa'];
export const UI_SOURCES = ['src/ui/Hud.ts', 'src/ui/BuildButton.ts', 'src/ui/ProspectorPanel.ts', 'src/ui/WorldInfoNotes.ts', 'src/styles.css', 'src/ui/theme.css'];
export const KEEP = '#game-canvas,.hud-panel,.hud-panel *,.hud-pause,.hud-pause *,.world-info-note,.world-info-note *,#touch-controls,#touch-controls *,.building-context-prompt,.building-context-prompt *';
export function sourceHash() {
  return createHash('sha256').update(UI_SOURCES.map(p => p + '\n' + readFileSync(p, 'utf8')).join('\n')).digest('hex');
}
export function unionArea(boxes, width, height) {
  const clipped = boxes.map(b => ({ x: Math.max(0, b.x), y: Math.max(0, b.y), right: Math.min(width, b.x + b.width), bottom: Math.min(height, b.y + b.height) })).filter(b => b.right > b.x && b.bottom > b.y);
  const xs = [...new Set(clipped.flatMap(b => [b.x, b.right]))].sort((a, b) => a - b);
  let area = 0;
  for (let i = 1; i < xs.length; i++) {
    const spans = clipped.filter(b => b.x < xs[i] && b.right > xs[i - 1]).sort((a, b) => a.y - b.y);
    let bottom = 0;
    for (const b of spans) { area += (xs[i] - xs[i - 1]) * Math.max(0, b.bottom - Math.max(bottom, b.y)); bottom = Math.max(bottom, b.bottom); }
  }
  return area;
}
export function magentaMask(buffer) {
  const { data, width, height } = PNG.sync.read(buffer);
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) mask[i] = Number(data[i * 4] / 255 > .7 && data[i * 4 + 1] / 255 < .24 && data[i * 4 + 2] / 255 > .7);
  return { mask, width, height };
}
export function coverage(body, persistent) {
  assert.equal(body.mask.length, persistent.mask.length);
  let bodyPixels = 0, coveredPixels = 0;
  for (let i = 0; i < body.mask.length; i++) if (body.mask[i]) { bodyPixels++; if (!persistent.mask[i]) coveredPixels++; }
  return { bodyPixels, coveredPixels, persistentHudCoveragePercent: bodyPixels ? coveredPixels * 100 / bodyPixels : null };
}

export async function census(phase, { maps = MAPS, widths = [390, 1280] } = {}) {
  assert.ok(['before', 'after'].includes(phase));
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chromium' });
  const report = { phase, capturedAt: new Date().toISOString(), sourceHash: sourceHash(), method: 'Plain contract entry at 10 simulation seconds. Run-6 persistent selector and magenta threshold. Union is painted pixels over a magenta backdrop; clipped rectangle union is also retained. Zero-pixel landmarks are OFFSCREEN, never counted as zero coverage.', rows: [] };
  mkdirSync(EVIDENCE, { recursive: true });
  try {
    for (const map of maps) for (const width of widths) {
      const height = width === 390 ? 844 : 800;
      const folder = `${EVIDENCE}/${map}`;
      mkdirSync(folder, { recursive: true });
      const config = JSON.parse(readFileSync(`artifacts/sol/map-art-campaign-2/run-6/${map}/capture-config.json`, 'utf8'));
      const focuses = [...new Set(config.stations.filter(s => s[1] === 'entry' && s[4] !== 'before').map(s => s[0]))];
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width === 390, hasTouch: width === 390 });
      page.setDefaultTimeout(120_000);
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(e.message));
      // Rendering-only instrumentation. The normal frame uses the original materials.
      await page.route('**/src/world/Terrain3dClaimPilot.ts*', async route => {
        const response = await route.fetch();
        let body = await response.text();
        assert.equal(body.split('model.name = mount.id;').length, 2);
        body = body.replace('model.name = mount.id;', 'model.name = mount.id; (window.__HUD_CENSUS_MODELS__??=new Map()).set(mount.id,model); window.__HUD_CENSUS_THREE__=THREE;');
        await route.fulfill({ response, body });
      });
      const base = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5312';
      await page.goto(base);
      await page.evaluate(async id => { (await import('/src/meta/ContractUnlock.ts')).setPreviewUnlockAll(true); (await import('/src/meta/ContractFamilies.ts')).stagePlayerContractLaunch(id); }, map);
      await page.goto(`${base}/?contract=${map}&seed=map-art-campaign-2`);
      await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
      const begin = page.getByTestId('contract-briefing-dismiss');
      if (await begin.isVisible()) await begin.click();
      await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__.timeAlive >= 10);
      const prefix = `${folder}/${phase}-${width}`;
      await page.screenshot({ path: `${prefix}-plain.png` });
      const state = await page.evaluate(() => ({ contract: window.__THREE_GAME_DIAGNOSTICS__.contract.activeId, hero: window.__THREE_GAME_DIAGNOSTICS__.heroPos, timeAlive: window.__THREE_GAME_DIAGNOSTICS__.timeAlive, testHook: typeof window.__GR_TEST__, renderSource: document.querySelector('#game-canvas').dataset.terrain3dPilotRenderSource }));
      assert.equal(state.contract, map); assert.equal(state.testHook, 'undefined'); assert.equal(state.renderSource, 'glb');
      const persistentStyle = await page.addStyleTag({ content: `body *{visibility:hidden!important}${KEEP}{visibility:visible!important}#game-canvas{filter:none!important;transition:none!important}` });
      const panels = await page.evaluate(() => [...document.querySelectorAll('.hud-panel,.hud-pause,.world-info-note,.building-context-prompt,#touch-stick,#touch-controls button')].flatMap(el => {
        const b = el.getBoundingClientRect(), s = getComputedStyle(el);
        if (!b.width || !b.height || s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return [];
        return [{ id: el.dataset.testid ?? el.id ?? el.className, box: { x: b.x, y: b.y, width: b.width, height: b.height }, text: el.textContent.trim().replace(/\s+/g, ' ') }];
      }));
      for (const panel of panels) panel.screenPercent = unionArea([panel.box], width, height) * 100 / (width * height);
      // Opaque backing placed between world and UI; the exact run-6 mask determines covered pixels.
      await page.evaluate(() => { const b = document.createElement('div'); b.id = 'hud-census-backdrop'; b.style.cssText = 'position:fixed;inset:0;background:#ff00ff;z-index:4;visibility:visible!important;pointer-events:none'; document.body.append(b); });
      const union = magentaMask(await page.screenshot({ path: `${prefix}-union-mask.png` }));
      const unionPercent = (union.mask.length - union.mask.reduce((a, b) => a + b, 0)) * 100 / union.mask.length;
      await page.locator('#hud-census-backdrop').evaluate(el => el.remove());
      const landmarks = [];
      for (const focus of focuses) {
        await page.evaluate(focus => window.__HUD_CENSUS_MODELS__.get(focus).traverse(n => { if (n.isMesh) { n.userData.hudCensusMaterial = n.material; n.material = new window.__HUD_CENSUS_THREE__.MeshBasicMaterial({ color: 0xff00ff, side: 2, toneMapped: false, fog: false }); } }), focus);
        const noHud = await page.addStyleTag({ content: 'body *{visibility:hidden!important}#hud,#hud *,#touch-controls,#touch-controls *{visibility:hidden!important}#game-canvas{visibility:visible!important}' });
        const body = magentaMask(await page.screenshot({ path: `${prefix}-${focus}-body-mask.png` }));
        await noHud.evaluate(el => el.remove());
        const hud = magentaMask(await page.screenshot({ path: `${prefix}-${focus}-persistent-mask.png` }));
        landmarks.push({ focus, ...coverage(body, hud) });
        await page.evaluate(focus => window.__HUD_CENSUS_MODELS__.get(focus).traverse(n => { if (n.isMesh && n.userData.hudCensusMaterial) { n.material.dispose(); n.material = n.userData.hudCensusMaterial; delete n.userData.hudCensusMaterial; } }), focus);
      }
      await persistentStyle.evaluate(el => el.remove());
      report.rows.push({ map, width, height, ...state, unionPercent, rectangleUnionPercent: unionArea(panels.map(p => p.box), width, height) * 100 / (width * height), panels, landmarks, errors });
      writeFileSync(`${EVIDENCE}/${phase}.json`, JSON.stringify(report, null, 2) + '\n');
      console.log(map, width, 'union', unionPercent.toFixed(2), 'landmarks', landmarks.map(l => `${l.focus}:${l.persistentHudCoveragePercent?.toFixed(2) ?? 'OFFSCREEN'}`).join(', '));
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await census(process.argv[2] ?? 'after', { maps: process.env.MAP ? [process.env.MAP] : MAPS, widths: process.env.WIDTH ? [Number(process.env.WIDTH)] : [390, 1280] });
}
