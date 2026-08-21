import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const probe = readFileSync(resolve(process.env.CANYON_TERMINAL_PROBE ?? `${ROOT}/scripts/f2142-canyon-terminal-probe.mjs`), 'utf8');

function names(binding) {
  return binding.split(',').map((part) => part.trim().split(/[:=]/, 1)[0]).filter(Boolean);
}

test('every destructured ssrLoadModule symbol is exported by its source module', () => {
  const imports = [];
  for (const match of probe.matchAll(/const\s+\{([^}]+)\}\s*=\s*await\s+vite\.ssrLoadModule\('([^']+)'\)/g)) {
    imports.push(...names(match[1]).map((name) => [name, match[2]]));
  }
  for (const match of probe.matchAll(/const\s*\[([\s\S]*?)\]\s*=\s*await\s+Promise\.all\(\[([\s\S]*?)\]\);/g)) {
    const bindings = [...match[1].matchAll(/\{([^}]+)\}/g)].map((entry) => names(entry[1]));
    const modules = [...match[2].matchAll(/vite\.ssrLoadModule\('([^']+)'\)/g)].map((entry) => entry[1]);
    assert.equal(bindings.length, modules.length, 'Promise.all bindings must match ssrLoadModule calls');
    bindings.forEach((group, index) => imports.push(...group.map((name) => [name, modules[index]])));
  }
  assert.ok(imports.length > 0, 'probe must contain destructured ssrLoadModule imports');

  for (const [name, modulePath] of imports) {
    const source = readFileSync(resolve(ROOT, modulePath.slice(1)), 'utf8');
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const declaration = new RegExp(`\\bexport\\s+(?:declare\\s+)?(?:async\\s+)?(?:const|let|var|function|class|type|interface|enum)\\s+${escaped}\\b`);
    const exportList = new RegExp(`\\bexport\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`);
    assert.ok(declaration.test(source) || exportList.test(source), `${name} is not exported by ${modulePath}`);
  }
});
