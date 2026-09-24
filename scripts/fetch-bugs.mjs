#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const token = process.env.BUG_OFFICE_TOKEN;
if (!token) throw new Error('Set BUG_OFFICE_TOKEN before fetching the complaints ledger.');

const baseURL = process.argv[2] ?? process.env.BUG_OFFICE_URL ?? 'https://gold-rush-3in.pages.dev';
const outputDir = resolve(process.argv[3] ?? 'bug-reports');
const stateFile = resolve(outputDir, '.seen.json');
await mkdir(outputDir, { recursive: true });

const seen = new Set(await readSeen(stateFile));
const reports = await listReports(baseURL, token);
const fresh = reports.filter(({ id }) => !seen.has(id));

for (const report of fresh) {
  console.log(`NEW ${report.id} ${report.submittedAt} ${report.prospectorName ?? 'unnamed'}: ${oneLine(report.description)}`);
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
