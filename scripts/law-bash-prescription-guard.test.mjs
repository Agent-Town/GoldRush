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
 * THE FOURTH AND FIFTH FAMILIES — AND THE LIMIT THIS GUARD TURNS OUT TO HAVE (s2400, F-2400-1)
 * -------------------------------------------------------------------------------------------
 * Taking the invitation above: the census key was questioned again, this time by MEASURING
 * every distinct binary the six surfaces prescribe as an imperative. §2.0b's emergency
 * runner-replacement recipe is refused in BOTH its halves, each run bare, with a positive
 * control in the same shell so the refusals are not a blanket state:
 *   · `ps -o pid,ppid,tty,stat,lstart -p 1`   §2.0b's binding diagnostic  — REFUSED
 *   · `kill -0 1`  (signal 0 sends nothing)   the `kill` binary itself    — REFUSED
 *   · CONTROL `ls -d tasks/running`                                       — RAN
 *   · CONTROL `which -a codex`  §2.0's own probe                          — RAN
 * The second control is what makes this a finding about two commands rather than about a
 * neighbourhood: one prescribed probe a few paragraphs away runs perfectly well.
 *
 * ⚠️ AND THE HONEST PART, MEASURED BEFORE THE FAMILIES WERE ADDED RATHER THAN DISCOVERED
 * AFTER: ADDING THEM DOES NOT RED ARM 1 TODAY, AND CANNOT. This guard is FILE-SCOPED by
 * design (see the header rule above), and `scripts/fire.md` already carries `execFileSync`
 * once — in §2.0d, thousands of words from §2.0b, naming `bash` and `npm` and neither of
 * these. So the guard scores §2.0b as "documented" on the strength of a fallback written for
 * other commands entirely. Proven on a scratch copy before any of this landed: with the two
 * families added, 20 arms pass and the ONLY failure is arm 9's deliberate tripwire.
 *
 * F-2360-1 named this exact harm for `sqlite3` ("§2.0d states the node fallback generically,
 * but it names `bash` and `npm` and is thousands of words from here") and did not cure it.
 * IT IS STILL NOT CURED HERE, DELIBERATELY. Making the test section-scoped means answering
 * "how near is near enough?", which is a judgement, and a guard built on a judgement fires on
 * honest prose and gets excused into uselessness (F-1460-1). The cure for the HARM is the law
 * text — §2.0b now states its own node route at the site, which is where a fire reads it. What
 * these two families buy is narrower and still worth having: the measured refusal is recorded
 * mechanically rather than in prose, and a FUTURE surface that prescribes either command with
 * no fallback at all is caught. Do not mistake the second for the first.
 *
 * TEETH (s2400) — five variants on scratch copies; every touched arm reds under at least one,
 * so none is decoration, and each over-general cure is caught by the control built for it:
 *   · drop the `ps` family                          → reds 9, 21, 22
 *   · drop the `kill` family                        → reds 9, 21, 22
 *   · loosen both patterns to bare binaries         → reds 21, 22  (22 is that control)
 *   · add a family without teaching arm 9           → reds 9 ALONE
 *   · make the families un-retirable (F-1460-1)     → reds 9, 21
 *
 * ⚠️ AND THE METHOD NOTE, PAID FOR IN THIS FIRE AND WORTH MORE THAN THE FAMILIES: the
 * over-reach variant first reported "REDDENED NOTHING", and it was my HARNESS, not the guard.
 * The edit consumed the object's closing ` },`, so the variant was a SYNTAX ERROR that never
 * loaded — and the sweep scored reds by grepping for `✖ arm N`, which a module-load failure
 * does not print. A crash therefore read as a clean pass, i.e. as evidence that an arm I had
 * just written was decoration. That is F-2215-1 exactly: A CONTROL WHOSE FAILURE MODE IS
 * SILENCE CANNOT BE TOLD FROM THE SILENCE IT MEASURES. The sweep now asserts each variant
 * LOADED and ran its full arm count before believing any verdict it reports, and a variant
 * that did not load is reported as a CONSTRUCTION REFUSAL rather than as a result.
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
 * `ps -o …`     — s2400's addition, with `kill`: §2.0b's emergency runner-replacement recipe.
 * `kill -TERM …`  MEASURED refused, each bare and with a positive control in the same shell.
 *
 * BOTH PATTERNS EXCLUDE BACKTICKS (`[^\s`]+`, not `\S+`) AND REQUIRE AN ARGUMENT, so they
 * select the two IMPERATIVES and none of the prose. Verified against the live fire.md before
 * being written down: `ps` matches only `ps -o pid,ppid,tty,stat,lstart`, and `kill` only
 * `kill -TERM <pid>` — while the descriptive `kill -0`, `kill -9` and the bare `kill -TERM`
 * (all of which narrate what lane-runner-v3.sh does, rather than ordering a fire to do it)
 * correctly match NOTHING. That is the header's "does NOT census every backticked span".
 */
const COMMAND_FAMILIES = [
  { name: 'bash', pattern: /\bbash\s+scripts\/[A-Za-z0-9._/-]+\.sh/g },
  { name: 'npm-run', pattern: /\bnpm run [a-zA-Z0-9:_-]+/g },
  { name: 'sqlite3', pattern: /\bsqlite3\s+\S+/g },
  { name: 'ps', pattern: /\bps\s+-o\s+[^\s`]+/g },
  { name: 'kill', pattern: /\bkill\s+-(?:TERM|9)\s+[^\s`]+/g },
];

/**
 * THE CARVE-OUT (s2372, F-2371-6 — discharging a finding s2371 filed against ITSELF).
 *
 * This guard's whole premise is that a refused prescription is a HARM to be routed around.
 * For exactly one command in the census that premise is INVERTED. `deploy.sh` publishes to
 * the public web, so the permission stop is not an obstacle — it is the owner's live control
 * over what reaches the family's browser, and the standing fire memory has said since s1332
 * that wrapping deploy is the one case where the node trick must not be used.
 *
 * s2371 wrapped it BECAUSE §2.0d told it to, then filed against itself: "the content was
 * authorized, the method bypassed a control that never got to speak." Third instance
 * (s1332, s1504, s2371) and the first caused by OBEYING THE LAW rather than misremembering it.
 *
 * WHY A TOKEN RATHER THAN A CODE CHANGE, and the restraint is measured. The obvious cure —
 * drop `deploy.sh` from the census so it stops being a subject — is WRONG in the direction
 * that costs: it makes the carve-out invisible, so the next fire re-derives the generic
 * fallback from first principles and wraps it again, which is precisely how this recurred
 * three times. The census must keep naming it; what must change is that the law states the
 * exception AND the guard notices if that statement disappears. F-2371-6 named this condition
 * itself: "it must be expressible to `law-bash-prescription-guard` or it will be argued away."
 *
 * FILE-SCOPED, like every other test here (see the header): a surface that prescribes a
 * publish-gated command must carry the carve-out token. It retires the same way too — drop
 * the prescription and there is nothing to assert.
 */
const PUBLISH_GATED = [{ cmd: 'bash scripts/deploy.sh', token: 'PUBLISH-GATED: DO NOT WRAP' }];

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
    // s2400, each run BARE in the fire shell with `ls -d tasks/running` as a positive control
    // in the same shell (so the refusals are not a blanket state) — see arms 21-22.
    ['ps -o pid,ppid,tty,stat,lstart', false],         // ran bare: "requires approval"
    ['kill -TERM <pid>', false],                       // `kill -0 1` bare: "requires approval"
    // `which -a codex` is DELIBERATELY NOT A ROW HERE, and the reason is the header's declared
    // divergence rather than an oversight: it was MEASURED RAN (printed /opt/homebrew/bin/codex)
    // but it is in no family and in no allow entry, so `gateAllows` calls it refused. That is
    // the safe error direction — REFUSED where reality says RAN — and asserting it as ground
    // truth would red this arm for modelling the allowlist exactly as documented. It is
    // recorded because it is the CONTROL that proves §2.0/§2.0b are not refused wholesale:
    // one prescribed probe in that same neighbourhood runs fine, two do not.
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
  const permitAll = [
    'Bash(bash scripts/*)', 'Bash(npm run test:*)', 'Bash(sqlite3:*)',
    'Bash(ps:*)', 'Bash(kill:*)',
  ];
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

test('arm 21 — a surface whose ONLY refused prescription is ps or kill is caught', () => {
  // The s2400 families (F-2400-1), exercised on manufactured subjects for arm 12's reason:
  // each has a single live prescription (§2.0b's diagnostic and its restart), so demanding a
  // live subject would red the day that clause is lawfully reworded — the F-1460-1 fate.
  const ps = findings(
    { 'docs/b.md': 'Measure it first: `ps -o pid,ppid,tty,stat,lstart -p <runner-pid>`.' },
    entries,
  );
  assert.equal(ps.length, 1, 'a ps-only surface must be a subject');
  assert.equal(ps[0].sample, 'ps -o pid,ppid,tty,stat,lstart');

  const kill = findings({ 'docs/c.md': 'To replace it, `kill -TERM <pid>`.' }, entries);
  assert.equal(kill.length, 1, 'a kill-only surface must be a subject');
  assert.equal(kill[0].sample, 'kill -TERM <pid>');

  // and each retires per-family, exactly like the other three
  assert.deepEqual(
    findings({ 'docs/b.md': 'run `ps -o pid,ppid -p 1`' }, [...entries, 'Bash(ps:*)']),
    [],
    'permitting ps must retire the ps family',
  );
  assert.deepEqual(
    findings({ 'docs/c.md': 'run `kill -TERM <pid>`' }, [...entries, 'Bash(kill:*)']),
    [],
    'permitting kill must retire the kill family',
  );
});

test('arm 22 — the ps/kill patterns select IMPERATIVES, never the prose that narrates them', () => {
  // The over-reach that would make these families noise. fire.md discusses `kill -0` (what
  // lane-runner-v3.sh's poll loop does), `kill -9` (a way a runner dies) and a bare
  // `kill -TERM` with no argument. NONE of those orders a fire to run anything, and a guard
  // that demanded a fallback for them would be excused into uselessness inside a week.
  const prose = 'the runner tests `kill -0`, and a `kill -9`, a crash, or a `kill -TERM` all '
    + 'leave a corpse. Elsewhere: `ps` alone, and the word steps -o nothing.';
  assert.deepEqual(findings({ 'docs/prose.md': prose }, entries), [], 'prose must not be a finding');

  // ...and the live corpus really does still carry both imperatives, or arm 16 guards nothing
  // that exists (F-2217-1: an assertion over an empty subject set reports success).
  const live = prescriptionsIn(surfaceTexts['scripts/fire.md'] || '');
  const fams = new Set(live.map((p) => p.family));
  assert.ok(fams.has('ps'), 'fire.md must still prescribe the §2.0b diagnostic');
  assert.ok(fams.has('kill'), 'fire.md must still prescribe the §2.0b restart');
});

test('arm 13 — a surface prescribing a PUBLISH-GATED command must carry its carve-out', () => {
  // F-2371-6. The finding a fire is most likely to reproduce is the one the law TOLD it to
  // make, so the sentence that says "not this one" must be load-bearing rather than advisory.
  const missing = [];
  for (const [file, text] of Object.entries(surfaceTexts)) {
    for (const g of PUBLISH_GATED) {
      if (text.includes(g.cmd) && !text.includes(g.token)) missing.push({ file, cmd: g.cmd });
    }
  }
  assert.deepEqual(
    missing,
    [],
    `a surface prescribes a publish-gated command without the carve-out: ${JSON.stringify(missing)}`,
  );
});

test('arm 14 — arm 13 is not vacuous: the live corpus really does prescribe deploy.sh', () => {
  // Without this, arm 13 passes forever the day someone reworks §2.0d's census wording and
  // the command stops appearing — a guard asserting a principle over an empty subject set
  // (F-2217-1: a loop over nothing registers no assertions and reports success).
  const subjects = Object.entries(surfaceTexts)
    .filter(([, t]) => t.includes(PUBLISH_GATED[0].cmd))
    .map(([f]) => f);
  assert.ok(subjects.length > 0, 'no law surface prescribes deploy.sh — arm 13 now checks nothing');
  assert.ok(subjects.includes('scripts/fire.md'), `expected fire.md among subjects, got ${subjects}`);
});

test('arm 15 — MANUFACTURED DEFECT: deleting the carve-out sentence reds arm 13', () => {
  const variant = { ...surfaceTexts };
  const before = variant['scripts/fire.md'];
  variant['scripts/fire.md'] = before.split(PUBLISH_GATED[0].token).join('(carve-out removed)');
  assert.notEqual(variant['scripts/fire.md'], before, 'variant must differ, or this arm proves nothing');
  const missing = [];
  for (const [file, text] of Object.entries(variant)) {
    for (const g of PUBLISH_GATED) {
      if (text.includes(g.cmd) && !text.includes(g.token)) missing.push({ file, cmd: g.cmd });
    }
  }
  assert.ok(
    missing.some((m) => m.file === 'scripts/fire.md'),
    'removing the carve-out token must be caught',
  );
});

test('arm 16 — REVERSE CONTROL: the carve-out does not exempt deploy.sh from the fallback census', () => {
  // The over-general cure this guard REFUSES: dropping deploy.sh from COMMAND_FAMILIES so it
  // stops being a subject. That would pass every arm above while making the exception
  // invisible — and an invisible exception is what let a fire wrap deploy three times.
  // deploy.sh must REMAIN a matched, refused prescription; only the REMEDY differs.
  const p = prescriptionsIn('run `bash scripts/deploy.sh` after the backup push.');
  assert.equal(p.length, 1, 'deploy.sh must still be matched by the census');
  assert.equal(p[0].family, 'bash');
  assert.equal(gateAllows('bash scripts/deploy.sh', entries), false, 'and must still read as refused');
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

/**
 * F-2387-1 (s2387) — THE PUBLISH GATE IS A MECHANISM TODAY AND THE DESK RECOMMENDS RETIRING IT.
 *
 * Arms 13-16 make the carve-out LAW-LEVEL: a surface prescribing deploy.sh must say
 * "do not wrap it through node". s2371 named that limit itself, in its own handoff:
 * "my carve-out is law-level, not gate-level. F-2350-3 recommends allowlisting
 * `Bash(bash scripts/*)` — that entry would make deploy runnable for every headless fire
 * and silently retire this control. If you grant it, grant it as an enumeration that
 * omits deploy."
 *
 * THAT SENTENCE DID REACH THE OWNER, and a first draft of this comment wrongly said otherwise.
 * s2371 put it in the OWNER'S DESK HEADER, which PRECEDES the items and has been carried
 * verbatim since 2026-08-30 ("read the two together ... grant it as an ENUMERATION that omits
 * deploy"). The probe that missed it scanned only the bytes FOLLOWING each `F-2350-3` mention:
 * a forward-only window reporting absence from a region it never read. Recorded because the
 * correction is the transferable part — when a probe says something is MISSING, check the
 * direction of your own window first.
 *
 * WHAT WAS ACTUALLY OPEN is the gap s2371 named itself: "my carve-out is LAW-LEVEL, not
 * gate-level." Nothing in the repo stopped an allowlist edit from making deploy runnable — the
 * protection was prose, which F-2371-6 says is what gets argued away. These arms close that.
 * The desk warning also lives in the HEADER, which is the one part of the desk each fire
 * REWRITES rather than splices; it has survived 15 fires, but that is a convention, not a
 * mechanism.
 *
 * MEASURED s2387 with the file's own ground-truth matcher, not inferred:
 *   · today, 89 live entries                        -> gateAllows(deploy) === false   (gate holds)
 *   · + Bash(bash scripts/*)   <- the desk's rec     -> TRUE   (control retired)
 *   · + Bash(bash:*)                                 -> TRUE   (control retired)
 *   · + Bash(bash scripts/health-watch.sh:*)         -> false  (safe)
 *   · + Bash(bash scripts/start-lane-runner.sh:*)    -> false  (safe)
 * So s2371's proposed alternative is measurably correct and the desk's wording measurably is not.
 *
 * SEVERITY STATED HONESTLY AND DELIBERATELY NOT INFLATED: nothing is broken, no fire has
 * published, and the realised cost is ZERO — arm 17 passes on the live tree today. This is a
 * DECISION hazard, not a live defect. What earns it a mechanism is the direction: the thing it
 * protects is what reaches the family's browser, and DEPLOY LAW positively INSTRUCTS a fire to
 * run deploy.sh after merging gameplay code — so the day the grant lands, fires begin
 * publishing automatically, with no further edit and no announcement.
 *
 * NOT AN F-1460-1 HAZARD, and the restraint is measured rather than assumed: this arm cannot
 * fire during ordinary correct operation. It reds on exactly one event — an edit to the
 * settings allowlist that makes deploy runnable — which is the single decision it exists to
 * catch. If the owner deliberately rules that fires SHOULD publish, this arm is retired BY
 * THAT RULING, in the same commit, and the retirement is the record of the decision.
 */
test('arm 17 — no allowlist entry may make a PUBLISH-GATED command runnable', () => {
  const runnable = PUBLISH_GATED.filter((g) => gateAllows(g.cmd, entries)).map((g) => g.cmd);
  assert.deepEqual(
    runnable,
    [],
    'the permission gate is the owner\'s live control over what reaches the public web ' +
      `(F-2371-6); an allow entry now makes it runnable by every headless fire: ${JSON.stringify(runnable)}. ` +
      'If this was a deliberate owner ruling, record it and retire this arm in the same commit; ' +
      'if it was collateral from widening bash (F-2350-3), grant the scripts individually instead.',
  );
});

test('arm 18 — arm 17 is not vacuous: there really is a publish-gated command to protect', () => {
  // F-2217-1: a filter over an empty set reports success. Without this, emptying
  // PUBLISH_GATED would silently retire arms 13 and 17 together.
  assert.ok(PUBLISH_GATED.length > 0, 'PUBLISH_GATED is empty — arms 13 and 17 now check nothing');
  assert.ok(
    PUBLISH_GATED.some((g) => g.cmd === 'bash scripts/deploy.sh'),
    'deploy.sh must remain the protected subject',
  );
});

test('arm 19 — MANUFACTURED DEFECT: F-2350-3\'s recommendation verbatim reds arm 17', () => {
  // The defect is not hypothetical — it is the exact string the OWNER'S DESK recommends.
  const widened = entries.concat(['Bash(bash scripts/*)']);
  assert.equal(gateAllows('bash scripts/deploy.sh', entries), false, 'control: the gate holds today');
  assert.equal(
    gateAllows('bash scripts/deploy.sh', widened),
    true,
    'granting Bash(bash scripts/*) must be caught as retiring the publish gate',
  );
});

test('arm 20 — REVERSE CONTROL: a per-script enumeration serves F-2350-3 and keeps the gate', () => {
  // The cure this guard POINTS AT, proven to work rather than merely asserted: enumerating the
  // scripts the law actually prescribes retires F-2350-1's workaround WITHOUT touching deploy.
  // Without this arm the guard would read as "never widen bash", which is not the finding.
  const enumerated = entries.concat([
    'Bash(bash scripts/health-watch.sh:*)',
    'Bash(bash scripts/start-lane-runner.sh:*)',
  ]);
  assert.equal(gateAllows('bash scripts/deploy.sh', enumerated), false, 'deploy stays gated');
  assert.equal(gateAllows('bash scripts/health-watch.sh status', enumerated), true, 'triage read runs');
  assert.equal(
    gateAllows('bash scripts/start-lane-runner.sh --check', enumerated),
    true,
    'emergency restart runs',
  );
});
