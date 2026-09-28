import { test } from '@playwright/test';
import { nativeProof } from './driver';
import { proofHooks } from '../../artifacts/sol/play-proofs/run-15/proof-hooks';
test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off', screenshot: 'off' });
proofHooks('e6-glow-mesa', 'epoch-6-atomic');
nativeProof('e6-glow-mesa', 15);
