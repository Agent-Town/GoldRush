/**
 * F-2350-1 / F-2359-1 — a law surface may not prescribe a command the reader's gate refuses.
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
 * WHY IT WAS WIDENED (s2359, F-2359-1)
 * ------------------------------------
 * The finding above names TWO refused families in its own prose — `bash scripts/*.sh` AND
 * `npm run test:ledger-guards` ("route it through node ... and the same shape for ... for
 * `npm run test:ledger-guards` ... and for every other refused leg"). The guard it shipped
 * selected on ONE: `PRESCRIPTION` was `bash scripts/*.sh`, so the npm family was never a
 * SUBJECT and the guard passed 8/8 while blind to it. That is F-2358-1's lesson turned on
 * this file — ENUMERATE EVERY KEY THE CURE SELECTS ON — and s2350 questioned the SURFACE
 * LIST and the FALLBACK TOKEN but never the COMMAND FAMILY.
 *
 * MEASURED s2359, empirically and with the controls isolated (not inferred from settings):
 *   · `npm run test:ledger-guards`  bare, no pipe, no `cd` → "This command requires approval"
 *   · `npm run test:node-guards`    bare, no pipe, no `cd` → "This command requires approval"
 *   · `npm -v`                      CONTROL, allowlisted    → ran, printed 11.17.0
 *   · via the node fallback         `execFileSync('npm',['run','test:ledger-guards'])`
 *                                   → rc=0, 871 node assertions + 83 bash legs
 * Census over the imported LAW_SURFACES: 22 prescriptions, 15 refused, across both families.
 *
 * SEVERITY STATED HONESTLY AND DELIBERATELY NOT INFLATED. This is LATENT and is NOT a false
 * green. `scripts/fire.md` — the surface carrying the IMPERATIVE npm prescription (F-1300-4's
 * "as the last act of every fire") — DOES state the npm fallback explicitly in §2.0d, so
 * today's reader is served, and the realised cost is ZERO: fires get the battery green (this
 * one did). What earns it a cure is that the guard could not see the family its own finding
 * named, so the protection was A CONVENTION NO MECHANISM ENFORCED — the exact phrase
 * CLAUDE.md already uses for the `fire-runner.sh` line-count pointer that rotted at s1456.
 *
 * WHAT THIS GUARD ASSERTS, AND WHY IT IS DECIDABLE RATHER THAN A JUDGEMENT
 * -----------------------------------------------------------------------
 * For every command in a KNOWN FAMILY that a law surface prescribes, EITHER the gate permits
 * it (the prescription is runnable exactly as written, and there is nothing to say) OR that
 * surface must carry the node fallback. Both halves are file reads. No judgement, no sampling.
 *
 * THE FALLBACK TEST IS FILE-SCOPED, AND THAT RESTRAINT IS MEASURED RATHER THAN LAZY. A
 * prescription-SCOPED test (every refused command needs a recipe naming it) reds on
 * `scripts/fire.md` for `lane-runner-v3.sh` and `deploy.sh` — and it would be WRONG to, because
 * §2.0d states the recipe generically and in so many words: "and the same shape ... for every
 * other refused leg." A guard that reds on a surface which HAS stated the cure is the
 * `cross-engine` fate (F-1460-1): excused into uselessness inside a week.
 *
 * BOUNDARY, DECLARED (F-2196-1). This covers the factory's OWN tooling — repo shell scripts,
 * repo npm scripts, and (since s2360) the one gated external binary a law surface ORDERS a
 * fire to run — because those are what a fire is ORDERED to run. It does NOT census every
 * backticked span; flagging each prose mention would bury the signal.
 *
 * THE THIRD FAMILY, AND THE INFERENCE THAT NEARLY HID IT (s2360, F-2360-1)
 * -----------------------------------------------------------------------
 * s2359 invited the next reader to question this file's one selector, and named `sed`,
 * `pkill` and `sqlite3` as "likewise unallowlisted" prose. TAKEN, AND THE PREMISE IS WRONG:
 * "unallowlisted" is NECESSARY but NOT SUFFICIENT for refusal. The gate also sandboxes
 * read-only commands, so a command absent from all 89 allow entries may still simply run.
 *
 * MEASURED s2360, every arm BARE (no `cd`, no pipe — s2350's confound), over the six
 * imported LAW_SURFACES:
 *   · `sed -n 461p <file>`                             2 spans — RAN (not refused at all)
 *   · `date "+%Y-%m-%dT%H:%MZ"`   §1.3's binding stamp — RAN (not refused at all)
 *   · `git ls-files --others --exclude-standard -- …`  §2E's read — RAN (not refused)
 *   · `pkill`                                          ZERO spans in any surface, AND
 *                                                      `Bash(pkill -f vite:*)` is allowlisted
 *   · `sqlite3 <file> "select key from kv"`            1 span — REFUSED
 *   · `sqlite3 -version`  (no quotes, no file)         REFUSED — so it is the BINARY,
 *                                                      not the quoting
 * So of s2359's three named candidates, one does not appear at all, one runs fine, and
 * exactly ONE is genuinely refused — and that one is an IMPERATIVE in a standing duty
 * (LB-01's encryption gate, on the F-2352-2 `--fill-gaps` recovery path, guarding the
 * one-way door F-2353-2 names). It is added here. The other two are correctly excluded,
 * and now for a MEASURED reason rather than an assumed one.
 *
 * ⚠️ `gateAllows` MODELS THE ALLOWLIST, NOT THE WHOLE GATE. It answers "does an allow entry
 * cover this?" — which coincides with "will this run?" for both original families (all six
 * of arm 8's ground-truth rows are consistent) but NOT for read-only commands outside them.
 * The error direction is safe: it can only say REFUSED where reality says RAN, i.e. demand a
 * fallback nobody needed, and the file-scoped test makes that cheap. But it means A CANDIDATE
 * FAMILY MUST BE MEASURED REFUSED BEFORE BEING ADDED, NEVER INFERRED FROM SETTINGS — which is
 * precisely the inference s2359's boundary note made, and it was wrong about two of three.
 *
 * If a fourth refused family ever becomes load-bearing, ADD IT TO `COMMAND_FAMILIES` — that
 * is the one key this guard selects on, and the next reader should question it exactly as
 * s2359 questioned s2350's and s2360 questioned s2359's. RUN THE COMMAND FIRST.
 *
 * IT RETIRES ITSELF, PER FAMILY. The day someone adds `Bash(bash scripts/*)` to settings.json,
 * the bash arms pass trivially; add `Bash(npm run test:*)` and the npm arms do too. That is
 * deliberate: a guard that keeps demanding a workaround after the workaround is unnecessary is
 * how a guard becomes a formality and gets routed around (F-1460-1).
 *
 * THE SURFACE LIST IS IMPORTED, NEVER TRANSCRIBED — `law-surfaces.mjs` exists precisely
 * because a second hand-maintained copy "fails by QUIETLY ANSWERING ABOUT FIVE SURFACES
 * while its reader believes it answered about six" (F-2199-1).
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

/**
 * The families this guard censuses. See the BOUNDARY note in the header before adding one.
 * `bash …`      — s2350's original subject, the runner/health/deploy shell scripts.
 * `npm run …`   — s2359's addition: the mandated gate batteries (F-1300-4, F-1460-1).
 * `sqlite3 …`   — s2360's addition: LB-01's encryption gate. MEASURED refused (bare, and
 *                 again with no quoted argument), unlike `sed`/`date`/`git ls-files`, which
 *                 are equally unallowlisted and simply run. See the header before adding one.
 */
const COMMAND_FAMILIES = [
  { name: 'bash', pattern: /\bbash\s+scripts\/[A-Za-z0-9._/-]+\.sh/g },
  { name: 'npm-run', pattern: /\bnpm run [a-zA-Z0-9:_-]+/g },
  { name: 'sqlite3', pattern: /\bsqlite3\s+\S+/g },
];

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

/**
 * Allow-spec semantics, VALIDATED AGAINST GROUND TRUTH rather than assumed (arm 8):
 * a trailing `:*` or ` *` is a prefix match; anything else is exact. Non-Bash entries
 * (`Read`, `Glob`, `Skill(...)`) are not command specs and are dropped.
 */
function bashSpecs(entries) {
  return entries.map((e) => {
    const m = /^Bash\((.+)\)$/.exec(e);
    return m ? m[1] : null;
  }).filter(Boolean);
}

function gateAllows(cmd, entries) {
  return bashSpecs(entries).some((s) => {
    if (!s.endsWith('*')) return cmd === s;
    // A trailing `*` is a wildcard and everything before it is a literal prefix. The house
    // spells it three ways — `cmd:*`, `cmd *` and `path/*` — so the separator must NOT be
    // hardcoded. Arms 9 and 11 caught the first draft, which handled only `:*` and ` *` and
    // therefore scored `Bash(bash scripts/*)` — the very entry F-2350-3 proposes — as no
    // match, i.e. it would have kept demanding a workaround after the workaround retired.
    const literal = s.slice(0, -1);           // "npm run build:" | "npm test " | "bash scripts/"
    const bare = literal.replace(/[:\s]$/, ''); // "npm run build" | "npm test" | "bash scripts/"
    return cmd.startsWith(literal) || cmd === bare || cmd.startsWith(`${bare} `);
  });
}

/** Every family-matching command a surface prescribes, de-duplicated. */
function prescriptionsIn(text) {
  const out = [];
  for (const fam of COMMAND_FAMILIES) {
    for (const m of text.matchAll(fam.pattern)) out.push({ family: fam.name, cmd: m[0] });
  }
  const seen = new Set();
  return out.filter((p) => (seen.has(p.cmd) ? false : (seen.add(p.cmd), true)));
}

/**
 * @returns findings — a surface that prescribes a gate-refused command with no runnable
 *   path for its reader.
 */
function findings(surfaceTexts, entries) {
  const out = [];
  for (const [file, text] of Object.entries(surfaceTexts)) {
    const refused = prescriptionsIn(text).filter((p) => !gateAllows(p.cmd, entries));
    if (refused.length === 0) continue; // every prescription here is runnable as written
    if (!text.includes(FALLBACK_TOKEN)) {
      out.push({ file, prescribes: refused.length, sample: refused[0].cmd });
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

test('arm 1 — no law surface prescribes a gate-refused command without a runnable path', () => {
  const bad = findings(surfaceTexts, entries);
  assert.deepEqual(
    bad,
    [],
    `law prescribes a gate-refused command with no fallback: ${JSON.stringify(bad)}`,
  );
});

test('arm 2 — the verdict is computed from the REAL settings, not baked in', () => {
  // s2350 wrote this arm as `assert.equal(typeof allowed, 'boolean')` so it would DOCUMENT
  // the state rather than demand it — the intent was right (permitting bash must be allowed
  // to retire the guard, not to red it) but the assertion is a tautology, and s2359's
  // reachability sweep confirmed NO manufactured defect could red it. It now asserts the
  // property that actually matters and can actually regress: the verdict RESPONDS to the
  // allowlist. A matcher that ignores its entries — the failure that would silently retire
  // this whole guard — reds here.
  const live = gateAllows('bash scripts/health-watch.sh status', entries);
  const permitted = gateAllows('bash scripts/health-watch.sh status', [...entries, 'Bash(bash scripts/*)']);
  assert.equal(permitted, true, 'adding the entry must permit the command');
  assert.notEqual(live, permitted, 'the verdict must depend on the entries, or it is baked in');
  assert.ok(bashSpecs(entries).length > 20, `command specs parsed from settings: ${bashSpecs(entries).length}`);
});

test('arm 3 — fire.md does prescribe refused commands, so arm 1 is not vacuous', () => {
  const refused = prescriptionsIn(surfaceTexts['scripts/fire.md'] || '')
    .filter((p) => !gateAllows(p.cmd, entries));
  assert.ok(refused.length > 0, 'fire.md must still be a subject, or arm 1 checks nothing');
});

test('arm 4 — bash AND npm-run are represented in the live corpus, or the widening is decoration', () => {
  // F-2359-1's whole point: a family with no subject is a selector nobody is testing.
  // `sqlite3` is deliberately NOT asserted here — see arm 12 for why a single-prescription
  // family is exercised on a manufactured subject instead of on the live corpus.
  const all = Object.values(surfaceTexts).flatMap((t) => prescriptionsIn(t))
    .filter((p) => !gateAllows(p.cmd, entries));
  const fams = new Set(all.map((p) => p.family));
  assert.ok(fams.has('bash'), 'the bash family must still have a refused subject');
  assert.ok(fams.has('npm-run'), 'the npm-run family must have a refused subject (s2359: 5 of them)');
});

test('arm 5 — an allowlisted npm form is NOT flagged (no over-reach onto `npm run build`)', () => {
  // `npm run build` is prescribed 7x across the surfaces and IS allowlisted. A guard that
  // flagged it would demand a pointless fallback and be excused into uselessness.
  assert.equal(gateAllows('npm run build', entries), true);
  const f = findings({ 'docs/x.md': 'run `npm run build` and check it is green.' }, entries);
  assert.deepEqual(f, [], 'an allowlisted prescription is never a finding');
});

// ---- manufactured defects ----

test('arm 6 — stripping the fallback from fire.md reds arm 1', () => {
  const variant = { ...surfaceTexts };
  variant['scripts/fire.md'] = variant['scripts/fire.md'].split(FALLBACK_TOKEN).join('exec_removed');
  assert.notEqual(variant['scripts/fire.md'], surfaceTexts['scripts/fire.md'], 'variant must differ');
  const f = findings(variant, entries);
  assert.ok(
    f.some((x) => x.file === 'scripts/fire.md'),
    'a surface prescribing a refused command with no fallback must be caught',
  );
});

test('arm 7 — a surface whose ONLY refused prescription is npm is still caught', () => {
  // This is the arm the pre-s2359 guard could not have: no `bash …` anywhere in the subject.
  const f = findings(
    { 'docs/npm-only.md': 'As your last act run `npm run test:ledger-guards` and read the rc.' },
    entries,
  );
  assert.equal(f.length, 1, 'an npm-only surface must be a subject');
  assert.equal(f[0].sample, 'npm run test:ledger-guards');
});

test('arm 8 — the allowlist matcher agrees with ground truth MEASURED s2359, not assumed', () => {
  // Four of these six were executed in the fire that wrote this guard; the matcher is only
  // trustworthy because it reproduces what the gate actually did.
  const truth = [
    ['npm -v', true],                                  // ran: printed 11.17.0
    ['npm run build', true],                           // allowlisted exactly
    ['node scripts/dry-board-probe.mjs', true],        // ran this fire, rc=0
    ['npm run test:ledger-guards', false],             // ran bare: "requires approval"
    ['npm run test:node-guards', false],               // ran bare: "requires approval"
    ['bash scripts/health-watch.sh status', false],    // s2350; routed through node instead
  ];
  for (const [cmd, want] of truth) {
    assert.equal(gateAllows(cmd, entries), want, `gateAllows(${JSON.stringify(cmd)})`);
  }
});

// ---- reverse controls ----

test('arm 9 — REVERSE CONTROL: allowlisting a family retires exactly that family', () => {
  const variant = { ...surfaceTexts };
  variant['scripts/fire.md'] = variant['scripts/fire.md'].split(FALLBACK_TOKEN).join('exec_removed');
  const withBash = findings(variant, [...entries, 'Bash(bash scripts/*)']);
  // fire.md still prescribes refused npm commands, so it stays a finding — the bash half alone
  // retiring must NOT silently retire the npm half.
  assert.ok(
    withBash.some((x) => x.file === 'scripts/fire.md'),
    'permitting bash must not retire the npm family',
  );
  // DELIBERATE TRIPWIRE (s2360): this list must name EVERY family, and the assertion below
  // makes a new family red HERE rather than silently weaken the control. That is exactly how
  // s2360 found out its own widening was live — adding `sqlite3` reddened this arm, because
  // permitting two families no longer empties fire.md. A reverse control that quietly stops
  // covering a family is worse than one that reds: it keeps attesting to a retirement it can
  // no longer observe.
  const permitAll = ['Bash(bash scripts/*)', 'Bash(npm run test:*)', 'Bash(sqlite3:*)'];
  assert.equal(
    permitAll.length,
    COMMAND_FAMILIES.length,
    'a family was added without teaching this reverse control to permit it',
  );
  const withAll = findings(variant, [...entries, ...permitAll]);
  assert.deepEqual(withAll, [], 'once EVERY family is permitted there is nothing to say');
});

test('arm 12 — a surface whose ONLY refused prescription is sqlite3 is caught', () => {
  // The s2360 family, exercised on a synthetic surface rather than on the live corpus.
  // DELIBERATELY NOT asserted in arm 4: `sqlite3` has a single live prescription (LB-01's
  // encryption gate), so demanding a live subject would red the day that clause is lawfully
  // reworded — the `cross-engine` fate (F-1460-1). A manufactured subject proves the family
  // is not decoration without betting on one sentence surviving.
  const f = findings(
    { 'docs/lb.md': 'Before committing, read its keys: `sqlite3 <file> "select key from kv"`.' },
    entries,
  );
  assert.equal(f.length, 1, 'a sqlite3-only surface must be a subject');
  assert.equal(f[0].sample, 'sqlite3 <file>');
  // and it retires per-family, exactly like the other two
  assert.deepEqual(
    findings({ 'docs/lb.md': 'read `sqlite3 <file> "x"`' }, [...entries, 'Bash(sqlite3:*)']),
    [],
    'permitting sqlite3 must retire the sqlite3 family',
  );
});

test('arm 10 — REVERSE CONTROL: a surface that prescribes nothing refused is never flagged', () => {
  const f = findings({ 'docs/none.md': 'run `node scripts/thing.mjs` and read the verdict.' }, entries);
  assert.deepEqual(f, [], 'only surfaces that actually prescribe a refused command are subjects');
});

test('arm 11 — the allowlist matcher does not confuse `bash` with other Bash(...) entries', () => {
  const e = ['Bash(node:*)', 'Bash(git add:*)', 'Bash(npm test)'];
  assert.equal(gateAllows('bash scripts/health-watch.sh', e), false);
  assert.equal(gateAllows('bash scripts/health-watch.sh', ['Bash(bash scripts/*)']), true);
  assert.equal(gateAllows('bash scripts/health-watch.sh', ['Bash(bash:*)']), true);
  // and a non-Bash entry is never a command spec
  assert.equal(gateAllows('Read', ['Read', 'Glob']), false);
});
