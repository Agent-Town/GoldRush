import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url'; const req = createRequire('/Users/robin/Claude/Projects/wt-rvs1/package.json'); const { createServer } = await import(pathToFileURL(req.resolve('vite')).href);
const root = '/Users/robin/Claude/Projects/wt-rvs1';
const location = new URL('http://gr-sim.local/');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { stampCharter } = await vite.ssrLoadModule('/src/charter/CharterStamp.ts');
  const { getPostCreditsCharter } = await vite.ssrLoadModule('/src/charter/TheRiver.ts');
  const { charterLineageRootId } = await vite.ssrLoadModule('/src/charter/CharterSchema.ts');
  const { loadContract, contractDescriptorJson, listBoardContracts } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const charter = getPostCreditsCharter();
  const stamped = stampCharter(charter);
  if (!stamped.ok) throw new Error(JSON.stringify(stamped.reasons));
  const river = stamped.contract;
  const claim = loadContract('the-claim', 'epoch-1-frontier');
  const keys = new Set([...Object.keys(river), ...Object.keys(claim)]);
  const out = {};
  const diff = (a, b, path) => {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], `${path}.${k}`);
      return;
    }
    out[path] = { claim: b, river: a };
  };
  for (const k of keys) diff(river[k], claim[k], k);
  console.log('lineageRoot', charterLineageRootId(charter));
  console.log('river id', river.id, 'name', river.name);
  console.log(JSON.stringify(out, null, 1));
  console.log('claim harvestAnchors', JSON.stringify(claim.tileParams.harvestAnchors));
  console.log('doc length', stamped.document.length, 'equals descriptorJson(river)', stamped.document === contractDescriptorJson(river));
  const board = listBoardContracts().map(c => c.id);
  console.log('board has e10-river', board.includes('e10-river'), 'board count', board.length);
} finally { await vite.close(); }
