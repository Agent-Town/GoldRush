// HEAT 12 CHARTER GENERATOR — operator tooling. Renders one rig's charter for one contract from
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
const CHANGED = {
  'e3-moth-season': 'e3-moth-season drain (d07a0e2e7) "rewrites the Moth Season contract row (assets/contracts/epoch-3-voltage/contracts.json) — the sabotageable light circuit as contract data, zero src/ edits".',
  'e7-relay-valley': 'e7-playbook-rows drain (0a2a6fdcf) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; e7-player-playbook-parity drain makes "E7PlaybookLatch.ts … the one four-rule secure decision for Game.ts and HeadlessContractSim.ts".',
  'e7-relay-rush': 'e7-playbook-rows drain (0a2a6fdcf) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; e7-player-playbook-parity drain makes "E7PlaybookLatch.ts … the one four-rule secure decision for Game.ts and HeadlessContractSim.ts".',
  'e7-echo-canyon': 'e7-playbook-rows drain (0a2a6fdcf) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; e7-player-playbook-parity drain makes "E7PlaybookLatch.ts … the one four-rule secure decision for Game.ts and HeadlessContractSim.ts".',
  'e7-dead-band': 'e7-playbook-rows drain (0a2a6fdcf) "adds PLAYBOOK_USE and the signal-system composition on the four Signal Era maps"; e7-player-playbook-parity drain makes "E7PlaybookLatch.ts … the one four-rule secure decision for Game.ts and HeadlessContractSim.ts".',
  'e5-stillwater': 'e5-storm-predicate-split drain split "deepwaterStormCarriesCorsairs from deepwaterStormDisablesScheduledWaves"; then e5-stillwater-front-crew-2 "crews Stillwater\'s 32-second storm with one existing corsair skiff; played riders still secure at wave 12 and 360000 ms, idle riders lose by wave 3".',
  'e8-mare-claim': 'e8-mare-claim-physics drain (5c82f05bb) "composes E8PhysicsSystem headless for contracts declaring gravity/atmosphere".',
  'e8-far-side': 'e8-remaining-maps "composes E8SuitAirSystem into the headless door for e8-far-side, e8-low-orbit and e8-eclipse"; the three siblings\' idle floors moved by design.',
  'e8-low-orbit': 'e8-remaining-maps "composes E8SuitAirSystem into the headless door for e8-far-side, e8-low-orbit and e8-eclipse"; the three siblings\' idle floors moved by design.',
  'e8-eclipse': 'e8-remaining-maps "composes E8SuitAirSystem into the headless door for e8-far-side, e8-low-orbit and e8-eclipse"; the three siblings\' idle floors moved by design.',
  'e4-long-road': 'e4-roads-and-convoys drain (7f5c590a1) "composes MotorSocket headless for contracts declaring twist.motorFrontier"; e4-vehicles-plain-boot (49370319b) "composes Vehicle/FuelSystem for every twist.motorFrontier contract in a plain boot and adds motorActions to RunTape".',
  'e4-dust-flats': 'e4-roads-and-convoys drain (7f5c590a1) "composes MotorSocket headless for contracts declaring twist.motorFrontier"; e4-vehicles-plain-boot (49370319b) "composes Vehicle/FuelSystem for every twist.motorFrontier contract in a plain boot and adds motorActions to RunTape".',
  'e4-boneyard': 'e4-roads-and-convoys drain (7f5c590a1) "composes MotorSocket headless for contracts declaring twist.motorFrontier"; e4-vehicles-plain-boot (49370319b) "composes Vehicle/FuelSystem for every twist.motorFrontier contract in a plain boot and adds motorActions to RunTape".',
  'e4-gusher-county': 'e4-roads-and-convoys drain (7f5c590a1) "composes MotorSocket headless for contracts declaring twist.motorFrontier"; e4-vehicles-plain-boot (49370319b) "composes Vehicle/FuelSystem for every twist.motorFrontier contract in a plain boot and adds motorActions to RunTape".',
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
  'never-claimed': 'THIS CONTRACT HAS NEVER BEEN CLAIMED. No verified rider of any species has secured it. A secure here is a first-secure receipt on the county’s protocol page and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a FINDING, not a failure — say so plainly, with the reason, and name what you would need.',
  'mechanic-changed': 'THIS MAP’S MECHANIC CHANGED THIS WEEK. A receipt for it already exists, but it was earned on an older engine, before the change below; the county wants a receipt that describes the map as it is now. Your notebook may remember this map — treat that memory as a HYPOTHESIS about a map that has since moved, not as a plan.',
  'stale-receipt': 'THIS MAP’S RECEIPT PREDATES 2026-09-03 and the engine has moved several pins since. The county wants a current-era receipt for it.',
  'second-attempt': 'THIS IS YOUR SECOND RIDE ON THIS CONTRACT TONIGHT, AND IT IS THE LAST ONE. The contract has never been claimed by any rider of any species. Your own notes from earlier tonight are the last generation in the notebook below, and they name — in your words, not the operator’s — at least one line you did not run to completion and at least one constraint you discovered late. The county wants those questions CLOSED, either way. A priced impossibility with the constants attached is as good a deliverable here as a tape; a second ride that repeats the first is worth nothing. Change something you can name.',
};
const stake = STAKES[args.stake ?? 'never-claimed'] ?? STAKES['never-claimed'];
const changed = CHANGED[args.contract]
  ? `WHAT CHANGED, from the county’s own era-pin ledger (\`assets/engine-era.json\` in this arena — you may read it): ${CHANGED[args.contract]} Verify anything you rely on against the view and the source; the pin prose is a pointer, not a strategy.`
  : 'WHAT CHANGED: this contract has no mechanic-change pin since its last receipt; the engine around it has moved (rendering, sampler, lighting) without touching its rules.';

const charter = `# THE GOLD RUSH GAUNTLET — heat 12, the mechanic-changed sweep — entrant run

You are ${rig.name} (model id \`${rig.model}\`), riding as rig \`claude__${rig.slug}\` through the Claude Code CLI (headless \`claude -p\`, harness version ${args.harnessVersion}). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read \`public/skill.md\` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract \`${args.contract}\` on ${seedPhrase} at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract ${args.contract} --seed ${seed} --tape <path>

The sim is deterministic per seed. \`--policy idle\` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: \`${args.engineHash}\`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one.

${stake}

${changed}

Its era’s signature mechanic, per the county’s capability ladder: ${ERA_MECHANIC[era]}.

A KNOWN HAZARD OF THE DOOR, published so you do not lose a won run to it (finding F-HEAT11-1, since cured, and its sibling): a reel is admitted against the contract’s tick envelope, and heat 11 lost three WON runs because their last accepted order sat one tick past it. The cure shipped; the lesson did not expire. Separately, order-dense play can breach \`reel_too_large\` — a heat-11 tape measured 1,724,873 bytes after 131 of 600 seconds at ~4 KB per entry. Fewer, better-chosen REPLACEments are cheaper in every sense.

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
process.stdout.write(`${JSON.stringify({ rig: args.rig, contract: args.contract, seed, seedMode: isDefaultSeed ? 'live' : 'bench', stake: args.stake ?? 'never-claimed', generation: Number(args.generation), wall, notebookSha256: notebookSha, charterSha256: createHash('sha256').update(charter).digest('hex'), bytes: Buffer.byteLength(charter), out: args.out })}\n`);
