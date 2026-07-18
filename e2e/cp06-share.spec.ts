import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { charterCode, exportCharterText, importCharterCode, importCharterText, repressCharter } from '../src/charter/CharterShare';
import { charterJson } from '../src/charter/CharterSchema';
import { THE_RIVER_CHARTER } from '../src/charter/TheRiver';

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test('file, code, and lineage round-trip preserve THE RIVER', () => {
  const source = charterJson(THE_RIVER_CHARTER);
  const exported = exportCharterText(THE_RIVER_CHARTER);
  expect(exported.ok).toBe(true);
  if (!exported.ok) return;
  expect(exported.text).toBe(source);

  const imported = importCharterText(exported.text);
  expect(imported.ok).toBe(true);
  if (!imported.ok) return;
  expect(imported.text).toBe(source);
  expect(imported.charter).toEqual(THE_RIVER_CHARTER);

  const coded = charterCode(THE_RIVER_CHARTER);
  expect(coded.ok && coded.code).toBeTruthy();
  if (!coded.ok || !coded.code) return;
  const decoded = importCharterCode(coded.code);
  expect(decoded.ok).toBe(true);
  if (decoded.ok) expect(decoded.text).toBe(source);

  const refused = importCharterCode(`${coded.code.slice(0, -8)}NOT-CODE`);
  expect(refused.ok).toBe(false);
  if (!refused.ok) expect(refused.reasons[0]).toMatchObject({ code: 'charter_code_unreadable' });

  const repressed = repressCharter(imported.charter, 'Robin', () => '2026-07-18T12:00:00.000Z');
  expect(repressed.envelope.provenance.author).toBe('The Charter Press');
  expect(repressed.envelope.provenance.createdAt).toBe(THE_RIVER_CHARTER.envelope.provenance.createdAt);
  expect(repressed.envelope.provenance.lineage.slice(0, -1)).toEqual(THE_RIVER_CHARTER.envelope.provenance.lineage);
  expect(repressed.envelope.provenance.lineage.at(-1)).toBe('Robin · 2026-07-18T12:00:00.000Z');
  expect(exportCharterText(repressed).ok).toBe(true);
});

test('THE POST exports, imports, refuses corruption, re-presses honestly, and boots clean', async ({ page, context }) => {
  test.setTimeout(90_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errors = collectErrors(page);
  const source = charterJson(THE_RIVER_CHARTER);
  await page.addInitScript(
    (text) => localStorage.setItem('gr.profile.v2.robin.gr.charterShelf.v1', JSON.stringify([text])),
    source,
  );
  await page.goto('/?editor&debug&contract=the-claim&nowaves&nolevel&nokill&nopause&seed=cp06-share');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.getByTestId('press-shelf-row')).toContainText('first pressed by The Charter Press');
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('press-export-file-0').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('the-claim.charter.json');
  expect(await readFile(await download.path()!, 'utf8')).toBe(source);

  await page.getByTestId('press-copy-code-0').click();
  await expect(page.getByTestId('press-share-status')).toHaveText('Charter code copied.');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const decoded = importCharterCode(copied);
  expect(decoded.ok).toBe(true);
  if (decoded.ok) expect(decoded.text).toBe(source);

  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((entry) => entry.includes('gr.charterShelf.v1'))!;
    localStorage.setItem(key, '[]');
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.getByTestId('press-import-file').setInputFiles({ name: 'the-river.charter.json', mimeType: 'application/json', buffer: Buffer.from(source) });
  await expect(page.getByTestId('press-share-status')).toContainText('first author and lineage intact');
  await expect(page.getByTestId('press-shelf-row')).toContainText('The River');

  await page.getByTestId('press-repress-0').click();
  await expect(page.getByTestId('press-share-status')).toContainText('The Charter Press remains the first author');
  const shelf = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((entry) => entry.includes('gr.charterShelf.v1'))!;
    return JSON.parse(localStorage.getItem(key)!) as string[];
  });
  expect(shelf).toHaveLength(2);
  expect(JSON.parse(shelf[1]!).envelope.provenance).toMatchObject({ author: 'The Charter Press' });
  expect(JSON.parse(shelf[1]!).envelope.provenance.lineage.at(-1)).toMatch(/^Robin · /);

  await page.getByTestId('press-import-code').fill('damaged-charter-code');
  await page.getByTestId('press-import-code-submit').click();
  await expect(page.getByTestId('press-share-status')).toContainText('refused');
  await expect(page.getByTestId('press-share-reasons')).toContainText('damaged or incomplete');

  await page.getByTestId('press-launch-0').click();
  await page.waitForURL((url) => url.searchParams.get('contract') === 'the-claim' && url.searchParams.has('nowaves') && !url.searchParams.has('editor'));
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The River');
  expect(errors).toEqual({ console: [], page: [] });
});
