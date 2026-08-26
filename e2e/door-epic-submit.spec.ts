import { expect, test, type Page } from '@playwright/test';

type StandingFetch = {
  url: string;
  keepalive?: boolean;
  bodyBytes: number;
  ok?: boolean;
  error?: string;
};

type DoorTestWindow = Window & {
  __DOOR_STANDING_FETCHES__?: StandingFetch[];
  __GR_TEST__?: Window['__GR_TEST__'] & {
    submitCountyStandingForTest: (tapeBytes: number) => Promise<boolean>;
  };
};

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

test('small and Baron-sized standings bodies both reach the county door', async ({ page }) => {
  const errors = collectErrors(page);
  const observedBodyBytes: number[] = [];

  await page.addInitScript(() => {
    const trackedWindow = window as DoorTestWindow;
    const originalFetch = window.fetch.bind(window);
    trackedWindow.__DOOR_STANDING_FETCHES__ = [];
    window.fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (!url.includes('/api/standings') || init?.method !== 'POST') return originalFetch(input, init);
      const bodyBytes = typeof init.body === 'string' ? new TextEncoder().encode(init.body).length : -1;
      const record: StandingFetch = { url, keepalive: init.keepalive, bodyBytes };
      trackedWindow.__DOOR_STANDING_FETCHES__!.push(record);
      try {
        const response = await originalFetch(input, init);
        record.ok = response.ok;
        return response;
      } catch (error) {
        record.error = String(error);
        throw error;
      }
    };
  });
  await page.route('**/api/standings', async (route) => {
    observedBodyBytes.push(route.request().postDataBuffer()?.byteLength ?? 0);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.goto('/?debug&nowaves&seed=door-epic-submit');
  await page.waitForFunction(() => typeof (window as DoorTestWindow).__GR_TEST__?.submitCountyStandingForTest === 'function');
  const responses = await page.evaluate(async () => {
    const submit = (window as DoorTestWindow).__GR_TEST__!.submitCountyStandingForTest;
    return [await submit(128), await submit(463_569)];
  });
  const fetches = await page.evaluate(() => (window as DoorTestWindow).__DOOR_STANDING_FETCHES__!);

  expect(responses).toEqual([true, true]);
  expect(fetches).toHaveLength(2);
  expect(fetches[0]).toMatchObject({ keepalive: true, ok: true });
  expect(fetches[0].bodyBytes).toBeLessThan(60_000);
  expect(fetches[1]).toMatchObject({ ok: true });
  expect(fetches[1].keepalive).toBeFalsy();
  expect(fetches[1].bodyBytes).toBeGreaterThanOrEqual(463_569);
  expect(observedBodyBytes).toEqual(fetches.map(({ bodyBytes }) => bodyBytes));
  expect(fetches.every(({ error }) => error === undefined)).toBe(true);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });

  console.log('door-submit fetch options', fetches.map(({ keepalive, bodyBytes }) => ({ keepalive, bodyBytes })));
});
