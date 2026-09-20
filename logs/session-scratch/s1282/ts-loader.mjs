// s1282 — minimal ESM hook that transpiles this repo's .ts through the repo's own `typescript`.
// Needed because node --experimental-strip-types cannot handle TS *parameter properties*, which
// StandingOrdersExecutor's constructor uses (src/agent/StandingOrders.ts:97). Type-stripping only:
// no type checking, no emit config of our own beyond module/target, so the runtime semantics are
// the source's.
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ts = createRequire(import.meta.url)(`${process.cwd()}/node_modules/typescript/lib/typescript.js`);

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      // The source omits extensions on relative imports (bundler resolution); try .ts, then /index.ts.
      if (specifier.startsWith('.') || specifier.startsWith('/')) {
        for (const suffix of ['.ts', '/index.ts']) {
          try {
            return nextResolve(specifier + suffix, context);
          } catch {
            /* keep trying */
          }
        }
      }
      throw err;
    }
  },
  load(url, context, nextLoad) {
    if (!url.endsWith('.ts')) return nextLoad(url, context);
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        verbatimModuleSyntax: false,
        useDefineForClassFields: false,
      },
      fileName: fileURLToPath(url),
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  },
});
