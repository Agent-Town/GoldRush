// s1591: insert the f1591-1 goal leaf textually, preserving goals.json's existing
// 2-space / \u-escaped formatting. A full JSON.stringify round-trip reformats all
// 6,494 lines and buries the one-leaf change (caught before committing).
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/goals.json';
const lines = readFileSync(p, 'utf8').split('\n');

const closeIdx = 4636; // 0-indexed: the "}," closing the f1590-1 leaf
if (lines[closeIdx].trim() !== '},') throw new Error('unexpected close line: ' + JSON.stringify(lines[closeIdx]));
if (!lines[closeIdx - 1].includes('1dab43b6f3af05757b015c28527b5b309f28a809')) throw new Error('wrong leaf anchor');

const esc = (s) => JSON.stringify(s).replace(/[-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const I = ' '.repeat(14);

const gate =
  'none - fire-authorable from F-1590-2, handed forward by the s1590 drain of f1590-1. Fourth attempt at F-1587-2, ' +
  'lawful under the changed-premise rule because the MEASURED QUANTITY changed on a source derivation: Loop.ts:27 ' +
  'clamps presentation delta at MAX_PRESENTATION_DELTA_SECONDS = 0.05, Loop.ts:121 feeds that clamped value to update ' +
  'on the variable-step path, TownScene.ts:453 constructs its Loop with no options so it takes that path, and ' +
  'TownScene.ts:679 accumulates it into elapsed. Therefore elapsed gains at most 0.05 per presented frame, elapsed > 4 ' +
  'needs at least 81 presented frames, and the 30 s cap at beauty-town.spec.ts:247 becomes a cliff at ~2.7 fps ' +
  'sustained. Above 20 fps the wait is insensitive to frame rate entirely, which is why eight isolated repetitions ' +
  'across three tasks all landed in the 4-6 s band and told nobody anything. Instrument already exists: ' +
  'TownDiagnostics publishes frame and elapsed (TownScene.ts:243-244, written :2537-2539), so the ratio is measurable ' +
  'with no spec edit. MEASUREMENT ONLY - ships no cure by construction.';

const block = [
  '            {',
  I + '"id": ' + esc('f1591-1-frame-supply-cliff') + ',',
  I + '"title": ' + esc('F-1591-1: F-1587-2 is a FRAME-SUPPLY defect - measure the 0.05 clamp law and find the ~2.7 fps cliff') + ',',
  I + '"status": ' + esc('queued') + ',',
  I + '"taskFile": ' + esc('lane-b-f1591-1-frame-supply-cliff.md') + ',',
  I + '"gate": ' + esc(gate),
  '            },',
];

lines.splice(closeIdx + 1, 0, ...block);
writeFileSync(p, lines.join('\n'));
console.log('inserted ' + block.length + ' lines after the f1590-1 leaf');
