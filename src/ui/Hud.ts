import type { UiSnapshot } from '../systems/UiBridge';

export type UiIntent = { type: 'restart' | 'toggle_build' | 'pause' };

type HudElements = {
  root: HTMLElement;
  hpText: HTMLElement;
  hpFill: HTMLElement;
  goldText: HTMLElement;
  goldPanel: HTMLElement;
  xpText: HTMLElement;
  xpFill: HTMLElement;
  levelText: HTMLElement;
  waveText: HTMLElement;
  waveNumber: HTMLElement;
  timeText: HTMLElement;
  pauseHint: HTMLElement;
};

export class Hud {
  private readonly elements: HudElements;
  private lastGold = 0;
  private lastAnnouncement: string | null = null;
  private lastAnnouncementAt = -1;
  private announcementClearTimer = 0;

  constructor(root: HTMLElement, private readonly onIntent: (intent: UiIntent) => void) {
    root.innerHTML = `
      <div class="hud__wave" data-testid="hud-wave" aria-label="Wave status">
        <span data-hud-wave>Stake your claim.</span>
      </div>

      <section class="hud-panel hud-panel--vitals" data-testid="hud-vitals" aria-label="Run vitals">
        <div class="hud-row">
          <span class="hud-label">HP</span>
          <strong class="hud-value" data-hud-hp>100 / 100</strong>
        </div>
        <div class="hud-bar" aria-hidden="true">
          <div class="hud-bar__fill hud-bar__fill--hp" data-hud-hp-fill></div>
        </div>
        <div class="hud-row hud-row--split">
          <span class="hud-label">Time</span>
          <strong class="hud-value" data-hud-time>00:00</strong>
        </div>
        <div class="hud-row hud-row--split">
          <span class="hud-label">Wave</span>
          <strong class="hud-value" data-hud-wave-number>0</strong>
        </div>
      </section>

      <section class="hud-panel hud-panel--gold" data-testid="hud-gold" aria-label="Gold pouch">
        <span class="hud-coin" aria-hidden="true"></span>
        <span class="hud-label">Gold</span>
        <strong class="hud-value" data-hud-gold>0</strong>
      </section>

      <section class="hud-panel hud-panel--xp" data-testid="hud-xp" aria-label="Experience">
        <div class="hud-row">
          <span class="hud-label">Level <strong data-hud-level>1</strong></span>
          <strong class="hud-value" data-hud-xp>0 / 12 XP</strong>
        </div>
        <div class="hud-bar" aria-hidden="true">
          <div class="hud-bar__fill hud-bar__fill--xp" data-hud-xp-fill></div>
        </div>
      </section>

      <button class="hud-pause" type="button" data-testid="hud-pause" data-hud-pause>
        P - catch your breath
      </button>
    `;

    this.elements = {
      root,
      hpText: this.get(root, '[data-hud-hp]'),
      hpFill: this.get(root, '[data-hud-hp-fill]'),
      goldText: this.get(root, '[data-hud-gold]'),
      goldPanel: this.get(root, '[data-testid="hud-gold"]'),
      xpText: this.get(root, '[data-hud-xp]'),
      xpFill: this.get(root, '[data-hud-xp-fill]'),
      levelText: this.get(root, '[data-hud-level]'),
      waveText: this.get(root, '[data-hud-wave]'),
      waveNumber: this.get(root, '[data-hud-wave-number]'),
      timeText: this.get(root, '[data-hud-time]'),
      pauseHint: this.get(root, '[data-hud-pause]'),
    };

    this.elements.pauseHint.addEventListener('click', this.onPauseClick);
  }

  update(snapshot: UiSnapshot): void {
    this.elements.hpText.textContent = `${snapshot.hp} / ${snapshot.maxHp}`;
    this.elements.hpFill.style.width = `${this.percent(snapshot.hp, snapshot.maxHp)}%`;
    this.elements.goldText.textContent = snapshot.gold.toString();
    this.elements.xpText.textContent = `${snapshot.xp} / ${snapshot.xpNeed} XP`;
    this.elements.xpFill.style.width = `${this.percent(snapshot.xp, snapshot.xpNeed)}%`;
    this.elements.levelText.textContent = snapshot.level.toString();
    this.elements.waveNumber.textContent = snapshot.wave.toString();
    this.elements.timeText.textContent = this.formatTime(snapshot.timeAlive);
    this.updateAnnouncement(snapshot);
    this.elements.root.dataset.runState = snapshot.state;
    this.elements.root.dataset.paused = String(snapshot.paused);
    this.elements.pauseHint.textContent = snapshot.paused ? 'P - back to the claim' : 'P - catch your breath';

    if (snapshot.gold !== this.lastGold) {
      this.elements.goldPanel.classList.remove('hud-panel--tick');
      void this.elements.goldPanel.offsetWidth;
      this.elements.goldPanel.classList.add('hud-panel--tick');
      this.lastGold = snapshot.gold;
    }
  }

  dispose(): void {
    this.elements.pauseHint.removeEventListener('click', this.onPauseClick);
    window.clearTimeout(this.announcementClearTimer);
  }

  private readonly onPauseClick = () => {
    this.onIntent({ type: 'pause' });
  };

  private percent(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  private formatTime(secondsAlive: number): string {
    const minutes = Math.floor(secondsAlive / 60).toString().padStart(2, '0');
    const seconds = Math.floor(secondsAlive % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private updateAnnouncement(snapshot: UiSnapshot): void {
    const changed =
      snapshot.announcement !== this.lastAnnouncement || snapshot.announcementAt !== this.lastAnnouncementAt;
    if (!changed) return;

    this.lastAnnouncement = snapshot.announcement;
    this.lastAnnouncementAt = snapshot.announcementAt;
    window.clearTimeout(this.announcementClearTimer);

    if (!snapshot.announcement) {
      this.elements.root.classList.remove('hud--announcement-visible');
      return;
    }

    this.elements.waveText.textContent = snapshot.announcement;
    this.elements.root.classList.add('hud--announcement-visible');
    this.announcementClearTimer = window.setTimeout(() => {
      if (this.lastAnnouncement === snapshot.announcement && this.lastAnnouncementAt === snapshot.announcementAt) {
        this.elements.root.classList.remove('hud--announcement-visible');
      }
    }, 4_000);
  }

  private get(root: HTMLElement, selector: string): HTMLElement {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing HUD element: ${selector}`);
    return element;
  }
}
