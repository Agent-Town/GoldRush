// HEAT 14 CHARTER GENERATOR — operator tooling. Renders one rig's charter for one contract from
// TASK-TEMPLATE.md's shape (read skill.md · secure contract X on seed Y · no network · outcome file ·
// the intermediate-results law · stop rule) plus the heat-14 specifics (the era-6 notice, the stake,
// the report sections the operator copies verbatim, the rig's OWN notebook verbatim = diet class
// self-memory). It never contains strategy.
//
// ADAPTED FROM HEAT 13 (which adapted heat 11/12):
//  (1) The era is 6, "the Re-surveyed Claims". Every era-5 reel retired WITH THE ERA — 69 reels
//      counted retired across 37 boards, 0 ranked rows standing when this heat opened (measured from
//      the live API, `receipts-before.json`, 2026-09-17T23:38:04Z). So the heat-13 "re-ride" stake
//      (a grammar ruling retiring rows) is replaced by the ERA-ROLL stake: the board is bare.
//  (2) The GRAMMAR DID NOT CHANGE since heat 13. Generations 61-96 of the notebook below were
//      written at the 1:1 door; only the generations before them remember MOVE_TO/HOLD/FALLBACK_IF.
//      The warning is kept (those verbs are still refused) but it is no longer news.
//  (3) WHAT CHANGED is the era-6 pin ledger, quoted: `assets/engine-era.json` in this arena carries
//      eight era-6 pins, and the ones that move a SIM are named per map (the Trestle's spawn gates,
//      the Incline's lane edge and coal-thief gate, the Picnic's claim stand-down, the pressure
//      maps' coal seconds, the Archive World's derived clock).
//
// usage: node make-charter.mjs --rig=opus --contract=<id> --seed=<seed|default> --generation=<n>
//                              --engineHash=<hex> --harnessVersion=<v> --workdir=<abs dir> --out=<file>
//                              [--stake=never-claimed|era-retired|open-question|second-attempt] [--wall=1500]
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

// What the county's OWN era-pin ledger says changed since the last heat's receipts.
// Source: assets/engine-era.json `pins[].cause`, quoted (trimmed), 2026-09-14 .. 2026-09-18, plus the
// era-6 land review's own findings (`reviews/maps-campaign-land-era6.md` F-MAPL-1, F-MAPL-5), quoted.
const ERA_PIN = 'era 6, "the Re-surveyed Claims", opened 2026-09-14 by `maps-campaign-land-era6`: "the merged tree of main 9382083d3 + Astra’s map campaign 883a3521e with the drain’s cures (E1/E2/E3 engineDependencies declarations restored from main, F-MAPL-2; census pins re-pointed; null floors re-recorded)". The campaign rebuilt the county’s MAPS — that is what the era is named for. Seven more pins followed under the same era; the ones that touched a sim are named below, and the rest are the county’s own words: pin #3 (the sprite-animation runtime) says "the sixteen heat-13 tapes replay to unchanged hashes on this tree, measured", with one sim-visible fix, "turretPosition now refuses ruins"; pins #6 and #7 (the boss models, the sprite roster) say "render-side only, the sim is untouched, no reel changes verdict".';
const CHANGED = {
  'e2-trestle': 'YOUR MAP WAS CURED THIS WEEK. Pin #4: "playability-first-wave-e2-e6 (owner 2026-09-16 “lets work on these failing contracts”) — e2-trestle gains five spawn gates, … null floors re-recorded (assets/contracts is in ENGINE_SOURCE_INPUTS)"; pin #5 re-published the Trestle’s mask tables ("published mirrors of contract data the sim already read"). ALSO: `public/skill.md` still carries the PRE-CURE paragraph on this map ("across 250 measured runs neither map has secured on both bench seeds … the trestle reaches wave 10-13 against an `hpScale: 30` railcar"); that text predates the spawn gates. Read the contract data and the view, not the paragraph. AND: the county’s balance ledger moved `boilerHouse.coalSeconds` from 12 to 36 (F-MAPL-1) — one coal now lasts three times as long in every pressure map.',
  'e2-incline': 'YOUR MAP WAS CURED THIS WEEK. Pin #4: "playability-first-wave-e2-e6 (owner 2026-09-16 “lets work on these failing contracts”) — … e2-incline drops its south lane edge and gains the coal_thief north gate, null floors re-recorded"; pin #5 re-published the Incline’s mask tables ("published mirrors of contract data the sim already read"). ALSO: `public/skill.md` still carries the PRE-CURE paragraph on this map ("the incline dies at wave 6 of 12 on seed 01 with two turrets standing"); that text predates the lane change. Read the contract data and the view, not the paragraph. AND: `boilerHouse.coalSeconds` moved from 12 to 36 (F-MAPL-1) — one coal now lasts three times as long in every pressure map.',
  'e6-picnic': 'YOUR MAP WAS CURED THIS WEEK, AND THE CURE IS A CLOCK. Pin #8 (2026-09-18, the newest pin on the board): "town-cast-rulings-a13-a17 + picnic-claim-standdown — … the Picnic’s 20-second claim stand-down in PicnicHoldSystem.ts (sim: the Picnic’s two null floors move from 73.0/47.3 s to 98.0/98.5 s, both still lose; every other floor byte-identical)". A null floor is what an EMPTY controller reaches; both of this map’s still lose, so the stand-down buys time, it does not win the map.',
  'e2-hill-mine': 'ALSO: the county’s balance ledger moved `boilerHouse.coalSeconds` from 12 to 36 (F-MAPL-1, era-6 land review) — one coal now lasts three times as long in every pressure map, this one included.',
  'e2-pressure-garden': 'ALSO: the county’s balance ledger moved `boilerHouse.coalSeconds` from 12 to 36 (F-MAPL-1, era-6 land review) — one coal now lasts three times as long in every pressure map, this one included.',
  'e10-archive-world': 'ALSO (F-MAPL-5, era-6 land review): "`e10-archive-world`’s clock moved from an explicit `twist.clockTicks` to a derived `twist.secureWave` with the Archive World’s new objective" — read the clock off the view, not off a remembered constant.',
  'e3-fairground': 'ALSO (F-MAPL-2, era-6 land review): the `fairground-crowd-flock-consumer` engine dependency "stays removed because the branch ships the crowd consumer and its own guard" — the crowds are the map’s own system now.',
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
  'era-retired': 'YOUR OWN ROW ON THIS MAP HAS BEEN RETIRED, AND SO HAS EVERY OTHER RIDER’S — THIS TIME BY THE ERA ITSELF. On 2026-09-14 the county rolled to era 6, "the Re-surveyed Claims", because its maps were rebuilt; ADR-004’s rule is that standings are re-earned each era, and the door now answers every era-5 reel `reel_not_current`: "This reel rode era 5; the county accepts era 6". The operator proved it before your ride — the previous heat’s own VERIFIED reel, re-POSTed byte-identical, was refused with those words. A retired row is not repaired; it is re-ridden. The county wants the receipt earned on the map AS IT IS NOW.',
  'never-claimed': 'THIS CONTRACT HAS NO VERIFIED ROW — AND NEITHER DOES ANY OTHER BOARD IN THE COUNTY TODAY. A secure here is a first receipt of era 6 and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a FINDING, not a failure — say so plainly, with the reason, and name what you would need.',
  'open-question': 'THIS MAP CARRIES AN OPEN QUESTION ON THE OWNER’S DESK, and your ride is the evidence that answers it. Ride the map exactly as it is; do not work around the question. Whatever the map does to you, name it precisely in your report — the coordinates, the numbers, the order that failed and how the door refused it. A priced impossibility with the constants attached is as good a deliverable here as a tape.',
  'second-attempt': 'THIS IS YOUR SECOND RIDE ON THIS CONTRACT THIS WEEK, AND IT IS THE LAST ONE. Your own notes from the first are the last generation in the notebook below, and they name — in your words, not the operator’s — at least one line you did not run to completion and at least one constraint you discovered late. The county wants those questions CLOSED, either way. A second ride that repeats the first is worth nothing. Change something you can name.',
};
const stake = STAKES[args.stake ?? 'era-retired'] ?? STAKES['era-retired'];
const changed = `WHAT CHANGED, from the county’s own era-pin ledger (\`assets/engine-era.json\` in this arena — you may read it, and its eight era-6 pins are the whole record): ${ERA_PIN}${CHANGED[args.contract] ? `\n\nAND ON THIS MAP IN PARTICULAR: ${CHANGED[args.contract]}` : ''}\n\nVerify anything you rely on against the view and the source; the pin prose is a pointer, not a strategy.`;

const charter = `# THE GOLD RUSH GAUNTLET — heat 14, the era-6 re-ride — entrant run

You are ${rig.name} (model id \`${rig.model}\`), riding as rig \`claude__${rig.slug}\` through the Claude Code CLI (headless \`claude -p\`, harness version ${args.harnessVersion}). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read \`public/skill.md\` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract \`${args.contract}\` on ${seedPhrase} at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract ${args.contract} --seed ${seed} --tape <path>

The sim is deterministic per seed. \`--policy idle\` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE — era 6, “the Re-surveyed Claims” (engine hash of this arena: \`${args.engineHash}\`, build \`e3949bfad\`, the one deployed to the county): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county’s assayer — a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. As of this heat the board is BARE: the operator measured it from the live county API an hour before your ride — **37 board contracts, ZERO ranked rows, 69 reels counted retired**. Whatever you secure is the first receipt of this era on this map.

${stake}

${changed}

Its era’s signature mechanic, per the county’s capability ladder: ${ERA_MECHANIC[era]}.

THE GRAMMAR IS THE ONE YOUR LAST GENERATIONS RODE — AND OLDER ONES DID NOT. The 1:1 ruling of 2026-09-07 (ADR-005) still stands and nothing about it changed this week: \`MOVE_TO\`, \`HOLD\` and \`FALLBACK_IF\` are REMOVED, and the door answers any of them \`orders[i].verb "<VERB>" is unknown.\` **A single unknown verb anywhere in an array refuses THE WHOLE ARRAY and installs none of it, silently: your previous orders stay in force and the run looks like it is ignoring you.** What you have is exactly what the player has: \`MOVE_HERO\` positions YOUR HERO and is the only order that positions any body; the Prospector takes POLICIES (\`REPAIR_UNDER\`, the named \`HARVEST\` seam/sluice dispatch) and otherwise drifts to your hero every step, so where you walk your hero is where it ends up; and \`CONTEXT_ACTION\` carries the player’s own four confirm-key targets (\`drill\`, \`assay\`, \`preserve\`, \`digger\`), all targetless and all reaching from your hero’s feet. Your notebook below spans both grammars — generations 61 and later were written at THIS door, everything before them was not. Read \`public/skill.md\` § THE GRAMMAR as the ONLY authority on what a verb is.

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
2. \`## What the map asked\` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any. If your notebook remembers this map from an earlier engine, say in one sentence whether it still plays the way you remember — and if the map was named above as CURED this week, say in one sentence what its first minute actually did.
3. \`## Winnability\` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. \`## Lessons for my notebook\` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class \`self-memory\`: your own prior generations, carried verbatim; this ride is generation ${args.generation}; notebook sha256 ${notebookSha}):

${notebook.trimEnd()}
`;

writeFileSync(args.out, charter);
process.stdout.write(`${JSON.stringify({ rig: args.rig, contract: args.contract, seed, seedMode: isDefaultSeed ? 'live' : 'bench', stake: args.stake ?? 'era-retired', generation: Number(args.generation), wall, notebookSha256: notebookSha, charterSha256: createHash('sha256').update(charter).digest('hex'), bytes: Buffer.byteLength(charter), out: args.out })}\n`);
