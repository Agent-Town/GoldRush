import fs from 'node:fs';

const note =
  'FIRE-AUTHORED s1620 from F-1620-1 + F-1620-2, both measured at the s1620 drain of f1619-1 (merge 3ef4c1dcc). ' +
  'MEASUREMENT SLICE, NOT A CURE: src/assets/AdvanceStream.ts is firewalled BY NAME, as it was for f1614-1, f1616-1 and f1619-1 — a task that measures the prefetch path must not alter it. ' +
  'WHY IT IS THE TOP LEAD: f1619-1 proved the double-download is NOT a page.route artifact, but the drain found it had inherited a second confound it could not see — the harness runs against the Vite dev server, which sends Cache-Control: no-cache, under which a true CACHE-HIT is impossible by construction. So the persuasive CACHE-HIT=0 column was the server talking, not the prefetch. ' +
  'THE STAKE, STATED BOTH WAYS ON PURPOSE: if the double-download survives production-style headers, the deployed game re-downloads tens of MB in a five-door walk and a cure slice against AdvanceStream.ts is clearly worth funding; if it does not survive, the whole thing was a dev-server artifact and the ladder should stop here. Both answers are valuable and the master forbids preferring either. ' +
  'THREE DESIGN DECISIONS. (1) FOUR buckets, not three: classify() currently captures response.status and never reads it, so 304 revalidations (~127 bytes, body served from cache) score as DOUBLE-DOWNLOAD; a REVALIDATED bucket is added and deliberately NOT collapsed into CACHE-HIT, because they cost different amounts and a future regression assertion will want them apart. (2) The production arm reuses playwright.preview.config.ts, which already serves a built bundle — the master forbids inventing a server, and REQUIRES the report to state the exact cache-control value read off a real response, because a run whose headers were not measured answers nothing and measuring them is the entire difference from f1619-1. (3) It asserts NEITHER direction of the unknown — only errors-empty plus the same two anti-vacuity assertions f1619-1 used. ' +
  'GATE TOPOLOGY DELIBERATELY UNCHANGED per s1301: both tests live in a file the default playwright run already reaches; adding an npm script is a STOP-and-report, not a judgement call, because a new un-rooted gate reds gate-caller-audit. ' +
  'The master also asks the runner to re-state f1619-1 headline with corrected buckets against a ~18 DOUBLE-DOWNLOAD + 11 REVALIDATED desktop expectation, and explicitly tells it to say so rather than quietly adopt that figure if its own numbers differ — mine came from a size-split of the committed artifact, not from a status field.';

const gate =
  'GATE: closes when both arms (dev-server headers and production-style headers) are reported side by side with FOUR buckets per project, the exact observed cache-control value is stated per arm with how it was read, and a prose verdict is recorded on whether the double-download survives production headers. ' +
  'Undetermined-with-numbers-and-a-reason satisfies this gate; a confident guess does not, and neither does any edit to src/assets/AdvanceStream.ts. None owed to the owner — this is an engineering question, not a design fork.';

const leaf = {
  id: 'f1620-1-cache-reuse-production-headers',
  title: 'F-1620-2: does the advance-stream double-download survive PRODUCTION headers, or was it a Vite no-cache artifact? (+ F-1620-1 classify() reads status)',
  status: 'queued',
  taskFile: 'lane-f1620-1-cache-reuse-production-headers.md',
  lane: 'lane-c',
  note,
  gate,
};

const p = 'tasks/goals.json';
let t = fs.readFileSync(p, 'utf8');

// Splice as a sibling immediately before the f1619-1 leaf, matching its indentation.
const anchorId = JSON.stringify('f1619-1-advance-stream-cache-reuse');
const idIdx = t.indexOf(anchorId);
if (idIdx < 0) throw new Error('sibling anchor missing');
const objStart = t.lastIndexOf('{', idIdx);
const lineStart = t.lastIndexOf('\n', objStart) + 1;
const indent = t.slice(lineStart, objStart);

const body = JSON.stringify(leaf, null, 2)
  .split('\n')
  .map((l, i) => (i === 0 ? l : indent + l))
  .join('\n');

t = t.slice(0, objStart) + body + ',\n' + indent + t.slice(objStart);
fs.writeFileSync(p, t);

const j = JSON.parse(t);
const find = (o) => {
  let r = null;
  if (Array.isArray(o)) for (const v of o) r = r || find(v);
  else if (o && typeof o === 'object') {
    if (o.id === 'f1620-1-cache-reuse-production-headers') return o;
    for (const k of Object.keys(o)) r = r || find(o[k]);
  }
  return r;
};
const got = find(j);
console.log('JSON OK · leaf registered:', got.id, '· status:', got.status, '· lane:', got.lane);
