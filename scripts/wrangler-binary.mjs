import { spawnSync } from 'node:child_process';

// F-1552-1: this is the version the gates demonstrably resolve today. Wrangler
// 4.108.0 is the lowest release whose declared peer accepts this repo's
// @cloudflare/workers-types ^5.
export const EXPECTED_WRANGLER_VERSION = '4.107.0';

export function resolveWranglerPath() {
  const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['wrangler'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim().split(/\r?\n/, 1)[0] : null;
}

function readWranglerVersion() {
  return spawnSync('wrangler', ['--version'], { encoding: 'utf8' });
}

export function assertWranglerVersion(label, readVersion = readWranglerVersion) {
  const result = readVersion();
  if (result.error || result.status !== 0) {
    throw new Error(`${label}: wrangler was not found on PATH.`);
  }

  const found = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.match(
    /\b\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?\b/,
  )?.[0];
  if (!found) throw new Error(`${label}: wrangler --version returned no parseable version.`);
  if (found === EXPECTED_WRANGLER_VERSION) return found;

  const resolvedPath = resolveWranglerPath() ?? 'unresolved';
  if (process.env.GR_WRANGLER_ANY === '1') {
    console.warn(`WRANGLER VERSION DRIFT: ${label} found ${found}; expected ${EXPECTED_WRANGLER_VERSION}; path ${resolvedPath}`);
    return found;
  }

  throw new Error(
    `${label}: found Wrangler ${found}; expected ${EXPECTED_WRANGLER_VERSION}; resolved path ${resolvedPath}. Install Wrangler ${EXPECTED_WRANGLER_VERSION} on PATH or set GR_WRANGLER_ANY=1 for an explicit one-run override.`,
  );
}
