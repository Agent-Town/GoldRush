import { test } from '@playwright/test';
import { nativeProof } from './driver';
test.skip(!process.env.GR_NATIVE_PROOF, 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off' });
nativeProof('e8-far-side', 4);
