// s1281 — F-1281-1: is this slice really "inert on main"?
// s1280 judged inertness from ONE path (the ToolSurface panel row, which needs an adapter
// `panAt` that main does not wire). AgentConsent is a SECOND consumer, and StandingOrders.ts:417
// maps the HARVEST verb to the auto_pan ability. This probe asks the consent table directly,
// at both rung values, with everything else held constant.
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdtempSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';

const repo = process.cwd();

function askAt(level) {
  const dir = mkdtempSync(`${tmpdir()}/s1281-consent-`);
  cpSync(`${repo}/src/agent/AgentConsent.ts`, `${dir}/AgentConsent.ts`);
  const f = `${dir}/AgentConsent.ts`;
  writeFileSync(f, readFileSync(f, 'utf8').replace(/\{ id: 'auto_pan', level: \d,/, `{ id: 'auto_pan', level: ${level},`));
  const probe = `${dir}/probe.mjs`;
  writeFileSync(probe, `
import { AgentConsentStore } from './AgentConsent.ts';
const s = new AgentConsentStore();
// Grant everything a player could grant, so the ONLY variable is the declared rung.
for (const l of [0,1,2,3]) s.setRung(l, true);
for (const a of ['auto_collect','auto_repair','auto_pan','light_duty']) s.setAbility(a, true);
const out = {};
for (const ceiling of [1,2,3]) out['ceiling'+ceiling] = s.snapshot(ceiling).abilities.auto_pan;
console.log(JSON.stringify(out));
`);
  const r = spawnSync('node', ['--experimental-strip-types', probe], { encoding: 'utf8' });
  const line = (r.stdout || '').trim().split('\n').pop();
  return JSON.parse(line);
}

const before = askAt(3); // main's pre-slice value
const after = askAt(2);  // the ruled value this slice lands

console.log('HARVEST standing orders are refused when auto_pan.allowed === false');
console.log('(StandingOrders.ts:408-413 -> requiredAbility(HARVEST) = auto_pan)\n');
for (const c of ['ceiling1', 'ceiling2', 'ceiling3']) {
  const b = before[c], a = after[c];
  const flip = b.allowed !== a.allowed ? '  <== BEHAVIOUR CHANGES HERE' : '';
  console.log(`agent permission ${c.replace('ceiling', 'level ')}:  L3(before) allowed=${b.allowed} earned=${b.earned}` +
              `   ->   L2(after) allowed=${a.allowed} earned=${a.earned}${flip}`);
}
