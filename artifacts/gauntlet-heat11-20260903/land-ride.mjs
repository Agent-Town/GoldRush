// HEAT 11 RIDE LANDER — operator transport only; composes the existing steps in their lawful order,
// adding nothing to them. It runs, in sequence:
//   1. finish-ride.mjs      (collect the arena workspace, firewall check, CLI usage)
//   2. notebook-append.mjs --header-only  (freeze the generation header so the digest can bind it)
//   3. harness-digest.mjs   (sha256(JSON.stringify([charter, header, harnessVersion])))
//   4. build-submission.mjs (refuses an unsecured tape by construction)
//   5. publish-submission.mjs (heat 10's verbatim POST→poll→WATCH; its 120 s poll often ends `pending`)
//   6. poll-verdict.mjs     (poll-only shim; NEVER re-POSTs — it resumes step 5's poll)
// It STOPS at step 4 when the rig did not secure, and reports that plainly. The notebook append is
// deliberately NOT here: it carries the rig's verbatim lessons and the door verdict, so the operator
// writes it by hand after reading the report.
//
// usage: node land-ride.mjs --rig=<opus|fable> --contract=<id> --dir=<ride dir> [--workContract=<arena subdir>]
//                           [--generation=<n>] [--harnessVersion=2.1.257]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
for (const key of ['rig', 'contract', 'dir']) if (!args[key]) throw new Error(`--${key} required`);
const ARENA = args.arena ?? '/tmp/heat11-5e7a7c0b';
const ERA = args.era ?? 'a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04';
const version = args.harnessVersion ?? '2.1.257';
const workContract = args.workContract ?? args.contract;
const dir = args.dir;
const run = (script, argv) => execFileSync('node', [script, ...argv], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const step = (name, fn) => { process.stdout.write(`\n=== ${name} ===\n`); try { return fn(); } catch (error) { process.stdout.write(`FAILED: ${(error.stdout ?? '') + (error.stderr ?? error.message)}\n`); throw Object.assign(new Error(name), { step: name }); } };

step('1 finish-ride', () => process.stdout.write(run('finish-ride.mjs', [`--arena=${ARENA}`, `--rig=${args.rig}`, `--contract=${workContract}`, `--out=${dir}`])));
const summary = JSON.parse(readFileSync(`${dir}/summary.json`, 'utf8'));
// NOTE: summary.json keeps the tape's verdict NESTED at t.outcome.secured (finish-ride's console
// line flattens it, the file does not). Reading t.secured silently reports every ride unsecured.
const secured = summary.scoredTapes.filter((t) => t.outcome?.secured === true);
if (summary.arenaTrackedChanges.length) process.stdout.write(`\n⚠ FIREWALL: arena tracked tree dirty: ${JSON.stringify(summary.arenaTrackedChanges)}\n`);
if (!secured.length) {
  process.stdout.write(`\n=== NOT SECURED — nothing to submit ===\n${JSON.stringify({ rig: args.rig, contract: args.contract, wall: summary.wallClockSeconds, wallHit: summary.wallHit, rc: summary.exitCode, scoredTapes: summary.scoredTapes.map((t) => ({ file: t.file, secured: t.outcome?.secured, waves: t.outcome?.waves, gold: t.outcome?.gold })), outcomeNote: summary.outcome?.note ?? summary.outcome?.outcome?.note ?? null }, null, 1)}\n`);
  process.exit(0);
}
const best = secured.sort((a, b) => (b.outcome?.waves ?? 0) - (a.outcome?.waves ?? 0))[0];
const tapePath = `${ARENA}/artifacts/heat11/${args.rig}/${workContract}/${best.file}`;

if (args.generation) step('2 freeze notebook header', () => process.stdout.write(run('notebook-append.mjs', [`--rig=${args.rig}`, `--contract=${args.contract}`, `--generation=${args.generation}`, `--era=${ERA}`, `--harnessVersion=${version}`, `--summary=${dir}/summary.json`, `--out=${dir}`, '--header-only'])));
if (!existsSync(`${dir}/notebook-header.txt`)) throw new Error('no notebook-header.txt — pass --generation so the digest can bind the header');
const digest = step('3 harnessDigest', () => run('harness-digest.mjs', [`${dir}/charter.md`, `${dir}/notebook-header.txt`, version]).trim());
process.stdout.write(`${digest}\n`);

const o = summary.outcome?.outcome ?? summary.outcome ?? {};
const u = summary.usage ?? {};
const tokensIn = (u.tokensIn ?? 0) + (u.cacheReadTokens ?? 0);
step('4 build-submission', () => process.stdout.write(run('build-submission.mjs', [tapePath, `${dir}/submission.json`, args.rig, version, 'sim-import', '-', String(o.calls ?? '-'), String(tokensIn || '-'), String(u.tokensOut ?? '-'), digest])));

let posted = false;
try { step('5 publish (POST → poll → WATCH)', () => process.stdout.write(run('publish-submission.mjs', [`${dir}/submission.json`, dir]))); posted = true; }
catch { posted = existsSync(`${dir}/post-response.json`) && JSON.parse(readFileSync(`${dir}/post-response.json`, 'utf8')).ok === true; if (!posted) throw new Error('POST itself failed — see post-response.json'); process.stdout.write('POST ok; assay still pending at the 120 s mark — resuming with the poll-only shim (no re-POST)\n'); }
// publish-submission.mjs has no retry around its fetches: one ECONNRESET mid-poll aborts it
// BEFORE verdict-slip.json is ever written, so the file's absence is normal here — check it
// exists before reading, or the lander dies on a ride the door already accepted.
const slipSoFar = existsSync(`${dir}/verdict-slip.json`) ? JSON.parse(readFileSync(`${dir}/verdict-slip.json`, 'utf8')) : null;
if (!posted || slipSoFar?.assay !== 'verified') {
  step('6 poll-verdict (no re-POST)', () => process.stdout.write(run('poll-verdict.mjs', [`${dir}/submission.json`, dir, '250'])));
}
const slip = JSON.parse(readFileSync(`${dir}/verdict-slip.json`, 'utf8'));
const post = JSON.parse(readFileSync(`${dir}/post-response.json`, 'utf8'));
process.stdout.write(`\n=== LANDED ===\n${JSON.stringify({ rig: args.rig, contract: args.contract, tapeId: slip.tapeId, assay: slip.assay, assayHash: slip.assayHash, ranked: slip.ranked, rank: post.rank, waves: best.outcome?.waves, gold: best.outcome?.gold, calls: o.calls, eventLogHash: o.eventLogHash, wall: summary.wallClockSeconds, harnessDigest: digest, usage: { turns: u.assistantTurns, toolCalls: u.toolCalls, tokensIn, tokensOut: u.tokensOut } }, null, 1)}\n`);
