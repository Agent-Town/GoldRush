import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
  LabPlayback,
  corruptPlaybook,
  createRecordedPlaybook,
  validatePlaybook,
  type LabPlaybackEvent,
} from '../src/spikes/playbook/PlaybookModel';

const ARTIFACT_DIR = path.resolve('artifacts/e7-playbook-spike');
const QUERY = '?debug&playbook&nowaves&nolevel&nopause&seed=e7-playbook-spike';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type LabSnapshot = {
  tick: number;
  phase: string;
  steps: number;
  hash: string | null;
  corruptedHash: string | null;
  player: { x: number; z: number };
  agent: { x: number; z: number };
  echo: { x: number; z: number };
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('records, validates, replays, corrupts, and mirrors one bounded tape', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.goto(`/${QUERY}`);
  await expect(page.getByTestId('playbook-lab')).toBeVisible();

  await page.getByTestId('lab-start').click();
  await page.getByTestId('lab-cell-3-2').click();
  await expect.poll(() => labSnapshot(page).then((state) => state?.steps ?? 0)).toBe(1);
  await page.getByTestId('lab-mark').click();
  await expect.poll(() => labSnapshot(page).then((state) => state?.steps ?? 0)).toBe(2);
  await page.getByTestId('lab-finish').click();
  await expect(page.getByTestId('lab-status')).toContainText('VALID');

  const recorded = await labSnapshot(page);
  expect(recorded?.hash).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
  expect(recorded?.player).toEqual({ x: 3, z: 2 });

  await page.getByTestId('lab-replay').click();
  await expect.poll(() => labSnapshot(page).then((state) => state?.phase)).toBe('ready');
  expect((await labSnapshot(page))?.agent).toEqual({ x: 3, z: 2 });

  await page.getByTestId('lab-corrupt').click();
  const firstCorruption = await labSnapshot(page);
  expect(firstCorruption?.corruptedHash).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
  expect(firstCorruption?.corruptedHash).not.toBe(firstCorruption?.hash);
  await page.getByTestId('lab-corrupt').click();
  expect((await labSnapshot(page))?.corruptedHash).toBe(firstCorruption?.corruptedHash);

  const tape = JSON.parse((await page.getByTestId('lab-json').textContent()) ?? '{}');
  expect(tape.provenance).toMatchObject({ kind: 'corrupted', seed: 'static-wave-7', mutation: 'offset-target' });
  expect(tape.capabilityCeiling.tools).toEqual(['lab.mark', 'lab.move_to']);
  const lastMove = [...tape.steps].reverse().find((step: { call: { tool: string } }) => step.call.tool === 'lab.move_to');

  await page.getByTestId('lab-echo').click();
  await expect.poll(() => labSnapshot(page).then((state) => state?.phase)).toBe('ready');
  expect((await labSnapshot(page))?.echo).toEqual({ x: 6 - lastMove.call.args.target.x, z: lastMove.call.args.target.z });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-lab.png`), fullPage: true });

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('validator rejects authority and shape changes while corruption stays deterministic', () => {
  const recorded = createRecordedPlaybook('ridge patrol', { x: 1, z: 2 }, [
    { atTick: 1, call: { tool: 'lab.move_to', args: { target: { x: 3, z: 2 } } } },
    { atTick: 12, call: { tool: 'lab.mark', args: { label: 'signal' } } },
  ]);
  expect(validatePlaybook(recorded)).toEqual({ ok: true, value: recorded });
  const firstRecordedRun = runToCompletion(recorded, 'agent');
  expect(firstRecordedRun).toEqual(runToCompletion(recorded, 'agent'));
  expect(firstRecordedRun.at(-1)).toMatchObject({ type: 'complete' });

  const extraField = structuredClone(recorded) as typeof recorded & { grantsAuthority: boolean };
  extraField.grantsAuthority = true;
  expect(validatePlaybook(extraField)).toMatchObject({ ok: false });

  const newTool = structuredClone(recorded) as unknown as { steps: Array<{ call: { tool: string } }> };
  newTool.steps[0]!.call.tool = 'lab.delete_everything';
  expect(validatePlaybook(newTool)).toMatchObject({ ok: false });

  const first = corruptPlaybook(recorded, 'wave-7');
  const second = corruptPlaybook(recorded, 'wave-7');
  expect(first).toEqual(second);
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  expect(first.value.capabilityCeiling).toEqual(recorded.capabilityCeiling);
  expect(first.value.steps.filter((step, index) => JSON.stringify(step) !== JSON.stringify(recorded.steps[index]))).toHaveLength(1);
  const firstAgentRun = runToCompletion(first.value, 'agent');
  expect(firstAgentRun).toEqual(runToCompletion(first.value, 'agent'));
  expect(firstAgentRun.at(-1)).toMatchObject({ type: 'complete' });
  expect(runToCompletion(first.value, 'echo').at(-1)).toMatchObject({ type: 'complete' });
});

test('plain boot does not load or install the playbook chunk', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&nopause');
  await page.waitForTimeout(500);
  expect(await page.getByTestId('playbook-lab').count()).toBe(0);
  const state = await page.evaluate(() => ({
    installed: (window as Window & { __GR_PLAYBOOK_LAB__?: unknown }).__GR_PLAYBOOK_LAB__ !== undefined,
    resources: performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => /PlaybookLab|playbook-spike/i.test(name)),
  }));
  expect(state).toEqual({ installed: false, resources: [] });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

function runToCompletion(playbook: unknown, mode: 'agent' | 'echo'): LabPlaybackEvent[] {
  const playback = new LabPlayback(playbook, mode);
  const events: LabPlaybackEvent[] = [];
  for (let tick = 0; tick < 2_000 && playback.snapshot.status === 'running'; tick += 1) {
    events.push(...playback.advance());
  }
  return events;
}

async function labSnapshot(page: Page): Promise<LabSnapshot | null> {
  return page.evaluate(() => {
    const lab = (window as Window & { __GR_PLAYBOOK_LAB__?: { snapshot: () => LabSnapshot } }).__GR_PLAYBOOK_LAB__;
    return lab?.snapshot() ?? null;
  });
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}
