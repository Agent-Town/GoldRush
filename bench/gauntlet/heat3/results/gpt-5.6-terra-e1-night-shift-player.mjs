import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const contract = 'e1-night-shift';
const seed = 'e1-night-shift-01';
const era = 'd599cd3e';
const claim = { x: 0, z: 12 };
const sites = {
  sentry_beacon: [{ x: -5, z: 9 }, { x: 5, z: 9 }, { x: -5, z: 15 }, { x: 5, z: 15 }, { x: -9, z: 12 }, { x: 9, z: 12 }],
  turret: [{ x: -8, z: 7 }, { x: 8, z: 7 }, { x: -8, z: 17 }, { x: 8, z: 17 }],
  lantern_post: [{ x: 0, z: 7 }],
  palisade: [{ x: -6, z: 6 }, { x: -4, z: 6 }, { x: -2, z: 6 }, { x: 0, z: 6 }, { x: 2, z: 6 }, { x: 4, z: 6 }, { x: 6, z: 6 }, { x: -10, z: 10 }, { x: 10, z: 10 }],
};
const buildPlan = ['sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'sentry_beacon', 'palisade'];
const failedSites = { sentry_beacon: 0, turret: 0, lantern_post: 0, palisade: 0 };
let lastView;

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
const reader = createInterface({ input: child.stdout, crlfDelay: Infinity });

reader.on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    lastView = message;
    if (message.now.hero.hp > 0) child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
    return;
  }
  if ('secured' in message) finish(message).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
});

child.once('error', (error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});

function ordersFor(view) {
  const { now } = view;
  for (const record of now.orders ?? []) {
    if (record.status === 'failed' && record.order?.verb === 'BUILD') failedSites[record.order.what] += 1;
  }
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer?.length) orders.push({ verb: 'PICK_UPGRADE', id: bestOffer(now.pendingOffer).id });
  if (now.wave >= 6 && now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  if (now.threats.alive >= 12) orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 12 }, pos: claim });

  const seam = [...now.seams].filter((entry) => entry.active && entry.remaining > 0).sort((a, b) => b.remaining - a.remaining || a.id.localeCompare(b.id))[0];
  const next = nextBuild(view);
  const expectedGold = now.gold + (seam ? Math.min(30, seam.remaining) : 0);
  const relight = now.works.wrecked === 7 && expectedGold >= 8;
  if (seam) {
    for (let pan = 0; pan < Math.ceil(Math.min(30, seam.remaining) / 5); pan += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  if (relight) orders.push({ verb: 'REPAIR_UNDER', pct: 1 });
  if (next && expectedGold - (relight ? 8 : 0) >= next.cost) {
    orders.push({ verb: 'MOVE_TO', pos: next.site });
    orders.push({ verb: 'BUILD', what: next.what, where: next.site, when: { goldGte: next.cost } });
  }
  orders.push({ verb: 'HOLD', pos: claim });
  return orders;
}

function nextBuild(view) {
  const byKind = view.now.works.byKind ?? {};
  if ((byKind.lantern_post ?? 0) < 8) return buildAt(view, 'lantern_post', byKind.lantern_post ?? 0);
  const built = Object.values(byKind).reduce((total, count) => total + count, 0) - (byKind.palisade ?? 0) - (byKind.lantern_post ?? 0);
  const what = buildPlan[built];
  if (!what) return null;
  return buildAt(view, what, byKind[what] ?? 0);
}

function buildAt(view, what, count) {
  const buildable = view.stablePrefix.mechanics.buildables?.find((entry) => entry.id === what);
  const cost = buildable?.costs?.[count] ?? buildable?.cost;
  if (!Number.isFinite(cost)) return null;
  const options = sites[what];
  return { what, cost, site: options[(count + failedSites[what]) % options.length] };
}

function bestOffer(offers) {
  return offers.map((offer, index) => ({ offer, index, score: offerScore(offer) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].offer;
}

function offerScore(offer) {
  const text = `${offer.name} ${offer.effectText}`.toLowerCase();
  if (/blast|volley|damage|fire rate/.test(text)) return 5;
  if (/range|max hp|heal/.test(text)) return 4;
  if (/pan|gold|seam/.test(text)) return 3;
  return 1;
}

async function finish(outcome) {
  const prior = await readJson('outcome.json');
  const runsSoFar = (prior?.runsSoFar ?? 0) + 1;
  const bestOutcome = better(outcome, prior?.bestOutcome) ? outcome : prior.bestOutcome;
  await writeFile('outcome.json', `${JSON.stringify({ bestOutcome, runsSoFar }, null, 2)}\n`);
  await appendFile('NOTEBOOK.md', `\n## generation ${runsSoFar} — era ${era}\n\n- ${outcome.secured ? 'SECURED' : 'Ended unsecured'} at wave ${outcome.waves}; the rider used live seam availability, immediate draft picks, and ${lastView?.now?.weapon ?? 'rig'} at the final view.\n`);
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

function better(candidate, incumbent) {
  return !incumbent || Number(candidate.secured) > Number(incumbent.secured)
    || (candidate.secured === incumbent.secured && (candidate.waves > incumbent.waves
      || (candidate.waves === incumbent.waves && candidate.kills > incumbent.kills)));
}
