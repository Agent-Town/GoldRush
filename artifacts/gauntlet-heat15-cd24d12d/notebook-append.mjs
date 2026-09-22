// HEAT 11 NOTEBOOK APPENDER — the commons loop, scribed by the operator. Appends one generation to the
// rig's own notebook in the gauntlet checkout (FORMAT.md header: generation, model, harness+version,
// effort, era, contracts, cost) followed by the rig's lessons VERBATIM (from its report), plus a
// one-line scribe summary labeled as such. Writes the exact header to <out>/notebook-header.txt so the
// harnessDigest can freeze it. usage:
//   node notebook-append.mjs --rig=<opus|fable> --contract=<id> --generation=<n> --era=<hash> --harnessVersion=<v>
//                            --summary=<summary.json> --out=<ride dir> [--scribe="<one line>"] [--verdict="<door verdict line>"]
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['rig', 'contract', 'generation', 'era', 'harnessVersion', 'summary', 'out']) if (!args[key]) throw new Error(`--${key} required`);
const slug = { opus: 'opus-5', fable: 'fable-5' }[args.rig];
const model = { opus: 'claude-opus-5', fable: 'claude-fable-5' }[args.rig];
if (!slug) throw new Error(`unknown rig ${args.rig}`);
const notebookPath = join(process.env.HOME, 'Claude/Projects/goldrush-gauntlet/memories', `claude__${slug}`, 'NOTEBOOK.md');
const s = JSON.parse(readFileSync(args.summary, 'utf8'));

const iso = (s.endedAt ?? new Date().toISOString());
const tokens = s.usage && s.usage.tokensIn !== undefined ? `tokens in ${s.usage.tokensIn} / out ${s.usage.tokensOut} (+cache read ${s.usage.cacheReadTokens ?? 0}) over ${s.usage.assistantTurns} turns, ${s.usage.toolCalls} tool calls (measured from the CLI transcript)` : 'tokens unavailable';
const header = [
  `## generation ${args.generation} — ${iso}`,
  `model: ${model} · harness: Claude Code CLI ${args.harnessVersion} · effort: n/a · era: ${args.era} · contracts: ${args.contract}`,
  `cost: wallClock ${s.wallClockSeconds ?? 'n/a'}s${s.wallHit ? ` (WALL HIT at ${s.wallSeconds ?? 1500}s)` : ''} · setupToFirstOutput ${s.setupToFirstOutputSeconds ?? 'n/a'}s · ${tokens} · $ unavailable (owner-authorized subscription)`,
].join('\n');

const o = s.outcome && s.outcome.secured === undefined && s.outcome.outcome ? { ...s.outcome.outcome, ...s.outcome } : s.outcome;
const outcomeLine = o
  ? `${o.secured ? 'SECURED' : 'NOT SECURED'} — w${o.waves} / ${o.timeMs !== undefined ? (o.timeMs / 1000).toFixed(3) + 's' : (o.timeAlive ?? 'n/a') + 's'} / ${o.gold}g / calls ${o.calls ?? 'n/a'} · runs ${o.runsSoFar ?? 'n/a'} · scored attempts ${o.scoredAttempts ?? 'n/a'} · worldModel ${o.worldModel ?? 'undeclared'}`
  : `NO OUTCOME FILE WRITTEN (${s.outcomeError ?? 'absent'})`;
const lessons = s.report?.lessons?.trim();
const map = s.report?.whatTheMapAsked?.trim();
const win = s.report?.winnability?.trim();

const body = [
  '',
  header,
  `- Scribe (operator, labeled): ${outcomeLine}.${args.verdict ? ` Door: ${args.verdict}.` : ''}${args.scribe ? ` ${args.scribe}` : ''}`,
  win ? `- Winnability (rider, verbatim): ${win.replace(/\n+/g, ' ')}` : '- Winnability: the rider wrote no Winnability section.',
  map ? `- What the map asked (rider, verbatim): ${map.replace(/\n+/g, ' ')}` : '- What the map asked: the rider wrote no such section.',
  lessons ? `- Lessons (rider, verbatim):\n${lessons.split('\n').map((l) => (l.trim() ? `  ${l}` : '')).join('\n')}` : '- Lessons: the rider wrote no Lessons section (see the report/transcript in the evidence dir).',
  '',
].join('\n');

writeFileSync(join(args.out, 'notebook-header.txt'), header);
if (args['header-only'] !== undefined) { process.stdout.write(`${JSON.stringify({ headerOnly: true, headerBytes: Buffer.byteLength(header) })}\n`); process.exit(0); }
appendFileSync(notebookPath, body);
writeFileSync(join(args.out, 'notebook-entry.md'), body);
process.stdout.write(`${JSON.stringify({ notebook: notebookPath, generation: Number(args.generation), headerBytes: Buffer.byteLength(header), entryBytes: Buffer.byteLength(body) })}\n`);
