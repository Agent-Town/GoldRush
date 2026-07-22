import { isPauseDisabled } from '../core/DebugParams';
import type { EventBus, RunEndReason, RunSummary } from '../core/EventBus';
import { Balance } from './Balance';
import type { EconomyEvent } from './Economy';
import {
  META_TRACKS,
  addMetaPayout,
  agentAutonomyLevel,
  freshMetaProgress,
  loadMetaProgress,
  saveMetaProgress,
  type MetaPayout,
  type MetaProgress,
  type MetaProgressStorage,
  type MetaTrack,
} from './MetaProgress';
import { RunSuspendController, type RunSuspendDiagnostics, type RunSuspendWrite } from './RunSuspend';

type EconomyLog = {
  log: readonly EconomyEvent[];
};

type RunManagerHost = {
  events: EventBus;
  economy: EconomyLog;
  wave: () => number | undefined;
  secureWave?: () => number | undefined;
  at: () => number | undefined;
  setPaused?: (paused: boolean) => void;
  resetRun?: () => void;
  applyMetaProgress?: (meta: MetaProgress, options?: { placeDefenses?: boolean }) => void;
  securePayoutMult?: () => Partial<Record<MetaTrack, number>> | undefined;
  secureBark?: () => string | undefined;
  secureLedgerLine?: () => string | undefined;
  secureCallout?: () => string | undefined;
  onSuspendWrite?: (write: RunSuspendWrite) => void;
};

type InstallOptions = {
  storage?: MetaProgressStorage;
  onSecureChoice?: (choice: 'bank' | 'rush') => boolean;
};

export type RunManagerSuspendState = {
  secured: boolean;
  rush: boolean;
  securedAtWave: number;
  resultAt: number | null;
  meta: MetaProgress;
  payout: MetaPayout | null;
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
  private securedAtWave = 0;
  private securedResultAt: number | null = null;
  private lastRunEndedReason: RunEndReason | null = null;
  private meta: MetaProgress = freshMetaProgress();
  private storage?: MetaProgressStorage;
  private paidRunId = 0;
  private lastPayout: MetaPayout | null = null;
  private debugReadout?: HTMLElement;
  private secureOverlay?: HTMLElement;
  private securedChip?: HTMLElement;
  private runSuspend?: RunSuspendController;
  private pendingSuspendState: RunManagerSuspendState | null = null;

  constructor(
    private readonly game: unknown,
    private readonly options: InstallOptions = {},
  ) {}

  install(): this {
    if (this.host) return this;

    const host = resolveHost(this.game);
    this.host = host;
    this.storage = this.options.storage ?? browserStorage();
    this.meta = this.storage ? loadMetaProgress(this.storage) : freshMetaProgress();
    host.applyMetaProgress?.(this.meta);
    this.runSuspend = new RunSuspendController(this.game, () => this.meta).install();
    this.offHeroDied = host.events.on('hero_died', (event) =>
      this.endRun(this.stayedForRushRunId === this.runId ? 'rush' : 'death', event.at, event.wavesSurvived),
    );
    this.offWaveStarted = host.events.on('wave_started', (event) => {
      const write = this.runSuspend?.captureBoundary(event.wave, event.at);
      if (write) host.onSuspendWrite?.(write);
      this.maybeSecureRun(event.wave);
    });
    this.patchResetRun();
    this.renderDebugReadout();
    this.startRun(0);
    return this;
  }

  dispose(): void {
    this.offHeroDied?.();
    this.offWaveStarted?.();
    this.restoreResetRun?.();
    this.runSuspend?.dispose();
    this.hideSecureOverlay();
    this.hideSecuredChip();
    this.debugReadout?.remove();
    this.host = undefined;
  }

  get metaProgress(): MetaProgress {
    return this.meta;
  }

  captureSuspend(): RunManagerSuspendState {
    const secured = this.securedRunId === this.runId;
    return {
      secured,
      rush: this.stayedForRushRunId === this.runId,
      securedAtWave: secured ? this.securedAtWave : 0,
      resultAt: secured ? this.securedResultAt : null,
      meta: cloneMeta(this.meta),
      payout: secured && this.lastPayout ? { ...this.lastPayout } : null,
    };
  }

  restoreSuspend(
    state: RunManagerSuspendState,
    options: { materializeMeta?: boolean; persistMeta?: boolean } = {},
  ): void {
    this.meta = cloneMeta(state.meta);
    if (options.persistMeta && this.storage) this.meta = saveMetaProgress(this.storage, this.meta);
    this.host?.applyMetaProgress?.(this.meta, { placeDefenses: options.materializeMeta !== false });
    if (this.runId === 0) {
      this.pendingSuspendState = cloneSuspendState(state);
      this.hideSecureOverlay();
      this.renderDebugReadoutValue();
      return;
    }
    this.applySuspendRunState(state);
  }

  finalizeSuspendRestore(): void {
    this.hideSecureOverlay();
    if (this.securedRunId === this.runId && this.stayedForRushRunId !== this.runId) {
      this.renderSecureOverlay(this.host?.wave() ?? Balance.run.secureWave);
    } else if (this.stayedForRushRunId === this.runId) {
      this.renderSecuredChip();
    }
  }

  private applySuspendRunState(state: RunManagerSuspendState): void {
    this.securedRunId = state.secured ? this.runId : 0;
    this.stayedForRushRunId = state.rush ? this.runId : 0;
    this.paidRunId = state.secured ? this.runId : 0;
    this.securedAtWave = state.secured
      ? state.securedAtWave || Math.min(this.host?.wave() ?? 0, this.host?.secureWave?.() ?? this.host?.wave() ?? 0)
      : 0;
    this.securedResultAt = state.secured ? state.resultAt : null;
    this.lastPayout = state.payout ? { ...state.payout } : null;
    this.endedRunId = 0;
    this.lastRunEndedReason = null;
    this.hideSecureOverlay();
    this.renderDebugReadoutValue();
  }

  get diagnostics(): {
    secured: boolean;
    rush: boolean;
    lastRunEndedReason: RunEndReason | null;
    meta: MetaProgress;
    victoryPayout: MetaPayout | null;
    secureWaveReached: number | null;
    securedResultAt: number | null;
    suspend: RunSuspendDiagnostics;
  } {
    return {
      secured: this.securedRunId === this.runId,
      rush: this.stayedForRushRunId === this.runId,
      lastRunEndedReason: this.lastRunEndedReason,
      meta: this.meta,
      victoryPayout: this.lastPayout,
      secureWaveReached: this.securedRunId === this.runId ? this.securedAtWave : null,
      securedResultAt: this.securedRunId === this.runId ? this.securedResultAt : null,
      suspend: this.runSuspend?.diagnostics() ?? {
        hasSuspend: false,
        restored: false,
        restoredWave: null,
        lastWriteAt: null,
        lastWriteMs: null,
        sizeBytes: 0,
      },
    };
  }

  endSecuredRun(): boolean {
    if (!this.host || this.securedRunId !== this.runId) return false;
    this.awardSecuredClaim();
    this.hideSecureOverlay();
    this.host.setPaused?.(false);
    this.endRun('secured', this.host.at() ?? 0, this.host.secureWave?.() ?? Balance.run.secureWave);
    this.host.resetRun?.();
    this.host.setPaused?.(true);
    return true;
  }

  secureCurrentRun(wave: number = this.host?.wave() ?? 0): boolean {
    if (!this.host || this.securedRunId === this.runId || this.endedRunId === this.runId) return false;
    this.secureRun(wave);
    return true;
  }

  stayForRush(): boolean {
    if (!this.host || this.securedRunId !== this.runId) return false;
    this.stayedForRushRunId = this.runId;
    this.hideSecureOverlay();
    this.renderSecuredChip();
    this.host.setPaused?.(false);
    const write = this.runSuspend?.captureCurrent(this.host.wave() ?? this.securedAtWave, this.host.at() ?? 0);
    if (write) this.host.onSuspendWrite?.(write);
    return true;
  }

  private startRun(at: number): void {
    if (!this.host) return;
    this.runId += 1;
    this.securedAtWave = 0;
    this.securedResultAt = null;
    this.hideSecuredChip();
    this.host.events.emit({ type: 'run_started', at, runId: this.runId });
    if (this.pendingSuspendState) {
      this.applySuspendRunState(this.pendingSuspendState);
      this.pendingSuspendState = null;
      this.finalizeSuspendRestore();
    }
  }

  private endRun(reason: RunEndReason, at: number, fallbackWave: number): void {
    if (!this.host) return;
    if (this.endedRunId === this.runId) return;
    this.endedRunId = this.runId;
    this.lastRunEndedReason = reason;
    this.hideSecureOverlay();
    this.hideSecuredChip();
    this.runSuspend?.clear();
    const deepestWave = Math.max(this.host.wave() ?? fallbackWave, fallbackWave);
    const summary = summarizeRun(this.host.economy.log, deepestWave);
    if (this.securedRunId === this.runId) {
      summary.secureWaveReached = this.securedAtWave;
      summary.deepestWave = deepestWave;
    }
    if (reason === 'secured') this.awardSecuredClaim();
    this.host.events.emit({
      type: 'run_ended',
      at,
      runId: this.runId,
      reason,
      summary,
    });
  }

  private maybeSecureRun(wave: number): void {
    const secureWave = this.host?.secureWave?.() ?? Balance.run.secureWave;
    if (!this.host || secureWave <= 0 || wave < secureWave) return;
    if (this.securedRunId === this.runId || this.endedRunId === this.runId) return;
    this.secureRun(wave);
  }

  private secureRun(wave: number): void {
    if (!this.host) return;
    this.securedRunId = this.runId;
    this.securedAtWave = Math.max(0, Math.min(wave, this.host.secureWave?.() ?? wave));
    this.securedResultAt = Date.now();
    this.awardSecuredClaim();
    this.host.events.emit({
      type: 'run_secured',
      at: this.host.at() ?? 0,
      runId: this.runId,
      secureWave: this.securedAtWave,
      resultAt: this.securedResultAt,
      summary: {
        ...summarizeRun(this.host.economy.log, wave),
        secureWaveReached: this.securedAtWave,
        deepestWave: wave,
      },
    });
    if (isPauseDisabled()) {
      this.stayedForRushRunId = this.runId;
      this.renderSecuredChip();
      const write = this.runSuspend?.captureCurrent(wave, this.host.at() ?? 0);
      if (write) this.host.onSuspendWrite?.(write);
      return;
    }
    const write = this.runSuspend?.captureCurrent(wave, this.host.at() ?? 0);
    if (write) this.host.onSuspendWrite?.(write);
    this.host.setPaused?.(true);
    this.renderSecureOverlay(wave);
  }

  private patchResetRun(): void {
    const target = this.game as { resetRun?: () => void };
    if (typeof target.resetRun !== 'function') return;

    const original = target.resetRun;
    target.resetRun = () => {
      this.hideSecureOverlay();
      this.hideSecuredChip();
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

  private renderDebugReadoutValue(): void {
    if (this.debugReadout) this.debugReadout.textContent = formatMetaProgress(this.meta);
  }

  private renderSecureOverlay(wave: number): void {
    if (!this.host) return;
    const parent = globalThis.document?.querySelector<HTMLElement>('#app');
    if (!parent) return;

    const summary = summarizeRun(this.host.economy.log, wave);
    const payout = this.lastPayout ?? zeroPayout();
    const territoryReady = this.meta.tracks.territory >= Balance.meta.territoryTier1;
    const customBark = this.host.secureBark?.();
    const customLedgerLine = this.host.secureLedgerLine?.();
    const customCallout = this.host.secureCallout?.();
    this.hideSecureOverlay();
    const root = document.createElement('section');
    root.className = 'death-overlay death-overlay--visible gr-run-overlay';
    root.dataset.testid = 'claim-secured';
    root.setAttribute('aria-label', 'Claim Secured');
    root.innerHTML = `
      <div class="death-overlay__panel">
        <p class="death-overlay__eyebrow">Secure Claim</p>
        <h1>Claim Secured</h1>
        <p class="death-overlay__flavor">The win is banked. Ride home with the claim, or stay for the Rush and press your luck.</p>
        <dl class="death-overlay__ledger">
          <div><dt>Waves Held</dt><dd>${summary.wavesSurvived}</dd></div>
          <div><dt>Gold Panned</dt><dd>${renderActorSplit(summary.goldPanned, summary.goldPannedByProspector, 'summary-gold-panned-split')}</dd></div>
          <div><dt>Gold Reclaimed</dt><dd>${renderActorSplit(summary.goldReclaimed, summary.goldReclaimedByProspector, 'summary-gold-reclaimed-split')}</dd></div>
          <div><dt>Buildings Raised</dt><dd>${summary.buildingsBuilt}</dd></div>
          ${customLedgerLine ? `<div data-testid="run-ledger-baron"><dt>Contract Moment</dt><dd>${escapeHtml(customLedgerLine)}</dd></div>` : ''}
        </dl>
        <section class="claim-office" data-testid="claim-office" aria-label="Claim Office">
          <h2>Claim Office</h2>
          <p class="claim-office__bark">${customBark ? escapeHtml(customBark) : 'The Prospector tips his hat: &ldquo;Struck it proper, partner.&rdquo;'}</p>
          ${customCallout ? `<p class="claim-office__baron-callout" data-testid="baron-defeat-callout">${escapeHtml(customCallout)}</p>` : ''}
          <ul class="claim-office__payout" data-testid="claim-payout">
            ${META_TRACKS.map(
              (track) => `
                <li data-track="${track}" data-testid="claim-payout-${track}">
                  <span>${trackLabel(track)}</span>
                  <strong>+${payout[track]}</strong>
                  <span class="claim-office__stamp">Stamped</span>
                </li>
              `,
            ).join('')}
          </ul>
          <p class="claim-office__tier" data-testid="territory-tier-one">${
            territoryReady ? 'Next claim: palisade ring ready; the gaps are your kill-lanes.' : 'Next claim: territory ledger banked.'
          }</p>
        </section>
        <div class="gr-run-overlay__actions">
          <button class="death-overlay__button" type="button" data-testid="bank-secured-claim">Return to Town</button>
          <button class="death-overlay__button death-overlay__button--secondary" type="button" data-testid="stay-for-rush">Stay for the Rush</button>
        </div>
      </div>
    `;
    root
      .querySelector<HTMLButtonElement>('[data-testid="bank-secured-claim"]')
      ?.addEventListener('click', () => {
        if (!this.options.onSecureChoice?.('bank')) this.endSecuredRun();
      });
    root.querySelector<HTMLButtonElement>('[data-testid="stay-for-rush"]')?.addEventListener('click', () => {
      if (!this.options.onSecureChoice?.('rush')) this.stayForRush();
    });
    parent.append(root);
    this.secureOverlay = root;
  }

  private awardSecuredClaim(): MetaPayout {
    if (this.paidRunId === this.runId && this.lastPayout) return this.lastPayout;

    const payout = zeroPayout();
    const multipliers = this.host?.securePayoutMult?.() ?? {};
    for (const track of META_TRACKS) payout[track] = Balance.meta.victoryPayout[track] * (multipliers[track] ?? 1);
    this.meta = addMetaPayout(this.meta, payout);
    if (this.storage) this.meta = saveMetaProgress(this.storage, this.meta);
    this.lastPayout = payout;
    this.paidRunId = this.runId;
    if (this.debugReadout) this.debugReadout.textContent = formatMetaProgress(this.meta);
    return payout;
  }

  private hideSecureOverlay(): void {
    this.secureOverlay?.remove();
    this.secureOverlay = undefined;
  }

  private renderSecuredChip(): void {
    const parent = globalThis.document?.querySelector<HTMLElement>('#hud');
    if (!parent) return;
    this.hideSecuredChip();
    const chip = document.createElement('div');
    chip.className = 'hud-claim-secured';
    chip.dataset.testid = 'claim-secured-chip';
    chip.setAttribute('role', 'status');
    chip.innerHTML = '<strong>CLAIM SECURED &#10003;</strong><span>The win is banked.</span>';
    parent.append(chip);
    this.securedChip = chip;
  }

  private hideSecuredChip(): void {
    this.securedChip?.remove();
    this.securedChip = undefined;
  }
}

export function install(game: unknown, options: InstallOptions = {}): RunManager {
  return new RunManager(game, options).install();
}

export function summarizeRun(log: readonly EconomyEvent[], wavesSurvived: number): RunSummary {
  const summary: RunSummary = {
    wavesSurvived,
    goldPanned: 0,
    goldPannedByProspector: 0,
    goldStolen: 0,
    goldReclaimed: 0,
    goldReclaimedByProspector: 0,
    buildingsBuilt: 0,
  };

  for (const event of log) {
    if (event.type === 'run_reset') {
      summary.goldPanned = 0;
      summary.goldPannedByProspector = 0;
      summary.goldStolen = 0;
      summary.goldReclaimed = 0;
      summary.goldReclaimedByProspector = 0;
      summary.buildingsBuilt = 0;
      continue;
    }
    if (event.type === 'gold_panned') {
      summary.goldPanned += event.amount;
      if (event.actor === 'prospector') summary.goldPannedByProspector += event.amount;
    }
    if (event.type === 'gold_stolen') summary.goldStolen += event.amount;
    if (event.type === 'gold_reclaimed') {
      summary.goldReclaimed += event.amount;
      if (event.actor === 'prospector') summary.goldReclaimedByProspector += event.amount;
    }
    if (event.type === 'gold_spent' && event.sink.startsWith('build_')) summary.buildingsBuilt += 1;
  }

  return summary;
}

function renderActorSplit(total: number, prospector: number, testId: string): string {
  if (prospector <= 0) return `${total}`;
  return `<span data-testid="${testId}">you ${total - prospector} / the Prospector ${prospector}</span>`;
}

function resolveHost(game: unknown): RunManagerHost {
  const host = game as {
    events?: EventBus;
    economy?: EconomyLog;
    waveSystem?: { diagnostics?: { wave?: number } };
    secureWaveForRun?: () => number;
    timeAlive?: number;
    state?: { setPaused?: (paused: boolean) => void };
    resetRun?: () => void;
    applyMetaProgress?: (meta: MetaProgress, options?: { placeDefenses?: boolean }) => void;
    autoSecureWaveForRun?: () => number;
    securePayoutMultForRun?: () => Partial<Record<MetaTrack, number>> | undefined;
    secureBarkForRun?: () => string | undefined;
    secureLedgerLineForRun?: () => string | undefined;
    secureCalloutForRun?: () => string | undefined;
    onRunSuspendWrite?: (write: RunSuspendWrite) => void;
  };

  if (!host.events || !host.economy) {
    throw new Error('RunManager.install requires game.events and game.economy');
  }

  return {
    events: host.events,
    economy: host.economy,
    wave: () => host.waveSystem?.diagnostics?.wave,
    secureWave: () => host.autoSecureWaveForRun?.() ?? host.secureWaveForRun?.(),
    at: () => host.timeAlive,
    setPaused: (paused) => host.state?.setPaused?.(paused),
    resetRun: () => host.resetRun?.(),
    applyMetaProgress: (meta, applyOptions) => host.applyMetaProgress?.(meta, applyOptions),
    securePayoutMult: () => host.securePayoutMultForRun?.(),
    secureBark: () => host.secureBarkForRun?.(),
    secureLedgerLine: () => host.secureLedgerLineForRun?.(),
    secureCallout: () => host.secureCalloutForRun?.(),
    onSuspendWrite: (write) => host.onRunSuspendWrite?.(write),
  };
}

function browserStorage(): MetaProgressStorage | undefined {
  try {
    const storage = globalThis.localStorage;
    return storage || undefined;
  } catch {
    return undefined;
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

function cloneMeta(meta: MetaProgress): MetaProgress {
  return { version: 1, tracks: { ...meta.tracks } };
}

function cloneSuspendState(state: RunManagerSuspendState): RunManagerSuspendState {
  return { ...state, meta: cloneMeta(state.meta), payout: state.payout ? { ...state.payout } : null };
}

function zeroPayout(): MetaPayout {
  return { territory: 0, science: 0, hero: 0, agent: 0 };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function trackLabel(track: (typeof META_TRACKS)[number]): string {
  if (track === 'territory') return 'Territory';
  if (track === 'science') return 'Science';
  if (track === 'hero') return 'Hero';
  return 'Agent';
}
