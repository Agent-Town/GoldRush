import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, FIRST_CLAIM_DONE_KEY, TOWN_WELCOME_SEEN_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listBoardContracts } from '../src/meta/ContractFamilies';

const root = path.resolve('artifacts/e7-tape-toggle-phone-hit-target-1');

async function bootFromBoard(page: Page, contract: string) {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (let step = 0; step < 70; step++) {
    const town = await page.evaluate(() => {
      const d = window.__GR_TOWN_DIAGNOSTICS__!;
      return { prompt: d.activePrompt, player: d.player, approach: d.buildings.find(b => b.id === 'tavern')!.approach };
    });
    if (town.prompt === 'tavern') break;
    const dx = town.approach.x - town.player.x;
    const dz = town.approach.z - town.player.z;
    const keys = [Math.abs(dx) > .3 ? (dx > 0 ? 'KeyD' : 'KeyA') : '', Math.abs(dz) > .3 ? (dz > 0 ? 'KeyS' : 'KeyW') : ''].filter(Boolean);
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(170);
    for (const key of keys) await page.keyboard.up(key);
  }
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-chapter-tab-epoch-7-signal').click();
  await page.getByTestId(`contract-launch-${contract}`).click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 }).toBe(contract);
  await page.getByTestId('contract-briefing-dismiss').click();
  await expect(page.getByTestId('contract-briefing')).toBeHidden();
  await expect(page.getByTestId('playbook-toggle')).toBeVisible();
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  for (const flag of ['debug', 'seed', 'timescale', 'nowaves', 'nolevel', 'nokill']) expect(new URL(page.url()).searchParams.has(flag)).toBe(false);
}

async function sample(page: Page, moment: string) {
  return page.getByTestId('playbook-toggle').evaluate((toggle, moment) => {
    const box = toggle.getBoundingClientRect();
    const style = getComputedStyle(toggle);
    const describe = (element: Element | null) => element ? {
      tag: element.tagName, id: element.id, className: element.getAttribute('class'), testId: element.getAttribute('data-testid'),
      pointerEvents: getComputedStyle(element).pointerEvents, zIndex: getComputedStyle(element).zIndex,
    } : null;
    const points = [
      ['centre', box.x + box.width / 2, box.y + box.height / 2],
      ['top-left', box.left + 2, box.top + 2], ['top-right', box.right - 2, box.top + 2],
      ['bottom-left', box.left + 2, box.bottom - 2], ['bottom-right', box.right - 2, box.bottom - 2],
    ] as const;
    return {
      moment, url: location.href, viewport: { width: innerWidth, height: innerHeight },
      contract: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId,
      wave: window.__THREE_GAME_DIAGNOSTICS__?.wave, sim: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive,
      overlayOpen: document.querySelector('[data-testid="upgrade-overlay"]')?.getAttribute('aria-hidden') === 'false',
      box: box.toJSON(), zIndex: style.zIndex, pointerEvents: style.pointerEvents,
      ancestors: [toggle.parentElement, toggle.parentElement?.parentElement ?? null].map(describe),
      points: points.map(([name, x, y]) => {
        const top = document.elementFromPoint(x, y);
        return { name, x, y, top: describe(top), reachesToggle: top === toggle || (top !== null && toggle.contains(top)) };
      }),
    };
  }, moment);
}

test('plain E7 board launches expose the Tape Reel hit target', async ({ page, isMobile }, info) => {
  test.setTimeout(180_000);
  page.setDefaultTimeout(10_000);
  // A new board launch asks before replacing the prior audit's suspended run.
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toMatch(/^Abandon .* and launch /);
    await dialog.accept();
  });
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', message => { if (message.type() === 'error') errors.consoleErrors.push(message.text()); });
  page.on('pageerror', error => errors.pageErrors.push(error.message));
  // Only persisted access prerequisites: no run state, debug seam, or synthetic overlay.
  const logical = [
    [ACTIVE_EPOCH_KEY, 'epoch-7-signal'], [TOWN_NAME_KEY, 'Quartz Hill'], [FIRST_CLAIM_DONE_KEY, '1'], [TOWN_WELCOME_SEEN_KEY, '1'],
    [SCOREBOARD_KEY, JSON.stringify(listBoardContracts().filter(c => ['e7-relay-valley', 'e7-echo-canyon', 'e7-dead-band'].includes(c.id)).map((c, i) => ({ waves: 30, kills: 1, gold: 1, timeAlive: 60, at: i + 1, secured: true, contractId: c.id })))],
  ];
  await page.addInitScript(({ profileKey, entries }) => {
    if (sessionStorage.getItem('tape-hit-audit-seeded')) return;
    localStorage.setItem(profileKey, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
    for (const [key, value] of entries) localStorage.setItem(key, value);
    sessionStorage.setItem('tape-hit-audit-seeded', '1');
  }, { profileKey: PROFILE_KEY, entries: logical.flatMap(([key, value]) => [[key, value], [profileDataKey('robin', key), value]]) });
  const samples: Awaited<ReturnType<typeof sample>>[] = [];
  await mkdir(root, { recursive: true });
  try {
    await bootFromBoard(page, 'e7-echo-canyon');
    samples.push(await sample(page, 'HUD mounted'));
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave), { timeout: 30_000 }).toBe(1);
    samples.push(await sample(page, 'wave 1'));
    // Screenshot annotation is outline-only: it does not alter layout or hit testing.
    await page.getByTestId('playbook-toggle').evaluate(el => el.style.outline = '3px solid magenta');
    const shot = await sharp(await page.screenshot({ scale: 'css' })).png({ palette: true, colours: 128 }).toBuffer();
    await writeFile(path.join(root, `${info.project.name}-toggle.png`), shot);
    await page.getByTestId('playbook-toggle').evaluate(el => el.style.removeProperty('outline'));
    expect(shot.byteLength).toBeLessThan(400_000);
    await expect(page.getByTestId('upgrade-overlay')).toHaveAttribute('aria-hidden', 'false', { timeout: 90_000 });
    samples.push(await sample(page, 'Patent Office open'));
    await page.getByTestId('upgrade-card-0').click();
    await expect(page.getByTestId('upgrade-overlay')).toHaveAttribute('aria-hidden', 'true');
    samples.push(await sample(page, 'Patent Office closed'));
    for (const row of samples.filter(s => !s.overlayOpen)) {
      expect.soft(row.points[0].reachesToggle, `${row.moment}: ${JSON.stringify(row.points[0].top)}`).toBe(true);
      expect.soft(row.box.width).toBeGreaterThanOrEqual(44);
      expect.soft(row.box.height).toBeGreaterThanOrEqual(44);
    }
    if (samples.at(-1)!.points[0].reachesToggle) {
      if (isMobile) await page.getByTestId('playbook-toggle').tap();
      else await page.getByTestId('playbook-toggle').click();
      await expect(page.getByTestId('playbook-library')).toBeVisible();
      await page.getByRole('button', { name: 'Close Playbook Library' }).click();
    }
    if (isMobile) for (const contract of ['e7-relay-rush', 'e7-dead-band']) {
      await bootFromBoard(page, contract);
      const row = await sample(page, 'HUD mounted');
      samples.push(row);
      expect.soft(row.points[0].reachesToggle, contract).toBe(true);
    }
    await page.goto('/?contract=the-claim&nowaves&nolevel&nopause');
    await expect(page.getByTestId('playbook-toggle')).toBeVisible();
  } finally {
    await writeFile(path.join(root, `audit-${info.project.name}.json`), JSON.stringify({ project: info.project.name, samples, errors }, null, 2) + '\n');
    expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  }
});
