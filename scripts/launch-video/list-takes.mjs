// scripts/launch-video/list-takes.mjs: the "as shot" tables, built from the takes' own sidecars
// (task launch-video-capture-2). Prints two markdown tables for the treatment's "Phase 2: capture list, as shot":
// Kept (every clip and still in ~/.goldrush/launch-video/, one row each, with its duration, viewport, beats and
// REAL or STAGED) and Cut (every file moved to cut/, with the reason recorded in cut/reasons.json). Node only.
//
// Usage: node scripts/launch-video/list-takes.mjs > /tmp/as-shot.md

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OUT = process.env.GR_LV_OUT ?? path.join(os.homedir(), '.goldrush', 'launch-video');
const duration = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim());
const sidecars = readdirSync(OUT).filter((name) => name.endsWith('.json') && !name.startsWith('session-'))
  .map((name) => JSON.parse(readFileSync(path.join(OUT, name), 'utf8')))
  .filter((sidecar) => sidecar.take && sidecar.recording)
  .sort((a, b) => a.take.localeCompare(b.take));

const label = (sidecar) => (sidecar.staged ? `STAGED: ${sidecar.stagedReason ?? 'see sidecar'}` : 'real');
const rows = [];
for (const sidecar of sidecars) {
  const clip = `${sidecar.take}.mp4`;
  if (!existsSync(path.join(OUT, clip))) continue;
  const marks = sidecar.recording.marks ?? [];
  const cut = marks.find((mark) => mark.cutPoint);
  const notes = [];
  if (cut) notes.push(`cut point (the arrival) at ${cut.t.toFixed(1)} s`);
  const freed = marks.filter((mark) => mark.name === 'freed-labelled').length;
  if (freed) notes.push(`${freed} FREED labels`);
  if (sidecar.relit !== undefined) notes.push(sidecar.relit ? 'lantern relit on camera' : 'no relight');
  if (sidecar.secured) notes.push('claim secured');
  const verdict = sidecar.network;
  if (verdict) notes.push(`county requests ${verdict.countyAttempts} (reached network ${verdict.reachedNetwork})`);
  rows.push(`| \`${clip}\` | clip | ${(sidecar.beats ?? []).join(', ')} | ${sidecar.viewport} | ${duration(path.join(OUT, clip)).toFixed(1)} s | ${label(sidecar)} | ${notes.join('; ')} |`);
  for (const still of sidecar.recording.stills ?? []) {
    const name = path.basename(still.file);
    if (!existsSync(path.join(OUT, name))) continue;
    rows.push(`| \`${name}\` | still | ${(sidecar.beats ?? []).join(', ')} | ${sidecar.viewport} | at ${Number(still.t).toFixed(1)} s | ${sidecar.staged ? 'STAGED' : 'real'} | ${still.name} |`);
  }
  for (const extra of readdirSync(OUT).filter((name) => name.startsWith(`${sidecar.take}-`) && name.endsWith('.png'))) {
    rows.push(`| \`${extra}\` | still | ${(sidecar.beats ?? []).join(', ')} | ${sidecar.viewport} | framed | ${sidecar.staged ? 'STAGED' : 'real'} | ${extra.slice(sidecar.take.length + 1, -4)} (element frame) |`);
  }
}

console.log('### Kept\n');
console.log('| File | Kind | Beats | Viewport | Duration | Real or STAGED | Notes |');
console.log('|---|---|---|---|---|---|---|');
for (const row of rows) console.log(row);

const reasonsFile = path.join(OUT, 'cut', 'reasons.json');
const reasons = existsSync(reasonsFile) ? JSON.parse(readFileSync(reasonsFile, 'utf8')) : {};
const cutFiles = existsSync(path.join(OUT, 'cut')) ? readdirSync(path.join(OUT, 'cut')).filter((name) => /\.(mp4|jpg|png)$/.test(name)).sort() : [];
console.log('\n### Cut\n');
console.log('| File | Why it was cut |');
console.log('|---|---|');
for (const name of cutFiles) console.log(`| \`${name}\` | ${reasons[name] ?? reasons[name.replace(/-[^-]+\.(jpg|png)$/, '.mp4')] ?? 'see the report'} |`);

// Footage per beat against the treatment's target lengths (the shape table: B1 5 s ... B12 7 s). A take counts
// toward every beat its sidecar serves; plates (B2's valley, B11, B12) are the edit's, not phase 2's.
const TARGET = { B1: 5, B2: 9, B3: 4, B4: 8, B5: 9, B6: 6, B7: 9, B8: 10, B9: 9, B10: 11, B11: 7, B12: 7 };
const perBeat = Object.fromEntries(Object.keys(TARGET).map((beat) => [beat, { seconds: 0, takes: [] }]));
for (const sidecar of sidecars) {
  const clip = path.join(OUT, `${sidecar.take}.mp4`);
  if (!existsSync(clip)) continue;
  const seconds = duration(clip);
  for (const beat of sidecar.beats ?? []) {
    if (!perBeat[beat]) continue;
    perBeat[beat].seconds += seconds;
    perBeat[beat].takes.push(`${sidecar.take}${sidecar.staged ? ' (STAGED)' : ''}`);
  }
}
console.log('\n### Footage per beat\n');
console.log('| Beat | Target | Recorded in takes serving it | Takes |');
console.log('|---|---|---|---|');
for (const [beat, entry] of Object.entries(perBeat)) {
  console.log(`| ${beat} | ${TARGET[beat]} s | ${entry.seconds ? `${entry.seconds.toFixed(0)} s` : 'none (plates in the edit)'} | ${entry.takes.join(', ') || '-'} |`);
}
