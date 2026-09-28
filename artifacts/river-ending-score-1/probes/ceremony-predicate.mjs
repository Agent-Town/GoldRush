// Node check of the River ceremony predicate's premise: the page the lever stages, parsed onto the Claim the way
// activeContractSelection does (ContractFamilies.ts:1381), serialises back to exactly the stamped document.
import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
const req = createRequire('/Users/robin/Claude/Projects/wt-rvs1/package.json');
const { createServer } = await import(pathToFileURL(req.resolve('vite')).href);
const root = '/Users/robin/Claude/Projects/wt-rvs1';
const location = new URL('http://gr-sim.local/'); globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { stampCharter } = await vite.ssrLoadModule('/src/charter/CharterStamp.ts');
  const { getPostCreditsCharter } = await vite.ssrLoadModule('/src/charter/TheRiver.ts');
  const { parseContractDescriptor, contractDescriptorJson, listBoardContracts, loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const river = getPostCreditsCharter();
  const stamped = stampCharter(river);
  const claim = listBoardContracts().find((c) => c.id === 'the-claim');
  const pressed = parseContractDescriptor(stamped.document, claim);
  const predicate = (contract) => contract.name === river.contract.name && stamped.ok && contractDescriptorJson(contract) === stamped.document;
  const raw = loadContract('e10-river', 'epoch-10-deepsky');
  console.log(JSON.stringify({
    pressedOk: pressed.ok,
    pressedRoundTrips: pressed.ok && contractDescriptorJson(pressed.contract) === stamped.document,
    predicate: { pressedRiver: pressed.ok && predicate(pressed.contract), plainClaim: predicate(claim), rawRiver: predicate(raw) },
    rawRiverName: raw.name,
  }));
} finally { await vite.close(); }
