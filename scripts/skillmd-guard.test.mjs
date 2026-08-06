import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (relative) => readFileSync(path.resolve(root, relative), 'utf8');
const skill = readFileSync(process.env.SKILLMD_PATH ?? path.resolve(root, 'public/skill.md'), 'utf8');
const standingAliases = typeAliases(read('src/agent/StandingOrders.ts'), 'StandingOrders.ts');
const buildableAliases = typeAliases(read('src/game/buildables.ts'), 'buildables.ts');
const benchSeeds = JSON.parse(read('assets/contracts/bench-seeds.json'));

test('skill.md grammar matches every StandingOrder source form', () => {
  assert.deepEqual(textBlock('grammar').split('\n').filter(Boolean), expand(standingAliases.get('StandingOrder'), standingAliases));
});

test('skill.md buildables match BuildableId', () => {
  assert.deepEqual(jsonBlock('buildables'), literals(buildableAliases.get('BuildableId')));
});

test('skill.md bench seeds match the source registry', () => {
  assert.deepEqual(jsonBlock('seeds'), benchSeeds);
});

function typeAliases(source, filename) {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return new Map(file.statements.filter(ts.isTypeAliasDeclaration).map((node) => [node.name.text, node.type]));
}

function expand(node, aliases) {
  assert.ok(node, 'missing source type');
  if (ts.isUnionTypeNode(node)) return node.types.flatMap((part) => expand(part, aliases));
  if (ts.isTypeLiteralNode(node)) {
    let rows = [''];
    for (const member of node.members) {
      assert.ok(ts.isPropertySignature(member) && member.type && member.name, `unsupported grammar member: ${member.getText()}`);
      const key = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) ? member.name.text : member.name.getText();
      rows = rows.flatMap((row) => expand(member.type, aliases).map((value) => `${row}${row ? ',' : ''}${JSON.stringify(key)}:${value}`));
    }
    return rows.map((row) => `{${row}}`);
  }
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) return [JSON.stringify(node.literal.text)];
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
