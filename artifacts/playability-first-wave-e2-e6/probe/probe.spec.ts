/**
 * probe.spec.ts — DIAGNOSTIC ONLY (task playability-first-wave-e2-e6, scope item 1).
 *
 * It boots a contract EXACTLY the way `e2e/playability-smoke.spec.ts` does (same seeded profile,
 * same `?contract=&seed=smoke-<id>&timescale=4`, same "click the canvas, hold D, hold W" the smoke
 * calls "moves"), then samples the read-only diagnostics every 250 ms until the run dies or reaches
 * wave 2 — so the killer can be NAMED with numbers instead of guessed.
 *
 * `GR_PROBE_DEBUG=1` adds `&debug`, which unlocks `__GR_TEST__.enemyPositions()` and lets the probe
 * name the roster variant and its distance to the hero at each sample. The debug seam is a READER
 * here, never a lever: the no-debug arm is run first and the death second of the two arms is
 * compared in the report.
 */
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../../../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../../../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listBoardContracts, listEpochs } from '../../../src/meta/ContractFamilies';
import { researchStateKey } from '../../../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../../../src/story/settings';

const OUT_DIR = path.resolve('artifacts/playability-first-wave-e2-e6/probe');
const LABEL = (process.env.GR_PROBE_LABEL ?? 'before').trim();
const DEBUG_SEAM = process.env.GR_PROBE_DEBUG === '1';
const TIMESCALE = process.env.GR_PROBE_TIMESCALE ?? '4';
const WINDOW_MS = Number(process.env.GR_PROBE_WINDOW_MS ?? 90_000);
const PROFILE_ID = 'robin';
const BOARD = listBoardContracts();
const ONLY = (process.env.GR_PROBE_ONLY ?? 'e2-trestle,e2-incline,e6-picnic')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);
const CONTRACTS = BOARD.filter((entry) => ONLY.includes(entry.id));

function seedEntries(): Array<[string, string]> {
  const profile: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [{ id: PROFILE_ID, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  };
  const scores = BOARD.map((entry, index) => ({
    kills: 40,
    gold: 400,
    timeAlive: 600,
    at: index + 1,
    waves: 30,
    secured: true,
    contractId: entry.id,
    profileName: 'Robin',
  }));
  const meta = JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } });
  const research = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
  const logical: Array<[string, string]> = [
    [SCOREBOARD_KEY, JSON.stringify(scores)],
    [META_PROGRESS_KEY, meta],
    [TOWN_NAME_KEY, 'Quartz Hill'],
    [ACTIVE_EPOCH_KEY, 'epoch-10-deepsky'],
    [FIRST_CLAIM_DONE_KEY, '1'],
    [TOWN_WELCOME_SEEN_KEY, '1'],
    [STORY_TALES_STORAGE_KEY, '0'],
    ...listEpochs().map((epoch): [string, string] => [researchStateKey(epoch.id), research]),
  ];
  return [
    [PROFILE_KEY, JSON.stringify(profile)],
    ...logical.flatMap(([key, value]): Array<[string, string]> => [
      [key, value],
      [profileDataKey(PROFILE_ID, key), value],
    ]),
  ];
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

test.describe('playability probe', () => {
  for (const contract of CONTRACTS) {
    test(`${contract.id} first-wave probe`, async ({ page }, testInfo) => {
      test.setTimeout(WINDOW_MS + 120_000);
      await mkdir(OUT_DIR, { recursive: true });
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.addInitScript(
        ({ entries, launchKey, launchValue }) => {
          try {
            localStorage.clear();
            for (const [key, value] of entries) localStorage.setItem(key, value);
          } catch {}
          try {
            sessionStorage.clear();
            sessionStorage.setItem(launchKey, launchValue);
          } catch {}
        },
        { entries: seedEntries(), launchKey: 'gr.contract.launch.v1', launchValue: contract.id },
      );
      await page.goto(
        `/?contract=${encodeURIComponent(contract.id)}&seed=smoke-${contract.id}&timescale=${TIMESCALE}${DEBUG_SEAM ? '&debug' : ''}`,
      );
      await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 60_000 });
      await page.getByTestId('contract-briefing-dismiss').click({ timeout: 8_000 }).catch(() => undefined);
      if (process.env.GR_PROBE_NO_MOVE !== '1') {
        await page.locator('#game-canvas').click({ position: { x: 40, y: 40 }, timeout: 8_000 }).catch(() => undefined);
        await hold(page, 'KeyD', 1_000);
        await hold(page, 'KeyW', 1_000);
      }

      const samples: unknown[] = [];
      const started = Date.now();
      let reached = 0;
      let upgrades = 0;
      while (Date.now() < started + WINDOW_MS) {
        const snapshot = await page
          .evaluate((withSeam) => {
            const d = window.__THREE_GAME_DIAGNOSTICS__;
            const enemies = withSeam
              ? (window.__GR_TEST__?.enemyPositions?.() ?? []).map((enemy) => ({
                  v: enemy.variantId ?? enemy.eliteKind ?? 'base',
                  l: enemy.variantLabel ?? '',
                  hp: Number(enemy.hp?.toFixed?.(1) ?? enemy.hp),
                  mx: Number(enemy.maxHp?.toFixed?.(1) ?? enemy.maxHp),
                  x: Number(enemy.x.toFixed(1)),
                  z: Number(enemy.z.toFixed(1)),
                  cd: enemy.contactDamage,
                  w: enemy.wrangleState ?? null,
                }))
              : [];
            return {
              t: Number((d?.timeAlive ?? 0).toFixed(2)),
              hp: Number((d?.hp ?? 0).toFixed(1)),
              maxHp: d?.maxHp ?? 0,
              wave: d?.wave ?? 0,
              hudWave: document.querySelector('[data-hud-wave-number]')?.textContent?.trim() ?? '',
              waveState: String(d?.waveState ?? ''),
              alive: d?.enemiesAlive ?? 0,
              kills: d?.kills ?? 0,
              gold: d?.ui?.gold ?? 0,
              level: d?.ui?.level ?? 0,
              runState: String(d?.runState ?? ''),
              hero: d?.heroPos ? { x: Number(d.heroPos.x.toFixed(1)), z: Number(d.heroPos.z.toFixed(1)) } : null,
              ann: d?.ui?.announcement ?? null,
              annEdge: d?.ui?.announcementEdge ?? null,
              pressure: d?.pressure ? { coal: d.pressure.coal, objective: d.pressure.objective } : null,
              picnic: Array.isArray(d?.picnicHold) ? d.picnicHold.length : 0,
              picnicDiag: d?.picnicHold ?? null,
              drill: d?.drillYard ?? null,
              upgrade: document.querySelector('[data-testid="upgrade-overlay"]')?.getAttribute('aria-hidden') === 'false',
              enemies,
            };
          }, DEBUG_SEAM)
          .catch(() => null);
        if (!snapshot) break;
        samples.push({ wall: Number(((Date.now() - started) / 1000).toFixed(2)), ...snapshot });
        reached = Math.max(reached, snapshot.wave, Number.parseInt(snapshot.hudWave, 10) || 0);
        if (reached >= 2 && process.env.GR_PROBE_NO_WAVE_BREAK !== '1') break;
        if (snapshot.runState === 'dead' || snapshot.runState === 'won') break;
        if (snapshot.upgrade) {
          upgrades += 1;
          await page.keyboard.press('Digit1');
        }
        await page.waitForTimeout(250);
      }
      const record = {
        label: LABEL,
        debugSeam: DEBUG_SEAM,
        project: testInfo.project.name,
        contract: contract.id,
        reached,
        upgrades,
        wallSeconds: Number(((Date.now() - started) / 1000).toFixed(2)),
        consoleErrors,
        pageErrors,
        samples,
      };
      await appendFile(path.join(OUT_DIR, `probe-${LABEL}.jsonl`), `${JSON.stringify(record)}\n`, 'utf8');
      const last = samples.at(-1) as { t?: number; runState?: string; hp?: number } | undefined;
      console.log(
        `PROBE ${contract.id} [${testInfo.project.name}] reached=${reached} runState=${last?.runState} sim=${last?.t}s hp=${last?.hp} samples=${samples.length} console=${consoleErrors.length} page=${pageErrors.length}`,
      );
    });
  }
});
