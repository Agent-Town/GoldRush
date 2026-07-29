import { chromium } from '@playwright/test';

const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('usage: node scripts/herald-dev-weight.mjs <dev-server-port>');
}

const browser = await chromium.launch();
const page = await browser.newPage();
const images = [];
page.on('response', async (response) => {
  if (response.request().resourceType() !== 'image' || !response.ok()) return;
  images.push(response.body().then((body) => ({
    file: new URL(response.url()).pathname.split('/').pop(),
    bytes: body.length,
  })));
});

try {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.getByTestId('profile-name-input').fill('Herald Weight');
  await page.getByTestId('profile-create').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.getByTestId('town-herald-badge').click();
  await page.getByTestId('gazette-first-issue').waitFor();
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  const heraldImages = await page.locator('img').evaluateAll((elements) => elements
    .filter((image) => /\/(?:herald-engraving|gazette-panel)-/.test(image.currentSrc))
    .map((image) => ({ file: new URL(image.currentSrc).pathname.split('/').pop(), width: image.naturalWidth })));
  if (heraldImages.length !== 10 || heraldImages.some(({ width }) => width === 0)) {
    throw new Error(`Expected 10 decoded Herald images, got ${JSON.stringify(heraldImages)}.`);
  }

  const rows = await Promise.all(images);
  const total = rows.reduce((sum, row) => sum + row.bytes, 0);
  const heraldTotal = rows
    .filter((row) => /^(?:herald-engraving|gazette-panel)-/.test(row.file))
    .reduce((sum, row) => sum + row.bytes, 0);
  for (const row of rows.sort((a, b) => a.file.localeCompare(b.file))) {
    console.log(`${row.bytes}\t${row.file}`);
  }
  console.log(`HERALD ART TOTAL\t${heraldTotal}`);
  console.log(`TOTAL\t${total}`);
  if (heraldTotal >= 4_000_000) throw new Error(`Herald dev-path art exceeds 4,000,000 B: ${heraldTotal} B measured.`);
} finally {
  await browser.close();
}
