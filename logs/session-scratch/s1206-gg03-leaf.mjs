// s1206 — register the GG-03 leaf beside its GG-01/GG-02 siblings.
// GOAL REGISTRATION LAW: every authored master adds its leaf in the SAME commit.
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'tasks/goals.json';
const goals = JSON.parse(readFileSync(PATH, 'utf8'));

// Find the parent that already holds gg-01/gg-02 so the rung lands beside its siblings.
let parent = null;
let sibling = null;
(function walk(node) {
  if (Array.isArray(node)) { node.forEach(walk); return; }
  if (!node || typeof node !== 'object') return;
  for (const key of ['goals', 'subgoals', 'tasks', 'children']) {
    if (!node[key]) continue;
    if (Array.isArray(node[key])) {
      const found = node[key].find((child) => child && child.id === 'gg-02-greenhorn-gazette-art');
      if (found) { parent = node[key]; sibling = found; }
    }
    walk(node[key]);
  }
})(goals.goals);

if (!parent) throw new Error('could not locate the gg-02 sibling array');
if (parent.some((child) => child.id === 'gg-03-gazette-panel-swap')) throw new Error('gg-03 leaf already exists — refusing to duplicate (Mistake #5)');

const leaf = {
  id: 'gg-03-gazette-panel-swap',
  title: "Gazette — swap the reserved art slots for the GG-02 plates",
  taskFile: 'lane-gg-03-gazette-panel-swap.md',
  status: 'queued',
  lane: 'lane-d',
  authoredBy: 's1206 fire',
  spec: "specs/greenhorn-gazette/README.md; predecessors reviews/gazette-first-issue.md (GG-01 97c6a257) and reviews/art-gazette-first-issue.md (GG-02 8dff01fb); technique precedent reviews/gazette-art-wiring.md + reviews/gazette-art-wiring-hardening.md; subjects src/news/heraldReader.ts:148-156 (the 'Engraving reserved' placeholder) and scripts/asset-diet.mjs:12,:58,:87-90,:116,:123",
  authorNotes: [
    "FIRE-AUTHORED s1206. THE GATE WAS NAMED IN ADVANCE AND IS NOW SATISFIED: BACKLOG:1727 set the ladder as 'GG-03 swap = ladder after both', and both halves are on main — GG-01 wiring 97c6a257 (which deliberately left the slots empty) and GG-02 art 8dff01fb (whose extraction and wiring the s1205 drain correctly withheld as reference-tier/full-bleed/no-#ff00ff).",
    "EVERY PREMISE RE-DERIVED AT SOURCE BY THE AUTHORING FIRE, NOT INHERITED. (1) The placeholder is real: heraldReader.ts:151 is literally '<div class=\"claim-herald__art-slot\" aria-hidden=\"true\">Engraving reserved</div>'. (2) The mapping needs no invention: FIRST_ISSUE_PANELS (:20-68) declares claim-goal / seams-gold / the-works / the-arms / freeing-fevered / town-serves, and assets/raw/ holds gazette-panel-<id>.png for all six, one-for-one. (3) A shipped technique already exists to copy — renderItem (:158-167) + HERALD_ENGRAVINGS (:10-18).",
    "THE MEASUREMENT THAT SHAPED THE TASK (PNG IHDR, measured not guessed): the six panels are 1672x941 at 3.16-3.71 MB, which the EXISTING plate selector asset-diet.mjs:58 already catches, so they inherit the 87% cut for free — but gazette-masthead.png is 1983x793 / 3.10 MB and MATCHES NO BRANCH AT ALL, neither the plate tier nor the 1024-square tier, so an eager import ships it unoptimized.",
    "THIS IS F-1186-1 ARRIVING EXACTLY WHEN IT SAID IT WOULD. That finding closed the GAZETTE-ART ladder with the rider that asset-diet's resize (:88) and budget (:116) both key on the literal basename substring 'herald-engraving-', so 'a cut named otherwise escapes both silently; fix belongs with the eighth cut, not before.' The gazette plates are named gazette-panel-* / gazette-masthead, so they sit OUTSIDE the existing ceiling's denominator entirely — the budget that exists cannot see them. F-1184-1 is why that matters: the herald cuts measured 16,492,796 B naive -> 281,444 B.",
    "SCOPE 1 IS A MEASURE-FIRST STOP GATE that can cancel or reshape the work, and 1c explicitly licenses the runner to conclude the masthead should not ship at all — a merged art file can be unreachable, so the consumer is to be verified rather than the filename. SCOPE 4.1 IS THE LOAD-BEARING CONTROL: the new naturalWidth assertion must be shown to SEPARATE from the weaker src-contains one (F-1185-2's gap, which F-1185-3's control demonstrated rather than argued), and STOP if it cannot.",
    "TWO OWNER NOTES CARRIED BUT NOT ACTIONED, both 🔻 low and on the owner's desk: F-1205-7 (the helping hand in panel 5 is a human arm, not the Prospector's brass one — the owner wanted an eyeball at GG-03 before it is captioned as the player's action) and F-1205-8 (panel 4 frames combat as a target range; ADR-001 clean but never explicitly ratified).",
    "LANE SAFETY PRE-PROVED BY CONTENT: lane/perf is 1 ahead of main and is a FALSE-AHEAD SAFE DUPE — 641140f6's cure is already on main (both collection guards carry the truncation guard and mkdtemp file-backed capture), the two-dot diff's only addition is a task-master copy, the rest is phantom deletions from a stale base, and worktrees/lane-d is clean. The master still orders the runner to re-verify before resetting, per the LANE-SAFETY LAW that w1-03 and polish-02 died to.",
  ].join(' '),
};

parent.push(leaf);
writeFileSync(PATH, `${JSON.stringify(goals, null, 1)}\n`);
console.log('registered gg-03-gazette-panel-swap beside', sibling.id, '— siblings now:', parent.map((c) => c.id).join(', '));
