import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

// F-1096-1 (s1097): src/town/townEraProps.ts holds an EAGER import.meta.glob over JSON manifests.
// Under Vite that is fine; under plain node (which is how playwright collects the suite) an
// unguarded glob throws `glob is not a function` and takes the WHOLE suite to `Total: 0 tests`
// — measured s1097: 2378 tests in 330 files -> 0 tests in 0 files, from a single static import
// edge. rf-33 lost nine days to exactly that class of failure.
//
// The whole-suite collection guard catches the blast, but names nothing. This guard names the
// file: it imports the module the way node does and asserts the manifests still resolve, so the
// `typeof import.meta.env === 'object' ? glob : fallback` idiom (copied from
// src/meta/ContractFamilies.ts:755) cannot be removed silently.
test('townEraProps resolves its manifests under plain node, not only under Vite', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      '--input-type=module',
      '-e',
      [
        "const m = await import('./src/town/townEraProps.ts');",
        // era 3 accumulates e2 + e3; era 10 is sliced at the last floodReset manifest.
        "console.log(JSON.stringify({ e3: m.townEraPropsForOrder(3).length, e10: m.townEraPropsForOrder(10).length }));",
      ].join('\n'),
    ],
    { encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.doesNotMatch(result.stderr, /glob is not a function|needs an import attribute/);

  const counts = JSON.parse(result.stdout.trim().split('\n').at(-1));
  assert.ok(counts.e3 > 0, `era 3 props resolved empty under node: ${result.stdout}`);
  assert.ok(counts.e10 > 0, `era 10 props resolved empty under node: ${result.stdout}`);
});
