import fs from 'node:fs';

const p = 'tasks/goals.json';

const BLOCKS = {
  'bt-04-homestead-automation': {
    class: 'attended-owed',
    finding: 'F-1661-4',
    measuredBy: 's1661 2026-08-11',
    reason:
      "NOT fire-authorable: the BLOCK is lifted but the PARAMETERS are missing, and a fire may not invent them. Stated first because the legacy blockedReason prose below opens with the word UNBLOCKED and the instrument prints only its head. The owner's 2026-08-09 roundup greenlit the PROGRAM (\"blocked trio ALL GREENLIT ... bt-04 -> planned\", 9264046eb) and that is a decision to PROCEED, not a set of values: it names no X for \"auto-repair under X%\", no definition of \"idle\" for auto-pan, no ruling on the building-tiers Law 4 balance question (an autonomous gold engine), and nothing on the autoPan NAME COLLISION with the shipped E2 pressure-arsenal mechanic at src/game/Balance.ts:291. The declaring row in tasks/BACKLOG.md (CITE BY CONTENT: grep \"bt-04-homestead-automation\" and read its GATE (RESTATED)) says exactly this and names the next act: \"put the four forks to Robin as four concrete questions with recommendations - the program is already greenlit, so only the numbers are missing\", marked ATTENDED, NOT FIRE. Any BT-04 slice must either avoid forks (1)-(4) entirely or carry the owner's values for the ones it touches; measured s1661, the four forks between them cover the whole of BT-04's scope (repair threshold, idle semantics, balance ruling, endless-mode session spine), so there is no fork-free sub-slice to author. WHAT IS NOT BLOCKING, so the refusal is not overstated: the abilities themselves already ship as permission-ladder grants - src/agent/AgentConsent.ts:11-17 carries auto_collect (level 1), auto_repair (level 1) and auto_pan (level 2). The owner is not being asked to authorise new abilities; he is being asked for numbers on top of granted booleans (abilities is a Record<AgentAbility, boolean>, so no numeric threshold exists anywhere in the surface yet). ATTENDED ACT OWED: put the four questions with recommendations.",
  },
  'e3-fairground-socket': {
    class: 'attended-owed',
    finding: 'F-1661-4',
    measuredBy: 's1661 2026-08-11',
    reason:
      "NOT fire-authorable: the owner gate closed, but the residual is owed by the ATTENDED SESSION and the actor change is the whole point. Stated first because the legacy blockedReason prose below opens with the word UNBLOCKED and the instrument prints only its head. The 2026-08-09 roundup's own words carry the caveat: \"blocked trio ALL GREENLIT (rf-34 + e3-fairground-socket + bt-04 -> planned; FAIRGROUND NEEDS THE ATTENDED ENGINE SLICE - owed by the attended session, next working pass)\" (9264046eb). Until that diagnostics-path engine slice lands (F-1475-1 recommendation (c): a diagnostics-only path that is explicitly NOT an admission), the HeadlessContractSim door still refuses e3-fairground, so any master built on a fairground socket is JOINTLY UNSATISFIABLE - it would ask a runner to prove a thing the door forbids. DO NOT RE-QUEUE THE EXISTING MASTER: tasks/lane-e3-fairground-socket.md burned 124,606 tokens, and fire.md 7.5's \"third attempt only with a CHANGED premise\" is not satisfied - the greenlight is a changed premise for AUTHORING A NEW CONSTRUCTION PATH, never a licence to re-run the master that failed. EXTRA TIMING HAZARD, live as of s1661 and stated because it decays: lane-b is currently running f1660-1-door-readmission-repair, which edits the exact admission surface any fairground socket would touch (CONTRACT_ADMISSION_EXEMPTIONS in src/sim/HeadlessContractSim.ts, public/skill.md, e2e/er01-e2-census.spec.ts). Even were this authorable, queueing it against a live writer on the same files is the Mistake #12 shape. ATTENDED ACT OWED: the engine slice; only then is a fairground socket master re-authorable.",
  },
};

const lines = fs.readFileSync(p, 'utf8').split('\n');

for (const [id, block] of Object.entries(BLOCKS)) {
  const idIdx = lines.findIndex((l) => l.trim() === `"id": "${id}",`);
  if (idIdx < 0) throw new Error(`leaf not found: ${id}`);
  const indent = lines[idIdx].match(/^\s*/)[0];
  const text = JSON.stringify({ authoringBlock: block }, null, 2)
    .split('\n')
    .slice(1, -1)
    .map((l) => indent + l.slice(2))
    .join('\n');
  lines.splice(idIdx + 1, 0, `${text},`);
  console.log(`inserted authoringBlock for ${id} after line ${idIdx + 1}`);
}

fs.writeFileSync(p, lines.join('\n'));
JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('goals.json still parses OK');
