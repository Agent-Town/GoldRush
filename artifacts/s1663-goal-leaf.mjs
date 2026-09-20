import fs from 'node:fs';

const P = 'tasks/goals.json';
const lines = fs.readFileSync(P, 'utf8').split('\n');

// Anchor by CONTENT, never by coordinate: insert immediately before the leaf that
// currently follows f1660-1 in the AP/door subtree.
const anchor = lines.findIndex((l) => l.includes('"id": "f1587-2-cold-server-warm"'));
if (anchor < 0) throw new Error('REFUSE: anchor leaf not found');
const open = anchor - 1;
if (lines[open].trim() !== '{') throw new Error(`REFUSE: expected '{' above anchor, got: ${lines[open]}`);

const leaf = {
  id: 'f1662-2-audit-exemption-count',
  title: 'F-1662-2 + F-1662-3: derive the AP-16-4 admission counts instead of hardcoding them, name the two exemption populations apart, correct the one over-generalised exemption reason, and guard the generated report against its own data',
  status: 'planned',
  taskFile: 'f1662-2-audit-exemption-count.md',
  lane: 'lane-b',
  authoredBy: 's1663 (FIRE-AUTHORED, attended review welcome)',
  note: 'MASTER ALREADY AUTHORED AND COMMITTED s1663 - DO NOT RE-AUTHOR, DISPATCH IT (tasks/f1662-2-audit-exemption-count.md). Cures two non-blocking findings the s1662 drain filed and deliberately did not hand-tune. F-1662-2: scripts/same-game-audit.mjs:379 builds the AP-16-4 admission paragraph with interpolated leading numbers and a HARDCODED tail - "ten of those fifteen passed below and were admitted, leaving five cited exemptions" - while CONTRACT_ADMISSION_EXEMPTIONS now holds EIGHT entries after 7f006034a restored the three F-E2S-3 railcars. Re-verified s1663 by reading both artifacts rather than trusting the finding: src/sim/HeadlessContractSim.ts:57-90 lists 8, and docs/bench/same-game-audit.md says five at :27 and lists eight at :46-:53, twenty-six lines apart. THE SENTENCE IS AMBIGUOUS AND ONE READING IS STILL TRUE, which is why the drain refused to edit it: "five arising from that population of fifteen" holds (e3-fairground plus the four E5/E6 sockets), while "five cited exemptions in total" is now false. VERIFIED WHY THE RAILCARS ARE NOT IN THAT FIFTEEN rather than assuming it - the same report reads "equal 22 - divergence 5 - not-offered 15" AFTER the de-list regeneration (244253143 moved Final derived door 22 -> 19 and left that line untouched), and that is CORRECT, not stale: the three declare modes [escort], so per ap-16-same-game-law.md:33 they stay REACHABLE while being absent from the modeless derived door. Two populations, two correct numbers, one sentence conflating them. F-1662-3, folded in because it is the same surface: the three exemption reason strings are byte-identical claiming all three "reached the wave ceiling", but the pinned null-floor evidence (git keeps it at 73ae4929a) shows hill-mine and trestle at 18 waves/540000ms - the cap - and e2-incline terminating at wave 2 in ~80s on both seeds. The master orders the runner to MEASURE e2-incline through the existing boot.admissionProbe path and write what it measured, and to report rather than edit if the measurement also contradicts the other two. THE DURABLE HALF is a fast no-sim guard asserting (a) the report prose count equals its own Cited exemptions table row count and (b) that table equals CONTRACT_ADMISSION_EXEMPTIONS imported from source - (b) is what catches a STALE report, which (a) alone structurally cannot, and the master says so in advance so nobody deletes it as redundant. CLASS: F-1660-1s root was "a policy encoded as a comment evaporates when its data structure is derived"; this is its sibling - A COUNT ENCODED AS PROSE ROTS WHEN ITS TABLE GROWS. Both store a fact outside the structure that owns it, and both stayed green because nothing asserted the prose against the data.',
  gate: 'DISPATCH GATE, not an owner gate and not an authoring refusal - NOTHING IS OWED BY ROBIN OR BY AN ATTENDED SESSION. The master is written, committed and ready; the only precondition is SERIALISATION. Do not queue it while lane-a is running f1643-2, whose entire deliverable is a load-sensitive suite-red flake-rate snapshot: a second concurrent runner is the Mistake #12 shape and would contaminate a measurement that cannot be re-taken cheaply (F-1537-1, F-1270-1). Re-measured s1663 rather than inherited from s1662 - the run log 20260811-133510-lane-a-...-f1643-2 was still being written at 17:41 at progress 1,708/2,804, and lane-usable.mjs --all reads lane-a BUSY with 774 tracked-dirt. WHEN LANE-A IS DONE: lane-b was ahead=0 USABLE and 19 behind at authoring time, so follow the F-1424-3 dispatch order exactly - the master and this leaf are ALREADY committed (that is step 1, done), so refresh the lane SECOND, run the masters own STEP 1 citation greps THIRD, and cp into tasks/queue/lane-b/ LAST. The freshness key "F-1662-2 MASTER AUTHORED s1663" in tasks/BACKLOG.md returned exactly 1 on main at authoring time and proves the lane carries the authoring commit.',
};

const block = JSON.stringify(leaf, null, 2)
  .split('\n')
  .map((l) => ' '.repeat(12) + l);
block[block.length - 1] += ',';

lines.splice(open, 0, ...block);
fs.writeFileSync(P, lines.join('\n'));
console.log(`ok: spliced ${block.length} lines at ${open + 1}`);
