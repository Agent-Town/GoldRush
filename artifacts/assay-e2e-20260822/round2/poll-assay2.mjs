#!/usr/bin/env node

/**
 * Round-2 poller. Watches BOTH public read surfaces every 20s until the verdict lands:
 *   - the ranked board, matched on profileName (the row's own visible handle)
 *   - the new assay slip, `?verdict=<tapeId>` (the F-ASSAY-E2E-4 cure)
 *
 * The two are polled together on purpose: the tape id is derived from
 * (contract, seed, difficulty, eventLogHash), so a deterministic rider replayed by anyone produces
 * the SAME id — and this board now holds two rows carrying `agent-a7999390`. Recording what the
 * slip answers while a second row shares its key is the point, not an accident.
 */

const PROFILE = process.argv[2] ?? 'Assay E2E Probe 2';
const TAPE_ID = process.argv[3] ?? 'agent-a7999390';
const minutes = Number(process.argv[4] ?? '15');

const BOARD = 'https://gold-rush-3in.pages.dev/api/standings?epoch=epoch-1-frontier&contract=the-claim';
const SLIP = `${BOARD}&verdict=${TAPE_ID}`;
const HEADERS = { Origin: 'https://gold-rush-3in.pages.dev' };
const deadline = Date.now() + minutes * 60_000;

const get = async (url) => {
  try {
    const response = await fetch(url, { headers: HEADERS });
    return await response.json();
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

while (Date.now() < deadline) {
  const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const [board, slip] = await Promise.all([get(BOARD), get(SLIP)]);
  const row = (board.board ?? []).find((entry) => entry.profileName === PROFILE);
  process.stdout.write(`${stamp} BOARD n=${(board.board ?? []).length} rejected=${board.rejectedCount} row=${row ? `rank ${row.rank} assay=${row.assay} reel=${row.reel?.id}` : 'ABSENT'} | SLIP ${JSON.stringify(slip)}\n`);
  if (row && row.assay !== 'pending') {
    process.stdout.write(`${stamp} VERDICT ${row.assay}\nROW ${JSON.stringify(row)}\nSLIP ${JSON.stringify(slip)}\n`);
    process.exit(0);
  }
  if (!row && (board.rejectedCount ?? 0) > 1) {
    process.stdout.write(`${stamp} VERDICT rejected (row left the ranked board; rejectedCount=${board.rejectedCount})\nSLIP ${JSON.stringify(slip)}\n`);
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 20_000));
}
process.stdout.write(`${new Date().toISOString()} TIMEOUT after ${minutes} minutes — still pending\n`);
process.exit(1);
