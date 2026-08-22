// s2202 / F-2201-2 measurement: is a reached gate's edge an INVOCATION or a MENTION?
//
// SCOPED TO SUBJECTS, deliberately. The audit only ever reds on a SUBJECT with no caller,
// so a mention-only edge is harmless unless it holds up a subject. Classifying all 206 cited
// scripts/ paths (probe v1) produced a 114-strong list dominated by test fixtures and scratch
// -- evidence-shaped noise. The question that can actually bite is narrower.
//
// Two v1 bugs fixed here, both of which manufactured false MENTIONs:
//   (1) stripComments collapsed multi-line /* */ to one space, so stripped-line-N no longer
//       aligned with raw-line-N and the quoted line was the wrong line entirely.
//   (2) `node scripts/run-node-guards.mjs a.test.mjs b.test.mjs ...` -- every roster entry
//       after the first IS invoked, but a proximity window read them as mentions.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = process.cwd();
const sh = (a, o = {}) => execFileSync(a[0], a.slice(1), { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, ...o });
const files = sh(['git', 'ls-files']).split('\n').filter(Boolean);
const readIf = (rel) => (existsSync(rel) ? readFileSync(rel, 'utf8') : '');

// verbatim from gate-caller-audit.mjs:228, EXCEPT block comments keep their newlines so
// line numbers survive the strip (the probe must not lie about where it looked).
function stripComments(text) {
  return text
    // `[ \t]`, NOT `\s`: the audit's own version uses `\s*`, which matches NEWLINES, so a blank
    // line preceding a `//` comment is swallowed together with it and the line count drops (944
    // -> 934 on gate-caller-audit.test.mjs). Harmless THERE -- the audit collects a path SET and
    // never reads a line number -- but it silently mis-attributes every quoted line in a probe
    // that does. Same stripped CONTENT, alignment preserved.
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/^[ \t]*\/\/.*$/gm, ' ')
    .replace(/^[ \t]*#(?!!).*$/gm, ' ');
}

// --- the SUBJECT set, taken from the audit itself rather than re-derived ---
const report = sh(['node', 'scripts/gate-caller-audit.mjs', '--report']);
const subjects = [];
for (const line of report.split('\n')) {
  let m = line.match(/^\s{2}(\S+)\s+via\s+(.+)$/);
  if (m) subjects.push({ key: m[1], via: m[2].trim(), reached: true });
  m = line.match(/^\s{2}(\S+)\s+NO CALLER$/);
  if (m) subjects.push({ key: m[1], via: null, reached: false });
}
const scriptSubjects = subjects.filter((s) => s.key.startsWith('scripts/') && s.reached);

// --- edge source corpus, as the audit sees it -----------------------------
const pkg = JSON.parse(readIf('package.json'));
const scripts = pkg.scripts || {};
const configFiles = files.filter((f) => /(^|\/)[\w.-]*config\.ts$/.test(f));
const workflowFiles = files.filter((f) => f.startsWith('.github/'));
const scriptFiles = files.filter((f) => f.startsWith('scripts/') && /\.(mjs|sh)$/.test(f));
// ⚠️ THIRD PROBE BUG, and the one that would have produced a wholly false finding: the audit
// does NOT scan every scripts/*.mjs. gate-caller-audit.mjs:335 reads a .mjs body ONLY if that
// file is itself REACHED, while :315 scans every scripts/*.sh unconditionally as a root. So a
// mention sitting in an unreached `tmp-s<N>-*.mjs` scratch helper is INERT -- it is not an edge
// in the real graph at all. Scanning all .mjs (as v2 did) invented edges that do not exist.
// Replicating the audit's own roots + closure so the source set is the real one.
const PATH_RE_ALL = /scripts\/[\w.-]+\.(?:mjs|sh|ts)/g;
function edgesOf(text) {
  const body = stripComments(text);
  const out = new Set();
  for (const m of body.matchAll(/npm(?:\s+run|['"\s,\]]+run)['"\s,\]]*['"]?([\w:-]+)/g)) out.add('npm:' + m[1]);
  for (const m of body.matchAll(/['"`]((?:test|verify|build):[\w:-]+)['"`]/g)) out.add('npm:' + m[1]);
  for (const m of body.matchAll(/(?:[\w.-]+\/)+[\w.-]+\.test\.(?:mjs|sh)/g)) out.add(m[0]);
  for (const m of body.matchAll(/(?:[\w.-]+\/)+test-[\w.-]*\.(?:mjs|sh)/g)) out.add(m[0]);
  for (const m of body.matchAll(PATH_RE_ALL)) out.add(m[0]);
  for (const m of body.matchAll(/['"`]\.\/([\w.-]+\.(?:mjs|sh))['"`]/g)) out.add('scripts/' + m[1]);
  return out;
}
const roots = new Set();
for (const e of edgesOf(readIf('scripts/run-guards.mjs'))) if (e.startsWith('npm:')) roots.add(e);
roots.add('npm:test:guards');
roots.add('npm:build');
roots.add('npm:test');
for (const f of scriptFiles.filter((f) => f.endsWith('.sh'))) for (const e of edgesOf(readIf(f))) roots.add(e);
for (const e of edgesOf(scripts['test:node-guards'] || '')) roots.add(e);
for (const w of workflowFiles) for (const e of edgesOf(readIf(w))) roots.add(e);
const reachedMap = new Map();
const queue = [];
for (const r of roots) { reachedMap.set(r, '<ROOT>'); queue.push(r); }
const bodyOf = (cur) => {
  if (cur.startsWith('npm:')) { const n = cur.slice(4); return n in scripts ? scripts[n] : null; }
  if (scriptFiles.includes(cur) || configFiles.includes(cur)) return readIf(cur);
  return null;
};
const drain = () => {
  while (queue.length) {
    const cur = queue.shift();
    const text = bodyOf(cur);
    if (text === null) continue;
    for (const nxt of edgesOf(text)) { if (reachedMap.has(nxt)) continue; reachedMap.set(nxt, cur); queue.push(nxt); }
  }
};
drain();
for (const cfg of configFiles) for (const e of edgesOf(readIf(cfg))) { if (reachedMap.has(e)) continue; reachedMap.set(e, cfg); queue.push(e); }
drain();

// The REAL edge-source corpus: exactly what the audit reads.
const sources = [];
for (const key of reachedMap.keys()) if (key.startsWith('npm:') && key.slice(4) in scripts) sources.push({ src: `package.json:scripts.${key.slice(4)}`, text: scripts[key.slice(4)] });
for (const f of scriptFiles.filter((f) => f.endsWith('.sh'))) sources.push({ src: f, text: readIf(f) });        // :315, unconditional
for (const f of configFiles) sources.push({ src: f, text: readIf(f) });                                          // :347, unconditional
for (const f of workflowFiles) sources.push({ src: f, text: readIf(f) });                                        // :319, unconditional
for (const f of scriptFiles) if (f.endsWith('.mjs') && reachedMap.has(f)) sources.push({ src: f, text: readIf(f) }); // :335, REACHED ONLY

const PATH_RE = /scripts\/[\w.-]+\.(?:mjs|sh|ts)/g;
const INTERP = /\b(?:node|bash|sh|zsh|tsx)\b|npx\s+tsx|--test\b|--import\b/;

// Deliberately GENEROUS about INVOCATION and stingy about MENTION: a false MENTION only costs
// me a hand-check, while a false INVOCATION would hide the very defect being measured.
function classify(strippedLine, path) {
  const q = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const at = strippedLine.search(new RegExp(q));
  const head = strippedLine.slice(0, at);
  if (INTERP.test(head)) return 'INVOCATION';
  if (new RegExp(`\\./${q}`).test(strippedLine)) return 'INVOCATION';
  if (/exec(File)?(Sync)?\s*\(|spawn(Sync)?\s*\(/.test(strippedLine)) return 'INVOCATION';
  if (/^\s*-?\s*run:/.test(strippedLine)) return 'INVOCATION';
  if (/read(File)?Sync|readFile\b|existsSync|statSync|createReadStream|createHash/.test(strippedLine)) return 'MENTION-data';
  return 'MENTION-other';
}

const edges = new Map();
for (const { src, text } of sources) {
  const stripped = stripComments(text).split('\n');
  const raw = text.split('\n');
  stripped.forEach((line, i) => {
    const seen = new Set();
    for (const m of line.matchAll(PATH_RE)) {
      const p = m[0];
      if (seen.has(p)) continue;
      seen.add(p);
      if (!edges.has(p)) edges.set(p, []);
      edges.get(p).push({ src, lineNo: i + 1, line: (raw[i] || '').trim().slice(0, 160), cls: classify(line, p) });
    }
  });
}

const mentionOnly = scriptSubjects
  .map((s) => ({ ...s, es: edges.get(s.key) || [] }))
  .filter((s) => s.es.length && !s.es.some((e) => e.cls === 'INVOCATION'));

console.log('=== F-2201-2 EDGE SEMANTICS — scoped to the audit\'s own SUBJECTS ===');
console.log(`subjects total            : ${subjects.length}   (scripts/ paths, reached: ${scriptSubjects.length})`);
const all = scriptSubjects.flatMap((s) => edges.get(s.key) || []);
console.log(`edge occurrences into them: ${all.length}   INVOCATION ${all.filter((e) => e.cls === 'INVOCATION').length} · MENTION ${all.filter((e) => e.cls !== 'INVOCATION').length}`);
console.log(`\n>>> MENTION-ONLY SUBJECTS (reached, but no invocation edge anywhere): ${mentionOnly.length}`);
for (const s of mentionOnly) {
  console.log(`\n  ${s.key}   via=${s.via}   edges=${s.es.length}`);
  for (const e of s.es) console.log(`      ${e.cls.padEnd(14)} ${e.src}:${e.lineNo}  ${e.line}`);
}

// --- THE SHARPER QUESTION -------------------------------------------------
// F-2201-2's real shape is NOT "mention-only". `asset-diet.mjs` carries invocation edges
// (two npm build steps) AND a mention edge (vite.config.ts hashes it). Cut the invocations
// -- i.e. drop the gate from every battery it belongs to -- and the mention alone keeps it
// reached, so the audit stays green. So the EXPOSED set is every subject carrying >=1
// mention edge, whatever else it carries.
const exposed = scriptSubjects
  .map((s) => ({ ...s, es: edges.get(s.key) || [] }))
  .filter((s) => s.es.some((e) => e.cls !== 'INVOCATION'));
console.log(`\n>>> EXPOSED SUBJECTS (>=1 mention edge — a battery exit would not orphan them): ${exposed.length}`);
for (const s of exposed) {
  const inv = s.es.filter((e) => e.cls === 'INVOCATION').length;
  console.log(`\n  ${s.key}   invocation-edges=${inv}  mention-edges=${s.es.length - inv}`);
  for (const e of s.es.filter((x) => x.cls !== 'INVOCATION')) console.log(`      ${e.cls.padEnd(14)} ${e.src}:${e.lineNo}  ${e.line}`);
}
