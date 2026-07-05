import { isPauseDisabled } from '../core/DebugParams';
import type { EventBus, RunEndReason, RunSummary } from '../core/EventBus';
import { Balance } from './Balance';
import type { EconomyEvent } from './Economy';
import {
  META_TRACKS,
  agentAutonomyLevel,
  freshMetaProgress,
  loadMetaProgress,
  type MetaProgress,
  type MetaProgressStorage,
} from './MetaProgress';

type EconomyLog = {
  log: readonly EconomyEvent[];
};

type RunManagerHost = {
  events: EventBus;
  economy: EconomyLog;
  wave: () => number | undefined;
  at: () => number | undefined;
  setPaused?: (paused: boolean) => void;
  resetRun?: () => void;
};

type InstallOptions = {
  storage?: MetaProgressStorage;
};

export class RunManager {
  private host?: RunManagerHost;
  private offHeroDied?: () => void;
  private offWaveStarted?: () => void;
  private restoreResetRun?: () => void;
  private runId = 0;
  private securedRunId = 0;
  private stayedForRushRunId = 0;
  private endedRunId = 0;
  private lastRunEndedReason: RunEndReason | null = null;
  private meta: MetaProgress = freshMetaProgress();
  private debugReadout?: HTMLElement;
  private secureOverlay?: HTMLElement;

  constructor(
    private readonly game: unknown,
    private readonly options: InstallOptions = {},
  ) {}

  install(): this {
    if (this.host) return this;

    const host = resolveHost(this.game);
    this.host = host;
    this.meta = this.options.storage ? loadMetaProgress(this.options.storage) : loadBrowserMeta();
    this.offHeroDied = host.events.on('hero_died', (event) =>
      this.endRun(this.stayedForRushRunId === this.runId ? 'rush' : 'death', event.at, event.wavesSurvived),
    );
    this.offWaveStarted = host.events.on('wave_started', (event) => this.maybeSecureRun(event.wave));
    this.patchResetRun();
    this.renderDebugReadout();
    this.startRun(0);
    return this;
  }

  dispose(): void {
    this.offHeroDied?.();
    this.offWaveStarted?.();
    this.restoreResetRun?.();
    this.hideSecureOverlay();
    this.debugReadout?.remove();
    this.host = undefined;
  }

  get metaProgress(): MetaProgress {
    return this.meta;
  }

  get diagnostics(): { secured: boolean; rush: boolean; lastRunEndedReason: RunEndReason | null } {
    return {
      secured: this.securedRunId === this.runId,
      rush: this.stayedForRushRunId === this.runId,
      lastRunEndedReason: this.lastRunEndedReason,
    };
  }

  endSecuredRun(): boolean {
    if (!this.host || this.securedRunId !== this.runId) return false;
    this.hideSecureOverlay();
    this.host.setPaused?.(false);
    this.endRun('secured', this.host.at() ?? 0, this.host.wave() ?? 0);
    this.host.resetRun?.();
    return true;
  }

  stayForRush(): boolean {
    if (!this.host || this.securedRunId !== this.runId) return false;
    this.stayedForRushRunId = this.runId;
    this.hideSecureOverlay();
    this.host.setPaused?.(false);
    return true;
  }

  private startRun(at: number): void {
    if (!this.host) return;
    this.runId += 1;
    this.host.events.emit({ type: 'run_started', at, runId: this.runId });
  }

  private endRun(reason: RunEndReason, at: number, fallbackWave: number): void {
    if (!this.host) return;
    if (this.endedRunId === this.runId) return;
    this.endedRunId = this.runId;
    this.lastRunEndedReason = reason;
    this.hideSecureOverlay();
    this.host.events.emit({
      type: 'run_ended',
      at,
      runId: this.runId,
      reason,
      summary: summarizeRun(this.host.economy.log, this.host.wave() ?? fallbackWave),
    });
  }

  private maybeSecureRun(wave: number): void {
    if (!this.host || Balance.run.secureWave <= 0 || wave < Balance.run.secureWave) return;
    if (this.securedRunId === this.runId || this.endedRunId === this.runId) return;
    this.securedRunId = this.runId;
    if (isPauseDisabled()) {
      this.stayedForRushRunId = this.runId;
      return;
    }
    this.host.setPaused?.(true);
    this.renderSecureOverlay(wave);
  }

  private patchResetRun(): void {
    const target = this.game as { resetRun?: () => void };
    if (typeof target.resetRun !== 'function') return;

    const original = target.resetRun;
    target.resetRun = () => {
      this.hideSecureOverlay();
      original.call(this.game);
      this.startRun(0);
    };
    this.restoreResetRun = () => {
      target.resetRun = original;
    };
  }

  private renderDebugReadout(): void {
    if (!isDebugPage()) return;

    const documentRef = globalThis.document;
    if (!documentRef?.body) return;

    const readout = documentRef.createElement('output');
    readout.id = 'gr-meta-debug';
    readout.dataset.debug = 'meta-progress';
    readout.textContent = formatMetaProgress(this.meta);
    documentRef.body.append(readout);
    this.debugReadout = readout;
  }

  private renderSecureOverlay(wave: number): void {
    if (!this.host) return;
    const parent = globalThis.document?.querySelector<HTMLElement>('#app');
    if (!parent) return;

    const summary = summarizeRun(this.host.economy.log, wave);
    this.hideSecureOverlay();
    const root = document.createElement('section');
    root.className = 'death-overlay death-overlay--visible gr-run-overlay';
    root.dataset.testid = 'claim-secured';
    root.setAttribute('aria-label', 'Claim Secured');
    root.innerHTML = `
      <div class="death-overlay__panel">
        <p class="death-overlay__eyebrow">Secure Claim</p>
        <h1>Claim Secured</h1>
        <p class="death-overlay__flavor">The assay is sealed. Bank the claim or ride deeper into the rush.</p>
        <dl class="death-overlay__ledger">
          <div><dt>Waves Held</dt><dd>${summary.wavesSurvived}</dd></div>
          <div><dt>Gold Panned</dt><dd>${summary.goldPanned}</dd></div>
          <div><dt>Gold Reclaimed</dt><dd>${summary.goldReclaimed}</dd></div>
          <div><dt>Buildings Raised</dt><dd>${summary.buildingsBuilt}</dd></div>
        </dl>
        <div class="gr-run-overlay__actions">
          <button class="death-overlay__button" type="button" data-testid="bank-secured-claim">Bank claim</button>
          <button class="death-overlay__button" type="button" data-testid="stay-for-rush">Stay for the Rush</button>
        </div>
      </div>
    `;
    root
      .querySelector<HTMLButtonElement>('[data-testid="bank-secured-claim"]')
      ?.addEventListener('click', () => this.endSecuredRun());
    root.querySelector<HTMLButtonElement>('[data-testid="stay-for-rush"]')?.addEventListener('click', () => this.stayForRush());
    parent.append(root);
    this.secureOverlay = root;
  }

  private hideSecureOverlay(): void {
    this.secureOverlay?.remove();
    this.secureOverlay = undefined;
  }
}

export function install(game: unknown, options: InstallOptions = {}): RunManager {
  return new RunManager(game, options).install();
}

export function summarizeRun(log: readonly EconomyEvent[], wavesSurvived: number): RunSummary {
  const summary: RunSummary = {
    wavesSurvived,
    goldPanned: 0,
    goldStolen: 0,
    goldReclaimed: 0,
    buildingsBuilt: 0,
  };

  for (const event of log) {
    if (event.type === 'run_reset') {
      summary.goldPanned = 0;
      summary.goldStolen = 0;
      summary.goldReclaimed = 0;
      summary.buildingsBuilt = 0;
      continue;
    }
    if (event.type === 'gold_panned') summary.goldPanned += event.amount;
    if (event.type === 'gold_stolen') summary.goldStolen += event.amount;
    if (event.type === 'gold_reclaimed') summary.goldReclaimed += event.amount;
    if (event.type === 'gold_spent' && event.sink.startsWith('build_')) summary.buildingsBuilt += 1;
  }

  return summary;
}

function resolveHost(game: unknown): RunManagerHost {
  const host = game as {
    events?: EventBus;
    economy?: EconomyLog;
    waveSystem?: { diagnostics?: { wave?: number } };
    timeAlive?: number;
    state?: { setPaused?: (paused: boolean) => void };
    resetRun?: () => void;
  };

  if (!host.events || !host.economy) {
    throw new Error('RunManager.install requires game.events and game.economy');
  }

  return {
    events: host.events,
    economy: host.economy,
    wave: () => host.waveSystem?.diagnostics?.wave,
    at: () => host.timeAlive,
    setPaused: (paused) => host.state?.setPaused?.(paused),
    resetRun: () => host.resetRun?.(),
  };
}

function loadBrowserMeta(): MetaProgress {
  try {
    const storage = globalThis.localStorage;
    return storage ? loadMetaProgress(storage) : freshMetaProgress();
  } catch {
    return freshMetaProgress();
  }
}

function isDebugPage(): boolean {
  try {
    return new URLSearchParams(globalThis.location?.search ?? '').has('debug');
  } catch {
    return false;
  }
}

function formatMetaProgress(meta: MetaProgress): string {
  const tracks = META_TRACKS.map((track) => `${track}: ${meta.tracks[track]}`).join(' | ');
  return `Meta ${tracks} | agent autonomy: ${agentAutonomyLevel(meta)}`;
}
