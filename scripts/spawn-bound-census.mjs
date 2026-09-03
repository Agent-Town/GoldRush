#!/usr/bin/env node
/**
 * spawn-bound-census — how many spawn sites can HANG a battery? (F-2430-1, s2430)
 *
 * WHY THIS EXISTS AS AN INSTRUMENT AND NOT A NUMBER IN THE LAW.
 * F-2429-1 diagnosed the battery wedge from five live specimens: a node child finishes its work,
 * calls `process.exit()`, and deadlocks inside NODE'S OWN platform teardown (`DisposePlatform` ->
 * `NodePlatform::Shutdown` -> `uv_thread_join` -> `__ulock_wait`). The parent's `spawnSync` then
 * waits forever for an EOF that only the child's exit can deliver — and because `spawnSync` BLOCKS
 * THE EVENT LOOP, `node --test`'s own `--test-timeout` is a timer that can never fire. The run has
 * no upper bound at all. s2427 measured one at 14m37s.
 *
 * F-2429-2 priced the residue as "160 unbounded node-child sites". That number was a FLOOR from a
 * lexical detector, published as prose — and prose rots. s2430 re-derived it independently and
 * found THREE corrections, two of which change what an editor would actually do:
 *
 *   1. TRAILING COMMAS. `spawnSync(a, b, {...},\n)` splits a final whitespace-only argument.
 *      Reading THAT as the options bag scores an ALREADY-BOUNDED site as unbounded. This is a
 *      false POSITIVE — the direction that manufactures work. It alone accounted for 13 phantom
 *      sites in `gr-sim.test.mjs`, every one of which already carries `timeout: 30_000`.
 *
 *   2. SYNC vs ASYNC. The mechanism REQUIRES a synchronous spawn, because the whole harm is that
 *      the event loop is blocked. An async `spawn`/`exec`/`execFile`/`fork` leaves the loop free,
 *      so `--test-timeout` and any per-test `{ timeout }` DO fire and the wedge is already LOUD.
 *      24 node-child sites are async and are NOT exposed. All four remaining `gr-sim.test.mjs`
 *      sites are in this class.
 *
 *   3. SPAWNERS NAMED IN PROSE. This repo's guard files carry long explanatory headers that QUOTE
 *      code. A bare regex counts `execFileSync('npm', ...)` inside a `/** ... *\/` block as a call
 *      site — measured live at `law-bash-prescription-guard.test.mjs:33`. 45 phantom sites.
 *
 * EXPOSED therefore means all three conjuncts at once: UNBOUNDED and SYNCHRONOUS and a NODE child.
 * A `git` child cannot deadlock in node's teardown and is never counted.
 *
 * ADVISORY, EXIT 0 BY DEFAULT, AND THE RESTRAINT IS MEASURED RATHER THAN LAZY. A newly-written
 * guard test that spawns its subject unbounded is ORDINARY CORRECT WORK, and there is a real
 * remaining debt outside the cured set, so a red here would fire during lawful operation and be
 * excused into uselessness inside a week (F-1460-1, the `cross-engine` fate). `--strict` exits
 * 1 when the exposed set inside the MANDATED batteries grows past `--max`, and 2 when the census
 * could not answer — the convention `drain-block-check`, `dry-board-probe` and
 * `master-shipped-classifier` already carry.
 *
 * THE CORPUS IS DECLARED ON STDOUT ALWAYS, INCLUDING THE HAPPY PATH (F-2208-1): a declaration that
 * appears only on failure re-creates the ambiguity it removes, and "I scanned 514 files and found
 * nothing" must be distinguishable from "I scanned nothing".
 *
 * IT IS LEXICAL — there is no JS parser in node_modules — so every count is a FLOOR. It is
 * anchored to the repo root via `import.meta.url`, never `process.cwd()`, because a cwd-relative
 * corpus silently narrows from a subdirectory and still prints a clean verdict (F-2220-1).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIR = path.join(ROOT, 'scripts');

// Synchronous spawners ONLY can produce the unfireable-timeout hang; async ones are listed so the
// census can REPORT them as a distinct, non-exposed bucket rather than silently omitting them.
const SYNC_SPAWNERS = ['spawnSync', 'execFileSync', 'execSync'];
const ASYNC_SPAWNERS = ['spawn', 'execFile', 'exec', 'fork'];
const SPAWNERS = [...SYNC_SPAWNERS, ...ASYNC_SPAWNERS];

/**
 * Correction 4 (F-2465-1, s2465): A REGEX LITERAL IS NOT A STRING, AND MISREADING ONE
 * DESYNCHRONISES EVERYTHING AFTER IT — SILENTLY, AND TOWARD "NOT CODE".
 *
 * The mask below used to know three things: line comments, block comments and string
 * literals. It did NOT know regex literals, and it scanned their bodies as ordinary code —
 * so a regex holding a quote character desynchronised it. `fixture-teardown.test.mjs:15`
 * carries `(['"`])` inside `const PREFIX = /.../g`; the mask read that `'` as the start of
 * a string and swallowed the rest of the file, including the real, UNBOUNDED
 * `spawnSync(process.execPath, ['--test', ...])` at `:35`.
 *
 * The drop is SILENT and it is NOT counted: `unparsed` counts only `topLevelArgs` failures,
 * never mask drops, so the site never enters the corpus at all and the census reports
 * `✅ 0 exposed inside mandated legs` from a corpus that is missing it. Measured s2465:
 * 9 genuinely-unbounded SYNC node-child sites across 6 files, every one inside a MANDATED
 * battery leg, invisible to the instrument built to find exactly them.
 *
 * Proven by manufacturing, with a reverse control: removing ONLY line 15's regex literal
 * makes `:35` visible; removing an unrelated line leaves it hidden.
 *
 * Correction 5 (same finding): EXCLUDE PROPERTY ACCESS. Surfacing the sites above also
 * surfaces `re.exec(src)`, `db.exec('create table ...')` and `enemies.spawn()`, because
 * `\bexec\s*\(` matches after a dot — false positives the old defect happened to hide.
 * Measured s2465: of 21 property-access spawner forms in this corpus, ZERO are a
 * module-namespace `child_process` call (`cp.execSync` etc.), so this cannot lose a real
 * one. It is scoped narrowly for that reason: the day someone writes `cp.spawnSync`, this
 * must be revisited rather than widened by habit.
 */
const RX_PREFIX_KEYWORDS = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
  'case', 'do', 'else', 'yield', 'await', 'throw',
]);

/** Does the `/` at `i` open a REGEX rather than a division? Standard prev-significant-token
 *  disambiguation: `)` and `]` end an expression (so: division); a bare word divides UNLESS
 *  it is a keyword that cannot end one; everything else precedes a regex. */
function startsRegex(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  if (j < 0) return true;
  const p = src[j];
  if (/[A-Za-z0-9_$]/.test(p)) {
    let k = j;
    while (k >= 0 && /[A-Za-z0-9_$]/.test(src[k])) k--;
    return RX_PREFIX_KEYWORDS.has(src.slice(k + 1, j + 1));
  }
  return !(p === ')' || p === ']');
}

/** Offsets that are CODE — not comment, not string literal, not regex literal. Corrections 3+4. */
function codeMask(src) {
  const mask = new Uint8Array(src.length).fill(1);
  let mode = null, quote = null, inClass = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (mode === 'line') { mask[i] = 0; if (c === '\n') mode = null; continue; }
    if (mode === 'block') { mask[i] = 0; if (c === '*' && n === '/') { mask[i + 1] = 0; i++; mode = null; } continue; }
    if (mode === 'str') { mask[i] = 0; if (c === '\\') { mask[i + 1] = 0; i++; continue; } if (c === quote) mode = null; continue; }
    if (mode === 'rx') {
      mask[i] = 0;
      if (c === '\\') { mask[i + 1] = 0; i++; continue; }
      if (c === '[') { inClass = true; continue; }
      if (c === ']') { inClass = false; continue; }
      // A regex literal cannot span a newline. Resyncing here bounds the blast radius of a
      // misread `/` to ONE line instead of the rest of the file — the failure that produced
      // this finding. Fail small, and in the direction that keeps code visible.
      if (c === '\n') { mode = null; inClass = false; continue; }
      if (c === '/' && !inClass) { mode = null; continue; }
      continue;
    }
    if (c === '/' && n === '/') { mode = 'line'; mask[i] = 0; continue; }
    if (c === '/' && n === '*') { mode = 'block'; mask[i] = 0; continue; }
    if (c === '/' && startsRegex(src, i)) { mode = 'rx'; inClass = false; mask[i] = 0; continue; }
    if (c === '"' || c === "'" || c === '`') { mode = 'str'; quote = c; mask[i] = 0; continue; }
  }
  return mask;
}

/** Is the spawner name at `i` a PROPERTY access (`re.exec(`)? Correction 5. */
function isPropertyAccess(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  return j >= 0 && src[j] === '.';
}

/** Split the top-level arguments of a call, string/comment aware. Returns null if unbalanced. */
function topLevelArgs(src, openParenIdx) {
  let depth = 0, start = -1, mode = null, quote = null;
  const args = [];
  for (let i = openParenIdx; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (mode === 'line') { if (c === '\n') mode = null; continue; }
    if (mode === 'block') { if (c === '*' && n === '/') { mode = null; i++; } continue; }
    if (mode === 'str') { if (c === '\\') { i++; continue; } if (c === quote) mode = null; continue; }
    if (c === '/' && n === '/') { mode = 'line'; i++; continue; }
    if (c === '/' && n === '*') { mode = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { mode = 'str'; quote = c; continue; }
    if (c === '(' || c === '[' || c === '{') { depth++; if (depth === 1) start = i + 1; continue; }
    if (c === ')' || c === ']' || c === '}') {
      depth--;
      if (depth === 0) { args.push(src.slice(start, i)); return { args, end: i }; }
      continue;
    }
    if (c === ',' && depth === 1) { args.push(src.slice(start, i)); start = i + 1; }
  }
  return null;
}

/** `const NAME = { ... }` option bags, so an EXTRACTED bound is not scored unbounded. */
function constBags(src) {
  const bags = new Map();
  const re = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const open = src.indexOf('{', m.index + m[0].length - 1);
    const got = topLevelArgs(src, open);
    if (got) bags.set(m[1], src.slice(open, got.end + 1));
  }
  return bags;
}

function hasTimeout(optSrc, bags, seen = new Set()) {
  if (!optSrc) return false;
  const s = optSrc.trim();
  if (/\btimeout\s*:/.test(s)) return true;
  const ident = s.match(/^([A-Za-z_$][\w$]*)$/);
  if (ident && bags.has(ident[1]) && !seen.has(ident[1])) {
    seen.add(ident[1]);
    return hasTimeout(bags.get(ident[1]), bags, seen);
  }
  for (const sp of s.matchAll(/\.\.\.\s*([A-Za-z_$][\w$]*)/g)) {
    if (bags.has(sp[1]) && !seen.has(sp[1])) {
      seen.add(sp[1]);
      if (hasTimeout(bags.get(sp[1]), bags, seen)) return true;
    }
  }
  return false;
}

function childKind(arg0, arg1) {
  const a = (arg0 || '').trim();
  const all = a + ' ' + (arg1 || '');
  if (/process\.execPath/.test(a)) return 'node';
  const lit = a.match(/^['"`]([^'"`]*)['"`]$/);
  if (lit) {
    const base = lit[1].trim().split(/\s+/)[0].split('/').pop();
    if (base === 'node' || base === 'npm' || base === 'npx') return 'node';
    if (base === 'git') return 'git';
    if (base === 'bash' || base === 'sh') return /\bnode\b|\.mjs|\bnpm\b|\bnpx\b/.test(all) ? 'node-via-shell' : 'shell';
    return base || 'other';
  }
  if (/\bNODE\b|execPath|nodeBin/i.test(a)) return 'node';
  if (/\bgit\b/i.test(a)) return 'git';
  return 'dynamic';
}

export function census(dir = DIR) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort();
  const rows = [];
  let unparsed = 0;
  // F-2465-1: the mask is the one place this census can narrow SILENTLY — a dropped site
  // never becomes a row, so a corpus hole is indistinguishable from a clean board. Count
  // the drops and DECLARE them on stdout always, including the happy path (F-2208-1).
  let masked = 0, propertyAccess = 0;
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const bags = constBags(src);
    const mask = codeMask(src);
    for (const fn of SPAWNERS) {
      const re = new RegExp(`\\b${fn}\\s*\\(`, 'g');
      let m;
      while ((m = re.exec(src))) {
        if (isPropertyAccess(src, m.index)) { propertyAccess++; continue; }
        if (!mask[m.index]) { masked++; continue; }
        const open = src.indexOf('(', m.index + fn.length);
        const got = topLevelArgs(src, open);
        if (!got) { unparsed++; continue; }
        // Correction 1: a trailing comma yields a whitespace-only final argument.
        const args = got.args.filter((a) => a.trim() !== '');
        const opts = args.length >= 2 ? args[args.length - 1] : null;
        rows.push({
          file: f,
          line: src.slice(0, m.index).split('\n').length,
          fn,
          kind: childKind(args[0], args[1]),
          bounded: hasTimeout(opts, bags),
          sync: SYNC_SPAWNERS.includes(fn),
        });
      }
    }
  }
  return { files, rows, unparsed, masked, propertyAccess };
}

/** The mandated batteries' legs, DERIVED from package.json — never transcribed (F-2207-1). */
export function batteryLegs(root = ROOT) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const legsOf = (s) => [...(s || '').matchAll(/scripts\/([\w.-]+\.mjs)/g)].map((m) => m[1]);
  const ledger = legsOf(pkg.scripts['test:ledger-guards']);
  const node = legsOf(pkg.scripts['test:node-guards']).filter((f) => f !== 'run-node-guards.mjs');
  return { ledger: new Set(ledger), node: new Set(node), all: new Set([...ledger, ...node]) };
}

const nodeish = (r) => r.kind === 'node' || r.kind === 'node-via-shell';
export const isExposed = (r) => !r.bounded && r.sync && nodeish(r);

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const maxArg = argv.find((a) => a.startsWith('--max='));
  const max = maxArg ? Number(maxArg.slice(6)) : 0;

  let c, legs;
  try {
    c = census();
    legs = batteryLegs();
  } catch (err) {
    // Reaches STDOUT, not stderr: a caller that classifies stdout reads an empty string as
    // silence (F-2211-1), and a refusal is not a report.
    console.log(`⛔ CANNOT VERIFY — the census could not answer: ${err.message}`);
    process.exit(strict ? 2 : 0);
    return;
  }

  const exposed = c.rows.filter(isExposed);
  const inBattery = exposed.filter((r) => legs.all.has(r.file));

  // Corpus declared ALWAYS, including the happy path (F-2208-1).
  console.log(`corpus  : ${c.files.length} scripts/*.mjs · ${c.rows.length} spawn call sites · ${c.unparsed} unparsed`);
  // F-2465-1: the two ways an occurrence leaves the corpus WITHOUT becoming a row. Printed
  // always, so a future mask desync is a number that moved rather than a silent narrowing.
  console.log(`excluded: ${c.masked} in comment/string/regex · ${c.propertyAccess} property access (re.exec, db.exec)`);
  console.log(`battery : ${legs.all.size} mandated legs derived from package.json (ledger ${legs.ledger.size} · node-guards ${legs.node.size})`);
  console.log('');
  console.log(`EXPOSED (unbounded + SYNC + node child)  : ${exposed.length}`);
  console.log(`  inside a mandated battery leg          : ${inBattery.length}  across ${new Set(inBattery.map((r) => r.file)).size} files`);
  console.log(`  outside any mandated battery           : ${exposed.length - inBattery.length}`);
  console.log('');
  console.log('NOT exposed, and why — these are the three corrections to F-2429-2\'s floor:');
  console.log(`  async node child (event loop free)     : ${c.rows.filter((r) => !r.bounded && !r.sync && nodeish(r)).length}`);
  console.log(`  git child (cannot deadlock this way)   : ${c.rows.filter((r) => !r.bounded && r.kind === 'git').length}`);
  console.log(`  already bounded                        : ${c.rows.filter((r) => r.bounded).length}`);

  if (argv.includes('--list')) {
    const group = (rows) => {
      const by = new Map();
      for (const r of rows) by.set(r.file, [...(by.get(r.file) || []), r.line]);
      return [...by].sort();
    };

    console.log('\nEXPOSED sites inside a mandated battery leg:');
    for (const [f, lines] of group(inBattery)) console.log(`  ${f}  (lines ${lines.join(',')})`);
    if (!inBattery.length) console.log('  (none)');

    // F-2433-1: NAME the outside set too. Until s2433 this arm listed ONLY the
    // in-battery rows, so the tool reported a COUNT it gave its reader no way to
    // act on -- a detector whose finding no tool can reach. That is not cosmetic:
    // the outside set is where the TRIAGE INSTRUMENTS live, because a tool a fire
    // runs BY HAND is outside every battery BY CONSTRUCTION. dry-board-probe.mjs
    // (§2F's first prescribed command, 46 sync node spawns per run) sat in this
    // unnamed bucket through both the F-2430-1 and s2432 sweeps.
    const outside = exposed.filter((r) => !legs.all.has(r.file));
    console.log('\nEXPOSED sites OUTSIDE any mandated battery leg:');
    for (const [f, lines] of group(outside)) console.log(`  ${f}  (lines ${lines.join(',')})`);
    if (!outside.length) console.log('  (none)');
    console.log('\n  Battery membership sizes the GATE risk, not the FIRE risk: an');
    console.log('  instrument the law tells a fire to run by hand is never a leg.');
  }

  if (strict && inBattery.length > max) {
    console.log(`\n⛔ ${inBattery.length} exposed site(s) inside mandated battery legs, above --max=${max}.`);
    console.log('   Each can hang the battery with no bound and no diagnostic (F-2429-1).');
    process.exit(1);
  }
  // F-2465-1: the banner reports the NUMBER, so it must not contradict it. In advisory mode
  // stdout is the whole interface (F-2210-1), and a ✅ beside a non-zero count is the same
  // false reassurance this instrument exists to prevent — it read `✅ 9 exposed` the moment
  // the mask cure made the nine visible. Advisory still exits 0 by design (F-1460-1).
  const mark = inBattery.length === 0 ? '✅' : '⚠️ ';
  console.log(`\n${mark} ${inBattery.length} exposed inside mandated legs${strict ? ` (--max=${max})` : ''}.`);
  if (inBattery.length > 0 && !argv.includes('--list')) {
    console.log('   Name them with `node scripts/spawn-bound-census.mjs --list`.');
  }
  process.exit(0);
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) main();
