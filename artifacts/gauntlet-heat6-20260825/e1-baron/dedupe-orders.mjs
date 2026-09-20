import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [sourcePath, targetPath] = process.argv.slice(2);
const tape = JSON.parse(readFileSync(sourcePath, 'utf8'));
for (const entry of tape.inputLog.entries) for (const action of entry.a) {
  action.orders = action.orders.filter((order, index, orders) => index === 0
    || order.verb !== 'BLAST_AT'
    || JSON.stringify(order) !== JSON.stringify(orders[index - 1]));
}
tape.id = `agent-${randomUUID()}`;
writeFileSync(targetPath, `${JSON.stringify(tape)}\n`);
console.log(JSON.stringify({ id: tape.id, entries: tape.inputLog.entries.length, bytes: JSON.stringify(tape).length }));
