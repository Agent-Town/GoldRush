// Replay attribution: for every verified row on the county board, replay its heat-13 tape on a given tree and print contract | board assayHash | replayed hash | HOLDS/MOVES/NO REPLAY.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const tree = process.argv[2]; const label = process.argv[3] || tree;
const receipts = JSON.parse(readFileSync('/Users/robin/Claude/Projects/Gold Rush/assets/rotations/winnability-receipts.json', 'utf8')).contracts;
const out = [];
const only = process.argv[4] ? new Set(process.argv[4].split(",")) : null;
for (const c of receipts) { if (only && !only.has(c.contractId)) continue;
  const res = await fetch(`https://agenttown.app/api/standings?epoch=${c.epochId}&contract=${c.contractId}`, { signal: AbortSignal.timeout(20000) }).then((r) => r.json()).catch(() => null);
  const row = res && res.board && res.board[0]; if (!row) continue;
  const sub = `/Users/robin/Claude/Projects/Gold Rush/artifacts/gauntlet-heat13-569a41f9/rides/${c.contractId}/submission.json`;
  if (!existsSync(sub)) { out.push(`${c.contractId} | ${row.assayHash || '?'} | (no heat-13 submission on disk) | UNKNOWN`); continue; }
  const tape = JSON.parse(readFileSync(sub, 'utf8')).tape;
  const reel = `/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/replay-${c.contractId}.json`; (await import('node:fs')).writeFileSync(reel, JSON.stringify(tape));
  const run = spawnSync('/opt/homebrew/bin/node', ['scripts/assay-replay.mjs', reel], { cwd: tree, encoding: 'utf8', timeout: 300000 });
  let replayed = 'NO REPLAY';
  try { replayed = JSON.parse(run.stdout.trim()).eventLogHash; } catch { replayed = 'NO REPLAY (' + (run.stderr || '').split('\n').filter(Boolean).slice(-1)[0]?.slice(0, 80) + ')'; }
  const verdict = replayed === (row.assayHash || tape.eventLogHash) ? 'HOLDS' : (replayed.startsWith('NO') ? 'NO REPLAY' : 'MOVES');
  out.push(`${c.contractId} | board ${row.assayHash || '?'} | tape ${tape.eventLogHash} | ${label} ${replayed} | ${verdict}`);
  console.log(out[out.length - 1]);
}
console.log(`SUMMARY ${label}: holds ${out.filter((l) => l.endsWith('HOLDS')).length}, moves ${out.filter((l) => l.endsWith('MOVES')).length}, no replay ${out.filter((l) => l.endsWith('NO REPLAY')).length}, unknown ${out.filter((l) => l.endsWith('UNKNOWN')).length}`);
