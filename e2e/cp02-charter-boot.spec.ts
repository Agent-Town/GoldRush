import { expect, test, type Page } from '@playwright/test';
import { listContracts } from '../src/meta/ContractFamilies';
import { stampCharter } from '../src/charter/CharterStamp';
import { charterMutants } from './charter-press.rig';

// CP-02 boot half of the property law: everything that stamps must boot
// without console or page errors. The stamped mutants come from the same
// seeded stream as the stamp spec; the boot count is capped and the cap is
// stated in a test name so nothing is dropped silently.
const E1 = listContracts('epoch-1-frontier');
const FUZZ_COUNT = 200;
const BOOT_CAP = 8;

const stamped: Array<{ index: number; templateId: string; labels: string[]; document: string }> = [];
for (const mutant of charterMutants(E1, FUZZ_COUNT)) {
  const result = stampCharter(mutant.charter);
  if (result.ok) stamped.push({ index: mutant.index, templateId: mutant.templateId, labels: mutant.labels, document: result.document });
}
const booted = stamped.slice(0, BOOT_CAP);

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test(`the seeded stream stamped ${stamped.length} of ${FUZZ_COUNT} mutants; booting the first ${booted.length}`, () => {
  expect(stamped.length).toBeGreaterThan(0);
  expect(booted.length).toBe(Math.min(BOOT_CAP, stamped.length));
});

for (const mutant of booted) {
  test(`stamped mutant ${mutant.index} [${mutant.templateId}] boots with zero errors (${mutant.labels.join(' + ')})`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(
      ([key, document]) => sessionStorage.setItem(key!, document!),
      [`gr.editor.contract.v1:${mutant.templateId}`, mutant.document],
    );
    await page.goto(
      `/?editor&debug&contract=${mutant.templateId}&editorDescriptor=session&nowaves&nolevel&nokill&nopause&seed=cp02-${mutant.index}`,
    );
    await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
    // No Begin click: the ?editor inspector overlays it, and frame > 10 already
    // proves the booted loop is live for this probe.
    const active = await page.evaluate(() => ({
      id: window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId,
      tileParams: window.__THREE_GAME_DIAGNOSTICS__!.contract.tileParams,
    }));
    expect(active.id).toBe(mutant.templateId);
    expect(active.tileParams).toEqual(JSON.parse(mutant.document).tileParams);
    expect(errors).toEqual({ console: [], page: [] });
  });
}
