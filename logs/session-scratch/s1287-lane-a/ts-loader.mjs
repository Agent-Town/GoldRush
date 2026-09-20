import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ts = createRequire(import.meta.url)(`${process.cwd()}/node_modules/typescript/lib/typescript.js`);

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith('.') || specifier.startsWith('/')) {
        for (const suffix of ['.ts', '/index.ts']) {
          try {
            return nextResolve(specifier + suffix, context);
          } catch {
            // Try the next repository-style TypeScript resolution.
          }
        }
      }
      throw error;
    }
  },
  load(url, context, nextLoad) {
    if (!url.endsWith('.ts')) return nextLoad(url, context);
    const path = fileURLToPath(url);
    let source = readFileSync(path, 'utf8');
    if (path.endsWith('/src/agent/StandingOrders.ts')) {
      source += '\nexport { permissionDenial as __probePermissionDenial };\n';
    }
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        verbatimModuleSyntax: false,
        useDefineForClassFields: false,
      },
      fileName: path,
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  },
});
