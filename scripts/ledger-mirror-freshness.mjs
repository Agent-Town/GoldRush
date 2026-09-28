#!/usr/bin/env node
/**
 * ledger-mirror-freshness.mjs — answers the ONE question LB-01 cannot ask:
 * "is the county book's offsite mirror actually CURRENT, and is the series WHOLE?"
 *
 * WHY THIS EXISTS (F-2351-1, s2351 — another instance of F-2204-1's class)
 * -----------------------------------------------------------------------
 * `scripts/fire.md` §LB-01 states its whole discharge test as:
 *
 *     "check whether artifacts/ledger-backups/ already holds today's
 *      ledger-YYYY-MM-DD.db; if yes, DISCHARGED, move on"
 *
 * That test is EXISTENTIAL and keyed on TODAY. It is therefore structurally
 * incapable of seeing a HOLE anywhere behind today: once today's file lands,
 * every future fire reads "today's file exists -> DISCHARGED" and any missing
 * earlier day is missing FOREVER, unreported, by construction. No amount of
 * diligence fixes this, because the question is never asked.
 *
 * MEASURED s2351, which is how the gap was found at all:
 *
 *   - ledger-2026-08-27.db is ABSENT from the series (24, 25, 26, __, 28, 29).
 *   - The 08-27 fire log carries 22 FIRE STARTs and ZERO mentions of LB-01 or
 *     ledger-backup-pull; so does 08-28's. The duty simply did not run.
 *   - The 08-28 mirror was committed at 2026-08-29T01:33+07:00 — a day late.
 *   - NOTHING anywhere consumes or watches artifacts/ledger-backups/: zero
 *     references in scripts/, ops/ or package.json outside the pull script, and
 *     health-watch.sh does not touch it. LB-01 appears in exactly ONE law
 *     surface line (scripts/fire.md:52-53) and in no skill and not in CLAUDE.md.
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED
 * ------------------------------------------------------
 * The realised cost of the 08-27 hole is ZERO, and this must not be read as a
 * data-loss finding. The mirror is a cumulative sqlite DB; 08-26 and 08-28 are
 * distinct real backups that bracket the hole, and player sign-in was DOWN
 * 2026-08-24 -> 2026-08-29 (F-MAIL-0829), so no new standings could have been
 * written on the missing day. Nothing was lost.
 *
 * What earns this a tool is the DIRECTION and the fact that nobody could have
 * known either way: an offsite backup is the one artifact whose whole purpose is
 * to be there on the day the disk dies (Mistake #11, "The Missing Remote" —
 * weeks of work on one disk, no origin). A backup series that silently stops
 * being refreshed, while every prescribed probe reports success, is that mistake
 * rebuilt one layer up.
 *
 * WHY NOT A RED GATE, and the restraint is measured rather than lazy
 * -----------------------------------------------------------------
 * A gap is frequently LAWFUL: the box is down, the machine slept, the droplet's
 * own cron had not yet run, a fire cycle was spent on a drain. A guard that
 * reddened on "a day is missing" would fire during ordinary correct operation
 * and be excused into uselessness inside a week — the `cross-engine` fate that
 * scripts/fire.md names explicitly (F-1460-1). So this is ADVISORY: it exits 0
 * in every state by default, and only --strict turns a verdict into a code.
 * It is a triage READ, exactly as §2.0c's runner check is, not a gate.
 *
 * CONVENTIONS THIS FILE DELIBERATELY COPIES FROM THE CORPUS
 * --------------------------------------------------------
 *   - The corpus is DECLARED on stdout ALWAYS, including the happy path
 *     (F-2208-1: a declaration that appears only on failure re-creates the very
 *     ambiguity it removes).
 *   - Corpus state is a STRING, never a boolean (F-2212-1: a careless truthiness
 *     test coerces every failure value TOWARD noticing, i.e. fail-safe by
 *     construction rather than by discipline).
 *   - --strict separates 2 = "could not answer" from 1 = "answered, and the
 *     answer refuses" — the convention drain-block-check, dry-board-probe,
 *     master-shipped-classifier and review-evidence-audit already carry.
 *   - The root is anchored to import.meta.url, so the corpus CANNOT be silently
 *     narrowed by the caller's cwd (F-2220-1 / F-2221-1: a subdirectory keeps
 *     git healthy, keeps every path resolving, and narrows only the corpus —
 *     the dangerous cwd is the one that still looks like home). This copies the
 *     pull script's own DEFAULT_DEST pattern.
 *
 * THE DATE TRAP THIS FILE AVOIDS ON PURPOSE
 * -----------------------------------------
 * `new Date('2026-08-27')` parses as UTC MIDNIGHT while `new Date()` is LOCAL,
 * and this machine is UTC+07. Mixing the two silently shifts every age by a day
 * for seven hours out of every twenty-four. `ledger-backup-pull.mjs` itself
 * computes its "today" as `new Date().toISOString().slice(0,10)` — i.e. in UTC —
 * so between 00:00 and 07:00 local it is already reasoning about YESTERDAY.
 * (That skew is LATENT there and is NOT claimed as a defect: the droplet's own
 * backup lands ~09:30 local, well inside the window where the two agree, and the
 * script self-corrects later the same day. It is named here only so the next
 * reader does not "fix" this file into agreement with it.)
 *
 * This file therefore does NO Date parsing of the series at all. It converts
 * Y-M-D to an integer day number by pure calendar arithmetic and derives "today"
 * from LOCAL components. Timezone-proof and arithmetic-proof by construction.
 *
 * THE DENOMINATOR COMES FROM OUTSIDE THE CORPUS (F-2668-2's remaining gate, s2671)
 * -------------------------------------------------------------------------------
 * As first written, this tool asked "is every calendar day between the OLDEST and
 * the NEWEST file present?" — and took both edges from the directory it audits.
 * The right edge was safe (it is checked against TODAY, which is external). The
 * LEFT edge was not: it is whatever survived. So a wholesale loss of the old end
 * of the series is invisible BY CONSTRUCTION — delete thirty-one of thirty-two
 * days and the survivor becomes the whole series:
 *
 *     corpus : read (1 entry, 1 dated)
 *     span   : 2026-09-24 -> 2026-09-24  (1/1 day(s) present)
 *     ✅ WHOLE AND CURRENT ... Nothing owed.        rc(--strict) = 0
 *
 * That is not a hypothetical: it is the transcript of this tool run against a
 * manufactured wipe (artifacts/s2671/repro-self-denominator.txt), and it is the
 * SAME sentence it printed for s2668 when the series really did hold one usable
 * day. The guard survived its own subject's disaster with a green.
 *
 * The cure is a left edge that the corpus cannot supply about itself:
 * `ops/ledger-series-anchor.json` declares the series' FIRST COVERAGE DAY, is
 * tracked in git, and lives outside artifacts/ledger-backups/ so that deleting
 * the mirrors cannot also delete the record of how many there should have been.
 *
 * Its absence is "could not answer" (2), never a fallback to the old behaviour:
 * a cure that silently degrades to the defect when its input is missing is the
 * defect with extra steps. Without the anchor this tool still reports the corpus
 * and the age, and WITHHOLDS the word WHOLE.
 */

import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveMirrorDest, destLine } from './ledger-mirror-dest.mjs';

// THE CORPUS AND THE PULL'S DESTINATION ARE NOW ONE DECISION (F-2668-2's remaining half).
// This constant used to read `../artifacts/ledger-backups/` while ledger-backup-pull.mjs
// ALSO honoured LEDGER_BACKUP_DEST — so a re-homed destination left this tool auditing the
// abandoned path and calling a healthy mirror stale. s2671 banked that; the re-home below
// the public tree made it live, so it is cured by making the question unaskable: one
// resolver, three importers. The provenance is printed with the path (see reportHeader).
const MIRROR_DEST = resolveMirrorDest();
const MIRROR_DIR = MIRROR_DEST.dir;

// Anchored to import.meta.url for the same reason the corpus is (F-2220-1): a
// caller's cwd must not be able to swap the denominator.
const ANCHOR_FILE = fileURLToPath(new URL('../ops/ledger-series-anchor.json', import.meta.url));

// ledger-YYYY-MM-DD.db. Validate the CALENDAR, never the digit count: eight
// digits is not a date, and a filter that only counts digits drags a boundary to
// prehistory the first time something else in the name is date-shaped (the
// hash-as-date trap that dry-board-probe paid for in its own first live run).
const NAME = /^ledger-(\d{4})-(\d{2})-(\d{2})\.db$/;

export function parseName(filename) {
  const m = NAME.exec(filename);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  if (y < 2000 || y > 2999) return null;
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > 31) return null;
  if (d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d, iso: filename.slice(7, 17) };
}

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y, m) =>
  [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

// Days since a fixed epoch, by pure integer arithmetic. No Date, so no timezone.
export function dayNumber({ y, m, d }) {
  let days = 0;
  for (let yy = 2000; yy < y; yy++) days += isLeap(yy) ? 366 : 365;
  for (let mm = 1; mm < m; mm++) days += daysInMonth(y, mm);
  return days + d;
}

// "Today" from LOCAL components — never toISOString(), which is UTC.
export function localToday(now = new Date()) {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

const pad = (n) => String(n).padStart(2, '0');
const isoOf = ({ y, m, d }) => `${y}-${pad(m)}-${pad(d)}`;

export function readMirrors(dir = MIRROR_DIR) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (err) {
    // Deliberately NOT a bare catch returning []: an empty selection drives
    // every downstream count to zero, and zero gaps in an empty series is the
    // exact SHAPE of a healthy board (F-2217-1). Declare instead.
    return {
      corpus: err.code === 'ENOENT' ? 'absent' : 'unreadable',
      corpusDetail: `${err.code ?? 'error'} at ${dir}`,
      files: [],
      dated: [],
    };
  }
  const dated = [];
  const undatedNames = [];
  for (const name of entries.sort()) {
    const parsed = parseName(name);
    if (parsed) dated.push({ name, ...parsed });
    else if (name !== '.DS_Store') undatedNames.push(name);
  }
  return { corpus: 'read', corpusDetail: dir, files: entries, dated, undatedNames };
}

/**
 * The external denominator (F-2668-2, s2671). State is a STRING in every arm —
 * 'read' | 'absent' | 'unreadable' | 'malformed' — never a boolean and never a
 * silent null, so a careless truthiness test coerces toward noticing (F-2212-1).
 *
 * The date is validated through parseName, the SAME calendar validator the
 * corpus filenames go through: one validator, so the anchor and the series can
 * never disagree about what a legal day is.
 */
export function readAnchor(file = ANCHOR_FILE) {
  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch (err) {
    return {
      state: err.code === 'ENOENT' ? 'absent' : 'unreadable',
      detail: `${err.code ?? 'error'} at ${file}`,
      iso: null,
      day: null,
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { state: 'malformed', detail: `unparseable JSON at ${file} (${err.message})`, iso: null, day: null };
  }
  const iso = parsed?.firstCoverageDay;
  if (typeof iso !== 'string') {
    return { state: 'malformed', detail: `no string firstCoverageDay in ${file}`, iso: null, day: null };
  }
  const parts = parseName(`ledger-${iso}.db`);
  if (!parts) {
    return { state: 'malformed', detail: `firstCoverageDay "${iso}" is not a valid calendar day (${file})`, iso, day: null };
  }
  return { state: 'read', detail: file, iso, day: dayNumber(parts), parts };
}

/**
 * The whole point of the tool: the INTERIOR holes, which LB-01's existential
 * "does today's file exist?" test can never see, plus the age of the newest,
 * plus — since s2671 — the days missing off the OLD END, which the tool's own
 * self-drawn span could not see either.
 *
 * `anchor` defaults to the UNSET state rather than to a disk read, so a caller
 * that does not supply one is told it has no denominator instead of quietly
 * getting the pre-s2671 behaviour back. main() supplies readAnchor().
 */
export function analyse(sel, today = localToday(), anchor = { state: 'unset', detail: 'no anchor supplied by the caller', iso: null, day: null }) {
  const anchorFields = {
    anchorState: anchor?.state ?? 'unset',
    anchorDetail: anchor?.detail ?? 'no anchor supplied by the caller',
    anchorIso: anchor?.iso ?? null,
  };
  if (sel.corpus !== 'read') {
    return { corpus: sel.corpus, corpusDetail: sel.corpusDetail, missing: [], ageDays: null, newest: null, oldest: null, span: 0, ...anchorFields };
  }
  if (sel.dated.length === 0) {
    return { corpus: 'read', corpusDetail: sel.corpusDetail, missing: [], ageDays: null, newest: null, oldest: null, span: 0, empty: true, ...anchorFields };
  }
  const byDay = new Map(sel.dated.map((f) => [dayNumber(f), f]));
  const nums = [...byDay.keys()].sort((a, b) => a - b);
  const first = nums[0];
  const last = nums[nums.length - 1];

  // THE LEFT EDGE. With an anchor it is declared from outside; without one it
  // falls back to the oldest survivor — which is the pre-s2671 blind spot, and
  // is why the verdict is WITHHELD rather than printed in that state.
  const anchored = anchorFields.anchorState === 'read' && Number.isInteger(anchor.day);
  const windowStart = anchored ? Math.min(anchor.day, first) : first;

  // A file OLDER than the anchor is not an error — someone backfilled further
  // back than the declared start. It widens the window (it can never hide a
  // day) and is reported so the anchor can be corrected deliberately.
  const beforeAnchor = anchored ? nums.filter((n) => n < anchor.day).length : 0;

  const missing = [];
  // Inclusive of windowStart: when the anchor day itself is gone, THAT is the
  // headline. The old loop started at first+1 and so could never name it.
  for (let n = windowStart; n < last; n++) {
    if (!byDay.has(n)) missing.push(isoFromDayNumber(n));
  }
  return {
    corpus: 'read',
    corpusDetail: sel.corpusDetail,
    oldest: byDay.get(first),
    newest: byDay.get(last),
    missing,
    windowStartIso: isoFromDayNumber(windowStart),
    windowStartSource: anchored ? 'anchor' : 'corpus',
    beforeAnchor,
    span: last - windowStart + 1,
    present: nums.length,
    ageDays: dayNumber(today) - last,
    ...anchorFields,
  };
}

function isoFromDayNumber(n) {
  let y = 2000;
  for (;;) {
    const len = isLeap(y) ? 366 : 365;
    if (n <= len) break;
    n -= len;
    y++;
  }
  let m = 1;
  for (;;) {
    const len = daysInMonth(y, m);
    if (n <= len) break;
    n -= len;
    m++;
  }
  return isoOf({ y, m, d: n });
}

/**
 * 2 = could not answer · 1 = answered, and the answer refuses · 0 = clear.
 * Advisory (no --strict) is ALWAYS 0 by design: a gap is often lawful, and a
 * tool that blocks a fire on its own opinion of a backup schedule is the
 * excused-into-uselessness failure this file's header refuses to build.
 */
export function exitCodeFor(report, strict, maxAgeDays = 1) {
  if (!strict) return 0;
  if (report.corpus !== 'read') return 2;
  if (report.empty) return 2;
  // No external denominator, no answer about WHOLENESS (F-2668-2, s2671). This
  // sits ABOVE the missing/age tests on purpose: with the left edge drawn from
  // the corpus, "missing: []" is not a finding, it is an artefact.
  if (report.anchorState !== 'read') return 2;
  if (report.missing.length > 0) return 1;
  if (report.ageDays > maxAgeDays) return 1;
  return 0;
}

function main() {
  const strict = process.argv.includes('--strict');
  const json = process.argv.includes('--json');
  const sel = readMirrors();
  const anchor = readAnchor();
  const report = analyse(sel, localToday(), anchor);

  if (json) {
    console.log(JSON.stringify({
      // The directory MEASURED and where that choice came from. A machine reader
      // must be able to tell a default corpus from an env-narrowed one without
      // reading the environment it was not present for (F-2668-2's re-home).
      dir: MIRROR_DIR,
      destProvenance: MIRROR_DEST.provenance,
      corpus: report.corpus,
      corpusDetail: report.corpusDetail,
      anchorState: report.anchorState,
      anchorDetail: report.anchorDetail,
      anchorIso: report.anchorIso,
      windowStart: report.windowStartIso ?? null,
      windowStartSource: report.windowStartSource ?? null,
      newest: report.newest?.iso ?? null,
      oldest: report.oldest?.iso ?? null,
      present: report.present ?? 0,
      span: report.span,
      ageDays: report.ageDays,
      missing: report.missing,
    }, null, 2));
    process.exit(exitCodeFor(report, strict));
  }

  // The header NAMES THE DIRECTORY IT ACTUALLY MEASURED. It used to print the literal
  // string "artifacts/ledger-backups/", which was true only for as long as nobody re-homed
  // the destination — a tool whose own header can go stale is a tool that can report
  // confidently about a directory it never opened (F-2668-2's re-home, s2672).
  console.log('LEDGER MIRROR FRESHNESS — LB-01, advisory');
  console.log(`  ${destLine(MIRROR_DEST)}`);
  console.log('');

  // ALWAYS declared, including the happy path (F-2208-1).
  const label = {
    read: `read (${sel.files.length} entr${sel.files.length === 1 ? 'y' : 'ies'}, ${sel.dated.length} dated)`,
    absent: `ABSENT (${sel.corpusDetail})`,
    unreadable: `UNREADABLE (${sel.corpusDetail})`,
  }[report.corpus] ?? `UNRECOGNISED (${report.corpus})`;
  console.log(`  corpus                  : ${label}`);

  // The denominator is DECLARED on the happy path too, and by the same law the
  // corpus is (F-2208-1) — a reader must never have to infer where the left
  // edge of the span came from.
  const anchorLabel = {
    read: `${report.anchorIso} (ops/ledger-series-anchor.json) — declared OUTSIDE the corpus`,
    absent: `ABSENT (${report.anchorDetail})`,
    unreadable: `UNREADABLE (${report.anchorDetail})`,
    malformed: `MALFORMED (${report.anchorDetail})`,
    unset: `NOT SUPPLIED (${report.anchorDetail})`,
  }[report.anchorState] ?? `UNRECOGNISED (${report.anchorState})`;
  console.log(`  series anchor           : ${anchorLabel}`);

  if (report.corpus !== 'read') {
    console.log('');
    console.log(`  ⛔ CANNOT VERIFY — the mirror directory could not be read (${sel.corpusDetail}).`);
    console.log('     This is NOT the same as "the series is whole". Nothing was measured.');
    process.exit(exitCodeFor(report, strict));
  }
  if (report.empty) {
    console.log('');
    console.log('  ⛔ CANNOT VERIFY — the directory is readable but holds no ledger-YYYY-MM-DD.db.');
    console.log('     An empty series has no gaps, which is also the shape of a mirror that has');
    console.log('     never run. Nothing was measured.');
    process.exit(exitCodeFor(report, strict));
  }

  const ageWord = report.ageDays === 0 ? 'today' : report.ageDays === 1 ? 'yesterday' : `${report.ageDays} days old`;
  const anchored = report.windowStartSource === 'anchor';
  console.log(`  newest                  : ${report.newest.name}  (${ageWord})`);
  console.log(
    `  span                    : ${report.windowStartIso} -> ${report.newest.iso}  ` +
      `(${report.present}/${report.span} day(s) present, left edge from the ${report.windowStartSource})`,
  );
  if (anchored && report.windowStartIso !== report.anchorIso) {
    console.log(`  oldest file             : ${report.oldest.iso}  (${report.beforeAnchor} file(s) predate the anchor — the window widened to include them)`);
  }
  if (sel.undatedNames?.length) {
    console.log(`  undated entries ignored : ${sel.undatedNames.length} (${sel.undatedNames.slice(0, 3).join(', ')})`);
  }
  console.log('');

  if (!anchored) {
    // The verdict is WITHHELD, not guessed. Reporting the corpus and the age is
    // still worth doing; calling an unmeasured series WHOLE is not.
    console.log('  ⛔ CANNOT VERIFY WHOLENESS — there is no external series anchor, so the left');
    console.log('     edge of the span above is simply the oldest file that survives. A wholesale');
    console.log('     loss of the old end of the series reads as a shorter, perfect series');
    console.log('     (F-2668-2: one surviving file printed "1/1 day(s) present" and a clean verdict).');
    // The verdict token itself is deliberately NOT quoted in this paragraph: a
    // guard's explanatory prose becomes a grepper's input, and an explanation
    // that contains the very phrase it is refusing to print hands every reader
    // — including this file's own negative assertions — a false positive.
    console.log(`     Restore ops/ledger-series-anchor.json — ${report.anchorDetail}`);
    console.log('');
  }
  if (anchored && report.missing.length === 0 && report.ageDays <= 1) {
    console.log(`  ✅ WHOLE AND CURRENT — every calendar day from the DECLARED first coverage day`);
    console.log(`     (${report.anchorIso}, anchored outside the corpus) to the newest mirror is present,`);
    console.log('     and the newest is not behind. Nothing owed.');
  }
  if (report.missing.length > 0) {
    console.log(`  ⚠️  MISSING COVERAGE DAY(S): ${report.missing.length}`);
    console.log('     LB-01\'s discharge test asks only whether TODAY\'s file exists, so these');
    console.log('     are invisible to it forever — a hole never becomes today again.');
    for (const iso of report.missing) console.log(`       ${iso}`);
    console.log('');
    console.log('     A hole is often LAWFUL (box down, machine asleep, a fire spent on a drain)');
    console.log('     and the mirror is a CUMULATIVE sqlite DB, so a bracketed hole usually costs');
    console.log('     nothing. Judge it, record the judgement, do not reflexively backfill:');
    console.log('     the droplet keeps only its own retention window and may no longer hold it.');
  }
  if (report.ageDays > 1) {
    console.log('');
    console.log(`  ⚠️  NEWEST MIRROR IS ${report.ageDays} DAYS BEHIND today (${isoOf(localToday())}).`);
    console.log('     `ledger-backup-pull.mjs` exits 0 with "newest ledger backup already');
    console.log('     present" whenever the droplet has nothing newer — which is the correct');
    console.log('     no-op on a quiet day AND the exact reading of a dead backup cron on the');
    console.log('     box. It never prints an age, so only this probe can tell them apart.');
  }

  process.exit(exitCodeFor(report, strict));
}

// macOS symlinks /tmp -> /private/tmp, so comparing argv[1] to import.meta.url
// WITHOUT resolving both through realpath makes main() silently never run: the
// process exits 0 with EMPTY output, which is indistinguishable from the very
// silence this tool exists to measure. That is the F-2215-1 trap, paid for by a
// fire whose neutrality control was vacuous for exactly this reason — and every
// test in this file's guard runs the CLI from a temp dir, so it is reachable here.
const resolveReal = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
};

if (process.argv[1] && resolveReal(fileURLToPath(import.meta.url)) === resolveReal(process.argv[1])) main();
