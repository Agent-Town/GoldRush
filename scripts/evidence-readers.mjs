#!/usr/bin/env node
// evidence-readers — WHICH `artifacts/**` PATHS THE CODE ITSELF STILL READS.
//
// WHY THIS IS A SCRIPT AND NOT A LIST (task evidence-offload-1, owner ruling 2026-09-24 item 14a).
// `docs/ledger-shape-reader-map-2026-09-24.md` §A4 hand-measured three classes of `artifacts/**`
// on 2026-09-24 and its own closing paragraph marks the sweep UNVERIFIED in one direction
// ("whether any of the 266 e2e files that write into `artifacts/` also reads a fixture through a
// `page.goto('/artifacts/…')` form beyond the `shared-atlas-dedupe` dynamic import"). A hand list
// is a MEMORY, and this repo's whole mistake catalog is memories outliving their subject
// (CLAUDE.md §5.4, The Stale Belief). Offloading 7.6 GB behind an index on the strength of a
// memory would break a gate a week later with no instrument able to say why. So the must-stay set
// is DERIVED from the code on every run, the derivation is PRINTED, and the reader map becomes
// what it should be: a control this script's test asserts against, not the authority.
//
// THE POLARITY IS DELIBERATE (F-2212-1). A false MUST-STAY costs disk bytes. A false MOVABLE
// breaks a test or the build and is discovered by a red gate on someone else's drain. So every
// ambiguous hit stays, and is REPORTED rather than silently resolved either way.
//
// USAGE
//   node scripts/evidence-readers.mjs              # human declaration: the forms, the hits, the set
//   node scripts/evidence-readers.mjs --json       # the same, machine-readable
//   node scripts/evidence-readers.mjs --map-diff   # what the scan found that §A4 did not, and back
//
// EXIT CODES: 0 the scan ran; 2 it could not run (no git, no tracked files). Never 1: this is a
// derivation, not a verdict. The tools that act on it (`evidence-offload.mjs`) own the refusals.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = resolve(HERE, '..');

// `typescript` is loaded LAZILY, on the first code file scanned. `review-evidence-audit.mjs` and
// `modified-tracked-evidence-census.mjs` import this module ONLY for the archive-index resolver
// below, and both run on every drain; making them pay for a compiler they never call would be a
// cost imposed by a refactor, which is the kind of thing a drain notices as a slower gate and
// nobody attributes. One implementation of the word, and no import tax for the callers who do not
// use it.
let compiler = null;
const typescript = () => (compiler ??= createRequire(import.meta.url)('typescript'));

// ─── THE ARCHIVE INDEX ─────────────────────────────────────────────────────────────────────────
// Written by `evidence-offload.mjs --apply`; read by BOTH evidence audits so that a path which left
// this repository for the private archive resolves to a VERDICT rather than to silence. Lives here,
// and not in the mover, because a reader must never have to import a writer to answer a question.
export const ARCHIVE_INDEX_PATH = 'artifacts/ARCHIVE-INDEX.json';

/** The index, or null. A MISSING index is the normal state until the first offload lands, never an error. */
export function readArchiveIndex(root = DEFAULT_ROOT) {
  try {
    const index = JSON.parse(readFileSync(resolve(root, ARCHIVE_INDEX_PATH), 'utf8'));
    return index && typeof index === 'object' && index.subtrees && index.files ? index : null;
  } catch {
    return null;
  }
}

/**
 * Where a path went, or null. Exact file first, then the SUBTREE it or an ancestor belongs to, so a
 * review citing `artifacts/<run>/` or `artifacts/<run>/sub/shot.png` both resolve from one entry.
 */
export function archiveEntryFor(index, path) {
  if (!index) return null;
  const value = String(path).replace(/\/+$/, '');
  const file = index.files?.[value];
  if (file) return { kind: 'file', path: value, commit: file.archiveCommit, bytes: file.bytes, movedDate: file.movedDate };
  for (let probe = value; probe.includes('/'); probe = probe.slice(0, probe.lastIndexOf('/'))) {
    const subtree = index.subtrees?.[probe];
    if (subtree) {
      return {
        kind: 'subtree', path: probe, commit: subtree.archiveCommits?.[0] ?? null,
        bytes: subtree.bytes, movedDate: subtree.movedDate,
      };
    }
  }
  return null;
}

// ─── THE SCAN SPACE ────────────────────────────────────────────────────────────────────────────
// Named by the task, and PRINTED on every run for the same reason `review-evidence-audit.mjs`
// prints its own (F-2208-1): a scan space declared only on failure re-creates the ambiguity it
// removes. A reader living outside these families is invisible here, and that is a finding to
// write, never a silence to inherit.
export const SCAN_SPACE = [
  { label: 'scripts/**/*.mjs', test: (p) => p.startsWith('scripts/') && p.endsWith('.mjs') },
  { label: 'e2e/**/*.ts', test: (p) => p.startsWith('e2e/') && p.endsWith('.ts') },
  { label: 'src/**', test: (p) => p.startsWith('src/') },
  { label: 'vite.config.ts', test: (p) => p === 'vite.config.ts' },
  { label: 'package.json', test: (p) => p === 'package.json' },
  { label: '.claude/skills/*/SKILL.md', test: (p) => /^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(p) },
];

// ─── THE FORMS ─────────────────────────────────────────────────────────────────────────────────
// Each entry tests the WHITESPACE-COLLAPSED text immediately before the literal's opening quote.
// The window is 200 characters: long enough for `JSON.parse(readFileSync(path.resolve(` chains and
// for a `page.goto(` broken over lines, short enough that an unrelated earlier call cannot leak in.
//
// `git`/`gh` argv forms are EXCLUDED by name below rather than absent here, because
// `execFileSync('git', ['hash-object', '-w', 'artifacts/probe/second.log'])` in a fixture reads a
// path inside a `mkdtemp` repo, not ours. That exclusion is safe in the fail-safe direction only
// because it is checked against the tracked tree afterwards: a literal that resolves to nothing
// tracked cannot pin anything, and is reported as UNRESOLVED instead of being argued about.
export const READ_FORMS = [
  { id: 'import', re: /(?:^|[^A-Za-z0-9_$])(?:import|from|require)\s*\(?\s*$/ },
  { id: 'dynamic-import', re: /(?:^|[^A-Za-z0-9_$])import\s*\(\s*$/ },
  { id: 'readFileSync', re: /readFileSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'readFile', re: /readFile\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'existsSync', re: /existsSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'readdirSync', re: /readdirSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'statSync', re: /l?statSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'createReadStream', re: /createReadStream\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'realpathSync', re: /realpathSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'new URL', re: /new URL\s*\(\s*$/ },
  { id: "execFileSync('node')", re: /exec(?:File)?Sync\s*\(\s*['"`]node['"`]\s*,\s*\[\s*(?:['"`][^'"`]*['"`]\s*,\s*)*$/ },
  { id: 'page.goto', re: /\.goto\s*\(\s*$/ },
  { id: 'sharp', re: /sharp\s*\(\s*$/ },
];

// A literal in one of these is a WRITE TARGET: §A4 Class 2. Its directory must stay CREATABLE,
// which `mkdirSync(..., { recursive: true })` already guarantees; what it must NOT do is vanish
// while a caller writes into it with no mkdir of its own. Kept must-stay for that reason, and
// because the class is a few dozen small text and board directories: the conservative reading
// costs almost nothing here and the reverse reading costs a red gate.
export const WRITE_FORMS = [
  { id: 'writeFileSync', re: /(?:append|write)FileSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'mkdirSync', re: /mkdirSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'cpSync', re: /(?:cp|copyFile)Sync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'createWriteStream', re: /createWriteStream\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'toFile', re: /\.toFile\s*\(\s*$/ },
  { id: 'rmSync', re: /rmSync\s*\(\s*(?:[A-Za-z0-9_$.]+\s*\(\s*)*$/ },
  { id: 'screenshot path', re: /path\s*:\s*$/ },
  { id: 'outDir', re: /(?:outDir|outputDir|OUT(?:_DIR)?|DIR|dir)\s*[:=]\s*$/ },
  { id: '--transcript', re: /--(?:transcript|out|outdir|dir|report)['"`]?\s*,?\s*$/ },
];

// ─── NAMESPACE AND PROMOTION ───────────────────────────────────────────────────────────────────
// A reader pins a FILE. The offload moves SUBTREES. Between the two sits a judgement, and it is
// made here in the open rather than inside the mover.
//
// By default a reader path promotes to its whole top-level subtree: the trees are small, they were
// written as one run's evidence, and splitting a 30 MB directory to save 29 MB of it is not worth
// the chance of severing a sibling the scan's forms did not name. `sol/` is a NAMESPACE rather than
// a subtree (the reader map itself writes `sol/mp-balance-harness` and `sol/map-art-campaign-2` as
// peers), so the root is one segment deeper under it.
export const NAMESPACE_DIRS = new Set(['sol']);

// Excluded from promotion BY NAME with a reason. Never widen this by pattern; the house convention
// is `law-pointer-guard.mjs`'s ILLUSTRATIVE_INSTRUMENTS and KNOWN_ROTTEN maps.
export const FILE_EXACT_SUBTREES = new Map([
  ['artifacts/sol/map-art-campaign-2',
    'Measured 5,878.5 MB across 10,342 tracked files on 2026-09-25 - 68% of the whole evidence tree - '
    + 'against which exactly two readers resolve (phone-hud-entry-census.mjs over run-6/*/capture-config.json '
    + 'and its test over run-8/phone-hud/{before,after}.json). Promoting the campaign to keep 3 small JSON '
    + 'files would forfeit the entire purpose of the offload, so this one subtree is pinned FILE-EXACT and '
    + 'the movers carry a keep list. Reader map §A4 records the same three files.'],
]);

// The `artifacts/<id>/report.md` law. `.claude/skills/author-task/SKILL.md` prescribes the report,
// `.claude/skills/drain/SKILL.md` §1 names `artifacts/sol/map-art-campaign-2/report.md` as one of
// two shared campaign documents resolved by key with `md-3way.cjs`, and the reader map calls that
// out as its one law-text exception. Both reach this predicate as a BASENAME rule, not a path list,
// so a report written tomorrow is covered without an edit here.
export const REPORT_BASENAMES = new Set(['report.md']);

// Markdown and JSON have no code semantics, so a lexical sweep is exact for them. CODE does NOT
// get one: a first draft of this file scanned `.mjs` with this very regex and SILENTLY LOST the
// three readers in `scripts/assay-replay.test.mjs`, `scripts/engine-era-guard.test.mjs` and
// `scripts/regatta-boat-steer.test.mjs`, because an apostrophe in a prose comment ("a fire's own")
// opens a string that runs to the next apostrophe and swallows every real literal between them.
// The reader map's four §A4 subtrees that this scan "did not find" were all that one bug. Code is
// parsed by `typescript` below, which is what the repo's other text guards already do
// (`no-emdash-guard.test.mjs` transpiles to strip comments for the same reason).
const QUOTED = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const PLACEHOLDER = /\$\{[^}]*\}|<[^>/]*>/;
const CODE = /\.(?:mjs|js|cjs|ts|tsx)$/;

/** Every string and template literal in a code file, with its byte offset. Comments excluded by the parser. */
export function codeLiterals(file, text) {
  const ts = typescript();
  const kind = /\.tsx$/.test(file) ? ts.ScriptKind.TSX : /\.ts$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false, kind);
  const found = [];
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      found.push({ value: node.text, start: node.getStart(sf) });
    } else if (ts.isTemplateExpression(node)) {
      // `…/run-6/${map}/capture-config.json` becomes `…/run-6/*/capture-config.json`: the constant
      // parts are what pin, and the substitution is exactly a one-segment wildcard.
      found.push({
        value: node.head.text + node.templateSpans.map((span) => `*${span.literal.text}`).join(''),
        start: node.getStart(sf),
      });
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sf, visit);
  return found;
}

// The characters a path in this repo may carry, plus the two placeholder shapes (`${…}` from a
// template, `<…>` from a law document). Written as a POSITIVE set, never as "cut at the first
// closing quote": the first draft used `/[)'"`\s].*$/` and `.` does not cross a newline, so a
// multi-line literal - the embedded `bin/npm` stub inside `scripts/deploy-budget.test.mjs`, for one
// - kept its newlines and minted a must-stay pattern called `fs.writeFileSync('artifacts`.
const PATH_CHARS = /^[A-Za-z0-9_\-./*${}<>+~@]+/;

/** Repo-relative, POSIX, no leading `./`, `../` or `/`; null when the literal names nothing under artifacts/. */
export function normaliseLiteral(raw) {
  const unescaped = raw.replace(/\\/g, '');
  const at = unescaped.indexOf('artifacts/');
  if (at === -1) return null;
  const value = (unescaped.slice(at).match(PATH_CHARS)?.[0] ?? '').replace(/\/+$/, '');
  if (!value.startsWith('artifacts/') || value === 'artifacts') return null;
  return value;
}

/** A literal with `${…}` or `<…>` segments becomes a glob; the constant part is what pins. */
export function literalToPattern(value) {
  return PLACEHOLDER.test(value)
    ? value.replace(/\$\{[^}]*\}/g, '*').replace(/<[^>/]*>/g, '*')
    : value;
}

/** A single `*` matches within one segment, exactly as a git pathspec glob does. */
export function patternToRegExp(pattern) {
  const body = pattern
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${body}$`);
}

function classify(window) {
  for (const form of READ_FORMS) if (form.re.test(window)) return { kind: 'read', form: form.id };
  for (const form of WRITE_FORMS) if (form.re.test(window)) return { kind: 'write', form: form.id };
  return { kind: 'unclassified', form: null };
}

/**
 * Every `artifacts/…` literal in the scan space, with the form that surrounds it.
 *
 * `unclassified` hits inside a TEST or an e2e SPEC are treated as reads (`keptBecause:
 * 'unclassified-in-a-test'`). That is the F-2212-1 direction: the population that can red a gate
 * is exactly the tests, a hit there is cheap to keep, and the alternative is a scan whose
 * correctness depends on having thought of every call shape - which §A4's own closing paragraph
 * says was already not true once.
 */
export function scanLiterals(root = DEFAULT_ROOT, files = trackedFiles(root)) {
  const hits = [];
  for (const file of files) {
    const family = SCAN_SPACE.find((f) => f.test(file));
    if (!family) continue;
    let text;
    try {
      text = readFileSync(resolve(root, file), 'utf8');
    } catch {
      continue; // a tracked path that will not read is a finding for another instrument, not a reader
    }
    if (!text.includes('artifacts/')) continue;
    const isTest = /\.test\.mjs$/.test(file) || /^e2e\//.test(file);
    const literals = CODE.test(file)
      ? codeLiterals(file, text)
      : [...text.matchAll(QUOTED)].map((m) => ({ value: m[2], start: m.index }));
    for (const literal of literals) {
      const value = normaliseLiteral(literal.value);
      if (!value) continue;
      const window = text.slice(Math.max(0, literal.start - 200), literal.start).replace(/\s+/g, ' ');
      const { kind, form } = classify(window);
      const line = text.slice(0, literal.start).split('\n').length;
      hits.push({
        file, line, literal: literal.value, value, pattern: literalToPattern(value), family: family.label,
        kind: kind === 'unclassified' && isTest ? 'read' : kind,
        form: kind === 'unclassified' && isTest ? 'unclassified-in-a-test' : form,
        declaredKind: kind,
      });
    }
  }
  return hits;
}

export function trackedFiles(root = DEFAULT_ROOT) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 })
    .split('\0')
    .filter(Boolean);
}

export function subtreeRootOf(path) {
  const segments = path.split('/');
  const depth = NAMESPACE_DIRS.has(segments[1]) ? 3 : 2;
  return segments.slice(0, depth).join('/');
}

/**
 * The derivation: patterns that must stay, where each came from, and what each resolves to on the
 * tree right now. PATTERNS are the authority, not their expansion: `run-6/${map}/capture-config.json`
 * must protect a map captured tomorrow, so the predicate keeps the glob and the expansion is only
 * ever a measurement (reader map §A4 names `run-6/the-claim/capture-config.json`, which no longer
 * exists on the tree; the glob covers it either way).
 */
export function deriveMustStay(root = DEFAULT_ROOT, options = {}) {
  const files = options.files ?? trackedFiles(root);
  const hits = options.hits ?? scanLiterals(root, files);
  // `options.fileExact` exists so the FILE-EXACT branch - the one the 5.8 GB campaign move depends
  // on entirely - can be exercised on a fixture tree. The live default is the declared map above.
  const fileExact = options.fileExact ?? FILE_EXACT_SUBTREES;
  const artifacts = files.filter((f) => f.startsWith('artifacts/'));
  const patterns = new Map();
  const unresolved = [];

  const add = (pattern, hit, promoted) => {
    const key = promoted ?? pattern;
    const entry = patterns.get(key) ?? { pattern: key, from: [], promotedFrom: [], matches: 0 };
    entry.from.push(`${hit.file}:${hit.line} (${hit.form ?? hit.kind})`);
    if (promoted && promoted !== pattern) entry.promotedFrom.push(pattern);
    patterns.set(key, entry);
  };

  for (const hit of hits) {
    if (hit.kind !== 'read' && hit.kind !== 'write') continue;
    const pattern = hit.pattern;
    const matcher = patternToRegExp(pattern);
    const prefix = pattern.includes('*') ? pattern.slice(0, pattern.indexOf('*')) : `${pattern}/`;
    // A literal that matches NOTHING tracked is recorded and KEPT. It cannot pin content that does
    // not exist, so keeping it costs zero bytes, and dropping it would have two real casualties:
    // `artifacts/ledger-backups/` (a §A4 write target with 0 tracked files, which must stay
    // CREATABLE) and every e2e output directory whose run happens to be un-committed today but
    // whose next run writes there again. Fixture paths inside `mkdtemp` repos land here too and are
    // harmless for the same reason: nothing tracked matches them.
    if (!artifacts.some((f) => matcher.test(f) || f.startsWith(prefix))) unresolved.push({ ...hit, pattern });
    const root1 = subtreeRootOf(pattern);
    // A pattern whose SUBTREE SEGMENT is itself a wildcard must never be promoted:
    // `artifacts/<id>/report.md` from author-task/SKILL.md would promote to `artifacts/*` and pin
    // the entire tree, turning the derivation into a refusal to move anything. Such a pattern
    // stays exactly as written, where it pins the file class it actually names.
    const promotable = !root1.includes('*') && !fileExact.has(root1);
    add(pattern, hit, promotable ? root1 : pattern);
  }

  const compiled = [...patterns.values()].map((p) => ({ ...p, re: patternToRegExp(p.pattern) }));
  for (const entry of compiled) {
    const prefix = entry.pattern.includes('*') ? null : `${entry.pattern}/`;
    entry.matches = artifacts.filter((f) => entry.re.test(f) || (prefix && f.startsWith(prefix))).length;
  }
  compiled.sort((a, b) => a.pattern.localeCompare(b.pattern));
  return { root, files, hits, artifacts, patterns: compiled, unresolved };
}

/**
 * mustStay(path) — would moving exactly this path break a reader, a write target, or a law?
 *
 * TRUE for a pinned path, for anything UNDER one, and for a report.md anywhere in the tree.
 * FALSE for a mere ANCESTOR of a pinned path: `artifacts/sol/map-art-campaign-2` is movable, less
 * its keep list, and that distinction is the entire reason the offload is worth running.
 *
 * The ancestor case is safe ONLY because the mover tests every FILE it is about to move, never the
 * subtree alone (`evidence-offload.mjs` builds its keep list from this predicate per file). A future
 * caller that tests a directory and then moves its contents unfiltered would be reading this
 * predicate as something it deliberately is not.
 */
export function mustStay(path, derivation) {
  const value = String(path).replace(/\/+$/, '');
  if (!value.startsWith('artifacts/')) return false;
  if (REPORT_BASENAMES.has(value.slice(value.lastIndexOf('/') + 1))) return true;
  for (const entry of derivation.patterns) {
    if (entry.re.test(value)) return true;
    if (!entry.pattern.includes('*') && value.startsWith(`${entry.pattern}/`)) return true;
  }
  return false;
}

/** A closure over one derivation, for callers that ask thousands of times. */
export function mustStayPredicate(derivation) {
  const cache = new Map();
  return (path) => {
    const key = String(path).replace(/\/+$/, '');
    if (!cache.has(key)) cache.set(key, mustStay(key, derivation));
    return cache.get(key);
  };
}

// The §A4 Class 1 subtree names, transcribed from the reader map so `--map-diff` and the test can
// compare a hand list against a derivation. This is a CONTROL, never an input to the predicate.
export const MAP_CLASS1_SUBTREES = [
  'artifacts/asset-diet', 'artifacts/sol/mp-balance-harness', 'artifacts/shared-atlas-dedupe',
  'artifacts/board-tape-gold', 'artifacts/browser-door-held-gold', 'artifacts/e5-stillwater',
  'artifacts/f1450-4', 'artifacts/hero-move-verb', 'artifacts/e5-regatta-boat',
  'artifacts/e5-regatta-boat-02', 'artifacts/e5-regatta-boat-03', 'artifacts/f2135-canyon-census',
  'artifacts/rider-parity-grammar', 'artifacts/beauty-far-ground', 'artifacts/assay-e2e-20260822',
  'artifacts/gauntlet-heat2-20260824', 'artifacts/gauntlet-heat5-20260824',
  'artifacts/gauntlet-heat5b-20260825', 'artifacts/gauntlet-heat6-20260825',
  'artifacts/gauntlet-heat6-guests-r2-20260825', 'artifacts/gauntlet-heat7-20260830',
  'artifacts/gauntlet-heat11-20260903', 'artifacts/gauntlet-heat12-20260905',
  'artifacts/gauntlet-heat15-cd24d12d', 'artifacts/claude-debut-20260831',
  'artifacts/claude-debut-20260901', 'artifacts/ledger-backups', 'artifacts/e3-moth-season',
];

function bytesOfPaths(root, paths) {
  if (!paths.length) return 0;
  const out = execFileSync('git', ['ls-tree', '-r', '-l', 'HEAD', '--', 'artifacts'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30 });
  const sizes = new Map();
  for (const line of out.split('\n')) {
    const m = line.match(/^\d+ blob [0-9a-f]+\s+(\d+|-)\t(.*)$/);
    if (m) sizes.set(m[2], m[1] === '-' ? 0 : Number(m[1]));
  }
  return paths.reduce((a, p) => a + (sizes.get(p) ?? 0), 0);
}

function main() {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const root = rootFlag === -1 ? DEFAULT_ROOT : resolve(argv[rootFlag + 1] ?? '');
  let derivation;
  try {
    derivation = deriveMustStay(root);
  } catch (error) {
    console.log(`⛔ CANNOT VERIFY — the reader scan did not run: ${error.message}`);
    console.error(`evidence-readers: REFUSING — ${error.message}`);
    process.exit(2);
  }
  const stays = mustStayPredicate(derivation);
  const staying = derivation.artifacts.filter(stays);
  const movable = derivation.artifacts.filter((f) => !stays(f));
  const derived = new Set(derivation.patterns.map((p) => subtreeRootOf(p.pattern)));
  const mapOnly = MAP_CLASS1_SUBTREES.filter((s) => !derived.has(s));
  const scanOnly = [...derived].filter((s) => !MAP_CLASS1_SUBTREES.includes(s)).sort();

  if (argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify({
      scanSpace: SCAN_SPACE.map((f) => f.label),
      readForms: READ_FORMS.map((f) => f.id),
      writeForms: WRITE_FORMS.map((f) => f.id),
      hits: derivation.hits.length,
      patterns: derivation.patterns.map(({ re, ...rest }) => rest),
      unresolved: derivation.unresolved.map((u) => ({ file: u.file, line: u.line, pattern: u.pattern, form: u.form })),
      artifactsTracked: derivation.artifacts.length,
      mustStayFiles: staying.length,
      movableFiles: movable.length,
      mapOnlySubtrees: mapOnly,
      scanOnlySubtrees: scanOnly,
    }, null, 2)}\n`);
    return;
  }

  console.log('evidence-readers — the must-stay set, DERIVED from the code (task evidence-offload-1)');
  console.log(`  scan space   : ${SCAN_SPACE.map((f) => f.label).join(' · ')}`);
  console.log(`                 a reader OUTSIDE these families is invisible here (F-2208-1)`);
  console.log(`  read forms   : ${READ_FORMS.map((f) => f.id).join(' ')}`);
  console.log(`  write forms  : ${WRITE_FORMS.map((f) => f.id).join(' ')}`);
  console.log(`  keep by law  : any artifacts/**/${[...REPORT_BASENAMES].join(', ')} (author-task + drain SKILL.md)`);
  console.log(`  file-exact   : ${[...FILE_EXACT_SUBTREES.keys()].join(', ') || 'none'} (promotion refused BY NAME)`);
  console.log('');
  console.log(`  literals     : ${derivation.hits.length} artifacts/ literal(s) in the scan space`);
  console.log(`                 ${derivation.hits.filter((h) => h.kind === 'read').length} read · ${derivation.hits.filter((h) => h.kind === 'write').length} write · ${derivation.hits.filter((h) => h.kind === 'unclassified').length} unclassified outside a test`);
  console.log(`                 ${derivation.hits.filter((h) => h.form === 'unclassified-in-a-test').length} unclassified INSIDE a test, kept must-stay (F-2212-1 polarity)`);
  console.log(`  unresolved   : ${derivation.unresolved.length} literal(s) match nothing tracked (fixture paths; they pin nothing)`);
  console.log(`  patterns     : ${derivation.patterns.length} must-stay pattern(s)`);
  console.log(`  tracked      : ${derivation.artifacts.length} file(s) under artifacts/`);
  console.log(`  MUST STAY    : ${staying.length} file(s)  ·  MOVABLE ${movable.length} file(s)`);
  console.log('');
  console.log('  must-stay patterns (pattern · tracked matches · first source):');
  for (const p of derivation.patterns) {
    console.log(`    ${p.pattern.padEnd(62)} ${String(p.matches).padStart(6)}  ${p.from[0]}`);
  }
  console.log('');
  console.log('  AGAINST THE READER MAP §A4 (a control, never an input):');
  console.log(`    in §A4 but NOT derived : ${mapOnly.length ? mapOnly.join(', ') : 'none'}`);
  console.log(`    derived but NOT in §A4 : ${scanOnly.length ? scanOnly.join(', ') : 'none'}`);
  if (argv.includes('--map-diff')) {
    console.log('');
    console.log(`    must-stay bytes: ${(bytesOfPaths(root, staying) / 1e6).toFixed(1)} MB`);
    for (const u of derivation.unresolved) console.log(`    UNRESOLVED  ${u.pattern}  ${u.file}:${u.line} (${u.form ?? u.kind})`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
