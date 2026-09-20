// s1521 — seed the 7 standing supersession acks (F-1521-1). Each reason was written from the
// REFERENT'S OWN TITLE on today's board, not inherited from a prior handoff.
import { readFileSync, writeFileSync } from 'node:fs';

const ACKS = {
  'f1424-4-lane-shell-worker-arms': {
    'f1426-2-repair-the-concurrency-harness-contract':
      'NO — f1426-2 (08ec76b5) repaired the INSTRUMENT this leaf needs, it did not take the ' +
      'measurement. Its own title says the repair exists because "the successor measurement needs ' +
      'MULTI-FILE subjects". The leaf also carries the hedge "SUPERSEDED IN PRACTICE BY f1426-2", ' +
      'which s1520 measured and rejected as a false red: a hedge is not a commitment. The real ' +
      'successor is f1424-4-worker-arm-rates, dispatched to lane-a s1520 and building at s1521.',
  },
  'eight-winds-wiring-e2-enemies': {
    'e2-rail-tough-only-bind':
      'PARTIALLY — and this is the honest one. 7ed00040 bound Rail Tough, one of this leaf\'s three ' +
      'E2 enemy slots, and its title states explicitly that "Steam Wrecker + Coal Thief stay ' +
      'unbound (F-1193-3)". The leaf\'s STOP is about Coal Thief: rows 0 and 1 both face southeast ' +
      'and its southwest row is MISSING. That art gap is untouched, so the leaf stays stopped — ' +
      'but its remaining scope is now two slots, not three.',
    'eight-winds-rail-tough-row-settle':
      'NO — 8b9e8af2 is evidence-only by its own title ("zero art, zero src/, zero assets/, zero ' +
      'contract bytes"). It settled the Rail Tough 2v3 row disagreement; it cannot produce Coal ' +
      'Thief\'s missing southwest row, which is what this leaf is blocked on.',
    'eight-winds-e2-row-order-survey':
      'NO — b8ccf36c is evidence-only ("zero contract, zero src/, zero pixels"). It established the ' +
      'true row->heading mapping so a future batch can be sized. Establishing that Coal Thief\'s ' +
      'southwest row is absent is not the same act as generating it.',
    'citation-titles-rung-masters':
      'NO — 0bb729f1 is a factory citation-hygiene slice retiring the standing test:citations red. ' +
      'It names this master as a CITATION EXAMPLE in its authorNotes, nothing more. No E2 enemy ' +
      'binding, no art.',
  },
  'anim-8frame-townsfolk': {
    'eight-winds-wiring-hero':
      'NO — 29bac3d9 binds char-hero to walk8 and its title states char.hero is the ONLY walk8 slot ' +
      'it touches. This leaf is about preacher/schoolteacher/assay_clerk, and its STOP is that the ' +
      'DYNAMIC premise is false (those three actors have no walk loop at all) — a question about ' +
      'whether plaza townsfolk walk, which is an owner ruling, not a binding.',
    'citation-titles-rung-masters':
      'NO — 0bb729f1 is factory citation hygiene; it names this master as a citation example only.',
  },
};

const src = readFileSync('tasks/goals.json', 'utf8');
const goals = JSON.parse(src);
const leaves = [];
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (n.id || n.taskFile) leaves.push(n);
  for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
})({ subgoals: goals.goals || [] });

let written = 0;
for (const [leafId, acks] of Object.entries(ACKS)) {
  const leaf = leaves.find((l) => l.id === leafId);
  if (!leaf) throw new Error(`no leaf ${leafId}`);
  if (leaf.status !== 'stopped') throw new Error(`${leafId} is ${leaf.status}, not stopped`);
  leaf.supersessionChecked = { ...(leaf.supersessionChecked || {}), ...acks };
  written += Object.keys(acks).length;
}

const out = JSON.stringify(goals, null, 2) + '\n';
writeFileSync('tasks/goals.json', out);
console.log('acks written:', written);
console.log('byte delta  :', out.length - src.length);
