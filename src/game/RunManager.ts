import type { EventBus, RunSummary } from '../core/EventBus';
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
};

type InstallOptions = {
  storage?: MetaProgressStorage;
};

export class RunManager {
  private host?: RunManagerHost;
  private offHeroDied?: () => void;
  private restoreResetRun?: () => void;
  private runId = 0;
  private meta: MetaProgress = freshMetaProgress();
  private debugReadout?: HTMLElement;

  constructor(
    private readonly game: unknown,
    private readonly options: InstallOptions = {},
  ) {}

  install(): this {
    if (this.host) return this;

    const host = resolveHost(this.game);
    this.host = host;
    this.meta = this.options.storage ? loadMetaProgress(this.options.storage) : loadBrowserMeta();
    this.offHeroDied = host.events.on('hero_died', (event) => this.endRun(event.at, event.wavesSurvived));
    this.patchResetRun();
    this.renderDebugReadout();
    this.startRun(0);
    return this;
  }

  dispose(): void {
    this.offHeroDied?.();
    this.restoreResetRun?.();
    this.debugReadout?.remove();
    this.host = undefined;
  }

  get metaProgress(): MetaProgress {
    return this.meta;
  }

  private startRun(at: number): void {
    if (!this.host) return;
    this.runId += 1;
    this.host.events.emit({ type: 'run_started', at, runId: this.runId });
  }

  private endRun(at: number, fallbackWave: number): void {
    if (!this.host) return;
    this.host.events.emit({
      type: 'run_ended',
      at,
      runId: this.runId,
      summary: summarizeRun(this.host.economy.log, this.host.wave() ?? fallbackWave),
    });
  }

  private patchResetRun(): void {
    const target = this.game as { resetRun?: () => void };
    if (typeof target.resetRun !== 'function') return;

    const original = target.resetRun;
    target.resetRun = () => {
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
  };

  if (!host.events || !host.economy) {
    throw new Error('RunManager.install requires game.events and game.economy');
  }

  return {
    events: host.events,
    economy: host.economy,
    wave: () => host.waveSystem?.diagnostics?.wave,
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
