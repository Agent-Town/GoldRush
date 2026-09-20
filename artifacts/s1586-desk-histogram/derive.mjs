import fs from 'node:fs';
import { deskItems, deskTail } from '../../scripts/desk-carryforward-guard.mjs';

const lines = fs.readFileSync(new URL('../../STATUS.md', import.meta.url), 'utf8').split('\n');
const historicalLine1 = lines.filter((line, index) =>
  index === 0 || /^- \*\*s\d+ (?:handoff \(line-1 archive\)|lock line \(archived\))/.test(line),
);
const counted = historicalLine1.flatMap((line) => {
  const tail = deskTail(line);
  const declared = tail?.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/)?.[1];
  if (declared === undefined) return [];
  const session = line.match(/\bs(\d+)\b/)?.[1] ?? 'live';
  const keyed = deskItems(tail).length;
  return [{ session: `s${session}`, declared: Number(declared), keyed, delta: Number(declared) - keyed }];
});

const histogram = new Map();
for (const { delta } of counted) histogram.set(delta, (histogram.get(delta) ?? 0) + 1);
const recent = counted.slice(0, 25);
const refused = recent.filter(({ delta }) => Math.abs(delta) > 1);

console.log(`counted desks: ${counted.length}`);
console.log('histogram:', [...histogram].sort(([a], [b]) => a - b).map(([delta, n]) => `${delta >= 0 ? '+' : ''}${delta}:${n}`).join(' '));
console.log(`last 25 refused at +/-1: ${refused.length}`);
for (const desk of refused) console.log(`${desk.session}: declared=${desk.declared} keyed=${desk.keyed} delta=${desk.delta}`);
