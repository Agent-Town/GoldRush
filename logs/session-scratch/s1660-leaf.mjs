import fs from 'node:fs';

const p = 'tasks/goals.json';
const lines = fs.readFileSync(p, 'utf8').split('\n');

// anchor: the f1605-1 leaf's id line, then find its closing brace at the same object depth
const idIdx = lines.findIndex((l) => l.includes('"id": "f1605-1-e2s3-door-delist"'));
if (idIdx < 0) throw new Error('anchor leaf not found');
const openIdx = idIdx - 1; // the "{" line
const baseIndent = lines[openIdx].match(/^\s*/)[0];
let closeIdx = -1;
for (let i = idIdx; i < lines.length; i++) {
  if (lines[i] === `${baseIndent}},` || lines[i] === `${baseIndent}}`) { closeIdx = i; break; }
}
if (closeIdx < 0) throw new Error('closing brace not found');
if (!lines[closeIdx].endsWith(',')) throw new Error('anchor is last element; insert shape differs — abort');

const leaf = {
  id: 'f1660-1-door-readmission-repair',
  title: "F-1660-1: restore the F-E2S-3 de-list as a CITED EXEMPTION after ap16-4's derivation silently re-admitted the three E2 railcars, and assert BOTH directions of the AP-16 mode rule so it cannot recur",
  status: 'planned',
  taskFile: 'f1660-1-door-readmission-repair.md',
  lane: 'lane-b',
  authoredBy: 's1660 (FIRE-AUTHORED, attended review welcome)',
  note: "Corrective for a REVERSAL, not new scope. The owner ruled F-E2S-3 on 2026-08-09 ('de-list now, socket later'); it shipped as f1605-1 at 312b443f1. 6f74bf510 (the ap16-4-same-game-admission runner commit, 2026-08-11T00:02, verified on main by git merge-base --is-ancestor) replaced the hand-maintained SUPPORTED_CONTRACTS literal with a derivation over a new CONTRACT_ADMISSION_EXEMPTIONS table; the four E5/E6 refusals and e3-fairground were carried across as cited entries and the three E2 railcars were NOT, so the derivation swept them back in. MEASURED LIVE s1660 rather than inferred: node scripts/gr-sim.mjs --contract=e2-hill-mine --seed=e2-hill-mine-01 --policy=idle runs a full contract and emits a view with NO mode supplied and no throw, and public/skill.md's public door fence lists all three again. ROOT: the ap16-4 master's baseline arithmetic counted the boot.mode escape hatch as admission ('Today's admitted 12 = the 9 ids in the literal + the 3 escort-mode railcars'), so the three never entered its own must-not-admit list and its measurement pass never attempted them - they were admitted BY OMISSION, never by measurement (the drain review's table lists the 10 measured candidates; the railcars are absent, while its 'Final derived door (22)' line names all three). The prior policy lived in a CODE COMMENT inside the literal, and a comment does not survive a derivation. WHY NOTHING REDDED: skillmd-guard asserts skill.md AGREES with SUPPORTED_CONTRACTS, so it is structurally incapable of seeing a policy reversal when both surfaces move together, and the three er01-e2-census arms that s1605 had flipped to assert the refusal were inverted back to assert admission in the same commit - in a file absent from the ap16-4 master's Touch-ONLY list and covered by its 'NO changes to existing e2e assertions in any spec other than the one you create'. THE RE-ADMISSION ALSO BREAKS AP-16-4's OWN RATIFIED LAW, checked before assuming the older ruling simply wins: specs/agent-play/ap-16-same-game-law.md:33 says 'Mode-declaring contracts (escort etc.) admit through their declared mode', and exactly 4 of 42 contracts declare modes (the three railcars plus e3-canyon-works, all [escort]). Because the gate is !SUPPORTED_CONTRACTS.has(id) && !mode && boot.admissionProbe !== true, membership makes the mode arm irrelevant - the three now admit with no mode at all, a strictly wider door than the law's own sentence. The de-list WAS the mechanism implementing that clause. HARM: F-E2S-3 proved e2-hill-mine is unsecurable headless by construction (no weapon touches the railcar; s1605 measured an idle rider surviving 18/18 waves to the ceiling exactly, endReason wave-ceiling), and public/skill.md is the PUBLIC door doc for BYO agents, so main currently advertises three unwinnable contracts to strangers. THE MASTER DOES NOT REVERT ap16-4 (a good slice with one omission), does not touch the constructor gate, and does not build the still-owed socket half. Its durable half asserts BOTH directions of the mode rule for every mode-declaring contract, derived from the registry so it cannot rot, with e3-canyon-works as a named cited exception since it is lawfully admitted modelessly and predates this affair; and it orders a BASELINE ratchet rather than a loop over the exemption table, because a loop's denominator moves with the defect - delete an entry and the loop stops checking it, which is exactly how this bug and its named ancestors (F-1536-1, F-1658-2, F-1659-2) were born.",
  gate: "none owed to the owner - this RESTORES his own explicit ruling of 2026-08-09 (BACKLOG grep key by CONTENT: 'F-E2S-3 RULED: de-list now, socket later'), which is the conservative direction, so it proceeds under fire.md 7.4 as a reversible act inside a ratified spec. VETO WINDOW recorded in the s1660 handoff: if the owner would rather the AP-16 admission law supersede the de-list and admit the railcars modelessly, the corrective becomes a measurement instead - but the door would then advertise an unwinnable contract until the socket half lands. F-E2S-3's SECOND master (the era-true pressure-to-damage socket) remains owed and still needs its census-stream slice specced first; it is explicitly out of this task's scope.",
};

const text = JSON.stringify(leaf, null, 2)
  .split('\n')
  .map((l) => baseIndent + l)
  .join('\n');

lines.splice(closeIdx + 1, 0, `${text},`);
fs.writeFileSync(p, lines.join('\n'));
console.log('inserted after line', closeIdx + 1, '| baseIndent', JSON.stringify(baseIndent));
JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('goals.json still parses OK');
