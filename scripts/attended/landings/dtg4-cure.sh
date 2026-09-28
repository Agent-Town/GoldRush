#!/bin/bash
# dtg4 cure (in the chain after the merge): the gate comment inside validTapeAction names the client-judged set (F-DTG4-1).
G=$1
node - <<'NODE' >> "$G" 2>&1
const fs=require('fs');const p='functions/api/standings.ts';let t=fs.readFileSync(p,'utf8');
const re=/(\n[ \t]*\/\/ F-DTG2-2 \(door-tape-grammar-3\): at the door )(a place_build, pick_upgrade or set_agent_ability)( must also be)/;
const m=t.match(re);
if(!m){console.log('F-DTG4-1: gate comment anchor not found (comment may already read the set); nothing changed');process.exit(0)}
t=t.replace(re, (all,a,b,c)=>a+'an action in CLIENT_JUDGED_ACTIONS (place_build, pick_upgrade, set_agent_ability, research_pick, context_action; F-DTG4-1)'+c);
fs.writeFileSync(p,t);console.log('F-DTG4-1: gate comment names the client-judged set');
NODE
if ! git diff --quiet -- functions/api/standings.ts; then npx tsc --noEmit > /dev/null 2>&1 && git add -- functions/api/standings.ts && git commit -q -m "drain: the gate comment inside validTapeAction names the whole client-judged set (F-DTG4-1; comment only)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure dtg4: comment committed $(git rev-parse --short HEAD)" >> "$G" || { echo "cure dtg4: tsc red after the comment edit — needs hands" >> "$G"; exit 1; }; fi
