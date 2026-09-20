import fs from 'node:fs';

const p = 'tasks/goals.json';

const BLOCKS = {
  'jumper-8way-wiring': {
    class: 'owner-gated',
    finding: 'F-1661-1',
    measuredBy: 's1661 2026-08-11',
    reason:
      "MASTER IS BANKED AND LOOKS READY, BUT ITS OWN SEQUENCING GATE IS UNMET - DO NOT QUEUE. tasks/lane-c-jumper-8way-wiring.md exists on disk (authored 2026-08-11 under the owner's F-1166-1 ruling (b), verbatim \"this is not too much to do, lets fix things when we can\") and its line 5 is a hard gate: assets/LEDGER.md's `char.claim_jumper SHEET full-ROTATION` row must say the batch-007 regen is PROCESSED with scale-debt CLEARED and measured heights in the 409-439 band, else STOP \"art not landed\" (activating on the old cells ships the visible size pop s39 rejected). READ s1661 rather than inferred: that row (assets/LEDGER.md:31) says the OPPOSITE - \"s1656 (2026-08-11) - batch-007 GENERATED + EXTRACTED FIRE-SIDE + MEASURED; SCALE DEBT NOT CLEARED, NOT WIRED (F-1656-3)\", measured effective heights 336-407px = 65.6-79.5% of cell so the >=78% acceptance law is met by 1 of 12 cells, and scripts/extract-alpha.mjs never upscales (computed scale 1.082 capped at 1, per the s39 ruling) so the shortfall cannot be closed downstream. Worse for activation: walk8 is RUNTIME-ACTIVE at 227-327px, so rotation2 would run ~25% TALLER than the sheet the jumper actually uses - the same size pop in the opposite direction. THE TRAP THIS BLOCK EXISTS TO STOP, and it is a live one: the art half DID drain today (tasks/done/drained-961043c7-20260811-114616-art-jumper-rotation-regen.md, 11:46), so a fire pattern-matching \"the art gate is the regen, and the regen drained\" would queue this and burn a lane dispatch plus Codex tokens on a master engineered to stop at its fifth line. DRAINING THE REGEN AND CLEARING THE SCALE DEBT ARE DIFFERENT FACTS; only the LEDGER row can tell them apart, and it is one grep. NO NEW DESK ITEM IS OWED: F-1656-3 is already on the owner's desk awaiting one of three words (accept as-is / retake at >=460px raw / declare the rotation sheet legacy - LEDGER:33 records that the walk4 A/B sheets already cleared this same debt). UNBLOCKS THE MOMENT that row clears; the master needs no re-authoring, only a re-read of its own gate.",
  },
  'ap-04-teach': {
    class: 'needs-spec',
    finding: 'F-1661-2',
    measuredBy: 's1661 2026-08-11',
    reason:
      "NOT fire-authorable: NO SPEC SLICE EXISTS, and half the named deliverable already shipped under another slice. (1) NO SLICE: grep -rln for \"Teach Mode|TEACH MODE|teach-mode\" across specs/ docs/ src/ e2e/ matches exactly ONE file - specs/agent-play/README.md - where AP-04 is a single design sentence at :31 with no laws section, no numbered slices, no playable checkpoint and no gate. scripts/fire.md 2E's HARD LIMIT refuses precisely this shape (\"if the lane's next work has no spec slice, needs a design fork, or bends canon, do NOT author\"). (2) THE TRAP s1660 NAMED, CHECKED BEFORE SPENDING THE BUDGET: the \"trust ladder (suggest -> approve -> routine)\" half ALREADY SHIPS - src/agent/PermissionLadder.ts declares AGENT_PERMISSION_LABELS 0..3 as suggest-only / approval-required / trusted-routine / autonomous-within-budget, the exact rungs README:7 names when it says \"the in-game trust ladder IS the agent-play UX, already owner-approved by play\". So this leaf, like AP-03 before it (F-1650-1), reports as unbuilt a thing that is half-built, which is what keeps re-advertising it as a free authoring slot. (3) THE REMAINING HALF IS A MISSING DESIGN, NOT A MISSING DEPENDENCY: what is left is DISTILLATION - tape into playbook graph - and the spec assigns that design TO this slice instead of supplying it (README:117 \"distillation rides AP-04\"; README:116 \"a strong human tape distills into a draft playbook - the tape is the demonstration; the graph is the distillation\"). Every substrate it would need is already merged (TAPE-01 at 0ef80c1b, TAPE-02 lantern show, PB-01/02 intent capture + replay actor, PB-03/04 library + corruption), so nothing is blocking it except the absent spec. AP-10b sketches a LESSON FORMAT (tape + graftable sub-graph + transfer receipt) but its own STATUS reads \"BANKED post-launch (V2+ with the press). No slices yet\". ATTENDED ACT OWED: write the AP-04 slice - what a distillation emits, what makes a draft playbook acceptable, and what the playable checkpoint is. NOTE the 2026-08-09 re-greenlight (\"Greenlight all three\") lifted the REHEARSAL gate only; it did not supply a spec, and the leaf's own title names \"its own spec\" as the residual gate.",
  },
  'ap-05-publish': {
    class: 'owner-gated',
    finding: 'F-1661-3',
    measuredBy: 's1661 2026-08-11',
    reason:
      "NOT fire-authorable: both remaining gates sit outside a fire, and the leaf's own \"may be authored but not published\" reading has no buildable scope behind it today. (1) PUBLICATION IS OWNER LAW TWICE OVER: specs/agent-play/README.md Law 4 - \"publishing anything is owner-gated law\" - and README:70 - \"package publication to the Environments Hub is OWNER-GATED (AP-05 family - public artifact)\"; CLAUDE.md 7.3 independently routes \"publishing anything\" to the owner. NO NEW DESK ITEM IS OWED: the spec's own batched ratification question Q2 (\"Publish timing: after E2-Steamworks or with it?\") IS this question, already recorded at the spec's foot, so raising it again would duplicate a standing item rather than add one. (2) THE ADAPTER HALF IS NOT BUILDABLE YET: the deliverable is \"the rider harness as an Agent-Town repo with adapters (Claude Code native; OpenClaw/Hermes/Milady via the protocol)\", and those adapters ride AP-03's Transport B RIDER-API, which F-1650-1 (s1650) measured as AP-03's ONLY unbuilt half and which the spec itself marks an open design question (\"minimum viable tick-tolerance for a ~1Hz agent\"). Authoring adapters against a transport that does not exist is inventing scope. (3) AP-05 also has NO spec slice - README:32 is one sentence. WHAT DOES EXIST, stated so this refusal is not overstated: the harness itself is real (rehearsal/, the drive-grammar-proven AP-01 rig) and extracting it as a package is a coherent piece of work in principle. What is missing is a scope that DELIVERS anything: extraction without adapters and without publication ships nothing a user can run, so a fire authoring it would produce an inert package and a gate it cannot pass. Measured s1661.",
  },
};

const lines = fs.readFileSync(p, 'utf8').split('\n');
let inserted = 0;

for (const [id, block] of Object.entries(BLOCKS)) {
  const idIdx = lines.findIndex((l) => l.trim() === `"id": "${id}",` || l.trim() === `"id": "${id}"`);
  if (idIdx < 0) throw new Error(`leaf not found: ${id}`);
  if (!lines[idIdx].trim().endsWith(',')) throw new Error(`${id}: id is last key; insert shape differs - abort`);
  const indent = lines[idIdx].match(/^\s*/)[0];
  const text = JSON.stringify({ authoringBlock: block }, null, 2)
    .split('\n')
    .slice(1, -1) // drop the wrapper braces
    .map((l) => indent + l.slice(2))
    .join('\n');
  lines.splice(idIdx + 1, 0, `${text},`);
  inserted++;
  console.log(`inserted authoringBlock for ${id} after line ${idIdx + 1}`);
}

fs.writeFileSync(p, lines.join('\n'));
const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
console.log(`goals.json still parses OK; ${inserted} blocks inserted`);
