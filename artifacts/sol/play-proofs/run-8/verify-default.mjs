// Compare normalized syntax trees after specializing the new flag to false.
// This complements the real Incline runs; no game code is executed or modified.
import ts from 'typescript';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const base = fs.readFileSync(new URL('./base.txt', import.meta.url), 'utf8').trim();
const before = execFileSync('git', ['show', `${base}:e2e/native-proofs/driver.ts`], { encoding: 'utf8' });
const after = fs.readFileSync('e2e/native-proofs/driver.ts', 'utf8');
function normalize(text, specialize) {
  const source = ts.createSourceFile('driver.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = ts.transform(source, [context => {
    const visit = node => {
      if (specialize && ts.isVariableStatement(node) && node.declarationList.declarations.some(d => d.name.getText(source) === 'RESTORE_GROUND')) return undefined;
      if (specialize && ts.isIdentifier(node) && node.text === 'RESTORE_GROUND') return ts.factory.createFalse();
      node = ts.visitEachChild(node, visit, context);
      if (ts.isParenthesizedExpression(node)) return node.expression;
      if (ts.isConditionalExpression(node) && node.condition.kind === ts.SyntaxKind.FalseKeyword) return node.whenFalse;
      if (ts.isIfStatement(node) && node.expression.kind === ts.SyntaxKind.FalseKeyword) return node.elseStatement;
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
        if (node.right.kind === ts.SyntaxKind.FalseKeyword) return node.left;
        if (node.left.kind === ts.SyntaxKind.FalseKeyword) return node.right;
      }
      return node;
    };
    return root => ts.visitNode(root, visit);
  }]);
  const printed = ts.createPrinter({ removeComments: true }).printFile(result.transformed[0]);
  result.dispose();
  return printed;
}
const unchanged = normalize(before, false) === normalize(after, true);
console.log(JSON.stringify({ base, strategyUnsetSyntaxEquivalent: unchanged }, null, 2));
if (!unchanged) process.exitCode = 1;
