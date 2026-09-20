// s1662 drain: merge f1660-1 onto main.
// §3.0b — merge and commit as ONE act; never leave a merge staged on main.
// The null-floors corrective (F-1662-1) follows as its own path-scoped commit,
// because a merge commit must not carry a drainer's separate concern.
import { execFileSync } from 'node:child_process';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1e8 });

console.log('main before:', git('rev-parse', '--short', 'HEAD').trim());
const dirty = git('status', '--porcelain', '--', 'src', 'e2e', 'scripts', 'public', 'docs', 'assets', 'package.json').trim();
if (dirty) { console.log('REFUSING — tracked gate-path dirt on main:\n' + dirty); process.exit(1); }

const msg = [
  'fix: f1660-1 — restore the F-E2S-3 de-list as cited exemptions and ratchet the door',
  '',
  'An owner ruling of 2026-08-09 (F-E2S-3, "de-list now, socket later", shipped as',
  'f1605-1 at 312b443f1) was silently reversed on main for ~15 hours: 6f74bf510 replaced',
  'the SUPPORTED_CONTRACTS literal with a derivation and did not carry the three E2',
  'railcars into the new CONTRACT_ADMISSION_EXEMPTIONS table, so the door re-admitted',
  'e2-hill-mine/e2-trestle/e2-incline modelessly. The prior policy lived in a code',
  'comment inside the literal, and a comment does not survive a derivation.',
  '',
  'Restores the three as cited exemptions (F-E2S-3), restores the three inverted',
  'er01-e2-census refusal arms, re-derives the public skill.md door fence (22 -> 19),',
  'regenerates the same-game audit, asserts BOTH directions of the AP-16 mode rule for',
  'every mode-declaring contract (registry-derived, e3-canyon-works a named exception),',
  'and adds a fixed-denominator baseline ratchet so a future derivation cannot drop a',
  'ruling silently.',
  '',
  'Gates on the merged tree (detached worktree gate-s1662b, ort, zero conflicts):',
  'tsc clean; build green (8.76s, 2186 modules); er01-e2-census + ap16-4-contract-admission',
  'desktop 5/5 (2.0m) and mobile-390px 5/5 (1.6m) at --workers=1; skillmd-guard 5/5',
  'untouched; door-admission-ratchet 1/1 and re-proven to BITE by manufacturing the defect;',
  'gr-sim.test.mjs green. Door probe: e2-hill-mine refused modeless (AP-07 throw), admitted',
  'with --mode=escort.',
  '',
  'Review: reviews/f1660-1-door-readmission-repair.md',
].join('\n');

try {
  console.log(git('merge', '--no-ff', 'lane/b', '-m', msg));
} catch (e) {
  console.log('STDOUT:\n' + (e.stdout || '') + '\nSTDERR:\n' + (e.stderr || ''));
  throw e;
}
const head = git('rev-parse', 'HEAD').trim();
console.log('MERGE COMMIT (full):', head);
console.log('short:', head.slice(0, 9));
console.log('--- status ---\n' + (git('status', '--short').trim() || '(clean)'));
