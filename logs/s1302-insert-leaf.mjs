import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/goals.json';
const raw = readFileSync(p, 'utf8');
const L = raw.split('\n');

// Anchor: the closing brace of the predecessor leaf 066-walk8-hero-expectation-realign.
const anchorIdx = 3530; // 0-based -> file line 3531
if (!/^        \},?$/.test(L[anchorIdx])) {
  console.error('ANCHOR MISMATCH: ' + JSON.stringify(L[anchorIdx]));
  process.exit(1);
}

const leaf = {
  id: '066-jumper-cadence-realign',
  title:
    'F-1302-1: the Claim Jumper cadence test (066-walk8-engine:208) has FOUR stale assertions, not the one line the ledger advertised. :220/:222 were migrated to char.bandit_base by an earlier repair but the assertions below them were not, so :234 still expects char-jumper-sheet-walk8- and receives char-bandit-base-sheet-walk8-r2c0.png; correcting only that string then reds :235 (fps 7.60 vs 8.55), :236 (14.0488 vs 17.1) and :237 (stride 2.8421 vs hero 3.0750). :238 already passes to four decimals and must not be touched. Test-side realign, zero src/.',
  taskFile: 'lane-b-066-jumper-cadence-realign.md',
  status: 'planned',
  lane: 'lane-b',
  spec:
    'tasks/BACKLOG.md F-1302-1 (measured this fire); subjects e2e/066-walk8-engine.spec.ts:208-240; mechanism src/entities/pools.ts:236 + src/assets/SpriteAnimator.ts:590-607,:630-634,:1091-1094 + src/game/Balance.ts:985-990; predecessor leaf 066-walk8-hero-expectation-realign (merged 639df50b700c) whose own note mis-attributed :234 to the owner-gated F-1166-1 fork',
  authoredBy: 's1302 fire',
  authorNotes:
    'AUTHORED AND QUEUED SAME FIRE to lane-b (lane-usable.mjs: USABLE, ahead=0 paths=0 dirt=0). MEASURED, NOT INHERITED: I ran the test, then corrected ONLY the frame-key string and ran it again, which is how the three downstream reds became visible at all - they had not executed since 2026-07-12. Probe reverted via git checkout, git status -- e2e/ EMPTY before authoring. THE LEDGER WAS WRONG IN BOTH DIRECTIONS AND THAT IS THE POINT: F-1294-2 called this fire-authorable as a scoped test repair (too small - it is four assertions and one of them is unsatisfiable as written), while this leaf predecessor note called :234 the owner-gated F-1166-1 jumper sheet-family fork (too large - :234 names the sheet of char.bandit_base, the slot the runtime actually mounts, and is fork-independent because BOTH arms of F-1166-1 leave that sheet name alone). The second mislabel is why nobody touched it for 19 days. RECONCILED AGAINST SOURCE so the engine is provably not on trial: pools.ts:236 pins stride-per-cycle to strideUnits*visualScale (2.05*1.5=3.075, the same product s1181 derived independently) by cancelling the speed terms, which is why :238 passes exactly; the slow arm scripts groundSpeed 2.7, BELOW the walkMinFps knee at 7.6*3.075/8 = 2.921, so the floor engages (3.8*2 = 7.60 measured) and stride preservation is intentionally suspended. Hence scope 4 re-aims :237 at the floor rather than re-baselining it to 2.8421, which would turn a law into a rubber stamp. FIREWALL: all src/** forbidden with a STOP instruction (the engine is not on trial); char.claim_jumper forbidden outright (owner-gated F-1166-1, 025 DO-NOT-QUEUE); vp-02b-rotation-resolver.spec.ts:286 forbidden because it is green and asserts the OLD jumper diagnostics shape. Scope 5 is report-only: SpriteAnimator.ts:623-628 walkSpeedForSlot() still names charClaimJumper/charBaron and never the bandit slots, but I counted every consumer and it is INERT - pools.ts:836/838/857 pass a finite speed each frame and :624 short-circuits on walkCadenceSpeed before reaching the slot list. Routed to lane-b because lane-a held a LIVE run (lane-mechanics-manifest, 21:51:32) at authoring time.',
};

// Serialise at the file's existing depth (8 spaces for the object, 10 for its keys).
const body = JSON.stringify(leaf, null, 2)
  .split('\n')
  .map((line) => '        ' + line)
  .join('\n');

L.splice(anchorIdx + 1, 0, body + ',');
const out = L.join('\n');
JSON.parse(out); // fail loudly rather than write invalid JSON
writeFileSync(p, out);
console.log('inserted + JSON valid');
