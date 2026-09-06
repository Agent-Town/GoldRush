/**
 * F-E10S4-3 — A REPLAY MUST NOT DESTROY THE RECORDING IT REPLAYS.
 *
 * `scripts/gr-sim.mjs` used to choose its output tape with `options.tape ?? options.resume`, so a
 * bare `gr-sim --resume ride.tape.json` wrote the new recording straight over its own input. The
 * E10S-4 drain found it by tripping it, and worked around it for the rest of that slice by passing a
 * scratch `--tape` on every single invocation — a convention, not a mechanism, and the next caller
 * who forgot it would have lost the tape. The cure: a resume with no `--tape` writes the SIBLING
 * `<stem>.resumed<ext>` (`resumedTapePath`), and an explicit `--tape` still wins.
 *
 * 🔬 THE NON-VACUITY CONTROL, because "the input is unchanged" is worthless on its own here: a
 * resumed idle ride reproduces its input BYTE FOR BYTE (measured — same sha256), so under the OLD
 * overwriting code the input's bytes would ALSO have compared equal and this guard would have passed
 * on the defect it exists to catch. So the input is deliberately re-serialised at FOUR-space
 * indentation before the resume — semantically the same tape, textually distinct from anything
 * gr-sim writes (it writes two-space). An overwrite is then visible as a changed file, and arm 1
 * asserts the four-space bytes survive while arm 2 asserts the sibling carries the canonical
 * two-space recording. Both halves are checked, so neither can rot into a tautology.
 *
 * ⚙️ COST: one idle recording plus three resumes of it, ~2.5 s each on this Mac (`--policy=idle`
 * needs no stdin and `e1-dry-gulch`/`bench-001` is the cheapest ride in `gr-sim.test.mjs`). The real
 * binary is driven rather than the helper imported, because `gr-sim.mjs` runs its CLI at import time
 * — and driving it is the stronger evidence anyway: it measures the files that land on disk.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function grSim(args) {
  const run = spawnSync(process.execPath, ['scripts/gr-sim.mjs', ...args], {
    cwd: ROOT, encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL',
  });
  assert.equal(run.status, 0, `gr-sim ${args.join(' ')} failed:\n${run.stderr}`);
  return run;
}

test('a resume with no --tape writes a sibling and never over the recording it replays', { timeout: 300_000 }, (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'gr-sim-resume-safety-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const input = join(directory, 'ride.tape.json');
  const sibling = join(directory, 'ride.tape.resumed.json');
  grSim(['--contract', 'e1-dry-gulch', '--seed', 'bench-001', '--policy=idle', '--tape', input]);
  const canonical = readFileSync(input, 'utf8');
  assert.ok(canonical.length > 0, 'the recording is empty');

  // THE CONTROL (see the header): same tape, four-space text, so an overwrite cannot hide.
  const control = `${JSON.stringify(JSON.parse(canonical), null, 4)}\n`;
  assert.notEqual(control, canonical, 'the control text matched what gr-sim writes, so an overwrite would be invisible');
  writeFileSync(input, control);

  // ARM 1 — the input survives a bare resume, byte for byte.
  grSim(['--resume', input, '--policy=idle']);
  assert.equal(readFileSync(input, 'utf8'), control, 'the resume wrote over the tape it replayed (F-E10S4-3)');

  // ARM 2 — and the recording it made is really there, beside the input, under the sibling name.
  assert.ok(existsSync(sibling), `the resume wrote no sibling at ${sibling}`);
  assert.equal(readFileSync(sibling, 'utf8'), canonical, 'the sibling is not the tape this resume recorded');

  // ARM 3 — an explicit --tape still wins, and still does not touch the input.
  const explicit = join(directory, 'explicit.tape.json');
  grSim(['--resume', input, '--policy=idle', '--tape', explicit]);
  assert.equal(readFileSync(input, 'utf8'), control, 'a resume with --tape wrote over its input');
  assert.equal(readFileSync(explicit, 'utf8'), canonical, '--tape did not receive the resumed recording');

  // ARM 4 — the naming rule holds for a path with no extension: `ride` -> `ride.resumed`.
  const bare = join(directory, 'bare-ride');
  writeFileSync(bare, control);
  grSim(['--resume', bare, '--policy=idle']);
  assert.equal(readFileSync(bare, 'utf8'), control, 'the extensionless resume wrote over its input');
  assert.ok(existsSync(`${bare}.resumed`), 'the extensionless resume wrote no `.resumed` sibling');
});

test('--help states the rule a caller has to be able to read', () => {
  const help = grSim(['--help']).stdout;
  assert.match(help, /A resume without --tape records to the sibling <tape>\.resumed\.json and NEVER over its input\./);
});
