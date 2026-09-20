// s1265 — ask chromium, in THIS shell, what renders its WebGL.
// F-1264-3 hunt: the divergence is concurrency-only and these are three.js/WebGL tests.
// If the fire shell falls back to software rasterisation and the lane shell does not,
// that reproduces the exact signature (serial fine, 6-concurrent 5x worse).
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');
const info = await page.evaluate(() => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return { ok: false, reason: 'no webgl context at all' };
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    ok: true,
    vendor: gl.getParameter(gl.VENDOR),
    renderer: gl.getParameter(gl.RENDERER),
    unmaskedVendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : '(no debug ext)',
    unmaskedRenderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '(no debug ext)',
    version: gl.getParameter(gl.VERSION),
  };
});
console.log('node    : ' + process.version);
console.log(JSON.stringify(info, null, 2));
await browser.close();
process.exit(0);
