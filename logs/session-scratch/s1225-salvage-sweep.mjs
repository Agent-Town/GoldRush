// s1225 — SALVAGE LIFECYCLE check (fire.md §2E): "save/<name> = re-land pending (counts as
// waiting); when its re-land MERGES, rename to archive/<name> in the SAME fire — archives
// never count as waiting."  A save/* whose content already landed is a Ghost Line (Mistake #5).
//
// Commit-count ahead-ness is not the test (tip-grafts read false-ahead), so this compares
// CONTENT: for each ahead commit, is every file it touched byte-identical on main?
import { execFileSync } from 'child_process';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim();

const branches = git('for-each-ref', '--format=%(refname:short)', 'refs/heads/save')
  .split('\n').filter(Boolean);

const results = [];
for (const b of branches) {
  const ahead = git('rev-list', '--count', `main..${b}`);
  if (ahead === '0') continue;
  const base = git('merge-base', 'main', b);
  // files this branch touched since diverging
  const files = git('diff', '--name-only', `${base}..${b}`).split('\n').filter(Boolean);
  let identical = 0, differing = [];
  for (const f of files) {
    const onBranch = (() => { try { return git('rev-parse', `${b}:${f}`); } catch { return null; } })();
    const onMain = (() => { try { return git('rev-parse', `main:${f}`); } catch { return null; } })();
    if (onBranch && onMain && onBranch === onMain) identical++;
    else differing.push(f);
  }
  results.push({ branch: b, ahead: Number(ahead), touched: files.length, identical, differing });
}

results.sort((x, y) => x.differing.length - y.differing.length);
for (const r of results) {
  const verdict = r.differing.length === 0
    ? 'GHOST LINE — content fully on main, owes rename save/ -> archive/'
    : 'LIVE — carries content not on main';
  console.log(`${r.branch}\n  ${r.ahead} ahead · ${r.touched} files touched · ${r.identical} byte-identical on main · ${r.differing.length} differing\n  ${verdict}`);
  if (r.differing.length && r.differing.length <= 8) {
    for (const f of r.differing) console.log(`      differs: ${f}`);
  }
}
console.log(`\n${results.length} save/* refs ahead of main · ${results.filter((r) => !r.differing.length).length} are ghost lines`);
