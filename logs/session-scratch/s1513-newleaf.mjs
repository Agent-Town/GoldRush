import { readFileSync, writeFileSync } from 'node:fs';

// 1. Register the authored leaf (Goal Registration Law — same commit as the master).
const P = 'tasks/goals.json';
const g = JSON.parse(readFileSync(P, 'utf8'));

function findArrayContaining(node, id) {
  let hit = null;
  (function walk(n) {
    if (Array.isArray(n)) {
      if (n.some((x) => x && x.id === id)) hit = n;
      n.forEach(walk);
    } else if (n && typeof n === 'object') {
      Object.values(n).forEach(walk);
    }
  })(g);
  return hit;
}

const siblings = findArrayContaining(g, 'f1511-2-blocker-slide-geometry-gate');
if (!siblings) throw new Error('could not locate the leaf array');

const sample = siblings.find((x) => x.id === 'f1511-2-blocker-slide-geometry-gate');
console.log('sibling leaf keys:', Object.keys(sample).join(', '));

const leaf = {
  id: 'f1510-3-inventory-names-its-commit',
  title:
    'F-1510-3 residue: logs/suite-red-inventory.md still does not NAME the commit it was taken at. '
    + 'f1508-2 (c7284596) added --snapshot, which DERIVES the commit at query time and cured the '
    + 'archaeology cost, but the gate says the inventory names its own commit and it does not. Teach '
    + 'the generator header array in scripts/suite-red-inventory.mjs to emit a Snapshot commit line '
    + 'from git rev-parse HEAD at generation time, degrading to "unrecorded" (never empty), plus a '
    + 'dirty/clean tree marker. CORRECTION folded in: the finding REC says "write HEAD into the '
    + 'provenance block", but there IS no generated provenance block — the md section at :577 was '
    + 'hand-appended and no code emits it; the generator emits provenance LINES in its header array.',
  status: 'queued',
  taskFile: 'lane-f1510-3-inventory-names-its-commit.md',
};

// Match sibling schema where it exists.
for (const k of ['lane', 'slot', 'owner']) {
  if (sample[k] !== undefined && leaf[k] === undefined) {
    leaf[k] = k === 'lane' || k === 'slot' ? 'lane-a' : sample[k];
  }
}

if (siblings.some((x) => x.id === leaf.id)) throw new Error('leaf already exists');
siblings.push(leaf);
writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('leaf registered:', leaf.id, '| keys:', Object.keys(leaf).join(', '));

// 2. BACKLOG dispatch row.
const B = 'tasks/BACKLOG.md';
let t = readFileSync(B, 'utf8');
const marker = '\n✅ **F-1507-2 — CLOSED s1510.';
const row =
  '\n📮 **F-1510-3 — MASTER AUTHORED s1513 → lane-a** (`tasks/lane-f1510-3-inventory-names-its-commit.md`, '
  + 'leaf `f1510-3-inventory-names-its-commit` registered in the same commit). Premise **RE-MEASURED by '
  + 'reading the files this fire, not inherited.** 🔍 **AND IT CORRECTS THE FINDING\'S OWN REC, so the cure '
  + 'does not inherit the error:** F-1510-3 says *"write `HEAD` into the provenance block on the next '
  + 'regeneration"* — but **there is no generated provenance block.** `grep -n "provenance" '
  + '`scripts/suite-red-inventory.mjs`` returns **nothing**; the `## Harness provenance (APPENDED '
  + '2026-07-29 …)` section at `logs/suite-red-inventory.md:577` was **appended by hand** and no code '
  + 'emits it. What the generator *does* emit is two provenance **lines** inside its `const lines = [` '
  + 'header array (`- Harness: …`, `- Run tree: …`), neither of which names a commit. ➡️ **The master '
  + 'therefore targets the header array, and warns that a runner following the REC literally would hunt '
  + 'for a block that does not exist.** Scope adds the half the finding did not ask for — a **dirty/clean '
  + 'tree marker**, because a bare sha is a lie if the tree had uncommitted changes when the suite ran — '
  + 'and mandates loud `unrecorded` degradation over an empty value. ⚠️ **A NEGATIVE RESULT IS EXPLICITLY '
  + 'LICENSED and is a real possibility here:** if the generator normally runs against a raw JSON produced '
  + 'on a *different* tree, then `git rev-parse HEAD` names the reporting tree rather than the tested one, '
  + 'and the sha must be threaded in from the run instead — **s1513 could not rule that out from the '
  + 'generator alone and says so rather than asserting otherwise.** Citation key is scoped to '
  + '`scripts/suite-red-inventory.mjs` (`resolved masking-row test bodies`, measured **1 on main**), so '
  + 'this note quoting it cannot self-rot it — the F-1310-1 class. **GATE unchanged: closes when the '
  + 'inventory names the commit it was taken at.**\n';
if (!t.includes(marker)) throw new Error('marker not found');
t = t.replace(marker, row + marker);
writeFileSync(B, t);
console.log('BACKLOG dispatch row added.');
