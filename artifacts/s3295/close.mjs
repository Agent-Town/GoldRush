import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3295';
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 20e6 }).trim();
const receipt = JSON.parse(fs.readFileSync(`${dir}/ledger-result.json`, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(`${dir}/ledger-manifest.json`, 'utf8'));
if (receipt.code !== 0 || !receipt.unchanged || !receipt.headUnchanged) throw Error('Closing gate did not pass');
if (run('git', ['rev-parse', 'HEAD']) !== manifest.head) throw Error('HEAD changed after gate');
for (const [p, want] of Object.entries(manifest.hashes)) {
  if (createHash('sha256').update(fs.readFileSync(p)).digest('hex') !== want) throw Error(`Input changed after gate: ${p}`);
}
if (run('git', ['diff', '--cached', '--name-only'])) throw Error('Unexpected staged paths');
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
const filenameStamp = run('date', ['-u', '+%Y%m%dT%H%M%SZ']);
const previous = fs.readFileSync(`${dir}/predecessor.txt`, 'utf8').trimEnd();
const desk = fs.readFileSync(`${dir}/desk-tail.txt`, 'utf8').trimEnd();
const initial = fs.readFileSync(`${dir}/lock.txt`, 'utf8').trimEnd();
const status = fs.readFileSync('STATUS.md', 'utf8');
const active = status.split('\n')[0];
if (active !== fs.readFileSync(`${dir}/tested-line1.txt`, 'utf8').trimEnd()) throw Error('Tested lock line changed');
if (!status.includes(`- **s3294 handoff (line-1 archive):** ${previous}`) || !status.includes(`- **s3295 ACTIVE (line-1 archive):** ${initial}`)) throw Error('Archive missing');
if (!active.endsWith(desk)) throw Error('Desk tail changed');
const counts = receipt.testSummary.join('; ');
fs.writeFileSync(`${dir}/validation-note.md`, `# s3295 final validation\n\nUnmodified npm run test:ledger-guards exited 0 in ${receipt.seconds} seconds under ${receipt.node}. ${counts}. ${receipt.kitSummary.join('; ')}. HEAD and all input hashes stayed unchanged and were rechecked immediately before closure.\n\nNo product drain or deployment by this fire. Existing F-3293-1 remains reproducible. The optional unbounded archive audit was stopped by its exact owned PID; it has no claimed result. The bounded archive regression check is included in the completed ledger battery. Final lock clearance changes only the lock/stamp envelope after this battery.\n`, { flag: 'wx' });
const vault = {};
try {
  const digest = `/Users/robin/Obsidian/Brain/Sessions/codex/2026-10-22-Gold-Rush-dry-lanes-stale-standings-${filenameStamp}.md`;
  fs.writeFileSync(digest, `---\nsource: codex\nproject: Gold Rush\ndate: 2026-10-22\ntype: digest\n---\n# Gold Rush — s3295 confirms dry lanes and stale canonical standings\n\nWHY no product landing: 95 done-board subjects resolve as 82 merged and 13 closed/blocked, zero eligible/unknown. Four lane branches have zero unmerged commits; seven ahead scratch trees remain attended-owned. CODEX-WALL observed; no dispatch or requeue.\n\nFresh endpoint probes reproduce the player-facing symptom of F-3293-1. Public build 299b1db5 serves weeks 37–44; canonical week-43 standings returns 400 bad_rotation while direct Pages and week-42 control return 200. The prior s3294 droplet metadata is retained as historical evidence and was not re-probed this fire. Existing attended Node-switch word and runtime synchronization remain next. Maintenance completion remains recorded in the attended handover; no server mutation was repeated.\n\nOctober 22 private coverage 60/60, PRIVATE remote heads match completed receipts, week 44 and October 21 ticker current; no duplicate duty writes. Lock f3a2b5b16; bookkeeping 23dac9e50. Final ledger: ${counts}; ${receipt.kitSummary.join('; ')}; ${receipt.seconds} seconds; unchanged HEAD and inputs. Repository evidence: artifacts/s3295/report.md and ledger-result.json. Final handoff clears the lock before origin backup.\n\nRemaining: attended runtime switch/sync and acceptance, historical replay-drift and device/release follow-ups, October 23 duties. [[Projects/Gold Rush/Gold Rush — Public deployment can advance while the canonical standings tree remains stale 20261022T103445Z]]. [[MOCs/Gold Rush MOC]].\n`, { flag: 'wx' });
  vault.digestPath = digest;
} catch (e) { vault.warning = String(e); }
const cleared = active.replace(/^ACTIVE \S+ \(s3295 fire\) — /, `Last updated: ${stamp} s3295 handoff, lock CLEARED — `);
if (cleared === active || !cleared.endsWith(desk)) throw Error('Invalid clearing line');
fs.writeFileSync(`${dir}/close-verification.json`, JSON.stringify({ at: stamp, validatedHead: manifest.head, receipt, deskPreserved: true, predecessorArchived: true, initialActiveArchived: true, finalEnvelopeOnly: true, vault }, null, 2), { flag: 'wx' });
fs.writeFileSync('STATUS.md', cleared + status.slice(status.indexOf('\n')));
const artifacts = ['archive-audit-cancelled.txt', 'status-archive-audit.txt', 'report.md', 'board.txt', 'lanes.txt', 'unreported.txt', 'queue-state.json', 'duties.json', 'launcher.json', 'runner-scan.json', 'live-probe.json', 'ledger-selection.json', 'mirror-freshness.txt', 'private-heads.txt', 'private-visibility.json', 'skillmd-guard.txt', 'health.txt', 'ledger-manifest.json', 'ledger-result.json', 'ledger-guards.txt', 'validation-note.md', 'close-verification.json', 'probe.mjs', 'run-ledger.mjs', 'prepare-handoff.mjs', 'close.mjs'];
const paths = ['STATUS.md', 'docs/HANDOVER-2026-09-06-attended.md', ...artifacts.map(p => `${dir}/${p}`)];
run('git', ['add', '--', ...paths]);
const staged = run('git', ['diff', '--cached', '--name-only']).split('\n');
if (staged.some(p => !paths.includes(p))) throw Error('Unexpected staged surface');
console.log(run('git', ['diff', '--cached', '--stat']));
console.log(run('git', ['commit', '-m', 's3295: verify dry board and stale standings — ledger green, lock CLEARED']));
console.log(JSON.stringify({ commit: run('git', ['rev-parse', 'HEAD']), stamp, vault }));
