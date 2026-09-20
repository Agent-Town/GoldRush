#!/usr/bin/env node
/**
 * s1535 acceptance for the F-1534-2 cure: PROVE IT BY MANUFACTURING THE DEFECT.
 * A passing guard never executes its violation path, so a green is not evidence
 * about the red (the s1299/s1300 standard).
 *
 * For each of the four slug items: delete ITS declaring row from a fixture copy
 * of BACKLOG.md and assert the guard exits 1 naming exactly that slug.
 * Then assert the three ARM A spurious candidates are never named.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const FIX = `${ROOT}/logs/session-scratch/s1535/fixture`;
const SLUGS = [
  'rf-34-hero-y-restore-roundtrip',
  'e3-fairground-socket',
  'bt-04-homestead-automation',
  'f1328-1-drill-yard-census-debt',
];
const SPURIOUS = ['e2-incline', 'calibrate-suite-workers-v2', 'vp-02e-jumper-8way-activation'];

const line1 = fs.readFileSync(`${ROOT}/logs/session-scratch/s1535/prev-line1.txt`, 'utf8').trim();
const backlog = fs.readFileSync(`${ROOT}/tasks/BACKLOG.md`, 'utf8');

function build(backlogText) {
  fs.rmSync(FIX, { recursive: true, force: true });
  fs.mkdirSync(`${FIX}/tasks`, { recursive: true });
  fs.writeFileSync(`${FIX}/STATUS.md`, line1 + '\n');
  fs.writeFileSync(`${FIX}/tasks/BACKLOG.md`, backlogText);
}

function run() {
  try {
    const out = execFileSync('node', [`${ROOT}/scripts/desk-declaration-guard.mjs`, '--root', FIX], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

/** Drop the declaring row for one slug — the line whose 90-char zone keys it. */
function dropRow(text, slug) {
  const SLUG = /`([a-z0-9][a-z0-9-]{6,})`/;
  let dropped = 0;
  const kept = text.split('\n').filter((line) => {
    const body = line.trim().replace(/^[-*]\s+/, '');
    const m = body.slice(0, 90).match(SLUG);
    if (m && m[1] === slug && dropped === 0) { dropped++; return false; }
    return true;
  });
  if (!dropped) throw new Error(`no declaring row found to drop for ${slug}`);
  return kept.join('\n');
}

let pass = 0, fail = 0;

// --- CONTROL: the unmodified board must be GREEN ------------------------------
build(backlog);
const control = run();
if (control.code === 0 && /PASS/.test(control.out)) {
  console.log('✓ CONTROL   rc=0 PASS on the unmodified board');
  console.log('   ' + control.out.split('\n').filter((l) => /desk |with a|undeclared/.test(l)).join(' | '));
  pass++;
} else {
  console.log('✗ CONTROL   expected rc=0 PASS, got rc=' + control.code);
  console.log(control.out);
  fail++;
}

// --- MANUFACTURED DEFECT, one per slug ---------------------------------------
for (const slug of SLUGS) {
  build(dropRow(backlog, slug));
  const r = run();
  const named = r.out.includes(slug);
  const others = SLUGS.filter((s) => s !== slug && new RegExp(`^\\s+${s}\\s*$`, 'm').test(r.out));
  if (r.code === 1 && named && others.length === 0) {
    console.log(`✓ DEFECT    rc=1 and names exactly ${slug}`);
    pass++;
  } else {
    console.log(`✗ DEFECT    ${slug}: rc=${r.code} named=${named} alsoNamed=[${others}]`);
    console.log(r.out);
    fail++;
  }
}

// --- the three ARM A spurious candidates must never be demanded ---------------
build(backlog);
const clean = run();
const leaked = SPURIOUS.filter((s) => new RegExp(`^\\s+${s}`, 'm').test(clean.out));
if (!leaked.length) {
  console.log(`✓ NO-LEAK   none of the ${SPURIOUS.length} flat-scan false items is treated as a desk item`);
  pass++;
} else {
  console.log(`✗ NO-LEAK   spurious items demanded rows: ${leaked.join(', ')}`);
  fail++;
}

fs.rmSync(FIX, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
