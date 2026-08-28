#!/usr/bin/env node
/**
 * law-pointer-guard — the law surfaces cite `file:line`. Those coordinates drift.
 *
 * WHY THIS EXISTS (F-1276-2, and the class above it).
 * CLAUDE.md §4.10b told the next session to go LOOK at `lane-runner-v3.sh:118` to confirm
 * the RETENTION LAW's prune epitaph is still there. By s1276 the epitaph had moved to :139
 * and :118 held an unrelated janitor comment. The law's substance was intact — but a reader
 * obeying the instruction lands on the wrong line and the honest inference is that the
 * epitaph was DELETED: a law violation that never happened. The same fire found the sweep
 * pointer `v3:116` rotted to :137, and `fire.md` §3.0 pointing at :315 for code now at :330.
 *
 * THE CLASS, four instances in three fires:
 *   F-1275-1  a cure never crossed to the sibling script.
 *   F-1275-2  a prohibition outlived the fix that satisfied it.
 *   F-1276-1  a corrected claim never crossed to the sibling LAW SURFACE.
 *   F-1276-2  a law's own pointers rotted out from under it.
 * s1276 swept all 12 pointers by hand and found 3 rotten. A hand sweep is a SNAPSHOT, not a
 * guard — the catalogue's own words. This is the guard.
 *
 * WHAT IT CHECKS — AND WHAT IT DOES NOT.
 * For every `path:line` citation in the law surfaces, plus `blockedReason` on live blocked goal
 * leaves, it resolves the file, reads that line, and fingerprints it (whitespace-normalised
 * sha256/12). Historical note fields and terminal leaves stay out. A changed fingerprint is a RED
 * that says "re-verify this pointer and re-base it", nothing more.
 *   - A BACKLOG line coordinate in a live blockedReason is always a RED. Findings are prepended
 *     to that ledger, so its coordinates are unmaintainable by construction; cite by content.
 *   - It does NOT judge whether the cited line SUPPORTS the claim made about it. Only a
 *     reader can do that. It detects that the ground moved, which is when a reader is needed.
 *   - It does NOT scan prose F-IDs, §-refs, session ids, or dates — only file:line shapes
 *     with a real source extension.
 *   - ILLUSTRATIVE citations (a quoted EXAMPLE of what a premise looks like, a template
 *     placeholder) are excluded by name with a reason, never by pattern — the same
 *     grandfathering discipline as gate-caller-audit and citation-title-guard.
 *   - KNOWN_ROTTEN goal-ledger citations are likewise excluded by name with a reason. They are
 *     reported as rotten, never as `ok`, until the underlying diagnosis is re-derived.
 *   - KNOWN GAP, stated rather than papered over: shorthand coordinates with no file
 *     extension are NOT captured — CLAUDE.md §4.10b writes the scratch-sweep pair as
 *     "v2:76/v3:137", and `v3` matches no source extension. Resolving that shorthand needs a
 *     guess about which file "v3" means, and a guard that guesses is worse than a guard with
 *     a documented blind spot. Write NEW law pointers in full (`scripts/lane-runner-v3.sh:137`)
 *     and they are covered automatically.
 *   - A NEW pointer is a RED until it is baselined. That is deliberate: adding a coordinate
 *     to a law file is exactly when someone should have verified it once.
 *   - THE SCAN'S OWN EDGE, now PRINTED rather than merely written here (F-2197-1, s2197).
 *     SURFACES is a closed, hand-maintained list, so a law surface added to the repo is
 *     invisible until someone edits this file — and for six surfaces nothing ever said so.
 *     Every run now NAMES the law-surface-shaped files it did not scan, with the citation
 *     counts it is declining to check, and prompts for a reason when one is undeclared.
 *     It is ADVISORY and exit-neutral BY DESIGN: STATUS.md alone carries ~2400 citations,
 *     almost all inside frozen handoff archives whose coordinates are deliberately stale,
 *     so widening the scan would red forever and be excused into uselessness inside a week.
 *     The lesson is F-2196-1's, one level up: a boundary declared in a COMMENT — like the
 *     KNOWN GAP above — is one only its author sees; a boundary the instrument PRINTS is
 *     one every reader sees.
 *
 * usage:
 *   node scripts/law-pointer-guard.mjs            # check (exit 1 on drift/new/unresolvable)
 *   node scripts/law-pointer-guard.mjs --report   # list every pointer and its state
 *   node scripts/law-pointer-guard.mjs --update   # re-base AFTER you have re-verified by eye
 *   node scripts/law-pointer-guard.mjs --root <dir>   # for tests / detached worktrees
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { LAW_SURFACES } from './law-surfaces.mjs';

// fileURLToPath, never URL.pathname — the repo path contains a space ("Gold Rush"),
// which URL.pathname percent-encodes into a path that silently matches nothing (F-1255-3).
function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}
const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(arg('--root') || DEFAULT_ROOT);
const BASELINE = path.join(ROOT, 'scripts', 'law-pointer-baseline.json');

// s2199 (F-2199-1): the list itself moved to scripts/law-surfaces.mjs, unchanged, because
// gate-caller-audit.mjs now needs the SAME six paths to answer a different question (a law
// surface is a CALLER). Pasting a second copy there is the defect s2198 explicitly refused;
// one list, two readers, so adding a surface is one edit. Everything below is untouched.
const SURFACES = LAW_SURFACES;
const GOAL_LEDGER = 'tasks/goals.json';
const DRAIN_GUARD = 'scripts/drain-block-check.mjs';

// s2197 (F-2197-1): SURFACES is a CLOSED, hand-maintained list. A law surface added to the
// repo — a fourth skill, a new root .md — is invisible here until someone edits this file,
// and nothing ever says so. That is the F-2196-1 shape one level up: this guard's header
// already declares a "KNOWN GAP" in prose, and prose is a boundary only its author sees.
// So the guard NAMES what it did not scan, every run, with the citation counts it is
// declining to check. It stays ADVISORY and never moves the exit code: widening the scan
// is the thing that must not happen by accident (see STATUS.md's reason below).
//
// Excluded by NAME with a reason. Never widen this by pattern.
const NOT_SCANNED = new Map([
  ['STATUS.md', 'Its lettered `s9<letter>` law bullets ARE live law (fire.md §0 orders every fire to read them), but almost every citation it carries sits in frozen `- **sNNNN handoff` archives whose coordinates are DELIBERATELY stale — the RETENTION LAW restates rather than deletes, so the drift IS the provenance. Guarding those would red forever and be excused into uselessness inside a week (F-1460-1, the `cross-engine` fate). Measured s2197: both live law-bullet pointers were accurate.'],
]);

// s2342 (F-2342-1): the families below are ONE table, read by both the enumeration and the
// declaration at the bottom, so the printed scan space cannot drift from what was actually
// scanned. That is this file's own rule, stated twenty lines down about the live/frozen split:
// derive from the file, never transcribe — a hardcoded description is a defect awaiting the
// next edit.
//
// WHY IT IS PRINTED AT ALL. F-2197-1 made the closed SURFACES list visible, and its lesson was
// F-2196-1's: "a boundary declared in a COMMENT is one only its author sees; a boundary the
// instrument PRINTS is one every reader sees." That cure's OWN boundary then lived in a comment
// -- the one-line "three families" header this block replaces -- so `NOT SCANNED : 6` reads as a
// census of the REPO when it can only ever be a census of three directories. Measured s2342:
// 13 .md files are named by a law surface, exist, are tracked, and are invisible to BOTH lists
// (assets/LEDGER.md, tasks/BACKLOG.md, logs/suite-red-inventory.md, docs/HANDOVER-2026-07-20.md
// which CLAUDE.md 1 makes read-first, and tasks/engine-era-law-v3.md, whose name is "law").
//
// SEVERITY, HONESTLY: no false green, no wrong verdict, and ZERO casualties -- of the 22
// path-shaped coordinates in those files, 22 resolve and 0 rot. Like F-2197-1 and F-2198-1
// before it, the defect cured here is the ABSENCE OF THE DECLARATION, not a casualty.
//
// AND THE FAMILIES ARE DELIBERATELY NOT WIDENED. law-surfaces.mjs says "Never widen by pattern"
// and gives the reason: tasks/BACKLOG.md alone carries 2681 coordinates, almost all in frozen
// findings prose whose drift IS the provenance, so scanning it would red forever and be excused
// into uselessness inside a week (F-1460-1, the `cross-engine` fate). Declaring the edge is the
// cure; moving it is the thing that must not happen by accident.
const SCAN_FAMILIES = [
  { label: '<root>/*.md', of: (listing) => listing('').filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => e.name) },
  { label: 'scripts/*.md', of: (listing) => listing('scripts').filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => `scripts/${e.name}`) },
  { label: '.claude/skills/*/SKILL.md', of: (listing) => listing('.claude/skills').filter((e) => e.isDirectory()).map((e) => `.claude/skills/${e.name}/SKILL.md`) },
];

const familyListing = (dir) => { try { return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }); } catch { return []; } };

/** What the candidate enumeration below covered — DERIVED from the same table it enumerates. */
function scanSpace() {
  return SCAN_FAMILIES.map((f) => ({ label: f.label, count: f.of(familyListing).length }));
}

/** The families SURFACES draws from. A new law surface appears in one of these -- or, if it
 *  lives anywhere else in the repo, in NONE of them; that edge is declared, not guessed. */
function unscannedSurfaces() {
  const listing = familyListing;
  const candidates = SCAN_FAMILIES.flatMap((f) => f.of(listing));
  const out = [];
  for (const rel of candidates) {
    if (SURFACES.includes(rel)) continue;
    let src;
    try { src = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { continue; }
    // Split live LAW bullets from frozen handoff archives, derived from the file itself
    // rather than transcribed — a hardcoded count is a defect awaiting the next handoff.
    let live = 0, frozen = 0;
    for (const line of src.split('\n')) {
      const n = [...line.matchAll(new RegExp(POINTER.source, 'g'))].length;
      if (!n) continue;
      if (/^- \*\*s\d+[a-z]*\s/.test(line)) { if (/^- \*\*s\d+[a-z]+\s/.test(line)) live += n; else frozen += n; }
      else frozen += n;
    }
    out.push({ rel, live, frozen, total: live + frozen });
  }
  return out;
}

// Excluded by NAME with a reason. Never widen this by pattern.
const ILLUSTRATIVE = new Map([
  ['AssayBench.ts:189', 'author-task §0.2 quotes it as an EXAMPLE of a task premise ("the bench is ?debug-gated at AssayBench.ts:189" — go LOOK). The line number is rhetorical, not a claim.'],
  ['e2e/foo.spec.ts:123', 'author-task §5 CITATION LAW template placeholder — a made-up spec showing the required shape.'],
]);

// s2198 (F-2198-1): a law surface does not only cite lines — it ORDERS fires to run
// INSTRUMENTS, and it names most of them WITHOUT a coordinate ("run `node
// scripts/lane-usable.mjs <slot>` before any refill"). POINTER below requires `:<digits>`,
// so every one of those bare citations was invisible here; and gate-caller-audit cannot
// see them either, because it declares law files outside its edge vocabulary AND its
// subject set is LEXICAL — a script earns a reviewed grandfather entry only if its
// filename happens to contain guard|assert|check|audit|contract|ratchet. Measured s2198:
// 23 scripts are cited by a law surface as an instrument a fire must run, and 9 of them
// are invisible to that audit by name alone (lane-usable, lane-freeze-classify,
// lane-absorbed-lines, authorable-candidates, master-shipped-classifier, extract-alpha,
// gazette-backfill-sweep, gate-battery, red-inventory-lookup).
//
// So a law could order every fire to run an instrument that does not exist, and NOTHING
// would say so. That is not hypothetical: F-1667-1 is this shape one level down — a
// gate-caller baseline entry excused two guards from the reachability audit for 133 fires
// on the strength of a caller in scripts/fire.md that had never existed.
//
// Measured s2198 across all six SURFACES: 31 distinct scripts/ citations, 0 dead. The
// defect cured here is the ABSENCE OF THE CHECK, not a casualty — the same honest reading
// as F-2197-1. It reds, rather than warning, because it is precisely the UNRESOLVABLE
// defect this file already reds on, differing only by whether a line number was typed.
const INSTRUMENT = /`?(scripts\/[A-Za-z0-9_.-]+\.(?:mjs|sh))`?(\s*:\s*\d+)?/g;

// Excluded by NAME with a reason. Never widen this by pattern.
const ILLUSTRATIVE_INSTRUMENTS = new Map([]);

/** Bare instrument citations in the law surfaces: does the named tool actually exist? */
function collectInstruments() {
  const found = [];
  const seen = new Set();
  for (const surface of SURFACES) {
    let src;
    try {
      src = fs.readFileSync(path.join(ROOT, surface), 'utf8');
    } catch {
      continue; // a MISSING surface is already its own red, above
    }
    for (const m of src.matchAll(INSTRUMENT)) {
      if (m[2]) continue; // has a :line — POINTER owns it, and double-reporting one defect twice helps nobody
      const cited = m[1];
      const id = `${surface} -> ${cited}`;
      if (seen.has(id)) continue;
      seen.add(id);
      if (ILLUSTRATIVE_INSTRUMENTS.has(cited)) {
        found.push({ surface, cited, id, state: 'illustrative' });
        continue;
      }
      found.push({ surface, cited, id, state: resolveCited(cited) ? 'resolved' : 'dead' });
    }
  }
  return found;
}

// Excluded by NAME with a reason. Never widen this by pattern.
const KNOWN_ROTTEN = new Map([
  [`${GOAL_LEDGER}[rf-34-hero-y-restore-roundtrip] -> Game.ts:6669`, 'The leaf says this diagnosis coordinate is knowingly rotten. Re-deriving the first divergent write requires rerunning the diagnosis, not guessing a nearby line.'],
]);

// s1278 (F-1278-2): `md` added — law surfaces cite each OTHER by coordinate
// (`scripts/fire.md` -> `.claude/skills/drain/SKILL.md:33`), and those pointers rot
// exactly like code pointers do. They were invisible here until s1278, which is why
// s1275 had to hand-check SKILL.md:33 the guard was built to make unnecessary.
const POINTER = /`?([A-Za-z0-9_./-]+\.(?:mjs|ts|tsx|js|sh|json|md))`?\s*:\s*(\d+)/g;
const BACKLOG_COORDINATE = /\b((?:tasks\/)?BACKLOG(?:\.md)?\s*:\s*\d+)\b/g;
const SEARCH_DIRS = ['', 'scripts', 'src', 'e2e', 'functions'];

const REPORT = process.argv.includes('--report');
const UPDATE = process.argv.includes('--update');

function normalise(line) {
  return line.replace(/\s+/g, ' ').trim();
}
function fingerprint(line) {
  return crypto.createHash('sha256').update(normalise(line)).digest('hex').slice(0, 12);
}

function terminalStatuses() {
  const source = fs.readFileSync(path.join(ROOT, DRAIN_GUARD), 'utf8');
  const readSet = (name) => {
    const definition = source.match(new RegExp(`(?:export\\s+)?const ${name} = new Set\\(\\[([^\\]]*)\\]\\)`))?.[1];
    if (!definition) throw new Error(`Cannot read ${name} from ${DRAIN_GUARD}`);
    return [...definition.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  };
  return new Set([...readSet('TERMINAL_SHIPPED_STATUSES'), ...readSet('TERMINAL_CLOSED_STATUSES')]);
}

/** Resolve a cited path: as written, then under the usual roots, then a unique basename hit. */
function resolveCited(cited) {
  const direct = path.join(ROOT, cited);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return path.relative(ROOT, direct);
  const base = path.basename(cited);
  for (const dir of SEARCH_DIRS) {
    const p = path.join(ROOT, dir, base);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return path.relative(ROOT, p);
  }
  const hits = [];
  const walk = (dir, depth) => {
    if (depth > 4 || hits.length > 1) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, depth + 1);
      else if (e.name === base) hits.push(path.relative(ROOT, full));
    }
  };
  walk(path.join(ROOT, 'src'), 0);
  return hits.length === 1 ? hits[0] : null;
}

function collect() {
  const found = [];
  const add = (surface, cited, lineNo, id = `${surface} -> ${cited}:${lineNo}`) => {
    const key = `${cited}:${lineNo}`;
    if (KNOWN_ROTTEN.has(id)) {
      found.push({ surface, cited, lineNo: +lineNo, key, id, state: 'known-rotten' });
      return;
    }
    if (ILLUSTRATIVE.has(key)) {
      found.push({ surface, cited, lineNo: +lineNo, key, id, state: 'illustrative' });
      return;
    }
    const target = resolveCited(cited);
    if (!target) {
      found.push({ surface, cited, lineNo: +lineNo, key, id, state: 'unresolvable' });
      return;
    }
    const lines = fs.readFileSync(path.join(ROOT, target), 'utf8').split('\n');
    if (+lineNo < 1 || +lineNo > lines.length) {
      found.push({ surface, cited, lineNo: +lineNo, key, id, target, state: 'out-of-range', length: lines.length });
      return;
    }
    const raw = lines[+lineNo - 1];
    found.push({
      surface, cited, lineNo: +lineNo, key, id, target,
      state: 'resolved',
      fingerprint: fingerprint(raw),
      excerpt: normalise(raw).slice(0, 100),
    });
  };

  for (const surface of SURFACES) {
    const abs = path.join(ROOT, surface);
    if (!fs.existsSync(abs)) {
      found.push({ surface, key: surface, state: 'surface-missing' });
      continue;
    }
    const text = fs.readFileSync(abs, 'utf8');
    for (const [, cited, lineNo] of text.matchAll(POINTER)) {
      add(surface, cited, lineNo);
    }
  }

  const ledgerPath = path.join(ROOT, GOAL_LEDGER);
  if (!fs.existsSync(ledgerPath)) {
    found.push({ surface: GOAL_LEDGER, key: GOAL_LEDGER, state: 'surface-missing' });
    return found;
  }
  const terminal = terminalStatuses();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    if (typeof node.taskFile === 'string' && !terminal.has(node.status) && typeof node.blockedReason === 'string') {
      for (const [, coordinate] of node.blockedReason.matchAll(BACKLOG_COORDINATE)) {
        found.push({ surface: GOAL_LEDGER, id: `${GOAL_LEDGER}[${node.id}]`, coordinate, state: 'backlog-coordinate' });
      }
      const resolvablePointers = node.blockedReason.replace(BACKLOG_COORDINATE, '');
      for (const [, cited, lineNo] of resolvablePointers.matchAll(POINTER)) {
        add(GOAL_LEDGER, cited, lineNo, `${GOAL_LEDGER}[${node.id}] -> ${cited}:${lineNo}`);
      }
    }
    for (const child of [...(node.subgoals ?? []), ...(node.tasks ?? [])]) walk(child);
  };
  walk(JSON.parse(fs.readFileSync(ledgerPath, 'utf8')).goals);
  return found;
}

const pointers = collect();
const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : { pointers: {} };
const backlogProblems = pointers
  .filter((p) => p.state === 'backlog-coordinate')
  .map((p) => `BACKLOG COORDINATE  ${p.id} — "${p.coordinate}". Cite BACKLOG by CONTENT (a grep target); write historical line numbers as prose. Coordinates into this file rot on every fire that files a finding.`);

if (UPDATE) {
  if (backlogProblems.length) {
    console.log(`law-pointer-guard: baseline NOT re-based — ${backlogProblems.length} BACKLOG coordinate problem(s):`);
    for (const problem of backlogProblems) console.log(`  ${problem}`);
    process.exit(1);
  }
  const next = { pointers: {} };
  for (const p of pointers) {
    if (p.state !== 'resolved') continue;
    next.pointers[p.id] = { target: p.target, line: p.lineNo, fingerprint: p.fingerprint, excerpt: p.excerpt };
  }
  next._why = 'Fingerprints of the lines cited by the law surfaces. Re-base ONLY after re-reading the cited line and confirming it still supports the claim. See scripts/law-pointer-guard.mjs.';
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`law-pointer-guard: baseline re-based — ${Object.keys(next.pointers).length} pointers.`);
  process.exit(0);
}

const instruments = collectInstruments();
const problems = [
  ...backlogProblems,
  ...instruments
    .filter((i) => i.state === 'dead')
    .map(
      (i) =>
        `DEAD INSTRUMENT  ${i.id} — the law orders fires to run it and no such file exists.\n      A law that names a tool nobody can run is an instruction that silently does nothing (F-1667-1's shape).\n      Fix the path, restore the tool, or add it to ILLUSTRATIVE_INSTRUMENTS with a reason.`,
    ),
];
let checked = 0;
for (const p of pointers) {
  if (p.state === 'backlog-coordinate') continue;
  if (p.state === 'surface-missing') { problems.push(`LAW SURFACE MISSING: ${p.surface}`); continue; }
  if (p.state === 'illustrative') {
    if (REPORT) console.log(`  illustrative  ${p.id}\n      reason: ${ILLUSTRATIVE.get(p.key)}`);
    continue;
  }
  if (p.state === 'known-rotten') {
    if (REPORT) console.log(`  known-rotten ${p.id}\n      reason: ${KNOWN_ROTTEN.get(p.id)}`);
    continue;
  }
  if (p.state === 'unresolvable') { problems.push(`UNRESOLVABLE  ${p.id} — no such file. Fix the path, or add it to ILLUSTRATIVE with a reason.`); continue; }
  if (p.state === 'out-of-range') { problems.push(`OUT OF RANGE  ${p.id} — ${p.target} has ${p.length} lines. The pointer is past EOF: re-verify and re-base.`); continue; }
  checked++;
  const known = baseline.pointers?.[p.id];
  if (!known) {
    problems.push(`NEW POINTER   ${p.id} -> ${p.target}:${p.lineNo}\n      now: "${p.excerpt}"\n      Verify by eye that this line supports the claim, then: node scripts/law-pointer-guard.mjs --update`);
    continue;
  }
  if (known.fingerprint !== p.fingerprint) {
    problems.push(`POINTER DRIFT ${p.id}\n      was: "${known.excerpt}"\n      now: "${p.excerpt}"\n      The cited line changed. Re-read it: does it still support the claim? Re-base or repoint, then --update.`);
    continue;
  }
  if (REPORT) console.log(`  ok            ${p.id} -> ${p.target}:${p.lineNo}  "${p.excerpt.slice(0, 60)}"`);
}

console.log('law-pointer-guard — do the law surfaces still point at what they claim?');
console.log(`  surfaces      : ${SURFACES.length + 1}`);

// ADVISORY, always exit-neutral. This declares the edge of the scan so a NEW law surface is
// visible on the next run rather than after N days (F-2197-1, after F-2196-1).
//
// s2342 (F-2342-1): printed ALWAYS, including the happy path, because a declaration that
// appears only when something is unscanned re-creates the ambiguity it removes -- a reader of
// "NOT SCANNED : 6" cannot otherwise tell a census of the repo from a census of three
// directories. Derived from SCAN_FAMILIES, so it cannot drift from the enumeration.
const space = scanSpace();
console.log(`  scan space    : ${space.length} famil(ies), ${space.reduce((n, f) => n + f.count, 0)} candidate(s) — ${space.map((f) => `${f.label} (${f.count})`).join(', ')}`);
console.log('                  a law surface OUTSIDE these is invisible to BOTH lists (F-2342-1)');

const unscanned = unscannedSurfaces();
if (unscanned.length) {
  console.log(`  NOT SCANNED   : ${unscanned.length} law-surface-shaped file(s) outside the closed SURFACES list —`);
  for (const u of unscanned) {
    const split = u.total ? `${u.total} citation(s)${u.live ? `, ${u.live} in LIVE law bullets` : ''}` : 'no citations — exclusion costs nothing';
    console.log(`      ${u.rel}  (${split})`);
    const why = NOT_SCANNED.get(u.rel);
    if (why) console.log(`        reason: ${why}`);
    else if (u.total) console.log('        reason: NONE DECLARED — if this is law, add it to SURFACES; if not, add it to NOT_SCANNED with a reason.');
  }
}
console.log(`  pointers      : ${pointers.length}  (checked ${checked}, illustrative ${pointers.filter((p) => p.state === 'illustrative').length}, known-rotten ${pointers.filter((p) => p.state === 'known-rotten').length})`);
console.log(`  instruments   : ${instruments.length}  (resolved ${instruments.filter((i) => i.state === 'resolved').length}, dead ${instruments.filter((i) => i.state === 'dead').length}, illustrative ${instruments.filter((i) => i.state === 'illustrative').length})`);
if (REPORT) for (const i of instruments) console.log(`  ${i.state === 'dead' ? 'DEAD' : 'ok  '}          ${i.id}`);

if (problems.length) {
  console.log(`\nFAIL — ${problems.length} law-surface problem(s):`);
  for (const p of problems) console.log(`  ${p}`);
  console.log('\nA rotted pointer does not condemn its claim — but in a law it manufactures a false accusation. Re-read, then re-base.');
  process.exit(1);
}
console.log('PASS — every law-surface pointer still lands on the line it was written for.');
process.exit(0);
