// s2673 — WHY did status-archive-audit burn nine minutes for s2670 when its battery leg
// answers in 5.8 s? Price the walk instead of guessing at it.
//
// Reads only. Two questions:
//   1. what does one examined commit cost, and how does that scale to the 5,857-commit
//      unbounded walk the bare invocation performs;
//   2. does the walk read the SAME blob twice? parentBlob(i) and childBlob(i+1) are the
//      same sha whenever consecutive STATUS.md commits are parent and child, and a
//      one-entry memo would then halve the `git show` count.
import { execFileSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const git = (args) =>
  execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

const commits = git(['log', '--format=%H', '--', 'STATUS.md']).trim().split('\n').filter(Boolean);
console.log('STATUS.md commits in history:', commits.length);

// --- question 2: how often is a blob read twice, over the first 300 commits ---
const shasRead = [];
let sampled = 0;
for (const sha of commits) {
  if (sampled >= 300) break;
  const parents = git(['log', '-1', '--format=%P', sha]).trim().split(/\s+/).filter(Boolean);
  if (parents.length !== 1) continue;
  sampled++;
  shasRead.push(parents[0], sha);
}
const unique = new Set(shasRead).size;
console.log(`blob reads over ${sampled} examined commits: ${shasRead.length}, unique: ${unique}`);
console.log(`  duplicate reads a 1-entry memo could serve: ${shasRead.length - unique}`);

// --- question 1: what does a single blob read actually cost? ---
const t0 = Date.now();
let bytes = 0;
for (let i = 0; i < 20; i++) bytes += git(['show', `${commits[i]}:STATUS.md`]).length;
const ms = Date.now() - t0;
console.log(`20 blob reads: ${ms} ms total, ${(ms / 20).toFixed(1)} ms each, ${(bytes / 20 / 1e6).toFixed(1)} MB each`);
console.log(`projected unbounded walk (2 reads x ${commits.length} commits): ${((ms / 20 * 2 * commits.length) / 1000 / 60).toFixed(1)} min`);
console.log(`  with a 1-entry memo (1 read per commit):                    ${((ms / 20 * 1 * commits.length) / 1000 / 60).toFixed(1)} min`);
