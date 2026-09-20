#!/usr/bin/env node
// rider-parity-audit: count every door verb's real usage across the heat-12 rides.
//
// A "use" is one StandingOrder instance inside one `agent_orders` action of a run tape's
// inputLog. Order arrays REPLACE on submit, so a plan re-sent 40 times counts 40 times — that
// is the honest number for "how often did riders reach for this verb", and it is the number a
// parity argument needs (a verb nobody reaches for is cheap to remove).
//
// Three denominators are reported because they answer different questions:
//   orders      — total instances (how much traffic the verb carries)
//   submissions — submissions containing at least one (how many decisions it took part in)
//   rides       — ride directories where it appears at least once (how broad its need is)
// and the same three restricted to each ride's SCORED tape (the one summary.json names),
// which is the only traffic that produced a benchmark number.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const RIDES = process.argv[2] ?? 'artifacts/gauntlet-heat12-20260905/rides';

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

/** Every `agent_orders` order array in a run tape, or null when the file is not a tape. */
function tapeSubmissions(value) {
  const entries = value?.inputLog?.entries;
  if (!Array.isArray(entries)) return null;
  const submissions = [];
  for (const entry of entries) {
    for (const action of Array.isArray(entry?.a) ? entry.a : []) {
      if (action?.kind === 'agent_orders' && Array.isArray(action.orders)) submissions.push(action.orders);
    }
  }
  return submissions;
}

function walkJson(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkJson(path, out);
    else if (name.endsWith('.json')) out.push(path);
  }
  return out;
}

const totals = new Map();      // verb -> { orders, submissions, rides:Set, tapes:Set }
const scored = new Map();      // same, restricted to scored tapes
const rideRows = [];
let tapeCount = 0;
let scoredTapeCount = 0;
let submissionCount = 0;
let orderCount = 0;

function bump(map, verb, key, ride, tape) {
  const row = map.get(verb) ?? { orders: 0, submissions: 0, rides: new Set(), tapes: new Set() };
  row[key] += 1;
  row.rides.add(ride);
  row.tapes.add(tape);
  map.set(verb, row);
}

for (const ride of readdirSync(RIDES).sort()) {
  const dir = join(RIDES, ride);
  if (!statSync(dir).isDirectory()) continue;
  const summary = readJson(join(dir, 'summary.json'));
  // The scored tape is the one the ride's own outcome names; fall back to the promoted name.
  const scoredName = summary?.outcome?.tape ? basename(summary.outcome.tape)
    : summary?.promotedTapeName ? `${summary.promotedTapeName}.json` : null;
  const rideVerbs = new Map();
  let rideTapes = 0;
  let rideOrders = 0;
  for (const path of walkJson(dir)) {
    const submissions = tapeSubmissions(readJson(path));
    if (!submissions) continue;
    tapeCount += 1;
    rideTapes += 1;
    const isScored = scoredName !== null && basename(path) === scoredName;
    if (isScored) scoredTapeCount += 1;
    for (const orders of submissions) {
      submissionCount += 1;
      const seen = new Set();
      for (const order of orders) {
        const verb = typeof order?.verb === 'string' ? order.verb : '(malformed)';
        orderCount += 1;
        rideOrders += 1;
        bump(totals, verb, 'orders', ride, path);
        if (isScored) bump(scored, verb, 'orders', ride, path);
        rideVerbs.set(verb, (rideVerbs.get(verb) ?? 0) + 1);
        seen.add(verb);
      }
      for (const verb of seen) {
        bump(totals, verb, 'submissions', ride, path);
        if (isScored) bump(scored, verb, 'submissions', ride, path);
      }
    }
  }
  if (rideTapes > 0) {
    rideRows.push({ ride, tapes: rideTapes, orders: rideOrders, scoredTape: scoredName,
      verbs: Object.fromEntries([...rideVerbs].sort((a, b) => b[1] - a[1])) });
  }
}

const shape = (map) => Object.fromEntries([...map]
  .sort((a, b) => b[1].orders - a[1].orders)
  .map(([verb, row]) => [verb, { orders: row.orders, submissions: row.submissions, rides: row.rides.size, tapes: row.tapes.size }]));

const report = {
  source: RIDES,
  generatedFrom: 'artifacts/rider-parity-audit/count-heat12-verbs.mjs',
  tapes: tapeCount,
  scoredTapes: scoredTapeCount,
  submissions: submissionCount,
  orders: orderCount,
  ridesWithTapes: rideRows.length,
  allTapes: shape(totals),
  scoredTapesOnly: shape(scored),
  perRide: rideRows,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
