import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import {
  charterJson,
  charterLineageRootId,
  compiledCharterJson,
  parseCharter,
} from '../src/charter/CharterSchema';
import { stampCharter } from '../src/charter/CharterStamp';
import { getPostCreditsCharter, THE_RIVER_CHARTER } from '../src/charter/TheRiver';
import { contractDescriptorJson, loadContract } from '../src/meta/ContractFamilies';

const THE_CLAIM_SHA256 = 'a940bc45ce0a575c9581167d13158c237b819e2ad81aad78caecccbfcacc5311';

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test('THE RIVER imports, round-trips, re-stamps, and leaves The Claim untouched', async () => {
  const assetText = await readFile(new URL('../assets/charters/the-river.json', import.meta.url), 'utf8');
  const imported = parseCharter(assetText);
  expect(imported.ok, imported.ok ? '' : JSON.stringify(imported.reasons)).toBe(true);
  if (!imported.ok) return;

  expect(imported.charter).toEqual(THE_RIVER_CHARTER);
  expect(getPostCreditsCharter()).toEqual(THE_RIVER_CHARTER);
  expect(getPostCreditsCharter()).not.toBe(THE_RIVER_CHARTER);
  expect(charterLineageRootId(imported.charter)).toBe('the-claim');
  expect(imported.charter.envelope.provenance).toMatchObject({
    author: 'The Charter Press',
    note: "E1's first claim, re-inked in dawn light: no enemies, no waves, one pan.",
  });
  expect(imported.charter.envelope.runPolicy).toEqual({ waves: 'none' });

  const stamped = stampCharter(imported.charter);
  expect(stamped.ok, stamped.ok ? '' : JSON.stringify(stamped.reasons)).toBe(true);
  if (!stamped.ok) return;
  expect(stamped.document).toBe(compiledCharterJson(imported.charter));

  const reparsed = parseCharter(charterJson(imported.charter));
  expect(reparsed.ok, reparsed.ok ? '' : JSON.stringify(reparsed.reasons)).toBe(true);
  if (reparsed.ok) {
    const restamped = stampCharter(reparsed.charter);
    expect(restamped.ok, restamped.ok ? '' : JSON.stringify(restamped.reasons)).toBe(true);
    if (restamped.ok) expect(restamped.document).toBe(stamped.document);
  }

  const shippedClaim = contractDescriptorJson(loadContract('the-claim', 'epoch-1-frontier'));
  expect(createHash('sha256').update(shippedClaim).digest('hex')).toBe(THE_CLAIM_SHA256);
  test.info().annotations.push({
    type: 'round-trip',
    description: `THE RIVER import -> stamp -> re-import -> stamp: ${createHash('sha256').update(stamped.document).digest('hex')}`,
  });
});

test('THE RIVER stamps and boots as a real run with zero errors', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  const charter = getPostCreditsCharter();
  const stamped = stampCharter(charter);
  expect(stamped.ok, stamped.ok ? '' : JSON.stringify(stamped.reasons)).toBe(true);
  if (!stamped.ok) return;

  await page.addInitScript(
    (text) => localStorage.setItem('gr.profile.v2.robin.gr.charterShelf.v1', JSON.stringify([text])),
    charterJson(charter),
  );
  await page.goto('/?editor&debug&contract=the-claim&nowaves&nolevel&nokill&nopause&seed=cp05-river');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('press-shelf-row')).toContainText('The River');
  await page.getByTestId('press-launch-0').click();
  await page.waitForURL((url) => url.searchParams.get('contract') === 'the-claim' && url.searchParams.has('nowaves') && !url.searchParams.has('editor'));
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The River');
  await expect(page.getByTestId('contract-briefing-dismiss')).toBeVisible();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('the-claim');
  expect(errors).toEqual({ console: [], page: [] });
});
