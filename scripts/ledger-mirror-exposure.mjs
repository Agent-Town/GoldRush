#!/usr/bin/env node
/**
 * ledger-mirror-exposure.mjs — the missing instrument for LB-01's STANDING
 * ENCRYPTION GATE: "does any ledger mirror this repo commits carry ACCOUNT data?"
 *
 * WHY THIS EXISTS (F-2353-1, s2353 — the gate had a reader for the rare path and
 * NONE for the daily one)
 * ---------------------------------------------------------------------------
 * `scripts/fire.md` §LB-01 has carried this gate as PROSE since 2026-08-24:
 *
 *     "BEFORE the accounts flip onto sqlite, this raw mirror must become an
 *      ENCRYPTED artifact — a plaintext ledger of county standings is fine,
 *      account data is not."
 *
 * s2352 added a manual key-read instruction — but ONLY to the `--fill-gaps`
 * recovery arm, which runs rarely and by explicit opt-in. The DEFAULT daily
 * path, whose output the LB-01 duty tells a fire to `git add` + commit + PUSH TO
 * ORIGIN, carries no such instruction and no instrument at all. So the one arm
 * that runs every single day is the one nothing checks.
 *
 * THE DOOR IS ONE-WAY, WHICH IS WHAT MAKES IT WORTH A TOOL RATHER THAN A HABIT.
 * Once account rows are committed and pushed they are in git history and on
 * origin. Removing them needs a history rewrite, i.e. a force-push — which is
 * DENY-LISTED in this repo. There is no "we will clean it up later" here.
 *
 * WHAT s2353 MEASURED, and it upgrades a desk UNKNOWN into a fact
 * --------------------------------------------------------------
 * F-2352-3 asked, and recorded as NOT answerable from this tree: does
 * `env.ACCOUNTS` resolve to the SAME droplet sqlite that gets mirrored, or to a
 * separate Cloudflare KV namespace? It IS answerable from this tree, by reading:
 *
 *   - wrangler.toml binds TELEMETRY and MULTIPLAYER_RATE_LIMITS and has NO
 *     ACCOUNTS binding at all.
 *   - ops/droplet/agenttown.app.nginx.conf:17-24 proxies
 *     /api/(request-code|verify|session|save/|delete-account) to 127.0.0.1:8791,
 *     the local sqlite ledger — NOT to the Cloudflare functions.
 *   - ops/droplet/ledger-backup.mjs:6 mirrors SOURCE=/opt/goldrush-ledger/ledger.db
 *     — the very same database — wholesale.
 *
 * Confirmed live, with a probe chosen to have ZERO side effects (an invalid
 * email returns 400 only AFTER passing the ACCOUNTS and RESEND gates at
 * functions/api/_accounts.ts:87-90, so no code is minted and no mail is sent):
 *
 *   https://agenttown.app/api/request-code        -> 400 invalid_email
 *   https://gold-rush-3in.pages.dev/api/request-code -> 503 sign_in_not_enabled
 *
 * So the answer is (b): the account path IS the droplet ledger, and the
 * ordering constraint F-2352-3 flagged is real rather than suspected.
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED
 * ------------------------------------------------------
 * NOTHING IS EXPOSED TODAY, measured not assumed: all six mirrors on disk hold
 * the `kv` table only, 6 rows, `assay-queue-index` + 5 `standings:s2:*`, and
 * ZERO account-class rows. Every mirror this repo has ever committed is clean.
 *
 * The gate holds for exactly ONE reason: sign-in has never worked since the
 * accounts flipped (F-MAIL-0829 — the Resend domain is unverified). That is an
 * OUTAGE, not a design. The desk correctly recommends fixing it as "the cheapest
 * real thing", ~5 minutes — and that fix is precisely what ARMS this gate.
 *
 * WHY A REFUSAL HERE, when this factory's standing restraint is to prefer
 * advisories (F-1460-1, the `cross-engine` fate)
 * ----------------------------------------------------------------------
 * Because an account row in a plaintext artifact that is committed and pushed is
 * NEVER a lawful state. There is no ordinary correct operation this refusal can
 * fire on, so it cannot be excused into uselessness. That is the exact test the
 * sibling freshness probe fails — a missing backup day IS frequently lawful, so
 * that tool is advisory — and this one passes.
 *
 * UNRECOGNISED keys are treated DIFFERENTLY and deliberately do NOT refuse by
 * default: the county adding a new standings-class key is routine and lawful, so
 * refusing there would decay this into noise. They are DECLARED and warned, and
 * only --strict turns them into a code.
 *
 * CONVENTIONS COPIED FROM THE CORPUS
 * ----------------------------------
 *   - Corpus DECLARED on stdout ALWAYS, including the happy path (F-2208-1).
 *   - Corpus state is a STRING, never a boolean (F-2212-1: careless truthiness
 *     coerces a failure value toward NOTICING).
 *   - Exit 2 = "could not answer" vs exit 1 = "answered, and the answer refuses"
 *     — the convention drain-block-check / dry-board-probe / master-shipped-
 *     classifier / review-evidence-audit already carry.
 *   - The refusal reaches STDOUT, because a caller that classifies stdout reads
 *     an empty string as silence (F-2211-1).
 *   - The corpus root is anchored to import.meta.url, NEVER process.cwd()
 *     (F-2220-1: a subdirectory keeps git healthy and narrows only the corpus —
 *     the dangerous cwd is the one that still looks like home).
 */

import { existsSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Derived from functions/api/_accounts.ts — every `<prefix>:${...}` key that file
// writes. scripts/ledger-mirror-exposure-guard.test.mjs re-derives this list FROM
// that source and reds if the two ever disagree, so a renamed or newly-added
// account key class cannot silently fall outside the denylist. A hardcoded list
// of what the code already knows is a defect awaiting a rename; the guard is the
// third implementation of the question that keeps this one honest.
const ACCOUNT_PREFIXES = ['account:', 'attempts:', 'code:', 'ratelimit:', 'save:', 'session:'];

// The county-standings classes the gate explicitly calls fine in plaintext.
const SAFE_PREFIXES = ['standings:', 'assay-', 'assay:'];

// Non-KV tables whose identity-bearing columns must pass through the same
// account-prefix classifier as `key` values. Anything else is declared SKIPPED.
const TABLE_IDENTITY_COLUMNS = { refusals: ['anon_id', 'profile_name'] };

const DEFAULT_DIR = fileURLToPath(new URL('../artifacts/ledger-backups/', import.meta.url));

function parseArgs(argv) {
  const strict = argv.includes('--strict');
  const json = argv.includes('--json');
  const i = argv.indexOf('--dir');
  if (i !== -1 && !argv[i + 1]) throw new Error('--dir requires a path');
  const dir = i === -1 ? DEFAULT_DIR : path.resolve(argv[i + 1]);
  return { strict, json, dir };
}

export function classifyKey(key) {
  if (ACCOUNT_PREFIXES.some(p => key.startsWith(p))) return 'account';
  if (SAFE_PREFIXES.some(p => key.startsWith(p))) return 'safe';
  return 'unrecognised';
}

export function accountPrefixes() {
  return [...ACCOUNT_PREFIXES];
}

/**
 * Read one mirror. Returns a per-file record whose `state` is a STRING:
 *   'read'       — keys enumerated
 *   'unreadable' — the file exists but sqlite would not open/query it
 * An unreadable member is a HOLE IN THE DENOMINATOR, so it is counted and named
 * rather than silently skipped, and it drives the "could not answer" code.
 */
function readMirror(file, DatabaseSync) {
  try {
    const db = new DatabaseSync(file, { readOnly: true });
    try {
      const tables = db.prepare("select name from sqlite_master where type='table'")
        .all().map(r => r.name).sort();
      const keys = [];
      const inspections = [];
      for (const t of tables) {
        const cols = db.prepare(`pragma table_info(${JSON.stringify(t)})`).all().map(c => c.name);
        const harvested = cols.includes('key')
          ? ['key']
          : (TABLE_IDENTITY_COLUMNS[t] ?? []).filter(column => cols.includes(column));
        inspections.push({ table: t, columns: harvested });
        for (const column of harvested) {
          for (const row of db.prepare(`select ${JSON.stringify(column)} as value from ${JSON.stringify(t)}`).all()) {
            if (typeof row.value === 'string') keys.push({ table: t, column, key: row.value });
          }
        }
      }
      return { file, state: 'read', tables: inspections, keys };
    } finally {
      db.close();
    }
  } catch (err) {
    return { file, state: 'unreadable', tables: [], keys: [], detail: String(err && err.message || err) };
  }
}

export function auditDir(dir, DatabaseSync) {
  if (!existsSync(dir)) {
    return { corpus: 'absent', dir, mirrors: [], detail: `${dir} does not exist` };
  }
  let names;
  try {
    names = readdirSync(dir).filter(n => n.endsWith('.db')).sort();
  } catch (err) {
    return { corpus: 'unreadable', dir, mirrors: [], detail: String(err && err.message || err) };
  }
  const mirrors = names.map(n => readMirror(path.join(dir, n), DatabaseSync));
  return { corpus: 'read', dir, mirrors };
}

async function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.log(`⛔ CANNOT VERIFY — ${err.message}`);
    return 2;
  }

  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import('node:sqlite'));
  } catch {
    console.log('⛔ CANNOT VERIFY — node:sqlite is unavailable in this runtime; the mirrors were NOT read.');
    return 2;
  }

  const result = auditDir(args.dir, DatabaseSync);

  const readable = result.mirrors.filter(m => m.state === 'read');
  const unreadable = result.mirrors.filter(m => m.state === 'unreadable');
  const allKeys = readable.flatMap(m => m.keys.map(k => ({ file: path.basename(m.file), ...k })));
  const tableInspections = readable.flatMap(m => m.tables.map(t => ({ file: path.basename(m.file), ...t })));
  const account = allKeys.filter(k => classifyKey(k.key) === 'account');
  const unrecognised = allKeys.filter(k => classifyKey(k.key) === 'unrecognised');

  if (args.json) {
    console.log(JSON.stringify({
      corpus: result.corpus,
      dir: result.dir,
      mirrors: result.mirrors.length,
      read: readable.length,
      unreadable: unreadable.length,
      keys: allKeys.length,
      tables: tableInspections,
      accountRows: account.length,
      unrecognisedRows: unrecognised.length,
      account,
      unrecognised,
    }, null, 2));
  } else {
    console.log('LEDGER MIRROR EXPOSURE — LB-01 standing encryption gate\n');
    // Declared ALWAYS, including the happy path (F-2208-1): "0 account rows" and
    // "I read nothing" must never look alike.
    console.log(`  corpus                  : ${result.corpus} (${result.mirrors.length} mirror(s), ` +
      `${readable.length} read, ${unreadable.length} unreadable)`);
    console.log(`  dir                     : ${result.dir}`);
    console.log(`  tables inspected        : ${tableInspections.map(t =>
      `${t.file}:${t.table}[${t.columns.length ? t.columns.join(',') : 'SKIPPED: no declared columns'}]`).join('; ') || 'none'}`);
    console.log(`  keys inspected          : ${allKeys.length}`);
    console.log(`  account-class rows      : ${account.length}`);
    console.log(`  unrecognised rows       : ${unrecognised.length}`);
    if (result.detail) console.log(`  detail                  : ${result.detail}`);
    for (const m of unreadable) console.log(`  UNREADABLE ${path.basename(m.file)} — ${m.detail}`);
    console.log('');

    if (account.length) {
      console.log('⛔ ACCOUNT DATA IN A PLAINTEXT MIRROR — DO NOT COMMIT, DO NOT PUSH.');
      console.log('   The LB-01 duty says to `git add` + commit + push these files. Committing');
      console.log('   this one puts personal data in git history and on origin PERMANENTLY —');
      console.log('   undoing it needs a force-push, which is deny-listed in this repo.');
      for (const a of account) console.log(`     ${a.file}  ${a.key}`);
      console.log('   The standing gate (scripts/fire.md §LB-01) is now ARMED: the mirror must');
      console.log('   become an ENCRYPTED artifact before any further mirror is committed.');
    } else if (unrecognised.length) {
      console.log('⚠️  UNRECOGNISED KEY CLASS(ES) — not known-account, not known-safe.');
      console.log('   Not a refusal by default: the county adding a standings-class key is');
      console.log('   lawful and routine. Read them, then either add the prefix to');
      console.log('   SAFE_PREFIXES or treat them as account data.');
      for (const u of unrecognised) console.log(`     ${u.file}  ${u.key}`);
    } else if (result.corpus === 'absent') {
      // F-2218-1's restraint, and it is measured rather than stylistic: an absent
      // mirror directory is a LAWFUL routine state (a fresh clone, a worktree
      // older than 2026-08-24), and it genuinely ANSWERS this tool's question —
      // there are no mirrors, so nothing is exposed. Refusing here would red the
      // battery on ordinary correct work and be excused into uselessness inside a
      // week (F-1460-1). Only a directory that EXISTS and will not be read is an
      // unambiguous instrument failure.
      console.log('✅ CLEAN — no mirror directory here, so there is nothing to expose.');
      console.log('   (Lawful: a fresh clone or a worktree older than the mirror series.)');
    } else if (result.corpus !== 'read' || unreadable.length) {
      // Cure the BANNER, not merely the exit code: in the default mode the whole
      // verdict travels on stdout, so a tool that exits 2 while printing "CLEAN"
      // has relocated the lie rather than fixed it (F-2210-1). This file's own
      // guard caught exactly that on the first writing.
      console.log('⛔ COULD NOT ANSWER — this is NOT a clean verdict.');
      console.log('   Part of the corpus was not read, so no claim is made about what it holds.');
      console.log('   Do not commit an unverified mirror.');
    } else if (readable.length) {
      console.log('✅ CLEAN — every key in every mirror is county-standings class.');
      console.log('   Nothing here carries account data; these mirrors are safe to commit.');
    } else {
      console.log('✅ CLEAN — the corpus was read and holds no mirrors yet.');
    }
  }

  // 'absent' is lawful and answered (see the banner above); only a corpus that
  // exists and could not be read is "could not answer".
  if (result.corpus === 'unreadable') return 2;
  if (unreadable.length) return 2;
  if (account.length) return 1;
  if (args.strict && unrecognised.length) return 1;
  return 0;
}

// realpath BOTH sides: macOS symlinks /tmp -> /private/tmp, so a plain resolve()
// comparison is FALSE for any copy running under a temp dir and main() silently
// never runs — rc=0, stdout 0 B, indistinguishable from a clean board. That is
// the exact trap F-2215-1 records, and it made this file's own control arms
// vacuous on their first writing.
function sameFile(a, b) {
  try {
    return realpathSync(a) === realpathSync(b);
  } catch {
    return path.resolve(a) === path.resolve(b);
  }
}

const invokedDirectly = process.argv[1] && sameFile(process.argv[1], fileURLToPath(import.meta.url));
if (invokedDirectly) {
  process.exit(await main(process.argv.slice(2)));
}
