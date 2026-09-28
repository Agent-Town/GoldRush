import { test } from '@playwright/test';
import { nativeProof } from './driver';
import { proofHooks } from '../../artifacts/sol/play-proofs/run-16/proof-hooks';
test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off', screenshot: 'off' });
proofHooks('e7-relay-rush', 'epoch-7-signal');
nativeProof('e7-relay-rush', 16);
