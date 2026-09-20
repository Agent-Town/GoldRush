#!/usr/bin/env node

/**
 * Polls the PUBLIC standings GET for one row's assay status until it leaves `pending`.
 * No worker credentials are used or needed: this is the same read any rider can make.
 *
 * Usage: node artifacts/assay-e2e-20260822/poll-assay.mjs <tapeId> [maxMinutes]
 */

import { appendFileSync } from 'node:fs';

const [tapeId, minutes = '15'] = process.argv.slice(2);
const LOG = new URL('./poll.log', import.meta.url);
const URL_ = 'https://gold-rush-3in.pages.dev/api/standings?epoch=epoch-1-frontier&contract=the-claim';
const deadline = Date.now() + Number(minutes) * 60_000;

const say = (line) => { process.stdout.write(`${line}\n`); appendFileSync(LOG, `${line}\n`); };

while (Date.now() < deadline) {
  const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  let body;
  try {
    const response = await fetch(URL_, { headers: { Origin: 'https://gold-rush-3in.pages.dev' } });
    body = await response.json();
  } catch (error) {
    say(`${stamp} POLL error ${error.message}`);
    await new Promise((resolve) => setTimeout(resolve, 20_000));
    continue;
  }
  const row = (body.board ?? []).find((entry) => entry.reel?.id === tapeId);
  say(`${stamp} POLL board=${(body.board ?? []).length} rejectedCount=${body.rejectedCount} row=${row ? `rank ${row.rank} assay=${row.assay}` : 'ABSENT-FROM-RANKED-BOARD'}`);
  if (row && row.assay !== 'pending') {
    say(`${stamp} VERDICT ${row.assay} :: ${JSON.stringify(row)}`);
    process.exit(0);
  }
  if (!row && body.rejectedCount > 0) {
    // A rejected row leaves the ranked board entirely (`isRankedRow`), so its disappearance
    // alongside a raised rejectedCount IS the verdict arriving.
    say(`${stamp} VERDICT rejected (row dropped from ranked board; rejectedCount=${body.rejectedCount})`);
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 20_000));
}
say(`${new Date().toISOString()} TIMEOUT after ${minutes} minutes — still pending`);
process.exit(1);
