#!/usr/bin/env node
/**
 * s1534 — FRESH measurement for F-MSD-1's declaring row.
 * The dossier (s1495) counted 13 of 25 campaign contracts declaring an EMPTY
 * harvestAnchors, which the door at ContractFamilies.ts:1328 refuses. Re-derive
 * that count from the contract data on main TODAY rather than carrying the prose.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'assets/contracts';
const empty = [];
const nonEmpty = [];
const absent = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.json')) visit(p);
  }
}

function visit(file) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return;
  }
  // contracts.json holds an array/map of contracts; mask-tables hold one.
  const entries = [];
  const collect = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(collect);
    if (node.id && (node.tileParams || node.name)) entries.push(node);
    for (const v of Object.values(node)) collect(v);
  };
  collect(json);
  for (const c of entries) {
    const a = c.tileParams?.harvestAnchors ?? c.harvestAnchors;
    const rec = { id: c.id, file: path.relative('.', file) };
    if (Array.isArray(a) && a.length === 0) empty.push(rec);
    else if (Array.isArray(a)) nonEmpty.push({ ...rec, n: a.length });
    else absent.push(rec);
  }
}

walk(ROOT);
const uniq = (arr) => [...new Map(arr.map((r) => [r.id, r])).values()];
const e = uniq(empty), n = uniq(nonEmpty), ab = uniq(absent);
console.log('EMPTY harvestAnchors (door refuses -> The Claim):', e.length);
for (const r of e) console.log('   ', r.id, '  ', r.file);
console.log('\nNON-EMPTY:', n.length);
for (const r of n) console.log('   ', r.id, `(${r.n})`);
console.log('\nno harvestAnchors key at all:', ab.length);
console.log('   ', ab.map((r) => r.id).join(', '));
