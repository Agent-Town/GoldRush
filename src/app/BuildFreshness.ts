const CHECK_INTERVAL_MS = 5 * 60_000;
const IDLE_RELOAD_MS = 60_000;

type VersionStamp = { build: string; builtAt: string };

export function installBuildFreshness(app: HTMLElement, canAutoReload: () => boolean): () => void {
  let newerBuildKnown = false;
  let lastActivityAt = Date.now();
  let reloadTimer = 0;

  const toast = document.createElement('button');
  toast.type = 'button';
  toast.dataset.testid = 'fresh-build-toast';
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = 'Fresh ink — a newer build is out. Refresh keeps your place.';
  Object.assign(toast.style, {
    position: 'fixed',
    zIndex: '1000',
    right: 'max(16px, env(safe-area-inset-right))',
    bottom: 'max(16px, env(safe-area-inset-bottom))',
    maxWidth: 'min(420px, calc(100vw - 32px))',
    border: '2px solid #8b7d3c',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#2e1b0e',
    background: '#f5e6c8',
    boxShadow: '0 8px 28px rgba(0, 0, 0, .35)',
    font: '700 15px/1.35 Wellfleet, Georgia, serif',
    textAlign: 'left',
    cursor: 'pointer',
  });
  toast.addEventListener('click', () => window.location.reload());

  const maybeAutoReload = () => {
    window.clearTimeout(reloadTimer);
    if (!newerBuildKnown) return;
    const remaining = IDLE_RELOAD_MS - (Date.now() - lastActivityAt);
    if (remaining <= 0 && canAutoReload()) {
      window.location.reload();
      return;
    }
    reloadTimer = window.setTimeout(maybeAutoReload, Math.max(1_000, remaining));
  };

  const check = async () => {
    try {
      const response = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const stamp = (await response.json()) as Partial<VersionStamp>;
      if (typeof stamp.build !== 'string' || stamp.build === __APP_BUILD__) return;
      newerBuildKnown = true;
      if (!toast.isConnected) app.append(toast);
      maybeAutoReload();
    } catch {
      // Freshness checks are advisory; offline play remains available.
    }
  };

  const noteActivity = () => {
    lastActivityAt = Date.now();
    maybeAutoReload();
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void check();
  };
  for (const event of ['pointerdown', 'keydown'] as const) window.addEventListener(event, noteActivity, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  const interval = window.setInterval(() => void check(), CHECK_INTERVAL_MS);
  void check();

  return () => {
    window.clearInterval(interval);
    window.clearTimeout(reloadTimer);
    for (const event of ['pointerdown', 'keydown'] as const) window.removeEventListener(event, noteActivity);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    toast.remove();
  };
}
