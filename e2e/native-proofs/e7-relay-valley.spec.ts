import { test } from '@playwright/test';
import { nativeProof } from './driver';
import { proofHooks } from '../../artifacts/sol/play-proofs/run-17/proof-hooks';
test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off', screenshot: 'off' });
proofHooks('e7-relay-valley', 'epoch-7-signal');
nativeProof('e7-relay-valley', 17);
