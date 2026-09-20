// Deep-compare two RunTapes for self-verification (ignoring per-run identity fields).
import { readFileSync } from 'node:fs';
const [a, b] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, 'utf8')));
const pick = (t) => ({
  contract: t.contract, seed: t.seed, difficulty: t.difficulty,
  meta: t.meta, runStart: t.runStart, eventLogHash: t.eventLogHash,
  outcome: t.outcome, inputLog: { ...t.inputLog, name: undefined },
});
const ja = JSON.stringify(pick(a));
const jb = JSON.stringify(pick(b));
console.log('outcomeA:', JSON.stringify(a.outcome));
console.log('outcomeB:', JSON.stringify(b.outcome));
console.log('eventLogHashA:', a.eventLogHash, 'B:', b.eventLogHash);
console.log('inputLog entriesA:', a.inputLog.entries.length, 'B:', b.inputLog.entries.length);
console.log('IDENTICAL (ex-identity):', ja === jb);
if (ja !== jb) {
  for (let i = 0; i < Math.max(a.inputLog.entries.length, b.inputLog.entries.length); i++) {
    const ea = JSON.stringify(a.inputLog.entries[i]);
    const eb = JSON.stringify(b.inputLog.entries[i]);
    if (ea !== eb) { console.log('first divergence at entry', i); console.log('A:', (ea ?? 'MISSING').slice(0, 300)); console.log('B:', (eb ?? 'MISSING').slice(0, 300)); break; }
  }
}
