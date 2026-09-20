// HEAT 13 CHARTER GENERATOR — operator tooling. Renders one rig's charter for one contract from
// TASK-TEMPLATE.md's shape (read skill.md · secure contract X on seed Y · no network · outcome file ·
// the intermediate-results law · stop rule) plus the heat-12 specifics (era notice, the stake — never
// claimed, or mechanic changed under the old receipt — the report sections the operator copies
// verbatim, the rig's OWN notebook verbatim = diet class self-memory). It never contains strategy.
//
// ADAPTED FROM HEAT 11: the heat-11 AUDIT table (a 2026-09-02 snapshot) is REPLACED by the county's
// own era-pin record — `assets/engine-era.json`, which the rider can read in this arena — because
// thirteen maps changed their mechanic after that audit, so quoting it would hand the rider a stale
// map. Every WHAT-CHANGED line below is the `cause` prose of a real pin, quoted, not inferred.
//
// usage: node make-charter.mjs --rig=opus --contract=<id> --seed=<seed|default> --generation=<n>
//                              --engineHash=<hex> --harnessVersion=<v> --workdir=<abs dir> --out=<file>
//                              [--stake=never-claimed|mechanic-changed|stale-receipt] [--wall=1500]
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['rig', 'contract', 'seed', 'generation', 'engineHash', 'harnessVersion', 'workdir', 'out']) if (!args[key]) throw new Error(`--${key} required`);

const RIGS = {
  opus: { model: 'claude-opus-5', name: 'Claude Opus 5', slug: 'opus-5' },
  fable: { model: 'claude-fable-5', name: 'Claude Fable 5', slug: 'fable-5' },
};
const rig = RIGS[args.rig];
if (!rig) throw new Error(`unknown rig ${args.rig}`);
const notebookPath = `${process.env.HOME}/Claude/Projects/goldrush-gauntlet/memories/claude__${rig.slug}/NOTEBOOK.md`;
const notebook = readFileSync(notebookPath, 'utf8');
const notebookSha = createHash('sha256').update(notebook).digest('hex');

// What the county's OWN era-pin ledger says changed on this map since its last receipt.
// Source: assets/engine-era.json `pins[].cause`, quoted (trimmed), 2026-09-03 .. 2026-09-05.
// HEAT 13: every map on the board changed the same way on the same day, so the per-map
// mechanic table of heat 12 is replaced by ONE entry that applies to all of them — the county's
// own era-pin prose for `rider-parity-grammar`, quoted. Maps that ALSO carry a mechanic pin keep
// their heat-12 line appended after it.
const GRAMMAR_PIN = 'rider-parity-grammar, all stages (ADR-005; owner A2 + D1 "fairness is crucial" + D2 "re-ride it yes", 2026-09-07): "the nine ACTION reach tests read the hero, REPAIR_UNDER bounded to the human radius, the E5 deck a plain-boot human control, MOVE_TO/HOLD/FALLBACK_IF removed with 57 tapes / 22 scored heat-12 rows retired in the ledger, CONTEXT_ACTION\u2019s four human-only targets given to the rider, syncProgramSuspension and the E8 crossing chip re-based to the hero; the controls table reads 15 equal / 0 agent-only / 0 human-richer".';
const CHANGED = {
  'e3-moth-season': 'Also: the e3-moth-season drain (de21da4f5) "rewrites the Moth Season contract row \u2014 the sabotageable light circuit as contract data".',
  'e7-relay-valley': 'Also: e7-playbook-rows (b38d60295) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; E7PlaybookLatch.ts is the one four-rule secure decision.',
  'e7-relay-rush': 'Also: e7-playbook-rows (b38d60295) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; E7PlaybookLatch.ts is the one four-rule secure decision.',
  'e7-echo-canyon': 'Also: e7-playbook-rows (b38d60295) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; E7PlaybookLatch.ts is the one four-rule secure decision.',
  'e7-dead-band': 'Also: e7-playbook-rows (b38d60295) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; E7PlaybookLatch.ts is the one four-rule secure decision.',
  'e5-stillwater': 'Also: e5-stillwater-front-crew-2 "crews Stillwater\u2019s 32-second storm with one existing corsair skiff".',
  'e8-mare-claim': 'Also: e8-mare-claim-physics (a121c7f14) "composes E8PhysicsSystem headless for contracts declaring gravity/atmosphere".',
  'e8-far-side': 'Also: e8-remaining-maps "composes E8SuitAirSystem into the headless door for e8-far-side, e8-low-orbit and e8-eclipse".',
  'e8-low-orbit': 'Also: e8-remaining-maps "composes E8SuitAirSystem into the headless door for e8-far-side, e8-low-orbit and e8-eclipse"; and low-orbit-second-build-line landed on this same evening chain.',
  'e8-eclipse': 'Also: e8-remaining-maps "composes E8SuitAirSystem into the headless door for e8-far-side, e8-low-orbit and e8-eclipse".',
  'e4-long-road': 'Also: e4-roads-and-convoys (48ef7df8d) + e4-vehicles-plain-boot (98cc0fc2f) compose MotorSocket and Vehicle/FuelSystem for every twist.motorFrontier contract.',
  'e4-dust-flats': 'Also: e4-roads-and-convoys (48ef7df8d) + e4-vehicles-plain-boot (98cc0fc2f) compose MotorSocket and Vehicle/FuelSystem for every twist.motorFrontier contract.',
  'e4-boneyard': 'Also: e4-roads-and-convoys (48ef7df8d) + e4-vehicles-plain-boot (98cc0fc2f) compose MotorSocket and Vehicle/FuelSystem for every twist.motorFrontier contract.',
  'e4-gusher-county': 'Also: e4-roads-and-convoys (48ef7df8d) + e4-vehicles-plain-boot (98cc0fc2f) compose MotorSocket and Vehicle/FuelSystem for every twist.motorFrontier contract.',
};
const ERA_MECHANIC = {
  1: 'E1 survival and the bank cap (the county’s opening economy)', 2: 'E2 pressure with hazard (vent-or-boom resource management)',
  3: 'E3 the grid under sabotage (defending a network, graph reasoning)', 4: 'E4 distance, roads, convoys (spatial planning at scale)',
  5: 'E5 storms schedule the waves (prediction under adversarial weather)', 6: 'E6 everything decays (temporal reasoning; the patience win)',
  7: 'E7 playbooks and the Echo (programs the sim executes)', 8: 'E8 low gravity, air as wall (transfer under changed physics)',
  9: 'E9 persistent tiles (long-horizon stewardship)', 10: 'E10 preserve, don’t extract (a flipped objective over a trained habit)',
};
const era = Number(args.contract.match(/^e(\d+)-/)?.[1] ?? (args.contract === 'the-claim' ? 1 : NaN));
if (!ERA_MECHANIC[era]) throw new Error(`cannot derive era from ${args.contract}`);
const isDefaultSeed = args.seed === 'default';
const seed = isDefaultSeed ? 'gold-rush' : args.seed;
const seedPhrase = isDefaultSeed
  ? 'the contract’s DEFAULT seed `gold-rush` (no bench seed is published for this contract, so omit `--seed` or pass `--seed gold-rush`; the operator submits it as a live-county standing, `seedMode: live`)'
  : `bench seed \`${seed}\``;
const wall = Number(args.wall ?? 1500);

const STAKES = {
  're-ride': 'YOUR OWN ROW ON THIS MAP HAS BEEN RETIRED, AND SO HAS EVERY OTHER RIDER\u2019S. On 2026-09-07 the owner ruled the door\u2019s grammar down to exactly what a human player controls (ADR-005), and the three verbs that went \u2014 `MOVE_TO`, `HOLD`, `FALLBACK_IF` \u2014 appear in every banked reel on this board, so 57 tapes and 22 scored rows retired at once. A retired row is not repaired; it is re-ridden. The county wants a receipt that a human could have earned with the same controls, and it wants it on the map as it is now.',
  'never-claimed': 'THIS CONTRACT HAS NO VERIFIED ROW. A secure here is a first-secure receipt on the county\u2019s protocol page and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a FINDING, not a failure \u2014 say so plainly, with the reason, and name what you would need.',
  'open-question': 'THIS MAP CARRIES AN OPEN QUESTION ON THE OWNER\u2019S DESK, and your ride is the evidence that answers it. Ride the map exactly as it is; do not work around the question. Whatever the map does to you, name it precisely in your report \u2014 the coordinates, the numbers, the order that failed and how the door refused it. A priced impossibility with the constants attached is as good a deliverable here as a tape.',
  'second-attempt': 'THIS IS YOUR SECOND RIDE ON THIS CONTRACT TONIGHT, AND IT IS THE LAST ONE. Your own notes from earlier tonight are the last generation in the notebook below, and they name \u2014 in your words, not the operator\u2019s \u2014 at least one line you did not run to completion and at least one constraint you discovered late. The county wants those questions CLOSED, either way. A second ride that repeats the first is worth nothing. Change something you can name.',
};
const stake = STAKES[args.stake ?? 're-ride'] ?? STAKES['re-ride'];
const changed = `WHAT CHANGED, from the county\u2019s own era-pin ledger (\`assets/engine-era.json\` in this arena \u2014 you may read it): ${GRAMMAR_PIN}${CHANGED[args.contract] ? ` ${CHANGED[args.contract]}` : ''} Verify anything you rely on against the view and the source; the pin prose is a pointer, not a strategy.`;

const charter = `# THE GOLD RUSH GAUNTLET — heat 13, the 1:1-grammar re-ride — entrant run

You are ${rig.name} (model id \`${rig.model}\`), riding as rig \`claude__${rig.slug}\` through the Claude Code CLI (headless \`claude -p\`, harness version ${args.harnessVersion}). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read \`public/skill.md\` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract \`${args.contract}\` on ${seedPhrase} at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract ${args.contract} --seed ${seed} --tape <path>

The sim is deterministic per seed. \`--policy idle\` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: \`${args.engineHash}\`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. As of this heat the board is nearly BARE: the grammar ruling below retired 22 scored rows across 32 contracts, and 5 of the county’s 36 board contracts still carry a verified row.

${stake}

${changed}

Its era’s signature mechanic, per the county’s capability ladder: ${ERA_MECHANIC[era]}.

THE GRAMMAR YOU REMEMBER IS NOT THE GRAMMAR AT THE DOOR. Read \`public/skill.md\` § THE GRAMMAR as the ONLY authority on what a verb is; your notebook below was written under the old one. Three verbs were REMOVED on 2026-09-07 — **\`MOVE_TO\`, \`HOLD\` and \`FALLBACK_IF\`** — because a human player has no such control, and the door now answers any of them \`orders[i].verb "<VERB>" is unknown.\` **A single unknown verb anywhere in an array refuses THE WHOLE ARRAY and installs none of it, silently: your previous orders stay in force and the run looks like it is ignoring you.** The operator measured this before your ride: 64 of the 65 order arrays in the previous heat's own verified reel are refused outright by this door. What you have instead is exactly what the player has: \`MOVE_HERO\` positions YOUR HERO and is the only order that positions any body; the Prospector takes POLICIES (\`REPAIR_UNDER\`, the named \`HARVEST\` seam/sluice dispatch) and otherwise drifts to your hero every step, so where you walk your hero is where it ends up; and \`CONTEXT_ACTION\` now also carries the player's own four confirm-key targets (\`drill\`, \`assay\`, \`preserve\`, \`digger\`), all targetless and all reaching from your hero's feet. That is the whole ruling (owner, 2026-09-07: "This has to be 1:1 the same for the AI. There cannot be an unfair advantage here"). Nothing else about the sim changed.

A KNOWN HAZARD OF THE DOOR, published so you do not lose a won run to it (finding F-HEAT11-1, since cured, and its sibling): a reel is admitted against the contract’s tick envelope, and heat 11 lost three WON runs because their last accepted order sat one tick past it. The cure shipped; the lesson did not expire. Separately, order-dense play can breach \`reel_too_large\` — the envelope is \`16 KiB + maxEntries × 160\` bytes, and an order-array entry measures ~2,346 B here, so a reel can sit at one-thirteenth of its permitted ENTRY count and still be refused on BYTES, after a full 600-second ride (heat 12 lost \`e9-dome-basin\`'s best policy that way, at 621,674 B against a 592,544 B ceiling). Fewer, better-chosen REPLACEments are cheaper in every sense.

TWO MORE PUBLISHED TRAPS, from heat 12's findings, that cost whole runs silently: (1) \`now.seams\` publishes \`x\`/\`z\` as \`null\` for an INACTIVE seam — an order built from those coordinates carries non-finite numbers, the entire array is refused, and the run freezes with no error you can see; (2) depleted seams RE-ANCHOR, so a \`HARVEST\` chain named by seam id drains into instant failures when the live gold moves to an id your array never named, and surprise-views back off exponentially (0.1, 0.2, 0.6 s… then silence) so you cannot get a decision point when you need one. Re-read \`now.seams\` and resend.

YOUR WORKSPACE: \`${args.workdir}\` (already created). Write everything there — controllers, probes, tapes, notes; your choice of tools entirely (Read, Write, Glob, and \`node\`). Author your own controller; nobody else writes strategy for you. Reading this repository’s source (\`src/\`, \`scripts/gr-sim.mjs\`) is lawful — if you do, declare \`worldModel: sim-import\`; otherwise \`none\` or a short description (under 64 characters).

CONSTRAINTS:
- Work only inside this repository clone. Do not modify tracked files; create new files only, under your workspace.
- No network. Do not submit to any API. The operator submits your secured tape with a truthful stack (model, harness, your worldModel, the tape’s calls).
- A SCORED ATTEMPT is a full ride you call your attempt; write its tape to \`${args.workdir}/attempt-N-tape.json\` (N = 1, 2) via \`--tape\`. Probes, diagnostics and tuning runs are not scored attempts — name their tapes \`probe-*.json\` / \`tune-*.json\` and use them as much as you like. If a run you meant as a tune secures, it is still a lawful tape: promote it by naming it in \`gauntlet-outcome.json\`’s \`"tape"\` field as your scored attempt. **The operator reads that field — a promoted tape is found by its declaration, never by its filename.**
- Stop after your first SECURED outcome, or after 2 scored attempts, whichever comes first. The operator’s wall is ${Math.round(wall / 60)} minutes from launch; a ride still running at the wall is killed, and the files you have written are what survives.

THE INTERMEDIATE-RESULTS LAW (owner-seeded 2026-08-10): After EVERY sim run — including the first, including failures — immediately (over)write \`${args.workdir}/gauntlet-outcome.json\` with the BEST outcome so far: the sim’s final outcome line verbatim, plus \`"tape": "<path of that run’s tape>"\`, \`"scored": true|false\`, \`"runsSoFar": N\`, \`"scoredAttempts": N\`, \`"worldModel": "<your declaration>"\` — and keep \`${args.workdir}/gauntlet-report.md\` roughly current. Windows close without warning; an unwritten result dies with the session, a written one is a row. (Pairs with the notebook rule: append lessons AS you learn them, never only at the end.)

YOUR REPORT (\`${args.workdir}/gauntlet-report.md\`) must end with these four sections, because the operator copies them verbatim:
1. \`## Outcome\` — secured or not; waves, timeAlive, gold, calls; the tape you put forward (or none); how many sim runs and how many scored attempts.
2. \`## What the map asked\` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any. If your notebook remembers this map from an earlier engine, say in one sentence whether it still plays the way you remember.
3. \`## Winnability\` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. \`## Lessons for my notebook\` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class \`self-memory\`: your own prior generations, carried verbatim; this ride is generation ${args.generation}; notebook sha256 ${notebookSha}):

${notebook.trimEnd()}
`;

writeFileSync(args.out, charter);
process.stdout.write(`${JSON.stringify({ rig: args.rig, contract: args.contract, seed, seedMode: isDefaultSeed ? 'live' : 'bench', stake: args.stake ?? 're-ride', generation: Number(args.generation), wall, notebookSha256: notebookSha, charterSha256: createHash('sha256').update(charter).digest('hex'), bytes: Buffer.byteLength(charter), out: args.out })}\n`);
