import fs from 'node:fs';

const P = 'STATUS.md';
const s = fs.readFileSync(P, 'utf8');
const marker = '- **s1314 lock (line-1 archive):**';
const i = s.indexOf(marker);
if (i === -1) {
  console.log('s1314 lock archive bullet NOT FOUND — abort, nothing written');
  process.exit(2);
}
const end = s.indexOf('\n', i);
const note =
  '\n- **s1314 tree note (honest churn accounting):** working tree left with **70 dirty paths — `artifacts/` 56, `reviews/` 8, `logs/` 6**, all of it generated, none of it source. The `artifacts/**` bulk is the standing inherited churn (carried owner keep-or-revert item, F-1120-2 family). ⚠️ **8 `reviews/shots-*` PNGs are NEW this fire and are MINE** — Playwright rewrites them on every run, and I ran `m2-05-base-damage-repair`, `run-suspend`, `build-placement-pure`, `m2-04-gold-stealing`, `bt-01-tiers` and `trail-guide-plain-boot` as the drain battery, so `shots-m2-05/` (5) plus `shots-ap-06b-adapter-reland/` and `shots-e2-rail-tough-only-bind/` (3) moved as a side effect of gating, not as evidence I authored. Left uncommitted deliberately, consistent with every prior fire; recorded here so the next fire does not read them as someone\'s unsaved work. **Zero `src/`, zero `e2e/`, zero `tasks/` dirt — every probe I ran restored its subject byte-exact (sha256 MATCH on all four).**';

fs.writeFileSync(P, s.slice(0, end) + note + s.slice(end));
console.log('tree note appended');
