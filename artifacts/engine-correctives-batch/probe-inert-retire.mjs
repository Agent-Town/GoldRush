/**
 * probe-inert-retire.mjs — F-E10S4-2's measurement, kept as evidence.
 *
 * Run with the Ember Shore's `tileParams.engineDependencies` row DELETED to answer E10S-4 scope 6's
 * question: with `twist.emberShore` dropped from `DECLARED_INERT_PATHS`, does the bundle validator
 * accept the retirement? Prints the board size (an empty corpus is false good news), the loaded
 * contract's dependency field, and the descriptor verdict with every refusal reason.
 */
import { createServer } from 'vite';

const root = process.cwd();
const location = new URL('http://probe.test/?debug&contract=e10-ember-shore');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const m = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  console.log('board contracts:', m.listBoardContracts().length);
  const c = m.loadContract('e10-ember-shore');
  console.log('loadContract ok, engineDependencies =', JSON.stringify(c.tileParams.engineDependencies));
  const parsed = m.parseContractDescriptor(m.contractDescriptorJson(c), c);
  console.log('parseContractDescriptor ok =', parsed.ok, JSON.stringify(parsed.reasons ?? null));
} catch (error) {
  console.log('THREW:', error.message);
} finally {
  await vite.close();
}
