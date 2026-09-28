import { test } from '@playwright/test';
import { nativeProof } from './driver';
import { proofHooks } from '../../artifacts/sol/play-proofs/run-12/proof-hooks';
test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off', screenshot: 'off' });
proofHooks('e5-stillwater', 'epoch-5-deepwater');
nativeProof('e5-stillwater', 12);
