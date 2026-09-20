// s1468 F-1425-2: prove a citation key BEFORE writing it into a master.
// grep is line-oriented and prose wraps — a key spanning a line break matches NOWHERE,
// including in the file it was copied from. Keys live in a FILE, never a shell-quoted probe.
import { readFileSync } from 'node:fs';

const CANDIDATES = [
  ["docs/bench/e3-readiness-census.md", "Moth Season's light choice disappears headlessly"],
  ["docs/bench/e3-readiness-census.md", "rather than treating generic combat as Moth Season"],
  ["docs/bench/e3-readiness-census.md", "AGENT-READY: 1 of 4"],
  ["src/sim/HeadlessContractSim.ts", "MothSwarm"],
  ["src/systems/MothSwarm.ts", "export class MothSwarm"],
];

for (const [file, key] of CANDIDATES) {
  let n = 0, wraps = false;
  try {
    const lines = readFileSync(file, 'utf8').split('\n');
    n = lines.filter(l => l.includes(key)).length;
    wraps = key.includes('\n');
  } catch (e) { console.log(`${file}: UNREADABLE ${e.message}`); continue; }
  console.log(`${n === 1 ? 'OK  ' : 'BAD '} count=${n}  ${file}  <<${key}>>`);
}
