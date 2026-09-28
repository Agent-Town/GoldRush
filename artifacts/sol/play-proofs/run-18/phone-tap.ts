/** Read-only failure-moment geometry; annotation is applied to the saved JPEG afterwards. */
import { mkdir, writeFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
export async function phoneTapMoment(page: Page, error: unknown) {
  const root = 'artifacts/sol/play-proofs/run-18/e7-relay-valley';
  await mkdir(root, { recursive: true });
  const moment = await page.evaluate(() => {
    const describe = (el: Element | null) => el ? { tag: el.tagName, id: el.id, testid: el.getAttribute('data-testid'), classes: el.className } : null;
    const geometry = (el: Element | null) => {
      if (!el) return null;
      const style = getComputedStyle(el), rect = el.getBoundingClientRect();
      return { ...describe(el), rect: rect.toJSON(), zIndex: style.zIndex, pointerEvents: style.pointerEvents,
        display: style.display, visibility: style.visibility, opacity: style.opacity, overflow: style.overflow,
        scrollLeft: el.scrollLeft, scrollTop: el.scrollTop, clientWidth: el.clientWidth, clientHeight: el.clientHeight };
    };
    const toggle = document.querySelector('[data-testid="playbook-toggle"]');
    const r = toggle?.getBoundingClientRect();
    const points = r ? [[r.x+r.width/2,r.y+r.height/2], [r.left+4,r.top+4], [r.right-4,r.top+4], [r.left+4,r.bottom-4], [r.right-4,r.bottom-4]] : [];
    return { at: new Date().toISOString(), url: location.href, viewport: { width: innerWidth, height: innerHeight },
      scroll: { x: scrollX, y: scrollY }, toggle: geometry(toggle), weaponPanel: geometry(document.querySelector('.hud-panel--weapon')),
      canvas: geometry(document.querySelector('#game-canvas')), hud: geometry(document.querySelector('#hud')),
      ancestors: toggle ? Array.from((function*(){ let el=toggle.parentElement; while(el){ yield el; el=el.parentElement; } })()).map(geometry) : [],
      hits: points.map(([x,y],i) => ({ point: ['centre','top-left','top-right','bottom-left','bottom-right'][i], x,y,
        top: describe(document.elementFromPoint(x,y)), stack: document.elementsFromPoint(x,y).map(describe) })),
      overlays: Array.from(document.querySelectorAll('[role="dialog"], [data-testid="upgrade-overlay"], [data-testid="contract-briefing"], [data-testid="pause-overlay"], [data-testid="playbook-library"]')).map(geometry),
      run: { hp: window.__THREE_GAME_DIAGNOSTICS__?.hp, wave: window.__THREE_GAME_DIAGNOSTICS__?.wave,
        hero: window.__THREE_GAME_DIAGNOSTICS__?.heroPos, paused: window.__THREE_GAME_DIAGNOSTICS__?.paused },
    };
  });
  await writeFile(`${root}/phone-tap-moment.json`, JSON.stringify({ ...moment, error: String(error) }, null, 2)+'\n');
  await page.screenshot({ path: `${root}/phone-tap-moment.jpg`, type: 'jpeg', quality: 80, scale: 'css' });
}
