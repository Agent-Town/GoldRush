/**
 * caller-sweep.mjs — s1253. Answer F-1126-1's remaining half AS A CLASS:
 * for every npm script and every scripts/*.mjs guard, WHO CALLS IT?
 *
 * s1252 answered this for exactly one guard (citation-title-guard.mjs) by
 * grepping package.json/scripts/.github and finding nothing but its own test.
 * It closed with: an unrun guard is an unread verdict. This sweep asks the same
 * question of the WHOLE tree, and classifies each subject by whether its
 * referrer is something a battery/pipeline actually EXECUTES, or merely prose.
 *
 * Method: build the reachable set from the real entrypoints, transitively.
 *   ROOTS = the GUARDS roster in run-guards.mjs (what a full battery runs)
 *         + the npm scripts a pipeline .sh actually invokes
 *         + the node --test roster inside test:node-guards
 * An edge exists when a REACHED file's text names the subject in an
 * executable position (spawn/import/npm-run/bash), not in a comment.
 *
 * Output is a table, not a verdict. The verdicts come from RUNNING the
 * no-caller subjects afterwards (that is what found the s1252 red).
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const scripts = pkg.scripts || {};

// --- tracked file inventory (denominator, from git not from readdir) ---
const ls = spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (ls.status !== 0) { console.error('FATAL: git ls-files failed'); process.exit(2); }
const tracked = ls.stdout.split('\n').filter(Boolean);
const scriptFiles = tracked.filter((f) => f.startsWith('scripts/') && (f.endsWith('.mjs') || f.endsWith('.sh')));
if (scriptFiles.length === 0) { console.error('FATAL: zero scripts/ files — wrong cwd?'); process.exit(2); }

// --- strip comments so a MENTION is not mistaken for a CALL ---
function code(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')      // block comments
    .replace(/^\s*\/\/.*$/gm, ' ')          // whole-line js comments
    .replace(/^\s*#(?!!).*$/gm, ' ');       // whole-line shell comments (keep shebang)
}
const bodyCache = new Map();
function codeOf(f) {
  if (!bodyCache.has(f)) {
    const p = join(ROOT, f);
    bodyCache.set(f, existsSync(p) ? code(readFileSync(p, 'utf8')) : '');
  }
  return bodyCache.get(f);
}

// --- the roster inside test:node-guards (its own argv IS the roster) ---
const nodeGuardRoster = (scripts['test:node-guards'] || '')
  .split(/\s+/).filter((t) => t.startsWith('scripts/') && t.endsWith('.mjs'));

// --- edges: what does one subject execute? ---
function edgesFromScriptBody(body) {
  const out = new Set();
  for (const m of body.matchAll(/npm run ([\w:-]+)/g)) out.add('npm:' + m[1]);
  for (const m of body.matchAll(/(?:node|bash|sh)\s+(?:--[\w-]+\s+)*(scripts\/[\w.-]+\.(?:mjs|sh))/g)) out.add(m[1]);
  for (const m of body.matchAll(/scripts\/[\w.-]+\.(?:mjs|sh)/g)) out.add(m[0]);
  return out;
}
function edgesFromFile(f) {
  const body = codeOf(f);
  const out = new Set();
  // spawn/exec of another script, and npm run of another script
  for (const m of body.matchAll(/npm['"\s,\]]*[\s,]*run['"\s,\]]*[\s,]*['"]?([\w:-]+)/g)) out.add('npm:' + m[1]);
  for (const m of body.matchAll(/['"`](test:[\w:-]+)['"`]/g)) out.add('npm:' + m[1]);
  for (const m of body.matchAll(/scripts\/[\w.-]+\.(?:mjs|sh)/g)) out.add(m[0]);
  // relative imports/spawns inside scripts/
  for (const m of body.matchAll(/['"`]\.\/([\w.-]+\.(?:mjs|sh))['"`]/g)) out.add('scripts/' + m[1]);
  return out;
}

// --- ROOTS: the things something outside package.json actually invokes ---
const pipelineShells = scriptFiles.filter((f) => f.endsWith('.sh'));
const roots = new Set();
// (a) every guard in the run-guards roster, via that file's own arrays
const rgBody = codeOf('scripts/run-guards.mjs');
const rosterGuards = [...rgBody.matchAll(/['"`](test:[\w:-]+)['"`]/g)].map((m) => 'npm:' + m[1]);
rosterGuards.forEach((g) => roots.add(g));
roots.add('npm:test:guards');
// (b) whatever the pipeline shells and the fire/lane runners invoke
for (const sh of pipelineShells) for (const e of edgesFromScriptBody(codeOf(sh))) roots.add(e);
// (c) the documented drain minimum (CLAUDE.md §6 / fire.md §3)
roots.add('npm:build'); roots.add('npm:test'); roots.add('npm:test:guards');
// (d) the node --test roster
nodeGuardRoster.forEach((f) => roots.add(f));

// --- transitive closure ---
const reached = new Map(); // subject -> shortest referrer chain
const queue = [];
for (const r of roots) { reached.set(r, ['<ROOT>']); queue.push(r); }
while (queue.length) {
  const cur = queue.shift();
  const chain = reached.get(cur);
  let outs;
  if (cur.startsWith('npm:')) {
    const name = cur.slice(4);
    if (!(name in scripts)) continue;
    outs = edgesFromScriptBody(code(scripts[name]));
  } else {
    if (!scriptFiles.includes(cur)) continue;
    outs = edgesFromFile(cur);
  }
  for (const nxt of outs) {
    if (reached.has(nxt)) continue;
    reached.set(nxt, [...chain, cur]);
    queue.push(nxt);
  }
}

// --- report: npm scripts ---
const orphanScripts = [];
console.log('=== A. NPM SCRIPTS (' + Object.keys(scripts).length + ') — is anyone asking it? ===');
for (const name of Object.keys(scripts)) {
  const key = 'npm:' + name;
  const hit = reached.get(key);
  const via = hit ? (hit.length === 1 ? 'ROOT' : hit[hit.length - 1]) : 'NONE';
  if (!hit) orphanScripts.push(name);
  console.log((hit ? '  reached ' : '  ORPHAN  ') + name.padEnd(26) + ' via ' + via);
}

// --- report: guard-shaped scripts/*.mjs with no automated caller ---
const GUARDISH = /(guard|assert|check|audit|verify|contract|ratchet)/i;
const guardish = scriptFiles.filter((f) => f.endsWith('.mjs') && !f.endsWith('.test.mjs') && GUARDISH.test(f));
const orphanGuards = [];
console.log('\n=== B. GUARD-SHAPED scripts/*.mjs (' + guardish.length + ') ===');
for (const f of guardish) {
  const hit = reached.get(f);
  // also: does a REACHED .test.mjs exercise it? (a contract test is a real caller)
  let testCaller = null;
  for (const t of nodeGuardRoster) {
    if (codeOf(t).includes(f.replace('scripts/', '')) || codeOf(t).includes(f)) { testCaller = t; break; }
  }
  if (hit) console.log('  reached ' + f.padEnd(46) + ' via ' + hit[hit.length - 1]);
  else if (testCaller) console.log('  TESTONLY ' + f.padEnd(45) + ' only ' + testCaller);
  else { console.log('  ORPHAN  ' + f.padEnd(46) + ' NO CALLER, NO TEST'); }
  if (!hit) orphanGuards.push({ file: f, testCaller });
}

console.log('\n=== C. SUMMARY ===');
console.log('orphan npm scripts      : ' + orphanScripts.length + '  ' + JSON.stringify(orphanScripts));
console.log('guard .mjs w/o a caller : ' + orphanGuards.length);
for (const g of orphanGuards) console.log('   ' + g.file + (g.testCaller ? '   [test-only: ' + g.testCaller + ']' : '   [NO TEST]'));
console.log('\nnode --test roster size : ' + nodeGuardRoster.length);
console.log('run-guards GUARDS size  : ' + rosterGuards.length);
