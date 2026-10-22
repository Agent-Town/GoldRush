import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3293';
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
if (!status.includes(`- **s3292 handoff (line-1 archive):** ${previous}`) || !status.includes(`- **s3293 ACTIVE (line-1 archive):** ${initial}`)) throw Error('Archive missing');
if (!active.endsWith(desk)) throw Error('Desk tail changed');
const counts = receipt.testSummary.join('; ');
fs.writeFileSync(`${dir}/validation-note.md`, `# s3293 final validation\n\nUnmodified npm run test:ledger-guards exited 0 in ${receipt.seconds} seconds under ${receipt.node}. ${counts}. ${receipt.kitSummary.join('; ')}. HEAD and all input hashes stayed unchanged and were rechecked immediately before closure.\n\nNo product drain or deployment by this fire. F-3293-1 retains the canonical standings/runtime synchronization follow-up. Final lock clearance is an envelope-only change after this battery.\n`, { flag: 'wx' });
let vault = {};
try {
  vault = JSON.parse(fs.readFileSync(`${dir}/vault-note-path.txt`, 'utf8'));
  const digest = `/Users/robin/Obsidian/Brain/Sessions/codex/2026-10-22-Gold-Rush-canonical-server-stale-${filenameStamp}.md`;
  fs.writeFileSync(digest, `---\nsource: codex\nproject: Gold Rush\ndate: 2026-10-22\ntype: digest\n---\n# Gold Rush — s3293 reconciles the attended landing and records stale canonical standings\n\nWHY no product landing: the attended session had already landed assay-node-26-12-1 as 2bbc6df06 and deployed 299b1db5. Board DRY: 95 subjects, zero eligible/unknown, four lane branches with zero unmerged commits. Seven ahead scratch trees retain attended custody.\n\nRecorded F-3293-1: public skill.md includes weeks 37–44, but canonical week-43 standings returns bad_rotation while direct Pages returns 200. The deploy log reports ASSAYER SYNC FAILED; read-only droplet metadata retains weeks 37–42, the older engine pin and Node 26.4.0. Server maintenance is verified complete; the existing Node-switch word and attended runtime sync remain next. No server mutation or deployment by this fire.\n\nOne missing Gazette roundup added for the attended landing, draft only. October 22 private coverage 60/60, PRIVATE heads match completed receipts, week 44 and October 21 ticker current. Lock 12032191c; bookkeeping cbda059ba. Final unmodified ledger battery: ${counts}; ${receipt.kitSummary.join('; ')}; ${receipt.seconds} seconds, unchanged HEAD and inputs. Repo evidence: artifacts/s3293/report.md and ledger-result.json. Final handoff commit clears the lock and is followed by origin backup.\n\nNext: attended runtime sync after the existing owner word, ASSAYER SYNCED plus matching pins and canonical week-43 200; existing historical replay drift and device/release work; October 23 heartbeat duties. [[Projects/Gold Rush/${vault.projectName}]]. [[MOCs/Gold Rush MOC]].\n`, { flag: 'wx' });
  vault.digestPath = digest;
} catch (e) { vault.warning = String(e); }
const cleared = active.replace(/^ACTIVE \S+ \(s3293 fire\) — /, `Last updated: ${stamp} s3293 handoff, lock CLEARED — `);
if (cleared === active || !cleared.endsWith(desk)) throw Error('Invalid clearing line');
fs.writeFileSync(`${dir}/close-verification.json`, JSON.stringify({ at: stamp, validatedHead: manifest.head, receipt, deskPreserved: true, predecessorArchived: true, initialActiveArchived: true, finalEnvelopeOnly: true, vault }, null, 2), { flag: 'wx' });
fs.writeFileSync('STATUS.md', cleared + status.slice(status.indexOf('\n')));
const artifacts = ['report.md', 'board.txt', 'lanes.txt', 'unreported.txt', 'queue-state.json', 'duties.json', 'launcher.json', 'runner-scan.json', 'live-probe.json', 'droplet-status.txt', 'droplet-runtime-metadata.json', 'attended-deploy-receipt.txt', 'mirror-freshness.txt', 'private-heads.txt', 'private-visibility.json', 'skillmd-guard.txt', 'ledger-selection.json', 'news-census.json', 'ledger-manifest.json', 'ledger-result.json', 'ledger-guards.txt', 'validation-note.md', 'close-verification.json', 'probe.mjs', 'run-ledger.mjs', 'prepare-handoff.mjs', 'close.mjs'];
const paths = ['STATUS.md', 'docs/HANDOVER-2026-09-06-attended.md', 'tasks/BACKLOG.md', 'marketing/outbox/gazette-queue.md', ...artifacts.map(p => `${dir}/${p}`)];
run('git', ['add', '--', ...paths]);
const staged = run('git', ['diff', '--cached', '--name-only']).split('\n');
if (staged.some(p => !paths.includes(p))) throw Error('Unexpected staged surface');
console.log(run('git', ['diff', '--cached', '--stat']));
console.log(run('git', ['commit', '-m', 's3293: record stale canonical runtime and attended landing — ledger green, lock CLEARED']));
console.log(JSON.stringify({ commit: run('git', ['rev-parse', 'HEAD']), stamp, vault }));
