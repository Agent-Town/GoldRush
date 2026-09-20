/**
 * s1230-guard-mutation.mjs — does scripts/site-contract.test.mjs have teeth?
 *
 * A guard that has never been shown to FAIL is an unread verdict. Mutate the
 * SUBJECTS (never the guard), one arm per assertion, and require a red. Arm 3 is
 * the load-bearing one: it breaks the PRODUCER (functions/api/stats.ts) while
 * leaving site/ untouched, which is the case a `site/**` path rule would miss
 * entirely and the reason this guard is always-on.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = ['site/assay-office.js', 'site/index.html', 'functions/api/stats.ts'];
const ORIGINAL = new Map(FILES.map((f) => [f, readFileSync(f)]));
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const SHA = new Map(FILES.map((f) => [f, sha(f)]));

const ARMS = [
  {
    name: '1 syntax error in the loaded script',
    file: 'site/assay-office.js',
    from: "const numberFormatter = new Intl.NumberFormat('en-US');",
    to: 'const numberFormatter = ;',
    expect: 'parses under the grammar',
  },
  {
    name: '2 page loads a script that does not exist',
    file: 'site/index.html',
    from: '<script defer src="assay-office.js"></script>',
    to: '<script defer src="assay-office-renamed.js"></script>',
    expect: 'actually exists',
  },
  {
    name: '3 PRODUCER drifts (site/ untouched)',
    file: 'functions/api/stats.ts',
    from: "'10-20m', '20mplus'] as const;",
    to: "'10-20m', '20mplus', '60mplus'] as const;",
    expect: 'duration vocabulary',
  },
  {
    name: '4 CONSUMER drifts',
    file: 'site/assay-office.js',
    from: "  '20mplus': '20 min+',",
    to: "  '20minplus': '20 min+',",
    expect: 'duration vocabulary',
  },
];

function restoreAll() {
  for (const f of FILES) writeFileSync(f, ORIGINAL.get(f));
  for (const f of FILES) {
    if (sha(f) !== SHA.get(f)) throw new Error(`RESTORE FAILED for ${f}`);
  }
}

let allProved = true;
try {
  for (const arm of ARMS) {
    const src = ORIGINAL.get(arm.file).toString('utf8');
    if (!src.includes(arm.from)) throw new Error(`arm "${arm.name}": anchor not found in ${arm.file}`);
    writeFileSync(arm.file, src.replace(arm.from, arm.to));
    const run = spawnSync(process.execPath, ['--test', 'scripts/site-contract.test.mjs'], { encoding: 'utf8' });
    const out = `${run.stdout ?? ''}${run.stderr ?? ''}`;
    const red = run.status !== 0;
    const rightTest = out.includes(arm.expect);
    // A red is not enough: it has to be the assertion this arm targets.
    const proved = red && rightTest;
    if (!proved) allProved = false;
    console.log(
      `${proved ? 'PROVED' : 'WEAK  '}  rc=${run.status}  ${arm.name}  ` +
        `(targets "${arm.expect}": ${rightTest ? 'yes' : 'NO'})`,
    );
    restoreAll();
  }
} finally {
  restoreAll();
}

console.log(`\nall four arms proved: ${allProved}`);
console.log('restored sha:');
for (const f of FILES) console.log(`  ${sha(f)}  ${f}`);
process.exit(allProved ? 0 : 1);
