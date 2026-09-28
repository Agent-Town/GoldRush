import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url'; import { writeFileSync } from 'node:fs';
const req = createRequire('/Users/robin/Claude/Projects/wt-rvs1/package.json'); const { createServer } = await import(pathToFileURL(req.resolve('vite')).href);
const root = '/Users/robin/Claude/Projects/wt-rvs1';
const location = new URL('http://gr-sim.local/'); globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { stampCharter } = await vite.ssrLoadModule('/src/charter/CharterStamp.ts');
  const { getPostCreditsCharter } = await vite.ssrLoadModule('/src/charter/TheRiver.ts');
  const { charterLineageRootId } = await vite.ssrLoadModule('/src/charter/CharterSchema.ts');
  const PS = await vite.ssrLoadModule('/src/game/ProfileStorage.ts');
  const charter = getPostCreditsCharter();
  const stamped = stampCharter(charter);
  writeFileSync(process.argv[2], JSON.stringify({ templateId: charterLineageRootId(charter), document: stamped.document, keys: { PROFILE_KEY: PS.PROFILE_KEY, SCOREBOARD_KEY: PS.SCOREBOARD_KEY, FIRST_CLAIM_DONE_KEY: PS.FIRST_CLAIM_DONE_KEY, TOWN_NAME_KEY: PS.TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY: PS.TOWN_WELCOME_SEEN_KEY } }, null, 1));
  console.log('ok', stamped.ok, charterLineageRootId(charter));
} finally { await vite.close(); }
