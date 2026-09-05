import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';
import { Balance } from '../src/game/Balance';

const ARTIFACT_DIR = path.resolve('artifacts/landmark-brightness');
const ATLAS = path.resolve('assets/pilots/map-rebuild-spike/landmarks/the-claim/the-claim-landmarks-atlas.png');
type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, contract: string, extra = ''): Promise<void> {
  await page.goto(`/?debug&autotier&contract=${contract}&nowaves&nolevel&nokill&nopause&seed=landmark-brightness-${contract}&tier=full${extra}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState === 'ready');
}

async function p95(page: Page, frames = 180): Promise<number> {
  return page.evaluate(async (count) => {
    const samples: number[] = [];
    let previous = performance.now();
    for (let index = 0; index < count; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      samples.push(now - previous);
      previous = now;
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length * 0.95)] ?? 0;
  }, frames);
}

function medianLuminance(png: PNG, centerX?: number, centerY?: number): number {
  const values: number[] = [];
  const minX = centerX === undefined ? 0 : centerX - 8;
  const maxX = centerX === undefined ? png.width - 1 : centerX + 8;
  const minY = centerY === undefined ? 0 : centerY - 8;
  const maxY = centerY === undefined ? png.height - 1 : centerY + 8;
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
    const offset = (y * png.width + x) * 4;
    values.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
  }
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)] ?? 0;
}

test('The Claim keeps daylight landmarks opaque, lit, and under the frame budget', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await boot(page, 'the-claim');
  await page.evaluate(() => window.__GR_TEST__!.teleport(8, 12));
  await page.waitForTimeout(300);

  const canvas = page.locator('#game-canvas');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-night-pools', 'off');
  const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as Array<{
    id: string; total: number; transparent: number; depthWriteDisabled: number;
  }>;
  expect(materials.find((material) => material.id === 'maintained_claim_house')).toMatchObject({
    total: 1,
    transparent: 0,
    depthWriteDisabled: 0,
  });

  const point = await page.evaluate(() => window.__GR_TEST__!.screenPoint(10.5, 14.5, 4.5));
  expect(point.inView).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const shot = await canvas.screenshot({ path: path.join(ARTIFACT_DIR, `after-${testInfo.project.name}.png`) });
  const rendered = PNG.sync.read(shot);
  const renderedLuminance = medianLuminance(
    rendered,
    Math.round(point.x * rendered.width / box!.width),
    Math.round(point.y * rendered.height / box!.height),
  );
  const atlasLuminance = medianLuminance(PNG.sync.read(await readFile(ATLAS)));
  expect(renderedLuminance).toBeGreaterThan(0.06);
  expect(renderedLuminance / atlasLuminance).toBeGreaterThan(0.25);

  expect(await p95(page)).toBeLessThanOrEqual(Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(0);
  expect(errors).toEqual({ console: [], page: [] });
});

test('Night Shift keeps ground light pools without mutating landmark materials', async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page, 'e1-night-shift');
  await page.evaluate(() => window.__GR_TEST__!.setWave(10));
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotNightPools === 'world-shader'
      && Number(canvas.dataset.terrain3dPilotNightPoolSources) > 0;
  });
  const canvas = page.locator('#game-canvas');
  const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as Array<{
    transparent: number; depthWriteDisabled: number;
  }>;
  expect(materials.length).toBeGreaterThan(0);
  expect(materials.every((material) => material.transparent === 0 && material.depthWriteDisabled === 0)).toBe(true);
  expect(errors).toEqual({ console: [], page: [] });
});

/**
 * F-ASTRA-9 REFERENCE RIG (landmark-lighting-calibration, 2026-09-05).
 *
 * Astra's finding is that daylight landmarks light THEMSELVES — `keepLandmarkPaintReadable` routes
 * the diffuse atlas into emission at intensity 3 (1.28-3.4 on the tuned contracts) — while the
 * terrain beside them answers the sun. The complaint is a RELATIONSHIP, so it can only be measured
 * as one: this test samples the three families that share the rig at the same instant, in the same
 * frame, through the same ACES + exposure 1.05 pipeline:
 *
 *   terrain  — GLB material, no emissive, lit by sun 2.35 + hemi 1.12  (the reference)
 *   landmark — same rig PLUS the paint emissive                        (the subject)
 *   hero     — a THREE.Sprite, unlit by construction                   (the ceiling)
 *
 * The ratio landmark/terrain is the number the review is about: at emission 3 the landmark is a
 * light source standing on a lit floor. It is skipped in the ordinary gate (a four-map boot is
 * ~90 s) and run explicitly for the A/B:
 *   GR_LIGHTING_CALIBRATION=1 GR_LIGHTING_PHASE=before npx playwright test e2e/landmark-brightness.spec.ts
 * Probe points are derived from the published mount coordinates, so BOTH phases sample the same
 * world points through the same camera — the delta is the change, not the aim.
 */
const CALIBRATION_DIR = path.resolve('artifacts/landmark-lighting-calibration');
const CALIBRATION_PHASE = process.env.GR_LIGHTING_PHASE ?? 'after';
/** Extra query for the A/B arms, e.g. `&lighting=legacy` or `&lmemissive=0.3`. */
const CALIBRATION_QUERY = process.env.GR_LIGHTING_QUERY ?? '';
/**
 * `GR_LIGHTING_SCENES=<contract>:<focus mount>[:night],...` points the rig at any map. It exists
 * because the calibration's first shipped value (0.30) passed every scene in the default list and
 * still put FOUR dark-bodied maps under `map-census`'s 0.06 landmark-readability floor — the rig
 * has to be able to follow the census's finding onto the maps that produced it.
 */
const CALIBRATION_SCENES: ReadonlyArray<{ id: string; label: string; night: boolean; focus: string }> = process.env.GR_LIGHTING_SCENES
  ? process.env.GR_LIGHTING_SCENES.split(',').map((entry) => {
    const [id, focus, night] = entry.split(':');
    return { id: id!, label: id!, focus: focus ?? '', night: night === 'night' };
  })
  : [
  // The focus mount is a SOLID body on each map, never a lattice: the rig's first reading aimed at
  // `active_headframe` and returned an identical 0.211 on every arm of the emission sweep, because
  // a +-8 px box over an open headframe is mostly the ground behind it.
  { id: 'the-claim', label: 'The Claim', night: false, focus: 'maintained_claim_house' },
  { id: 'e2-hill-mine', label: 'Hill Mine', night: false, focus: 'boiler-house-site' },
  { id: 'e8-mare-claim', label: 'Mare Claim', night: false, focus: 'earthrise-listening-array' },
  { id: 'e1-night-shift', label: 'Night Shift', night: true, focus: 'seven_lantern_terraces' },
  ];

type MountRow = { id: string; x: number; y: number; z: number };
type SideRow = { id: string; meshes: number; closed: number; open: number; culled: number; doubleSided: number; baseY: number; topY: number };
type MaterialRow = {
  id: string; total: number; transparent: number; depthWriteDisabled: number;
  emissiveIntensity: number[]; authoredEmissive?: number[]; doubleSided?: number; frontSided?: number;
};
type Probe = { id: string; family: 'terrain' | 'landmark' | 'hero'; x: number; y: number; luminance: number; inView: boolean };

function sampleAt(png: PNG, x: number, y: number, radius = 8): number {
  const values: number[] = [];
  const minX = Math.max(0, Math.round(x) - radius);
  const maxX = Math.min(png.width - 1, Math.round(x) + radius);
  const minY = Math.max(0, Math.round(y) - radius);
  const maxY = Math.min(png.height - 1, Math.round(y) + radius);
  for (let py = minY; py <= maxY; py += 1) for (let px = minX; px <= maxX; px += 1) {
    const offset = (py * png.width + px) * 4;
    values.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
  }
  if (!values.length) return Number.NaN;
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)]!;
}

test('reference rig: terrain, landmark and hero sprite measured together (F-ASTRA-9 calibration)', async ({ page }, testInfo: TestInfo) => {
  test.skip(!process.env.GR_LIGHTING_CALIBRATION, 'explicit A/B capture only — set GR_LIGHTING_CALIBRATION=1');
  test.setTimeout(300_000);
  const errors = collectErrors(page);
  await mkdir(CALIBRATION_DIR, { recursive: true });
  const rows: unknown[] = [];

  for (const scene of CALIBRATION_SCENES) {
    await boot(page, scene.id, CALIBRATION_QUERY);
    if (scene.night) {
      await page.evaluate(() => window.__GR_TEST__!.setWave(10));
      await page.waitForFunction(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
        return canvas?.dataset.terrain3dPilotNightPools === 'world-shader';
      });
    }
    await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');

    const canvas = page.locator('#game-canvas');
    const mounts = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-mounts')) ?? '[]') as MountRow[];
    expect(mounts.length).toBeGreaterThan(0);
    const focus = mounts.find((mount) => mount.id === scene.focus) ?? mounts[0]!;
    const sides = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-sides')) ?? '{}') as { mounts?: SideRow[] };
    const extentOf = (id: string): SideRow | undefined => sides.mounts?.find((row) => row.id === id);

    // Frame the focus landmark deterministically: walk a fixed ring of stand-off points and keep
    // the first one that puts the body on screen. Geometry and camera are identical across the
    // phases, so both runs choose the same stand-off and sample the same pixels.
    const standoffs: ReadonlyArray<readonly [number, number]> = [[0, 9], [9, 0], [0, -9], [-9, 0], [6, 6], [-6, 6]];
    let standoff: readonly [number, number] = standoffs[0]!;
    for (const candidate of standoffs) {
      await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x, z), [focus.x + candidate[0], focus.z + candidate[1]] as [number, number]);
      await page.waitForTimeout(350);
      const seen = await page.evaluate(([x, z, y]) => window.__GR_TEST__!.screenPoint(x, z, y).inView, [focus.x, focus.z, focus.y + 1.5] as [number, number, number]);
      standoff = candidate;
      if (seen) break;
    }
    await page.waitForTimeout(500);

    const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as MaterialRow[];
    const census = (await canvas.getAttribute('data-terrain3d-pilot-landmark-sides')) ?? 'absent';
    const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroRenderPos ?? { x: 0, y: 0, z: 0 });

    // The body is sampled up a short vertical ladder (a single point can sit on a doorway or the
    // sky behind a mast); the ground is sampled on a ring at the mount's own height. Every probe
    // is a WORLD coordinate, so the two phases measure the same surfaces.
    const wanted = [
      // Aim at the body itself: a band across the middle of its OWN measured height, so the
      // sample is wall rather than sky above it or ground below it.
      ...mounts.flatMap((mount) => {
        const extent = extentOf(mount.id);
        const base = extent ? extent.baseY : mount.y;
        const top = extent ? extent.topY : mount.y + 3;
        return [0.3, 0.42, 0.55, 0.68].map((fraction) => ({
          id: `${mount.id}@${fraction.toFixed(2)}h`,
          family: 'landmark' as const,
          world: [mount.x, mount.z, base + (top - base) * fraction] as const,
        }));
      }),
      ...([[5, 5], [-5, 5], [0, 6], [5, -5]] as const).map(([dx, dz]) => ({
        id: `ground${dx}_${dz}`, family: 'terrain' as const, world: [focus.x + dx, focus.z + dz, focus.y] as const,
      })),
      { id: 'hero', family: 'hero' as const, world: [hero.x, hero.z, hero.y + 0.9] as const },
    ];
    const points = await page.evaluate((list) => list.map((entry) => {
      const point = window.__GR_TEST__!.screenPoint(entry.world[0]!, entry.world[1]!, entry.world[2]!);
      return { id: entry.id, family: entry.family, x: point.x, y: point.y, inView: point.inView };
    }), wanted.map((entry) => ({ id: entry.id, family: entry.family, world: [...entry.world] as number[] })));

    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    const shotPath = path.join(CALIBRATION_DIR, `${CALIBRATION_PHASE}-${scene.id}-${testInfo.project.name}.png`);
    const shot = await canvas.screenshot({ path: shotPath });
    const rendered = PNG.sync.read(shot);
    const scaleX = rendered.width / box!.width;
    const scaleY = rendered.height / box!.height;
    const probes: Probe[] = points.map((point) => ({
      id: point.id,
      family: point.family as Probe['family'],
      x: +(point.x * scaleX).toFixed(1),
      y: +(point.y * scaleY).toFixed(1),
      inView: point.inView,
      luminance: +sampleAt(rendered, point.x * scaleX, point.y * scaleY).toFixed(4),
    }));
    const medianOf = (selected: Probe[]): number => {
      const values = selected.filter((probe) => probe.inView && Number.isFinite(probe.luminance))
        .map((probe) => probe.luminance).sort((a, b) => a - b);
      return values.length ? +values[Math.floor(values.length / 2)]!.toFixed(4) : Number.NaN;
    };
    // The headline landmark number is the FOCUS body alone. Taking it across every mount reads the
    // sky on 390px, where the portrait framing puts other mounts' probe ladders above their bodies
    // (measured: The Claim's all-mount median sat at 0.924 in BOTH arms while the focus body moved).
    const familyMedian = (family: Probe['family']): number => medianOf(probes.filter((probe) => probe.family === family));
    const focusMedian = medianOf(probes.filter((probe) => probe.id.startsWith(`${focus.id}@`)));
    const frame = +sampleAt(rendered, rendered.width / 2, rendered.height / 2, Math.floor(Math.min(rendered.width, rendered.height) / 2) - 1).toFixed(4);

    rows.push({
      scene: scene.label,
      contract: scene.id,
      project: testInfo.project.name,
      phase: CALIBRATION_PHASE,
      query: CALIBRATION_QUERY,
      focusMount: focus.id,
      standoff,
      frameMedianLuminance: frame,
      terrainMedianLuminance: familyMedian('terrain'),
      landmarkMedianLuminance: focusMedian,
      landmarkAllMountsMedian: familyMedian('landmark'),
      heroLuminance: probes.find((probe) => probe.family === 'hero')?.luminance ?? null,
      landmarkOverTerrain: +(focusMedian / familyMedian('terrain')).toFixed(3),
      emissiveIntensity: materials.map((material) => ({ id: material.id, range: material.emissiveIntensity })),
      sideCensus: census,
      p95Ms: +(await p95(page)).toFixed(2),
      screenshot: path.relative(process.cwd(), shotPath),
      probes,
    });
  }

  await writeFile(
    path.join(CALIBRATION_DIR, `${CALIBRATION_PHASE}-${testInfo.project.name}.json`),
    `${JSON.stringify(rows, null, 2)}\n`,
    'utf8',
  );
  expect(rows).toHaveLength(CALIBRATION_SCENES.length);
  expect(errors).toEqual({ console: [], page: [] });
});

/**
 * F-ASTRA-9 closed/open census across the contracts whose packs are NOT all solid bodies — the
 * baron's oxblood banners are cloth sheets, the trestle carries a rail kit, twin banks a dressing
 * pack. If the classifier were a global toggle in disguise it would call those closed too; this is
 * the test that would catch it. Census only: no screenshots, no frame budget.
 */
test('closed/open mesh census across the landmark packs (F-ASTRA-9)', async ({ page }) => {
  test.skip(!process.env.GR_LIGHTING_CALIBRATION, 'explicit A/B capture only — set GR_LIGHTING_CALIBRATION=1');
  test.setTimeout(300_000);
  const errors = collectErrors(page);
  const contracts = ['e1-baron', 'e1-twin-banks', 'e1-dry-gulch', 'e2-trestle', 'e2-incline', 'e2-pressure-garden', 'e3-canyon-works', 'e4-dust-flats', 'e4-boneyard', 'e4-long-road', 'e9-old-canal'];
  const rows: unknown[] = [];
  for (const contract of contracts) {
    await boot(page, contract, CALIBRATION_QUERY);
    await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
    const canvas = page.locator('#game-canvas');
    const sides = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-sides')) ?? '{}');
    const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as MaterialRow[];
    rows.push({ contract, sides, emissive: materials.map((material) => ({ id: material.id, authored: material.authoredEmissive, rendered: material.emissiveIntensity })) });
  }
  await mkdir(CALIBRATION_DIR, { recursive: true });
  await writeFile(path.join(CALIBRATION_DIR, `census-${CALIBRATION_PHASE}.json`), `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  expect(rows).toHaveLength(contracts.length);
  expect(errors).toEqual({ console: [], page: [] });
});
