/** Evidence-only adapter. Gameplay remains in the shared native driver. */
import { expect, test } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { boardEntry } from '../run-11/board-entry';

export function proofHooks(id: string, epoch: string) {
  const root = path.resolve(`artifacts/sol/play-proofs/run-${process.env.GR_NATIVE_RUN ?? 18}/${id}`);
  const external = path.join(os.homedir(), '.goldrush/play-proofs/run-18', process.env.GR_NATIVE_STRATEGY ?? 'default', id);
  test.beforeEach(async ({ page }, info) => {
    await mkdir(root, { recursive: true });
    await mkdir(external, { recursive: true });
    await boardEntry(page, id, epoch);
    let capturedTerminal = false;
    const screenshot = page.screenshot.bind(page);
    page.screenshot = async options => {
      const file = String(options?.path ?? '');
      if (file.includes('terminal-') || (file.includes('last-') && !capturedTerminal)) {
        if (file.includes('terminal-')) capturedTerminal = true;
        const state = await page.evaluate(() => {
          const d = window.__THREE_GAME_DIAGNOSTICS__;
          return d ? { url: location.href, sim: d.timeAlive, wave: d.wave, hp: d.hp,
            gold: d.economy?.gold, run: d.run, hero: d.heroPos, defences: d.build?.hp,
            e7Signal: d.e7Signal, playbookUse: d.playbookUse,
            air: d.e8SuitAir, physics: d.e8Physics, atmosphere: d.e8Atmosphere,
            squall: d.squall, preserveVent: d.preserveVent, archive: (d as ThreeGameDiagnostics & { archive?: unknown }).archive,
            repairs: d.wreck?.repairs } : null;
        });
        if (state) await writeFile(path.join(root, `objective-${info.project.name}.json`), JSON.stringify(state, null, 2) + '\n');
      }
      return screenshot({ ...options, type: 'jpeg', quality: 80,
        path: file.includes('last-') ? path.join(external, `last-${info.project.name}.jpg`) : file.replace(/\.png$/, '.jpg') });
    };
  });
  test.afterEach(async ({ page }, info) => {
    if (info.status === 'skipped') return;
    const file = path.join(root, `row-${info.project.name}.json`);
    const raw = await readFile(file, 'utf8').catch(() => null);
    if (!raw) return;
    await writeFile(path.join(external, `row-${info.project.name}.json`), raw);
    const row = JSON.parse(raw);
    row.rawEvidence = path.join(external, `row-${info.project.name}.json`);
    row.sampleCount = row.samples.length;
    row.samples = [row.samples[0], row.samples.at(-1)].filter(Boolean);
    await writeFile(file, JSON.stringify(row, null, 2) + '\n');
    if (info.status !== 'passed') return;
    await page.getByTestId(`contract-chapter-tab-${epoch}`).click();
    const cell = page.getByTestId(`contract-best-${id}`);
    await cell.scrollIntoViewIfNeeded();
    await expect(cell).toContainText('Secured');
    await cell.screenshot({ path: path.join(root, `bank-cell-${info.project.name}.jpg`), type: 'jpeg', quality: 80 });
    await writeFile(path.join(root, `bank-cell-${info.project.name}.json`), JSON.stringify({ text: await cell.innerText(), url: page.url(), originalContext: true }, null, 2) + '\n');
  });
}
