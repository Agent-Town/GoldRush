/**
 * external-server-guard.mjs — F-1457-1's mechanism (s1463).
 *
 * WHAT HOLE THIS FILLS. `playwright.config.ts` skips its `webServer` block entirely when
 * GR_CAPTURE_EXTERNAL_SERVER=1 and then trusts whatever is listening on baseURL. Nothing checked
 * WHAT was listening. s1457 gated a re-land against a production `vite preview` on the scratch
 * port and `e2e/e2-pressure-garden.spec.ts` went 2 failed in 129s on 60s `locator.click` timeouts;
 * the same tree, same flags, against `npm run dev` went 2 passed in 18s. The reds were the
 * instrument's, not the slice's — and they looked exactly like ordinary tree reds, so a drain that
 * trusted them would have filed a false blocking finding against a sound slice. F-1457-1 stated the
 * rule ("any fire setting GR_CAPTURE_EXTERNAL_SERVER=1 starts `npm run dev`, never a preview
 * server") and left the guard unbuilt. This is the guard. A law with no mechanism decays.
 *
 * THE DISCRIMINATOR WAS MEASURED, NOT ASSUMED — and the measurement refuted the obvious design.
 * `artifacts/f1457-1/measure-discriminator.mjs` stands both server kinds up side by side and probes
 * them. Re-runnable; s1463 recorded:
 *
 *   /@vite/client   dev     -> status 200, content-type text/javascript, 205527 bytes
 *   /@vite/client   preview -> status 200, content-type text/html,         1087 bytes
 *
 * ⚠️ STATUS DOES NOT SEPARATE THEM. `vite preview` SPA-falls-back to index.html, so it answers 200
 * for /@vite/client just as the dev server does. A guard written on the intuitive "preview 404s the
 * vite client" would have passed against BOTH arms — a silent false green, which is the exact class
 * of defect this file exists to prevent. Content-type is the signal; keep it that way.
 *
 * WHO THIS AFFECTS, COUNTED RATHER THAN ASSUMED (s1463 read every consumer). Three live callers set
 * GR_CAPTURE_EXTERNAL_SERVER=1 against the DEFAULT config, and all three already start a dev server:
 * `scripts/capture-footage.mjs:6` (`npx vite`), `scripts/concurrency-class-rate.mjs:39` (vite's
 * `createServer`), and the beauty/mkt `.rig.ts` header recipes. So this guard codifies what the
 * factory already does; it forbids nothing anyone currently relies on.
 * ⓘ `scripts/deploy.sh:61` also sets the flag and DOES serve a production build — legitimately, to
 * measure the shipped asset budget. It is untouched here because it passes
 * `--config playwright.preview.config.ts`, a different config that this globalSetup never runs for.
 * That near-miss is why the rule is scoped to the default config rather than to the env var: stated
 * as a universal, it would have aborted every deploy.
 *
 * NO BYPASS FLAG, DELIBERATELY. Gating the default config against a production build is already a
 * supported thing to want, and it already has a door: `playwright.preview.config.ts`. An opt-out env
 * var would only give an accidental preview server a way to keep being one, which is the failure.
 */

const VITE_CLIENT_PATH = '/@vite/client';
const JS_CONTENT_TYPES = ['text/javascript', 'application/javascript'];

/**
 * Ask what kind of server is answering at baseURL.
 * @returns {Promise<{verdict: 'dev'|'not-dev'|'unreachable', detail: string}>}
 */
export async function classifyExternalServer(baseURL, { timeoutMs = 5_000 } = {}) {
  const url = `${baseURL.replace(/\/+$/, '')}${VITE_CLIENT_PATH}`;
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    return { verdict: 'unreachable', detail: `${url}: ${error?.message ?? error}` };
  }
  const contentType = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (JS_CONTENT_TYPES.includes(contentType)) {
    return { verdict: 'dev', detail: `${url}: ${res.status} ${contentType}` };
  }
  return { verdict: 'not-dev', detail: `${url}: ${res.status} ${contentType || '(no content-type)'}` };
}

/** Retry reachability briefly — a new gate that flakes on a server still binding is worse than the hole. */
export async function classifyWithGrace(baseURL, { graceMs = 10_000, timeoutMs = 5_000 } = {}) {
  const deadline = Date.now() + graceMs;
  let last = await classifyExternalServer(baseURL, { timeoutMs });
  while (last.verdict === 'unreachable' && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    last = await classifyExternalServer(baseURL, { timeoutMs });
  }
  return last;
}

export function messageFor(verdict, detail, baseURL) {
  if (verdict === 'not-dev') {
    return [
      `F-1457-1: the external server at ${baseURL} is NOT a vite dev server.`,
      `  probe: ${detail}`,
      `  A dev server answers ${VITE_CLIENT_PATH} as JavaScript; this one answered HTML, which is`,
      `  what a production build served by \`vite preview\` does (it SPA-falls-back to index.html).`,
      '',
      '  This matters because the failure is SILENT: the suite runs, and timing-sensitive specs go',
      '  red on 60s click timeouts that look exactly like ordinary tree reds. s1457 lost a gate to',
      '  this and nearly filed a blocking finding against a sound slice.',
      '',
      '  FIX: start the server the config itself specifies —',
      '    npm run dev -- --port <scratch> --strictPort',
      '  If you MEANT to test a production build, that is a different harness and already has one:',
      '    npx playwright test --config playwright.preview.config.ts',
    ].join('\n');
  }
  return [
    `F-1457-1: nothing is answering at ${baseURL}.`,
    `  probe: ${detail}`,
    '  GR_CAPTURE_EXTERNAL_SERVER=1 tells playwright NOT to start a server, so one must already be',
    '  listening. Start it first, or unset the flag and let the config start its own.',
  ].join('\n');
}

/** Playwright globalSetup. A no-op unless GR_CAPTURE_EXTERNAL_SERVER=1. */
export default async function globalSetup() {
  if (process.env.GR_CAPTURE_EXTERNAL_SERVER !== '1') return;
  const baseURL = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5188';
  const { verdict, detail } = await classifyWithGrace(baseURL);
  if (verdict === 'dev') return;
  throw new Error(messageFor(verdict, detail, baseURL));
}
