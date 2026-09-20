// s1318 — F-1318-1 follow-up. The headroom probe measured only the tier-II stockpile sentence.
// upgradeFloatText interpolates a tier suffix, and "III" is one character longer than "II" —
// and tier 3 stockpiles are REACHABLE IN PLAY TODAY (bt-02b shipped two more courses).
// So: does any string the game can actually produce ALREADY overflow the shipped fit loop?
import { chromium } from 'playwright';

const CAP = 192 * 4;
const PAD = 20;
const FLOOR = 32;

// Transcribed from BuildSystem.upgradeFloatText (4 branches x reachable tiers).
const SUFFIX = ['', 'I', 'II', 'III'];
const build = (id, tier) => {
  const s = SUFFIX[tier] ?? String(tier);
  if (id === 'sluice') return `Sluice ${s} - the works run richer`;
  if (id === 'palisade') return `Palisade ${s} - timber holds longer`;
  if (id === 'stockpile') return `Stockpile Yard ${s} - the yard holds more gold`;
  if (id === 'turret') return `Turret ${s} - brass cadence quickens`;
  throw new Error(`unknown ${id}`);
};
const CASES = [];
for (const id of ['sluice', 'palisade', 'stockpile', 'turret']) for (const tier of [2, 3]) CASES.push({ id, tier, text: build(id, tier) });

const browser = await chromium.launch();
const page = await browser.newPage();
const rows = await page.evaluate(
  ({ CASES, CAP, PAD, FLOOR }) => {
    const ctx = document.createElement('canvas').getContext('2d');
    return CASES.map(({ id, tier, text }) => {
      ctx.font = '700 64px Georgia, serif';
      const baseWidth = ctx.measureText(text).width;
      const canvasWidth = Math.min(CAP, Math.max(192, Math.ceil((baseWidth + PAD) / 192) * 192));
      let fontPx = 64;
      ctx.font = `700 ${fontPx}px Georgia, serif`;
      while (fontPx > FLOOR && ctx.measureText(text).width > canvasWidth - PAD) {
        fontPx -= 1;
        ctx.font = `700 ${fontPx}px Georgia, serif`;
      }
      const rendered = ctx.measureText(text).width;
      const budget = canvasWidth - PAD;
      return { id, tier, chars: text.length, fontPx, canvasWidth, rendered: Math.round(rendered * 100) / 100, budget, OVERFLOWS: rendered > budget, text };
    });
  },
  { CASES, CAP, PAD, FLOOR },
);

for (const r of rows) {
  console.log(
    `${r.OVERFLOWS ? '❌ OVERFLOW' : '✅ fits    '} ${r.id} T${r.tier} chars=${r.chars} font=${r.fontPx}px rendered=${r.rendered} budget=${r.budget}  "${r.text}"`,
  );
}
const bad = rows.filter((r) => r.OVERFLOWS);
console.log(bad.length ? `\nVERDICT: ${bad.length} of ${rows.length} reachable strings ALREADY overflow after the F-1316-1 cure.` : `\nVERDICT: all ${rows.length} reachable strings fit; the hazard is future copy only.`);
await browser.close();
