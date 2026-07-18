import './story.css';
import { STORY_RUNTIME_BEATS, type RuntimeStoryBeat } from './beats';
import { hasStoryBeatSeen, markStoryBeatSeen } from './seenState';
import { emitStorySignal, onStorySignal, STORY_RUNTIME_SIGNAL_REGISTRY, type RuntimeStorySignal } from './signals';
import { STORY_SPEAKERS } from './speakers';
import { readStoryTalesEnabled, subscribeStorySettings } from './settings';
import { SoundSystem } from '../audio/SoundSystem';

const CARD_MS = 6000;
const GAP_MS = 3000;
const ceremonyArtLoaders = import.meta.glob<string>('../../assets/processed/kit-*.png', {
  query: '?url',
  import: 'default',
});

type QueueItem = {
  beat: RuntimeStoryBeat;
  key: string;
  lines: readonly string[];
  signal: RuntimeStorySignal;
};

let installed: StoryRuntime | null = null;

export function installStoryRuntime(parent: HTMLElement = document.body): StoryRuntime {
  installed ??= new StoryRuntime(parent);
  return installed;
}

export class StoryRuntime {
  private readonly root = document.createElement('div');
  private readonly unsubscribeSignal: () => void;
  private readonly unsubscribeSettings: () => void;
  private readonly audio = new SoundSystem();
  private readonly postscriptBeats = import('./ceremonyPostscripts').then((module) => module.CEREMONY_POSTSCRIPT_BEATS);
  private queue: QueueItem[] = [];
  private active: QueueItem | null = null;
  private dismissTimer = 0;
  private scheduleTimer = 0;
  private lastDismissedAt = 0;
  private pointerCleanup: () => void = () => undefined;
  private ceremonyCleanup: () => void = () => undefined;
  private readonly onDocumentPointerDown = () => this.dismiss();

  constructor(parent: HTMLElement) {
    this.root.className = 'story-beat-layer';
    this.root.dataset.testid = 'story-beat-layer';
    parent.append(this.root);
    this.unsubscribeSignal = onStorySignal((signal) => void this.receive(signal));
    this.unsubscribeSettings = subscribeStorySettings(() => {
      if (!readStoryTalesEnabled()) this.clearQueue();
    });
    this.installDebugHandle();
  }

  dispose(): void {
    window.clearTimeout(this.dismissTimer);
    window.clearTimeout(this.scheduleTimer);
    this.pointerCleanup();
    this.ceremonyCleanup();
    this.audio.dispose();
    this.unsubscribeSignal();
    this.unsubscribeSettings();
    this.root.remove();
    if (installed === this) installed = null;
  }

  private async receive(signal: RuntimeStorySignal): Promise<void> {
    if (!readStoryTalesEnabled()) {
      finishStorySignal(signal);
      return;
    }
    const items: QueueItem[] = [];
    for (const beat of [...STORY_RUNTIME_BEATS, ...(await this.postscriptBeats)]) {
      if ('postscriptOnly' in signal && signal.postscriptOnly && !beat.id.startsWith('wd04-postscript-')) continue;
      if (beat.trigger !== signal.type || (beat.when && !beat.when(signal))) continue;
      const key = beat.seenKey?.(signal) ?? beat.id;
      const aliases = beat.seenKeyAliases?.map((seenKey) => seenKey(signal)) ?? [];
      if (beat.oncePerProfile && this.onceBeatAlreadyHandled([key, ...aliases], items)) continue;
      const lines = this.linesFor(beat, signal);
      if (lines.length === 0) continue;
      items.push({ beat, key, lines, signal });
    }
    items.sort((left, right) => ceremonyOrder(left.beat) - ceremonyOrder(right.beat));
    if (items.length === 0) {
      finishStorySignal(signal);
      return;
    }
    if (signal.type === 'run-return-town' || signal.type === 'epoch-activated') {
      const interrupted = this.interruptActiveBeat();
      this.queue.unshift(...items, ...(interrupted ? [interrupted] : []));
    } else {
      this.queue.push(...items);
    }
    this.schedule();
  }

  private linesFor(beat: RuntimeStoryBeat, signal: RuntimeStorySignal): readonly string[] {
    const lines = typeof beat.lines === 'function' ? beat.lines(signal) : beat.lines;
    return lines.map((line) => line.trim()).filter(Boolean).slice(0, 2);
  }

  private onceBeatAlreadyHandled(keys: readonly string[], batch: readonly QueueItem[]): boolean {
    return keys.some(
      (key) =>
        hasStoryBeatSeen(key) ||
        this.active?.key === key ||
        this.queue.some((item) => item.key === key) ||
        batch.some((item) => item.key === key),
    );
  }

  private schedule(): void {
    if (this.active || this.queue.length === 0) return;
    window.clearTimeout(this.scheduleTimer);
    const now = Date.now();
    const ceremonyNext = this.queue[0]?.beat.presentation === 'epoch-ceremony';
    const waitForGap = ceremonyNext ? 0 : Math.max(0, this.lastDismissedAt + GAP_MS - now);
    const waitForBanner = this.waveBannerVisible() ? 250 : 0;
    const delay = Math.max(waitForGap, waitForBanner);
    if (delay > 0) {
      this.scheduleTimer = window.setTimeout(() => this.schedule(), delay);
      return;
    }
    const item = this.queue.shift();
    if (item) this.show(item);
  }

  private show(item: QueueItem): void {
    this.active = item;
    const ceremony = item.beat.presentation === 'epoch-ceremony';
    this.root.classList.toggle('story-beat-layer--ceremony', ceremony);
    this.render(item);
    if (item.beat.oncePerProfile) markStoryBeatSeen(item.key);
    this.setupPointer(item.beat.pointer);
    if (ceremony) {
      this.setupCeremonyControls();
      void this.loadCeremonyArt(item);
      for (const queued of this.queue) {
        if (queued.beat.presentation === 'epoch-ceremony') void this.ceremonyArtUrls(queued);
      }
      if (item.beat.ceremonyStep === 'mill') this.audio.play('epoch-door-sting');
    } else {
      document.addEventListener('pointerdown', this.onDocumentPointerDown, { capture: true, once: true });
    }
    window.clearTimeout(this.dismissTimer);
    this.dismissTimer = window.setTimeout(() => this.dismiss(), item.beat.durationMs ?? CARD_MS);
    window.requestAnimationFrame(() => {
      this.root.querySelector('[data-testid="story-beat-card"]')?.classList.add('story-beat-card--visible');
    });
  }

  private render(item: QueueItem): void {
    const speaker = STORY_SPEAKERS[item.beat.speaker];
    const ceremony = item.beat.presentation === 'epoch-ceremony';
    this.root.innerHTML = `
      <article class="story-beat-card${ceremony ? ' story-beat-card--ceremony' : ''}" data-testid="story-beat-card" data-beat-id="${escapeHtml(
        item.key,
      )}" data-speaker="${speaker.id}" data-art-key="${escapeHtml(item.beat.artKey ?? '')}" data-ceremony-step="${escapeHtml(
        item.beat.ceremonyStep ?? '',
      )}" aria-live="polite" role="${ceremony ? 'dialog' : 'status'}" ${ceremony ? 'aria-modal="true"' : ''}>
        ${ceremony ? '<div class="story-beat-card__backdrop" data-story-ceremony-backdrop aria-hidden="true"></div><div class="story-beat-card__vignette" data-story-ceremony-vignette aria-hidden="true"></div>' : ''}
        <img class="story-beat-card__portrait" data-testid="story-beat-portrait" alt="" src="${speaker.portraitUrl}" style="object-position:${
          speaker.objectPosition
        }" />
        <div class="story-beat-card__copy">
          <p class="story-beat-card__speaker">${escapeHtml(speaker.name)}</p>
          ${item.lines.map((line) => `<p class="story-beat-card__line">${escapeHtml(line)}</p>`).join('')}
        </div>
        ${
          ceremony
            ? `<div class="story-beat-card__ceremony-actions">
                <button type="button" data-story-ceremony-continue>${item.beat.ceremonyStep === 'title' ? 'Enter the Steamworks' : 'Continue'}</button>
                <button type="button" data-story-ceremony-skip>Skip ceremony</button>
              </div>`
            : ''
        }
      </article>
    `;
  }

  private async ceremonyArtUrls(item: QueueItem): Promise<string[]> {
    const artKey = item.beat.artKey;
    if (!artKey) return [];
    const keys = item.beat.ceremonyStep === 'valley' ? [outgoingEraKey(artKey), artKey] : [artKey];
    const urls = await Promise.all(
      keys.map(async (key) => ceremonyArtLoaders[`../../assets/processed/${key}.png`]?.().catch(() => undefined)),
    );
    return urls.filter((url): url is string => Boolean(url));
  }

  private async loadCeremonyArt(item: QueueItem): Promise<void> {
    const urls = await this.ceremonyArtUrls(item);
    if (this.active !== item || urls.length === 0) return;
    const backdrop = this.root.querySelector<HTMLElement>('[data-story-ceremony-backdrop]');
    if (!backdrop) return;
    backdrop.style.setProperty('--ceremony-art', `url("${urls.at(-1)}")`);
    if (urls.length > 1) backdrop.style.setProperty('--ceremony-art-outgoing', `url("${urls[0]}")`);
    backdrop.dataset.artLoaded = 'true';
  }

  private dismiss(): void {
    this.pointerCleanup();
    this.ceremonyCleanup();
    if (!this.active) return;
    const ceremony = this.active.beat.presentation === 'epoch-ceremony';
    window.clearTimeout(this.dismissTimer);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, { capture: true });
    const signal = this.active.signal;
    this.root.innerHTML = '';
    this.root.classList.remove('story-beat-layer--ceremony');
    this.active = null;
    finishStorySignal(signal);
    this.lastDismissedAt = ceremony ? 0 : Date.now();
    this.schedule();
  }

  private interruptActiveBeat(): QueueItem | null {
    if (!this.active) return null;
    const active = this.active;
    this.pointerCleanup();
    this.ceremonyCleanup();
    window.clearTimeout(this.dismissTimer);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, { capture: true });
    this.root.innerHTML = '';
    this.root.classList.remove('story-beat-layer--ceremony');
    this.active = null;
    return active;
  }

  private setupPointer(selector: string | undefined): void {
    this.pointerCleanup();
    this.pointerCleanup = () => undefined;
    if (!selector) return;
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    target.classList.add('story-pointer-glow');
    target.dataset.storyPointer = 'true';
    const clear = () => this.pointerCleanup();
    const events = ['pointerdown', 'click', 'keydown', 'input', 'change'] as const;
    for (const event of events) target.addEventListener(event, clear, { once: true });
    this.pointerCleanup = () => {
      target.classList.remove('story-pointer-glow');
      delete target.dataset.storyPointer;
      for (const event of events) target.removeEventListener(event, clear);
      this.pointerCleanup = () => undefined;
    };
  }

  private setupCeremonyControls(): void {
    this.ceremonyCleanup();
    const continueButton = this.root.querySelector<HTMLButtonElement>('[data-story-ceremony-continue]');
    const skipButton = this.root.querySelector<HTMLButtonElement>('[data-story-ceremony-skip]');
    const continueCeremony = () => this.dismiss();
    const skipCeremony = () => {
      this.queue = this.queue.filter((item) => item.beat.presentation !== 'epoch-ceremony');
      this.dismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skipCeremony();
      else if (event.key === 'Enter') continueCeremony();
      else return;
      event.preventDefault();
      event.stopPropagation();
    };
    continueButton?.addEventListener('click', continueCeremony);
    skipButton?.addEventListener('click', skipCeremony);
    window.addEventListener('keydown', onKeyDown, true);
    continueButton?.focus({ preventScroll: true });
    this.ceremonyCleanup = () => {
      continueButton?.removeEventListener('click', continueCeremony);
      skipButton?.removeEventListener('click', skipCeremony);
      window.removeEventListener('keydown', onKeyDown, true);
      this.ceremonyCleanup = () => undefined;
    };
  }

  private clearQueue(): void {
    this.queue = [];
    this.dismiss();
  }

  private waveBannerVisible(): boolean {
    return document.querySelector('#hud.hud--announcement-visible') !== null;
  }

  private installDebugHandle(): void {
    try {
      window.__GR_STORY__ = {
        emit: (signal: RuntimeStorySignal) => emitStorySignal(signal),
        registry: [...STORY_RUNTIME_SIGNAL_REGISTRY],
        active: () => this.active?.key ?? null,
        pending: () => this.queue.map((item) => item.key),
        talesEnabled: () => readStoryTalesEnabled(),
      };
    } catch {}
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}

function ceremonyOrder(beat: RuntimeStoryBeat): number {
  return beat.id.startsWith('wd04-postscript-') ? 1 : beat.presentation === 'epoch-ceremony' ? 0 : 2;
}

function finishStorySignal(signal: RuntimeStorySignal): void {
  if (signal.type === 'science-complete') signal.afterStory?.();
}

function outgoingEraKey(artKey: string): string {
  return artKey.replace(/(kit-era-)(\d+)$/, (_, prefix: string, era: string) => `${prefix}${Math.max(1, Number(era) - 1)}`);
}
