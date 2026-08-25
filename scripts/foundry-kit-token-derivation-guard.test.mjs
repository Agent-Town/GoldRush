// F-2306-1 — the Foundry kit's leftover-token check must be able to SEE every token
// its own scaffolder substitutes, and must refuse rather than check nothing.
//
// THE DEFECT: foundry/kit/test-init.sh §5 hand-listed the tokens it grepped for
// (`<PROJECT( NAME)?>|<project>`) beside a substituter that replaces FOUR
// (`<PROJECT NAME>`, `<PROJECT>`, `<project>`, `<date>`). The one it missed was the
// most common in the template corpus — 8 occurrences across 3 of the 6 templates,
// against 4 for all three it knew. Dropping the `<date>` substitution shipped 8 raw
// tokens into a scaffolded CLAUDE.md, scripts/fire.md and docs/TEMPLATE-specialist-queue.md
// while the self-test printed `82 passed, 0 failed` at rc=0 — byte-identical on stdout,
// stderr AND rc to a correct scaffold.
//
// THE CURE has two halves and BOTH are load-bearing:
//   DERIVED  — the token set is read out of init.mjs's own instantiate() body, so a
//              token ADDED there is checked automatically (arm: "growth path").
//   FLOOR    — unioned with a contract list hardcoded HERE, so a token REMOVED from
//              instantiate() reds instead of quietly leaving the check (arms 2, 3).
// A set derived only from the implementation is defeated by the very edit it must
// catch; the first draft of the cure did exactly that and went green on BOTH defect
// arms, including the one the hand-list it replaced had caught. That is why the
// floor exists, and why arm 3 (a token the OLD check already saw) is asserted too.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KIT = path.join(REPO, 'foundry', 'kit', 'test-init.sh');
const INIT = path.join(REPO, 'foundry', 'kit', 'init.mjs');

const temps = [];
function scratch() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'foundry-token-guard-'));
  temps.push(d);
  fs.cpSync(path.join(REPO, 'foundry'), path.join(d, 'foundry'), { recursive: true });
  return d;
}
process.on('exit', () => {
  for (const d of temps) { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } }
});

function runKit(root) {
  const r = spawnSync('bash', [path.join(root, 'foundry/kit/test-init.sh')], { encoding: 'utf8', timeout: 300000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = out.match(/RESULT: (\d+) passed, (\d+) failed/);
  return { rc: r.status, out, failed: m ? Number(m[2]) : null, passed: m ? Number(m[1]) : null };
}

// Manufacture a defect on a scratch copy, asserting the edit actually matched —
// a variant whose construction silently no-ops is a green that tested nothing.
function variantOf(find, repl) {
  const root = scratch();
  const p = path.join(root, 'foundry/kit/init.mjs');
  const before = fs.readFileSync(p, 'utf8');
  const after = before.replace(find, repl);
  assert.notStrictEqual(after, before, `variant construction failed — no match for: ${find}`);
  fs.writeFileSync(p, after);
  return root;
}

test('the kit self-test is green on an unmodified tree', () => {
  const r = runKit(REPO);
  // Assert the control produced something before believing what it says: a control
  // whose failure mode is silence cannot be told from the silence it measures.
  assert.ok(r.out.length > 1000, `control produced only ${r.out.length} B — it did not really run`);
  assert.strictEqual(r.failed, 0, `unmodified kit self-test failed:\n${r.out}`);
  assert.strictEqual(r.rc, 0);
});

test('the check DECLARES how many tokens it derived, on the happy path too', () => {
  const r = runKit(REPO);
  assert.match(r.out, /derived \d+ substitution token\(s\) from init\.mjs/,
    'no derivation declaration — "0 leftover tokens" read off an empty token set is the same false green one level up');
});

test('dropping the <date> substitution REDS (this is the defect that was invisible)', () => {
  const r = runKit(variantOf(".replaceAll('<date>', TODAY);", ';'));
  assert.ok(r.failed > 0, `dropping <date> left the self-test green:\n${r.out}`);
  assert.strictEqual(r.rc, 1);
  assert.match(r.out, /<date>/, 'the failure must name the token that vanished');
});

test('dropping the <project> substitution REDS (the case the old hand-list caught — no regression)', () => {
  const r = runKit(variantOf(".replaceAll('<project>', NAME)", ''));
  assert.ok(r.failed > 0, `dropping <project> left the self-test green:\n${r.out}`);
  assert.strictEqual(r.rc, 1);
});

test('a token ADDED to instantiate() is picked up automatically (the derived half is not decoration)', () => {
  const base = runKit(REPO);
  const grown = runKit(variantOf(
    ".replaceAll('<date>', TODAY);",
    ".replaceAll('<date>', TODAY).replaceAll('<studio>', NAME);",
  ));
  const count = (out) => Number((out.match(/derived (\d+) substitution token\(s\)/) || [])[1]);
  assert.strictEqual(count(base.out), 4, 'contract floor moved — update this guard deliberately, not by accident');
  assert.strictEqual(count(grown.out), 5,
    'the declared count did not move when a token was added: the derived half is decoration and only the floor works');
});

test('an underivable instantiate() REFUSES rather than checking nothing', () => {
  // The token set must never silently fall back to empty. Note init.mjs itself dies
  // first here (it calls the renamed function), which is the loud direction — the
  // assertion is that NOTHING reports a pass.
  const r = runKit(variantOf('function instantiate(', 'function instantiateRenamed('));
  assert.notStrictEqual(r.rc, 0, `an underivable token set exited 0:\n${r.out}`);
  assert.ok(!/RESULT: \d+ passed, 0 failed/.test(r.out), 'reported a clean result on a broken scaffolder');
});

test('the contract floor names every token init.mjs actually substitutes', () => {
  // If instantiate() legitimately grows, this reds and the floor above must be
  // updated on purpose. That is the point: the floor is a contract, not a mirror.
  const body = fs.readFileSync(INIT, 'utf8').match(/function instantiate\([\s\S]*?\n\}/);
  assert.ok(body, 'instantiate() not found in init.mjs');
  const derived = [...body[0].matchAll(/\.replaceAll\('([^']+)'/g)].map((m) => m[1]);
  const floor = [...fs.readFileSync(KIT, 'utf8').matchAll(/const FLOOR = \[([^\]]+)\]/g)]
    .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
  assert.ok(floor.length > 0, 'no FLOOR list found in test-init.sh');
  assert.deepStrictEqual([...derived].sort(), [...floor].sort(),
    'init.mjs and the self-test FLOOR disagree about which tokens are substituted');
});
