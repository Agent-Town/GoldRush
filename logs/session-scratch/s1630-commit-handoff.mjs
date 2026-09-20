import { execFileSync } from 'node:child_process';

const R = '/Users/robin/Claude/Projects/Gold Rush';
execFileSync('git', ['add', 'STATUS.md'], { cwd: R });

const msg = [
  's1630 handoff: f1628-3 DRAINED 1197a9612 — six reds cured by one fixture-only file; the >= 22 threshold two ledgers told me to protect is a RUNTIME value, not source text; F-1630-1 filed AND its corrective dispatched to lane-a',
  '',
  'Drain: 1 (f1628-3). Authored: 1 (f1630-1, dispatched lane-a — cap was ONE because I drained).',
  'Duties all VERIFIED not assumed: GZ-01 sweep 67/67 cited, 0 uncited; TK-01 not owed (read the',
  'digest header); deploy skipped (test-only merge); assayer 0; ART untouched.',
  '',
  'The reusable lesson is the citation one: grep 22 over the spec returns nothing on main or the',
  "lane, because the protected assertion is baseHits * 2 at :201 and 22 was one control run's",
  'arithmetic. A fire auditing that firewall by grepping the forbidden constant would read 0 hits',
  'as a DELETED assertion and reject a clean slice. Cite by expression, never by its arithmetic.',
  '',
  'And my own draft cited it at :200 when it is :201 — caught before dispatch by measuring rather',
  'than trusting the draft, in the same fire that spent its drain documenting citation rot.',
].join('\n');

execFileSync('git', ['commit', '-m', msg], { cwd: R });
console.log('handoff committed:', execFileSync('git', ['log', '-1', '--format=%h'], { encoding: 'utf8', cwd: R }).trim());
