// s1606 — land lane/b on main as ONE act: `git merge --no-ff` WITH its message, never
// `--no-commit` followed by review-writing. F-1589-5 measured the cost of the staged window:
// a concurrent agent swept an entire staged merge into an unrelated commit ninety seconds later,
// and had that gate gone red the rejected content would have shipped anyway.
import { spawnSync } from 'node:child_process';

const msg = [
  'f1605-1: de-list the three E2 railcar contracts from the AP-07 headless door (F-E2S-3 owner ruling 2026-08-09)',
  '',
  'e2-hill-mine / e2-trestle / e2-incline leave SUPPORTED_CONTRACTS until the era-true',
  'pressure-to-damage socket slice lands; public/skill.md door block re-derived to match;',
  'the four tests whose subjects left the door settled rather than deleted.',
  '',
  'Gated on the MERGED tree in a detached worktree (fire.md 3.0b), gate-s1606 @ 7e4e97d84:',
  '  tsc --noEmit clean; npm run build green (1.05s)',
  '  skill-md-door-guard + gr-sim: 16 tests, 14 pass, 0 fail, 2 skipped',
  '  er01-e2-census: 4/4 desktop-chrome and 4/4 mobile-chrome at --workers=1',
  '  test:node-guards (curated 79-file list): 425 tests, 420 pass, 0 fail, 5 skipped, 429s',
  '  merge: ort, zero conflicts, 4 files +15/-8',
  '',
  'Both new gr-sim skips carry NAMED causes citing F-E2S-3 and the restore path, which is',
  'what s1605 asked the drain to check; neither is a bare skip.',
].join('\n');

const r = spawnSync('git', ['merge', '--no-ff', 'lane/b', '-m', msg], { stdio: 'inherit' });
console.log(`[merge-main] rc=${r.status}`);
process.exit(r.status ?? 1);
