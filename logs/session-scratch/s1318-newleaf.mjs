// s1318 — Goal Registration Law: the authored master's leaf lands in the SAME commit as the master.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/goals.json';
const doc = JSON.parse(readFileSync(path, 'utf8'));

const walk = (node, out = []) => {
  for (const child of [...(node.subgoals ?? []), ...(node.tasks ?? [])]) {
    out.push(child);
    walk(child, out);
  }
  return out;
};
const nodes = walk({ subgoals: doc.goals ?? [] });

// Attach beside the slice it continues.
const sibling = nodes.find((n) => n.id === 'f1316-1-float-text-legibility');
if (!sibling) throw new Error('sibling leaf f1316-1-float-text-legibility not found');
const parent = nodes.find((n) => [...(n.subgoals ?? []), ...(n.tasks ?? [])].some((c) => c.id === sibling.id));
if (!parent) throw new Error('parent of f1316-1 leaf not found');
const bucket = (parent.tasks ?? []).some((c) => c.id === sibling.id) ? parent.tasks : parent.subgoals;

if (nodes.some((n) => n.id === 'f1318-1-float-fit-class-wide')) throw new Error('leaf already exists');

bucket.push({
  id: 'f1318-1-float-fit-class-wide',
  title:
    'F-1318-1 — the F-1316-1 fit loop stops at a 32px floor whether or not the text fits, and below the floor a centred draw again discards overflow from BOTH ends (the player gets a different message, not a truncated one). All 8 reachable upgrade sentences fit today, but "Stockpile Yard III - the yard holds more gold" renders AT the floor with zero shrink steps left and 17.8px of raw slack, and Sluice III clears its budget by 0.88px. The guard that should notice this asserts ONE hard-coded string, so it certifies today\'s copy rather than the renderer\'s contract. Widen the guard to every reachable sentence (derived from the producer, not re-typed) and give the floor an ellipsis fallback so overflow degrades legibly.',
  taskFile: 'lane-a-f1318-1-float-fit-class-wide.md',
  status: 'queued',
  lane: 'lane-a',
  spec: 'specs/building-tiers/README.md',
  authoredBy: 's1318 (fire-authored)',
  authorNotes:
    'Spawned by the f1316-1 drain (reviews/f1316-1-float-text-legibility.md, F-1318-1). MEASURED at the drain, not inferred: logs/session-scratch/s1318-floor-headroom-probe.mjs and s1318-real-copy-probe.mjs replicate the shipped fit loop over the real producer output. NOTE the ledger row carries a CORRECTION by its own author — the first probe grew a single string (tier II) and reported "two characters of headroom"; enumerating the real population (4 buildables x tiers 2-3, tier 3 live since bt-02b) shows the worst case is the tier-III stockpile sentence sitting ON the floor. Nothing is broken on screen today and the master says so; the deliverable is the alarm plus a legible degradation, and BOTH manufactured REDs are pre-declared acceptance conditions because every sentence fits today, which means a wrongly-written guard is green at birth (the f1297-2 lesson). Copy changes are firewalled OUT: shortening the sentences is an owner cure on the desk (F-1316-1 / F-1318-2).',
});

writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`);
JSON.parse(readFileSync(path, 'utf8'));
console.log('leaf f1318-1-float-fit-class-wide added beside', sibling.id, 'under parent', parent.id ?? '(root)');
