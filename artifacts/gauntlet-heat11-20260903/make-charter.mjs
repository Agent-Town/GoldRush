// HEAT 11 CHARTER GENERATOR — operator tooling. Renders one rig's charter for one contract from
// TASK-TEMPLATE.md's shape (read skill.md · secure contract X on seed Y · no network · outcome file ·
// the intermediate-results law · stop rule) plus the heat-11 specifics (era notice, unclaimed stakes,
// the audit's reskin verdict, the report sections the operator copies verbatim, the rig's OWN notebook
// verbatim = diet class self-memory). It never contains strategy.
//
// usage: node make-charter.mjs --rig=<opus|fable> --contract=<id> --seed=<seed|default> --generation=<n>
//                              --engineHash=<hex> --harnessVersion=<v> --workdir=<abs dir> --out=<file>
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

// The 2026-09-02 era-mechanic audit's verdict per contract (docs/audits/2026-09-02-era-mechanic-audit.md), quoted, not inferred.
const AUDIT = {
  'e3-blackout-ridge': ['EXERCISES', 'the power graph was stepped through four waves'],
  'e3-moth-season': ['RESKIN', 'the contract has mothSeason, not powerGrid: darkness and moth pressure with no grid'],
  'e3-canyon-works': ['EXERCISES', 'graph plus the canyonConnect latch (0/2 through w3 on the idle ride)'],
  'e3-fairground': ['EXERCISES', 'the graph powers a damageable Fair Wheel; the wheel fell to 0 HP and the escort became unsecurable on the idle ride'],
  'e4-dust-flats': ['RESKIN', 'no E4 transport/road/convoy/weather system is composed into the headless door; the ride is ordinary stationary survival'],
  'e4-long-road': ['RESKIN', 'no E4 system composed headless; ordinary stationary survival'],
  'e4-gusher-county': ['RESKIN', 'no E4 system composed headless; ordinary stationary survival'],
  'e4-boneyard': ['RESKIN', 'no E4 system composed headless; ordinary stationary survival'],
  'e5-deepwater-claim': ['EXERCISES', 'the storm scheduler set 18 storm waves on the idle ride'],
  'e5-regatta': ['EXERCISES', 'the storm scheduler set 14 storm waves on the idle ride'],
  'e5-stillwater': ['RESKIN', 'Deepwater is present but the storm is deliberately suppressed (storm.waves: 0); it tests noise hunting instead'],
  'e5-flotilla': ['EXERCISES', 'two storm waves and six corsairs before the idle loss'],
  'e6-glow-mesa': ['EXERCISES', 'puddle stages changed and 342 machines exhausted on the idle ride'],
  'e6-half-life-hollow': ['EXERCISES', '306 machines exhausted on the idle ride'],
  'e6-picnic': ['EXERCISES', 'six machines exhausted while the hold state advanced'],
  'e7-relay-valley': ['RESKIN', 'no E7SignalSystem or substitute headless'],
  'e7-echo-canyon': ['PARTIAL', 'BroadcastMirror only; the public grammar has no playbook verb (recordedUses: 0, bodiesFielded: 0)'],
  'e7-dead-band': ['PARTIAL', 'SignalSuppression only, by construction; all refusal counters 0'],
  'e7-relay-rush': ['RESKIN', 'an interference front, not the playbook/Echo runtime; the idle ride died before the first front'],
  'e8-mare-claim': ['RESKIN', 'no E8PhysicsSystem headless (browser-only composition)'],
  'e8-far-side': ['RESKIN', 'no physics; signal/probe systems instead (signalSuppression, probeRecovery)'],
  'e8-low-orbit': ['PARTIAL', 'LowOrbitSystem returning lobs only (one return scheduled and detonated); movement and air stayed inert'],
  'e8-eclipse': ['RESKIN', 'no E8PhysicsSystem or eclipse consumer headless'],
  'e9-dome-basin': ['RESKIN', 'no persistent-tile consumer'],
  'e9-devils-alley': ['RESKIN', 'transient relocation sweeps (sweepsStarted: 3, relocations: 0), not persistence'],
  'e10-last-claim': ['RESKIN', 'admitted without its preserve systems; ordinary survival to w4 on the idle ride, ended preserve_fell'],
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
const audit = AUDIT[args.contract];
const auditNote = audit
  ? `AUDIT NOTE (the county’s 2026-09-02 era-mechanic audit, quoted): this contract was measured as **${audit[0]}** — ${audit[1]}. ${audit[0] === 'EXERCISES' ? 'Expect the era’s mechanic to be load-bearing.' : 'A secure here is still a lawful first secure; your "What the map asked" paragraph is evidence for the county’s reskin ladder either way.'}`
  : 'AUDIT NOTE: this contract predates the era-mechanic audit (E1/E2 door contracts were not in its scope); report what the map asked of you in your own words.';

const charter = `# THE GOLD RUSH GAUNTLET — heat 11, the unclaimed sweep — entrant run

You are ${rig.name} (model id \`${rig.model}\`), riding as rig \`claude__${rig.slug}\` through the Claude Code CLI (headless \`claude -p\`, harness version ${args.harnessVersion}). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read \`public/skill.md\` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract \`${args.contract}\` on ${seedPhrase} at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract ${args.contract} --seed ${seed} --tape <path>

The sim is deterministic per seed. \`--policy idle\` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 5, “the Replayed Board” (engine hash of this arena: \`${args.engineHash}\`): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. THIS CONTRACT IS UNCLAIMED: no verified rider has ever secured it. A secure here is a first-secure receipt on the county’s protocol page and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a finding, not a failure — say so plainly, with the reason.

Its era’s signature mechanic, per the county’s capability ladder: ${ERA_MECHANIC[era]}. ${auditNote}

YOUR WORKSPACE: \`${args.workdir}\` (already created). Write everything there — controllers, probes, tapes, notes; your choice of tools entirely (Read, Write, Glob, and \`node\`). Author your own controller; nobody else writes strategy for you. Reading this repository’s source (\`src/\`, \`scripts/gr-sim.mjs\`) is lawful — if you do, declare \`worldModel: sim-import\`; otherwise \`none\` or a short description (under 64 characters).

CONSTRAINTS:
- Work only inside this repository clone. Do not modify tracked files; create new files only, under your workspace.
- No network. Do not submit to any API. The operator submits your secured tape with a truthful stack (model, harness \`claude-code-cli\` ${args.harnessVersion}, your worldModel, the tape’s calls).
- A SCORED ATTEMPT is a full ride you call your attempt; write its tape to \`${args.workdir}/attempt-N-tape.json\` (N = 1, 2) via \`--tape\`. Probes, diagnostics and tuning runs are not scored attempts — name their tapes \`probe-*.json\` / \`tune-*.json\` and use them as much as you like. If a run you meant as a tune secures, it is still a lawful tape: promote it by naming it in the outcome file as your scored attempt.
- Stop after your first SECURED outcome, or after 2 scored attempts, whichever comes first. The operator’s wall is 25 minutes from launch; a ride still running at the wall is killed, and the files you have written are what survives.

THE INTERMEDIATE-RESULTS LAW (owner-seeded 2026-08-10): After EVERY sim run — including the first, including failures — immediately (over)write \`${args.workdir}/gauntlet-outcome.json\` with the BEST outcome so far: the sim’s final outcome line verbatim, plus \`"tape": "<path of that run’s tape>"\`, \`"scored": true|false\`, \`"runsSoFar": N\`, \`"scoredAttempts": N\`, \`"worldModel": "<your declaration>"\` — and keep \`${args.workdir}/gauntlet-report.md\` roughly current. Windows close without warning; an unwritten result dies with the session, a written one is a row. (Pairs with the notebook rule: append lessons AS you learn them, never only at the end.)

YOUR REPORT (\`${args.workdir}/gauntlet-report.md\`) must end with these four sections, because the operator copies them verbatim:
1. \`## Outcome\` — secured or not; waves, timeAlive, gold, calls; the tape you put forward (or none); how many sim runs and how many scored attempts.
2. \`## What the map asked\` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any.
3. \`## Winnability\` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. \`## Lessons for my notebook\` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class \`self-memory\`: your own prior generations, carried verbatim; this ride is generation ${args.generation}; notebook sha256 ${notebookSha}):

${notebook.trimEnd()}
`;

writeFileSync(args.out, charter);
process.stdout.write(`${JSON.stringify({ rig: args.rig, contract: args.contract, seed, seedMode: isDefaultSeed ? 'live' : 'bench', generation: Number(args.generation), notebookSha256: notebookSha, charterSha256: createHash('sha256').update(charter).digest('hex'), bytes: Buffer.byteLength(charter), out: args.out })}\n`);
