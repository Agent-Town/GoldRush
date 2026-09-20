import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs, loadEpoch } from '../../src/meta/ContractFamilies';

/**
 * THE OWNER COULD NOT GET COAL. Playtest report, 2026-08-21, verbatim: *"I was not able to ever
 * obtain coal or use the pressure weapons when I played maps in E2"*.
 *
 * This probe answers the two questions that report raises, in order, and refuses to guess at either:
 *
 *   1. IS THE COAL BURIED? The F-SEAM-1 class (`e2e/seam-visual-follows-sculpt.spec.ts`) — the owner
 *      said *"There is not gold to be collected"* about seams whose sim was perfect and whose
 *      sprites were up to 6.18 m underground, because `Game.resampleVisualHeights()` did not know
 *      about them. `PressureSystem` is NOT on that hook's list either, so the question is real. It is
 *      settled by MEASUREMENT: `visualY` (where the lump was placed) against `groundY` (where the
 *      sculpted ground is), on the far side of the GLB mount, at every authored seam.
 *   2. IF IT IS NOT BURIED, WHAT DOES A FRESH PLAYER ACTUALLY SEE? The screenshots are the report.
 *
 * Plain boot throughout, by the real path — `ContractFamilies.ts` refuses a `?contract=` outside
 * debug/launched, so a URL boot would silently measure the DEFAULT claim (F-E2PL-3).
 */

const ARTIFACT_DIR = path.resolve('artifacts/e2-pressure-line/coal-shots');
/** `PressureSystem.SEAM_LIFT` — the lift `syncSeams` stands a lump on. */
const SEAM_LIFT = 0.32;
const FLUSH_TOLERANCE = 0.01;

async function seedEpochTwo(page: Page, wonContractId: string | null): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ keys, won }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.epoch, 'epoch-2-steamworks');
      localStorage.setItem(
        keys.scores,
        won === null
          ? '[]'
          : JSON.stringify([{ waves: 12, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: won, profileName: 'Robin' }]),
      );
    },
    {
      won: wonContractId,
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        epoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),
        scores: profileDataKey('robin', SCOREBOARD_KEY),
      },
    },
  );
  await page.reload();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function launchFromBoard(page: Page, contractId: string, wonContractId: string | null): Promise<void> {
  await seedEpochTwo(page, wonContractId);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 12_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  const chapter = listEpochs().find((epoch) => loadEpoch(epoch.id).contracts.some((contract) => contract.id === contractId));
  await page.getByTestId(`contract-chapter-tab-${chapter!.id}`).click();
  await expect(page.getByTestId(`contract-card-${contractId}`)).toHaveAttribute('data-contract-locked', 'false');
  await page.getByTestId(`contract-launch-${contractId}`).click();
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, contractId, { timeout: 30_000 });
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  // THE WHOLE DEFECT CLASS LIVES ON THE FAR SIDE OF THIS WAIT: until the sculpt's GLB mounts and
  // installs its height source, `visualY` answers with the legacy painted heightfield.
  await page.waitForFunction(
    () => document.querySelector('canvas')?.dataset.terrain3dPilotTerrainLoadState === 'mounted',
    undefined,
    { timeout: 90_000 },
  );
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
}

const CASES = [
  { contractId: 'e2-hill-mine', unlockedBy: null },
  { contractId: 'e2-trestle', unlockedBy: 'e2-hill-mine' },
  { contractId: 'e2-incline', unlockedBy: 'e2-pressure-garden' },
] as const;

for (const { contractId, unlockedBy } of CASES) {
  test(`${contractId}: the coal stands on the ground a fresh player walks on`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

    await launchFromBoard(page, contractId, unlockedBy);

    const pressure = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure);
    expect(pressure?.enabled, 'the pressure line is live').toBe(true);
    expect(pressure!.seams.length).toBe(3);

    // THE F-SEAM-1 PIN, per seam: the lump is drawing, and it is standing on the CURRENT ground.
    for (const [index, seam] of pressure!.seams.entries()) {
      expect(seam.spriteVisible, `seam ${index} (${seam.x},${seam.z}) is drawing`).toBe(true);
      expect(Number.isFinite(seam.visualY), `seam ${index} has a placed visual Y`).toBe(true);
      expect(
        Math.abs(seam.visualY - (seam.groundY + SEAM_LIFT)),
        `seam ${index} (${seam.x},${seam.z}) flush: visualY ${seam.visualY} vs ground ${seam.groundY}+${SEAM_LIFT}`,
      ).toBeLessThanOrEqual(FLUSH_TOLERANCE);
    }
    // No coal is granted by standing still on the stake — the line is offered, not given.
    expect(pressure!.coal).toBe(0);

    // WHAT THE FRESH PLAYER SEES. `coal_survey` is NOT taken here, which is the whole point: this is
    // the unmarked state the owner played in.
    expect(pressure!.seams.every((seam) => seam.marked === false), 'no survey marks without the node').toBe(true);
    await mkdir(ARTIFACT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${contractId}-stake.png`) });

    // ...and what he sees STANDING ON THE SEAM, which is the whole interaction: `harvestCoal` needs
    // a body within `coalHarvestRange` (1.35) for `coalHarvestSeconds` (0.8), with no prompt, no
    // button and no progress read-out. The close-up needs `__GR_TEST__.teleport`, so it carries
    // `?debug` — INSTRUMENTED FRAMING FOR A CAMERA ONLY. Every assertion above ran on the plain boot.
    const target = pressure!.seams[0]!;
    await page.goto(`/?debug&contract=${contractId}&nowaves&nolevel&nopause&seed=coal-visual`);
    await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20, undefined, { timeout: 60_000 });
    await page.waitForFunction(
      () => document.querySelector('canvas')?.dataset.terrain3dPilotTerrainLoadState === 'mounted',
      undefined,
      { timeout: 90_000 },
    );
    await page.evaluate(([x, z]) => window.__GR_TEST__!.teleport(x as number, z as number), [target.x, target.z]);
    await page.waitForTimeout(1_500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${contractId}-on-seam-debugframing.png`) });
    const afterStanding = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure);
    console.log(`${contractId} ${testInfo.project.name} standing on seam 0 for 1.5s -> coal=${afterStanding?.coal}`
      + ` harvested=${JSON.stringify(afterStanding?.seams.map((seam) => seam.harvested))}`);

    console.log(`${contractId} ${testInfo.project.name} seams: ${JSON.stringify(pressure!.seams.map((seam) => ({
      x: seam.x, z: seam.z, visualY: Number(seam.visualY.toFixed(3)), groundY: Number(seam.groundY.toFixed(3)),
      gap: Number((seam.visualY - (seam.groundY + SEAM_LIFT)).toFixed(3)), drawn: seam.spriteVisible,
    })))} source=${pressure!.seamSource}`);

    expect(problems).toEqual([]);
  });
}
