import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { nativeProof } from './driver';
import { proofHooks } from '../../artifacts/sol/play-proofs/run-12/proof-hooks';
test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off', screenshot: 'off' });
proofHooks('e5-regatta', 'epoch-5-deepwater');
nativeProof('e5-regatta', 12);

test.afterEach(async ({}, info) => {
  if (info.status !== 'passed') return;
  const root = `artifacts/sol/play-proofs/run-${process.env.GR_NATIVE_RUN ?? 12}/e5-regatta`;
  const objective = JSON.parse(await readFile(`${root}/objective-${info.project.name}.json`, 'utf8'));
  expect(objective.regatta.race.finished, 'the boat finished the authored course').toBe(true);
  expect(objective.regatta.race.forfeited).toBe(false);
});
