// s1619 late update: prepend a LATE UPDATE clause to the (already CLEARED) handoff line-1.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'STATUS.md';
const text = readFileSync(p, 'utf8');
const nl = text.indexOf('\n');
const line1 = text.slice(0, nl);
const rest = text.slice(nl + 1);
const marker = 'Last updated: 2026-08-10T07:56Z s1619 handoff, lock CLEARED — ';
if (!line1.startsWith(marker)) { console.error('LINE 1 NOT MY HANDOFF'); process.exit(2); }

const late = [
  '⏭️ **LATE UPDATE (08:0x, after this handoff was written and pushed): `minds-and-rigs` HAS FINISHED on lane-b and is READY TO DRAIN — it is priority (A) below, ahead of my own two.** ',
  '`lane-usable lane-b` reads `ahead=1 · paths=8 · tracked-dirt=0`, **HOLDS real LANE-ONLY content** (`e2e/field-book.spec.ts`, 98 of 132 added lines absent from main; done-move `20260810-073317-lane-minds-and-rigs.md` is unprefixed and genuine, not residue). ',
  '⚠️ **It is ATTENDED-AUTHORED** (`0aba28806`, Cowork orchestrator, owner directive on model/harness aggregate stats) — so check whether that session drains it itself before you start; if it is still sitting, drain it normally, its dirt is runner output. ',
  '🚫 **I did NOT gate it, deliberately.** I was ~35 minutes in with the handoff committed and the backup pushed; a full gate battery started at that point is the rushed gate s1617 named when it left `f1617-1` for the next fire — *"I stopped rather than gate it over-budget at the end of a fire, which is how rushed gates happen."* **Nothing is lost: the lane is committed, clean and 27 behind, and the work is safe until someone drains it.** ',
].join('');

writeFileSync(p, marker + late + line1.slice(marker.length) + '\n' + rest);
console.log('late update prepended');
