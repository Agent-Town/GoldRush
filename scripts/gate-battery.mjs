#!/usr/bin/env node
/**
 * gate-battery.mjs — the PERMANENT gate-battery driver. Run a list of gate jobs,
 * keep every arm's output as evidence, return one verdict.
 *
 * WHY THIS EXISTS (F-1255-3, plus the class audit in s1275).
 * Fires kept re-minting this script. `logs/session-scratch/s1254/gates.mjs` was copied
 * from an earlier fire's copy, and its line 6 opened the transcript with a truncating
 * `writeFileSync` — so in a multi-battery drain only the LAST arm survived as evidence.
 * A retention hole in the very script whose job is to leave evidence. s1255 fixed it in
 * ITS copy (append + per-battery stamp) and wrote: "worth folding into whatever the next
 * fire copies from." There was nothing to fold it into — that is the actual defect. Every
 * fire re-derived the same five decisions and re-introduced the bugs the last fire fixed.
 *
 * THE SIBLING PROVES IT IS A CLASS, NOT AN INSTANCE (F-1275-1, measured s1275):
 * `scripts/tmp-s1146-gate.mjs:51` writes `artifacts/s1146-drain-gate.txt` with the same
 * truncating call, at a FIXED path, in a driver built to run two projects. The cure had
 * been written once and never crossed to the sibling — Mistake-catalog shape "cured defect
 * survives in the sibling script". A permanent home is what stops the third instance.
 *
 * WHAT IT GUARANTEES, and the measurement behind each:
 *  1. APPEND-ONLY, ISO-STAMPED TRANSCRIPT (F-1255-3). A second invocation never destroys
 *     the first arm. This is asserted end-to-end by gate-battery.test.mjs, not assumed.
 *  2. `--workers=1` INJECTED INTO EVERY PLAYWRIGHT JOB (scripts/fire.md §3.1). In the fire
 *     shell this is a CORRECTNESS requirement, not a speed knob: the fire's process context
 *     carries a per-job CPU ceiling (F-1269-1), and at the default 6 workers each chromium
 *     starves until timing-sensitive assertions go red — 17 drift reds / 18 at default vs
 *     0 / 18 at w=1, same shell, same hour (F-1270-1, s1270). `playwright.config.ts:30`
 *     mechanises it too; this is the belt to that's braces, and it keeps the intent legible
 *     at the call site where a reader will actually see it.
 *  3. PATHS VIA fileURLToPath, NEVER URL.pathname (F-1255-3, second half). `URL.pathname`
 *     percent-encodes the space in "Gold Rush", so `git apply` silently found no file and a
 *     restore did nothing while reporting success.
 *  4. maxBuffer 256 MB. spawnSync silently truncates stdout under load, and a truncated
 *     transcript is a lie told by an evidence file.
 *  5. THE VERDICT IS AN EXIT CODE, never a parse of stdout — for the same truncation reason.
 *
 * usage:
 *   node scripts/gate-battery.mjs '[["tsc","npx","tsc","--noEmit"],["build","npm","run","build"]]'
 *   node scripts/gate-battery.mjs --transcript artifacts/my-drain.txt '<jobsJSON>'
 *   node scripts/gate-battery.mjs --label "lane-b drain" '<jobsJSON>'
 *
 * A job is [label, cmd, ...args]. Exit 0 = every job returned 0; exit 1 = at least one
 * job failed; exit 2 = the driver was misused (nothing was measured).
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// (3) fileURLToPath — NOT URL.pathname, which would percent-encode "Gold Rush".
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * (2) Force serial playwright. Exported so the guard can assert it directly rather than
 * inferring it from a transcript.
 *
 * Only touches invocations that actually run playwright, and is idempotent — an explicit
 * `--workers=N` already on the command line is LEFT ALONE, so a caller who deliberately
 * measures parallelism (the control arm of any future F-1270-style experiment) is not
 * silently overridden by their own instrument.
 */
export function withSerialWorkers(cmd, args) {
  const argv = [...args];
  const runsPlaywright = /(^|[/\\])playwright$/.test(cmd) || argv.includes('playwright');
  if (!runsPlaywright) return argv;
  if (argv.some((a) => String(a).startsWith('--workers'))) return argv;
  return [...argv, '--workers=1'];
}

/** Resolve the transcript path and make sure its directory exists. */
export function resolveTranscript(p) {
  const abs = path.isAbsolute(p) ? p : path.join(REPO_ROOT, p);
  mkdirSync(path.dirname(abs), { recursive: true });
  return abs;
}

export function runBattery(jobs, { transcript, label = '', now = () => new Date() } = {}) {
  const out = resolveTranscript(transcript);

  // (1) THE RETENTION PROPERTY. Create only if absent; every battery is appended under its
  // own stamp. This single `existsSync` is the whole of F-1255-3's cure, and the guard
  // exists because it is one character away from being lost again.
  if (!existsSync(out)) {
    writeFileSync(out, 'gate battery transcript (append-only — see scripts/gate-battery.mjs)\n');
  }
  appendFileSync(out, `\n\n######## BATTERY ${now().toISOString()}${label ? ` — ${label}` : ''} ########\n`);

  const results = {};
  let overall = 0;

  for (const [jobLabel, cmd, ...rawArgs] of jobs) {
    const args = withSerialWorkers(cmd, rawArgs);
    const t0 = Date.now();
    // (4) 256 MB — a truncated transcript is a lie told by an evidence file.
    const r = spawnSync(cmd, args, { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;

    // A spawn that never ran (ENOENT) must not read as rc=0.
    const status = r.error ? 127 : r.status;
    if (status !== 0) overall = 1;
    results[jobLabel] = status;

    appendFileSync(
      out,
      `\n===== ${jobLabel} =====\n$ ${cmd} ${args.join(' ')}\nrc=${status} ${secs}s\n` +
        (r.error ? `SPAWN-ERROR: ${r.error.message}\n` : '') +
        `${body}\n`,
    );
    // Console gets a tail only; the transcript stays the record.
    const tail = body.split('\n').slice(-25).join('\n');
    console.log(`\n===== ${jobLabel} — rc=${status} ${secs}s =====\n${tail}`);
  }

  const summary = 'SUMMARY ' + JSON.stringify(results);
  appendFileSync(out, `\n${summary}\nOVERALL rc=${overall}\n`);
  console.log(`\n${summary}\nOVERALL rc=${overall}\ntranscript -> ${path.relative(REPO_ROOT, out)}`);
  return { overall, results, transcript: out };
}

function flag(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
}

// Run only when invoked directly, so the guard can import the helpers.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const spec = process.argv.slice(2).filter((a, i, all) => {
    if (a === '--transcript' || a === '--label') return false;
    const prev = all[i - 1];
    return prev !== '--transcript' && prev !== '--label';
  })[0];

  if (!spec) {
    console.error('usage: node scripts/gate-battery.mjs [--transcript <path>] [--label <text>] \'[["label","cmd","arg"]]\'');
    process.exit(2); // (5) nothing was measured — never exit 0 on misuse.
  }

  let jobs;
  try {
    jobs = JSON.parse(spec);
  } catch (e) {
    console.error(`jobs spec is not valid JSON: ${e.message}`);
    process.exit(2);
  }
  if (!Array.isArray(jobs) || jobs.length === 0) {
    console.error('jobs spec must be a non-empty array of [label, cmd, ...args]');
    process.exit(2);
  }

  const { overall } = runBattery(jobs, {
    transcript: flag('--transcript', 'artifacts/gate-battery-transcript.txt'),
    label: flag('--label', ''),
  });
  process.exit(overall);
}
