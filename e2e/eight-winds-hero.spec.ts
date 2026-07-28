import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

type DirectionSource = { frames?: { files?: string[] } };
type Walk8 = {
  frameCount?: number;
  grid?: { file?: string; cols?: number; rowDirections?: string[] };
  directions?: Record<string, DirectionSource>;
  aliases?: Record<string, string>;
};
type Slot = {
  slot: string;
  rotations?: { directions?: Record<string, unknown> };
  walk8?: Walk8;
};

const contract = JSON.parse(
  fs.readFileSync(path.resolve('assets/layer-contracts/characters.v2.json'), 'utf8'),
) as { slots: Slot[] };
const processedDir = path.resolve('assets/processed');
const shotDir = path.resolve('artifacts/eight-winds-hero');
const winds = [
  { direction: 'sw', row: 0, keys: ['KeyS', 'KeyA'] },
  { direction: 'se', row: 1, keys: ['KeyS', 'KeyD'] },
  { direction: 'nw', row: 2, keys: ['KeyW', 'KeyA'] },
  { direction: 'ne', row: 3, keys: ['KeyW', 'KeyD'] },
] as const;
const outlawDiagonals = [
  { slot: 'char.bandit_base', stem: 'char-bandit-base' },
  { slot: 'char.bandit_thief', stem: 'char-bandit-thief' },
  { slot: 'char.baron', stem: 'char-baron' },
] as const;

function directionFiles(sheet: Walk8, direction: string): string[] {
  const explicit = sheet.directions?.[direction]?.frames?.files;
  if (explicit) return explicit;
  const grid = sheet.grid;
  const row = grid?.rowDirections?.findIndex((candidate) => candidate.toLowerCase() === direction) ?? -1;
  if (!grid?.file || row < 0) return [];
  const stem = grid.file.replace(/\.png$/i, '');
  return Array.from({ length: Math.max(1, sheet.frameCount ?? grid.cols ?? 1) }, (_, col) => `${stem}-r${row}c${col}.png`);
}

test('every walk8 reference ships and hero plus all three outlaws resolve to diagonal cells', () => {
  const missing: string[] = [];
  for (const slot of contract.slots.filter((candidate) => candidate.walk8)) {
    const sheet = slot.walk8!;
    const grid = sheet.grid;
    if (grid?.file) {
      const stem = grid.file.replace(/\.png$/i, '');
      for (const [row, direction] of (grid.rowDirections ?? []).entries()) {
        for (let col = 0; col < Math.max(1, sheet.frameCount ?? grid.cols ?? 1); col += 1) {
          const file = `${stem}-r${row}c${col}.png`;
          if (!fs.existsSync(path.join(processedDir, file))) missing.push(`${slot.slot}.${direction}: ${file}`);
        }
      }
    }
    for (const [direction, source] of Object.entries(sheet.directions ?? {})) {
      for (const file of source.frames?.files ?? []) {
        if (!fs.existsSync(path.join(processedDir, file))) missing.push(`${slot.slot}.${direction}: ${file}`);
      }
    }
  }
  expect(missing).toEqual([]);

  const hero = contract.slots.find((slot) => slot.slot === 'char.hero')!;
  for (const { direction, row } of winds) {
    const aliased = hero.walk8!.aliases?.[direction];
    const resolvedDirection = aliased && !hero.rotations?.directions?.[direction] ? aliased : direction;
    const files = directionFiles(hero.walk8!, resolvedDirection);
    expect(files).toHaveLength(8);
    expect(files.every((file) => new RegExp(`^char-hero-sheet-walkdiag8-r${row}c[0-7]\\.png$`).test(file))).toBe(true);
  }

  for (const outlaw of outlawDiagonals) {
    const slot = contract.slots.find((candidate) => candidate.slot === outlaw.slot)!;
    for (const { direction, row } of winds) {
      const resolvedDirection = slot.walk8!.aliases?.[direction] ?? direction;
      const files = directionFiles(slot.walk8!, resolvedDirection);
      expect(files).toHaveLength(8);
      expect(files.every((file) => new RegExp(`^${outlaw.stem}-sheet-walkdiag8-r${row}c[0-7]\\.png$`).test(file))).toBe(true);
      expect(files.every((file) => !/-sheet-walk8-/.test(file))).toBe(true);
    }
  }
});

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function releaseMovement(page: Page): Promise<void> {
  for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) await page.keyboard.up(key);
}

test('plain boot uses the correct hero sheet for all four diagonal winds', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/?contract=the-claim&nowaves&nolevel&nopause&seed=eight-winds-hero');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-sheet', 'young');
  await page.getByTestId('contract-briefing-dismiss').click();
  fs.mkdirSync(shotDir, { recursive: true });

  for (const wind of winds) {
    await test.step(`${wind.direction} uses row ${wind.row}`, async () => {
      await releaseMovement(page);
      for (const key of wind.keys) await page.keyboard.down(key);
      await page.waitForFunction(
        ({ row }) => {
          const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
          const key = sprite?.sourceFrameKey ?? sprite?.frameKey ?? '';
          return sprite?.clip === 'walk' && new RegExp(`^char-hero-sheet-walkdiag8-r${row}c[0-7]\\.png$`).test(key);
        },
        { row: wind.row },
        { timeout: 15_000 },
      );
      const key = await page.evaluate(
        () => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.sourceFrameKey
          ?? window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.frameKey
          ?? '',
      );
      expect(key).toMatch(new RegExp(`^char-hero-sheet-walkdiag8-r${wind.row}c[0-7]\\.png$`));
      await page.screenshot({ path: path.join(shotDir, `${testInfo.project.name}-${wind.direction}.png`), fullPage: true });
    });
  }

  await releaseMovement(page);
  expect(errors).toEqual({ console: [], page: [] });
});
