/**
 * run-orphans.mjs — s1253. s1252's lesson applied at class scale:
 * having asked "is anyone asking it?", now ASK THE ORPHANS THE QUESTION.
 * An unrun guard is an unread verdict; a RED unrun guard is worse.
 *
 * Shell gate: npm scripts whose BODY contains `&&` are blocked as bash lines,
 * and `ENV=v node ...` prefixes are denied. spawnSync with an argv array and an
 * env object is the reliable pattern (s1252 §F).
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const OUT = 'logs/session-scratch/s1253/orphan-run-' + (process.argv[2] || 'none') + '.txt';
writeFileSync(OUT, 's1253 orphan gate runs — started ' + new Date().toISOString() + '\n\n');
function log(s) { console.log(s); appendFileSync(OUT, s + '\n'); }

const which = process.argv[2];
const JOBS = {
  'asset-diet': { cmd: 'npm', args: ['run', 'test:asset-diet'], env: {}, timeout: 600_000 },
  'build-release': { cmd: 'npm', args: ['run', 'build:release'], env: { GR_RELEASE: 'e1' }, timeout: 900_000 },
  'build-release-noenv': { cmd: 'npm', args: ['run', 'build:release'], env: {}, timeout: 900_000 },
  'release': { cmd: 'npm', args: ['run', 'test:release', '--', '--workers=1'], env: {}, timeout: 1_500_000 },
};
const job = JOBS[which];
if (!job) { console.error('usage: run-orphans.mjs <' + Object.keys(JOBS).join('|') + '>'); process.exit(2); }

log('=== ' + which + ' :: ' + job.cmd + ' ' + job.args.join(' ') + '  env=' + JSON.stringify(job.env) + ' ===');
const t0 = Date.now();
const r = spawnSync(job.cmd, job.args, {
  encoding: 'utf8',
  env: { ...process.env, ...job.env },
  timeout: job.timeout,
  maxBuffer: 128 * 1024 * 1024,
});
const secs = ((Date.now() - t0) / 1000).toFixed(1);
log('--- stdout tail ---');
log((r.stdout || '').split('\n').slice(-45).join('\n'));
if (r.stderr && r.stderr.trim()) { log('--- stderr tail ---'); log(r.stderr.split('\n').slice(-25).join('\n')); }
log('\n>>> RC=' + r.status + '  signal=' + r.signal + '  ' + secs + 's');
process.exit(0);
