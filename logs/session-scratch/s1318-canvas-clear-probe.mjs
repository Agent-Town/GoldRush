// s1318 probe — F-1316-1 drain, ghosting risk.
// The merged diff DELETED `context.clearRect(...)` from drawTextTexture and relies solely on
// assigning `canvas.width` to reset the bitmap. The lane only exercised width CHANGES
// (short->long->short). The untested case is short->short, where the computed width is IDENTICAL.
// Question: in this Chromium, does assigning canvas.width its EXISTING value still clear?
// If it does not, a pooled slot redrawing "+12" over "+7" ghosts both strings.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const result = await page.evaluate(() => {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  const inkCount = () => {
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) n++;
    return n;
  };

  // Draw the first short float exactly as Vfx does.
  ctx.font = '700 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('+12', canvas.width / 2, canvas.height / 2);
  const afterFirstDraw = inkCount();

  // The pooled-reuse path: drawTextTexture assigns the SAME width (192) for another short string.
  canvas.width = 192;
  const afterSameWidthAssign = inkCount();

  // Control: a genuinely different width, the case the lane did test.
  ctx.font = '700 64px Georgia, serif';
  ctx.fillText('+12', 96, 48);
  const beforeWidthChange = inkCount();
  canvas.width = 768;
  const afterWidthChange = inkCount();

  return { afterFirstDraw, afterSameWidthAssign, beforeWidthChange, afterWidthChange };
});

console.log(JSON.stringify(result, null, 2));
console.log(
  result.afterSameWidthAssign === 0
    ? 'VERDICT: same-value width assignment CLEARS the bitmap — removing clearRect is safe, no ghosting.'
    : `VERDICT: same-value width assignment LEFT ${result.afterSameWidthAssign} inked pixels — GHOSTING REGRESSION.`,
);
await browser.close();
