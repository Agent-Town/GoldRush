// s1279: prove ruling-propagation-guard.mjs can RED on the exact pre-fix state it was built for.
// Mutation = restore ap-06b-adapter-wiring to status:"blocked" with the s1219 blockedReason that
// names F-1219-1 (the state main carried from 2026-07-30 10:23 until this fire). Then restore
// byte-identically and prove it with sha256.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const GOALS = 'tasks/goals.json';
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const before = sha(GOALS);
const original = fs.readFileSync(GOALS, 'utf8');
console.log('sha256 BEFORE :', before);

const run = () => {
  try {
    const out = execFileSync('node', ['scripts/ruling-propagation-guard.mjs'], { encoding: 'utf8' });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
};

const clean = run();
console.log('\n--- CLEAN TREE ---\nrc=' + clean.rc + '\n' + clean.out.trim());

const goals = JSON.parse(original);
// locate the leaf and put it back the way main carried it
let patched = 0;
const walk = (n) => {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) return n.forEach(walk);
  if (n.id === 'ap-06b-adapter-wiring') {
    n.status = 'blocked';
    n.blockedReason = n.priorBlockedReason;
    delete n.priorBlockedReason;
    delete n.authorNotes;
    patched++;
  }
  Object.values(n).forEach((v) => { if (v && typeof v === 'object') walk(v); });
};
walk(goals);
console.log('\nleaves patched:', patched);
fs.writeFileSync(GOALS, JSON.stringify(goals, null, 2) + '\n');

const mutated = run();
console.log('\n--- MUTATED (pre-fix state) ---\nrc=' + mutated.rc + '\n' + mutated.out.trim());

fs.writeFileSync(GOALS, original);
const after = sha(GOALS);
console.log('\nsha256 AFTER  :', after);
console.log('RESTORED BYTE-IDENTICAL:', before === after);
console.log('\nGUARD PROVEN MEANINGFUL:', clean.rc === 0 && mutated.rc === 1 && before === after);
