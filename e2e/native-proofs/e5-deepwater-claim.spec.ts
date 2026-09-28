import { test } from '@playwright/test';
import { nativeProof } from './driver';
import { proofHooks } from '../../artifacts/sol/play-proofs/run-18/proof-hooks';
test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off', screenshot: 'off' });
proofHooks('e5-deepwater-claim', 'epoch-5-deepwater');
nativeProof('e5-deepwater-claim', 18);
