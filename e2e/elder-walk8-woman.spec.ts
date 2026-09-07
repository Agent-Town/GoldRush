// THE ELDER WALKS THROUGH TOWN AS THE WOMAN SHE IS (task elder-walk8-regeneration, 2026-09-07;
// owner ruling A8, verbatim: "F-AGE1: has to be adapted to be woman").
//
// The portraits became the woman in `canon-calls-a8-batch`, but the sprite the player actually
// watches walk was still the bearded man: `char-elder-sheet-walk8` is the Elder's only shipping
// sheet. This spec answers Mistake #10 — "where does the PLAYER see this, in a plain boot?" — for
// both halves of that fix, without `?debug`:
//   1. the cells the town loads for her are the NEW ones (hashed against the man's cells as they
//      stand on main at BASE: they must differ), and
//   2. F-A8-5's wiring is live — `TownScene.ts` townCastWalkFrames now registers her, so her
//      billboard anchors on her feet instead of floating by the cell's centre.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { TOWN_CAST_METROLOGY } from '../src/town/townsfolk';

const shotDir = path.resolve('reviews/shots-elder-walk8-regeneration');

// main's tip when this branch was cut — the last commit on which every
// `char-elder-sheet-walk8-r*c*.png` is still the bearded man. Pinned the way
// scripts/halo-reextraction-check.mjs pins its own BASE (:8), for the same reason: the comparison
// has to name a fixed tree, not "whatever main is today".
const BASE = 'e0f1880ed74475545c421316f5592f65e5636579';
const SHEET = 'char-elder-sheet-walk8';
const ELDER = { x: -6.65, z: 7.35 };

const sha256 = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex');

test('every Elder cell differs from the bearded sheet it replaces', () => {
  const changed: string[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const file = `${SHEET}-r${row}c${col}.png`;
      const now = fs.readFileSync(path.join('assets/processed', file));
      const before = execFileSync('git', ['show', `${BASE}:assets/processed/${file}`], { maxBuffer: 20 * 1024 * 1024 });
      if (sha256(now) !== sha256(before)) changed.push(file);
    }
  }
  expect(changed).toHaveLength(32);

  const frames = JSON.parse(fs.readFileSync(`assets/processed/${SHEET}.frames.json`, 'utf8')) as {
    grid: { cols: number; rows: number };
    cell: number;
    cells: Array<{ row: number; col: number; empty: boolean; bbox: number[] }>;
  };
  expect(frames.grid).toEqual({ cols: 8, rows: 4 });
  expect(frames.cell).toBe(512);
  expect(frames.cells).toHaveLength(32);
  expect(frames.cells.every(({ empty }) => !empty)).toBe(true);
  // The contract the consumers bind to (LEDGER:48, reviews/canon-calls-a8-batch.md): every figure
  // stands in the 298-321 px band, so no direction size-pops against its neighbours.
  for (const cell of frames.cells) {
    const height = cell.bbox[3]! - cell.bbox[1]! + 1;
    expect(height, `r${cell.row}c${cell.col} figure height`).toBeGreaterThanOrEqual(298);
    expect(height, `r${cell.row}c${cell.col} figure height`).toBeLessThanOrEqual(321);
  }
});

test('a plain town boot walks the Elder on anchored feet at the schoolhouse', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = collectErrors(page);
  await seedTown(page);
  await page.getByTestId('start-menu-enter-town').click();

  await expect.poll(() => page.evaluate(() => Boolean(window.__GR_TOWN_DIAGNOSTICS__))).toBe(true);
  // No debug seam on this boot: the harness is gated behind ?debug (Game.ts), and this is the
  // plain page the player loads.
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();

  // Walk to her. The Elder stands by the schoolhouse; inside her 5.4 barkRadius the town gives
  // her the bark, which is the player-visible proof that this is the person being rendered.
  await page.evaluate((elder) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(elder.x + 1.6, elder.z - 1.4), ELDER);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null), {
    timeout: 20_000,
  }).toBe('elder');

  await expect.poll(() => page.evaluate(() => {
    const elder = window.__GR_TOWN_DIAGNOSTICS__?.actors.find(({ id }) => id === 'elder');
    return Boolean(elder?.visible && elder.loaded && elder.loop && elder.footY !== null && Math.abs(elder.footY - 0.02) < 1e-6);
  }), { timeout: 20_000 }).toBe(true);

  // She animates: a moving actor asks for a non-zero column of her own sheet.
  await expect.poll(() => page.evaluate(() => {
    const elder = window.__GR_TOWN_DIAGNOSTICS__?.actors.find(({ id }) => id === 'elder');
    return elder?.moving ? elder.frameKey : '';
  }), { timeout: 20_000 }).toMatch(/^char-elder-sheet-walk8-r[0-3]c[1-7]\.png$/);

  const elder = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.find(({ id }) => id === 'elder')!);
  expect(elder.presentation).toBe('full_body');
  expect(elder.fullBodyStandIn).toBe(false);
  expect(elder.spriteHeight).toBeCloseTo(TOWN_CAST_METROLOGY.worldUnitsPerHero * TOWN_CAST_METROLOGY.elder, 3);

  // The footline itself: the cell's own alpha bottom, projected through the billboard, has to land
  // on the ground plane. Before the F-A8-5 registration this drifted with every cell's headroom.
  const png = PNG.sync.read(fs.readFileSync(path.join('assets/processed', elder.frameKey)));
  let bottom = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (png.data[(y * png.width + x) * 4 + 3]! > 8) bottom = y + 1;
    }
  }
  const renderedFootY = elder.spriteY - elder.spriteHeight / 2 + elder.spriteHeight * (1 - bottom / png.height);
  expect(renderedFootY, 'elder rendered foot contact').toBeCloseTo(0.02, 2);

  expect(errors).toEqual([]);

  await page.evaluate((target) => {
    window.__GR_TOWN_DIAGNOSTICS__!.teleport(target.x + 1.6, target.z - 1.4);
  }, ELDER);
  await page.waitForTimeout(500);
  await mkdir(shotDir, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: path.join(shotDir, `${testInfo.project.name}.png`) });
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(({ profileKey, townKey, metaKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'elder',
      profiles: [{ id: 'elder', name: 'Elder', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(townKey, 'Elder Town');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('elder', TOWN_NAME_KEY),
    metaKey: profileDataKey('elder', META_PROGRESS_KEY),
  });
  await page.reload();
}
