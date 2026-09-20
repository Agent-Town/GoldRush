import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const ROOT = process.cwd();
const E='https://agenttown.app/api/standings';
const board = JSON.parse(await readFile(resolve(ROOT,'artifacts/drain-review-boss-fidelity/county/board-raw.json'),'utf8'));
const verified=[]; for (const c of board) for (const r of c.rows??[]) if (r.secured===true && r.assay==='verified') verified.push({contract:c.contract, epochId:c.epochId, reelId:r.reelId, submittedAt:r.submittedAt, waves:r.waves, gold:r.gold});
const detail=[];
for (const v of verified) {
  const u=new URL(E); u.searchParams.set('epoch',v.epochId); u.searchParams.set('contract',v.contract); u.searchParams.set('reel',v.reelId);
  const r=await fetch(u); const j=r.ok? await r.json() : {httpError:r.status};
  detail.push({...v, reel:j.reel ?? null, raw: j.reel? undefined : j});
}
await writeFile(resolve(ROOT,'artifacts/drain-review-boss-fidelity/county/reels-raw.json'), JSON.stringify(detail,null,2));
for (const d of detail) {
  const re=d.reel??{};
  console.log([d.epochId, d.contract, d.reelId].join(' | '));
  console.log('   assayHash=', re.assayHash ?? re.meta?.assayHash ?? '(none)', ' eventLogHash=', re.eventLogHash ?? re.meta?.eventLogHash ?? '(none)', ' engineHash=', (re.meta?.engineHash??'').slice(0,16), ' seed=', re.seed ?? re.meta?.seed ?? '?', ' orders=', Array.isArray(re.orders)? re.orders.length : (re.orders? 'obj':'?'), ' keys=', Object.keys(re).join(','));
}
