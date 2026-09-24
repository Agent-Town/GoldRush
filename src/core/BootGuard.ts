/**
 * THE BOOT GUARD — UX-2, from the outside review of 2026-09-24 (re-verified the same day).
 *
 * The finding, verbatim in its essentials: there was no `error`, `unhandledrejection` or
 * `vite:preloadError` handler anywhere in `src/`; `Renderer.ts:28` built the WebGL renderer with no
 * try/catch and no context probe; `index.html` carried no fallback; and `src/main.ts` held 21
 * runtime dynamic imports with no `.catch`. Any one of those failing left THE PLAYER LOOKING AT A
 * BLANK PAGE with nothing to read and nothing to press.
 *
 * So this module is `main.ts`'s FIRST import. It must be listening before any other module can
 * throw, which is why it imports nothing of its own and styles its card INLINE: a boot that failed
 * because a chunk did not arrive cannot be told "your stylesheet will explain it".
 *
 * Two deliberate narrownesses:
 * 1. **It is a BOOT guard, not a global error reporter.** The window listeners raise the card only
 *    until `markBootReached()` says a scene is on screen. After that an error belongs to a running
 *    game and the card would replace a working page with a tombstone. Scene swaps after boot stay
 *    covered, because the imports that build them go through `guardedImport` and that one always
 *    raises the card.
 * 2. **It reports to nobody.** The task asked for the error class to reach the existing telemetry
 *    beacon "only if the beacon already accepts a client-error kind (do not add a kind; say if none
 *    exists)". None exists: `RunTelemetryPayload` (src/telemetry/payload.ts:16) is run-shaped and
 *    `functions/api/telemetry.ts:26` accepts `stage: 'secure' | 'end' | 'legacy'` and nothing else.
 *    Adding a kind would mean touching the payload shape and `functions/**`, both firewalled. So
 *    the card is the whole report, plus one `console.error` for whoever is looking.
 */

const CARD_TESTID = 'boot-failure-card';

export type BootFailureKind = 'chunk' | 'script' | 'webgl';

type CardCopy = { title: string; line: string };

/**
 * In-canon, warm, no meta-speak, no blame (canon guardrails: GOLD_RUSH_BRIEF §9). One title, one
 * sentence, one button, exactly as the task specifies.
 */
const CARD_COPY: Record<BootFailureKind, CardCopy> = {
  chunk: {
    title: 'The trail washed out.',
    line: 'Part of the way in never arrived. Give it another go and the claim will be waiting.',
  },
  script: {
    title: 'The trail washed out.',
    line: 'Something on the way in came apart. Give it another go and the claim will be waiting.',
  },
  webgl: {
    title: 'This window cannot see the valley.',
    line: 'The claim is drawn with hardware graphics this browser is not offering; try another browser, or switch hardware acceleration on.',
  },
};

let listenersInstalled = false;
let bootReached = false;
let cardShown = false;
let webgl2Probe: boolean | undefined;

/** Registers the three boot listeners. Idempotent, so a second call from a test costs nothing. */
export function installBootGuard(): void {
  if (listenersInstalled) return;
  listenersInstalled = true;
  window.addEventListener('error', onWindowError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
  // Vite's own signal for a chunk whose network fetch failed. It fires on the window, carries the
  // failing payload, and is the only honest way to tell "the module 404'd" from "the module threw".
  window.addEventListener('vite:preloadError', onPreloadError);
}

/**
 * A scene is on screen. From here the window listeners stop raising the card: a later error is an
 * in-run fault for the run's own surfaces to report, not a reason to blank a working game.
 */
export function markBootReached(): void {
  bootReached = true;
}

/**
 * Is a `webgl2` context obtainable at all? Probed once and cached, and the probe's own context is
 * released immediately: browsers cap live WebGL contexts (commonly 16), and the check must never be
 * the reason the real renderer cannot have one.
 */
export function webgl2Available(): boolean {
  if (webgl2Probe !== undefined) return webgl2Probe;
  try {
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2');
    webgl2Probe = Boolean(context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2Probe = false;
  }
  return webgl2Probe;
}

/**
 * Wraps one dynamic import. On failure it raises the card and returns a promise that NEVER settles,
 * which is the deliberate choice of three bad options: rethrowing would trip an unhandled rejection
 * on every caller that uses `void import(...)`, and resolving with a stub would run the caller's
 * continuation against a module that does not exist. A page showing the card is finished; its job
 * now is to say so and stay still.
 */
export function guardedImport<T>(label: string, load: () => Promise<T>): Promise<T> {
  return load().catch((error: unknown) => {
    showBootFailureCard('chunk', `${label}: ${describe(error)}`);
    return new Promise<T>(() => undefined);
  });
}

/** Renders the card once. Later failures are logged and fold into the card already on screen. */
export function showBootFailureCard(kind: BootFailureKind, detail: string): void {
  console.error(`[boot-guard] ${kind}: ${detail}`);
  if (cardShown) return;
  cardShown = true;
  try {
    renderCard(CARD_COPY[kind], kind);
  } catch (error) {
    // A guard that throws is worse than no guard: the console line above is already filed.
    console.error('[boot-guard] the failure card could not be rendered.', error);
  }
}

/** Test seam: the card's own testid, so a spec never has to re-type the string. */
export const BOOT_FAILURE_CARD_TESTID = CARD_TESTID;

function onWindowError(event: ErrorEvent): void {
  if (bootReached) return;
  showBootFailureCard('script', describe(event.error ?? event.message));
}

function onUnhandledRejection(event: PromiseRejectionEvent): void {
  if (bootReached) return;
  showBootFailureCard('script', describe(event.reason));
}

function onPreloadError(event: Event): void {
  if (bootReached) return;
  const payload = (event as Event & { payload?: unknown }).payload;
  showBootFailureCard('chunk', describe(payload));
}

function renderCard(copy: CardCopy, kind: BootFailureKind): void {
  const existing = document.querySelector(`[data-testid="${CARD_TESTID}"]`);
  existing?.remove();

  const card = document.createElement('section');
  card.dataset.testid = CARD_TESTID;
  card.dataset.bootFailureKind = kind;
  card.setAttribute('role', 'alert');
  card.setAttribute('aria-live', 'assertive');
  // Inline, because the stylesheet is one of the things that may not have arrived. Parchment and
  // ink, the menu's own palette, legible at 390px and at 1280.
  card.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'padding:24px',
    'background:#161412',
    'font-family:Georgia,"Iowan Old Style","Times New Roman",serif',
  ].join(';');

  const panel = document.createElement('div');
  panel.style.cssText = [
    'max-width:34rem',
    'width:100%',
    'box-sizing:border-box',
    'padding:28px 26px',
    'border:1px solid #6b5636',
    'border-radius:10px',
    'background:#efe2c6',
    'color:#2a2118',
    'text-align:center',
    'box-shadow:0 18px 48px rgba(0,0,0,0.55)',
  ].join(';');

  const title = document.createElement('h1');
  title.dataset.testid = 'boot-failure-title';
  title.textContent = copy.title;
  title.style.cssText = 'margin:0 0 12px;font-size:1.45rem;line-height:1.2;color:#2a2118';

  const line = document.createElement('p');
  line.dataset.testid = 'boot-failure-line';
  line.textContent = copy.line;
  line.style.cssText = 'margin:0 0 20px;font-size:1rem;line-height:1.5';

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.testid = 'boot-failure-reload';
  button.textContent = 'Reload';
  button.style.cssText = [
    'font:inherit',
    'font-size:1rem',
    'padding:10px 22px',
    'min-height:44px',
    'cursor:pointer',
    'color:#efe2c6',
    'background:#5d4326',
    'border:1px solid #2a2118',
    'border-radius:6px',
  ].join(';');
  button.addEventListener('click', () => window.location.reload());

  panel.append(title, line, button);
  card.append(panel);
  (document.body ?? document.documentElement).append(card);
  button.focus({ preventScroll: true });
}

// Armed by the IMPORT, not by a call from `main.ts`. Module bodies evaluate before the importing
// module's first statement, so every module `main.ts` imports AFTER this one is already covered when
// it throws on the way in. `installBootGuard` stays exported and idempotent so the boot can state
// the intent out loud and a test can re-arm.
installBootGuard();

function describe(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return value;
  try {
    return String(value);
  } catch {
    return 'unreadable failure';
  }
}
