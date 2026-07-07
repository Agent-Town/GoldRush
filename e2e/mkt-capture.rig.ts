import { expect, test, type Browser, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { META_PROGRESS_KEY, type MetaProgress } from '../src/game/MetaProgress';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';

type Aspect = { id: '16x9' | '9x16'; width: number; height: number };
type DebugParams = Record<string, boolean | number | string>;
type ShotAction =
  | { type: 'teleport'; x: number; z: number }
  | { type: 'waitFrames'; frames: number }
  | { type: 'grantGold'; amount: number }
  | { type: 'setBalance'; path: string; value: number | boolean | string }
  | { type: 'placeBuildable'; id: BuildableId; x: number; z: number; rotated?: boolean; upgradeTo?: number }
  | { type: 'scriptEnemyFile'; count: number; startX: number; startZ: number; targetX: number; targetZ: number; spacing: number; speed: number }
  | { type: 'waitForEnemies'; count: number }
  | { type: 'spawnPack'; count: number; radius: number }
  | { type: 'waitForXpMotes'; count: number }
  | { type: 'waitForReceipt'; tool: string }
  | { type: 'press'; key: string }
  | { type: 'wreck'; id: BuildableId; index: number }
  | { type: 'toggleBlast' }
  | { type: 'setBlastAim'; x: number; z: number }
  | { type: 'spawnEnemyAt'; x: number; z: number }
  | { type: 'waitForBlastsAlive'; count: number }
  | { type: 'waitForTestId'; testId: string }
  | { type: 'clickTestId'; testId: string }
  | { type: 'openResearchChart' }
  | { type: 'selectResearchNode'; id: string }
  | { type: 'waitSim'; seconds: number }
  | { type: 'holdKey'; key: string; ms: number }
  | { type: 'releaseMoveKeys' }
  | { type: 'wait'; ms: number };
type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type Shot = {
  id: string;
  seed: string;
  durationMs: number;
  description: string;
  cameraFocus: string;
  debugParams: DebugParams;
  meta?: MetaProgress['tracks'];
  research?: { taken: string[]; proposalSalt: number; pinnedTarget: string | null };
  setup: ShotAction[];
  during: ShotAction[];
  qualityNote: string;
};
type ShotFile = {
  shot: Shot;
  aspect: Aspect;
  webm: string;
  firstFrame: string;
  bytes: number;
  actualSeconds: number | null;
};

const ASPECTS: Aspect[] = [
  { id: '16x9', width: 1920, height: 1080 },
  { id: '9x16', width: 1080, height: 1920 },
];
const ROOT = process.cwd();
const SHOT_LIST_PATH = path.join(ROOT, 'marketing/shots.json');
const RAW_DIR = path.join(ROOT, 'marketing/raw');
const VIDEO_TMP_DIR = path.join(RAW_DIR, '.tmp-video');
const CAPTURE_PROFILE_ID = 'prospector';
const CAPTURE_PROFILE_NAME = 'Prospector';
const FAMILY_NAMES = ['Robin', 'Alice', 'Bob'];
const MAX_WEBM_BYTES = 25 * 1024 * 1024;
const captureDate = process.env.GR_CAPTURE_DATE ?? new Date().toISOString().slice(0, 10);
const captured: ShotFile[] = [];

test.describe.configure({ mode: 'serial' });

for (const shot of await loadShots()) {
  for (const aspect of ASPECTS) {
    test(`${shot.id} ${aspect.id}`, async ({ browser, baseURL }) => {
      test.setTimeout(45_000);
      const record = await captureShot(browser, baseURL, shot, aspect);
      captured.push(record);
      expect(record.bytes).toBeGreaterThan(0);
      if (record.actualSeconds !== null) expect(record.actualSeconds + 0.15).toBeGreaterThanOrEqual(shot.durationMs / 1000);
    });
  }
}

test.afterAll(async () => {
  await rm(VIDEO_TMP_DIR, { recursive: true, force: true });
  const totalBytes = captured.reduce((sum, file) => sum + file.bytes, 0);
  await writeIndex(captured, totalBytes);
  expect(totalBytes).toBeLessThanOrEqual(MAX_WEBM_BYTES);
});

async function captureShot(browser: Browser, baseURL: string | undefined, shot: Shot, aspect: Aspect): Promise<ShotFile> {
  if (!baseURL) throw new Error('Missing Playwright baseURL.');
  await rm(VIDEO_TMP_DIR, { recursive: true, force: true });
  const context = await browser.newContext({
    viewport: { width: aspect.width, height: aspect.height },
    screen: { width: aspect.width, height: aspect.height },
    deviceScaleFactor: 1,
    recordVideo: { dir: VIDEO_TMP_DIR, size: { width: aspect.width, height: aspect.height } },
  });
  await context.addInitScript(seedCaptureStorage, {
    profileKey: PROFILE_KEY,
    profileId: CAPTURE_PROFILE_ID,
    profileName: CAPTURE_PROFILE_NAME,
    metaKey: META_PROGRESS_KEY,
    researchKey: RESEARCH_STATE_KEY,
    meta: metaProgress(shot),
    research: shot.research ?? null,
  });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const video = page.video();
  const url = new URL(pathForShot(shot), baseURL).toString();

  await page.goto(url);
  await waitForBoot(page, shot);
  await page.addStyleTag({ content: '.lil-gui, #gr-meta-debug { display: none !important; }' });
  for (const action of shot.setup) await runAction(page, action);
  await assertCapturePrivacy(page);

  const webm = path.join(RAW_DIR, `${shot.id}-${aspect.id}-${captureDate}.webm`);
  const firstFrame = path.join(RAW_DIR, `${shot.id}-${aspect.id}-${captureDate}-first.png`);
  await rm(webm, { force: true });
  await rm(firstFrame, { force: true });
  await page.screenshot({ path: firstFrame, fullPage: false });

  const started = Date.now();
  for (const action of shot.during) await runAction(page, action);
  const remaining = shot.durationMs - (Date.now() - started);
  if (remaining > 0) await page.waitForTimeout(remaining);
  await releaseMoveKeys(page);
  await assertCapturePrivacy(page);
  expect(errors.consoleErrors, `${shot.id} console errors`).toEqual([]);
  expect(errors.pageErrors, `${shot.id} page errors`).toEqual([]);

  await context.close();
  const tempVideo = await video?.path();
  if (!tempVideo) throw new Error(`No video emitted for ${shot.id} ${aspect.id}`);
  await rename(tempVideo, webm);
  const bytes = (await stat(webm)).size;
  return { shot, aspect, webm, firstFrame, bytes, actualSeconds: probeDurationSeconds(webm) };
}

async function loadShots(): Promise<Shot[]> {
  const parsed = JSON.parse(await readFile(SHOT_LIST_PATH, 'utf8')) as { shots?: unknown };
  if (!Array.isArray(parsed.shots)) throw new Error('marketing/shots.json must contain shots[]');
  return parsed.shots.map((shot) => validateShot(shot));
}

function validateShot(value: unknown): Shot {
  if (!isRecord(value)) throw new Error('Shot must be an object');
  const shot = value as Shot;
  if (!shot.id || !shot.seed || !shot.durationMs || !Array.isArray(shot.setup) || !Array.isArray(shot.during)) {
    throw new Error(`Invalid shot: ${JSON.stringify(value)}`);
  }
  return shot;
}

function pathForShot(shot: Shot): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(shot.debugParams)) {
    if (value === false) continue;
    if (value === true) params.set(key, '');
    else params.set(key, String(value));
  }
  if (Object.keys(shot.debugParams).length > 0) params.set('seed', shot.seed);
  const query = params.toString();
  return query ? `/?${query}` : '/';
}

async function waitForBoot(page: Page, shot: Shot): Promise<void> {
  if (Object.keys(shot.debugParams).length === 0) {
    await expect(page.getByTestId('start-menu')).toBeVisible();
    return;
  }
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 12_000 });
}

async function runAction(page: Page, action: ShotAction): Promise<void> {
  if (action.type === 'teleport') {
    await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x: action.x, z: action.z });
  } else if (action.type === 'waitFrames') {
    await page.waitForFunction((frames) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) >= frames, action.frames);
  } else if (action.type === 'grantGold') {
    await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), action.amount);
  } else if (action.type === 'setBalance') {
    await expect(page.evaluate(([key, value]) => window.__GR_TEST__?.setBalance(key, value), [action.path, action.value] as const)).resolves.toBe(true);
  } else if (action.type === 'placeBuildable') {
    await placeBuildableAt(page, action);
  } else if (action.type === 'scriptEnemyFile') {
    await page.evaluate((opts) => {
      for (let i = 0; i < opts.count; i += 1) {
        window.__GR_TEST__?.scriptEnemyAt(opts.startX, opts.startZ + i * opts.spacing, opts.targetX, opts.targetZ, opts.speed);
      }
    }, action);
  } else if (action.type === 'waitForEnemies') {
    await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(action.count);
  } else if (action.type === 'spawnPack') {
    await page.evaluate((opts) => window.__GR_TEST__?.spawnPack(opts.count, opts.radius), action);
  } else if (action.type === 'waitForXpMotes') {
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesSpawned ?? 0), { timeout: 12_000 }).toBeGreaterThanOrEqual(action.count);
  } else if (action.type === 'waitForReceipt') {
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.lastReceiptTool ?? ''), { timeout: 14_000 }).toBe(action.tool);
  } else if (action.type === 'press') {
    await page.keyboard.press(action.key);
  } else if (action.type === 'wreck') {
    await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.wreck(id, index), [action.id, action.index] as const)).resolves.toBe(true);
  } else if (action.type === 'toggleBlast') {
    await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  } else if (action.type === 'setBlastAim') {
    await page.evaluate((pos) => window.__GR_TEST__?.setBlastAim(pos.x, pos.z), { x: action.x, z: action.z });
  } else if (action.type === 'spawnEnemyAt') {
    await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), { x: action.x, z: action.z })).resolves.toBe(true);
  } else if (action.type === 'waitForBlastsAlive') {
    await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.blastsAlive ?? 0), { timeout: 12_000 }).toBeGreaterThanOrEqual(action.count);
  } else if (action.type === 'waitForTestId') {
    await expect(page.getByTestId(action.testId)).toBeVisible();
  } else if (action.type === 'clickTestId') {
    await page.getByTestId(action.testId).click();
  } else if (action.type === 'openResearchChart') {
    await page.getByTestId('start-menu-research').click();
    await expect(page.getByTestId('research-chart')).toBeVisible();
  } else if (action.type === 'selectResearchNode') {
    await page.getByTestId(`research-chart-node-${action.id}`).click();
    await expect(page.getByTestId('research-chart-selection')).toContainText(action.id.replaceAll('_', ' ').split(' ')[0], { ignoreCase: true });
  } else if (action.type === 'waitSim') {
    const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
    await page.waitForFunction((target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target, start + action.seconds, { timeout: 15_000 });
  } else if (action.type === 'holdKey') {
    await page.keyboard.down(action.key);
    await page.waitForTimeout(action.ms);
  } else if (action.type === 'releaseMoveKeys') {
    await releaseMoveKeys(page);
  } else {
    await page.waitForTimeout(action.ms);
  }
}

async function placeBuildableAt(page: Page, action: Extract<ShotAction, { type: 'placeBuildable' }>): Promise<void> {
  const before = await buildableCount(page, action.id);
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x: action.x, z: action.z });
  await page.evaluate((id) => window.__GR_TEST__?.selectBuildable(id), action.id);
  if (action.rotated) await page.evaluate(() => window.__GR_TEST__?.rotateBuildGhost());
  await expect
    .poll(
      () =>
        page.evaluate(
          (target) => {
            const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
            return Boolean(build?.ghostValid && Math.abs(build.ghostPos.x - target.x) < 0.05 && Math.abs(build.ghostPos.z - target.z) < 0.05);
          },
          { x: action.x, z: action.z },
        ),
      { timeout: 8_000 },
    )
    .toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => buildableCount(page, action.id)).toBe(before + 1);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  const entry = await hpEntryAt(page, action.id, action.x, action.z);
  for (let tier = 1; tier < (action.upgradeTo ?? 1); tier += 1) {
    await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x: action.x, z: action.z });
    await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.upgradeBuilding(id, index), [action.id, entry.index] as const)).resolves.toBe(true);
  }
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate((buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0, id);
}

async function hpEntryAt(page: Page, id: BuildableId, x: number, z: number): Promise<{ index: number }> {
  const entry = await page.evaluate(
    (target) =>
      window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find(
        (candidate) =>
          candidate.id === target.id && Math.abs(candidate.position.x - target.x) < 0.05 && Math.abs(candidate.position.z - target.z) < 0.05,
      ) ?? null,
    { id, x, z },
  );
  if (!entry) throw new Error(`Missing built ${id} at ${x},${z}`);
  return entry;
}

async function releaseMoveKeys(page: Page): Promise<void> {
  for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) await page.keyboard.up(key);
}

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const bucket = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function assertCapturePrivacy(page: Page): Promise<void> {
  await expect(page.getByTestId('profile-title')).toHaveCount(0);
  const bodyText = await page.locator('body').innerText();
  for (const name of FAMILY_NAMES) expect(bodyText).not.toContain(name);
  expect(bodyText).not.toContain('Enter claim as');
}

function seedCaptureStorage(input: {
  profileKey: string;
  profileId: string;
  profileName: string;
  metaKey: string;
  researchKey: string;
  meta: MetaProgress;
  research: { taken: string[]; proposalSalt: number; pinnedTarget: string | null } | null;
}): void {
  localStorage.clear();
  sessionStorage.clear();
  const now = Date.now();
  const state: ProfileState = {
    version: 2,
    activeId: input.profileId,
    profiles: [
      {
        id: input.profileId,
        name: input.profileName,
        createdAt: now,
        updatedAt: now,
        difficultyPreset: 'trail',
        hintsSeen: [],
      },
    ],
  };
  localStorage.setItem(input.profileKey, JSON.stringify(state));
  localStorage.setItem(`${input.profileKey}.${input.profileId}.${input.metaKey}`, JSON.stringify(input.meta));
  if (input.research) localStorage.setItem(`${input.profileKey}.${input.profileId}.${input.researchKey}`, JSON.stringify({ version: 1, ...input.research }));
}

function metaProgress(shot: Shot): MetaProgress {
  return {
    version: 1,
    tracks: shot.meta ?? { territory: 0, science: 0, hero: 0, agent: 0 },
  };
}

async function writeIndex(files: ShotFile[], totalBytes: number): Promise<void> {
  const rows = files
    .map((file) => {
      const duration = file.actualSeconds === null ? `${(file.shot.durationMs / 1000).toFixed(1)}s spec` : `${file.actualSeconds.toFixed(1)}s`;
      return `| ${file.shot.id} | ${file.aspect.id} | ${duration} | [webm](./${path.basename(file.webm)}) | [png](./${path.basename(file.firstFrame)}) | ${file.shot.qualityNote} |`;
    })
    .join('\n');
  const body = `# Gold Rush raw marketing captures

Date: ${captureDate}
Capture profile: ${CAPTURE_PROFILE_NAME}
Total footage: ${sumSeconds(files).toFixed(1)} seconds
Total WebM size: ${(totalBytes / 1_000_000).toFixed(2)} MB (${(totalBytes / 1024 / 1024).toFixed(2)} MiB)

| Shot | Aspect | Duration | File | First frame | Quality note |
|---|---:|---:|---|---|---|
${rows}
`;
  await writeFile(path.join(RAW_DIR, 'INDEX.md'), body);
}

function sumSeconds(files: ShotFile[]): number {
  return files.reduce((sum, file) => sum + (file.actualSeconds ?? file.shot.durationMs / 1000), 0);
}

function probeDurationSeconds(file: string): number | null {
  try {
    const raw = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return probeWebmDurationSeconds(file);
  }
}

function probeWebmDurationSeconds(file: string): number | null {
  const buffer = readFileSync(file);
  const limit = Math.min(buffer.length, 64 * 1024);
  let timecodeScale = 1_000_000;
  for (let index = 0; index < limit - 12; index += 1) {
    if (buffer[index] === 0x2a && buffer[index + 1] === 0xd7 && buffer[index + 2] === 0xb1) {
      const size = readEbmlSize(buffer, index + 3);
      if (size && size.value > 0 && size.value <= 8) {
        let value = 0;
        const start = index + 3 + size.length;
        for (let offset = 0; offset < size.value; offset += 1) value = value * 256 + buffer[start + offset];
        if (value > 0) timecodeScale = value;
      }
    }
    if (buffer[index] === 0x44 && buffer[index + 1] === 0x89) {
      const size = readEbmlSize(buffer, index + 2);
      if (!size) continue;
      const start = index + 2 + size.length;
      const duration = size.value === 4 ? buffer.readFloatBE(start) : size.value === 8 ? buffer.readDoubleBE(start) : null;
      if (duration !== null && Number.isFinite(duration) && duration > 0) return (duration * timecodeScale) / 1_000_000_000;
    }
  }
  return null;
}

function readEbmlSize(buffer: Buffer, offset: number): { length: number; value: number } | null {
  const first = buffer[offset];
  if (first === undefined) return null;
  let length = 1;
  let marker = 0x80;
  while (length <= 8 && (first & marker) === 0) {
    length += 1;
    marker >>= 1;
  }
  if (length > 8 || offset + length > buffer.length) return null;
  let value = first & (marker - 1);
  for (let index = 1; index < length; index += 1) value = value * 256 + buffer[offset + index];
  return { length, value };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
