#!/usr/bin/env node
// claude-fable-5 — first-view probe for e1-baron on the heat-8 build.
// Spawns gr-sim, prints the first view's shape, then kills the child. Not a run; no tape kept.
import { spawn } from 'node:child_process';

const ARENA = '/tmp/heat8-4675cfd7';
const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'e1-baron', '--seed', 'e1-baron-01'], { cwd: ARENA, stdio: ['pipe', 'pipe', 'pipe'] });

let buffer = '';
child.stdout.on('data', (chunk) => {
  buffer += chunk;
  const newline = buffer.indexOf('\n');
  if (newline < 0) return;
  const view = JSON.parse(buffer.slice(0, newline));
  const out = {
    schema: view.schema,
    briefing: view.stablePrefix?.briefing?.slice?.(0, 400) ?? view.stablePrefix?.briefing,
    mechanicsKeys: Object.keys(view.stablePrefix?.mechanics ?? {}),
    buildables: (view.stablePrefix?.mechanics?.buildables ?? []).map((b) => ({ id: b.id, costs: b.costs ?? b.cost, cap: b.cap })),
    mapSeams: view.stablePrefix?.map?.seams,
    claim: view.stablePrefix?.map?.claim ?? view.stablePrefix?.claim,
    nowKeys: Object.keys(view.now ?? {}),
    now: {
      wave: view.now?.wave, gold: view.now?.gold, hero: view.now?.hero, prospector: view.now?.prospector,
      seams: view.now?.seams, works: view.now?.works, threats: view.now?.threats,
      blastReadyInMs: view.now?.blastReadyInMs, weapon: view.now?.weapon, timers: view.now?.timers,
    },
    almanacNext: view.almanac?.nextWave ?? view.almanac,
  };
  console.log(JSON.stringify(out, null, 2));
  child.kill('SIGKILL');
});
child.stderr.on('data', () => {});
child.on('close', () => process.exit(0));
setTimeout(() => { child.kill('SIGKILL'); process.exit(1); }, 30000);
