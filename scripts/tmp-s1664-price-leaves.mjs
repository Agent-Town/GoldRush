// s1664 — back-fill `authoringBlock` onto the four legacy UNPRICED planned leaves.
//
// WHY: F-1654-1 built the `authoringBlock` surface because four consecutive fires each
// spent an authoring budget re-deriving the same negatives. It cured the leaves IN FRONT
// OF IT and left four legacy ones unpriced. F-1373-1 (s1373) had already read all four AT
// SOURCE and classed them gated -- that measurement has sat in a BACKLOG finding ever
// since, which is the exact surface F-1654-1 says a refilling fire does not read.
//
// LAW: SPLICE, never re-serialize (JSON.stringify rewrites ~910 lines; a correct insert is
// a handful). This inserts text after each leaf's own `"status": "planned"` line, anchored
// on its unique id, and refuses on any surprise.
import fs from 'node:fs';

const PATH = 'tasks/goals.json';

const BLOCKS = {
  'rf-04-bounty': {
    class: 'owner-gated',
    finding: 'F-1664-1',
    measuredBy: 's1664 2026-08-11 (re-verified at source; first measured s1373 as F-1373-1)',
    reason:
      'NOT fire-authorable, and the owner has taken the DELIVERABLE ITSELF in hand -- this is not a gate a fire can satisfy by building anything. ' +
      'OWNER VERBATIM, dated 2026-08-04 in the morning rulings session (tasks/BACKLOG.md, CITE BY CONTENT: grep "RF-04 BOUNTY COPY"): ' +
      '"(3) don\'t worry about the bounty copy, I will handle it." The row marks it done-side and adds "Retired from the attended list", ' +
      'so it is owed by NOBODY inside the factory -- not a fire, not an attended session. ' +
      'THIS SUPERSEDES the older s1373 reading (F-1373-1 listed this leaf as "owner copy + prizes" among twelve gated leaves) with a later and far more explicit owner word. ' +
      'WHAT IS ALREADY BUILT, so the refusal is not overstated: the PRIZE half is ruled and was queued as work -- the owner ruled THE BOUNTY SKINS by name ' +
      '(everyone-who-reports = THE COMPLAINANT\'S COAT; top-3 = THE GILDED PROSPECTOR) with an art batch plus a grant/redeem system queued off that ruling, ' +
      'and the RF-03b complaints-desk row records the submit path already rendering THE BOUNTY line (shipped s902). What remains under THIS leaf is the COPY, and he writes it. ' +
      'THE LEAF STAYS `planned` DELIBERATELY: the bounty text does not exist yet, so the GOAL is genuinely open even though the WORK is not the factory\'s. ' +
      'DO NOT flip it to merged/superseded on the strength of the retirement note -- that would claim a deliverable nobody has produced. ' +
      'WHAT WOULD CHANGE THIS: the owner supplying the copy, after which the WIRING (never the writing) may be fire-authorable under its own slice.',
  },
  'rf-05-fixed-version': {
    class: 'owner-gated',
    finding: 'F-1664-1',
    measuredBy: 's1664 2026-08-11 (re-verified at source; first measured s1373 as F-1373-1)',
    reason:
      'NOT fire-authorable: every remaining act is the owner\'s, and he has explicitly DEFERRED the one that gates the rest. ' +
      'THE URL IS ALREADY LIVE -- the leaf\'s own title records PUBLIC URL LIVE 2026-07-28 (edge worker route agenttown.app/goldrush), and ' +
      'tasks/BACKLOG.md (CITE BY CONTENT: grep "RELEASE ANNOUNCEMENT DEFERRED") records 5106e2d1 live at agenttown.app/goldrush with the walkthrough fixes. ' +
      'THE RESIDUAL IS TWO OWNER ACTS, named by the title itself: the vE1.0 tag and the final E1 walk blessing. Both are on record as his. ' +
      '(1) THE TAG: BACKLOG (grep "vE1.0 TAG ARMED") carries owner verbatim "(4) ok, if we are ready now and all the fixes have been made" -- armed, and conditioned on HIS readiness, not on a factory gate. ' +
      '(2) THE BLESSING WALK: the owner ruled ONE final blessing walk on round-4 AFTER the fix wave (not before) -- a playtest only he can perform. ' +
      '(3) THE WHOLE RELEASE-DAY PROGRAM IS DEFERRED BY HIS LATER WORD, 2026-08-09 ~21:30, verbatim: "we can stop this release day thing I see right now - I don\'t think this will happen today." ' +
      'That row states the consequence in as many words -- "No fire action owed" -- and moves the announcement, the repo-public flips and the X post to a later day of his choosing. ' +
      'THIS SUPERSEDES the s1373 reading with a later owner word pointing the same way. ' +
      'DO NOT read the live URL as the goal being met: the deploy standing is not the tag, and publishing is owner law twice over (fire.md 7.3 reserves publishing and external services). ' +
      'WHAT WOULD CHANGE THIS: the owner naming a release day, walking round-4, and cutting the tag.',
  },
  'stream-live': {
    class: 'owner-gated',
    finding: 'F-1664-1',
    measuredBy: 's1664 2026-08-11 (re-measured at the goal tree; agrees with F-1373-1, s1373)',
    reason:
      'NOT fire-authorable, and the machinery it waits on is ALREADY BUILT -- the only missing act is the owner pressing go on an external service. ' +
      'THE PROGRAM IS COMPLETE: all four sibling leaves under stream>stream-program are `merged` -- stream-capture (capture rig, mkt-01-footage-rig.md, a91c33a3), ' +
      'stream-runner (seeded stream runner, 0c98e509), stream-director (three-segment director, e27e9f53) and stream-curator (rotation curator, d61275f2). ' +
      'tasks/BACKLOG.md records the operator path end to end (CITE BY CONTENT: grep "YouTube-Loop profile"): YouTube-Loop profile -> AUTOPILOT scene -> Start Streaming, ' +
      'with the note that the 24/7 loop can go live today and the watchdog reports each fire. So there is NO BUILD LEFT TO AUTHOR; the leaf is the owner\'s hand on the switch. ' +
      'THIS IS OWNER LAW, NOT A JUDGEMENT CALL: fire.md 7.3 reserves external services, new subscriptions and publishing anything to the OWNER, and starting a 24h public ' +
      'YouTube broadcast is all three at once. A fire that authored a master here would be authoring an act it is itself forbidden to perform. ' +
      'WHAT WOULD CHANGE THIS: nothing a fire can do -- the owner starts the loop. Once it RUNS, the follow-on work (watchdog reporting, rotation upkeep) is ordinary fire work under its own leaves, ' +
      'so do not let this leaf\'s gate be read as freezing the stream program as a whole.',
  },
  'foundry-first-real-game': {
    class: 'owner-gated',
    finding: 'F-1664-1',
    measuredBy: 's1664 2026-08-11 (re-measured at the goal tree; agrees with F-1373-1, s1373)',
    reason:
      'NOT fire-authorable: the deliverable IS the owner\'s own creative seed, and a fire may not invent one. ' +
      'The leaf\'s title states the gate in its own words -- the owner\'s own concept through the kit (owner brings the seed) -- so this is a DESIGN FORK, ' +
      'which fire.md 7.3 routes to the OWNER\'S DESK rather than to an authoring budget. ' +
      'THE KIT ITSELF IS DONE AND PROVEN, so the refusal is about the seed and nothing else: under foundry>foundry-extract both leaves are `merged` -- ' +
      'foundry-book (THE FOUNDRY BOOK: constitution, gate patterns, mistake catalog, era-bundle template, masks-first pipeline, Sol protocols, canon-wiki method; 827e4825) ' +
      'and foundry-seed (second-game seed test, the "Tidelight" cold-clone smoke, 0 broken steps, money gates held; 408b5494); the root-level foundry-book-doc (d64b54f4) ' +
      'and foundry-own-repo (827e4825) are `merged` too. A second game has ALREADY been cold-cloned end to end as a smoke test, which is exactly why the remaining leaf says REAL: ' +
      'what is missing is a CONCEPT WORTH BUILDING, not a pipeline to build it with. ' +
      'DO NOT author a placeholder second game to fill an idle lane -- that is the invent-scope failure fire.md 2E forbids by name, and it would burn a lane on a domain the owner never chose. ' +
      'WHAT WOULD CHANGE THIS: the owner naming the second game\'s concept.',
  },
};

const raw = fs.readFileSync(PATH, 'utf8');
const lines = raw.split('\n');
let inserted = 0;

for (const [id, block] of Object.entries(BLOCKS)) {
  const idLine = lines.findIndex((l) => l.includes(`"id": "${id}"`));
  if (idLine === -1) throw new Error(`REFUSE: leaf ${id} not found`);
  if (lines.filter((l) => l.includes(`"id": "${id}"`)).length !== 1) throw new Error(`REFUSE: ${id} is not unique`);

  // Find this leaf's own status line within its object (next 4 lines max).
  let statusLine = -1;
  for (let i = idLine; i < idLine + 5 && i < lines.length; i++) {
    if (/^\s*"status": "planned"\s*$/.test(lines[i])) { statusLine = i; break; }
    if (/^\s*\},?\s*$/.test(lines[i]) && i > idLine) break; // left the object
  }
  if (statusLine === -1) throw new Error(`REFUSE: no bare "status": "planned" line for ${id}`);
  if (lines.slice(idLine, statusLine + 1).some((l) => l.includes('authoringBlock'))) {
    throw new Error(`REFUSE: ${id} already has an authoringBlock`);
  }

  const indent = lines[statusLine].match(/^\s*/)[0];
  const body = JSON.stringify({ authoringBlock: block }, null, 2)
    .split('\n')
    .slice(1, -1)                       // drop the wrapping { }
    .map((l) => indent + l.slice(2))    // re-indent to the leaf's depth
    .join('\n');

  // Non-ASCII check is scoped to WHAT I INSERT, never to the whole file: goals.json
  // already carries 5 pre-existing raw-non-ASCII note lines (4724/4927/6875/... on HEAD),
  // so a file-wide assertion refuses on someone else's bytes and tells me to "fix" a
  // correct file. Measured before narrowing -- the first draft of this guard did exactly that.
  if (/[^\x00-\x7F]/.test(body)) throw new Error(`REFUSE: non-ASCII in the ${id} block I generated`);

  lines[statusLine] = `${lines[statusLine]},\n${body}`;
  inserted++;
  console.log(`spliced ${id} (status line ${statusLine + 1}, indent ${indent.length})`);
}

const out = lines.join('\n');

// Refuse unless it still parses and the tree is otherwise untouched.
const before = JSON.parse(raw);
const after = JSON.parse(out);
const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'authoringBlock' ? undefined : v)));
if (JSON.stringify(strip(before)) !== JSON.stringify(strip(after))) {
  throw new Error('REFUSE: the splice changed something other than authoringBlock');
}

fs.writeFileSync(PATH, out);
console.log(`OK: ${inserted} leaves priced; tree otherwise byte-equivalent.`);
