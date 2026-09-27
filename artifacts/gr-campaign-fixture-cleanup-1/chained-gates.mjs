// Measure every original chained leg even though the first full-battery leg failed.
// These independent receipts do not change the original npm command's red verdict.
import { readFileSync } from 'node:fs';
import { runBattery } from '../../scripts/gate-battery.mjs';
const command = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).scripts['test:node-guards'];
const jobs = command.split(' && ').slice(1).map((leg, index) => [`original chained leg ${index + 2}`, '/bin/sh', '-c', leg]);
if (jobs.length === 0) throw new Error('Expected the original chained checks');
process.exitCode = runBattery(jobs, { transcript: 'artifacts/gr-campaign-fixture-cleanup-1/chained-gates.txt', label: 'independent receipts for skipped original npm legs' }).overall;
