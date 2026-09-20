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
 *  6. `--cwd` AND `--env`, BECAUSE WITHOUT THEM THIS FILE CANNOT BE USED BY A MODERN DRAIN
 *     (F-1481-1, s1481). The two capabilities are not conveniences; each is forced by a law:
 *       · `--cwd` by §3.0b CUSTODY — undecided content is gated in a DETACHED WORKTREE, never
 *         in main's tree. This driver hardcoded `cwd: REPO_ROOT`, so §3.0b was unreachable
 *         through it. No workaround existed.
 *       · `--env` by the port law — `playwright.config.ts` hardcodes 5188 under strictPort and
 *         `PORT` sets NOTHING, so a scratch-port gate needs `GR_CAPTURE_BASE_URL` +
 *         `GR_CAPTURE_EXTERNAL_SERVER`. A fire cannot set those inline (`FOO=1 node ...`): the
 *         bash allowlist refuses that form. The gate denies the fire, not the factory.
 *     THE MEASUREMENT: this file landed s1275 to stop fires re-minting the driver, and they
 *     kept re-minting it anyway — s1455 and s1480 each hand-rolled a 19-line `run-gate.mjs`,
 *     both untracked, both dead with their worktree, both carrying the same "the gate denies
 *     me, not the factory" sentence (F-1480-3). s1481 read them and found the cause is not
 *     that fires don't know this file exists: it is that this file could not do the job.
 *     F-1480-3's own REC was to mint a THIRD tracked sibling; that would have re-opened
 *     F-1275-1 under a new name. A permanent home only ends re-derivation while it stays
 *     wide enough for the work — so extend it here rather than fork it.
 *     THE TRANSCRIPT NOW RECORDS BOTH, because a gate run against another tree that does not
 *     SAY which tree it measured is evidence for an unnamed subject.
 *
 * usage:
 *   node scripts/gate-battery.mjs '[["tsc","npx","tsc","--noEmit"],["build","npm","run","build"]]'
 *   node scripts/gate-battery.mjs --transcript artifacts/my-drain.txt '<jobsJSON>'
 *   node scripts/gate-battery.mjs --label "lane-b drain" '<jobsJSON>'
 *   node scripts/gate-battery.mjs --cwd gate-s1481 \
 *     --env GR_CAPTURE_EXTERNAL_SERVER=1 --env GR_CAPTURE_BASE_URL=http://127.0.0.1:5234 \
 *     '[["own spec","npx","playwright","test","e2e/foo.spec.ts"]]'
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

/**
 * (6) Resolve the working directory a battery runs in. Relative paths resolve against the
 * REPO ROOT, so `--cwd gate-s1481` means the sibling worktree and not wherever the shell
 * happened to be. A missing directory is MISUSE, not a failed job: silently falling back to
 * REPO_ROOT would gate main's tree while the transcript claimed a worktree — the exact lie
 * §3.0b exists to prevent.
 */
export function resolveCwd(dir) {
  if (!dir) return REPO_ROOT;
  const abs = path.isAbsolute(dir) ? dir : path.join(REPO_ROOT, dir);
  if (!existsSync(abs)) return null;
  return abs;
}

/**
 * (7) A RELEASE JOB WITH NO `GR_RELEASE=e1` CANNOT PASS, SO RUNNING IT IS MISUSE (F-1598-1, s1598).
 *
 * `scripts/assert-release-build.mjs:4` throws on a bare invocation, deliberately and under a
 * POSITIVE CONTROL (`assert-release-build.test.mjs:136`) — the precondition exists so a plain
 * build can never masquerade as a release build. The house form has always been the one F-RB-1
 * writes down (`tasks/BACKLOG.md:3344`): `GR_RELEASE=e1 npm run build:release`.
 *
 * THE MEASUREMENT. The 2026-08-09 RELEASE GATE ran `npm run build:release` through this driver
 * with no `--env`, so the leaf that proves no E2–E10 content leaked into the public build never
 * executed. The battery recorded `OVERALL rc=1`, the release deployed anyway, and the ledger
 * called it verified — leaving a red transcript as the release's only evidence file. The release
 * itself was fine (re-checked s1598 against the SHIPPED dist: 1883 files, zero later ids), but
 * that was luck, not the gate: a genuine leak would have sailed past the same hole.
 *
 * WHY REFUSE INSTEAD OF SUPPLYING IT. Defaulting `GR_RELEASE=e1` here would silently satisfy the
 * precondition the guard exists to enforce, and would break the positive control that keeps a
 * bare build honest. The caller must say it, exactly as F-RB-1 requires. Fails CLOSED on rc=2 —
 * "nothing was measured" — like every other misuse in this file, so the hole can never again be
 * recorded as a mere red leaf.
 */
export function releaseEnvMisuse(jobs, env) {
  const NEEDS_RELEASE_ENV = ['build:release', 'assert-release-build.mjs'];
  const offender = jobs.find(([, cmd, ...args]) =>
    [cmd, ...args].some((a) => NEEDS_RELEASE_ENV.some((needle) => String(a).endsWith(needle))));
  if (!offender) return null;
  if (env.GR_RELEASE === 'e1') return null;
  return (
    `job "${offender[0]}" runs a release build without GR_RELEASE=e1, which cannot pass ` +
    '(scripts/assert-release-build.mjs refuses a bare invocation by design). ' +
    'Add --env GR_RELEASE=e1 to this battery — see F-RB-1, tasks/BACKLOG.md:3344.'
  );
}

/** (6) `KEY=VALUE` pairs → an object. A pair with no `=`, or an empty key, is misuse. */
export function parseEnvPairs(pairs) {
  const env = {};
  for (const pair of pairs) {
    const i = String(pair).indexOf('=');
    if (i <= 0) return null;
    env[String(pair).slice(0, i)] = String(pair).slice(i + 1);
  }
  return env;
}

export function runBattery(jobs, { transcript, label = '', cwd, env, now = () => new Date() } = {}) {
  const out = resolveTranscript(transcript);
  const workdir = cwd ?? REPO_ROOT;
  // Extra env is MERGED OVER the inherited environment, never replacing it — a battery still
  // needs PATH, HOME and the shell's CLAUDE_CONFIG_DIR (which is what keys the fire-shell
  // serialisation in playwright.config.ts, F-1270-3).
  const childEnv = env && Object.keys(env).length ? { ...process.env, ...env } : process.env;

  // (1) THE RETENTION PROPERTY. Create only if absent; every battery is appended under its
  // own stamp. This single `existsSync` is the whole of F-1255-3's cure, and the guard
  // exists because it is one character away from being lost again.
  if (!existsSync(out)) {
    writeFileSync(out, 'gate battery transcript (append-only — see scripts/gate-battery.mjs)\n');
  }
  appendFileSync(out, `\n\n######## BATTERY ${now().toISOString()}${label ? ` — ${label}` : ''} ########\n`);
  // (6) NAME THE SUBJECT. A battery run in another tree, or against another server, is
  // evidence about THAT arrangement — the transcript has to say so or a later reader will
  // attribute it to main. Env VALUES are recorded too: a base-URL port is the whole
  // difference between measuring your gate worktree and measuring someone else's dev server.
  appendFileSync(out, `cwd=${workdir}\n`);
  if (childEnv !== process.env) {
    const shown = Object.entries(env).map(([k, v]) => `${k}=${v}`).join(' ');
    appendFileSync(out, `env+ ${shown}\n`);
  }

  const results = {};
  let overall = 0;

  for (const [jobLabel, cmd, ...rawArgs] of jobs) {
    const args = withSerialWorkers(cmd, rawArgs);
    const t0 = Date.now();
    // (4) 256 MB — a truncated transcript is a lie told by an evidence file.
    const r = spawnSync(cmd, args, {
      cwd: workdir,
      env: childEnv,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
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

/** (6) `--env` is REPEATABLE — one pair per occurrence. `flag()` would see only the first. */
function repeatedFlag(name) {
  const values = [];
  for (let i = 0; i < process.argv.length; i += 1) {
    if (process.argv[i] === name && process.argv[i + 1] !== undefined) values.push(process.argv[i + 1]);
  }
  return values;
}

/** Every flag that consumes the NEXT argv entry — the positional filter must know all of them. */
const VALUE_FLAGS = new Set(['--transcript', '--label', '--cwd', '--env']);

// Run only when invoked directly, so the guard can import the helpers.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const spec = process.argv.slice(2).filter((a, i, all) => {
    if (VALUE_FLAGS.has(a)) return false;
    return !VALUE_FLAGS.has(all[i - 1]);
  })[0];

  const USAGE =
    'usage: node scripts/gate-battery.mjs [--transcript <path>] [--label <text>] ' +
    "[--cwd <dir>] [--env KEY=VALUE ...] '[[\"label\",\"cmd\",\"arg\"]]'";

  if (!spec) {
    console.error(USAGE);
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

  // (6) Both new flags fail CLOSED on rc=2 — "nothing was measured" — rather than falling
  // back to REPO_ROOT or to an empty env. A silent fallback would run a real battery and
  // report a real verdict about the WRONG subject, which is worse than not running at all.
  const cwd = resolveCwd(flag('--cwd', ''));
  if (cwd === null) {
    console.error(`--cwd does not exist: ${flag('--cwd', '')}`);
    process.exit(2);
  }

  const env = parseEnvPairs(repeatedFlag('--env'));
  if (env === null) {
    console.error('--env expects KEY=VALUE (non-empty key)');
    process.exit(2);
  }

  // (7) Checked against the RESOLVED environment — inherited plus --env — because a caller who
  // exported GR_RELEASE=e1 in the shell is already compliant and must not be refused.
  const releaseMisuse = releaseEnvMisuse(jobs, { ...process.env, ...env });
  if (releaseMisuse) {
    console.error(releaseMisuse);
    process.exit(2);
  }

  const { overall } = runBattery(jobs, {
    transcript: flag('--transcript', 'artifacts/gate-battery-transcript.txt'),
    label: flag('--label', ''),
    cwd,
    env,
  });
  process.exit(overall);
}
