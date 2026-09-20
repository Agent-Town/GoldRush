import fs from 'node:fs';

const p = 'tasks/goals.json';
const raw = fs.readFileSync(p, 'utf8');
const g = JSON.parse(raw);

let found = null, arr = null, idx = -1;
const rec = (n) => {
  if (!n || typeof n !== 'object') return;
  for (const key of ['subgoals', 'tasks']) {
    if (Array.isArray(n[key])) {
      n[key].forEach((k, i) => { if (k && k.id === 'agent-rung-honest-gate') { found = k; arr = n[key]; idx = i; } });
      n[key].forEach(rec);
    }
  }
};
g.goals.forEach(rec);
if (!found) { console.error('NOT FOUND'); process.exit(1); }
if (arr.some((k) => k && k.id === 'agent-rung-honest-gate-v2')) { console.error('v2 ALREADY PRESENT — refusing to duplicate'); process.exit(1); }

found.status = 'superseded';
found.closureReason = 'SUPERSEDED s1292 by lane-c-agent-rung-honest-gate-v2.md. STOPPED LAWFULLY TWICE at its item-2 hard stop (s1219, s1291) with zero repo bytes changed both times; the second run cost 160,694 tokens to re-derive a conclusion already in the ledger. Root cause is NOT the runner: F-1292-2 — the owner RULING of 2026-07-30 authorized a RE-AUTHOR against the changed premise, and s1291 performed a RE-QUEUE of the unchanged v1 master instead, so v1 carried into a 15:35 run a NO list saying "auto_pan stays 3" (declared 2 since 85bb1938) and a MEASURED PREMISE saying place_building has no declared capability (declared 3 since 12b0011e). The runner caught both as premise drift and stopped correctly. Evidence: reviews/agent-rung-honest-gate-s1292.md.';

found.authorNotes = (found.authorNotes || '') + ' | ⚠️ CORRECTION s1292 — F-1292-1 — READ THIS BEFORE THE SENTENCE ABOVE THAT SAYS THE FOUR ASSERTION FAMILIES ARE CORRECT AND MUST NOT BE FIXED. That instruction is right for THREE of the four and WRONG for m4-01:164, and the error made the authorized re-author unwriteable. Re-derived at source s1292: 066-walk8:110, m4-05:105 twice, and m4-06:271/:336/:376 all drive pan_at at LEVEL 2 AND REQUIRE SUCCESS — under the ruled auto_pan:2 they stay green, correctly blessed. But m4-01:164 is NOT a pan-at-L2 assertion at all: it sits inside the LEVEL 0 matrix test — installAgentTools(page,0) at :148 — it REQUIRES FAILURE, and it asserts requiredLevel===1 for FOUR tools at once: pan_at, repair, chase_mark, place_building at :152-156. It encodes the hardcoded requiredLevel:1 — the defect itself — not the ruling, and under the ruling it is wrong for 2 of its 4 rows: pan becomes 2, build becomes 3. It is therefore simultaneously one of the assertions the item-2 STOP fires on AND on this must-not-touch list, so any author obeying this leaf literally could never pass item 2. PRIOR TEXT PRESERVED VERBATIM per the Retention Law — s1279 substance was right, it found a ruling no mechanism had heard, and three of its four rows are correct; this corrects one list member only.';

const v2 = {
  id: 'agent-rung-honest-gate-v2',
  title: 'Enforce the two RULED agent verb rungs — auto_pan L2, place_building L3 — in the tool-surface gate, leaving the two UNRULED rows (auto_repair, chase_mark) exactly where canon left them. Re-author of agent-rung-honest-gate against the owner ruling of 2026-07-30 (F-1218-1 cure, attempt 3 on a genuinely changed premise).',
  taskFile: 'lane-c-agent-rung-honest-gate-v2.md',
  status: 'queued',
  authorNotes: 'FIRE-AUTHORED s1292 under the owner RE-QUEUE AUTHORIZATION of 2026-07-30 (tasks/BACKLOG.md, the "OWNER RULINGS 2026-07-30 (blocker sweep)" row — cite by anchor text, the line number drifts): "ap-06b-panel-ladder-and-voice + agent-rung-honest-gate re-author against the ruling (changed premise per §5)". THE CHANGED PREMISE, in one line: v1 blanket STOP — "if enforcing declared rungs would change ANY green assertion" — is unsatisfiable, because one blocking assertion (m4-01:164) was itself on the must-not-touch list (F-1292-1); v2 narrows the stop to assertions OUTSIDE a pre-authorized five-site list, each site justified by the owner ruling that overruled it. RULED and enforced: auto_pan=2, place_building=3. UNRULED and firewalled: auto_repair stays 1 (F-1279-2 live on the owner desk; scripts/agent-rung-conformance.test.mjs:9-14 reds if moved, by design per F-1281-3) and chase_mark gets NO invented capability (F-1219-2 open half) — it keeps the gate default of 1. Blast radius measured at source s1292, not estimated: 5 blocking sites (m4-01:133/:164/:179, m4-05:257/:267), 3 pan-at-L2 families that must STAY green (066-walk8, m4-05, m4-06), and the debug stub is gated by the SAME call (AgentStub.ts:86 delegates to surface.tools.pan_at), so polish-03 and trail-guide are in radius and must be MEASURED rather than assumed. Evidence: reviews/agent-rung-honest-gate-s1292.md.',
  reviewFile: 'reviews/agent-rung-honest-gate-s1292.md',
};

arr.splice(idx + 1, 0, v2);

// Preserve the file's existing indentation style (2-space, trailing newline).
fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('OK: v1 superseded, v2 inserted at idx ' + (idx + 1));
