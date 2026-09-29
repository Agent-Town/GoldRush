// scripts/launch-video/cut/contact-sheet.mjs: the evidence sheets of the cut (task launch-video-cut-3, scope 8):
// twelve frames at the beats' key times from the master and from the vertical, each captioned with its beat, its
// timecode and its source, laid out by headless Chromium (no drawtext here) with every request refused.
// Usage: node scripts/launch-video/cut/contact-sheet.mjs --out artifacts/launch-video-cut-3
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { BEATS, FORMATS, VERSION } from './edl.mjs';
import { CUT, WORK, bytes, ensureDir, fmtTime, run } from './lib.mjs';

const { values: args } = parseArgs({ options: { out: { type: 'string', default: 'artifacts/launch-video-cut-3' } } });
const dir = ensureDir(path.join(WORK, 'contact'));
const fonts = JSON.parse(readFileSync(path.join(WORK, 'fonts', 'fonts.json'), 'utf8'));
const face = (family) => { const f = fonts.faces.find((x) => x.family === family); return `@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${readFileSync(f.file).toString('base64')}) format('truetype')}`; };
const SHEETS = [
  { fmt: 'master', file: 'storyboard-contact-sheet.jpg', cols: 4, cellW: 460, title: 'the master, 1920x1200' },
  { fmt: 'vertical', file: 'vertical-contact-sheet.jpg', cols: 6, cellW: 300, title: 'the vertical, 1080x1920' },
];

const browser = await chromium.launch({ headless: true });
let refused = 0;
for (const sheet of SHEETS) {
  const src = path.join(CUT, FORMATS[sheet.fmt].file);
  const cells = [];
  for (const beat of BEATS) {
    const png = path.join(dir, `${sheet.fmt}-${beat.id}.png`);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-ss', `${beat.key}`, '-i', src, '-frames:v', '1', '-vf', `scale=${sheet.cellW * 2}:-2:flags=lanczos`, png]);
    const [f0, f1] = beat.frames;
    cells.push(`<figure><img src="data:image/png;base64,${readFileSync(png).toString('base64')}"><figcaption><b>${beat.id} · ${fmtTime(beat.key)}</b> (beat ${fmtTime(f0 / 60)} to ${fmtTime(f1 / 60)})<br>${beat.title.replace(/</g, '&lt;')}</figcaption></figure>`);
  }
  const html = `<html><head><style>${face('Rye')}${face('Wellfleet')}
    body{margin:0;background:#2e1b0e;color:#f5e6c8;font-family:Wellfleet,Georgia,serif;width:1920px}
    h1{font-family:Rye,Georgia,serif;font-weight:400;font-size:40px;margin:22px 30px 4px;color:#f5e6c8}
    p.sub{margin:0 30px 16px;font-size:20px;color:#ffe4a0}
    main{display:grid;grid-template-columns:repeat(${sheet.cols},${sheet.cellW}px);gap:18px 20px;padding:0 30px 26px;justify-content:center}
    figure{margin:0;background:#f5e6c8;border:3px solid #c4883a;border-radius:6px;padding:6px;color:#2e1b0e}
    img{width:100%;display:block;border:1px solid #2e1b0e}
    figcaption{font-size:17px;line-height:1.25;padding:6px 2px 2px}</style></head>
    <body><h1>What is a claim? · the cut ${VERSION}</h1><p class="sub">${sheet.title}: one frame per beat at its key time, from ~/.goldrush/launch-video/cut/${FORMATS[sheet.fmt].file}</p><main>${cells.join('')}</main></body></html>`;
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.route('**/*', (route) => { refused += 1; return route.abort(); });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(ensureDir(args.out), sheet.file);
  await page.screenshot({ path: out, type: 'jpeg', quality: 80, fullPage: true });
  await ctx.close();
  console.log(`contact-sheet: ${out} ${bytes(out)} B`);
}
await browser.close();
console.log(`contact-sheet: browser requests refused ${refused}`);
