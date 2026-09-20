// Build a scratch copy of the guard that EXPORTS the window derivation, per F-1515-1's
// stated method: copy the guard and export what you need, do NOT consume scan()'s public
// rows (they carry no `window`/`titles`, so a filter on those returns a false zero).
// Copies lines 1..292 (everything before the CLI at :293), re-roots it, and widens the
// rows.push to carry `win` and `titles`.
import fs from 'node:fs';

const SRC = 'scripts/citation-title-guard.mjs';
const OUT = 'logs/session-scratch/s1515-guard-copy.mjs';
const src = fs.readFileSync(SRC, 'utf8').split('\n');

// everything before the CLI (line 293 is `const taskDocs = trackedTaskDocs();`)
const cliAt = src.findIndex((l) => l.startsWith('const taskDocs = trackedTaskDocs();'));
if (cliAt < 0) throw new Error('CLI boundary not found');
let body = src.slice(0, cliAt).join('\n');

// re-root: the copy lives two dirs deep, so DEFAULT_ROOT would resolve to logs/
const rootLine = "const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '..');";
if (!body.includes(rootLine)) throw new Error('root line not found');
body = body.replace(rootLine, `const DEFAULT_ROOT = ${JSON.stringify(process.cwd())};`);

// widen the row so the window and titles survive
const push = 'rows.push({ file, raw: hit[0], spec, verdict, carried, mdLine, context });';
if (!body.includes(push)) throw new Error('rows.push not found');
body = body.replace(push, 'rows.push({ file, raw: hit[0], spec, verdict, carried, mdLine, context, win, titles });');

fs.writeFileSync(OUT, body + '\n');
console.log('wrote', OUT, '-', body.split('\n').length, 'lines (CLI at src line', cliAt + 1, 'dropped)');
