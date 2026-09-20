#!/usr/bin/env node
/**
 * s1533 scratch — are the 26 "OPEN owner-desk row, absent from the live desk"
 * candidates actually LIVE, or are they closed elsewhere in the ledger?
 *
 * Uses findings-state-guard's EXPORTED scan() rather than a second
 * implementation of "closed" (F-1261-1: there is one implementation, and
 * a re-implementation disagreed with the original on 4 of 14 rows).
 */
import fs from 'node:fs';
import { scan } from '../../../scripts/findings-state-guard.mjs';

const ROOT = process.cwd();
const backlogText = fs.readFileSync(`${ROOT}/tasks/BACKLOG.md`, 'utf8');
const lines = backlogText.split('\n');

const narrow = scan(backlogText);
const wide = scan(backlogText, { closedVocabulary: 'wide' });

const CANDIDATES = [
  ['F-1279-2', 930], ['F-1285-4', 989], ['F-1284-1', 991], ['F-1252-1', 1093],
  ['F-1242-1', 1095], ['F-1225-1', 1129], ['F-1180-3', 1143], ['F-1179-4', 1157],
  ['F-1167-3', 1187], ['F-1173-2', 1249], ['F-1170-2', 1268], ['F-1113-5', 2658],
  ['F-1329-1', 2956], ['F-1332-2', 2968], ['F-1331-4', 2972], ['F-1328-3', 2974],
  ['F-1334-2', 2976], ['F-1120-2', 2977], ['F-1193-2', 2978], ['F-1193-3', 2979],
  ['F-1204-1', 2980], ['F-1208-3', 2982], ['F-1209-3', 2983], ['F-1254-3', 2984],
  ['F-1182-2', 2985], ['F-1335-2', 2987], ['F-1368-1', 2998], ['F-1096-2', 1428],
];

let live = 0;
for (const [id, row] of CANDIDATES) {
  const n = narrow.get(id) || { open: [], closed: [] };
  const w = wide.get(id) || { open: [], closed: [] };
  const closedAnywhere = w.closed.length > 0;
  if (!closedAnywhere) live++;
  console.log(
    `${id.padEnd(10)} row:${String(row).padEnd(5)} ` +
      `narrow[open:${n.open.join(',') || '-'} closed:${n.closed.join(',') || '-'}] ` +
      `wide-closed:[${w.closed.join(',') || '-'}]  => ${closedAnywhere ? 'CLOSED-somewhere' : 'LIVE'}`,
  );
}
console.log('');
console.log(`candidates: ${CANDIDATES.length} · no closure row anywhere: ${live}`);
