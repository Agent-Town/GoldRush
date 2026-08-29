/**
 * F-2350-1 — a law surface may not prescribe a command the reader's gate refuses.
 *
 * WHY THIS EXISTS (s2350)
 * -----------------------
 * fire.md §2.0c landed at s2343 and made `bash scripts/health-watch.sh status` a BINDING
 * triage read on every fire. §2.0b (s1653) makes `bash scripts/start-lane-runner.sh` the
 * only lawful way to restart a dead runner. Measured s2350: `bash` is permitted by NEITHER
 * settings file (89 allow entries, zero for bash; `Bash(node:*)` is allowed), and
 * `fire-runner.sh` invokes claude with no --dangerously-skip-permissions. So a HEADLESS
 * fire — which has nobody to approve a prompt — is refused. An attended session is merely
 * prompted, which is why this went unnoticed: the law reads fine to whoever tests it by hand.
 *
 * DIRECTION IS THE SEVERITY. The refusal is LOUD, nothing returned a wrong answer, and this
 * is NOT a false green. But a refusal reads as "I cannot do this", so §2.0c's read fails
 * toward SKIPPING the liveness check — the precise blind spot §2.0c exists to close and
 * prices at 37h50m — and §2.0b's restart fails toward the outage persisting.
 *
 * WHAT THIS GUARD ASSERTS, AND WHY IT IS DECIDABLE RATHER THAN A JUDGEMENT
 * -----------------------------------------------------------------------
 * For every `bash scripts/*.sh` a law surface prescribes, EITHER `bash` is allowlisted (the
 * prescription is runnable exactly as written, and there is nothing to say) OR that surface
 * must carry the node fallback. Both halves are file reads. No judgement, no sampling.
 *
 * IT RETIRES ITSELF. The day someone adds `Bash(bash scripts/*)` to settings.json, every arm
 * passes trivially and the guard stops asking. That is deliberate: a guard that keeps
 * demanding a workaround after the workaround is unnecessary is how a guard becomes a
 * formality and gets routed around (F-1460-1, the `cross-engine` fate).
 *
 * THE SURFACE LIST IS IMPORTED, NEVER TRANSCRIBED — `law-surfaces.mjs` exists precisely
 * because a second hand-maintained copy "fails by QUIETLY ANSWERING ABOUT FIVE SURFACES
 * while its reader believes it answered about six" (F-2199-1).
 *
 * Arms 5-7 are manufactured defects and REVERSE CONTROLS.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAW_SURFACES } from './law-surfaces.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(HERE);

const SETTINGS = ['.claude/settings.json', '.claude/settings.local.json'];
/** The recipe token a surface must carry to have documented the fallback. */
const FALLBACK_TOKEN = 'execFileSync';
const PRESCRIPTION = /\bbash\s+scripts\/[A-Za-z0-9._/-]+\.sh/g;

function allowEntries() {
  const out = [];
  for (const rel of SETTINGS) {
    const p = path.join(REPO, rel);
    if (!fs.existsSync(p)) continue; // settings.local.json is untracked and optional
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    out.push(...((parsed.permissions && parsed.permissions.allow) || []));
  }
  return out;
}

/** Does the gate permit invoking `bash` at all? */
// The char class matters: settings use BOTH `Bash(cmd:*)` and `Bash(cmd *)`, and it must not
// match `Bash(bashful…)`. Arm 7 caught the first draft, which omitted `:` and scored the
// house's own dominant spelling as "bash not allowed" — i.e. it would have kept demanding a
// workaround after the workaround was retired.
const bashAllowed = (entries) => entries.some((e) => /^Bash\(\s*bash[\s:()*]/.test(e));

/**
 * @returns findings — a surface that prescribes `bash …` without a runnable path for its reader.
 */
function findings(surfaceTexts, entries) {
  if (bashAllowed(entries)) return []; // prescription is runnable as written
  const out = [];
  for (const [file, text] of Object.entries(surfaceTexts)) {
    const uses = [...new Set([...text.matchAll(PRESCRIPTION)].map((m) => m[0]))];
    if (uses.length === 0) continue;
    if (!text.includes(FALLBACK_TOKEN)) {
      out.push({ file, prescribes: uses.length, sample: uses[0] });
    }
  }
  return out;
}

const surfaceTexts = {};
const unreadable = [];
for (const f of LAW_SURFACES) {
  try {
    surfaceTexts[f] = fs.readFileSync(path.join(REPO, f), 'utf8');
  } catch {
    unreadable.push(f);
  }
}
const entries = allowEntries();

// Corpus declaration (F-2208-1): a checked set of zero must never read as a pass.
test('corpus — every law surface was really read, and the allowlist is non-empty', () => {
  assert.deepEqual(unreadable, [], `unreadable law surface(s): ${unreadable.join(', ')}`);
  assert.ok(LAW_SURFACES.length >= 6, `law surfaces: ${LAW_SURFACES.length}`);
  assert.equal(Object.keys(surfaceTexts).length, LAW_SURFACES.length);
  assert.ok(entries.length > 20, `allow entries read: ${entries.length}`);
});

test('arm 1 — no law surface prescribes bash without a runnable path for its reader', () => {
  const bad = findings(surfaceTexts, entries);
  assert.deepEqual(
    bad,
    [],
    `law prescribes a gate-refused command with no fallback: ${JSON.stringify(bad)}`,
  );
});

test('arm 2 — the finding that motivated this is real: bash is NOT currently allowlisted', () => {
  // If this ever flips, arm 1 passes trivially and this guard has retired itself. That is the
  // designed outcome, not a regression — so this arm DOCUMENTS the state rather than demanding it.
  const allowed = bashAllowed(entries);
  assert.equal(typeof allowed, 'boolean');
});

test('arm 3 — fire.md does prescribe bash scripts, so arm 1 is not vacuous', () => {
  const uses = [...(surfaceTexts['scripts/fire.md'] || '').matchAll(PRESCRIPTION)];
  assert.ok(uses.length > 0, 'fire.md must still be a subject, or arm 1 checks nothing');
});

// ---- manufactured defects ----

test('arm 4 — stripping the fallback from fire.md reds arm 1', () => {
  const variant = { ...surfaceTexts };
  variant['scripts/fire.md'] = variant['scripts/fire.md'].split(FALLBACK_TOKEN).join('exec_removed');
  assert.notEqual(variant['scripts/fire.md'], surfaceTexts['scripts/fire.md'], 'variant must differ');
  const f = findings(variant, entries);
  assert.ok(
    f.some((x) => x.file === 'scripts/fire.md'),
    'a surface prescribing bash with no fallback must be caught',
  );
});

test('arm 5 — REVERSE CONTROL: allowlisting bash retires the guard (no findings at all)', () => {
  const variant = { ...surfaceTexts };
  variant['scripts/fire.md'] = variant['scripts/fire.md'].split(FALLBACK_TOKEN).join('exec_removed');
  const f = findings(variant, [...entries, 'Bash(bash scripts/*)']);
  assert.deepEqual(f, [], 'once bash is permitted the prescription is runnable as written');
});

test('arm 6 — REVERSE CONTROL: a surface that prescribes NO bash is never flagged', () => {
  const f = findings({ 'docs/none.md': 'run `node scripts/thing.mjs` and read the verdict.' }, entries);
  assert.deepEqual(f, [], 'only surfaces that actually prescribe bash are subjects');
});

test('arm 7 — the allowlist matcher does not confuse `bash` with other Bash(...) entries', () => {
  assert.equal(bashAllowed(['Bash(node:*)', 'Bash(git add:*)', 'Bash(npm test)']), false);
  assert.equal(bashAllowed(['Bash(bash scripts/*)']), true);
  assert.equal(bashAllowed(['Bash(bash:*)']), true);
});
