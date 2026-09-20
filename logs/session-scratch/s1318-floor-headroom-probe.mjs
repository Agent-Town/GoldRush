// s1318 probe — F-1316-1 drain, forward-looking headroom.
// drawTextTexture shrinks the font until the text fits `canvas.width - 20`, but STOPS at a
// 32 px floor (FLOAT_TEXT_MIN_FONT_PX) whether or not it fits. Below that the old centred-overflow
// defect returns silently — same failure mode F-1316-1 was raised for.
// Today's longest sentence renders at 33 px, ONE px above the floor. Question: how many more
// characters of upgrade copy can be added before a sentence hits the floor and still overflows?
import { chromium } from 'playwright';

const CAP = 192 * 4; // FLOAT_TEXT_MAX_WIDTH
const PAD = 20; // FLOAT_TEXT_PADDING_PX
const FLOOR = 32; // FLOAT_TEXT_MIN_FONT_PX
const LIVE = 'Stockpile Yard II - the yard holds more gold';

const browser = await chromium.launch();
const page = await browser.newPage();
const out = await page.evaluate(
  ({ CAP, PAD, FLOOR, LIVE }) => {
    const ctx = document.createElement('canvas').getContext('2d');
    // Replicate the shipped fit loop exactly.
    const fit = (text) => {
      ctx.font = `700 64px Georgia, serif`;
      const baseWidth = ctx.measureText(text).width;
      const canvasWidth = Math.min(CAP, Math.max(192, Math.ceil((baseWidth + PAD) / 192) * 192));
      let fontPx = 64;
      ctx.font = `700 ${fontPx}px Georgia, serif`;
      while (fontPx > FLOOR && ctx.measureText(text).width > canvasWidth - PAD) {
        fontPx -= 1;
        ctx.font = `700 ${fontPx}px Georgia, serif`;
      }
      const rendered = ctx.measureText(text).width;
      return { fontPx, canvasWidth, rendered, overflows: rendered > canvasWidth - PAD };
    };

    const live = fit(LIVE);
    // Grow the live sentence one character at a time until the fit loop can no longer contain it.
    let text = LIVE;
    let firstOverflow = null;
    for (let i = 0; i < 60; i++) {
      text += 'x';
      const r = fit(text);
      if (r.overflows) {
        firstOverflow = { chars: text.length, added: text.length - LIVE.length, ...r };
        break;
      }
    }
    return { live: { chars: LIVE.length, ...live }, firstOverflow };
  },
  { CAP, PAD, FLOOR, LIVE },
);

console.log(JSON.stringify(out, null, 2));
if (out.firstOverflow) {
  console.log(
    `VERDICT: the shipped fit loop silently re-opens F-1316-1 at ${out.firstOverflow.chars} characters ` +
      `— only ${out.firstOverflow.added} more than today's longest sentence (${out.live.chars}).`,
  );
} else {
  console.log('VERDICT: no overflow within +60 characters — headroom is ample.');
}
await browser.close();
