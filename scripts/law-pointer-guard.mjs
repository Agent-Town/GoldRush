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

// fileURLToPath, never URL.pathname — the repo path contains a space ("Gold Rush"),
// which URL.pathname percent-encodes into a path that silently matches nothing (F-1255-3).
function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}
const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(arg('--root') || DEFAULT_ROOT);
const BASELINE = path.join(ROOT, 'scripts', 'law-pointer-baseline.json');

const SURFACES = [
  'CLAUDE.md',
  'AGENTS.md',
  'scripts/fire.md',
  '.claude/skills/drain/SKILL.md',
  '.claude/skills/author-task/SKILL.md',
  '.claude/skills/playtest-intake/SKILL.md',
];
const GOAL_LEDGER = 'tasks/goals.json';
const DRAIN_GUARD = 'scripts/drain-block-check.mjs';

// Excluded by NAME with a reason. Never widen this by pattern.
const ILLUSTRATIVE = new Map([
  ['AssayBench.ts:189', 'author-task §0.2 quotes it as an EXAMPLE of a task premise ("the bench is ?debug-gated at AssayBench.ts:189" — go LOOK). The line number is rhetorical, not a claim.'],
  ['e2e/foo.spec.ts:123', 'author-task §5 CITATION LAW template placeholder — a made-up spec showing the required shape.'],
]);

// Excluded by NAME with a reason. Never widen this by pattern.
const KNOWN_ROTTEN = new Map([
  [`${GOAL_LEDGER}[rf-34-hero-y-restore-roundtrip] -> Game.ts:6669`, 'The leaf says this diagnosis coordinate is knowingly rotten. Re-deriving the first divergent write requires rerunning the diagnosis, not guessing a nearby line.'],
]);

// s1278 (F-1278-2): `md` added — law surfaces cite each OTHER by coordinate
// (`scripts/fire.md` -> `.claude/skills/drain/SKILL.md:33`), and those pointers rot
// exactly like code pointers do. They were invisible here until s1278, which is why
// s1275 had to hand-check SKILL.md:33 the guard was built to make unnecessary.
const POINTER = /`?([A-Za-z0-9_./-]+\.(?:mjs|ts|tsx|js|sh|json|md))`?\s*:\s*(\d+)/g;
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
      for (const [, cited, lineNo] of node.blockedReason.matchAll(POINTER)) {
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

if (UPDATE) {
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

const problems = [];
let checked = 0;
for (const p of pointers) {
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
console.log(`  pointers      : ${pointers.length}  (checked ${checked}, illustrative ${pointers.filter((p) => p.state === 'illustrative').length}, known-rotten ${pointers.filter((p) => p.state === 'known-rotten').length})`);

if (problems.length) {
  console.log(`\nFAIL — ${problems.length} pointer problem(s):`);
  for (const p of problems) console.log(`  ${p}`);
  console.log('\nA rotted pointer does not condemn its claim — but in a law it manufactures a false accusation. Re-read, then re-base.');
  process.exit(1);
}
console.log('PASS — every law-surface pointer still lands on the line it was written for.');
process.exit(0);
