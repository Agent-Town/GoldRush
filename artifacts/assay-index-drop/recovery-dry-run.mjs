// F-HEAT14-6 recovery DRY RUN — read-only. Asks the live county door, for every heat-14 reel that
// was accepted, which of the two recovery paths it needs:
//
//   VERIFIED            nothing to do — the standing is on the board with a slip.
//   PENDING             stored and still awaiting assay. This is the INDEX-LOSS signal: the row is
//                       on the board, the assayer polls continuously, so a reel that is still
//                       pending long after its ride is one the assay index lost. A
//                       `storedUnassayed` sweep of its board puts its locator back
//                       (docs/ops/assay-recovery.md).
//   STORED-UNASSAYED    ?verdict= 404s but ?reel= answers. Structurally unreachable today —
//                       validateStoredRow reads a taped row with no assay mark back as `pending` —
//                       and kept only so a future row shape that breaks that invariant is named
//                       rather than silently filed under DELETED.
//   DELETED-AT-VERDICT  the ride's own `post-response.json` records `stored:true`, and ?reel= now
//                       answers reel_not_found: the pre-cure verdict path removed the row. Not
//                       re-queueable — it must be re-DELIVERED from the arena's submission.json
//                       after the cure is deployed.
//   NEVER-ACCEPTED      the door never stored it (nginx 413, or the submission cap). Nothing was
//                       lost by the county; it is a first delivery, not a recovery.
//
// It writes nothing anywhere: three GETs per reel against the public API, no key, no POST.
// usage: node artifacts/assay-index-drop/recovery-dry-run.mjs [--json]
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const HEAT = join(HERE, '..', 'gauntlet-heat14-e3949bfa');
const ENDPOINT = 'https://agenttown.app/api/standings';

const get = async (params) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${ENDPOINT}?${params}`);
      return { status: response.status, body: await response.json() };
    } catch { await new Promise((done) => setTimeout(done, 1_000 * (attempt + 1))); }
  }
  return { status: 0, body: null };
};

const rides = readdirSync(join(HEAT, 'rides'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const rows = [];
for (const ride of rides) {
  const path = join(HEAT, 'rides', ride, 'submission.json');
  if (!existsSync(path)) continue;
  const submission = JSON.parse(readFileSync(path, 'utf8'));
  // The door's own receipt for this ride, verbatim. `{"ok":true,"stored":true,...}` is the county
  // saying it took the row, which is what separates a row the county LOST from one it never had.
  let receipt = null;
  try { receipt = JSON.parse(readFileSync(join(HEAT, 'rides', ride, 'post-response.json'), 'utf8')); } catch { /* nginx HTML, or no POST */ }
  const accepted = receipt?.ok === true && receipt.stored === true;
  const base = { epoch: submission.epochId, contract: submission.contractId, season: '2' };
  const slip = await get(new URLSearchParams({ ...base, verdict: submission.tape.id }));
  const reel = slip.status === 200 ? null : await get(new URLSearchParams({ ...base, reel: submission.tape.id }));
  const state = slip.status === 200
    ? (slip.body.assay === 'verified' ? 'VERIFIED' : slip.body.assay.toUpperCase())
    : reel?.status === 200 ? 'STORED-UNASSAYED'
      : reel?.body?.error === 'reel_not_found' ? (accepted ? 'DELETED-AT-VERDICT' : 'NEVER-ACCEPTED')
        : `UNKNOWN(${reel?.body?.error ?? reel?.status})`;
  rows.push({
    ride,
    epochId: submission.epochId,
    contractId: submission.contractId,
    tapeId: submission.tape.id,
    state,
    doorReceipt: receipt?.error ?? (accepted ? 'stored' : 'no json receipt'),
    assay: slip.status === 200 ? slip.body.assay : null,
    ranked: slip.status === 200 ? slip.body.ranked : null,
    recovery: state === 'VERIFIED' ? 'none'
      : state === 'DELETED-AT-VERDICT' ? 're-deliver submission.json after the cure ships'
        : state === 'NEVER-ACCEPTED' ? 'first delivery, not a recovery (see the door receipt)'
          : 'storedUnassayed sweep of this board',
  });
  await new Promise((done) => setTimeout(done, 300));
}

const by = (state) => rows.filter((row) => row.state === state);
if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify({ measuredAt: new Date().toISOString(), endpoint: ENDPOINT, rows }, null, 2)}\n`);
} else {
  for (const row of rows) process.stdout.write(`${row.contractId.padEnd(22)} ${row.state.padEnd(18)} ${row.recovery}\n`);
}
const sweepsFor = rows.filter((row) => row.state === 'STORED-UNASSAYED' || row.state === 'PENDING');
const sweeps = [...new Set(sweepsFor.map((row) => `${row.epochId}/${row.contractId}`))];
process.stderr.write(`${JSON.stringify({
  reels: rows.length,
  verified: by('VERIFIED').length,
  pending: by('PENDING').length,
  storedUnassayed: by('STORED-UNASSAYED').length,
  deletedAtVerdict: by('DELETED-AT-VERDICT').length,
  neverAccepted: by('NEVER-ACCEPTED').length,
  sweepsNeeded: sweeps.length,
  reDeliveriesNeeded: by('DELETED-AT-VERDICT').length,
})}\n`);
