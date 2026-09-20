// GET-only county board reader for the drain review. Never POSTs.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const ROOT = process.cwd();
const ENDPOINT = 'https://agenttown.app/api/standings';
const skill = await readFile(resolve(ROOT, 'public/skill.md'), 'utf8');
const m = skill.match(/<!-- skillmd-guard:door-contracts:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- skillmd-guard:door-contracts:end -->/);
const ids = JSON.parse(m[1]);
const epochByContract = new Map();
for (const e of await readdir(resolve(ROOT,'assets/contracts'), {withFileTypes:true})) {
  if (!e.isDirectory() || !e.name.startsWith('epoch-')) continue;
  const b = JSON.parse(await readFile(resolve(ROOT,'assets/contracts',e.name,'contracts.json'),'utf8'));
  for (const c of b.contracts ?? []) epochByContract.set(c.id, {epochId: e.name, standings: c.practice?.standings});
}
async function get(params){ const u=new URL(ENDPOINT); for(const [k,v] of Object.entries(params)) u.searchParams.set(k,v);
  const r=await fetch(u); if(!r.ok) return {__httpError:r.status, url:u.toString()}; return await r.json(); }
const out=[];
for (const id of [...ids].sort()) {
  const man = epochByContract.get(id);
  if (!man) { out.push({contract:id, error:'no manifest'}); continue; }
  if (man.standings === false) { out.push({contract:id, epochId:man.epochId, trainingGround:true}); continue; }
  const board = await get({epoch: man.epochId, contract: id});
  if (board.__httpError || board.ok !== true) { out.push({contract:id, epochId:man.epochId, error: JSON.stringify(board).slice(0,200)}); continue; }
  const rows = (board.board ?? []).map(r => ({
    secured: r.secured, assay: r.assay, reelId: r.reel?.id ?? null, assayHash: r.assayHash ?? r.reel?.assayHash ?? null,
    eventLogHash: r.eventLogHash ?? r.reel?.eventLogHash ?? null,
    waves: r.waves, gold: r.gold, model: r.model, profileName: r.profileName,
    submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : null, ranked: r.ranked, retired: r.retired,
  }));
  out.push({contract:id, epochId: man.epochId, rowCount: rows.length, rows});
}
await writeFile(resolve(ROOT,'artifacts/drain-review-boss-fidelity/county/board-raw.json'), JSON.stringify(out,null,2));
const verified = [];
for (const c of out) for (const r of c.rows ?? []) if (r.secured === true && r.assay === 'verified') verified.push({contract:c.contract, epochId:c.epochId, ...r});
console.log('contracts queried:', out.length);
console.log('VERIFIED+SECURED rows:', verified.length);
for (const v of verified) console.log([v.epochId, v.contract, v.reelId, v.assayHash, v.eventLogHash, 'w'+v.waves, v.gold+'g', v.model, v.submittedAt, 'ranked='+v.ranked, 'retired='+v.retired].join(' | '));
console.log('--- errors ---');
for (const c of out) if (c.error) console.log(c.contract, c.error);
for (const c of out) if (c.trainingGround) console.log(c.contract, 'TRAINING GROUND (standings disabled)');
