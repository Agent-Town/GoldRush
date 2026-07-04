import { expect, test, type Page } from '@playwright/test';

// s27 permanent gate for the s9j icons regression ("upgrade-card icons GONE on the
// Invention screen"): s12 shipped screenshots without an assert and the sighting
// could never be attributed. This suite pins the contract both ways:
//   - a family WITH a processed icon file must render .upgrade-card__icon and the
//     background image must actually decode (naturalWidth > 0);
//   - a family WITHOUT a file must stay a clean parchment card (placeholder-first).
// Ground truth for "has a file" is a dev-server fetch of the processed path -- the
// same origin the lazy glob resolves against.

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const bucket = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(String(error)));
  return bucket;
}

async function triggerLevelUp(page: Page): Promise<void> {
  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(120);
    const state = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState);
    if (state === 'levelup') break;
  }
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
}

test('offered upgrade cards resolve their icon files; file-less families stay clean', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&seed=s27-icons');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const seen: Array<{ family: string; hasIcon: boolean; loads: boolean }> = [];
  for (let round = 0; round < 3; round += 1) {
    await triggerLevelUp(page);
    // lazy icon loaders resolve async after render; give them a settled beat and
    // then assert-what-you-sampled in ONE evaluate (s23 atomicity law)
    await page.waitForTimeout(500);
    const cards = await page.evaluate(async () => {
      const out: Array<{ family: string; hasIcon: boolean; loads: boolean; fileExists: boolean }> = [];
      for (const card of Array.from(document.querySelectorAll('[data-testid="upgrade-overlay"] button'))) {
        const el = card as HTMLButtonElement;
        const family = (el.dataset.slot ?? '').replace('ui.upgrade.icon.', '');
        const iconSpan = el.querySelector('.upgrade-card__icon') as HTMLSpanElement | null;
        let loads = false;
        if (iconSpan) {
          const url = (iconSpan.style.backgroundImage.match(/url\("(.+)"\)/) ?? [])[1] ?? '';
          if (url) {
            loads = await new Promise<boolean>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img.naturalWidth > 0);
              img.onerror = () => resolve(false);
              img.src = url;
            });
          }
        }
        // vite dev SPA-fallbacks unknown paths to index.html with 200 -- require an
        // image content-type, not just response.ok
        const fileExists = await fetch(`/assets/processed/icon-${family}.png`, { method: 'HEAD' })
          .then((response) => response.ok && (response.headers.get('content-type') ?? '').includes('image'))
          .catch(() => false);
        out.push({ family, hasIcon: !!iconSpan, loads, fileExists });
      }
      return out;
    });
    for (const card of cards) {
      if (card.fileExists) {
        expect(card, `family "${card.family}" has an icon file but no rendered icon`).toMatchObject({ hasIcon: true, loads: true });
      } else {
        expect(card.hasIcon, `family "${card.family}" has no icon file but rendered one`).toBe(false);
      }
      seen.push({ family: card.family, hasIcon: card.hasIcon, loads: card.loads });
    }
    await page.keyboard.press('Digit1');
    await page.waitForTimeout(250);
  }

  // the gate must actually exercise the icon path: at least one icon-backed family
  // must have appeared across the offers (fixed seed makes this deterministic)
  expect(seen.some((card) => card.hasIcon && card.loads)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
