import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

type Blocker = { id: string; x: number; z: number; halfX: number; halfZ: number };
const ARTIFACT_DIR = path.resolve('artifacts/fort-solidity');
const HERO_PAD = 0.58;

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function boot(page: Page, contract: string): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nosteal&nowreck&seed=fort-landmark-${contract}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
}

async function blockers(page: Page, landmark: string): Promise<Blocker[]> {
  return page.evaluate(async (target) => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    return terrain.landmarkBlockers().filter(({ id }) => {
      const localId = id.slice(id.indexOf(':') + 1);
      return localId === target || localId.startsWith(`${target}:`);
    });
  }, landmark);
}

function inside(point: { x: number; z: number }, blocker: Blocker): boolean {
  return Math.abs(point.x - blocker.x) <= blocker.halfX + HERO_PAD
    && Math.abs(point.z - blocker.z) <= blocker.halfZ + HERO_PAD;
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function expectFourFacesSolid(page: Page, group: readonly Blocker[]): Promise<void> {
  const primary = group[0];
  const faces = [
    { key: 'KeyD', axis: 'x' as const, sign: -1, body: group.reduce((a, b) => a.x - a.halfX < b.x - b.halfX ? a : b) },
    { key: 'KeyA', axis: 'x' as const, sign: 1, body: group.reduce((a, b) => a.x + a.halfX > b.x + b.halfX ? a : b) },
    { key: 'KeyS', axis: 'z' as const, sign: -1, body: primary },
    { key: 'KeyW', axis: 'z' as const, sign: 1, body: primary },
  ];
  for (const face of faces) {
    const half = face.axis === 'x' ? face.body.halfX : face.body.halfZ;
    const start = { x: face.body.x, z: face.body.z };
    start[face.axis] += face.sign * (half + HERO_PAD + 0.35);
    await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), start);
    await hold(page, face.key, 1_200);
    const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
    expect(group.some((body) => inside(hero, body)), `${face.body.id} ${face.key}`).toBe(false);
    const boundary = face.body[face.axis] + face.sign * (half + HERO_PAD);
    expect(Math.abs(hero[face.axis] - boundary), `${face.body.id} ${face.key} boundary`).toBeLessThan(0.12);
  }
}

async function expectEveryBodyReleases(page: Page, group: readonly Blocker[]): Promise<void> {
  for (const body of group) {
    await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), body);
    await hold(page, body.halfX < body.halfZ ? 'KeyD' : 'KeyW', 1_200);
    const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
    expect(group.some((candidate) => inside(hero, candidate)), `${body.id} never-trap`).toBe(false);
  }
}

test('the four new landmark solids block every face and release embedded heroes', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  const probes = [
    { contract: 'the-claim', landmark: 'active_headframe', bodies: 1 },
    { contract: 'e1-baron', landmark: 'seized_headframe', bodies: 1 },
    { contract: 'e1-baron', landmark: 'fortified_far_bank', bodies: 7 },
    { contract: 'e1-baron', landmark: 'siege_line', bodies: 5 },
  ];
  let activeContract = '';
  for (const probe of probes) {
    if (probe.contract !== activeContract) {
      await boot(page, probe.contract);
      activeContract = probe.contract;
    }
    const group = await blockers(page, probe.landmark);
    expect(group, probe.landmark).toHaveLength(probe.bodies);
    await expectFourFacesSolid(page, group);
    await expectEveryBodyReleases(page, group);
  }
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-walk-probe.png`) });
  expect(errors).toEqual([]);
});
