// Mutation probe (milk/twin-sockets). A guard written and greened in the same minute has never
// executed its violation path. Each mutation below breaks ONE load-bearing claim; the spec that
// claims it must go red. Every file is restored byte-for-byte and verified by sha256.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const sha = (path) => createHash('sha256').update(readFileSync(`${ROOT}/${path}`)).digest('hex').slice(0, 16);

const MUTATIONS = [
  {
    name: 'E6: exhausted machines stay hostile (breaks the F-ER01-E6-5 demonstration)',
    file: 'src/sim/AtomicSocket.ts',
    from: '    return !this.wrangle.isHarmless(enemy);',
    to: '    return true;',
    spec: 'e2e/er01-e6-census.spec.ts',
  },
  {
    name: 'E6: socket built for every epoch (breaks the epoch gate)',
    file: 'src/sim/AtomicSocket.ts',
    from: "    return epoch?.id === 'epoch-6-atomic' ? new AtomicSocket(epoch.id, contract, events, enemies, economy) : null;",
    to: "    return new AtomicSocket(epoch?.id ?? 'unknown', contract, events, enemies, economy);",
    spec: 'e2e/er01-e6-census.spec.ts',
  },
  {
    name: 'E6: capture-unreachable rule dropped from the manifest',
    file: 'src/agent/MechanicsManifest.ts',
    from: "    rules.push(rule('wrangle_capture_unreachable', 'AgentGameAdapter', {",
    to: "    if (false as boolean) rules.push(rule('wrangle_capture_unreachable', 'AgentGameAdapter', {",
    spec: 'e2e/er01-e6-census.spec.ts',
  },
  {
    name: 'E5: refused boss handoffs silently skipped instead of counted',
    file: 'src/sim/DeepwaterSocket.ts',
    from: '    if (wave.wave >= bossWave) this.bossHandoffsRefused += 1;',
    to: '    if (false) this.bossHandoffsRefused += 1;',
    spec: 'e2e/er01-e5-census.spec.ts',
  },
  {
    // The reject-don't-stretch failure this census exists to catch: the three variants carry
    // `tileParams.deepwater` too, so dropping the contract gate would hand them the flagship's
    // vocabulary while their own consumers still do not exist.
    name: 'E5: deepwater vocabulary leaked onto the three variants',
    file: 'src/agent/MechanicsManifest.ts',
    from: "  const deepwater = contract.id === 'e5-deepwater-claim' ? tile.deepwater : undefined;",
    to: '  const deepwater = tile.deepwater;',
    spec: 'e2e/er01-e5-census.spec.ts',
  },
];

const run = (spec) => spawnSync(
  'npx',
  ['playwright', 'test', spec, '--workers=1', '--project=desktop-chrome', '--reporter=line'],
  { cwd: ROOT, encoding: 'utf8', timeout: 900_000 },
);

let allBit = true;
for (const mutation of MUTATIONS) {
  const before = readFileSync(`${ROOT}/${mutation.file}`, 'utf8');
  const beforeHash = sha(mutation.file);
  if (!before.includes(mutation.from)) {
    process.stdout.write(`  ANCHOR-MISS | ${mutation.name}\n`);
    allBit = false;
    continue;
  }
  writeFileSync(`${ROOT}/${mutation.file}`, before.replace(mutation.from, mutation.to));
  const result = run(mutation.spec);
  writeFileSync(`${ROOT}/${mutation.file}`, before);
  const restored = sha(mutation.file) === beforeHash;
  const bit = result.status !== 0;
  if (!bit) allBit = false;
  process.stdout.write(
    `  ${bit ? 'BIT   ' : 'SILENT'} | restored=${restored ? 'byte-identical' : 'DIRTY'} | ${mutation.name}\n`,
  );
  if (!bit) process.stdout.write(`           spec passed anyway — the assertion does not cover this\n`);
}
process.stdout.write(allBit ? '\nALL MUTATIONS BIT\n' : '\nSOME MUTATIONS WERE SILENT\n');
