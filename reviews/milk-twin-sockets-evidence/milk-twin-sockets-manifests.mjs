// Manifest sweep (milk/twin-sockets): the new vocabulary must appear on exactly the contracts
// whose consumers the browser enables — and NOWHERE else. The er01-e2/e3 specs pin their rule
// lists exactly, so a leak into another epoch is a red, not a nicety.
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const location = new URL('http://gr-sim.local/?debug&contract=the-claim');
globalThis.location = location;
globalThis.window = { location };
const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let out = '';
try {
  const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  const { listEpochs, loadEpoch } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const NEW = ['deepwater_', 'wrangle_', 'decay_field_windows', 'night_vein_ring'];
  for (const meta of listEpochs()) {
    for (const contract of loadEpoch(meta.id).contracts) {
      const ids = deriveMechanicsManifest(contract.id).rules.map(({ id }) => id);
      const added = ids.filter((id) => NEW.some((prefix) => id.startsWith(prefix)));
      if (added.length > 0) out += `${meta.id.padEnd(20)} ${contract.id.padEnd(24)} +${added.join(' +')}\n`;
      else out += `${meta.id.padEnd(20)} ${contract.id.padEnd(24)} (unchanged: ${ids.join(',') || 'none'})\n`;
    }
  }
} finally {
  await vite.close();
  Object.assign(console, originalConsole);
}
process.stdout.write(out);
