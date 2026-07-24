import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const SHOT_DIR = path.resolve('artifacts/bug-office-desk');
const MAX_SCREENSHOT_BYTES = 180 * 1024;
const BUILD_VARIANT = process.env.GR_BUILD_VARIANT ?? (process.env.GR_RELEASE === 'e1' ? 'e1-preview' : 'dev');

type Errors = { console: string[]; page: string[] };
type ReportBody = {
  description: string;
  prospectorName?: string;
  screenshot: string;
  diagnostics: {
    contractId: string;
    wave: number;
    position: { x: number; z: number };
    tier: 'FULL' | 'BALANCED' | 'LITE';
    version: string;
  };
};

async function seedTown(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
}

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function openTown(page: Page, query = ''): Promise<void> {
  await page.goto('/');
  if (query) await page.evaluate((search) => history.replaceState(null, '', `/${search}`), query);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 20);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const target = town.buildings.find((building) => building.id === 'assay_office')!.approach;
    town.teleport(target.x, target.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('assay_office');
}

async function shot(page: Page, testInfo: TestInfo, state: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${state}.png`), fullPage: true });
}

function fixturePng(width: number, height: number, noisy = false): Buffer {
  const png = new PNG({ width, height });
  let value = 0x12345678;
  for (let offset = 0; offset < png.data.length; offset += 4) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    png.data[offset] = noisy ? value & 255 : 194;
    png.data[offset + 1] = noisy ? (value >>> 8) & 255 : 52;
    png.data[offset + 2] = noisy ? (value >>> 16) & 255 : 38;
    png.data[offset + 3] = 255;
  }
  return PNG.sync.write(png);
}

function decodedBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Buffer.from(base64, 'base64').length;
}

async function dropPng(page: Page, buffer: Buffer): Promise<boolean> {
  return page.getByTestId('complaint-drop').evaluate((element, base64) => {
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'dropped-fixture.png', { type: 'image/png' }));
    element.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    return (document.querySelector('[data-testid="complaint-submit"]') as HTMLButtonElement).disabled;
  }, buffer.toString('base64'));
}

test('the Assay Office door files a complaint with uploaded evidence, ticket, and bounty', async ({ page }, testInfo) => {
  await seedTown(page);
  const errors = collectErrors(page);
  let posted: ReportBody | undefined;
  await page.route('**/api/bug-report', async (route) => {
    posted = route.request().postDataJSON() as ReportBody;
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'desk-test-42' }) });
  });

  await openTown(page);
  await expect(page.getByTestId('town-approach-prompt')).toContainText('the clerk takes complaints');
  await expect(page.getByTestId('town-open-assay')).toHaveText('Complaints Desk');
  await expect(page.getByTestId('assay-bench')).toHaveCount(0);
  await page.getByTestId('town-open-assay').click();

  const desk = page.getByTestId('complaint-desk');
  await expect(desk).toBeVisible();
  await expect(page.getByTestId('assay-bench')).toHaveCount(0);
  await expect(page.getByTestId('complaint-thumbnail')).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
  const entryMoment = await page.getByTestId('complaint-thumbnail').getAttribute('src');
  const thumbnailSize = await page.getByTestId('complaint-thumbnail').evaluate((image: HTMLImageElement) => ({ width: image.naturalWidth, height: image.naturalHeight }));
  expect(thumbnailSize.width).toBeGreaterThan(0);
  expect(thumbnailSize.width).toBeLessThanOrEqual(1024);
  const thumbnailRange = await page.getByTestId('complaint-thumbnail').evaluate((image: HTMLImageElement) => {
    const sample = document.createElement('canvas');
    sample.width = 32;
    sample.height = 32;
    const context = sample.getContext('2d')!;
    context.drawImage(image, 0, 0, sample.width, sample.height);
    const values = [...context.getImageData(0, 0, sample.width, sample.height).data].filter((_, index) => index % 4 !== 3);
    return Math.max(...values) - Math.min(...values);
  });
  expect(thumbnailRange).toBeGreaterThan(20);
  await expect(page.getByTestId('complaint-diagnostics')).toContainText('The clerk notes: The Claim, wave 0');
  await expect(page.getByTestId('complaint-diagnostics')).toContainText(`build ${BUILD_VARIANT}`);
  await expect(page.getByTestId('complaint-bounty')).toContainText('THE BOUNTY');
  await shot(page, testInfo, 'empty');

  await page.getByTestId('complaint-upload').setInputFiles({
    name: 'picked-fixture.png',
    mimeType: 'image/png',
    buffer: fixturePng(48, 32),
  });
  await expect(page.getByTestId('complaint-status')).toHaveText('Your picture is attached.');
  const pickedEvidence = await page.getByTestId('complaint-thumbnail').getAttribute('src');
  expect(pickedEvidence).not.toBe(entryMoment);

  await page.getByTestId('complaint-upload').setInputFiles({
    name: 'broken-fixture.png',
    mimeType: 'image/png',
    buffer: Buffer.from('not a picture'),
  });
  await expect(page.getByTestId('complaint-status')).toHaveText('The clerk could not read that picture.');
  await expect(page.getByTestId('complaint-thumbnail')).toHaveAttribute('src', pickedEvidence!);
  await page.getByTestId('complaint-retake').click();
  await expect(page.getByTestId('complaint-status')).toHaveText('The clerk is ready.');

  expect(await dropPng(page, fixturePng(48, 32, true))).toBe(true);
  await expect(page.getByTestId('complaint-status')).toHaveText('Your picture is attached.');
  const droppedEvidence = await page.getByTestId('complaint-thumbnail').getAttribute('src');
  expect(droppedEvidence).not.toBe(pickedEvidence);
  await page.getByTestId('complaint-close').click();
  await page.getByTestId('town-open-assay').click();
  await expect(page.getByTestId('complaint-thumbnail')).toHaveAttribute('src', droppedEvidence!);
  await shot(page, testInfo, 'uploaded');

  await page.getByTestId('complaint-description').fill('The riverbank marker vanished after I crossed the ford.');
  await page.getByTestId('complaint-name').fill('Robin');
  await page.getByTestId('complaint-submit').click();
  await expect(page.getByTestId('complaint-status')).toContainText('Complaint filed. Ticket desk-test-42. The county thanks you.');
  await expect(page.getByTestId('complaint-status')).toContainText('THE BOUNTY');
  await shot(page, testInfo, 'filed');

  expect(posted).toMatchObject({
    description: 'The riverbank marker vanished after I crossed the ford.',
    prospectorName: 'Robin',
    diagnostics: { contractId: 'the-claim', wave: 0, tier: expect.stringMatching(/^(FULL|BALANCED|LITE)$/), version: BUILD_VARIANT },
  });
  expect(posted?.screenshot).toBe(droppedEvidence);
  expect(decodedBytes(posted!.screenshot)).toBeLessThanOrEqual(MAX_SCREENSHOT_BYTES);

  await page.getByTestId('complaint-close').click();
  await page.getByTestId('town-open-assay').click();
  await expect(page.getByTestId('complaint-status')).toHaveText('The clerk is ready.');
  await expect(page.getByTestId('complaint-description')).toHaveValue('');
  await expect(page.getByTestId('complaint-name')).toHaveValue('');
  expect(errors).toEqual({ console: [], page: [] });
});

test('an oversized PNG is fitted under the server cap before submission', async ({ page }) => {
  await seedTown(page);
  const errors = collectErrors(page);
  let posted: ReportBody | undefined;
  await page.route('**/api/bug-report', async (route) => {
    posted = route.request().postDataJSON() as ReportBody;
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'desk-fit-180' }) });
  });

  await openTown(page);
  await page.getByTestId('town-open-assay').click();
  const oversized = fixturePng(1200, 900, true);
  expect(oversized.length).toBeGreaterThan(MAX_SCREENSHOT_BYTES);
  await page.getByTestId('complaint-upload').setInputFiles({
    name: 'oversized-fixture.png',
    mimeType: 'image/png',
    buffer: oversized,
  });
  await expect(page.getByTestId('complaint-status')).toHaveText('Your picture is attached.');
  await page.getByTestId('complaint-description').fill('This oversized field picture must still fit the ledger.');
  await page.getByTestId('complaint-submit').click();
  await expect(page.getByTestId('complaint-status')).toContainText('Complaint filed. Ticket desk-fit-180.');

  expect(posted?.screenshot).toMatch(/^data:image\/jpeg;base64,/);
  expect(decodedBytes(posted!.screenshot)).toBeLessThanOrEqual(MAX_SCREENSHOT_BYTES);
  expect(errors).toEqual({ console: [], page: [] });
});

test('the header and submit footer stay inside all launch viewports', async ({ page }, testInfo) => {
  await seedTown(page);
  const errors = collectErrors(page);
  await openTown(page);
  await page.getByTestId('town-open-assay').click();

  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const desk = await page.getByTestId('complaint-desk').boundingBox();
    const header = await page.locator('.complaint-desk__header').boundingBox();
    const submit = await page.getByTestId('complaint-submit').boundingBox();
    expect(desk).not.toBeNull();
    expect(header).not.toBeNull();
    expect(submit).not.toBeNull();
    expect(desk!.y).toBeGreaterThanOrEqual(0);
    expect(desk!.y + desk!.height).toBeLessThanOrEqual(viewport.height);
    expect(header!.y).toBeGreaterThanOrEqual(0);
    expect(submit!.y).toBeGreaterThanOrEqual(0);
    expect(submit!.y + submit!.height).toBeLessThanOrEqual(viewport.height);
    await shot(page, testInfo, `fit-${viewport.width}x${viewport.height}`);
  }

  expect(errors).toEqual({ console: [], page: [] });
});

test('debug keeps crafting intact behind the signposted Assay Office door', async ({ page }) => {
  await seedTown(page);
  const errors = collectErrors(page);
  await openTown(page, '?debug');

  await expect(page.getByTestId('town-approach-prompt')).toContainText('debug crafting door');
  await expect(page.getByTestId('town-open-assay')).toHaveText('Crafting');
  await page.getByTestId('town-open-assay').click();
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  await expect(page.getByTestId('complaint-desk')).toHaveCount(0);
  expect(errors).toEqual({ console: [], page: [] });
});
