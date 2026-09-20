// s1466: Goal Registration Law — every authored master adds its leaf in the SAME commit.
// Insert next to the f1465-1 leaf (same array), by targeted raw replacement so the 1.1 MB file
// keeps its formatting and the diff stays reviewable.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const raw = readFileSync(P, 'utf8');

// Anchor: the closing brace of the f1465-1 leaf, which this fire just wrote.
const ANCHOR = '"notes": "Drained s1466.';
const idx = raw.indexOf(ANCHOR);
if (idx < 0) { console.error('anchor not found — refusing to write'); process.exit(2); }
// Find the end of that leaf object: the first "\n            }" after the anchor.
const endMarker = '\n            }';
const end = raw.indexOf(endMarker, idx);
if (end < 0) { console.error('leaf end not found — refusing to write'); process.exit(2); }
const insertAt = end + endMarker.length;

const NEW_LEAF = `,
            {
              "id": "e3-voltage-socket",
              "title": "E3 Voltage socket — make current + locked night agent-visible for Blackout Ridge (cures F-ER01-E3-1)",
              "taskFile": "lane-e3-voltage-socket.md",
              "status": "queued",
              "notes": ${JSON.stringify(
    'FIRE-AUTHORED s1466 from merged evidence: docs/bench/e3-readiness-census.md F-ER01-E3-1 (merged 0c4168a2) ' +
    'plus the ERA-SOCKET template tasks/lane-e2-pressure-socket.md, authored by fire s1460 and drained clean at ' +
    '24c6600f (review reviews/e2-pressure-socket.md). Scoped to e3-blackout-ridge ONLY — its twist is ' +
    'secureWave/dayNightCycle/powerGrid/enemyRoster (verified s1466), so F-ER01-E3-2 (MothSwarm), -E3-3 ' +
    '(Canyon Works crawler/tram/baron/lightRamp) and -E3-4 (Fairground + its missing crowd objective) firewall ' +
    'out cleanly. Paths verified before authoring: the class is PowerGraphSystem at src/systems/PowerGraph.ts:193 ' +
    '— the file is PowerGraph.ts, NOT PowerGraphSystem.ts, which is exactly the kind of miss that STOPs a runner. ' +
    'Pre-flight puts the lane refresh as unconditional STEP 1 and the currency probe as STEP 2 (F-1465-2), carries ' +
    'the FACTORY-CHURN EXCEPTION (F-1407-1/F-1266-1), and its citation key was proved to return exactly 1 on main ' +
    'before being written down (F-1425-2). Census "attended fix master" phrasing verified s1466 to be boilerplate ' +
    'a fire has already lawfully overridden on E2, not an owner gate.',
  )}
            }`;

const out = raw.slice(0, insertAt) + NEW_LEAF + raw.slice(insertAt);

const doc = JSON.parse(out);
let found = null, dupes = 0;
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk);
  if (!n || typeof n !== 'object') return;
  if (n.id === 'e3-voltage-socket') { found = n; dupes++; }
  for (const v of Object.values(n)) walk(v);
};
walk(doc);
if (!found || dupes !== 1) { console.error(`expected exactly 1 new leaf, got ${dupes} — refusing`); process.exit(2); }
writeFileSync(P, out, 'utf8');
console.log('leaf added:', JSON.stringify({ id: found.id, status: found.status, taskFile: found.taskFile }));
console.log(`lines ${raw.split('\n').length} -> ${out.split('\n').length}`);
