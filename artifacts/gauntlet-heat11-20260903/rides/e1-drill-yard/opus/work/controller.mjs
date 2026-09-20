#!/usr/bin/env node
// Gold Rush gauntlet heat 11 — e1-drill-yard controller (claude-opus-5, generation 5).
// Deterministic: every decision is a pure function of the view. No clock, no randomness.
//
// Usage: node controller.mjs <tapePath> [--overtime]

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';

const REPO = '/tmp/heat11-5e7a7c0b';
const tapePath = process.argv[2];
const extra = process.argv.slice(3);
const logPath = tapePath.replace(/\.json$/, '-log.txt');

const args = ['scripts/gr-sim.mjs', '--contract', 'e1-drill-yard', '--seed', 'gold-rush', '--tape', tapePath, ...extra];
const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const log = [];
child.stdin.on('error', () => { /* the sim closes stdin at the terminal view */ });
let stderr = '';
child.stderr.on('data', (d) => { stderr += d.toString(); });

const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });

let outcome = null;
let calls = 0;

// Deterministic seam choice: nearest ACTIVE seam with remaining > 0, ties broken by id.
function pickSeam(now) {
  const live = (now.seams ?? []).filter((s) => s.active && s.x !== null && s.z !== null && Number.isFinite(s.x) && Number.isFinite(s.z));
  if (!live.length) return null;
  const h = now.hero;
  live.sort((a, b) => {
    const da = Math.hypot(a.x - h.x, a.z - h.z);
    const db = Math.hypot(b.x - h.x, b.z - h.z);
    return da === db ? a.id.localeCompare(b.id) : da - db;
  });
  return live[0];
}

function orders(view) {
  const now = view.now;
  const claim = view.stablePrefix.map.claim;

  // The secure boundary, if the county ever opens one here: take it the instant it appears.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const out = [];

  // A live upgrade draft: answer explicitly rather than defaulting. It goes FIRST so it owns the
  // tick, but the rest of the set still rides with it — every accepted array replaces the whole
  // standing order set, so a lone PICK_UPGRADE would stand the claim down.
  if (now.pendingOffer && now.pendingOffer.length) {
    out.push({ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id });
  }

  out.push({ verb: 'SET_WEAPON', weapon: 'rig' });

  // Mend before the works are lost; REPAIR_UNDER implies its own travel.
  out.push({ verb: 'REPAIR_UNDER', pct: 60 });

  // A tight ring on the claim. Turret range is 16wu, beacon 8wu; the claim sits at (0,12)
  // and the yard takes spawns from all four edges, so the guns cluster on the body they defend.
  // Timber first: at 10g it is the only thing this yard's income can actually reach inside the
  // ceiling, and a standing work is the proof the door's build path works here at all.
  out.push({ verb: 'BUILD', what: 'palisade', where: { x: claim.x + 2, z: claim.z - 2 }, when: { goldGte: 10 } });
  out.push({ verb: 'BUILD', what: 'palisade', where: { x: claim.x - 2, z: claim.z - 2 }, when: { goldGte: 10 } });
  out.push({ verb: 'BUILD', what: 'palisade', where: { x: claim.x, z: claim.z - 4 }, when: { goldGte: 10 } });
  out.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: claim.x, z: claim.z - 3 }, when: { goldGte: 25 } });
  out.push({ verb: 'BUILD', what: 'turret', where: { x: claim.x + 4, z: claim.z - 3 }, when: { goldGte: 50 } });
  out.push({ verb: 'BUILD', what: 'turret', where: { x: claim.x - 4, z: claim.z - 3 }, when: { goldGte: 70 } });

  // Income. Panning happens where the Prospector stands; the order walks there.
  const seam = pickSeam(now);
  if (seam) out.push({ verb: 'HARVEST', seam: seam.id });

  // Fall back onto the claim when the yard gets crowded, then hold it.
  out.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 6 }, pos: { x: claim.x, z: claim.z } });
  out.push({ verb: 'HOLD', pos: { x: claim.x, z: claim.z } });
  return out;
}

rl.on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }

  if (msg.schema !== 'goldrush.view.v1') { outcome = msg; return; }

  const n = msg.now;
  log.push(`view wave=${n.wave} t=${n.timers.runSeconds}s gold=${n.gold} heroHp=${n.hero.hp} hero=(${n.hero.x},${n.hero.z}) works=${n.works.standing}/${n.works.wrecked} threats=${n.threats.alive}(${n.threats.state}) needsRider=${n.needsRider} pendingSecure=${JSON.stringify(n.pendingSecure ?? null)} pendingOffer=${(n.pendingOffer ?? []).map((o) => o.id).join(',') || 'none'}`);
  const last = (msg.appendLog ?? []).slice(-1)[0];
  if (last) log.push(`  appendLog[last]: ${JSON.stringify(last).slice(0, 600)}`);

  const o = orders(msg);
  calls += 1;
  log.push(`  -> ${JSON.stringify(o)}`);
  try { child.stdin.write(`${JSON.stringify(o)}\n`); } catch { /* terminal view: the sim has stopped reading */ }
});

child.on('close', (code) => {
  log.push(`\n--- exit ${code} ---`);
  log.push(`calls sent: ${calls}`);
  log.push(`STDERR:\n${stderr}`);
  log.push(`OUTCOME: ${JSON.stringify(outcome)}`);
  writeFileSync(logPath, log.join('\n'));
  console.log(JSON.stringify(outcome));
  console.error(stderr.slice(-3000));
});
