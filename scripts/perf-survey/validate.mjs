import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {read,write,root,stats,summarize} from './browser.mjs';
// jsonschema is already installed on the measurement host; no project dependency added.
execFileSync('python3',['-c','import json, jsonschema; jsonschema.Draft202012Validator(json.load(open("scripts/perf-survey/census.schema.json"))).validate(json.load(open("artifacts/perf-survey/census.json")))'],{cwd:root,stdio:'inherit',timeout:30000});
assert.deepEqual(stats([3,1,5,2,4]),{n:5,min:1,p50:3,p95:4,p99:4,max:5});
const census=await read('census.json');assert.equal(new Set(census.rows.map(r=>r.key)).size,census.rows.length);
for(const row of census.rows.filter(r=>r.status==='measured')){
 const raw=await read(row.rawSamples);assert(raw.elapsedMs>=10000);assert.deepEqual(summarize(raw).frameMs,row.metrics.frameMs);assert.deepEqual(summarize(raw).calls,row.metrics.calls);
 const scene=await read(row.scenePath);assert(scene.canvas.width>0&&scene.canvas.height>0);assert.equal(scene.canvas.dpr,1);
 if(row.state==='wave1')assert.equal(scene.diagnostics.wave,1,row.key);
 if(row.map!=='town')assert.equal(scene.diagnostics.contract.activeId,row.map);
 assert.equal(scene.diagnostics.performance?.tier??row.tier,row.tier);
}
const firewall=execFileSync('git',['diff','--name-only'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert(firewall.every(p=>p==='tasks/BACKLOG.md'||p==='docs/reviews/2026-09-05-perf-survey.md'||p.startsWith('scripts/perf-survey/')||p.startsWith('artifacts/perf-survey/')),firewall.join('\n'));
await write('validation.json',{at:new Date().toISOString(),schema:'scripts/perf-survey/census.schema.json',rows:census.rows.length,measured:census.rows.filter(r=>r.status==='measured').length,rawQuantilesRecomputed:true,waveAndContractIdentityChecked:true,trackedFirewall:firewall});console.log(`PASS ${census.rows.length} rows: schema, raw quantiles, wave/contract/tier identity and tracked firewall`);
