// s1516: final compaction of MEMORY.md — shorten the longest KEY labels only.
// Links and file names are never touched, so nothing becomes unreachable.
import fs from 'node:fs';

const P = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/MEMORY.md';
let s = fs.readFileSync(P, 'utf8');
const before = Buffer.byteLength(s);
const linksBefore = (s.match(/\]\([a-z0-9-]+\.md\)/g) || []).length;

const SUBS = [
  ['markdown lists FAILURES ONLY — denominator is in the compact JSON', 'md lists FAILURES only; denominator in compact JSON'],
  ['a manufactured-defect probe can prove a NARROWER claim than its wording', 'manufactured-defect probe proves a NARROWER claim'],
  ['prove the HARNESS is constructible before authoring scope', 'prove the HARNESS is constructible first'],
  ['a blocker true of ONE TRANSPORT is vacuous in another', 'blocker true of ONE TRANSPORT, vacuous in another'],
  ['a gate on a WHOLE-CORPUS COUNT is rotted by your OWN authoring commit', 'WHOLE-CORPUS COUNT gate rotted by your OWN commit'],
  ['a probe OUTSIDE the tree can PASS through the wrong module system', 'a probe OUTSIDE the tree can PASS via the wrong module system'],
  ['an UNMET gate can prescribe a WRONG cure', 'UNMET gate can prescribe a WRONG cure'],
  ['gate closing on a FAILED ATTEMPT retires a live defect', 'gate closing on a FAILED ATTEMPT retires a defect'],
  ['a new script reds gate-caller under an INNOCENT name', 'new script reds gate-caller, INNOCENT name'],
  ['counting consumers ≠ verifying the one you EXEMPT', 'counting consumers ≠ verifying the EXEMPT one'],
  ['a violated conjunct may not OVERLAP the cure', 'violated conjunct may not OVERLAP the cure'],
  ['escalation in UNPARSED prose never reaches the desk', 'UNPARSED prose never reaches the desk'],
  ['an owner-ruling is inert until the refusing mechanism hears it', 'owner RULED, mechanism unheard'],
  ['a LADDER dep list is pessimistic', 'LADDER dep list is pessimistic'],
  ['re-run the RECIPE before obeying its GATE', 're-run the RECIPE before its GATE'],
  ['validate a predicate BOTH ways first', 'validate a predicate BOTH ways'],
  ['a PRECEDENT says what, re-measuring says WHY', 'PRECEDENT=what, re-measuring=WHY'],
  ['a walled gate can be the SLICE’S OWN DELIVERABLE', 'walled gate = the SLICE’S OWN DELIVERABLE'],
  ['a held RESIDUE set is several CLASSES', 'held RESIDUE = several CLASSES'],
  ['price an owner-ask by APPLYING its cure', 'price an owner-ask by APPLYING the cure'],
  ['a permanent home can be too NARROW', 'permanent home can be too NARROW'],
  ['a readiness column can measure a DIFFERENT GATE', 'readiness column can measure a DIFFERENT GATE'],
  ['a desk item can be UNANSWERABLE AS POSED', 'desk item UNANSWERABLE AS POSED'],
  ['a new master’s scope can duplicate a BLOCKED leaf’s', 'new master can duplicate a BLOCKED leaf'],
  ['a COPY-VERBATIM template can fail its own guard', 'COPY-VERBATIM template fails its own guard'],
  ['mechanising PROSE needs a NARROWER scope', 'mechanising PROSE needs NARROWER scope'],
  ['a cure to the GENERATOR never reaches its past output', 'a GENERATOR cure never reaches past output'],
  ['count revisions before blaming “drift”; rebuild BYTE-FOR-BYTE', 'count revisions before blaming “drift”'],
  ['self-QA ticks only its GIVEN boxes — LOOK at the image', 'self-QA ticks only its GIVEN boxes'],
  ['a STOP’s canary may not be a TEST', 'a STOP’s canary may not be a TEST'],
];

let hits = 0;
for (const [from, to] of SUBS) {
  if (s.includes(from)) { s = s.split(from).join(to); hits++; }
}

fs.writeFileSync(P, s);
const after = Buffer.byteLength(s);
const linksAfter = (s.match(/\]\([a-z0-9-]+\.md\)/g) || []).length;
console.log(`substitutions applied: ${hits}/${SUBS.length}`);
console.log(`bytes ${before} -> ${after}  (saved ${before - after})`);
console.log(`links ${linksBefore} -> ${linksAfter}  ${linksBefore === linksAfter ? 'ALL PRESERVED ✓' : 'LINK LOST ✗'}`);
console.log(`under 17.1KB (17510)? ${after < 17510 ? 'YES ✓' : 'NO — ' + (after - 17510) + ' over'}`);
