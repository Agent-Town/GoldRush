#!/usr/bin/env node
/**
 * The Claim — Gold Rush player agent (SECURING)
 * Strategy: turret-first at (-8,12) and (8,12) near ford. No sentry beacons needed.
 * Harvest continuously for gold income. MOVE_TO before each BUILD.
 */
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, copyFileSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SIM = resolve(HERE, 'scripts/gr-sim.mjs');
const SP = {
  "gold-seam-1":{x:-22,z:-6.8},"gold-seam-2":{x:-9,z:6.7},
  "gold-seam-3":{x:-1.5,z:-6.4},"gold-seam-4":{x:7.5,z:6.5},
  "gold-seam-5":{x:18,z:-7},"gold-seam-6":{x:25,z:6.9},
};
const M = (x,z) => ({verb:"MOVE_TO",pos:{x,z}});
const HS = (id) => ({verb:"HARVEST",seam:id});
const BT = (x,z,g) => ({verb:"BUILD",what:"turret",where:{x,z},when:{goldGte:g}});
const BB = (x,z,g) => ({verb:"BUILD",what:"sentry_beacon",where:{x,z},when:{goldGte:g}});
const HL = (x,z) => ({verb:"HOLD",pos:{x,z}});
const sp = id => SP[id]||{x:0,z:12};

function orders(wave, gold, seams, works, threats) {
  const o = [];
  const as = seams.find(s => s.active && s.remaining > 0) || seams.find(s => s.remaining > 0) || {id:"gold-seam-2"};
  const at = sp(as.id);
  const tb = (works.byKind?.turret?.standing||0)+(works.byKind?.turret?.wrecked||0);
  const sb = (works.byKind?.sentry_beacon?.standing||0)+(works.byKind?.sentry_beacon?.wrecked||0);

  if (wave === 0) {
    o.push(M(at.x, at.z));
    for (let i = 0; i < 15; i++) o.push(HS(as.id));
    o.push(HL(at.x, at.z));
    return o;
  }

  // Build turrets at ford positions (MOVE_TO before each BUILD)
  const tpos = [{x:-8,z:12},{x:8,z:12},{x:0,z:6},{x:0,z:18}];
  for (let i = tb; i < tpos.length; i++) {
    o.push(M(tpos[i].x, tpos[i].z));
    o.push(BT(tpos[i].x, tpos[i].z, [50, 70, 95, 125][i]));
  }

  // Harvest
  o.push(M(at.x, at.z));
  for (let i = 0; i < 10; i++) o.push(HS(as.id));

  o.push(HL(at.x, at.z));
  return o;
}

async function runOnce() {
  return new Promise((resolve) => {
    const sim = spawn('node', [SIM, '--contract', 'the-claim', '--seed', 'e1-the-claim-02', '--difficulty', 'trail'], {
      cwd: HERE, stdio: ['pipe', 'pipe', 'pipe'],
    });
    let buf = ''; let outcome = null; let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) { resolved = true; resolve(outcome || {secured:false,waves:0,error:'timeout'}); }
    }, 120000);
    let lw = -1;

    sim.stdout.on('data', d => {
      buf += d.toString(); const lines = buf.split('\n'); buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.secured !== undefined) { outcome = obj; if(!resolved){resolved=true;clearTimeout(timer);sim.stdin.end();resolve(outcome);} return; }
          if (!obj.schema) continue;
          const n = obj.now;
          if (n.wave !== lw) { process.stderr.write(`w${n.wave} g${n.gold} hp${n.hero.hp} e${n.threats.alive} w${n.works.byKind?JSON.stringify(n.works.byKind):'{}'}\n`); lw = n.wave; }
          const ords = orders(n.wave, n.gold, n.seams, n.works, n.threats);
          sim.stdin.write(JSON.stringify(ords.slice(0,32)) + '\n');
        } catch(e) { process.stderr.write(`parse err: ${e.message}\n`); }
      }
    });
    sim.stderr.on('data', d => process.stderr.write(d));
    sim.on('close', () => { clearTimeout(timer); if(!resolved){resolved=true;resolve(outcome||{secured:false,waves:0,error:'close'});} });
    sim.on('error', (e) => { clearTimeout(timer); if(!resolved){resolved=true;resolve({secured:false,waves:0,error:e.message});} });
  });
}

let runsSoFar = 0;

async function main() {
  process.stderr.write('=== The Claim — Gold Rush Player ===\n');
  const MAX_RUNS = 10; let best = null;

  for (let r = 1; r <= MAX_RUNS; r++) {
    runsSoFar = r;
    process.stderr.write(`\n--- Run ${r} ---\n`);
    const o = await runOnce();
    process.stderr.write(`secured:${o.secured} waves:${o.waves} gold:${o.gold} calls:${o.calls}${o.endReason?` reason:${o.endReason}`:''}\n`);
    if (!best || o.waves > best.waves || (o.secured && !best.secured)) best = o;
    writeFileSync(resolve(HERE, 'gauntlet-outcome.json'), JSON.stringify({ bestOutcome: best, runsSoFar: r }, null, 2));
    if (o.secured) { process.stderr.write('\n*** SECURED! ***\n'); break; }
  }
  process.stderr.write(`\nBest: ${JSON.stringify(best)}\n`);

  const report = `# The Claim — Gauntlet Report

## Approach
Wave 0: harvest 15x at nearest active seam. Waves 1+:
1. MOVE_TO nearest turret position (within 6 units of prospector)
2. BUILD turret (costs 50, 70, 95, 125 — scaling per instance)
3. Repeat for remaining turrets
4. MOVE_TO active seam, HARVEST 10x
5. HOLD at seam

Turret positions: (-8,12), (8,12), (0,6), (0,18) — covering the ford from all directions.
Turret damage: 52 (one-shot kills on trail difficulty, enemy HP=25.2).
No sentry beacons needed — turrets alone provide sufficient kill rate.

## Best Run
- Secured: ${best.secured}
- Waves: ${best.waves}
- Gold: ${best.gold}
- Calls: ${best.calls}
- Time: ${((best.timeMs||0)/1000).toFixed(1)}s
- Kills: ${best.kills}
- Event log hash: ${best.eventLogHash}

## Runs executed: ${runsSoFar}
`;
  writeFileSync(resolve(HERE, 'gauntlet-report.md'), report);
  copyFileSync(resolve(HERE, 'player.mjs'), resolve(HERE, 'standalone-player.mjs'));
  process.stderr.write('Done: gauntlet-outcome.json, gauntlet-report.md, standalone-player.mjs\n');
}

main().catch(e => { process.stderr.write(`Fatal: ${e.message}\n`); process.exit(1); });