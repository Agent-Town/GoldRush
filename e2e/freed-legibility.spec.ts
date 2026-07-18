import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import type { FreedWalkerDiagnostics } from '../src/systems/FreedWalkerVfx';

const QUERY = '/?debug&nowaves&nolevel&nopause&seed=freed-legibility';
const SHOT_DIR = 'reviews/shots-legibility';
const CLAIM_EDGE = 32;

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function open(page: Page): Promise<void> {
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setManualSim(true);
    game.resetRun();
    game.setManualSim(true);
    game.setBalance('sparkRig.damage', 0);
  });
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate((button: HTMLButtonElement) => button.click());
  await expect(briefing).toBeHidden();
}

async function hideDebugPanel(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const panel of document.querySelectorAll<HTMLElement>('.lil-gui')) panel.style.display = 'none';
  });
}

test('fevered crowd flips to an immediate, unmistakable freed read', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await open(page);
  await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.teleport(0, 0);
    game.spawnPack(5, 4, { speedScale: 0, contactDamageScale: 0 });
    game.spawnPack(3, 7, {
      speedScale: 0,
      contactDamageScale: 0,
      variantId: 'steam_wrecker',
      variantLabel: 'Steam Wrecker',
      wrecker: true,
    });
    game.advanceSim(0.1);
  });

  const fevered = await page.evaluate(() => window.__GR_TEST__!.enemyPositions());
  expect(fevered).toHaveLength(8);
  expect(fevered.every((enemy) => enemy.readState === 'fevered' && enemy.fevered && !enemy.freed)).toBe(true);
  expect(fevered.some((enemy) => enemy.feverAccent.kind === 'human')).toBe(true);
  expect(fevered.some((enemy) => enemy.feverAccent.kind === 'machine')).toBe(true);
  expect(fevered.every((enemy) => enemy.feverAccent.active && enemy.feverAccent.strength >= 0.5)).toBe(true);

  if (testInfo.project.name === 'desktop-chrome') {
    await mkdir(SHOT_DIR, { recursive: true });
    await hideDebugPanel(page);
    await page.screenshot({ path: `${SHOT_DIR}/fevered-crowd.png`, scale: 'css' });
  }

  await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setBalance('blast.damage', 1000);
    for (const enemy of game.enemyPositions()) game.launchBlastAt(enemy.x, enemy.z, 0.01);
    for (let step = 0; step < 20 && game.enemyPositions().length > 0; step += 1) game.advanceSim(0.02);
  });
  const flipped = await page.evaluate(() => ({
    freed: window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!,
    floats: window.__THREE_GAME_DIAGNOSTICS__!.vfx.activeFloatTexts,
  }));
  const activeFreed = flipped.freed.entities.filter((entity) => entity.active);
  expect(activeFreed.length).toBeGreaterThan(0);
  expect(activeFreed.every((entity) => entity.readState === 'freed' && entity.contactDamage === 0)).toBe(true);
  expect(activeFreed.filter((entity) => entity.behavior === 'run').every((entity) => entity.silhouette === 'hands-up')).toBe(true);
  expect(flipped.floats).toBeGreaterThan(0);

  if (testInfo.project.name === 'desktop-chrome') {
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.3));
    await page.screenshot({ path: `${SHOT_DIR}/freed-exodus.png`, scale: 'css' });
  }
  expect(errors).toEqual([]);
});

test('freed walkers target an edge, avoid the player, and deal zero contact damage when crossed', async ({ page }) => {
  const errors = collectErrors(page);
  await open(page);
  const active = await page.evaluate((claimEdge) => {
    const game = window.__GR_TEST__!;
    game.teleport(0, 0);
    game.setBalance('blast.damage', 1000);
    game.spawnPack(1, 10, { speedScale: 1, hpScale: 0.1 });
    const enemy = game.enemyPositions()[0]!;
    const distances = [
      { x: -claimEdge, z: enemy.z, distance: enemy.x + claimEdge },
      { x: claimEdge, z: enemy.z, distance: claimEdge - enemy.x },
      { x: enemy.x, z: -claimEdge, distance: enemy.z + claimEdge },
      { x: enemy.x, z: claimEdge, distance: claimEdge - enemy.z },
    ].sort((left, right) => left.distance - right.distance);
    const edge = distances[0]!;
    const player = { x: (enemy.x + edge.x) / 2, z: (enemy.z + edge.z) / 2 };
    game.teleport(player.x, player.z);
    return { enemy, player };
  }, CLAIM_EDGE);
  expect(active.enemy).toMatchObject({ readState: 'fevered', fevered: true, freed: false, contactDamage: 8 });

  const flip = await page.evaluate(({ x, z }) => {
    const game = window.__GR_TEST__!;
    const before = window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!.spawned;
    let immediateEntity: FreedWalkerDiagnostics['entities'][number] | undefined;
    game.launchBlastAt(x, z, 0.01);
    game.advanceSim(0.4, () => {
      if (immediateEntity || window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!.spawned === before) return;
      immediateEntity = structuredClone(
        window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!.entities.find((candidate) => candidate.active)!,
      );
    });
    return {
      killed: window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!.spawned > before,
      immediateEntity,
      entity: window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!.entities.find((candidate) => candidate.active)!,
      hp: window.__THREE_GAME_DIAGNOSTICS__!.hp,
    };
  }, active.enemy);
  expect(flip.killed).toBe(true);
  expect(flip.entity).toMatchObject({
    readState: 'freed',
    silhouette: 'hands-up',
    contactDamage: 0,
    avoidedPlayer: true,
    target: { kind: 'edge' },
  });
  expect(flip.immediateEntity).toMatchObject({
    readState: 'freed',
    silhouette: 'hands-up',
    contactDamage: 0,
  });
  expect(flip.immediateEntity!.age).toBeLessThanOrEqual(0.1);
  expect(
    Math.abs(flip.entity.target.x) === CLAIM_EDGE
    || Math.abs(flip.entity.target.z) === CLAIM_EDGE,
  ).toBe(true);
  expect({ x: flip.entity.target.x, z: flip.entity.target.z }).not.toEqual(active.player);

  const crossing = await page.evaluate(({ start, target, hp }) => {
    const game = window.__GR_TEST__!;
    const distance = Math.hypot(target.x - start.x, target.z - start.z);
    const crossingPoint = {
      x: start.x + ((target.x - start.x) / distance) * Math.min(2, distance * 0.5),
      z: start.z + ((target.z - start.z) / distance) * Math.min(2, distance * 0.5),
    };
    game.teleport(crossingPoint.x, crossingPoint.z);
    let closest = Number.POSITIVE_INFINITY;
    for (let step = 0; step < 50; step += 1) {
      game.advanceSim(0.05);
      const entity = window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers!.entities.find((candidate) => candidate.active);
      if (!entity) break;
      closest = Math.min(closest, Math.hypot(entity.x - crossingPoint.x, entity.z - crossingPoint.z));
    }
    return { closest, hpBefore: hp, hpAfter: window.__THREE_GAME_DIAGNOSTICS__!.hp };
  }, { start: { x: flip.entity.x, z: flip.entity.z }, target: flip.entity.target, hp: flip.hp });
  expect(crossing.closest).toBeLessThan(0.5);
  expect(crossing.hpAfter).toBe(crossing.hpBefore);
  expect(errors).toEqual([]);
});
