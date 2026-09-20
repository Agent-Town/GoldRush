import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
let t = fs.readFileSync(p, 'utf8');

const key =
  '**GATE: none owed to the owner. Closes when the two `townResponseBytes` sites either measure the same thing or are renamed so they cannot be confused,';
if (!t.includes(key)) throw new Error('F-1620-7 gate anchor missing');

const build = '891edb' + '2c3';
const add =
  '📈 **STRENGTHENED s1620, MEASURED BY THIS FIRE’S OWN DEPLOY — IT IS THREE INSTRUMENTS, NOT TWO, AND THE THIRD IS THE ONE THAT GATES RELEASES.** ' +
  '`scripts/deploy.sh` runs its own **first-town asset budget** check against the **same 25,000,000 ceiling** — its printed headroom sums to exactly 25,000,000, so the ceiling is identical, not merely similar — and reported **desktop 16,174,837 (8,825,163 headroom) · mobile 15,218,288 (9,781,712 headroom)** on the very build published as `' + build + '`. ' +
  '⚠️ **So MOBILE now has three different answers to one question: 12,932,580 (throttled-cues test) · 15,218,288 (deploy gate) · 22,469,519 (the new A/B normal arm) — a spread of 9.5 MB against a 25 MB ceiling.** ' +
  '🎯 **This is what raises the finding from tidy-up to load-bearing: the deploy figure is the one that can BLOCK A RELEASE, and it is the second-most optimistic of the three.** If the A/B arm is the honest measure of what a traveller actually pulls, the release gate is passing builds with **~2.5 MB** of real headroom while reporting **~9.8 MB**. ' +
  'ℹ️ **Stated as the open question it is, not as a verdict:** the three may legitimately measure different scopes (throttled partial load · built-bundle static budget · full navigated walk), and **this fire did NOT establish which is right** — only that three named instruments answer one named ceiling differently and nothing reconciles them. ';

t = t.replace(key, add + key);
fs.writeFileSync(p, t);
console.log('F-1620-7 strengthened with the deploy-gate third instrument');
