import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const townSourcePath = 'src/town/townEraProps.ts';
const contractsSourcePath = 'src/meta/ContractFamilies.ts';

class GlobFallbackSourceReadError extends Error {
  name = 'GlobFallbackSourceReadError';
}

function sourceMapKeys(source, sourcePath, name, nonRelease = false) {
  const branches = nonRelease
    ? String.raw`RELEASE_E1\s*\?\s*\{[\s\S]*?^\}\s*:\s*\{([\s\S]*?)^\};`
    : String.raw`\{([\s\S]*?)^\};`;
  const match = source.match(new RegExp(String.raw`\bconst\s+${name}\b[^=]*=\s*${branches}`, 'm'));
  const keys = match
    ? [...match[1].matchAll(/^\s*['"]([^'"]+\.json)['"]\s*:/gm)].map(([_, key]) => repoPath(key))
    : [];
  if (keys.length === 0) {
    throw new GlobFallbackSourceReadError(
      `glob-fallback-completeness: could not read ${name} from ${sourcePath}`,
    );
  }
  return keys;
}

function staticEraPropKeys(source) {
  const keys = [...source.matchAll(/^import\s+\w+\s+from\s+['"]([^'"]*\/era-props\.e\d+\.json)['"]/gm)]
    .map(([_, key]) => repoPath(key));
  if (keys.length === 0) {
    throw new GlobFallbackSourceReadError(
      `glob-fallback-completeness: could not read static era-prop imports from ${townSourcePath}`,
    );
  }
  return keys;
}

function repoPath(sourcePath) {
  return sourcePath.replace(/^\.\.\/\.\.\//, '');
}

function contractFiles(file) {
  return fs.readdirSync(path.join(root, 'assets/contracts'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, 'assets/contracts', entry.name, file)))
    .map((entry) => `assets/contracts/${entry.name}/${file}`);
}

function sameSet(label, actual, expected) {
  const actualSet = [...new Set(actual)].sort();
  const expectedSet = [...new Set(expected)].sort();
  const missing = expectedSet.filter((key) => !actualSet.includes(key));
  const extra = actualSet.filter((key) => !expectedSet.includes(key));
  assert.deepEqual(
    actualSet,
    expectedSet,
    `${label}: key-set mismatch; missing: ${missing.join(', ') || '(none)'}; extra: ${extra.join(', ') || '(none)'}`,
  );
}

test('node glob fallbacks match every on-disk manifest (non-release branches)', () => {
  const townSource = fs.readFileSync(path.join(root, townSourcePath), 'utf8');
  const contractsSource = fs.readFileSync(path.join(root, contractsSourcePath), 'utf8');
  const townFiles = fs.readdirSync(path.join(root, 'assets/pilots/plaza-props-3d'))
    .filter((file) => /^era-props\.e\d+\.json$/.test(file))
    .map((file) => `assets/pilots/plaza-props-3d/${file}`);
  const townFallback = sourceMapKeys(townSource, townSourcePath, 'fallbackTownEraPropManifests');
  const townImports = staticEraPropKeys(townSource);

  sameSet('fallbackTownEraPropManifests vs disk', townFallback, townFiles);
  sameSet('town era-prop static imports vs disk', townImports, townFiles);
  console.log(`fallbackTownEraPropManifests: ${townFallback.length} fallback keys = ${townImports.length} static imports = ${townFiles.length} files`);

  for (const [name, file, nonRelease] of [
    ['fallbackManifests', 'manifest.json', true],
    ['fallbackFamilyBundles', 'families.json', false],
    ['fallbackCapsBundles', 'caps.json', false],
    ['fallbackContractBundles', 'contracts.json', true],
  ]) {
    const fallback = sourceMapKeys(contractsSource, contractsSourcePath, name, nonRelease);
    const files = contractFiles(file);
    sameSet(`${name}${nonRelease ? ' non-release branch' : ''} vs disk`, fallback, files);
    console.log(`${name}${nonRelease ? ' (non-release)' : ''}: ${fallback.length} fallback keys = ${files.length} files`);
  }
});
