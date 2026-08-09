// s1600 — the GZ-01 standing sweep, run with the CORRECTED check (F-1600-1):
// short hash, across the whole of marketing/outbox/. Lists what is genuinely unreported.
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const SINCE = process.argv[2] || '2026-08-05';
const PLAYER_PATHS = /^(src\/|functions\/|public\/|index\.html)/; // e2e/ dropped: tests are not player-facing

const outboxDir = 'marketing/outbox';
const outbox = readdirSync(outboxDir).filter((f) => f.endsWith('.md'))
  .map((f) => readFileSync(`${outboxDir}/${f}`, 'utf8')).join('\n');

const shas = execSync(`git log main --first-parent --since=${SINCE} --format=%H`, {
  encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
}).trim().split('\n').filter(Boolean);

const absent = [];
for (const sha of shas) {
  const short = sha.slice(0, 8);
  if (outbox.includes(short) || outbox.includes(sha)) continue;
  const paths = execSync(`git show ${sha} --first-parent --name-only --format=`, {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }).trim().split('\n').filter(Boolean);
  const player = paths.filter((p) => PLAYER_PATHS.test(p));
  if (!player.length) continue;
  const subj = execSync(`git log -1 --format=%s ${sha}`, { encoding: 'utf8' }).trim();
  // does a review file exist naming this slice? (the OLD filter — reported, not applied)
  const hasReview = existsSync('reviews') && readdirSync('reviews')
    .some((f) => f.endsWith('.md') && readFileSync(`reviews/${f}`, 'utf8').includes(short));
  absent.push({ short, subj, n: player.length, player: player.slice(0, 4), hasReview });
}

console.log(`genuinely absent from the WHOLE outbox, touching src/|functions/|public/: ${absent.length}\n`);
for (const a of absent) {
  console.log(`${a.short}  [${a.n} player path(s)]${a.hasReview ? ' [review]' : ''}  ${a.subj.slice(0, 100)}`);
  console.log(`          ${a.player.join(', ')}`);
}
