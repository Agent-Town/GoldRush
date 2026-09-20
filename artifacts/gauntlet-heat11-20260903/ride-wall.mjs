// HEAT 11 RIDE WALL — operator transport only. No strategy, no coordinates, no controller code.
// Launches exactly one `claude -p` ride from the arena with the prescribed clean env and tool grants,
// bounds it with a wall (default 1500 s = 25 min), streams progress lines to stdout (for the harness
// notification channel), and records `ride-meta.json` beside the rig's own files.
//
// usage: node ride-wall.mjs --arena=<dir> --rig=<opus|fable> --model=<claude-opus-5|claude-fable-5>
//                           --charter=<file> --workdir=<dir> --out=<dir> [--wall=1500]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['arena', 'rig', 'model', 'charter', 'workdir', 'out']) if (!args[key]) throw new Error(`--${key} required`);
const wall = Number(args.wall ?? 1500);
if (!Number.isFinite(wall) || wall <= 0) throw new Error('--wall must be a positive number of seconds');
mkdirSync(args.out, { recursive: true });
mkdirSync(args.workdir, { recursive: true });

const charter = readFileSync(args.charter, 'utf8');
const sessionId = randomUUID();
const argv = [
  '-u', 'CLAUDECODE', '-u', 'CLAUDE_CODE_ENTRYPOINT', '-u', 'CLAUDE_CONFIG_DIR',
  'claude', '-p', charter,
  '--model', args.model,
  '--allowedTools', 'Read,Write,Glob,Bash(node *)',
  '--output-format', 'text',
  '--session-id', sessionId,
];
const startedAt = new Date();
const stdoutFd = openSync(`${args.out}/ride.stdout.log`, 'w');
const stderrFd = openSync(`${args.out}/ride.stderr.log`, 'w');
const meta = {
  rig: args.rig, model: args.model, arena: args.arena, workdir: args.workdir, charterFile: args.charter,
  charterSha256: createHash('sha256').update(charter).digest('hex'),
  sessionId, wallSeconds: wall, startedAt: startedAt.toISOString(),
  invocation: `env ${argv.map((a, i) => (i === 8 ? '"<charter text, see charterFile>"' : a)).join(' ')}`,
};
writeFileSync(`${args.out}/ride-meta.json`, `${JSON.stringify(meta, null, 2)}\n`);

const child = spawn('env', argv, { cwd: args.arena, detached: true, stdio: ['ignore', stdoutFd, stderrFd] });
let wallHit = false;
const timer = setTimeout(() => {
  wallHit = true;
  process.stdout.write(`WALL ${args.rig} ${wall}s reached — SIGTERM to process group ${child.pid}\n`);
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
  setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }, 15_000).unref();
}, wall * 1000);

process.stdout.write(`START ${args.rig} ${args.model} pid=${child.pid} session=${sessionId} at=${startedAt.toISOString()}\n`);

// Progress: watch the rig's own outcome file (the intermediate-results law) and echo changes.
let lastOutcome = '';
let firstOutputAt = null;
const poll = setInterval(() => {
  try {
    const path = `${args.workdir}/gauntlet-outcome.json`;
    if (!firstOutputAt && existsSync(args.workdir) && readdirSync(args.workdir).length > 0) {
      firstOutputAt = new Date();
      process.stdout.write(`FIRST-OUTPUT ${args.rig} +${Math.round((firstOutputAt - startedAt) / 1000)}s\n`);
    }
    if (existsSync(path)) {
      const raw = readFileSync(path, 'utf8');
      if (raw !== lastOutcome) {
        lastOutcome = raw;
        let o; try { o = JSON.parse(raw); } catch { o = null; }
        process.stdout.write(`OUTCOME ${args.rig} ${o ? `secured=${o.secured} waves=${o.waves} gold=${o.gold} runsSoFar=${o.runsSoFar} scored=${o.scoredAttempts}` : 'unparsable'} +${Math.round((Date.now() - startedAt) / 1000)}s\n`);
      }
    }
  } catch {}
}, 15_000);

child.on('exit', (code, signal) => {
  clearTimeout(timer); clearInterval(poll);
  const endedAt = new Date();
  const done = { ...meta, endedAt: endedAt.toISOString(), wallClockSeconds: Math.round((endedAt - startedAt) / 1000), exitCode: code, signal, wallHit, firstOutputAt: firstOutputAt?.toISOString() ?? null, setupToFirstOutputSeconds: firstOutputAt ? Math.round((firstOutputAt - startedAt) / 1000) : null };
  writeFileSync(`${args.out}/ride-meta.json`, `${JSON.stringify(done, null, 2)}\n`);
  process.stdout.write(`END ${args.rig} rc=${code} signal=${signal} wall=${done.wallClockSeconds}s wallHit=${wallHit}\n`);
  process.exit(wallHit ? 124 : (code ?? 1));
});
