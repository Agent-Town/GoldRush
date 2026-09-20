import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const base = process.argv[2];
assert(base, 'usage: node compare-tokens.mjs <base-commit>');

const file = 'src/story/beats.ts';
const before = execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' });
const after = readFileSync(file, 'utf8');
const tokens = (source) => {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = [];
  const visit = (node) => {
    const children = node.getChildren(sourceFile);
    if (!children.length && node.kind >= ts.SyntaxKind.FirstToken && node.kind <= ts.SyntaxKind.LastToken) {
      result.push([node.kind, node.getText(sourceFile)]);
    } else children.forEach(visit);
  };
  visit(sourceFile);
  return result;
};

const beforeTokens = tokens(before);
const afterTokens = tokens(after);
assert.deepEqual(afterTokens, beforeTokens, 'non-trivia TypeScript tokens changed');
const beforeLines = before.split('\n').length - 1;
const afterLines = after.split('\n').length - 1;
assert.equal(afterLines, beforeLines, 'source line count changed');
console.log(JSON.stringify({ base, file, tokenCount: afterTokens.length, tokensIdentical: true,
  beforeLines, afterLines, linesIdentical: true }, null, 2));
