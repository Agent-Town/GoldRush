import { expect, type Page } from '@playwright/test';

const SIM_PROGRESS_TIMEOUT = 15_000;

export async function moveHeroTo(page: Page, x: number, z: number): Promise<void> {
  const started = Date.now();
  let key = 'KeyW';
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (await page.getByTestId('upgrade-overlay').isVisible()) {
      await page.getByTestId('upgrade-card-0').click();
      await expect(page.getByTestId('upgrade-overlay')).toBeHidden();
    }
    const current = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
    const dx = x - current.x;
    const dz = z - current.z;
    if (Math.hypot(dx, dz) <= 0.12) {
      return;
    }
    if (Date.now() - started >= SIM_PROGRESS_TIMEOUT) break;
    const axis: 'x' | 'z' = Math.abs(dx) > Math.abs(dz) ? 'x' : 'z';
    const axisTarget = axis === 'x' ? x : z;
    const delta = axisTarget - current[axis];
    key = axis === 'x' ? (delta < 0 ? 'KeyA' : 'KeyD') : (delta < 0 ? 'KeyW' : 'KeyS');
    const result = await page.evaluate(({ axis, code, direction, target, timeout }) => new Promise<
      'done' | 'blocked' | 'levelup'
    >((resolve) => {
      const init = { bubbles: true, code, key: code.at(-1)!.toLowerCase() };
      const began = performance.now();
      let released = false;
      window.dispatchEvent(new KeyboardEvent('keydown', init));
      const finish = (status: 'done' | 'blocked' | 'levelup') => {
        if (!released) window.dispatchEvent(new KeyboardEvent('keyup', init));
        resolve(status);
      };
      const sample = () => {
        const now = performance.now();
        const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
        if (!diagnostics || now - began >= timeout) return finish('blocked');
        if (diagnostics.state === 'levelup') return finish('levelup');
        const remaining = direction * (target - diagnostics.heroPos[axis]);
        if (!released && remaining <= diagnostics.speed / 28 + 0.08) {
          window.dispatchEvent(new KeyboardEvent('keyup', init));
          released = true;
        }
        if (released && diagnostics.speed < 0.05) return finish('done');
        window.setTimeout(sample, 16);
      };
      window.setTimeout(sample, 16);
    }), {
      axis,
      code: key,
      direction: Math.sign(delta),
      target: axisTarget,
      timeout: SIM_PROGRESS_TIMEOUT - (Date.now() - started),
    });
    if (result === 'blocked') break;
  }
  throw new Error(`Hero blocked while moving ${key}`);
}
