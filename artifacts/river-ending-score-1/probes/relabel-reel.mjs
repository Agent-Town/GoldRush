// Supplementary control (not the produced reel): the same River reel with its contract relabelled to the world it rode
// (`the-claim`), so the browser arm replays the recorded inputs on the Claim's tile and seams. Written beside the original.
import { readFileSync, writeFileSync } from 'node:fs';
const [input, output] = process.argv.slice(2);
const reel = JSON.parse(readFileSync(input, 'utf8'));
const relabelled = { ...reel, contract: 'the-claim', inputLog: { ...reel.inputLog, contractId: 'the-claim' } };
writeFileSync(output, `${JSON.stringify(relabelled, null, 2)}\n`);
console.log(JSON.stringify({ id: relabelled.id, contract: relabelled.contract, durationTicks: relabelled.inputLog.durationTicks, outcome: relabelled.outcome }));
