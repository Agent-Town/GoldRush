/**
 * E10S-4 door probe — does the BROWSER launch door refuse an ANCHORED map that also declares
 * `twist.harvestFreeObjective`? The master's stop clause turns on that exact question, so it is
 * MEASURED here rather than read off `src/meta/ContractFamilies.ts:1352`.
 *
 *   node artifacts/e10s-4-door/door-refusal-probe.mjs
 *
 * Run it on whatever tree you have: it reports the contract's own two declarations beside the
 * door's verdict, so the answer is attributable to the data in front of it.
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e10-ember-shore';

const location = new URL(`http://e10s4.probe/?debug&contract=${CONTRACT}`);
globalThis.location = location;
globalThis.window = { location };
globalThis.sessionStorage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
globalThis.localStorage = globalThis.sessionStorage;

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const say = console.log;
console.log = console.info = console.debug = () => undefined;
let report;
try {
  const families = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const { supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const authored = families.listBoardContracts().find((entry) => entry.id === CONTRACT);
  const diagnostics = families.activeContractDiagnostics();
  report = {
    contract: CONTRACT,
    authored: {
      harvestAnchors: authored?.tileParams.harvestAnchors ?? null,
      declaresHarvestFreeObjective: authored?.twist.harvestFreeObjective !== undefined,
    },
    browserDoor: {
      activeId: diagnostics.activeId,
      fallbackReason: diagnostics.fallbackReason,
      opensAsItself: diagnostics.activeId === CONTRACT && diagnostics.fallbackReason === null,
    },
    agentDoor: {
      admitted: supportedContractIds().includes(CONTRACT),
      size: supportedContractIds().length,
    },
  };
} finally {
  await vite.close();
}
say(JSON.stringify(report, null, 2));
