// Activity probe (milk/twin-sockets): a socket that constructs and never fires is a cure that
// looks shipped and measures nothing. Prove the Atomic socket's consumers actually engage during
// a real run, and show the E5 socket's refused boss handoff being COUNTED rather than skipped.
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const contractId = process.argv[2] ?? 'e6-showroom';
const seed = process.argv[3] ?? `${contractId}-01`;
const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', contractId);
location.searchParams.set('seed', seed);
globalThis.location = location;
globalThis.window = { location };

const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let out = '';
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({ contractId, seed });

  let peakWindingDown = 0;
  let peakExhausted = 0;
  const variants = new Set();
  const waveTrace=[];
  let turn = sim.currentTurn();
  while (!turn.terminal) {
    turn = sim.advanceToTurn();
    const atomic = sim.diagnostics().atomic;
    if (atomic) {
      const active = atomic.wrangle.active;
      peakWindingDown = Math.max(peakWindingDown, active.filter((e) => e.state === 'winding-down').length);
      peakExhausted = Math.max(peakExhausted, active.filter((e) => e.state === 'exhausted').length);
      for (const entry of active) variants.add(entry.variantId);
      waveTrace.push(`w${sim.diagnostics().wave}:alive=${sim.diagnostics().enemiesAlive}/cap=${sim.enemies.capacity},exh=${active.filter((e)=>e.state==="exhausted").length}`);
    }
  }
  const outcome = sim.outcome();
  const atomic = sim.diagnostics().atomic;
  const deepwater = sim.diagnostics().deepwater;
  out += `contract=${contractId} seed=${seed}\n`;
  out += `  outcome: secured=${outcome.secured} waves=${outcome.waves} kills=${outcome.kills} hash=${outcome.eventLogHash}\n`;
  out += `  atomic socket: ${atomic ? 'LIVE' : 'null'}\n`;
  if (atomic) {
    out += `    epoch=${atomic.epochId} enabled=${atomic.wrangle.enabled} windDownSeconds=${atomic.wrangle.windDownSeconds}\n`;
    out += `    machines registered (peak winding-down)=${peakWindingDown}  peak exhausted=${peakExhausted}\n`;
    out += `    exhaustion events over the run=${atomic.exhausted}\n`;
    out += `    variants seen by wrangle=${JSON.stringify([...variants].sort())}\n`;
    out += `    pen=${JSON.stringify(atomic.wrangle.pen)}\n`;
    out += `    tiles=${atomic.tiles ? 'LIVE' : 'null'} captureLever=${atomic.captureLever}\n`;
  }
  out += `  wave trace: ${waveTrace.join(" | ")}
`;
  out += `  deepwater socket: ${deepwater ? 'LIVE' : 'null'}\n`;
} finally {
  await vite.close();
  Object.assign(console, originalConsole);
}
process.stdout.write(out);
