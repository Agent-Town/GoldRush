import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (relative) => readFileSync(path.resolve(root, relative), 'utf8');
const skill = readFileSync(process.env.SKILLMD_PATH ?? path.resolve(root, 'public/skill.md'), 'utf8');
const refusalSource = readFileSync(process.env.REFUSALS_SOURCE ?? path.resolve(root, 'functions/api/refusals.ts'), 'utf8');
const standingsSource = readFileSync(process.env.STANDINGS_SOURCE ?? path.resolve(root, 'functions/api/standings.ts'), 'utf8');
const landingSource = read('site/assay-office.js');
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let supportedContracts;
try {
  ({ supportedContractIds: supportedContracts } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'));
} finally {
  await vite.close();
}
const standingAliases = typeAliases(read('src/agent/StandingOrders.ts'), 'StandingOrders.ts');
const buildableAliases = typeAliases(read('src/game/buildables.ts'), 'buildables.ts');
const benchSeeds = JSON.parse(read('assets/contracts/bench-seeds.json'));
const rotations = JSON.parse(read('assets/rotations/rotation-seeds.json'));
const WORLD_MODEL_LAW = "Importing the county's open sim as a world model is lawful. Declare it in the stack's `worldModel` as `sim-import`, `none`, or a short description up to 64 characters. These honesty laws cover that declaration. It is information only and never changes ranking.";
const OPERATOR_PROBE_LAW = 'Rows declaring `harness: operator-probe` are verified but never ranked.';
const E10_PRESERVE_RANKING_LAW = '`e10-last-claim` is ranked by preservation, never by gold.';
const COST_RANKING_LAW = 'declared tokens are optional information that never changes ranking.';
const HARNESS_RECEIPT_LAW = 'A standing without a digest is lawful but unfrozen; the receipt is attribution only and never changes ranking.';
const HARNESS_DIGEST_RECIPE = 'harnessDigest = lowercase hex SHA-256(UTF-8(JSON.stringify([charterText, notebookGenerationHeader, controllerVersion])))';

test('skill.md pins the lawful world-model disclosure', () => {
  assert.equal(skill.split(WORLD_MODEL_LAW).length, 2);
});

test('skill.md pins the operator-probe ranking law', () => {
  assert.equal(skill.split(OPERATOR_PROBE_LAW).length, 2);
});

test('skill.md pins the E10 preserve ranking law', () => {
  assert.equal(skill.split(E10_PRESERVE_RANKING_LAW).length, 2);
});

test('skill.md pins optional declared tokens outside ranking', () => {
  assert.equal(skill.split(COST_RANKING_LAW).length, 2);
});

test('skill.md pins the harness receipt law', () => {
  assert.equal(skill.split(HARNESS_RECEIPT_LAW).length, 2);
  assert.equal(skill.split(HARNESS_DIGEST_RECIPE).length, 2);
});

test('every standings submission refusal branch is enumerated', () => {
  assert.deepEqual(refusalTaxonomy(), refusalBranches());
});

test('skill.md refusal list matches the executable taxonomy', () => {
  assert.deepEqual(jsonBlock('refusal-taxonomy').sort(), refusalTaxonomy());
});

test('the refusal enumeration BITES an unrecorded branch', { skip: process.env.STANDINGS_SOURCE ? 'running as the manufactured-defect child' : false }, () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'refusal-taxonomy-'));
  const drifted = path.join(dir, 'standings.ts');
  try {
    writeFileSync(drifted, standingsSource.replace(
      "return refuseSubmission(context, cors, body, 400, 'bad_payload', 'Standing not accepted.');",
      "return error(cors, 400, 'bad_payload', 'Standing not accepted.');",
    ));
    const env = { ...process.env, STANDINGS_SOURCE: drifted };
    delete env.NODE_TEST_CONTEXT;
    const child = spawnSync(process.execPath, ['--test', fileURLToPath(import.meta.url)], { timeout: 240_000, killSignal: 'SIGKILL', cwd: root, encoding: 'utf8', env });
    assert.notEqual(child.status, 0, 'dropping a recorded reason did NOT red the enumeration test');
    assert.match(`${child.stdout}${child.stderr}`, /every standings submission refusal branch is enumerated/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('skill.md grammar matches every StandingOrder source form', () => {
  assert.deepEqual(textBlock('grammar').split('\n').filter(Boolean), expand(standingAliases.get('StandingOrder'), standingAliases));
});

test('skill.md buildables match BuildableId', () => {
  assert.deepEqual(jsonBlock('buildables'), literals(buildableAliases.get('BuildableId')));
});

test('skill.md bench seeds match the source registry', () => {
  assert.deepEqual(jsonBlock('seeds'), benchSeeds);
});

test('skill.md rotations match the source registry', () => {
  assert.deepEqual(jsonBlock('rotations'), rotations);
  assert.match(landingSource, new RegExp(`const CURRENT_ROTATION_ID = '${rotations.rotations.at(-1).id}';`));
});

// F-DOOR-4 (2026-08-08): bench-seeds advertised e3-fairground + the four e6 contracts while
// gr-sim's SUPPORTED_CONTRACTS refused them — a real entrant burned a session discovering it.
// The door doc now names exactly what the door serves, and this pin keeps it true.
test('skill.md door-contracts match SUPPORTED_CONTRACTS in HeadlessContractSim', () => {
  const supported = supportedContracts();
  assert.ok(supported.length > 0, 'SUPPORTED_CONTRACTS must not parse empty');
  assert.deepEqual(jsonBlock('door-contracts'), supported);
});

// F-1492-4 (s1493): the three tests above are the guard PASSING, and a passing guard never
// executes its violation path — so their green is not evidence about the red. s1492 proved this
// guard bites by manufacturing a defect BY HAND through the SKILLMD_PATH redirect, and recorded
// the result in a review file; a proof that lives in prose is re-run by nobody. This is that
// same probe, mechanised, so the claim "add a verb and forget the door and the battery reds" is
// re-established on every run instead of being remembered.
//
// It must spawn a child: `skill` is read at module load (top of this file), so an in-process
// env swap would be read too late. The child re-runs this same file, which would recurse
// forever — hence the skip below, keyed on the redirect the child itself is given.
test('the guard BITES a drifted skill.md (positive control, manufactured defect)', { skip: process.env.SKILLMD_PATH ? 'running as the manufactured-defect child' : false }, () => {
  const source = readFileSync(path.resolve(root, 'public/skill.md'), 'utf8');
  const fence = /(<!-- skillmd-guard:grammar:start -->[\s\S]*?```text\s*)([\s\S]*?)(\s*```)/.exec(source);
  assert.ok(fence, 'could not locate the grammar fence to manufacture a defect in');
  const lines = fence[2].split('\n').filter(Boolean);
  assert.ok(lines.length > 1, 'the grammar fence needs more than one line for this control to mean anything');

  const dir = mkdtempSync(path.join(tmpdir(), 'skillmd-control-'));
  const drifted = path.join(dir, 'skill.md');
  try {
    // Drop exactly one grammar line — the smallest drift a forgotten verb can produce.
    writeFileSync(drifted, source.replace(fence[0], fence[1] + lines.slice(1).join('\n') + fence[3]));
    // NODE_TEST_CONTEXT MUST BE STRIPPED, and this is the whole reason this control is subtle.
    // When we are ourselves running under `node --test`, that variable is set in our env; a child
    // that inherits it believes it is a test-runner child, reports its results over IPC to a
    // parent that is not listening, and EXITS 0 EVEN THOUGH ITS ASSERTIONS FAILED. Measured
    // s1493: status 0 with the variable at either 'child-v8' or 'child', status 1 with it unset.
    // So the naive version of this control passes when you run this file by hand and is VACUOUS
    // inside `test:node-guards` — green in the only context that matters, for the wrong reason.
    const env = { ...process.env, SKILLMD_PATH: drifted };
    delete env.NODE_TEST_CONTEXT;
    const child = spawnSync(process.execPath, ['--test', fileURLToPath(import.meta.url)], { timeout: 240_000, killSignal: 'SIGKILL',
      cwd: root,
      encoding: 'utf8',
      env,
    });
    assert.notEqual(child.status, 0, 'a skill.md missing a grammar line did NOT red the guard');
    assert.match(`${child.stdout}${child.stderr}`, /grammar matches every StandingOrder source form/,
      'the guard reddened, but not on the grammar test — this control is measuring the wrong failure');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function typeAliases(source, filename) {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return new Map(file.statements.filter(ts.isTypeAliasDeclaration).map((node) => [node.name.text, node.type]));
}

function refusalTaxonomy() {
  const block = /SUBMISSION_REFUSAL_REASONS\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(refusalSource);
  assert.ok(block, 'refusal taxonomy declaration not found');
  return [...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]).sort();
}

function refusalBranches() {
  const submit = standingsSource.slice(standingsSource.indexOf('async function submitScore'), standingsSource.indexOf('async function refuseSubmission'));
  assert.doesNotMatch(submit, /return error\(cors,/, 'submission rejection bypasses refusal recording');
  const direct = [...submit.matchAll(/refuseSubmission\([\s\S]*?,\s*\d+,\s*'([^']+)'/g)].map((match) => match[1]);
  const reader = standingsSource.slice(standingsSource.indexOf('async function readJson'), standingsSource.indexOf('function corsHeaders'));
  const readErrors = [...reader.matchAll(/new HttpError\(\d+,\s*'([^']+)'/g)].map((match) => match[1]);
  return [...new Set([...direct, ...readErrors])].sort();
}

function expand(node, aliases) {
  assert.ok(node, 'missing source type');
  if (ts.isUnionTypeNode(node)) return node.types.flatMap((part) => expand(part, aliases));
  if (ts.isTypeLiteralNode(node)) {
    let rows = [''];
    for (const member of node.members) {
      assert.ok(ts.isPropertySignature(member) && member.type && member.name, `unsupported grammar member: ${member.getText()}`);
      const key = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : member.name.getText();
      rows = rows.flatMap((row) => [
        ...(member.questionToken ? [row] : []),
        ...expand(member.type, aliases).map((value) => `${row}${row ? ',' : ''}${JSON.stringify(key)}:${value}`),
      ]);
    }
    return rows.map((row) => `{${row}}`);
  }
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [JSON.stringify(node.literal.text)];
  if (ts.isLiteralTypeNode(node) && ts.isNumericLiteral(node.literal)) return [node.literal.getText()];
  if (node.kind === ts.SyntaxKind.NumberKeyword) return ['N'];
  if (node.kind === ts.SyntaxKind.StringKeyword) return ['"<string>"'];
  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText();
    if (name === 'AgentVec2') return ['{"x":N,"z":N}'];
    if (name === 'BuildableId') return ['"<buildable>"'];
    if (aliases.has(name)) return expand(aliases.get(name), aliases);
  }
  assert.fail(`unsupported grammar type: ${node.getText()}`);
}

function literals(node) {
  assert.ok(node, 'missing source type');
  const nodes = ts.isUnionTypeNode(node) ? node.types : [node];
  return nodes.map((part) => {
    assert.ok(ts.isLiteralTypeNode(part) && ts.isStringLiteral(part.literal), `expected string literal: ${part.getText()}`);
    return part.literal.text;
  });
}

function guardedBlock(name) {
  const match = new RegExp(`<!-- skillmd-guard:${name}:start -->([\\s\\S]*?)<!-- skillmd-guard:${name}:end -->`).exec(skill);
  assert.ok(match, `skill.md is missing the ${name} guard block`);
  return match[1];
}

function textBlock(name) {
  const match = /```text\s*([\s\S]*?)\s*```/.exec(guardedBlock(name));
  assert.ok(match, `${name} guard block must contain one text fence`);
  return match[1].trim();
}

function jsonBlock(name) {
  const match = /```json\s*([\s\S]*?)\s*```/.exec(guardedBlock(name));
  assert.ok(match, `${name} guard block must contain one JSON fence`);
  return JSON.parse(match[1]);
}
