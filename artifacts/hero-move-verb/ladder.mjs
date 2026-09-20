/**
 * hero-move-verb: the Ember Shore ladder. One seed, one ride per rung, both arms at three defence
 * budgets, so "what does the kite buy" is a table rather than an opinion. The prover file is the
 * same for both arms; only `--kite` and `--defence` change.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const rows = [];
for (const defence of [0, 2, 6]) {
  for (const kite of [false, true]) {
    const argv = ['artifacts/hero-move-verb/prover.mjs', '--seed', 'e10-ember-shore-01',
      '--defence', String(defence), '--runs', '1'];
    if (kite) argv.push('--kite');
    const run = spawnSync(process.execPath, argv, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    if (run.status !== 0) throw new Error(`rung failed: ${argv.join(' ')}\n${run.stderr}`);
    const report = JSON.parse(run.stdout);
    const outcome = report.runs[0].outcome;
    rows.push({ arm: report.arm, defence, kite, secured: outcome.secured, waves: outcome.waves,
      seconds: outcome.timeMs / 1000, gold: outcome.gold, kills: outcome.kills,
      eventLogHash: outcome.eventLogHash });
  }
}
writeFileSync(new URL('./ladder.json', import.meta.url), `${JSON.stringify({ contract: 'e10-ember-shore', seed: 'e10-ember-shore-01', rows }, null, 2)}\n`);
for (const row of rows) {
  process.stdout.write(`${row.secured ? 'SECURED' : 'lost   '} wave ${String(row.waves).padStart(2)} t=${row.seconds.toFixed(1).padStart(6)}s kills ${String(row.kills).padStart(3)}  ${row.arm}\n`);
}
