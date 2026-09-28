import fs from 'node:fs';
import cp from 'node:child_process';

const dir = 'artifacts/s2742';
const read = p => fs.readFileSync(p, 'utf8');
const stamp = cp.execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], {encoding:'utf8'}).trim();
const predecessor = read(`${dir}/predecessor.txt`).trimEnd();
const desk = predecessor.slice(predecessor.indexOf('🔺 **OWNER\'S DESK'));
if (!desk.startsWith('🔺 **OWNER\'S DESK')) throw Error('Missing predecessor desk');
fs.writeFileSync(`${dir}/desk-tail.txt`, desk);
let status = read('STATUS.md');
if (!status.startsWith('ACTIVE ') || !status.split('\n')[0].includes('(s2742 fire)')) throw Error('Lost STATUS ownership');
if (!status.includes(`- **s2741 handoff (line-1 archive):** ${predecessor}`)) {
  const at = status.indexOf('\n');
  status = status.slice(0,at+1) + `\n- **s2741 handoff (line-1 archive):** ${predecessor}\n` + status.slice(at+1);
  fs.writeFileSync('STATUS.md',status);
}
const state = {stamp,head:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),ancestry:{},lanes:{},goals:[]};
for(const hash of ['3717fb210','f6b61e4c5','ab573c67a','97a6a6493']) state.ancestry[hash]=cp.spawnSync('git',['merge-base','--is-ancestor',hash,'main']).status;
for(const branch of ['sol/open-findings-astra','sol/wave-lane-b','sol/map-art-campaign-2','art/portraits-e5-e10-generated']) state.lanes[branch]=cp.execFileSync('git',['log','--oneline',`main..${branch}`],{encoding:'utf8'}).trim();
function leaves(x) { if(!x||typeof x!=='object')return; if(['run-guards-node-watchdog-1','e7-tape-drawer-inheritance-1','audio-music-toggle-1','audio-harshness-1'].includes(x.id))state.goals.push(x); else Object.values(x).forEach(leaves); }
leaves(JSON.parse(read('tasks/goals.json')));
fs.writeFileSync(`${dir}/state.json`,JSON.stringify(state,null,2)+'\n');
for(const tag of ['rgw1','tdi1']) fs.copyFileSync(`${process.env.HOME}/.goldrush/land/${tag}-gates.txt`,`${dir}/${tag}-gates-observed.txt`);
const holder=read(`${process.env.HOME}/.goldrush/land.lock/holder`);
fs.writeFileSync(`${dir}/custody.txt`,holder+'\n'+cp.execFileSync('ps',['-o','pid,ppid,tty,stat,lstart','-p',holder.split(' ')[0]+',91490,25494'],{encoding:'utf8'}));
const backlog=read('tasks/BACKLOG.md');
const historical=backlog.replaceAll('**F-2737-1 — OPEN (s2737, 2026-09-28):','**F-2737-1 — RESOLVED (verified s2742; historical s2737 account, 2026-09-28):');
const row=`✅ **F-2737-1 — RESOLVED (s2742, ${stamp}): the watchdog corrective has completed its final main gate.** Merge \`3717fb210\` is an ancestor of main and its goal is merged. The literal candidate wrapper completed in 1181.895 s with its linked-worktree refusal controlled on the unchanged base; the attended landing then passed its full candidate and final main npm batteries: 1035 pass / 5 skips / zero fail, plus 87/87 chained checks. \`LAND-rgw1-DONE\` is present at 11:35Z. The policy at \`scripts/run-guards.mjs:257\` is 3600 s for the full Node child and 900 s for other guards. This closes the wrapper blocker only: audio remains unlanded and attended-owned. Inheritance \`f6b61e4c5\` has landed and deployed with ASSAYER SYNCED; its final main battery remains with the live attended owner. Three audio done-moves remain; no fire dispatch or drain. Evidence \`artifacts/s2742/report.md\`, \`reviews/run-guards-node-watchdog-1.md\`.\n`;
fs.writeFileSync('tasks/BACKLOG.md',row+historical);
const gazette=read('marketing/outbox/gazette-queue.md');
if(!gazette.includes('f6b61e4c5')) fs.appendFileSync('marketing/outbox/gazette-queue.md',`\n\n## ROUNDUP — Keep the Tape Reel on earlier maps\nAfter reaching the Signal Era, the Prospector keeps the Tape Reel when returning\nto earlier maps. Explicit epoch previews still show that map's own state.\nmerge \`f6b61e4c5\` · pin \`ab573c67a\` · review \`reviews/e7-tape-drawer-inheritance-1.md\`\nROUNDUP-CLASS — 2026-W40; s2742 records the attended September 28 landing. Pin 72 remains in era 6. Draft only; publication stays owner-only.\n`);
console.log(JSON.stringify({stamp,predecessorArchived:true,deskCharacters:desk.length,resolvedHistoricalRows:(backlog.match(/\*\*F-2737-1 — OPEN /g)||[]).length}));
