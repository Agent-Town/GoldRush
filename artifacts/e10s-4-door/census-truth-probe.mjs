/**
 * E10S-4 census truth probe — what `e2e/er01-e10-census.spec.ts` SHOULD assert, per Deep Sky id,
 * measured rather than guessed.
 *
 *   node artifacts/e10s-4-door/census-truth-probe.mjs
 *
 * F-E10S3-7 recorded that the census's `mechanics.buildables` clause is stale on a pristine tree;
 * this prints the derived truth for all four ids so the re-point cites a measurement. It also
 * prints whether each id's `HeadlessContractSim` constructor refuses, because admission flips that
 * for exactly one map and the census must say so per id rather than for the epoch.
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import benchSeeds from '../../assets/contracts/bench-seeds.json' with { type: 'json' };
import deepSky from '../../assets/contracts/epoch-10-deepsky/contracts.json' with { type: 'json' };

const root = fileURLToPath(new URL('../..', import.meta.url));
const rows = [];
const say = console.log;

for (const contract of deepSky.contracts) {
  const location = new URL(`http://gr-sim.local/?debug&contract=${contract.id}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  console.log = console.info = console.debug = () => undefined;
  try {
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const mechanics = deriveMechanicsManifest(contract);
    const construct = (seed) => {
      try {
        new HeadlessContractSim({ contractId: contract.id, seed });
        return 'constructs';
      } catch (error) {
        return `throws: ${error instanceof Error ? error.message : String(error)}`;
      }
    };
    rows.push({
      id: contract.id,
      benchSeeds: benchSeeds[contract.id] ?? null,
      harvestAnchors: contract.tileParams.harvestAnchors?.length ?? null,
      engineDependencies: contract.tileParams.engineDependencies?.map(({ dep, status, landedBy }) => ({ dep, status, landedBy })) ?? null,
      buildables: mechanics.buildables?.map(({ id }) => id) ?? null,
      interactables: mechanics.interactables?.map(({ id }) => id) ?? null,
      rules: mechanics.rules.map(({ id }) => id),
      lossStakes: mechanics.posting.lossStakes.length,
      sim: [`${contract.id}-01`, `${contract.id}-02`].map(construct),
    });
  } finally {
    await vite.close();
    console.log = say;
  }
}
say(JSON.stringify(rows, null, 2));
