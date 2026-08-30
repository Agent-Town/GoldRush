import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const ROOT = path.resolve(import.meta.dirname, '..');
const EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];

function git(args) {
  const result = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  assert.ok(result.status === 0 || (args[0] === 'grep' && result.status === 1), result.stderr || result.error?.message);
  return result.stdout;
}

function sourceFile(file) {
  return ts.createSourceFile(file, readFileSync(path.join(ROOT, file), 'utf8'), ts.ScriptTarget.Latest, true);
}

function runtimeSpecifier(statement) {
  if (ts.isImportDeclaration(statement)) {
    const clause = statement.importClause;
    if (clause?.isTypeOnly) return null;
    if (
      clause?.namedBindings
      && ts.isNamedImports(clause.namedBindings)
      && !clause.name
      && clause.namedBindings.elements.length > 0
      && clause.namedBindings.elements.every((element) => element.isTypeOnly)
    ) return null;
    return ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : null;
  }
  if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.moduleSpecifier) {
    if (
      statement.exportClause
      && ts.isNamedExports(statement.exportClause)
      && statement.exportClause.elements.length > 0
      && statement.exportClause.elements.every((element) => element.isTypeOnly)
    ) return null;
    return ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : null;
  }
  return null;
}

function resolveImport(from, specifier, files) {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) return null;
  const clean = specifier.split('?')[0];
  const base = specifier.startsWith('/')
    ? path.posix.normalize(clean.slice(1))
    : path.posix.normalize(path.posix.join(path.posix.dirname(from), clean));
  const candidates = [
    base,
    ...EXTENSIONS.map((extension) => `${base}${extension}`),
    ...EXTENSIONS.map((extension) => path.posix.join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => files.has(candidate)) ?? null;
}

test('e2e collection cannot statically reach a module with a Vite-only ?raw import', () => {
  const files = new Set(
    git(['ls-files', '-z', '--'])
      .split('\0')
      .filter((file) => EXTENSIONS.some((extension) => file.endsWith(extension))),
  );
  const carrierCandidates = git(['grep', '-l', '-F', '?raw', '--'])
    .trim()
    .split('\n')
    .filter((file) => EXTENSIONS.some((extension) => file.endsWith(extension)));
  const carriers = new Map();
  for (const file of carrierCandidates) {
    const rawImports = sourceFile(file).statements
      .map(runtimeSpecifier)
      .filter((specifier) => specifier?.includes('?raw'));
    if (rawImports.length > 0) carriers.set(file, rawImports);
  }

  const graph = new Map();
  for (const file of files) {
    graph.set(
      file,
      sourceFile(file).statements
        .map(runtimeSpecifier)
        .filter(Boolean)
        .map((specifier) => resolveImport(file, specifier, files))
        .filter(Boolean),
    );
  }

  const violations = [];
  for (const spec of files) {
    if (!/^e2e\/.*\.spec\.[cm]?[jt]sx?$/.test(spec)) continue;
    const queue = [[spec]];
    const seen = new Set();
    while (queue.length > 0) {
      const chain = queue.shift();
      const file = chain.at(-1);
      if (seen.has(file)) continue;
      seen.add(file);
      if (carriers.has(file)) {
        violations.push(`${chain.join(' -> ')} imports ${carriers.get(file).join(', ')}`);
        break;
      }
      for (const dependency of graph.get(file) ?? []) queue.push([...chain, dependency]);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Vite-only static import reached during Playwright collection:\n${violations.join('\n')}`,
  );
});
