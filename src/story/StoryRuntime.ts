import './story.css';
import { STORY_BEATS, type StoryBeat } from './beats';
import { hasStoryBeatSeen, markStoryBeatSeen } from './seenState';
import { emitStorySignal, onStorySignal, STORY_SIGNAL_REGISTRY, type StorySignal } from './signals';
import { STORY_SPEAKERS } from './speakers';
import { readStoryTalesEnabled, subscribeStorySettings } from './settings';

const CARD_MS = 6000;
const GAP_MS = 3000;

type QueueItem = {
  beat: StoryBeat;
  key: string;
  lines: readonly string[];
  signal: StorySignal;
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
  private queue: QueueItem[] = [];
  private active: QueueItem | null = null;
  private dismissTimer = 0;
  private scheduleTimer = 0;
  private lastDismissedAt = 0;
  private pointerCleanup: () => void = () => undefined;
  private readonly onDocumentPointerDown = () => this.dismiss();

  constructor(parent: HTMLElement) {
    this.root.className = 'story-beat-layer';
    this.root.dataset.testid = 'story-beat-layer';
    parent.append(this.root);
    this.unsubscribeSignal = onStorySignal((signal) => this.receive(signal));
    this.unsubscribeSettings = subscribeStorySettings(() => {
      if (!readStoryTalesEnabled()) this.clearQueue();
    });
    this.installDebugHandle();
  }

  dispose(): void {
    window.clearTimeout(this.dismissTimer);
    window.clearTimeout(this.scheduleTimer);
    this.pointerCleanup();
    this.unsubscribeSignal();
    this.unsubscribeSettings();
    this.root.remove();
    if (installed === this) installed = null;
  }

  private receive(signal: StorySignal): void {
    if (!readStoryTalesEnabled()) return;
    for (const beat of STORY_BEATS) {
      if (beat.trigger !== signal.type || (beat.when && !beat.when(signal))) continue;
      const key = beat.seenKey?.(signal) ?? beat.id;
      if (beat.oncePerProfile && hasStoryBeatSeen(key)) continue;
      const lines = this.linesFor(beat, signal);
      if (lines.length === 0) continue;
      if (beat.oncePerProfile) markStoryBeatSeen(key);
      this.queue.push({ beat, key, lines, signal });
    }
    this.schedule();
  }

  private linesFor(beat: StoryBeat, signal: StorySignal): readonly string[] {
    const lines = typeof beat.lines === 'function' ? beat.lines(signal) : beat.lines;
    return lines.map((line) => line.trim()).filter(Boolean).slice(0, 2);
  }

  private schedule(): void {
    if (this.active || this.queue.length === 0) return;
    window.clearTimeout(this.scheduleTimer);
    const now = Date.now();
    const waitForGap = Math.max(0, this.lastDismissedAt + GAP_MS - now);
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
    this.render(item);
    this.setupPointer(item.beat.pointer);
    document.addEventListener('pointerdown', this.onDocumentPointerDown, { capture: true, once: true });
    window.clearTimeout(this.dismissTimer);
    this.dismissTimer = window.setTimeout(() => this.dismiss(), CARD_MS);
    window.requestAnimationFrame(() => {
      this.root.querySelector('[data-testid="story-beat-card"]')?.classList.add('story-beat-card--visible');
    });
  }

  private render(item: QueueItem): void {
    const speaker = STORY_SPEAKERS[item.beat.speaker];
    this.root.innerHTML = `
      <article class="story-beat-card" data-testid="story-beat-card" data-beat-id="${escapeHtml(item.key)}" data-speaker="${
        speaker.id
      }" aria-live="polite" role="status">
        <img class="story-beat-card__portrait" data-testid="story-beat-portrait" alt="" src="${speaker.portraitUrl}" style="object-position:${
          speaker.objectPosition
        }" />
        <div class="story-beat-card__copy">
          <p class="story-beat-card__speaker">${escapeHtml(speaker.name)}</p>
          ${item.lines.map((line) => `<p class="story-beat-card__line">${escapeHtml(line)}</p>`).join('')}
        </div>
      </article>
    `;
  }

  private dismiss(): void {
    this.pointerCleanup();
    if (!this.active) return;
    window.clearTimeout(this.dismissTimer);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, { capture: true });
    this.root.innerHTML = '';
    this.active = null;
    this.lastDismissedAt = Date.now();
    this.schedule();
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
        emit: emitStorySignal,
        registry: [...STORY_SIGNAL_REGISTRY],
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
