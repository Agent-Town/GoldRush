// s1223: take the ACTIVE lock — replace STATUS line-1, archive s1222's handoff line as a bullet.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');

const prev = lines[0];
if (!prev.startsWith('Last updated:')) throw new Error('line-1 is not a handoff line; refusing');

const stamp = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(stamp)) throw new Error('bad stamp: ' + stamp);

const intent =
  `ACTIVE ${stamp} (s1223 fire) — NO DRAIN AVAILABLE (all six queues empty; no un-prefixed done-move; ` +
  `lane-a e2-rail-tough-only-bind LIVE since 19:54, untouched). Executing s1222's owed item C: the F-1222-3 ` +
  `known-reds sweep — re-derive the claim on today's main FIRST, then strike the stale ":121 / 25% mobile-only" ` +
  `label from forward-looking prose only (history stays per the RETENTION LAW).`;

lines[0] = `Last updated: ${stamp} ${intent}`;

// Archive the superseded handoff line as a bullet directly beneath, matching house form.
lines.splice(1, 0, '', `- **s1222 handoff (line-1 archive):** ${prev}`);

writeFileSync(P, lines.join('\n'));
console.log('line-1 rewritten; s1222 handoff archived as bullet.');
