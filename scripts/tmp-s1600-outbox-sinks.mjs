// s1600 — measure the F-1546-1 gazette sweep's absence check against BOTH outbox sinks.
// Question: how many "absent" verdicts are artifacts of (a) greping only gazette-queue.md,
// and (b) greping the full 40-char hash when ticker digests cite the 8-char short hash?
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

const SINCE = process.argv[2] || '2026-08-05';
const PLAYER_PATHS = /^(src\/|functions\/|public\/|index\.html|e2e\/)/;

const log = execSync(
  `git log main --first-parent --since=${SINCE} --format=%H`,
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
).trim().split('\n').filter(Boolean);

// the two sinks, read once
const outboxDir = 'marketing/outbox';
const files = readdirSync(outboxDir).filter((f) => f.endsWith('.md'));
const gazette = readFileSync(`${outboxDir}/gazette-queue.md`, 'utf8');
const tickers = files
  .filter((f) => f.startsWith('ticker-digest-'))
  .map((f) => readFileSync(`${outboxDir}/${f}`, 'utf8')).join('\n');
const wholeOutbox = files.map((f) => readFileSync(`${outboxDir}/${f}`, 'utf8')).join('\n');

const rows = [];
for (const sha of log) {
  const paths = execSync(`git show ${sha} --first-parent --name-only --format=`, {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }).trim().split('\n').filter(Boolean);
  if (!paths.some((p) => PLAYER_PATHS.test(p))) continue;
  const short = sha.slice(0, 8);
  rows.push({
    sha, short,
    gazetteFull: gazette.includes(sha),
    gazetteShort: gazette.includes(short),
    tickerShort: tickers.includes(short),
    tickerFull: tickers.includes(sha),
    anywhere: wholeOutbox.includes(sha) || wholeOutbox.includes(short),
  });
}

const asSwept = rows.filter((r) => !r.gazetteFull);              // what s1599's check calls "absent"
const reallyAbsent = rows.filter((r) => !r.anywhere);            // what is actually unreported
const rescuedByTicker = rows.filter((r) => !r.gazetteFull && (r.tickerShort || r.tickerFull));
const rescuedByShort = rows.filter((r) => !r.gazetteFull && !r.tickerShort && !r.tickerFull && r.gazetteShort);

console.log(`window since ${SINCE}`);
console.log(`first-parent commits             : ${log.length}`);
console.log(`player-path-touching             : ${rows.length}`);
console.log(`"absent" per gazette-only+full   : ${asSwept.length}`);
console.log(`  of which reported in a TICKER  : ${rescuedByTicker.length}`);
console.log(`  of which in gazette by SHORT   : ${rescuedByShort.length}`);
console.log(`genuinely absent from ALL sinks  : ${reallyAbsent.length}`);
console.log(`false-positive rate of the check : ${asSwept.length ? ((asSwept.length - reallyAbsent.length) / asSwept.length * 100).toFixed(1) : '0'}%`);
console.log('\nrescued by ticker (would be re-raised forever):');
for (const r of rescuedByTicker) {
  const subj = execSync(`git log -1 --format=%s ${r.sha}`, { encoding: 'utf8' }).trim();
  console.log(`  ${r.short}  ${subj.slice(0, 90)}`);
}

// convention census: how does each sink cite hashes?
const hashTokens = (s) => [...s.matchAll(/\b[0-9a-f]{7,40}\b/g)].map((m) => m[0]);
const cens = (s) => {
  const t = hashTokens(s);
  return { full40: t.filter((x) => x.length === 40).length, short: t.filter((x) => x.length < 40).length };
};
console.log('\nhash-citation convention by sink:');
console.log('  gazette-queue.md :', JSON.stringify(cens(gazette)));
console.log('  ticker digests   :', JSON.stringify(cens(tickers)));
