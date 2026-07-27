#!/usr/bin/env node
/**
 * F-1152-1 mutation control — is the m2-04-family placement flake a BRIEFING-CARD race?
 *
 * WHY THIS EXISTS
 * ---------------
 * s1151 flagged "load" as the leading-but-untested explanation for the placement
 * failures that stopped `lane-c-f1148-1-trajectory-spec-rig` at its self-check 8.
 * s1152 reproduced a failure on a QUIET box and caught the state at the moment of
 * failure: the mission briefing ("The Contract" / button "Begin") was still up, so
 * `confirmBuild()` returned false. `openGame` in the m2-04 family waits only for
 * `__THREE_GAME_DIAGNOSTICS__.frame > 10`, and the renderer reaches frame 10
 * BEHIND that overlay.
 *
 * That is a state observation, not a causal proof. This instrument supplies the
 * control: same spec, same box, back to back, one variable.
 *
 *   CONTROL   — byte copy of e2e/f1148-1-trajectory-probe.spec.ts
 *   TREATMENT — same file plus the house Begin-dismissal used by 14+ other specs
 *               (e2-arsenal.spec.ts:44, cw-02-escort.spec.ts:84, e3-tram.spec.ts:24, ...)
 *
 * A cure shows up as placement failures going to zero in TREATMENT while CONTROL
 * keeps failing. If BOTH arms fail at similar rates the briefing hypothesis is
 * REFUTED and should be recorded as such -- that outcome is just as publishable
 * as a cure, and cheaper than letting the next fire inherit a guess.
 *
 * NOT a guard. Never enrolled in the default suite: the temp specs it writes are
 * env-gated exactly like their parent and are removed on exit.
 *
 * Usage: node scripts/probe-s1152-briefing-race.mjs [invocationsPerArm]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';

const SOURCE = 'e2e/f1148-1-trajectory-probe.spec.ts';
const CONTROL = 'e2e/tmp-s1152-control.spec.ts';
const TREATMENT = 'e2e/tmp-s1152-begin.spec.ts';
const INVOCATIONS = Number(process.argv[2] ?? 4);

const READINESS = `  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);`;
const BEGIN_DISMISSAL = `${READINESS}
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();`;

function build() {
  const src = readFileSync(SOURCE, 'utf8');
  if (!src.includes(READINESS)) throw new Error('readiness line not found — spec changed shape, fix this probe');
  writeFileSync(CONTROL, src);
  const patched = src.replace(READINESS, BEGIN_DISMISSAL);
  if (patched === src) throw new Error('patch was a no-op');
  writeFileSync(TREATMENT, patched);
}

function cleanup() {
  for (const f of [CONTROL, TREATMENT]) if (existsSync(f)) unlinkSync(f);
}

/** One invocation = 3 tests in one worker. Returns per-test outcomes in order. */
function invoke(file, arm, i) {
  let raw;
  try {
    raw = execFileSync(
      'npx',
      ['playwright', 'test', file, '--project=desktop-chrome', '--workers=1', '--reporter=json'],
      {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, GR_F1148_PROBE: '1', GR_F1148_ARM: `s1152-${arm}-${i}` },
      },
    );
  } catch (err) {
    raw = err.stdout ?? ''; // non-zero exit is expected when a run fails
  }
  const start = raw.indexOf('{');
  if (start < 0) return [{ status: 'unparsed', reason: 'no json' }];
  const report = JSON.parse(raw.slice(start));
  const out = [];
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const r = t.results?.[t.results.length - 1] ?? {};
        const msg = (r.error?.message ?? '').replace(/\[[0-9;]*m/g, '');
        out.push({
          title: spec.title,
          status: r.status ?? t.status ?? 'unknown',
          placementFail: /confirmBuild|resolves\.toBe/.test(msg) || /placeBuildableAt/.test(r.error?.stack ?? ''),
          line: r.error?.location?.line ?? null,
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const s of report.suites ?? []) walk(s);
  return out;
}

function once(label, file, i, sink) {
  const results = invoke(file, label, i);
  results.forEach((r, idx) => sink.push({ invocation: i, index: idx + 1, ...r }));
  const failed = results.filter((r) => r.status !== 'passed');
  console.log(
    `  ${label.padEnd(9)} invocation ${i}: ${results.length - failed.length}/${results.length} passed` +
      (failed.length
        ? `  <-- FAILURES at run index ${results.map((r, n) => (r.status !== 'passed' ? n + 1 : null)).filter(Boolean).join(',')}`
        : ''),
  );
}

console.log(`F-1152-1 briefing-race control — ${INVOCATIONS} invocations/arm, 3 runs each`);
console.log('Arms are INTERLEAVED: a fixed control-then-treatment order confounds the\n' +
  'treatment with time-on-box, and s1152 measured exactly that artefact before fixing it.\n');
build();
const control = [];
const treatment = [];
try {
  for (let i = 1; i <= INVOCATIONS; i += 1) {
    once('control', CONTROL, i, control);
    once('treatment', TREATMENT, i, treatment);
  }
} finally {
  cleanup();
}

const summarise = (rows, label) => {
  const total = rows.length;
  const failed = rows.filter((r) => r.status !== 'passed');
  const placement = failed.filter((r) => r.placementFail);
  console.log(
    `${label.padEnd(10)} ${total - failed.length}/${total} passed · ` +
      `${placement.length} placement failures · failing run-indices [${failed.map((r) => r.index).join(', ') || '-'}]`,
  );
  return { total, failed: failed.length, placement: placement.length };
};

console.log('\n=== SUMMARY ===');
const c = summarise(control, 'CONTROL');
const t = summarise(treatment, 'TREATMENT');

console.log(
  `\nVERDICT: ${
    c.placement > 0 && t.placement === 0
      ? 'CONSISTENT WITH THE BRIEFING RACE — control fails, treatment clean.'
      : c.placement === 0 && t.placement === 0
        ? 'INCONCLUSIVE — neither arm failed; the flake did not reproduce at this n. Raise n before concluding anything.'
        : c.placement > 0 && t.placement > 0
          ? 'BRIEFING HYPOTHESIS REFUTED OR INCOMPLETE — the dismissal did not stop it.'
          : 'ANOMALOUS — treatment failed where control did not. Investigate before reporting.'
  }`,
);
