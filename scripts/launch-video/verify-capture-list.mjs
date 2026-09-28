// scripts/launch-video/verify-capture-list.mjs: does the treatment's capture list match the files on disk?
// (task launch-video-capture-2, the master's self-check: "a script lists both and diffs them").
//
// Reads the "Phase 2: capture list, as shot" section of docs/marketing/launch-video/treatment.md: the kept table
// (one row per clip or still, file name in backticks in the first column, duration in seconds for clips) and the
// cut table (takes that failed or were cut, kept aside in the output folder's `cut/`). Lists the output folder
// (~/.goldrush/launch-video, or GR_LV_OUT) and its `cut/` folder, then diffs both ways and checks each clip's
// duration with ffprobe (within 0.5 s). Prints the verdict and exits 1 on any mismatch. Node only: no server,
// no browser, no lock needed.
//
// Usage: node scripts/launch-video/verify-capture-list.mjs [--treatment docs/marketing/launch-video/treatment.md]

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({ options: { treatment: { type: 'string', default: 'docs/marketing/launch-video/treatment.md' } } });
const OUT = process.env.GR_LV_OUT ?? path.join(os.homedir(), '.goldrush', 'launch-video');
const MEDIA = /\.(mp4|jpg|png)$/;

const text = readFileSync(args.treatment, 'utf8');
const start = text.indexOf('## Phase 2: capture list, as shot');
if (start < 0) {
  console.error('verify: no "Phase 2: capture list, as shot" section in the treatment');
  process.exit(1);
}
const end = text.indexOf('\n## ', start + 10);
const section = text.slice(start, end < 0 ? undefined : end);

function tableRows(heading) {
  const at = section.indexOf(heading);
  if (at < 0) return [];
  const lines = section.slice(at).split('\n').slice(1);
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (/^-+$/.test(cells[0].replace(/:/g, '')) || cells[0] === 'File') continue;
      const file = cells[0].match(/`([^`]+)`/)?.[1];
      if (file) rows.push({ file, cells });
    } else if (inTable && line.trim() === '') {
      break;
    }
  }
  return rows;
}

const kept = tableRows('### Kept');
const cut = tableRows('### Cut');
const onDisk = existsSync(OUT) ? readdirSync(OUT).filter((name) => MEDIA.test(name) && statSync(path.join(OUT, name)).isFile()) : [];
const cutDir = path.join(OUT, 'cut');
const cutOnDisk = existsSync(cutDir) ? readdirSync(cutDir).filter((name) => MEDIA.test(name)) : [];

const problems = [];
const listed = new Set(kept.map((row) => row.file));
for (const row of kept) if (!onDisk.includes(row.file)) problems.push(`listed as kept, missing on disk: ${row.file}`);
for (const name of onDisk) if (!listed.has(name)) problems.push(`on disk, not listed as kept: ${name}`);
const cutListed = new Set(cut.map((row) => row.file));
for (const row of cut) if (!cutOnDisk.includes(row.file)) problems.push(`listed as cut, missing in cut/: ${row.file}`);
for (const name of cutOnDisk) if (!cutListed.has(name)) problems.push(`in cut/, not listed as cut: ${name}`);

let clips = 0;
let seconds = 0;
for (const row of kept) {
  if (!row.file.endsWith('.mp4') || !onDisk.includes(row.file)) continue;
  const probed = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(OUT, row.file)], { encoding: 'utf8' }).trim());
  const claimed = Number(row.cells.find((cell) => /^\d+(\.\d+)?\s*s$/.test(cell))?.replace(/\s*s$/, ''));
  clips += 1;
  seconds += probed;
  if (!Number.isFinite(claimed) || Math.abs(probed - claimed) > 0.5) problems.push(`duration: ${row.file} treatment ${claimed} s, file ${probed.toFixed(2)} s`);
}

console.log(`verify: treatment kept rows ${kept.length}, on disk ${onDisk.length}; cut rows ${cut.length}, in cut/ ${cutOnDisk.length}; clips ${clips}, ${seconds.toFixed(1)} s of footage`);
if (problems.length) {
  for (const problem of problems) console.log(`MISMATCH ${problem}`);
  console.log(`verify: RED (${problems.length} mismatches)`);
  process.exit(1);
}
console.log('verify: GREEN (the treatment and the disk agree, every clip duration within 0.5 s)');
