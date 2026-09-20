import fs from 'node:fs';

const p = 'tasks/goals.json';
let t = fs.readFileSync(p, 'utf8');

// Anchor by CONTENT on the sibling leaf this task follows.
const anchor = '"id": "f1621-1-town-budget-instrument-reconciliation",';
const ai = t.indexOf(anchor);
if (ai < 0) { console.error('anchor leaf not found'); process.exit(1); }

// Walk back to the '{' that opens that object, and insert a full sibling BEFORE it.
const open = t.lastIndexOf('{', ai);
if (open < 0) { console.error('opening brace not found'); process.exit(1); }
const indent = ' '.repeat(14);

const note = [
  'FIRE-AUTHORED s1623 from F-1623-1 (tasks/BACKLOG.md line 1), whose stated gate this task closes verbatim:',
  'one named town-transfer instrument returns the same figure within ~1% across three consecutive runs, and',
  'that instrument is the one the release gate reads. Evidence chain: the s1623 drain of f1621-1 ran the',
  "slice's own code as a control ~40 min after the runner and got a different answer — the mobile normal arm",
  'went 26,542,805 (RED) -> 22,469,496 (green) and the decomposition false/false cell swung 3.08x-3.19x,',
  'so the 25 MB ceiling sits inside the instrument noise and the assertion is a coin-flip. Hypothesis to be',
  'TESTED not assumed: both instruments stop counting at assetLoadingState==="ready" while the advance-stream',
  'prefetch is still issuing concurrently, so the total is whatever landed before a race resolved; plausibly',
  'the same root cause as F-1621-1 (OVERLAP) and F-1620-4. Test-only, firewalled to e2e/asset-diet.spec.ts',
  'and artifacts/asset-diet/** — src/assets/AdvanceStream.ts is READ-ONLY because it is the subject.',
  'A null result is pre-authorised: if nothing holds within 1%, REFUTED is the required word.',
].join(' ');

const gate = [
  'GATE: closes when the slice is merged with artifacts/asset-diet/town-transfer-stability.md reporting three',
  'consecutive runs of both projects, each quantity given as spread-percent-of-mean, and either a named quantity',
  'holding within +/-1% on both projects or the word REFUTED with the best actual percentage and what is left',
  'unexplained. No re-pin, no widened tolerance, no dropped run, and no edit to src/** satisfies this gate.',
].join(' ');

const leaf =
  '{\n' +
  indent + '  "id": "f1623-1-town-transfer-determinism",\n' +
  indent + '  "title": "F-1623-1: the town-transfer instrument swings 3.08x at fixed configuration — make the measurement deterministic before anyone asserts on it again",\n' +
  indent + '  "status": "queued",\n' +
  indent + '  "taskFile": "lane-f1623-1-town-transfer-determinism.md",\n' +
  indent + '  "lane": "lane-a",\n' +
  indent + '  "note": ' + JSON.stringify(note) + ',\n' +
  indent + '  "gate": ' + JSON.stringify(gate) + '\n' +
  indent + '},\n' +
  indent;

t = t.slice(0, open) + leaf + t.slice(open);
fs.writeFileSync(p, t);

const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('leaf inserted; JSON re-parses clean');
const hit = JSON.stringify(parsed).includes('f1623-1-town-transfer-determinism');
console.log('leaf present in parsed tree:', hit);
