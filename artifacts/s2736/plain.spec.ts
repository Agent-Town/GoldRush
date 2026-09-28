import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, SCOREBOARD_KEY, STORY_FIRST_BOOT_KEY, TOWN_NAME_KEY, profileDataKey } from '../../src/game/ProfileStorage';

test('plain claim exposes the music control and keeps music off after reload', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', m => { if (m.type() === 'error') errors.console.push(m.text()); });
  page.on('pageerror', e => errors.page.push(e.message));
  await page.addInitScript(({ profile, scores, guide, story, town }) => {
    if (!localStorage.getItem(profile)) {
      localStorage.setItem(profile, JSON.stringify({ version: 2, activeId: 'audio-gate', profiles: [{ id: 'audio-gate', name: 'Audio gate', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
      localStorage.setItem(scores, JSON.stringify([{ waves: 12, kills: 30, gold: 50, timeAlive: 300, at: 1, secured: true, contractId: 'the-claim', profileName: 'Audio gate' }]));
      localStorage.setItem(guide, '1'); localStorage.setItem(story, '1'); localStorage.setItem(town, 'Quartz Hill');
    }
    sessionStorage.setItem('gr.contract.launch.v1', 'the-claim');
  }, { profile: PROFILE_KEY, scores: profileDataKey('audio-gate', SCOREBOARD_KEY), guide: profileDataKey('audio-gate', FIRST_CLAIM_DONE_KEY), story: profileDataKey('audio-gate', STORY_FIRST_BOOT_KEY), town: profileDataKey('audio-gate', TOWN_NAME_KEY) });
  await page.goto('/?contract=the-claim');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30, null, { timeout: 60_000 });
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.click();
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-run3d-pilot-state', 'ready', { timeout: 60_000 });
  expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  const perf = await page.evaluate(async () => {
    const gaps: number[] = []; let last = performance.now();
    await new Promise<void>(resolve => { const tick = (now: number) => { gaps.push(now-last); last=now; if(gaps.length<240)requestAnimationFrame(tick);else resolve(); }; requestAnimationFrame(tick); });
    gaps.sort((a,b)=>a-b);
    return { frames: gaps.length, p95: gaps[Math.floor(gaps.length*.95)], renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer };
  });
  const out = process.env.GR_AUDIO_EVIDENCE!; await mkdir(out, { recursive: true });
  let geometry: unknown = null;
  if (process.env.GR_AUDIO_ARM !== 'control') {
    const toggle = page.getByTestId('music-toggle');
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    geometry = await toggle.evaluate(el => { const r=el.getBoundingClientRect();return {box:r.toJSON(),centreHits:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}; });
    expect((geometry as {centreHits:boolean}).centreHits).toBe(true);
    await toggle.click(); await expect(toggle).toHaveText('Music off');
    await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__?.loops ?? [])).not.toContain('era-e1-frontier-loop');
    await page.screenshot({ path: `${out}/${info.project.name}.jpg`, type:'jpeg', quality:80 });
    await page.reload();
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30, null, { timeout:60_000 });
    await expect(page.getByTestId('music-toggle')).toHaveText('Music off');
  }
  await writeFile(`${out}/${info.project.name}.json`, JSON.stringify({url:page.url(),viewport:page.viewportSize(),perf,geometry,errors},null,2));
  expect(errors).toEqual({console:[],page:[]});
});
