import { test } from '@playwright/test';
import { nativeProof } from './driver';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
test.skip(!process.env.GR_NATIVE_PROOF, 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off' });
nativeProof('e2-incline');

if (process.env.GR_NATIVE_RUN === '9' && process.env.GR_NATIVE_PROOF) {
  test.afterEach(async ({ page }, info) => {
    if (info.status !== 'passed') return;
    const root = path.resolve('artifacts/sol/play-proofs/run-9/e2-incline');
    await mkdir(root, { recursive: true });
    const tab = page.locator('[data-testid^="contract-chapter-tab-epoch-2-"]');
    await tab.click();
    const cell = page.getByTestId('contract-best-e2-incline');
    await cell.scrollIntoViewIfNeeded();
    await cell.screenshot({ path: path.join(root, `bank-cell-${info.project.name}.png`) });
    await page.screenshot({ path: path.join(root, `bank-book-${info.project.name}.png`) });
    await writeFile(path.join(root, `bank-cell-${info.project.name}.json`), JSON.stringify({ text: await cell.innerText(), url: page.url(), originalContext: true }, null, 2) + '\n');
  });
}
