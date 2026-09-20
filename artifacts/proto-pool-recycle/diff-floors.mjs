#!/usr/bin/env node

/**
 * Blast-radius diff: the regenerated `assets/contracts/null-floors.json` on this branch
 * against the committed one at HEAD. Prints EVERY row whose outcome moved, grouped
 * sick-maps vs bystanders, and asserts nothing was silently added or dropped.
 *
 * Usage: node artifacts/proto-pool-recycle/diff-floors.mjs
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const FIELDS = ['secured', 'waves', 'timeMs', 'gold', 'kills', 'eventLogHash'];
// The three maps under test. Everything else is a bystander by definition.
const SICK = new Set(['e6-showroom', 'e6-picnic', 'e6-half-life-hollow']);
// Wrangle is epoch-wide, so every Atomic map has the hook seated even when it never fires.
const HOOK_SEATED = new Set(['e6-glow-mesa', 'e6-showroom', 'e6-picnic', 'e6-half-life-hollow']);

const head = JSON.parse(execFileSync('git', ['show', 'HEAD:assets/contracts/null-floors.json'], { cwd: ROOT, encoding: 'utf8' }));
const now = JSON.parse(readFileSync(`${ROOT}assets/contracts/null-floors.json`, 'utf8'));

const flatten = (doc) => {
  const out = new Map();
  for (const [contract, seeds] of Object.entries(doc.floors)) {
    for (const [seed, row] of Object.entries(seeds)) out.set(`${contract}\u0000${seed}`, { contract, seed, row });
  }
  return out;
};
const before = flatten(head);
const after = flatten(now);

const moved = [];
const added = [];
const dropped = [];
for (const [key, entry] of after) {
  const prior = before.get(key);
  if (!prior) { added.push(entry); continue; }
  const deltas = FIELDS.filter((f) => JSON.stringify(prior.row[f]) !== JSON.stringify(entry.row[f]));
  if (deltas.length) moved.push({ ...entry, prior: prior.row, deltas });
}
for (const [key, entry] of before) if (!after.has(key)) dropped.push(entry);

const line = (e) => `  ${e.contract}/${e.seed}: ` + e.deltas
  .map((f) => `${f} ${JSON.stringify(e.prior[f])} -> ${JSON.stringify(e.row[f])}`).join(', ');

process.stdout.write(`rows: HEAD=${before.size} branch=${after.size}\n`);
process.stdout.write(`eraStamp: HEAD=${head.eraStamp} branch=${now.eraStamp}\n`);
process.stdout.write(`secured:true rows on branch: ${[...after.values()].filter((e) => e.row.secured === true).length}\n\n`);

const sickMoved = moved.filter((e) => SICK.has(e.contract));
const seatedMoved = moved.filter((e) => !SICK.has(e.contract) && HOOK_SEATED.has(e.contract));
const bystanderMoved = moved.filter((e) => !HOOK_SEATED.has(e.contract));

process.stdout.write(`SICK MAPS moved: ${sickMoved.length}\n${sickMoved.map(line).join('\n')}\n`);
process.stdout.write(`HOOK-SEATED (E6, not sick) moved: ${seatedMoved.length}\n${seatedMoved.map(line).join('\n')}\n`);
process.stdout.write(`BYSTANDERS moved: ${bystanderMoved.length}\n${bystanderMoved.map(line).join('\n')}\n`);
process.stdout.write(`\nadded rows: ${added.length} ${added.map((e) => `${e.contract}/${e.seed}`).join(', ')}\n`);
process.stdout.write(`dropped rows: ${dropped.length} ${dropped.map((e) => `${e.contract}/${e.seed}`).join(', ')}\n`);
process.stdout.write(`\nVERDICT: ${moved.length === 0 ? 'ZERO MOVEMENT across all admitted floors.' : `${moved.length} row(s) moved.`}\n`);
