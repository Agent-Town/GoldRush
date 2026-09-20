// HEAT 12 SINGLE-RIDE DRIVER — operator transport only. Chains, for exactly one contract:
//   1. make-charter.mjs   2. ride-wall.mjs (bounded headless `claude -p`)   3. land-ride.mjs
// One ride at a time, `nice`d, because other implementers share this host tonight.
// usage: node ride-one.mjs --contract=<id> --seed=<seed|default> --generation=<n>
//                          [--stake=never-claimed|mechanic-changed|stale-receipt] [--wall=1500] [--rig=opus]
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARENA = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const ERA = '540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068';
const HARNESS_VERSION = '2.1.272';
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['contract', 'seed', 'generation']) if (!args[key]) throw new Error(`--${key} required`);
const rig = args.rig ?? 'opus';
const model = { opus: 'claude-opus-5', fable: 'claude-fable-5' }[rig];
const wall = String(args.wall ?? 1500);
const dir = join(HERE, 'rides', args.contract);
const workdir = join(ARENA, 'artifacts', 'heat14', rig, args.contract);
mkdirSync(dir, { recursive: true });
mkdirSync(workdir, { recursive: true });

const line = (s) => process.stdout.write(`${s}\n`);
line(`\n########## RIDE ${args.contract} · seed ${args.seed} · gen ${args.generation} · stake ${args.stake ?? 'never-claimed'} · wall ${wall}s ##########`);

line('--- 1 charter ---');
line(execFileSync('node', [join(HERE, 'make-charter.mjs'), `--rig=${rig}`, `--contract=${args.contract}`, `--seed=${args.seed}`,
  `--generation=${args.generation}`, `--engineHash=${ERA}`, `--harnessVersion=${HARNESS_VERSION}`,
  `--workdir=${workdir}`, `--out=${join(dir, 'charter.md')}`, `--stake=${args.stake ?? 'never-claimed'}`, `--wall=${wall}`],
  { encoding: 'utf8', cwd: HERE }).trim());

line('--- 2 ride ---');
const ride = spawnSync('nice', ['-n', '5', 'node', join(HERE, 'ride-wall.mjs'), `--arena=${ARENA}`, `--rig=${rig}`, `--model=${model}`,
  `--charter=${join(dir, 'charter.md')}`, `--workdir=${workdir}`, `--out=${dir}`, `--wall=${wall}`],
  { encoding: 'utf8', cwd: HERE, stdio: ['ignore', 'inherit', 'inherit'], timeout: (Number(wall) + 240) * 1000 });
line(`ride-wall rc=${ride.status} signal=${ride.signal ?? '-'}`);

line('--- 3 land ---');
const land = spawnSync('node', [join(HERE, 'land-ride.mjs'), `--rig=${rig}`, `--contract=${args.contract}`, `--dir=${dir}`,
  `--generation=${args.generation}`, `--harnessVersion=${HARNESS_VERSION}`, `--arena=${ARENA}`, `--era=${ERA}`],
  { encoding: 'utf8', cwd: HERE, maxBuffer: 64 * 1024 * 1024 });
const landOut = `${land.stdout ?? ''}${land.stderr ?? ''}`;
writeFileSync(join(dir, 'land.log'), landOut);
line(landOut);
line(`land rc=${land.status}`);

// 4. The commons loop. ADAPTED FROM HEAT 11, where the operator appended the notebook BY HAND after
//    reading each report. That is one ride's latency, and it means a batched queue would build every
//    later charter against a notebook missing its own predecessors — the rig would lose its
//    self-memory exactly where it is most useful. The only judgment in the hand-written step was the
//    door verdict line, and that is mechanical: it is verdict-slip.json. So the driver writes it, and
//    the rider's lessons still go in VERBATIM (notebook-append copies them from the report).
line('--- 4 notebook ---');
const readJson = (f) => { try { return JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { return null; } };
const slip = readJson('verdict-slip.json');
const post = readJson('post-response.json');
const verdict = slip
  ? `${slip.assay}${slip.assayHash ? ` ${slip.assayHash}` : ''}${slip.ranked === false ? ', unranked' : ''}${post?.rank !== undefined && post?.rank !== null ? `, rank ${post.rank}` : ''}`
  : 'nothing submitted — the ride did not secure';
try {
  line(execFileSync('node', [join(HERE, 'notebook-append.mjs'), `--rig=${rig}`, `--contract=${args.contract}`, `--generation=${args.generation}`,
    `--era=${ERA}`, `--harnessVersion=${HARNESS_VERSION}`, `--summary=${join(dir, 'summary.json')}`, `--out=${dir}`, `--verdict=${verdict}`,
    `--scribe=Heat 14 (${args.stake ?? 'never-claimed'}), ride ${args.n ?? '?'}.`], { encoding: 'utf8', cwd: HERE }).trim());
} catch (error) { line(`NOTEBOOK FAILED: ${error.stdout ?? ''}${error.stderr ?? error.message}`); }

line('--- 5 matrix ---');
try {
  line(execFileSync('node', [join(HERE, 'matrix-row.mjs'), `--n=${args.n ?? '?'}`, `--contract=${args.contract}`, `--seed=${args.seed}`,
    `--stake=${args.stake ?? 'never-claimed'}`, `--gen=${args.generation}`, '--append'], { encoding: 'utf8', cwd: HERE }).trim());
} catch (error) { line(`MATRIX FAILED: ${error.stdout ?? ''}${error.stderr ?? error.message}`); }
line(`########## END ${args.contract} ##########\n`);
