#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const token = process.env.BUG_OFFICE_TOKEN;
if (!token) throw new Error('Set BUG_OFFICE_TOKEN before fetching the complaints ledger.');

// SEC-5 (outside review 2026-09-24): this defaulted to `resolve('bug-reports')` — the repo root —
// so every triage left player screenshots and typed complaints in the working tree of a PUBLIC
// origin, offered by `git status` as addable content. The default now lands OUTSIDE any repo, on the
// same argument `scripts/ledger-mirror-dest.mjs` makes for the county mirror: a .gitignore line is
// one `git add -f` away from not protecting anything, while a path that is not under the repo root
// cannot be committed to it at all. `~/.goldrush/` is the established private-local home on this
// machine (it already holds the rotation salt), so this adds no new trust assumption. The explicit
// third argument still wins — the owner may want a report copied somewhere deliberately — and the
// destination is declared on stdout ALWAYS, with its provenance, so a narrowed corpus can never
// read like the default one (F-2208-1).
const DEFAULT_OUTPUT_DIR = join(homedir(), '.goldrush', 'bug-reports');
// SEC-7 of the same review: the office now writes every report with a 90-day `expirationTtl`
// (`functions/api/_bugs.ts` REPORT_TTL_SECONDS), so a complaint left unread eventually stops
// existing, which is the point, and which triage has to be able to SEE. The two numbers are pinned
// to each other by `scripts/site-security-headers.test.mjs` ("the bug-office report TTL and the
// number the fetch script prints are the same"), so raising one without the other reds a gate
// instead of quietly printing a lie. Declared up here, not beside its helpers at the bottom: the
// office census runs at module top level and a `const` below it would be a TDZ crash.
const REPORT_TTL_DAYS = 90;
const baseURL = process.argv[2] ?? process.env.BUG_OFFICE_URL ?? 'https://gold-rush-3in.pages.dev';
const requestedDir = process.argv[3];
const outputDir = requestedDir ? resolve(requestedDir) : DEFAULT_OUTPUT_DIR;
const stateFile = resolve(outputDir, '.seen.json');
console.log(
  requestedDir
    ? `destination : ${outputDir}  (from the command line — NOT the default)`
    : `destination : ${outputDir}  (default: private, outside the public repo)`,
);
await mkdir(outputDir, { recursive: true });

const seen = new Set(await readSeen(stateFile));
const reports = await listReports(baseURL, token);
const fresh = reports.filter(({ id }) => !seen.has(id));
printOfficeAges(reports);

for (const report of fresh) {
  console.log(`NEW ${report.id} ${report.submittedAt} ${ageLabel(report.submittedAt)} ${report.prospectorName ?? 'unnamed'}: ${oneLine(report.description)}`);
  const detail = await getJson(apiURL(baseURL, `/api/bugs/${report.id}`), token);
  if (detail.bug?.screenshot) {
    const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(detail.bug.screenshot);
    if (!match) throw new Error(`Report ${report.id} returned a malformed screenshot.`);
    await writeFile(resolve(outputDir, `${report.id}.jpg`), Buffer.from(match[1], 'base64'));
  }
  seen.add(report.id);
}

await writeFile(stateFile, `${JSON.stringify([...seen].sort(), null, 2)}\n`);
console.log(fresh.length ? `Saved ${fresh.length} new report(s) in ${outputDir}.` : 'No new reports.');

async function listReports(origin, officeToken) {
  const reports = [];
  let cursor;
  do {
    const url = apiURL(origin, '/api/bugs');
    if (cursor) url.searchParams.set('cursor', cursor);
    const page = await getJson(url, officeToken);
    reports.push(...page.bugs);
    cursor = page.cursor ?? undefined;
  } while (cursor);
  return reports;
}

function apiURL(origin, pathname) {
  return new URL(pathname, origin);
}

// SEC-9 (outside review 2026-09-24): the token used to travel as `?token=`, which writes the office
// credential into every access log, proxy log and shell history the URL touches. It rides the
// Authorization header now. NOTE the deploy order: the office keeps accepting `?token=` for one
// release, so an OLD script still works against a NEW deployment, but this script needs the deployed
// functions to carry that same release before it can read the office again.
async function getJson(url, officeToken) {
  const response = await fetch(url, { headers: { authorization: `Bearer ${officeToken}` } });
  if (!response.ok) throw new Error(`Bug Office returned ${response.status} for ${url.pathname}.`);
  return response.json();
}

async function readSeen(path) {
  try {
    const value = JSON.parse(await readFile(path, 'utf8'));
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
  } catch (cause) {
    if (cause?.code === 'ENOENT') return [];
    throw cause;
  }
}

function oneLine(value) {
  return value.replace(/\s+/g, ' ').slice(0, 160);
}

function ageDays(submittedAt) {
  const submitted = Date.parse(submittedAt ?? '');
  if (!Number.isFinite(submitted)) return null;
  return Math.floor((Date.now() - submitted) / 86_400_000);
}

function ageLabel(submittedAt) {
  const days = ageDays(submittedAt);
  if (days === null) return '(age unknown: unparsable submittedAt)';
  const left = REPORT_TTL_DAYS - days;
  return `(age ${days}d, ${left > 0 ? `${left}d left` : 'PAST its TTL'} of ${REPORT_TTL_DAYS})`;
}

function printOfficeAges(all) {
  if (!all.length) return;
  const dated = all.map((report) => ageDays(report.submittedAt)).filter((days) => days !== null);
  if (!dated.length) return;
  const oldest = Math.max(...dated);
  const expiring = dated.filter((days) => REPORT_TTL_DAYS - days <= 14).length;
  console.log(
    `office : ${all.length} report(s) on the desk; oldest ${oldest}d; ` +
      `${expiring} within 14d of the ${REPORT_TTL_DAYS}d TTL${expiring ? '; copy what matters before it ages out' : ''}`,
  );
}
