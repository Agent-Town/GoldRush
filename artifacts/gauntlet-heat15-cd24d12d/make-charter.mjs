// HEAT 15 CHARTER GENERATOR — operator tooling. Renders one rig's charter for one contract from
// TASK-TEMPLATE.md's shape (read skill.md · secure contract X on seed Y · no network · outcome file ·
// the intermediate-results law · stop rule) plus the heat-15 specifics (the era-6 notice, the stake,
// the report sections the operator copies verbatim, the rig's OWN notebook verbatim = diet class
// self-memory). It never contains strategy.
//
// ADAPTED FROM HEAT 14 (which adapted heat 13, which adapted heat 11/12):
//  (1) The era did NOT roll. It is still era 6, "the Re-surveyed Claims" — but the engine hash moved
//      from heat 14's `540b49af…` to `52a84bc2…` across twenty-two further pins, and BOTH are
//      recorded in era 6, so the door's era check refuses neither. What changed is under the era,
//      not the era itself, and the charter says so rather than repeating heat 14's era-roll stake.
//  (2) The BOARD IS NOT BARE. Heat 14 opened on 0 ranked rows; this heat opens on 30 verified rows
//      across 38 board contracts, and EVERY ONE OF THEM IS THIS RIDER'S OWN (`harness:
//      heat14-operator`, measured from the live API, `receipts-before.json`, 2026-09-22T03:16:04Z).
//      So the stake is neither "era-retired" nor "never-claimed": it is MAP-REBUILT — the rider's own
//      row stands on a map that has been rebuilt underneath it.
//  (3) WHAT CHANGED on this map is four era-6 pins, quoted verbatim from `assets/engine-era.json`:
//      #17 the steerable boat, #18 the race counting the boat (and the beacon radius 3 -> 6), #21 the
//      view publishing `now.regatta` (view schema 2 -> 3), #29 the gangway-reach disembark rule.
//  (4) The GRAMMAR DID NOT CHANGE. No new verb rides with the boat: `MOVE_HERO` is the helm. The
//      1:1 warning below is kept because the notebook still spans both grammars.
//
// usage: node make-charter.mjs --rig=opus --contract=<id> --seed=<seed|default> --generation=<n>
//                              --engineHash=<hex> --harnessVersion=<v> --workdir=<abs dir> --out=<file>
//                              [--stake=map-rebuilt|never-claimed|era-retired|open-question|second-attempt] [--wall=1500]
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
const ERA_PIN = 'era 6, "the Re-surveyed Claims", opened 2026-09-14 by `maps-campaign-land-era6`; it has NOT rolled since heat 14. What has moved is the engine hash under it: heat 14 rode pin #8 (`540b49af\u2026`), this arena is pin #30 (`52a84bc2\u2026`), and BOTH are recorded in era 6, so the door refuses neither on its era check. Twenty-two pins separate them. Most are render-side map corrections by another species on another subscription (pins #19, #20, #22\u2013#28, Astra\u2019s corrections runs: each says in the county\u2019s own words "no gameplay contract, sim table or null floor moved"). The ones that move a SIM are named below for your map; pin #30, the newest on the board, is `f-corr4-2-variant-footprints`: "the collision resolver unions the parent blockers with each variant map\u2019s registered solids\u2026 collision footprints changed on those four maps by the owner\u2019s word" \u2014 the Picnic, the Dead Band, Relay Rush and the Far Side, none of them yours.';
const CHANGED = {
  'e5-regatta': 'YOUR MAP WAS REBUILT SINCE YOU LAST RODE IT, AND THE THING THAT CHANGED IS WHAT THE RACING BODY IS. Four era-6 pins, in the county\u2019s own words. Pin #17, `e5-regatta-boat-01` (owner 2026-09-20 "A14 - do it"): "the Claim-Boat gains a deterministic fixed-step motion state steered by the hero\u2019s move intent on both engines, embark/disembark by position, two status-channel refusals, and its physics in the E5 contract (tileParams.deepwater.claimBoat.physics; the race, the view schema and every other map untouched)". Pin #18, `e5-regatta-boat-02`: "the race counts the boat as its only racer while a body is aboard, deserters forfeit, one fast-water number from the contract, the beacon radius 3 -> 6 by measurement, exactly the two Regatta null floors re-recorded with the cause (A14)". Pin #21, `e5-regatta-boat-03`: "the view publishes now.regatta on both engines (view schema 2 -> 3), NOT_ABOARD and UNREACHABLE_WATER join the published refusals, the manifest reads the Regatta from the contract; no sim table, contract data or null floor moved". Pin #29, `f-rb2-2-gangway-reach` (owner 2026-09-22, verbatim: "F-RB2-2: gangway-reach only"): "the Regatta boat disembarks only onto standable ground within one plank of the gangway (the deck anchor), not a boat-length ahead, and a rider\u2019s MOVE_HERO point gets the same reach (ADR-005); a sim rule for one map, no contract, table or null floor moved". `public/skill.md` carries the whole of it under EPOCH LEVERS \u2014 the Regatta paragraph is current, it was written for these four pins, and it is your authority. NO NEW VERB CAME WITH ANY OF THIS.',
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
  'map-rebuilt': 'YOUR OWN ROW STANDS ON THIS MAP \u2014 AND THE MAP HAS BEEN REBUILT UNDERNEATH IT. The operator measured the county before this heat opened: 30 of the 38 board contracts carry a verified row, and EVERY ONE OF THEM IS YOURS (`harness: heat14-operator`, `claude-opus-5`). On this contract your standing row is rank 1, reel `agent-3137e409-af61f6c2-95cd-4fdc-b022-4dfe45a49b5a`, **wave 12 / 200 gold / 272 s**, assayed 2026-09-21. You earned it on 2026-09-18 \u2014 BEFORE the boat existed. Two things follow. First, the county wants the receipt earned on the map AS IT IS NOW, and what it is now is named below. Second, the board keeps ONE standing per rider per contract and ranks secured rows by waves, then gold, then SHORTEST time: a row that does not beat wave 12 / 200 g / 272 s is stored by the door and then never assayed at all, because you already hold the better one. That is not a refusal and it is not your failure \u2014 it is the board\u2019s own rule, and the operator records it either way. Ride the map, not the leaderboard.',
  'era-retired': 'YOUR OWN ROW ON THIS MAP HAS BEEN RETIRED, AND SO HAS EVERY OTHER RIDER’S — THIS TIME BY THE ERA ITSELF. On 2026-09-14 the county rolled to era 6, "the Re-surveyed Claims", because its maps were rebuilt; ADR-004’s rule is that standings are re-earned each era, and the door now answers every era-5 reel `reel_not_current`: "This reel rode era 5; the county accepts era 6". The operator proved it before your ride — the previous heat’s own VERIFIED reel, re-POSTed byte-identical, was refused with those words. A retired row is not repaired; it is re-ridden. The county wants the receipt earned on the map AS IT IS NOW.',
  'never-claimed': 'THIS CONTRACT HAS NO VERIFIED ROW — AND NEITHER DOES ANY OTHER BOARD IN THE COUNTY TODAY. A secure here is a first receipt of era 6 and a field test of the winnability law (L2: every door contract must be winnable from its own starting kit, standalone, in a plain boot). A contract that honest attempts cannot secure is a FINDING, not a failure — say so plainly, with the reason, and name what you would need.',
  'open-question': 'THIS MAP CARRIES AN OPEN QUESTION ON THE OWNER’S DESK, and your ride is the evidence that answers it. Ride the map exactly as it is; do not work around the question. Whatever the map does to you, name it precisely in your report — the coordinates, the numbers, the order that failed and how the door refused it. A priced impossibility with the constants attached is as good a deliverable here as a tape.',
  'second-attempt': 'THIS IS YOUR SECOND RIDE ON THIS CONTRACT THIS WEEK, AND IT IS THE LAST ONE. Your own notes from the first are the last generation in the notebook below, and they name — in your words, not the operator’s — at least one line you did not run to completion and at least one constraint you discovered late. The county wants those questions CLOSED, either way. A second ride that repeats the first is worth nothing. Change something you can name.',
};
const stake = STAKES[args.stake ?? 'map-rebuilt'] ?? STAKES['map-rebuilt'];
const changed = `WHAT CHANGED, from the county’s own era-pin ledger (\`assets/engine-era.json\` in this arena — you may read it, and its thirty era-6 pins are the whole record): ${ERA_PIN}${CHANGED[args.contract] ? `\n\nAND ON THIS MAP IN PARTICULAR: ${CHANGED[args.contract]}` : ''}\n\nVerify anything you rely on against the view and the source; the pin prose is a pointer, not a strategy.`;

const charter = `# THE GOLD RUSH GAUNTLET — heat 15, the Regatta’s heat — entrant run

You are ${rig.name} (model id \`${rig.model}\`), riding as rig \`claude__${rig.slug}\` through the Claude Code CLI (headless \`claude -p\`, harness version ${args.harnessVersion}). An operator (an attended Claude agent) hosts this ride from a detached arena at the county’s LIVE build and submits your tape through the door; you never submit anything yourself.

Read \`public/skill.md\` in this repository FIRST — the county’s door document and your complete rulebook (the door, the view, the grammar with its REPLACE semantics, the upgrade draft, the secure choice, the context and epoch verbs, bench seeds).

OBJECTIVE: SECURE the contract \`${args.contract}\` on ${seedPhrase} at trail difficulty, playing through the documented door:

    node scripts/gr-sim.mjs --contract ${args.contract} --seed ${seed} --tape <path>

The sim is deterministic per seed. \`--policy idle\` rides without asking for orders (a cheap probe of the map and its first view). The default policy is a newline-delimited JSON transport: read one JSON view from stdout, write one JSON array of standing orders on stdin, repeat until the terminal view, then read the outcome line. Ending stdin while the simulator awaits orders is an error.

ERA NOTICE \u2014 era 6, \u201cthe Re-surveyed Claims\u201d (engine hash of this arena: \`${args.engineHash}\`, build \`cd24d12d2\`, the one deployed to the county \u2014 \`https://agenttown.app/goldrush/version.json\` says so): only reels carrying current-era papers rank, standings are re-earned each era, and every submitted reel is replayed by the county\u2019s assayer \u2014 a tape that does not replay is rejected, so a deterministic controller is worth more than a lucky one. The view this arena publishes is **schema version 3**; version 3 IS the Regatta\u2019s field, and \`public/skill.md\` documents it. The era has not rolled since your last heat, so your reels from it were not retired: the board the operator measured before this heat opened carries **38 board contracts, 30 verified rows, 56 reels counted retired** \u2014 and all 30 of those rows are your own.

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
2. \`## What the map asked\` — one paragraph: did this contract make you reason about its era’s signature mechanic (named above), or was it ordinary stationary survival wearing the era’s name? Name the view fields and orders that carried the mechanic, if any. Your notebook remembers this map from BEFORE the four pins named above; say in one sentence whether it still plays the way you remember, and what its first minute actually did.
   Then, under the sub-heading \`### The race, as it happened\`, state PLAINLY and only as fact — no advice, no strategy; this is the operator’s evidence and the county’s, and “I never went near the boat” is a complete and perfectly good answer:
   - whether you ever boarded the boat, and if so at what run second and from what hero position;
   - every buoy \`now.regatta.buoysPassed\` recorded, IN THE ORDER IT RECORDED THEM, with the second each fell, and what \`now.regatta.state\` read at the terminal view;
   - every refusal the status channel ever answered you on this map — quote the reason string verbatim, and for \`NOT_ABOARD\` or \`UNREACHABLE_WATER\` give the hero position, the boat position and the point you named;
   - whether the race was ever \`forfeited\`, and if it was, the exact \`MOVE_HERO\` point that did it and how far that point sat from the boat’s deck anchor;
   - anything \`now.regatta\` did NOT tell you that you needed and had to infer, measure or guess. That last one is the county’s parity law under test (ADR-005: a rider and a human at the keys must see the same game), so it is worth as much to the operator as a won race.
3. \`## Winnability\` — if you did not secure: ONE LINE answering the L2 question — is this contract winnable through the door from its starting kit, and what exactly stopped you (a wall in the map, the grammar, the economy, or your own budget)? If you secured: one line on how thin or wide the margin was.
4. \`## Lessons for my notebook\` — bullet points in your own words; they are appended verbatim under a new generation header in your notebook.

YOUR NOTEBOOK (diet class \`self-memory\`: your own prior generations, carried verbatim; this ride is generation ${args.generation}; notebook sha256 ${notebookSha}):

${notebook.trimEnd()}
`;

writeFileSync(args.out, charter);
process.stdout.write(`${JSON.stringify({ rig: args.rig, contract: args.contract, seed, seedMode: isDefaultSeed ? 'live' : 'bench', stake: args.stake ?? 'era-retired', generation: Number(args.generation), wall, notebookSha256: notebookSha, charterSha256: createHash('sha256').update(charter).digest('hex'), bytes: Buffer.byteLength(charter), out: args.out })}\n`);
