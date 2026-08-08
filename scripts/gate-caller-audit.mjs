#!/usr/bin/env node
/**
 * gate-caller-audit.mjs — for every gate this repo owns, WHO CALLS IT?
 *
 * WHY THIS EXISTS (F-1126-1, seven fires; F-1252-2; F-1253-1):
 * F-1126-1 has asked "wire the guards into the gate" since s1126. Fire after fire
 * restated it. s1251 finally ATTEMPTED it and found the guard unwireable as
 * written. s1252 then asked the question nobody had asked -- not "does it pass?"
 * but "is anyone asking it?" -- and found scripts/citation-title-guard.mjs had a
 * test, a baseline, a ratchet, and a usage line reading `# gate`, and NO CALLER.
 * It had been RED against the real tree for nine fires while nine fires reported
 * full green batteries. An unrun guard is an unread verdict; a RED unrun guard is
 * worse, because the tree looks clean.
 *
 * s1252 answered that for ONE guard, by hand, with a grep over package.json and
 * scripts/. This exists so the NEXT one is found by a battery instead of by
 * luck. The question "who calls this gate" is a graph query, and a graph query
 * belongs in a script, not in a fire's head.
 *
 * WHAT IT DOES
 * Builds the reachable set of gates from the real entrypoints -- the GUARDS
 * roster in run-guards.mjs, the pipeline shells, the node --test roster, and the
 * drain minimum -- following edges through package.json script bodies,
 * scripts/**, AND *.config.ts webServer commands. Anything gate-shaped that the
 * closure never reaches is an ORPHAN. Known orphans are grandfathered in
 * scripts/gate-caller-baseline.json with a written reason; a NEW one exits 1.
 *
 * THE CONFIG EDGE IS NOT OPTIONAL (s1253, found in this script's own first draft):
 * `build:release` is invoked by NOTHING in package.json or scripts/ -- its only
 * caller is `webServer.command` in playwright.release.config.ts. A resolver that
 * reads only package.json and scripts/ reports it as an orphan and is WRONG.
 * That is s1247's lesson (a negative result has a vocabulary) aimed at the
 * instrument rather than the subject: this audit's edge vocabulary IS a claim,
 * so it is enumerated in EDGE_SOURCES below and asserted by the fixture test.
 *
 * AND IT REFUSES RATHER THAN GREENING OVER AN UNREAD SUBJECT (F-1251-2's class,
 * now five instances: s1248/s1249/s1250 drain-block-check, s1251
 * assert-release-build, s1252 citation-title-guard). A caller audit has an
 * especially nasty vacuous mode: if the resolver silently fails to build the
 * graph, EVERY gate looks unreachable and the ratchet drowns in false orphans --
 * or, grandfather them once and it greens forever having resolved nothing. So the
 * anchors below (gates whose callers are structurally certain) must come back
 * REACHED, or this exits 2 and says the resolver is broken.
 *
 * usage:
 *   node scripts/gate-caller-audit.mjs                  # gate (exit 1 on a new orphan)
 *   node scripts/gate-caller-audit.mjs --include-untracked
 *   node scripts/gate-caller-audit.mjs --report         # never gates; prints the graph
 *   node scripts/gate-caller-audit.mjs --update-baseline
 *   node scripts/gate-caller-audit.mjs --root <dir>     # for fixtures
 *
 * --include-untracked adds `git ls-files --others --exclude-standard` to the
 * subject set. It REFUSES with --update-baseline: an uncommitted path cannot be
 * grandfathered because it may never enter git.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}
const ROOT = path.resolve(arg('--root') || process.cwd());
const BASELINE = arg('--baseline') || path.join(ROOT, 'scripts', 'gate-caller-baseline.json');
const REPORT = process.argv.includes('--report');
const UPDATE = process.argv.includes('--update-baseline');
const INCLUDE_UNTRACKED = process.argv.includes('--include-untracked');

if (UPDATE && INCLUDE_UNTRACKED) {
  console.error('gate-caller-audit: REFUSING — --update-baseline cannot be combined with --include-untracked.');
  console.error('  An uncommitted path cannot be grandfathered because it may never enter git.');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Subject: which names are GATES? Not every npm script is one. `dev`, `preview`,
// `census`, `mint:prizes`, `inspect:canvas` are human tools -- nothing is wrong
// when no battery calls them, and ratcheting on them would train fires to ignore
// this guard. A gate is something whose whole purpose is to return a verdict.
// ---------------------------------------------------------------------------
const GATE_NAME = /^(test|verify|build):|^test$/;
const GUARDISH_FILE = /(guard|assert|check|audit|contract|ratchet)/i;
// Scratch probes from past fires: named for their session, never wired on purpose.
const SCRATCH_FILE = /^scripts\/tmp-s\d+-/;

// Gates whose callers are structurally certain. If the resolver cannot reach
// THESE, it is broken and every other verdict it prints is worthless.
const ANCHORS = ['npm:test:node-guards', 'npm:test:task-guards', 'scripts/run-guards.mjs'];

// The edge vocabulary, written down because it is a claim (see header).
const EDGE_SOURCES = ['package.json scripts', 'scripts/**.mjs', 'scripts/**.sh', '*.config.ts', '.github/**'];

// ---------------------------------------------------------------------------
let untracked = [];
function tracked() {
  const r = spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return null;
  const files = r.stdout.split('\n').filter(Boolean);
  if (!INCLUDE_UNTRACKED) return files;
  const u = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (u.status !== 0) return null;
  untracked = u.stdout.split('\n').filter(Boolean);
  return [...new Set([...files, ...untracked])];
}

function readIf(rel) {
  const p = path.join(ROOT, rel);
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

// Strip comments so a MENTION is never counted as a CALL. run-guards.mjs has a
// 40-line header naming half the guards in prose; treating that as edges would
// make every guard look reached.
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
    .replace(/^\s*#(?!!).*$/gm, ' ');
}

function edgesOf(text) {
  const body = stripComments(text);
  const out = new Set();
  for (const m of body.matchAll(/npm(?:\s+run|['"\s,\]]+run)['"\s,\]]*['"]?([\w:-]+)/g)) out.add('npm:' + m[1]);
  for (const m of body.matchAll(/['"`]((?:test|verify|build):[\w:-]+)['"`]/g)) out.add('npm:' + m[1]);
  for (const m of body.matchAll(/scripts\/[\w.-]+\.(?:mjs|sh|ts)/g)) out.add(m[0]);
  for (const m of body.matchAll(/['"`]\.\/([\w.-]+\.(?:mjs|sh))['"`]/g)) out.add('scripts/' + m[1]);
  return out;
}

const files = tracked();
if (files === null) {
  console.error('gate-caller-audit: REFUSING — `git ls-files` failed in ' + ROOT + '.');
  console.error('  The subject is derived from git, not from readdir, so there is nothing to audit.');
  process.exit(2);
}

let pkg = null;
try {
  pkg = JSON.parse(readIf('package.json'));
} catch {
  /* handled below */
}
const scripts = (pkg && pkg.scripts) || {};
const scriptFiles = files.filter((f) => f.startsWith('scripts/') && /\.(mjs|sh)$/.test(f));
const configFiles = files.filter((f) => /(^|\/)[\w.-]*config\.ts$/.test(f));
const workflowFiles = files.filter((f) => f.startsWith('.github/'));

// --- REFUSALS: an audit that read nothing has proved nothing --------------
if (Object.keys(scripts).length === 0) {
  console.error('gate-caller-audit: REFUSING — package.json has no `scripts` block.');
  console.error(
    '  Every gate in this repo is an npm script or is invoked by one, so an empty scripts\n' +
      '  block means the subject is empty -- not that every gate has a caller.\n' +
      '  Likely cause: --root points one directory off, or package.json is unreadable.',
  );
  process.exit(2);
}
if (scriptFiles.length === 0) {
  console.error('gate-caller-audit: REFUSING — `git ls-files` matched no scripts/*.{mjs,sh}.');
  console.error(
    '  The guards this audit exists to protect all live there. Zero of them means the tree\n' +
      '  moved (or scripts/ is untracked), not that there are no guards to check.',
  );
  process.exit(2);
}

// --- ROOTS: what does something OUTSIDE package.json actually invoke? -----
const roots = new Set();
// (a) the full battery's own roster, read out of run-guards.mjs
for (const e of edgesOf(readIf('scripts/run-guards.mjs'))) if (e.startsWith('npm:')) roots.add(e);
roots.add('npm:test:guards');
// (b) the drain minimum (CLAUDE.md §6 "tsc clean · build green · its own spec · adjacent suites")
roots.add('npm:build');
roots.add('npm:test');
// (c) whatever the pipeline shells invoke — fires and the lane runner live here
for (const sh of scriptFiles.filter((f) => f.endsWith('.sh'))) for (const e of edgesOf(readIf(sh))) roots.add(e);
// (d) the node --test roster is itself a caller of every file in its argv
for (const e of edgesOf(scripts['test:node-guards'] || '')) roots.add(e);
// (e) CI, if it ever exists
for (const w of workflowFiles) for (const e of edgesOf(readIf(w))) roots.add(e);

// --- transitive closure ---------------------------------------------------
const reached = new Map();
const queue = [];
for (const r of roots) {
  reached.set(r, '<ROOT>');
  queue.push(r);
}
while (queue.length) {
  const cur = queue.shift();
  let text = null;
  if (cur.startsWith('npm:')) {
    const name = cur.slice(4);
    if (!(name in scripts)) continue;
    text = scripts[name];
  } else if (scriptFiles.includes(cur) || configFiles.includes(cur)) {
    text = readIf(cur);
  } else continue;
  for (const nxt of edgesOf(text)) {
    if (reached.has(nxt)) continue;
    reached.set(nxt, cur);
    queue.push(nxt);
  }
}
// A config file is reached-from-nothing by design (playwright loads it by name),
// so its webServer edges are roots too — this is the vocabulary gap the header
// describes. Applied AFTER the first closure so `via` still names the config.
for (const cfg of configFiles) {
  for (const e of edgesOf(readIf(cfg))) {
    if (reached.has(e)) continue;
    reached.set(e, cfg);
    queue.push(e);
  }
}
while (queue.length) {
  const cur = queue.shift();
  let text = null;
  if (cur.startsWith('npm:')) {
    const name = cur.slice(4);
    if (!(name in scripts)) continue;
    text = scripts[name];
  } else if (scriptFiles.includes(cur) || configFiles.includes(cur)) {
    text = readIf(cur);
  } else continue;
  for (const nxt of edgesOf(text)) {
    if (reached.has(nxt)) continue;
    reached.set(nxt, cur);
    queue.push(nxt);
  }
}

// --- the resolver must prove itself before its verdicts count -------------
const brokenAnchors = ANCHORS.filter((a) => !reached.has(a));
if (brokenAnchors.length && !REPORT) {
  console.error('gate-caller-audit: REFUSING — the resolver did not reach its own anchors.');
  console.error(
    '  unreached anchors: ' +
      brokenAnchors.join(', ') +
      '\n' +
      '  These gates have structurally certain callers (run-guards.mjs names them, package.json\n' +
      '  defines them). If the graph cannot find THOSE, it did not build, and every "ORPHAN" it\n' +
      '  prints is a false one. Fix the edge vocabulary (see EDGE_SOURCES) -- do not grandfather.',
  );
  process.exit(2);
}

// --- classify ------------------------------------------------------------
const subjects = [];
for (const name of Object.keys(scripts)) {
  if (!GATE_NAME.test(name)) continue;
  subjects.push({ key: 'npm:' + name, kind: 'npm script', via: reached.get('npm:' + name) || null });
}
for (const f of scriptFiles) {
  if (!f.endsWith('.mjs') || f.endsWith('.test.mjs')) continue;
  if (!GUARDISH_FILE.test(f) || SCRATCH_FILE.test(f)) continue;
  subjects.push({ key: f, kind: 'guard script', via: reached.get(f) || null });
}
const orphans = subjects.filter((s) => !s.via);

if (subjects.length === 0) {
  console.error('gate-caller-audit: REFUSING — zero gate-shaped subjects found.');
  console.error(
    '  ' +
      Object.keys(scripts).length +
      ' npm scripts and ' +
      scriptFiles.length +
      ' scripts/ files were read, and none matched\n' +
      '  the gate patterns. The naming convention moved; re-point GATE_NAME/GUARDISH_FILE\n' +
      '  rather than banking a pass over an empty subject.',
  );
  process.exit(2);
}

// --- report --------------------------------------------------------------
console.log('gate-caller-audit — who calls each gate?');
console.log('  root                : ' + ROOT);
console.log('  npm scripts         : ' + Object.keys(scripts).length + ' (' + subjects.filter((s) => s.kind === 'npm script').length + ' gate-shaped)');
console.log('  scripts/ files      : ' + scriptFiles.length + ' (' + subjects.filter((s) => s.kind === 'guard script').length + ' guard-shaped)' + (INCLUDE_UNTRACKED ? ' (+' + untracked.filter((f) => f.startsWith('scripts/') && /\.(mjs|sh)$/.test(f)).length + ' untracked)' : ''));
console.log('  config.ts read      : ' + configFiles.length + '   .github/ files: ' + workflowFiles.length);
console.log('  edge vocabulary     : ' + EDGE_SOURCES.join(', '));
console.log('  roots               : ' + roots.size + '   reached: ' + reached.size);
console.log('  subjects            : ' + subjects.length + '   orphans: ' + orphans.length);

if (REPORT) {
  console.log('\n  --- reached ---');
  for (const s of subjects.filter((x) => x.via)) console.log('  ' + s.key.padEnd(44) + ' via ' + s.via);
  console.log('\n  --- orphans ---');
  for (const s of orphans) console.log('  ' + s.key.padEnd(44) + ' NO CALLER');
  process.exit(0);
}

// --- baseline ratchet ----------------------------------------------------
if (UPDATE) {
  const prev = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')).grandfathered || {} : {};
  const obj = {};
  for (const s of orphans.sort((a, b) => a.key.localeCompare(b.key))) {
    obj[s.key] = prev[s.key] || 'TODO: say why this gate has no caller, or give it one.';
  }
  fs.writeFileSync(BASELINE, JSON.stringify({ grandfathered: obj }, null, 2) + '\n');
  console.log('gate-caller-audit: baseline written — ' + Object.keys(obj).length + ' grandfathered orphan(s)');
  process.exit(0);
}

// A RATCHET WITHOUT ITS BASELINE IS NOT A RATCHET (F-1252-1) — a missing file is
// not a neutral `{}`; read that way, every known orphan reports as new.
if (!fs.existsSync(BASELINE)) {
  console.error('gate-caller-audit: REFUSING — no baseline at ' + BASELINE + '.');
  console.error('  Run --update-baseline once to record today\'s known orphans, each with a reason.');
  process.exit(2);
}
let baseline = {};
try {
  baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).grandfathered || {};
} catch (error) {
  console.error('gate-caller-audit: REFUSING — baseline unreadable: ' + error.message);
  process.exit(2);
}
console.log('  grandfathered       : ' + Object.keys(baseline).length);

const fresh = orphans.filter((s) => !(s.key in baseline));
const healed = Object.keys(baseline).filter((k) => !orphans.some((s) => s.key === k));

for (const s of orphans) {
  const known = s.key in baseline;
  console.log('  ' + (known ? 'known  ' : 'NEW    ') + s.key.padEnd(42) + (known ? baseline[s.key] : 'NO CALLER'));
}
if (healed.length) {
  console.log('\n  ' + healed.length + ' baselined orphan(s) now have a caller — tighten the baseline:');
  for (const k of healed) console.log('    + ' + k);
}

if (fresh.length) {
  console.error('\nFAIL — ' + fresh.length + ' gate(s) with no caller and no recorded reason:');
  for (const s of fresh) console.error('  ' + s.key);
  console.error(
    '\n  A gate nothing calls is an unread verdict: scripts/citation-title-guard.mjs was RED\n' +
      '  against the real tree for nine fires while nine fires reported green batteries (F-1252-2).\n' +
      '  Either give it a caller (run-guards.mjs GUARDS, or a pipeline shell), or record WHY it\n' +
      '  is deliberately unrooted via --update-baseline and write the reason in.',
  );
  process.exit(1);
}

// --- AN ESCALATION WRITTEN HERE IS NOT AN ESCALATION (F-1473-2, s1473) ---------
// Everything above tests only `s.key in baseline` — key PRESENCE. The reason string
// is printed and never parsed, so a fire that writes "owner's desk" into a reason has
// performed a NO-OP THAT READS LIKE AN ESCALATION: this audit PASSes, the fire feels
// it discharged §7.3, and Robin is never asked. Measured s1473 across all 9 entries:
// THREE route a gate-cost decision to the owner, and `F-1470-3` appeared ZERO times in
// tasks/BACKLOG.md — no board row, so invisible to findings-state, blocker-panel and
// desk-declaration alike. That is F-1334-2's class one level further out: not a desk
// item missing from the board, but an escalation that never became a desk item at all.
//
// The rule is deliberately WEAK — it demands a ledger ROW, not a desk line. A row is
// what the visibility guards can see; whether an item is currently on the desk is
// desk-declaration-guard's question, and duplicating it here would red the board every
// time Robin disposed of something. This asks only: can the escalation be FOUND?
// The backtick (U+0060) is the fifth spelling a fire has actually written — see
// F-1542-1 and the identical literals in desk-declaration-guard.mjs /
// desk-carryforward-guard.mjs. Here a miss fails OPEN (an escalation simply is
// not checked for a ledger row) rather than loud, which is why it could sit
// here unnoticed; measured on the live baseline s1542, widening matches 0 new
// entries, so this is preventive and changes no verdict today.
const OWNER_ROUTE = /owner['’`]?s? desk/i;
const escalations = Object.entries(baseline).filter(([, reason]) => OWNER_ROUTE.test(String(reason)));
if (escalations.length) {
  let ledger = '';
  try {
    ledger = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
  } catch (error) {
    console.error('gate-caller-audit: REFUSING — baseline escalates to the owner but the ledger is unreadable: ' + error.message);
    process.exit(2);
  }
  const unrouted = [];
  for (const [key, reason] of escalations) {
    const ids = String(reason).match(/F-\d+-\d+/g) || [];
    if (!ids.length) { unrouted.push([key, '(no F-ID cited)']); continue; }
    const missing = ids.filter((id) => !ledger.includes(id));
    if (missing.length === ids.length) unrouted.push([key, missing.join(', ')]);
  }
  console.log('  owner escalations   : ' + escalations.length + '   unrouted: ' + unrouted.length);
  if (unrouted.length) {
    console.error('\nFAIL — ' + unrouted.length + ' baseline reason(s) route a decision to the owner with no ledger row:');
    for (const [key, ids] of unrouted) console.error('  ' + key.padEnd(42) + ids);
    console.error(
      '\n  Writing "owner\'s desk" into a JSON reason string routes NOTHING — this audit reads\n' +
        '  key presence only, so the sentence is inert prose in a file no desk guard reads.\n' +
        '  File the finding in tasks/BACKLOG.md (§7.3: one line on the desk with a\n' +
        '  recommendation), then cite that F-ID here.',
    );
    process.exit(1);
  }
}

console.log('\nPASS — every gate-shaped subject is either reached or grandfathered with a reason.');
process.exit(0);
