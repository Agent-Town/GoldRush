import { expect, test, type Page, type TestInfo } from '@playwright/test';
import {
  applyTerrainGizmo,
  hitTerrainGizmo,
  terrainGizmoHitRadiusWorld,
  type TerrainBrushPoint,
  type TerrainGizmoAction,
} from '../src/editor/TerrainBrush';
import {
  contractDescriptorJson,
  listBoardContracts,
  loadContract,
  parseContractDescriptor,
  type ContractManifest,
} from '../src/meta/ContractFamilies';

test('gizmo model exposes only the ratified capabilities and canonical placement reasons', () => {
  for (const template of listBoardContracts()) {
    const bytes = contractDescriptorJson(template);
    const parsed = parseContractDescriptor(bytes, template);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(contractDescriptorJson(parsed.contract)).toBe(bytes);
  }

  const twinBanks = loadContract('e1-twin-banks');
  const movedZone = applyGizmo(twinBanks, {
    ref: { kind: 'zone', index: 0 },
    handle: 'move',
    from: { x: 0, z: -18.5 },
    to: { x: 2, z: -18.5 },
  });
  expect(movedZone.tileParams.buildZones?.[0]).toEqual({
    id: 'south-bank', bank: 'south', minX: -26, maxX: 30, minZ: -30, maxZ: -7,
  });
  expectExactEdit(movedZone, twinBanks, (expected) => Object.assign(expected.tileParams.buildZones![0]!, { minX: -26, maxX: 30 }));

  const corners = [
    ['zone-nw', { x: -28, z: -7 }, { x: -26, z: -6 }, { minX: -26, maxX: 28, minZ: -30, maxZ: -6 }],
    ['zone-ne', { x: 28, z: -7 }, { x: 26, z: -6 }, { minX: -28, maxX: 26, minZ: -30, maxZ: -6 }],
    ['zone-se', { x: 28, z: -30 }, { x: 26, z: -29 }, { minX: -28, maxX: 26, minZ: -29, maxZ: -7 }],
    ['zone-sw', { x: -28, z: -30 }, { x: -26, z: -29 }, { minX: -26, maxX: 28, minZ: -29, maxZ: -7 }],
  ] as const;
  for (const [handle, from, to, rectangle] of corners) {
    const resized = applyGizmo(twinBanks, { ref: { kind: 'zone', index: 0 }, handle, from, to });
    expect(resized.tileParams.buildZones?.[0]).toMatchObject(rectangle);
    expectExactEdit(resized, twinBanks, (expected) => Object.assign(expected.tileParams.buildZones![0]!, rectangle));
  }

  const dryGulch = loadContract('e1-dry-gulch');
  const movedPond = applyGizmo(dryGulch, {
    ref: { kind: 'pond', index: 0 }, handle: 'move', from: { x: -18, z: -18 }, to: { x: -15, z: -14 },
  });
  expect(movedPond.tileParams.waterSources[0]).toEqual({ kind: 'spring_pond', x: -15, z: -14, radius: 1.4 });
  expectExactEdit(movedPond, dryGulch, (expected) => Object.assign(expected.tileParams.waterSources[0]!, { x: -15, z: -14 }));
  const resizedPond = applyGizmo(dryGulch, {
    ref: { kind: 'pond', index: 0 }, handle: 'pond-radius', from: { x: -16.6, z: -18 }, to: { x: -12, z: -18 },
  });
  expect(resizedPond.tileParams.waterSources[0]?.radius).toBe(6);
  expectExactEdit(resizedPond, dryGulch, (expected) => { expected.tileParams.waterSources[0]!.radius = 6; });
  const diagonalPond = applyGizmo(dryGulch, {
    ref: { kind: 'pond', index: 0 }, handle: 'pond-radius', from: { x: -16.6, z: -18 }, to: { x: -18, z: -12 },
  });
  expect(diagonalPond.tileParams.waterSources[0]?.radius).toBe(6);

  const hillMine = loadContract('e2-hill-mine');
  const westGate = hillMine.twist.enemyRoster![0]!.spawnGates![0]!;
  const movedWestGate = applyGizmo(hillMine, {
    ref: { kind: 'spawnGate', rosterIndex: 0, gateIndex: 0 },
    handle: 'move',
    from: westGate,
    to: { x: -35, z: westGate.z + 4 },
  });
  expect(movedWestGate.twist.enemyRoster![0]!.spawnGates![0]).toEqual({ edge: 'west', x: -46, z: 10.25 });
  const northGate = hillMine.twist.enemyRoster![1]!.spawnGates![0]!;
  const movedNorthGate = applyGizmo(hillMine, {
    ref: { kind: 'spawnGate', rosterIndex: 1, gateIndex: 0 },
    handle: 'move',
    from: northGate,
    to: { x: northGate.x + 7, z: 12 },
  });
  expect(movedNorthGate.twist.enemyRoster![1]!.spawnGates![0]).toEqual({ edge: 'north', x: 7, z: 46 });
  expectExactEdit(movedWestGate, hillMine, (expected) => { expected.twist.enemyRoster![0]!.spawnGates![0]!.z = 10.25; });
  expectExactEdit(movedNorthGate, hillMine, (expected) => { expected.twist.enemyRoster![1]!.spawnGates![0]!.x = 7; });

  const nightShift = loadContract('e1-night-shift');
  const movedFixture = applyGizmo(nightShift, {
    ref: { kind: 'fixture', index: 0 }, handle: 'move', from: { x: 0, z: 16 }, to: { x: 3.4, z: 18.2 },
  });
  expect(movedFixture.tileParams.prePlacedBuildables?.[0]).toEqual({
    id: 'lantern_post', x: 3, z: 18, rotationSteps: 0, wrecked: true, relightCost: 8,
  });
  expectExactEdit(movedFixture, nightShift, (expected) => Object.assign(expected.tileParams.prePlacedBuildables![0]!, { x: 3, z: 18 }));
  const noOp = applyGizmo(nightShift, {
    ref: { kind: 'fixture', index: 0 }, handle: 'move', from: { x: 0, z: 16 }, to: { x: 0, z: 16 },
  });
  expect(contractDescriptorJson(noOp)).toBe(contractDescriptorJson(nightShift));
  const fractionalFixture = structuredClone(nightShift);
  Object.assign(fractionalFixture.tileParams.prePlacedBuildables![0]!, { x: 0.25, z: 16.5 });
  const movedFractionalFixture = applyGizmo(fractionalFixture, {
    ref: { kind: 'fixture', index: 0 }, handle: 'move', from: { x: 0.25, z: 16.5 }, to: { x: 2.25, z: 16.5 },
  });
  expect(movedFractionalFixture.tileParams.prePlacedBuildables?.[0]).toMatchObject({ x: 2, z: 16.5 });

  const hitRadius = terrainGizmoHitRadiusWorld(nightShift, 280);
  expect(hitRadius).toBeCloseTo((22 / 280) * 64, 8);
  expect(hitTerrainGizmo(nightShift, { x: 4.9, z: 16 }, hitRadius)).toEqual({ ref: { kind: 'fixture', index: 0 }, handle: 'move' });
  expect(hitTerrainGizmo(nightShift, { x: 5.2, z: 16 }, hitRadius)).toBeNull();
  expect(hitTerrainGizmo(twinBanks, { x: -28, z: -7 }, hitRadius, { kind: 'zone', index: 0 })).toEqual({
    ref: { kind: 'zone', index: 0 }, handle: 'zone-nw',
  });
  const hillHitRadius = terrainGizmoHitRadiusWorld(hillMine, 280);
  expect(hitTerrainGizmo(hillMine, { x: -36, z: 37 }, hillHitRadius, { kind: 'zone', index: 3 })).toEqual({
    ref: { kind: 'zone', index: 3 }, handle: 'zone-sw',
  });

  const validPondEdge = structuredClone(dryGulch);
  validPondEdge.tileParams.waterSources[0]!.x = 30.6;
  expect(parseContractDescriptor(contractDescriptorJson(validPondEdge), dryGulch).ok).toBe(true);
  validPondEdge.tileParams.waterSources[0]!.x = 30.601;
  expect(reasonKeys(validPondEdge, dryGulch)).toEqual([['water_source_outside_claim', 'tileParams.waterSources[0]']]);

  const validFixtureEdge = structuredClone(nightShift);
  validFixtureEdge.tileParams.prePlacedBuildables![0]!.x = 32;
  expect(parseContractDescriptor(contractDescriptorJson(validFixtureEdge), nightShift).ok).toBe(true);
  validFixtureEdge.tileParams.prePlacedBuildables![0]!.x = 32.01;
  expect(reasonKeys(validFixtureEdge, nightShift)).toEqual([['fixture_outside_claim', 'tileParams.prePlacedBuildables[0]']]);

  const badGate = structuredClone(hillMine);
  (badGate.twist.enemyRoster![0]!.spawnGates![0] as { edge: string }).edge = 'up';
  expect(reasonKeys(badGate, hillMine)).toEqual([['field_choice', 'twist.enemyRoster[0].spawnGates[0].edge']]);

  const mixedPlacement = structuredClone(nightShift);
  mixedPlacement.tileParams.prePlacedBuildables![0]!.x = 33;
  mixedPlacement.tileParams.waterSources.push({ kind: 'spring_pond', x: 31, z: 0, radius: 2 });
  expect(reasonKeys(mixedPlacement, nightShift)).toEqual([
    ['fixture_outside_claim', 'tileParams.prePlacedBuildables[0]'],
    ['water_source_outside_claim', 'tileParams.waterSources[0]'],
  ]);
});

test('zone gestures add one history mark and undo byte-exactly', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await openEditor(page, 'e1-twin-banks');
  await selectMode(page);
  const before = await editorState(page);
  await dragWorld(page, testInfo, 64, { x: 0, z: -18.5 }, { x: 2, z: -18.5 });
  const moved = await editorState(page);
  expect(moved.contract.tileParams.buildZones?.[0]).toMatchObject({ minX: -26, maxX: 30 });
  expect(moved.history.past.length).toBe(before.history.past.length + 1);
  expect(moved.history.past.at(-1)).toBe(before.bytes);

  await commitAndReload(page, () => page.getByTestId('terrain-brush-undo').click());
  expect((await editorState(page)).bytes).toBe(before.bytes);
  await commitAndReload(page, () => page.getByTestId('terrain-brush-redo').click());
  expect((await editorState(page)).bytes).toBe(moved.bytes);

  await selectMode(page);
  await tapWorld(page, testInfo, 64, { x: 2, z: -18.5 });
  const selected = await editorState(page);
  expect(selected.bytes).toBe(moved.bytes);
  expect(selected.history).toEqual(moved.history);
  await dragWorld(page, testInfo, 64, { x: -26, z: -7 }, { x: -24, z: -6.5 });
  expect((await editorState(page)).contract.tileParams.buildZones?.[0]).toMatchObject({ minX: -24, maxZ: -6.5 });

  const beforeRejected = await editorState(page);
  const rejectedUrl = page.url();
  await dragWorldGesture(page, testInfo, 64, { x: 3, z: -18.25 }, { x: 3, z: 20 });
  await expect(page.locator('[data-reason-code="build_zone_wrong_bank"]')).toBeVisible();
  const afterRejected = await editorState(page);
  expect(afterRejected.bytes).toBe(beforeRejected.bytes);
  expect(afterRejected.history).toEqual(beforeRejected.history);
  expect(page.url()).toBe(rejectedUrl);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('pond handles move and resize only the circle descriptor', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await openEditor(page, 'e1-dry-gulch');
  await selectMode(page);
  await dragWorld(page, testInfo, 64, { x: -18, z: -18 }, { x: -15, z: -15 });
  expect((await editorState(page)).contract.tileParams.waterSources[0]).toEqual({ kind: 'spring_pond', x: -15, z: -15, radius: 1.4 });

  await selectMode(page);
  await tapWorld(page, testInfo, 64, { x: -15, z: -15 });
  await dragWorld(page, testInfo, 64, { x: -8.714, z: -15 }, { x: -5.114, z: -15 });
  expect((await editorState(page)).contract.tileParams.waterSources[0]?.radius).toBe(5);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('spawn gates move tangentially and fixtures expose move only', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await openEditor(page, 'e2-hill-mine');
  await selectMode(page);
  await dragWorld(page, testInfo, 96, { x: -46, z: 6.25 }, { x: -35, z: 10.25 });
  expect((await editorState(page)).contract.twist.enemyRoster![0]!.spawnGates![0]).toEqual({ edge: 'west', x: -46, z: 10.25 });

  await openEditor(page, 'e1-night-shift');
  await selectMode(page);
  const button = await page.getByTestId('terrain-brush-mode-select').boundingBox();
  expect(button?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(await page.getByTestId('terrain-brush-map').evaluate((canvas) => getComputedStyle(canvas).touchAction)).toBe('none');
  await dragWorld(page, testInfo, 64, { x: 0, z: 16 }, { x: 3, z: 18 }, { x: 20, y: 0 });
  expect((await editorState(page)).contract.tileParams.prePlacedBuildables?.[0]).toEqual({
    id: 'lantern_post', x: 3, z: 18, rotationSteps: 0, wrecked: true, relightCost: 8,
  });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('plain boot does not load the Hand surface', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.getByTestId('terrain-brush-mode-select').count()).toBe(0);
  expect(await page.evaluate(() => ({
    installed: window.__GR_EDITOR__ !== undefined,
    resources: performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => /DescriptorInspector|TerrainBrush|PlacementEditor|descriptor-inspector/i.test(name)),
  }))).toEqual({ installed: false, resources: [] });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

function applyGizmo(template: ContractManifest, action: TerrainGizmoAction): ContractManifest {
  const draft = structuredClone(template);
  applyTerrainGizmo(draft, template, action);
  return draft;
}

function expectExactEdit(contract: ContractManifest, template: ContractManifest, edit: (expected: ContractManifest) => void): void {
  const expected = structuredClone(template);
  edit(expected);
  const bytes = contractDescriptorJson(contract);
  expect(bytes).toBe(contractDescriptorJson(expected));
  const parsed = parseContractDescriptor(bytes, template);
  expect(parsed.ok).toBe(true);
  if (parsed.ok) expect(contractDescriptorJson(parsed.contract)).toBe(bytes);
}

function reasonKeys(contract: ContractManifest, template: ContractManifest): string[][] {
  const parsed = parseContractDescriptor(contractDescriptorJson(contract), template);
  expect(parsed.ok).toBe(false);
  if (parsed.ok) throw new Error('Expected descriptor rejection.');
  return parsed.reasons.map((reason) => [reason.code, reason.path ?? '']);
}

async function openEditor(page: Page, contractId: string): Promise<void> {
  await page.addInitScript(() => {
    const key = 'gr.ed04.gizmos.test.initialized';
    if (sessionStorage.getItem(key) === '1') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(key, '1');
  });
  await page.goto(`/?editor&contract=${contractId}&seed=ed-04-gizmos&nowaves&nospawn&nolevel`);
  await ready(page);
}

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10 && window.__GR_EDITOR__ !== undefined);
  await expect(page.getByTestId('terrain-brush-map')).toBeVisible();
}

async function selectMode(page: Page): Promise<void> {
  await page.getByTestId('terrain-brush-mode-select').click();
  await expect(page.getByTestId('terrain-brush-mode-select')).toHaveAttribute('aria-pressed', 'true');
}

async function editorState(page: Page): Promise<{
  bytes: string;
  contract: ContractManifest;
  history: { past: string[]; future: string[] };
}> {
  return page.evaluate(() => {
    const bytes = window.__GR_EDITOR__!.descriptorJson();
    const contract = JSON.parse(bytes) as ContractManifest;
    const history = JSON.parse(sessionStorage.getItem(`gr.editor.history.v1:${contract.id}`) ?? '{"past":[],"future":[]}') as {
      past: string[];
      future: string[];
    };
    return { bytes, contract, history };
  });
}

async function dragWorld(
  page: Page,
  testInfo: TestInfo,
  claimSize: number,
  from: TerrainBrushPoint,
  to: TerrainBrushPoint,
  offset = { x: 0, y: 0 },
): Promise<void> {
  await commitAndReload(page, () => dragWorldGesture(page, testInfo, claimSize, from, to, offset));
}

async function dragWorldGesture(
  page: Page,
  testInfo: TestInfo,
  claimSize: number,
  from: TerrainBrushPoint,
  to: TerrainBrushPoint,
  offset = { x: 0, y: 0 },
): Promise<void> {
  const map = page.getByTestId('terrain-brush-map');
  await map.scrollIntoViewIfNeeded();
  const box = await map.boundingBox();
  expect(box).not.toBeNull();
  const start = worldClient(box!, claimSize, from, offset);
  const end = worldClient(box!, claimSize, to, offset);
  if (testInfo.project.name === 'mobile-chrome') {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1, radiusX: 1, radiusY: 1, force: 1 }] });
    for (let step = 1; step <= 5; step += 1) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: start.x + (end.x - start.x) * step / 5, y: start.y + (end.y - start.y) * step / 5, id: 1, radiusX: 1, radiusY: 1, force: 1 }],
      });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    try { await session.detach(); } catch {}
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 5 });
    await page.mouse.up();
  }
}

async function tapWorld(page: Page, testInfo: TestInfo, claimSize: number, at: TerrainBrushPoint): Promise<void> {
  const map = page.getByTestId('terrain-brush-map');
  await map.scrollIntoViewIfNeeded();
  const box = await map.boundingBox();
  expect(box).not.toBeNull();
  const point = worldClient(box!, claimSize, at, { x: 0, y: 0 });
  if (testInfo.project.name === 'mobile-chrome') {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, id: 1, radiusX: 1, radiusY: 1, force: 1 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    try { await session.detach(); } catch {}
  } else {
    await page.mouse.click(point.x, point.y);
  }
}

function worldClient(
  box: { x: number; y: number; width: number; height: number },
  claimSize: number,
  point: TerrainBrushPoint,
  offset: { x: number; y: number },
): { x: number; y: number } {
  const half = claimSize / 2;
  return {
    x: box.x + ((point.x + half) / claimSize) * box.width + offset.x,
    y: box.y + ((half - point.z) / claimSize) * box.height + offset.y,
  };
}

async function commitAndReload(page: Page, action: () => Promise<unknown>): Promise<void> {
  await Promise.all([page.waitForEvent('load'), action()]);
  await ready(page);
}

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}
