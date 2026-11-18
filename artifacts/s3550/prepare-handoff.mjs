import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const dir = 'artifacts/s3550', read = p => fs.readFileSync(p, 'utf8');
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], {encoding: 'utf8'}).trim();
const control = JSON.parse(read(`${dir}/gazette-direct-git-result.json`));
const v = JSON.parse(read(`${dir}/verification.json`));
const sample = JSON.parse(read(`${dir}/git-launch-comparison.json`));
assert.equal(control.code, 0);
assert(sample.identical && v.latestRunMerged && v.wholeFenceMatches && v.rotationCommitAncestor);
assert(Object.values(v.branchLogs).every(x => !x));
assert.match(read(`${dir}/dry-board.txt`), /✅ DRY/);
assert.match(read(`${dir}/mirror-freshness.txt`), /87\/87/);
assert.equal(JSON.parse(read(`${dir}/private-visibility.json`)).visibility, 'PRIVATE');
assert(v.privateDutyReceipt.every(x => x.code === 0));
const queue = JSON.parse(read(`${dir}/queue-state.json`));
assert(Object.values(queue['tasks/queue']).every(x => x.length === 0));
assert.equal(queue['tasks/running'].length, 0);
assert.equal(queue['assets/crafting-queue/pending'].length, 0);
assert.equal(queue['tasks/failed'].filter(x => x.mtime > '2026-11-18T12:00:00Z').length, 0);
const summary = `Recovered ended s3549 lock. Gazette control 9/9 in ${control.seconds.toFixed(1)}s with direct Apple Git; complete ledger receipt artifacts/s3550/ledger-result.json determines clearance. WHY no product landing: DRY, 95 subjects, zero eligible/unknown; four absorbed lanes, six empty queues. November 18 private coverage 87/87, FM-01, week 48 and November 17 ticker complete. Evidence artifacts/s3550/report.md. Next: attended deployment through week 48 with ASSAYER SYNCED; November 19 duties; week-49 mint November 25. Seven-item desk preserved.`;
const predecessor = read(`${dir}/predecessor.txt`).trimEnd();
const tail = predecessor.slice(predecessor.indexOf('DESK-NOT-OWED:'));
assert(tail.includes("🔺 **OWNER'S DESK — 7 awaiting a word.**"));
const status = read('STATUS.md');
const oldLine = status.split('\n')[0];
assert(oldLine.includes('(s3550 fire)'));
assert(status.includes('- **s3549 handoff (line-1 archive):** ' + predecessor));
const body = summary + ' ' + tail;
const line = `ACTIVE ${stamp} (s3550 fire) — ${body}`;
fs.writeFileSync('STATUS.md', line + '\n\n- **s3550 initial lock (line-1 archive):** ' + oldLine + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, line + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');
fs.writeFileSync('tasks/BACKLOG.md', `✅ **s3550 VERIFICATION (${stamp}):** ${summary} The launcher overhead is measured; the environment mitigation preserves all scan inputs and timeouts. Closing acceptance is the complete ledger receipt, not the isolated control. No product change, dispatch, new task or owner decision.\n\n` + read('tasks/BACKLOG.md'));
const handover = 'docs/HANDOVER-2026-09-06-attended.md';
fs.writeFileSync(handover, read(handover) + `\n\n### s3550 verification: Gazette control recovered with direct Git\n\n${stamp}. ${summary}\n\nFresh verification: 1,483 done-moves, 95 subjects (82 merged, 13 closed/blocked); all four main..lane histories empty, runner 33370 alive, no new failed run or pending crafting order. November 18 duty receipts and both private branch heads match; whole rotation fence matches twelve entries. Live week-47 standings still reject bad_rotation on both hosts; week-44 controls pass.\n\nThe s3549 fire ended at 12:22:35 UTC with its gate blocked. This invocation owns launcher 16956 → Node 17004 → fire 17006. The exact inherited lock and seven-item desk are preserved. The 30-commit comparison returned byte-identical file lists through both Git paths: launcher ${(sample.shimMs / 1000).toFixed(3)}s, direct binary ${(sample.directMs / 1000).toFixed(3)}s. The changed-premise isolated guard passes 9/9 in ${control.seconds.toFixed(1)}s. For the closing gate put /Library/Developer/CommandLineTools/usr/bin BEFORE /usr/bin in PATH; artifacts/s3550/final-gate.mjs records the full environment. No assertions, window, timeout, package script or product source changed. This is a measured environment mitigation, not proof that historical sweep cost cannot recur as history grows. Final acceptance is ledger-result.json; only exit 0 with unchanged input/HEAD fingerprints permits lock CLEARED.\n`);
fs.writeFileSync(`${dir}/report.md`, `# s3550 fire — Gazette gate recovery and verified dry board

READY-FOR-GATES: isolated control passed; final acceptance is ledger-result.json. This report does not anticipate the full battery.

${summary}

## What was recovered

s3549 ended at 12:22:35 UTC after the full ledger and an isolated Gazette control both exceeded the existing 240-second sweep limit. Its ACTIVE stamp was 12:21 UTC. The fresh process directory belongs to this fire (launcher 16956 → Node 17004 → process 17006), not that ended owner. The exact failed predecessor is archived in STATUS; its evidence is preserved unchanged.

The historical scan executes one git show per first-parent commit. The diagnostic window held 4,943 commits. Thirty sampled calls through the developer-tool launcher projected 336.9 seconds for that portion alone. A paired comparison produced identical output for all 30 commits: /usr/bin/git took ${(sample.shimMs / 1000).toFixed(3)} seconds, the direct CommandLineTools binary ${(sample.directMs / 1000).toFixed(3)} seconds, ${((1 - sample.directMs / sample.shimMs) * 100).toFixed(1)}% less elapsed time. Sampling is diagnostic, not a complete-sweep benchmark.

With /Library/Developer/CommandLineTools/usr/bin first in PATH, the original Gazette guard passes 9/9 in ${control.seconds.toFixed(1)} seconds. This removes measured launcher overhead without changing the test, 240-second child limit, historical window, classifier or product. The ledger harness uses that environment, repository Node 26.4.0, one test-file worker and a process-bound idle-sleep inhibitor on AC power. All original checks remain in npm run test:ledger-guards. Input and HEAD fingerprints prevent clearance after concurrent mutation. The mitigation does not remove the sweep's linear process-launch cost; a future recurrence needs new evidence rather than repeated unchanged retries.

## Rechecked claims

- Board: dry-board.txt reads 1,483 done-moves and classifies 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. The prescribed lane-usable probe reports four absorbed lane branches, with stale dependencies noted; independent main..branch histories are empty. Six queues, running tasks and crafting orders are empty. None of 118 historical failures is newer than the previous fire. The October 23 run log was read; assayer-sync-visibility-1 is merged and its merge hash is a main ancestor. No retry is owed. CODEX-WALL continues to prohibit fire refills and dispatch.
- Process and custody: runner 33370 is alive with PPID 1. scripts/lane-runner-v3.sh:322 implements the main semaphore as ACTIVE present and lock CLEARED absent. Attended scratch custody and deployment ownership are unchanged. Launcher logs use logs/fire-YYYYMMDD.log, as scripts/fire-runner.sh declares.
- LB-01 and FM-01: successful November 18 receipts from s3542 were read, not rerun. Fresh coverage is 87/87 days, August 24–November 18. Archive visibility is PRIVATE and live ledger-backups d0e7ef1b354a5671fdea99797b6d4c748d05aea2 and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb match those receipts. Private bytes remain outside this public repo. Prior push/exposure results are inherited evidence; the closing battery performs its own exposure check.
- RT-01: week 48 opens November 23 UTC; the entire twelve-rotation registry matches the public skill fence and its preparation commit is ancestral. No duplicate mint. TK-01: November 17 digest and its pinned census were read; census not regenerated. No player-visible change or engine pin lands here, so no Gazette news item is owed.
- Live: landing, game and both stats APIs return HTTP 200 with valid nonempty stats JSON. Build 299b1db5 serves weeks 37–44. Week-47 standings return 400 bad_rotation on both hosts; week-44 controls return 200. Deployment through week 48 remains attended-owned and publish-gated; no deployment attempted.
- Evidence scope: canonical nineteen-part BACKLOG corpus, current handover, CODEX-WALL, owner desk and shared vault read. Generated dashboard bookkeeping committed separately; the empty goal-tree refresh is preserved locally, not reverted. No product source, tests, package scripts, goals or specs changed. No product build or browser gate applies. No art/store landing or pending order triggers an art audit or verdict.

## Commits

- 809f0a42d: recovered the ended lock and archived s3549.
- 740b00f05: preserved generated dashboard bookkeeping.
- final-gate.mjs emits the final handoff hash and matching origin hash only after the complete gate; the clearing commit is the last write to main.

## REMAINING LIST IN ORDER

1. Closing acceptance: inspect ledger-result.json. A red keeps STATUS ACTIVE and requires a changed premise before retry.
2. Attended deployment through week 48, then ASSAYER SYNCED, served-registry parity and week-47 standings HTTP 200 on both hosts.
3. November 19 ticker after 06:00 local and private duties after 02:10 UTC; week-49 mint November 25 00:00 UTC.
4. Seven existing owner items remain unchanged; no new owner decision requested.
`);
console.log(JSON.stringify({stamp, controlSeconds: control.seconds, prepared: true, deskPreserved: true}));
