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
// A take's beats: the ones its name leads with, plus the sidecar's; B2 (the Tavernkeeper's own card) only where
// that card was actually filmed (a `tavernkeeper-card` still exists).
function beatsOf(sidecar) {
  const fromName = sidecar.take.match(/^((?:B\d+-)+)/)?.[1].split('-').filter(Boolean) ?? [];
  const all = new Set([...fromName, ...(sidecar.beats ?? [])]);
  const card = (sidecar.recording.stills ?? []).some((still) => still.name === 'tavernkeeper-card');
  if (!card) all.delete('B2');
  return [...all].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}
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
  rows.push(`| \`${clip}\` | clip | ${beatsOf(sidecar).join(', ')} | ${sidecar.viewport} | ${duration(path.join(OUT, clip)).toFixed(1)} s | ${label(sidecar)} | ${notes.join('; ')} |`);
  for (const still of sidecar.recording.stills ?? []) {
    const name = path.basename(still.file);
    if (!existsSync(path.join(OUT, name))) continue;
    rows.push(`| \`${name}\` | still | ${beatsOf(sidecar).join(', ')} | ${sidecar.viewport} | at ${Number(still.t).toFixed(1)} s | ${sidecar.staged ? 'STAGED' : 'real'} | ${still.name} |`);
  }
  for (const extra of readdirSync(OUT).filter((name) => name.startsWith(`${sidecar.take}-`) && name.endsWith('.png'))) {
    rows.push(`| \`${extra}\` | still | ${beatsOf(sidecar).join(', ')} | ${sidecar.viewport} | framed | ${sidecar.staged ? 'STAGED' : 'real'} | ${extra.slice(sidecar.take.length + 1, -4)} (element frame) |`);
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

// Footage per beat against the treatment's target lengths (the shape table). "Usable" is measured from each take's
// own marks, one rule per beat, so it counts the stretch that shows the beat and not the whole take:
//   B1 the relight to the take's end (or 60 s) | B2 the Tavernkeeper's card (6 s, CARD_MS) | B3 the menu to the typed
//   name plus 3 s | B4 Begin to the ford beacon (the Claim) or 5 s of issue No. 1 (the menu takes) | B5 the first
//   FREED label less 3 s to the last plus 5 s | B6 the walk (entry walks), 20 s around golden (Night Shift), the HUD-off
//   entry (the Baron) | B7 golden less 20 s to the relight | B8 each taunt's 4 s plus the arrival less 5 s to the
//   take's end (the Baron), the whole paper (the Herald) | B9 the HUD-on window around the order | B10 the whole panel.
const TARGET = { B1: 5, B2: 9, B3: 4, B4: 8, B5: 9, B6: 6, B7: 9, B8: 10, B9: 9, B10: 11, B11: 7, B12: 7 };
function usable(sidecar, seconds) {
  const marks = sidecar.recording.marks ?? [];
  const at = (name) => marks.find((mark) => mark.name === name)?.t;
  const all = (name) => marks.filter((mark) => mark.name === name).map((mark) => mark.t);
  const map = sidecar.map ?? '';
  const out = {};
  const beats = beatsOf(sidecar);
  if (beats.includes('B1') && at('relit') !== undefined) out.B1 = Math.min(seconds, at('relit') + 60) - at('relit');
  if (beats.includes('B2')) out.B2 = 6;
  if (map === 'menu') {
    if (at('menu') !== undefined && at('name-typed') !== undefined) out.B3 = at('name-typed') + 3 - at('menu');
    if (at('issue-1') !== undefined) out.B4 = 5;
  }
  if (map === 'the-claim') {
    if (at('begin') !== undefined && at('ford-beacon') !== undefined) out.B4 = at('ford-beacon') - at('begin');
    const freed = all('freed-labelled');
    if (freed.length) out.B5 = freed.at(-1) + 5 - (freed[0] - 3);
    if (at('hud-on-b9') !== undefined && at('hud-off-after-b9') !== undefined) out.B9 = at('hud-off-after-b9') - at('hud-on-b9');
  }
  if (beats.includes('B6') && at('walk') !== undefined && at('walk-end') !== undefined) out.B6 = at('walk-end') - at('walk');
  if (map === 'e1-night-shift') {
    if (at('light-golden') !== undefined) out.B6 = 20;
    if (at('light-golden') !== undefined && at('relit') !== undefined) out.B7 = at('relit') - (at('light-golden') - 20);
  }
  if (map === 'e1-baron') {
    if (at('hud-off-entry') !== undefined && at('hud-on') !== undefined) out.B6 = at('hud-on') - at('hud-off-entry');
    const arrival = marks.find((mark) => mark.cutPoint)?.t;
    out.B8 = all('taunt').length * 4 + (arrival !== undefined ? seconds - (arrival - 5) : 0);
  }
  if (map === 'herald') out.B8 = seconds;
  if (beats.includes('B10')) out.B10 = seconds;
  return out;
}
const perBeat = Object.fromEntries(Object.keys(TARGET).map((beat) => [beat, { recorded: 0, usable: 0, takes: [] }]));
for (const sidecar of sidecars) {
  const clip = path.join(OUT, `${sidecar.take}.mp4`);
  if (!existsSync(clip)) continue;
  const seconds = duration(clip);
  const windows = usable(sidecar, seconds);
  for (const beat of beatsOf(sidecar)) {
    if (!perBeat[beat]) continue;
    perBeat[beat].recorded += seconds;
    perBeat[beat].usable += windows[beat] ?? 0;
    perBeat[beat].takes.push(`${sidecar.take}${sidecar.staged ? ' (STAGED)' : ''}`);
  }
}
console.log('\n### Footage per beat\n');
console.log('| Beat | Target | Usable (from the marks) | Recorded (whole takes) | Takes |');
console.log('|---|---|---|---|---|');
for (const [beat, entry] of Object.entries(perBeat)) {
  const none = 'none (plates in the edit)';
  console.log(`| ${beat} | ${TARGET[beat]} s | ${entry.recorded ? `${entry.usable.toFixed(0)} s` : none} | ${entry.recorded ? `${entry.recorded.toFixed(0)} s` : none} | ${entry.takes.join(', ') || '-'} |`);
}
