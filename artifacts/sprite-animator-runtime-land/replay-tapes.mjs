// Replay the heat-13 tapes on a given tree, off disk.
//
// WHY THIS EXISTS. The master prescribes `artifacts/maps-campaign-land-era6/replay-rows.mjs`.
// That harness reads each contract's FIRST verified board row from the live county
// (`https://agenttown.app/api/standings?...`) and skips any contract whose board is empty. Run on
// 2026-09-15 it printed `SUMMARY animator: holds 0, moves 0, no replay 0, unknown 0` — because the
// era-6 bump retired every era-5 reel, so every board today reads `"board": []` with a positive
// `retiredCount` (measured: the-claim → board [], retiredCount 10). The table it was meant to
// produce is therefore unreachable through that door, for any tree, until heat 14 re-rides.
//
// The question the master actually asks — "an animation runtime must not move a headless replay" —
// is answered without the county: replay the same sixteen tapes from
// `artifacts/gauntlet-heat13-569a41f9/rides/<contract>/submission.json` and compare the replayed
// event-log hash against the tape's own declared `eventLogHash`. Run on two trees, the comparison
// is the attribution.
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tree = process.argv[2];
const label = process.argv[3] ?? tree;
const rides = process.argv[4] ?? '/Users/robin/Claude/Projects/Gold Rush/artifacts/gauntlet-heat13-569a41f9/rides';
const receipts = JSON.parse(readFileSync('/Users/robin/Claude/Projects/Gold Rush/assets/rotations/winnability-receipts.json', 'utf8')).contracts;
const scratch = mkdtempSync(path.join(tmpdir(), 'replay-tapes-'));
const rows = [];
for (const c of receipts) {
  const submission = path.join(rides, c.contractId, 'submission.json');
  if (!existsSync(submission)) { rows.push({ contract: c.contractId, tape: null, replayed: 'NO TAPE', verdict: 'NO TAPE' }); continue; }
  const tape = JSON.parse(readFileSync(submission, 'utf8')).tape;
  const reel = path.join(scratch, `${c.contractId}.json`);
  writeFileSync(reel, JSON.stringify(tape));
  const run = spawnSync('/opt/homebrew/bin/node', ['scripts/assay-replay.mjs', reel], { cwd: tree, encoding: 'utf8', timeout: 300_000 });
  let replayed;
  try { replayed = JSON.parse(run.stdout.trim()).eventLogHash; }
  catch { replayed = 'NO REPLAY (' + ((run.stderr || '').split('\n').filter(Boolean).slice(-1)[0] ?? '').slice(0, 90) + ')'; }
  const verdict = replayed === tape.eventLogHash ? 'HOLDS' : replayed.startsWith('NO REPLAY') ? 'NO REPLAY' : 'MOVES';
  rows.push({ contract: c.contractId, tape: tape.eventLogHash, replayed, verdict });
  console.log(`${c.contractId} | tape ${tape.eventLogHash} | ${label} ${replayed} | ${verdict}`);
}
const count = (v) => rows.filter((r) => r.verdict === v).length;
console.log(`SUMMARY ${label}: ${rows.length} tapes — holds ${count('HOLDS')}, moves ${count('MOVES')}, no replay ${count('NO REPLAY')}, no tape ${count('NO TAPE')}`);
writeFileSync(path.join(process.cwd(), `artifacts/sprite-animator-runtime-land/replay-tapes-${label}.json`), JSON.stringify(rows, null, 2) + '\n');
