#!/usr/bin/env node
// s1154 — behavioural proof for the F-1154-1 runner fix.
// Reproduces the real conditions in a throwaway repo: debris left STAGED by a
// departed session, then an art run that stages only its own paths.
// ARM A = the old code path (scoped add, BARE commit).
// ARM B = the new code path (scoped add, scoped COMMIT).
// The claim under test is that the pathspec on the COMMIT is what stops the leak.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const d = '/tmp/s1154-commit-proof';
fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(`${d}/assets`, { recursive: true });
fs.mkdirSync(`${d}/.wrangler/tmp`, { recursive: true });
const R = (c) => execSync(c, { cwd: d, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

R('git init -q'); R('git config user.email a@b.c'); R('git config user.name t');
fs.writeFileSync(`${d}/seed.txt`, 'x'); R('git add seed.txt'); R('git commit -qm seed');

function setupScenario() {
  fs.mkdirSync(`${d}/.wrangler/tmp`, { recursive: true });
  fs.mkdirSync(`${d}/assets`, { recursive: true });
  fs.writeFileSync(`${d}/.wrangler/tmp/bundle.js`, 'debris');
  R('git add -A -- .wrangler');            // stale index, staged by someone else
  fs.writeFileSync(`${d}/assets/portrait.png`, 'art');
  R('git add -A -- assets');               // the runner's own, correctly scoped add
}

setupScenario();
console.log('staged going into the art commit:', R('git diff --cached --name-only').split('\n').join(', '));

R('git commit -qm "runner(art): old"');
const armA = R('git show --name-only --format= HEAD').split('\n').filter(Boolean);
console.log('\nARM A  bare commit          ->', armA.length, 'files:', armA.join(', '));

R('git reset -q --hard HEAD~1');
setupScenario();
R('git commit -qm "runner(art): new" -- assets');
const armB = R('git show --name-only --format= HEAD').split('\n').filter(Boolean);
console.log('ARM B  commit -- assets     ->', armB.length, 'files:', armB.join(', '));

const leakedA = armA.some((f) => f.startsWith('.wrangler'));
const leakedB = armB.some((f) => f.startsWith('.wrangler'));
const artA = armA.some((f) => f.startsWith('assets/'));
const artB = armB.some((f) => f.startsWith('assets/'));

console.log('\ndebris leaked:  old =', leakedA, '| new =', leakedB);
console.log('art preserved:  old =', artA, '| new =', artB);
console.log(
  leakedA && !leakedB && artB
    ? '\nPROOF PASS — the pathspec on the COMMIT is what stops the leak, and the art still lands.'
    : '\nPROOF FAILED — rethink the fix.',
);
