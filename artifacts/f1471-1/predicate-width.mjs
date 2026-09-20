// F-1471-1 evidence — s1484. Re-derivable: `node artifacts/f1471-1/predicate-width.mjs`
//
// The cure is a one-token widening of a disjunct at two mirrored sites:
//   OLD:  objectiveAllowsSecure = !twist.powerGrid          || canyonConnectCompletedByDeadline
//   NEW:  objectiveAllowsSecure = !twist.powerGrid?.connect || canyonConnectCompletedByDeadline
//
// Two things must be shown, and a passing spec suite shows NEITHER of them:
//   (1) NO REGRESSION — old and new agree on every contract that exists today.
//   (2) THE CURE CURES — on the shape F-1471-1 names as the trigger, old soft-locks and new does not.
// (2) is only visible by MANUFACTURING the trigger, because the trigger has no instance on main
// (measured this fire: 42 contracts, 3 with powerGrid, trigger set = 0).
//
// Load-bearing fact behind the whole finding, verified by reading both files this fire:
// `canyonConnectCompletedByDeadline` is written true in exactly one place per engine
// (Game.ts:5928, HeadlessContractSim.ts:785) and both are gated on `connect` —
// Game.ts:5925 `if (!grid?.connect || !connect) return;` and
// HeadlessContractSim.ts:768 `if (!grid?.connect || !this.powerGraph) return null;`.
// So for a powerGrid WITHOUT connect the flag can never become true.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OLD = (twist, flag) => !twist.powerGrid || flag;
const NEW = (twist, flag) => !twist.powerGrid?.connect || flag;

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.json')) out.push(p);
  }
  return out;
}
function contractsIn(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.contracts)) return json.contracts;
  if (json && typeof json === 'object' && json.twist) return [json];
  return [];
}

const live = [];
for (const file of walk('assets/contracts')) {
  let json;
  try { json = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  for (const c of contractsIn(json)) if (c?.twist && typeof c.twist === 'object') live.push(c);
}

// ---- (1) NO REGRESSION over the live corpus -------------------------------------------------
// The flag is a runtime value, so both of its states are enumerated for every contract.
let disagreements = 0;
for (const c of live) {
  for (const flag of [false, true]) {
    if (OLD(c.twist, flag) !== NEW(c.twist, flag)) {
      const reachable = !!c.twist.baron; // the expression sits behind `if (!baron) return;`
      disagreements++;
      console.log(
        `  differs: ${String(c.id).padEnd(24)} flag=${String(flag).padEnd(5)} ` +
        `old=${OLD(c.twist, flag)} new=${NEW(c.twist, flag)} baron=${c.twist.baron ? 'true' : 'false'}` +
        `${reachable ? '  ⚠️ REACHABLE — this would be a behaviour change' : '  (unreachable: baron:false)'}`,
      );
    }
  }
}
console.log(`(1) live corpus: ${live.length} contracts × 2 flag states = ${live.length * 2} evaluations`);
console.log(`    reachable behaviour changes: ${
  live.filter(c => c.twist.baron && OLD(c.twist, false) !== NEW(c.twist, false)).length
}   (expected 0 — the cure must be inert on everything that ships today)`);
console.log(`    unreachable differences:     ${disagreements}   (baron:false contracts; recorded, not a change)`);

// ---- (2) THE CURE CURES on the manufactured trigger ------------------------------------------
// F-1471-1's own words: "the first contract authored with powerGrid + baron + NO connect".
const TRIGGER = {
  id: 'MANUFACTURED-trigger-not-shipped',
  twist: {
    baron: { wave: 14, variantId: 'test_baron' },
    powerGrid: { maxSpanLength: 6, nodes: [], wires: [] }, // no `connect` key — the whole point
  },
};
// The flag is pinned false because no writer can ever set it for this shape (see header).
const flag = false;
const oldVerdict = OLD(TRIGGER.twist, flag);
const newVerdict = NEW(TRIGGER.twist, flag);
console.log(`\n(2) manufactured trigger (powerGrid + baron + NO connect), flag pinned false:`);
console.log(`    OLD objectiveAllowsSecure = ${oldVerdict}  -> secured stays false -> baronBeaten reset -> SOFT-LOCK`);
console.log(`    NEW objectiveAllowsSecure = ${newVerdict}   -> the run secures normally`);

const ok = oldVerdict === false && newVerdict === true
  && live.filter(c => c.twist.baron && OLD(c.twist, false) !== NEW(c.twist, false)).length === 0;
console.log(`\nVERDICT: ${ok ? 'PASS — cure is inert on all shipped contracts AND fixes the manufactured trigger' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
