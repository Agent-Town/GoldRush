// s1479 probe (retained per RETENTION LAW) — proves the two mechanics the F-1400-4 cure relies on.
//
// Run: node --test --test-timeout=1000 logs/session-scratch/s1479-test-timeout-semantics.probe.mjs
//
// EXPECTED: "unbounded" FAILS (the CLI default bounds it) and "explicitly bounded" PASSES
// (a per-test timeout overrides the CLI default). That is exactly the pair the cure needs:
// 265 unbounded tests become bounded, while the 3 declared budgets — including the escort
// test's 120s, which F-1410-2 forbids raising — are left untouched.
import test from 'node:test';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('unbounded test: inherits the CLI --test-timeout default', async () => {
  await sleep(3000);
});

test('explicitly bounded test: its own timeout wins over the CLI default', { timeout: 10_000 }, async () => {
  await sleep(3000);
});
