// TK-01: pin the history and use actual main updates to avoid chain-parent date drift.
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { isPlayerPath } from '../../scripts/gazette-backfill-sweep.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64e6 }).trim();
const root = "a514e4f0f908a934fbc28eeaa3686438a4fd162a";
const start = Date.parse('2026-10-05T00:00:00+07:00');
const end = Date.parse('2026-10-06T00:00:00+07:00');
const reflog = git('reflog', 'show', 'main', '--date=iso-strict', '--format=%H%x09%gD%x09%gs')
  .split('\n').map(line => {
    const [hash, ref, subject] = line.split('\t');
    const stamp = ref.match(/@\{(.+)\}/)[1];
    return { hash, stamp, time: Date.parse(stamp), subject };
  }).reverse();
const day = reflog.filter(r => r.time >= start && r.time < end);
const before = reflog.filter(r => r.time < start).at(-1);
if (!before || !day.length) throw Error('Missing reflog day or preceding boundary');
const events = [];
const replacements = [];
let previous = before.hash;
for (const entry of day) {
  const ancestry = spawnSync('git', ['merge-base', '--is-ancestor', previous, entry.hash]);
  if (ancestry.status !== 0) {
    if (ancestry.status !== 1 || git('rev-parse', previous + '^{tree}') !== git('rev-parse', entry.hash + '^{tree}')) throw Error('Non-ancestral update changes the tree: ' + previous + ' -> ' + entry.hash);
    replacements.push({ previous, next: entry.hash, stamp: entry.stamp, tree: git('rev-parse', entry.hash + '^{tree}') });
  }
  const files = git('diff', '--name-only', previous, entry.hash).split('\n').filter(Boolean);
  if (files.some(isPlayerPath)) events.push({ ...entry, previous,
    playerFiles: files.filter(isPlayerPath), reviews: files.filter(f => /^reviews\/[^/]+\.md$/.test(f)),
    introduced: git('log', '--format=%h %cI %s', `${previous}..${entry.hash}`).split('\n') });
  previous = entry.hash;
}
git('merge-base', '--is-ancestor', previous, root);
const walk = git('log', root, '--first-parent', '--format=%H%x09%cI').split('\n')
  .filter(l => { const t = Date.parse(l.split('\t')[1]); return t >= start && t < end; });
const control = git('log', '9fee4bc02', '--first-parent', '--format=%H%x09%cI').split('\n')
  .filter(l => { const t = Date.parse(l.split('\t')[1]); return t >= Date.parse('2026-09-25T00:00:00+07:00') && t < Date.parse('2026-09-26T00:00:00+07:00'); });
if (control.length !== 136) throw Error(`Busy-day control changed: ${control.length}`);
const result = { root, start: new Date(start).toISOString(), end: new Date(end).toISOString(),
  before: before.hash, final: previous, mainUpdates: day.length, firstParentCommits: walk.length,
  controlSeptember25: control.length, replacements, playerEvents: events.length, events };
fs.writeFileSync(new URL('./day.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result, events: events.map(e => ({ hash: e.hash.slice(0, 9), stamp: e.stamp,
  playerFiles: e.playerFiles.length, reviews: e.reviews, subject: e.subject.slice(0, 95) })) }, null, 2));
