#!/bin/bash
# dtg2 cure (in the chain after the merge): re-pin the same-game audit's summary, which counts the door's verbs the agent harness lacks (F-DTG2-1).
G=$1
node - <<'NODE' >> "$G" 2>&1
const fs=require('fs');const p='scripts/same-game-audit.test.mjs';let t=fs.readFileSync(p,'utf8');
const old="  assert.deepEqual(audit.summary, { 'agent-exceeds': 0, 'agent-lacks': 511, equal: 1252, 'not-offered': 0 });";
if(t.split(old).length!==2){console.log('audit pin anchor count '+(t.split(old).length-1)+' — needs hands');process.exit(1)}
const neu="  // door-tape-grammar-2 (2026-09-25, F-DTG2-1): the door learned two more client verbs, prospector_dispatch and agent_orders,\n  // so 42 + 42 rows moved into agent-lacks (511 -> 595) and none moved out (equal stays 1252 over 1847 rows). The audit reads\n  // the door's verb set from standings.ts; teaching it that agent_orders is the rider's own channel is a slice for its owner.\n  assert.deepEqual(audit.summary, { 'agent-exceeds': 0, 'agent-lacks': 595, equal: 1252, 'not-offered': 0 });";
fs.writeFileSync(p,t.replace(old,neu));console.log('same-game audit re-pinned 511 -> 595');
NODE
git add -- scripts/same-game-audit.test.mjs && git commit -q -m "drain: same-game audit re-pinned 511 to 595 agent-lacks (F-DTG2-1: the door learned prospector_dispatch and agent_orders; none removed; equal 1252 over 1847 rows)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure dtg2: audit re-pinned $(git rev-parse --short HEAD)" >> "$G"
