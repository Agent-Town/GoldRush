#!/usr/bin/env node
// Canyon Works controller. Phase machine over the view.
// Usage: node ctl.mjs <tape> [flags]
//   --palis N   : build N palisades at the stake before the beacon tour
//   --tour G    : gold threshold to launch the six-beacon tour (default 330)
//   --nopan     : skip panning (diagnostic)
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const tape = args[0];
const flag = (n, d) => { const i = args.indexOf(n); return i < 0 ? d : Number(args[i + 1]); };
const PALIS = flag('--palis', 0);
const TOURG = flag('--tour', 330);
const LOG = [];

// six pylon sites, in southbound-tour order starting from the north seams
const PYLONS = [
  { id: 'w-rim', x: -28, z: 8 },
  { id: 'w-switch', x: -24, z: -20 },
  { id: 'w-base', x: -12, z: -36 },
  { id: 'e-base', x: 12, z: -36 },
  { id: 'e-switch', x: 24, z: -20 },
  { id: 'e-rim', x: 28, z: 8 },
];
// palisade ring near the stake (0,-44), inside sub-hall-yard (x -36..36, z -52..-28)
const PALI = [
  { x: 0, z: -34 }, { x: -6, z: -35 }, { x: 6, z: -35 },
  { x: -11, z: -38 }, { x: 11, z: -38 }, { x: 0, z: -30 },
  { x: -16, z: -34 }, { x: 16, z: -34 }, { x: -6, z: -30 }, { x: 6, z: -30 },
  { x: -20, z: -38 }, { x: 20, z: -38 }, { x: -12, z: -30 }, { x: 12, z: -30 },
];

const UP = (id) => {
  const s = id.toLowerCase();
  if (/plating|dressing|vitality|hardy|armor|armour|health|hp/.test(s)) return 100;
  if (/regen|mend|repair/.test(s)) return 60;
  if (/spark|damage|coil|tap|volley|split|heavy/.test(s)) return 40;
  if (/range|resonator|speed/.test(s)) return 20;
  return 10;
};

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e3-canyon-works',
  '--seed', 'e3-canyon-works-01', '--tape', tape], { stdio: ['pipe', 'pipe', 'inherit'] });

let buf = '';
let outcome = null;
let built = new Set();      // pylon ids we've seen covered
let paliDone = 0;
let views = 0;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let v; try { v = JSON.parse(line); } catch { continue; }
    if (v.schema === 'goldrush.view.v1') { views++; respond(v); }
    else if ('secured' in v) { outcome = v; }
  }
});

function respond(v) {
  const now = v.now;
  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const cc = now.canyonConnect || {};
  const ents = now.works?.entries || [];
  const beacons = ents.filter((e) => e.id === 'sentry_beacon' && !e.wrecked);
  const palis = ents.filter((e) => e.id === 'palisade' && !e.wrecked);
  paliDone = palis.length;
  built = new Set();
  for (const p of PYLONS) {
    if (beacons.some((b) => Math.hypot(b.position.x - p.x, b.position.z - p.z) <= 2.5)) built.add(p.id);
  }
  LOG.push({ t: +t.toFixed(1), w: now.wave, gold, hp: now.hero?.hp, alive: now.threats?.alive,
    pan: now.score?.goldPanned, bc: beacons.length, pa: palis.length,
    powered: cc.powered, cplt: cc.complete, fail: cc.failed });

  // ---- secure boundary: exactly one order, nothing else ----
  if (now.pendingSecure) { send([{ verb: 'SECURE_CHOICE', choice: 'bank' }]); return; }

  const out = [];
  if (now.pendingOffer?.length) {
    const best = [...now.pendingOffer].sort((a, b) => UP(b.id) - UP(a.id))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // Build the chain STAKE-FIRST, in pairs. The base pylons sit 14.4wu from the hero, so their
  // beacons (radius 8, slow+damage) are the only defence this map sells that also advances the
  // objective — palisades moved the death by zero ticks.
  const ORDER = ['w-base', 'e-base', 'w-switch', 'e-switch', 'w-rim', 'e-rim'];
  const seq = ORDER.map((id) => PYLONS.find((p) => p.id === id));
  const missing = seq.filter((p) => !built.has(p.id));
  const nBuilt = 6 - missing.length;
  const CURVE = [25, 35, 45, 55, 75, 95];
  const remainCost = CURVE.slice(nBuilt).reduce((a, b) => a + b, 0);
  // plan-time affordable prefix: how many of the missing can this purse pay for right now
  let acc = 0, afford = 0;
  for (let k = nBuilt; k < 6; k++) { if (acc + CURVE[k] <= gold) { acc += CURVE[k]; afford++; } else break; }

  // ---- phase P: early palisades at the stake ----
  // Plan-time affordability (gen-28): emit the WHOLE batch only once the purse already covers it,
  // so the ring is one trip south instead of one 80wu round trip per 10-gold palisade.
  if (PALIS > 0 && paliDone < PALIS && gold >= (PALIS - paliDone) * 10) {
    for (let k = paliDone; k < PALIS && k < PALI.length; k++) {
      out.push({ verb: 'BUILD', what: 'palisade', where: PALI[k], when: { goldGte: 0 } });
    }
  }

  // ---- phase T: the beacon tour, launched only when fully funded ----
  if (missing.length && !cc.failed && afford > 0) {
    for (const p of missing.slice(0, Math.max(afford, TOURG <= 0 ? 0 : afford))) {
      out.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: p.x, z: p.z }, when: { goldGte: 0 } });
    }
  }

  // ---- phase D: after the connect, spend everything on chaff + mending ----
  if (cc.complete || cc.failed) {
    out.push({ verb: 'REPAIR_UNDER', pct: 60 });
    for (let k = paliDone; k < Math.min(paliDone + 3, PALI.length); k++) {
      out.push({ verb: 'BUILD', what: 'palisade', where: PALI[k], when: { goldGte: 30 } });
    }
  }

  // ---- tail: pan, alternating the live seams so a depleted one never eats the tail ----
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  const px = now.prospector?.x ?? 0, pz = now.prospector?.z ?? 0;
  live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  // STACK six on one seam (a seam holds 30 gold = 6 ticks) before moving to the next: alternating
  // per-order walks 12.6wu between every 1.5s pan. And name ALL FOUR ids, nearest-live first, because
  // a depleted seam re-anchors under a different id and the array must outlast the 30s view gap.
  const all = (now.seams || []).slice().sort((a, b) => {
    const av = a.active && a.x !== null, bv = b.active && b.x !== null;
    if (av !== bv) return av ? -1 : 1;
    if (!av) return 0;
    return Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz);
  });
  if (all.length) {
    const slots = 32 - out.length;
    for (let k = 0; k < slots; k++) out.push({ verb: 'HARVEST', seam: all[Math.floor(k / 6) % all.length].id });
  }
  send(out.slice(0, 32));
}

function send(o) { child.stdin.write(JSON.stringify(o) + '\n'); }

child.on('close', () => {
  const rate = (() => {
    const a = LOG.find((r) => r.pan > 0), b = LOG[LOG.length - 1];
    return a && b && b.t > a.t ? ((b.pan - a.pan) / b.t).toFixed(2) : 'n/a';
  })();
  console.log(JSON.stringify({ outcome, views, goldPerSec_overall: rate, log: LOG }, null, 1));
});
