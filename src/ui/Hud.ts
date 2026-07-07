import type { UiSnapshot } from '../systems/UiBridge';
import type { BuildableId } from '../game/buildables';
import type { AgentAbility } from '../agent/AgentConsent';
import type { AgentPermissionLevel } from '../agent/PermissionLadder';
import { BuildButton } from './BuildButton';
import { ProspectorPanel } from './ProspectorPanel';

const prospectorPortraitUrl = new URL('../../assets/processed/char-prospector-portrait.png', import.meta.url).href;

export type UiIntent =
  | { type: 'restart' | 'toggle_build_menu' | 'close_build_menu' | 'pause' }
  | { type: 'select_buildable'; id: BuildableId | string }
  | { type: 'set_agent_rung'; level: AgentPermissionLevel; granted: boolean }
  | { type: 'set_agent_ability'; ability: AgentAbility; granted: boolean };

export type PauseMetaSnapshot = {
  science: string;
  territory: string;
  boons: Array<{ name: string; effect: string }>;
  mastery: Array<{ name: string; effect: string }>;
};

type HudElements = {
  root: HTMLElement;
  metaRecap: HTMLElement;
  pauseMeta: HTMLElement;
  hpText: HTMLElement;
  hpFill: HTMLElement;
  goldText: HTMLElement;
  goldPanel: HTMLElement;
  weaponChip: HTMLElement;
  agentChip: HTMLElement;
  agentDetail: HTMLElement;
  agentName: HTMLElement;
  agentLevel: HTMLElement;
  agentLabel: HTMLElement;
  agentFeed: HTMLElement;
  xpText: HTMLElement;
  xpFill: HTMLElement;
  levelText: HTMLElement;
  waveText: HTMLElement;
  waveEdge: HTMLElement;
  waveNumber: HTMLElement;
  timeText: HTMLElement;
  pauseHint: HTMLElement;
  buildMount: HTMLElement;
};

export class Hud {
  private readonly elements: HudElements;
  private lastGold = 0;
  private lastAnnouncement: string | null = null;
  private lastAnnouncementAt = -1;
  private announcementClearTimer = 0;
  private metaRecapClearTimer = 0;
  private pauseMetaKey = '';
  private readonly buildButton: BuildButton;
  private readonly prospectorPanel: ProspectorPanel;
  private prospectorPanelOpen = false;

  constructor(root: HTMLElement, private readonly onIntent: (intent: UiIntent) => void) {
    root.innerHTML = `
      <div class="hud-meta-recap" data-testid="run-meta-recap" aria-live="polite" hidden></div>

      <div class="hud__wave" data-testid="hud-wave" aria-label="Wave status">
        <span class="hud__wave-edge" data-testid="hud-edge" data-hud-edge aria-hidden="true"></span>
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

      <section class="hud-panel hud-panel--weapon" data-testid="hud-weapon" aria-label="Active weapon">
        <span class="hud-label">Weapon</span>
        <strong class="hud-value" data-hud-weapon>Spark Rig</strong>
        <button class="hud-agent-chip" type="button" data-testid="hud-agent" aria-label="Prospector permission chip" aria-expanded="false">
          <img class="hud-agent-chip__portrait" src="${prospectorPortraitUrl}" alt="" data-hud-agent-portrait />
          <span class="hud-agent-chip__main">
            <span data-hud-agent-name>the Prospector</span>
            <strong data-hud-agent-level>L0</strong>
            <span data-hud-agent-label>suggest-only</span>
          </span>
          <span class="hud-agent-feed" data-testid="hud-agent-feed" data-hud-agent-feed aria-live="polite"></span>
          <span class="hud-agent-detail" data-hud-agent-detail aria-hidden="true"></span>
        </button>
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

      <section class="hud-panel hud-panel--build" data-testid="hud-build-panel" aria-label="Build">
        <div data-hud-build></div>
      </section>

      <section class="hud-panel hud-panel--meta" data-testid="pause-meta-panel" aria-label="Claim memory" hidden></section>

      <button class="hud-pause" type="button" data-testid="hud-pause" data-hud-pause>
        P - catch your breath
      </button>
    `;

    this.elements = {
      root,
      metaRecap: this.get(root, '[data-testid="run-meta-recap"]'),
      pauseMeta: this.get(root, '[data-testid="pause-meta-panel"]'),
      hpText: this.get(root, '[data-hud-hp]'),
      hpFill: this.get(root, '[data-hud-hp-fill]'),
      goldText: this.get(root, '[data-hud-gold]'),
      goldPanel: this.get(root, '[data-testid="hud-gold"]'),
      weaponChip: this.get(root, '[data-hud-weapon]'),
      agentChip: this.get(root, '[data-testid="hud-agent"]'),
      agentDetail: this.get(root, '[data-hud-agent-detail]'),
      agentName: this.get(root, '[data-hud-agent-name]'),
      agentLevel: this.get(root, '[data-hud-agent-level]'),
      agentLabel: this.get(root, '[data-hud-agent-label]'),
      agentFeed: this.get(root, '[data-hud-agent-feed]'),
      xpText: this.get(root, '[data-hud-xp]'),
      xpFill: this.get(root, '[data-hud-xp-fill]'),
      levelText: this.get(root, '[data-hud-level]'),
      waveText: this.get(root, '[data-hud-wave]'),
      waveEdge: this.get(root, '[data-hud-edge]'),
      waveNumber: this.get(root, '[data-hud-wave-number]'),
      timeText: this.get(root, '[data-hud-time]'),
      pauseHint: this.get(root, '[data-hud-pause]'),
      buildMount: this.get(root, '[data-hud-build]'),
    };
    this.buildButton = new BuildButton(this.onIntent);
    this.elements.buildMount.append(this.buildButton.element);
    this.prospectorPanel = new ProspectorPanel(prospectorPortraitUrl, this.onIntent, () => this.setProspectorPanelOpen(false));
    root.append(this.prospectorPanel.element);

    this.elements.pauseHint.addEventListener('click', this.onPauseClick);
    this.elements.agentChip.addEventListener('click', this.onAgentChipClick);
    window.addEventListener('keydown', this.onKeyDown, { capture: true });
  }

  update(snapshot: UiSnapshot, meta: PauseMetaSnapshot, showPauseMeta = snapshot.paused): void {
    this.elements.hpText.textContent = `${snapshot.hp} / ${snapshot.maxHp}`;
    this.elements.hpFill.style.width = `${this.percent(snapshot.hp, snapshot.maxHp)}%`;
    this.elements.goldText.textContent = this.goldText(snapshot);
    this.elements.weaponChip.textContent = snapshot.weapon === 'blast' ? 'Blast Charge' : 'Spark Rig';
    this.elements.weaponChip.dataset.weapon = snapshot.weapon;
    this.elements.agentName.textContent = snapshot.agent?.name ?? 'the Prospector';
    this.elements.agentLevel.textContent = `L${snapshot.agent?.permissionLevel ?? 0}`;
    this.elements.agentLabel.textContent = snapshot.agent?.permissionLabel ?? 'suggest-only';
    this.elements.agentChip.dataset.level = String(snapshot.agent?.permissionLevel ?? 0);
    this.elements.agentDetail.textContent = agentAbilityDetail(snapshot.agent?.permissionLevel ?? 0);
    this.elements.agentFeed.textContent = snapshot.agent?.receiptFeed[0] ?? '';
    this.prospectorPanel.update(snapshot);
    this.elements.xpText.textContent = `${snapshot.xp} / ${snapshot.xpNeed} XP`;
    this.elements.xpFill.style.width = `${this.percent(snapshot.xp, snapshot.xpNeed)}%`;
    this.elements.levelText.textContent = snapshot.level.toString();
    this.elements.waveNumber.textContent = snapshot.wave.toString();
    this.elements.timeText.textContent = this.formatTime(snapshot.timeAlive);
    this.updateAnnouncement(snapshot);
    this.elements.root.dataset.runState = snapshot.state;
    this.elements.root.dataset.paused = String(snapshot.paused);
    this.elements.pauseHint.textContent = snapshot.paused ? 'P - back to the claim' : 'P - catch your breath';
    this.updatePauseMeta(showPauseMeta, meta);
    this.buildButton.update(snapshot);

    if (snapshot.gold !== this.lastGold) {
      this.elements.goldPanel.classList.remove('hud-panel--tick');
      this.elements.goldText.classList.remove('hud-value--gold-pop');
      void this.elements.goldPanel.offsetWidth;
      this.elements.goldPanel.classList.add('hud-panel--tick');
      this.elements.goldText.classList.add('hud-value--gold-pop');
      this.lastGold = snapshot.gold;
    }
  }

  dispose(): void {
    this.elements.pauseHint.removeEventListener('click', this.onPauseClick);
    this.elements.agentChip.removeEventListener('click', this.onAgentChipClick);
    window.removeEventListener('keydown', this.onKeyDown, { capture: true });
    this.prospectorPanel.dispose();
    this.buildButton.dispose();
    window.clearTimeout(this.announcementClearTimer);
    window.clearTimeout(this.metaRecapClearTimer);
  }

  showMetaRecap(text: string | null, durationSeconds = 4): void {
    window.clearTimeout(this.metaRecapClearTimer);
    if (!text) {
      this.elements.metaRecap.hidden = true;
      this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
      return;
    }
    this.elements.metaRecap.textContent = text;
    this.elements.metaRecap.hidden = false;
    this.elements.metaRecap.classList.add('hud-meta-recap--visible');
    this.metaRecapClearTimer = window.setTimeout(() => {
      this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
      this.elements.metaRecap.hidden = true;
    }, Math.min(4, Math.max(0.1, durationSeconds)) * 1000);
  }

  private readonly onPauseClick = () => {
    this.onIntent({ type: 'pause' });
  };

  private readonly onAgentChipClick = () => {
    this.setProspectorPanelOpen(!this.prospectorPanelOpen);
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (event.code === 'KeyG') {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.setProspectorPanelOpen(!this.prospectorPanelOpen);
    } else if (event.code === 'Escape' && this.prospectorPanelOpen) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.setProspectorPanelOpen(false);
    }
  };

  private setProspectorPanelOpen(open: boolean): void {
    this.prospectorPanelOpen = open;
    this.elements.agentChip.dataset.open = String(open);
    this.elements.agentChip.setAttribute('aria-expanded', String(open));
    this.elements.agentDetail.setAttribute('aria-hidden', String(!open));
    this.prospectorPanel.setOpen(open);
  }

  private percent(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, (value / max) * 100));
  }

  private formatTime(secondsAlive: number): string {
    const minutes = Math.floor(secondsAlive / 60).toString().padStart(2, '0');
    const seconds = Math.floor(secondsAlive % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private goldText(snapshot: UiSnapshot): string {
    return snapshot.gold >= snapshot.bankCap * 0.8 || snapshot.stockpileCount > 0
      ? `${snapshot.gold}/${snapshot.bankCap}`
      : snapshot.gold.toString();
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
    this.elements.waveEdge.textContent = snapshot.announcementEdge ? edgeGlyph(snapshot.announcementEdge) : '';
    this.elements.waveEdge.dataset.edge = snapshot.announcementEdge ?? '';
    this.elements.root.classList.add('hud--announcement-visible');
    this.announcementClearTimer = window.setTimeout(() => {
      if (this.lastAnnouncement === snapshot.announcement && this.lastAnnouncementAt === snapshot.announcementAt) {
        this.elements.root.classList.remove('hud--announcement-visible');
      }
    }, Math.max(0.1, snapshot.announcementDurationSeconds) * 1000);
  }

  private get(root: HTMLElement, selector: string): HTMLElement {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing HUD element: ${selector}`);
    return element;
  }

  private updatePauseMeta(paused: boolean, meta: PauseMetaSnapshot): void {
    const key = paused ? JSON.stringify(meta) : '';
    if (key === this.pauseMetaKey) return;
    this.pauseMetaKey = key;
    if (paused) {
      this.elements.metaRecap.classList.remove('hud-meta-recap--visible');
      this.elements.metaRecap.hidden = true;
    }
    this.elements.pauseMeta.hidden = !paused;
    if (!paused) return;

    this.elements.pauseMeta.innerHTML = `
      <p class="hud-meta__eyebrow">Claim Memory</p>
      <p class="hud-meta__line" data-testid="pause-meta-science">${this.escape(meta.science)}</p>
      <p class="hud-meta__line" data-testid="pause-meta-territory">${this.escape(meta.territory)}</p>
      <p class="hud-meta__label">Active Research</p>
      <ul class="hud-meta__list" data-testid="pause-meta-boons">
        ${this.renderMetaLines(meta.boons, '0 active research boons', '0 named family effects earned.')}
      </ul>
      <p class="hud-meta__label">Mastery</p>
      <ul class="hud-meta__list" data-testid="pause-meta-mastery">
        ${this.renderMetaLines(meta.mastery, '0 mastery tracks exposed', '0 mastery conversions active.')}
      </ul>
    `;
  }

  private renderMetaLines(lines: PauseMetaSnapshot['boons'], emptyName: string, emptyEffect: string): string {
    const source = lines.length > 0 ? lines : [{ name: emptyName, effect: emptyEffect }];
    return source
      .map(
        (line) => `
          <li>
            <strong>${this.escape(line.name)}</strong>
            <span>${this.escape(line.effect)}</span>
          </li>
        `,
      )
      .join('');
  }

  private escape(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '"') return '&quot;';
      return '&#39;';
    });
  }
}

function edgeGlyph(edge: UiSnapshot['announcementEdge']): string {
  if (edge === 'north') return 'N';
  if (edge === 'south') return 'S';
  if (edge === 'east') return 'E';
  if (edge === 'west') return 'W';
  return '';
}

function agentAbilityDetail(level: number): string {
  if (level >= 3) return 'Can gather XP motes, tend walls, and work claim pans. Grows when secured claims add agent progress.';
  if (level >= 2) return 'Can gather XP motes and tend walls when trusted. Grows when secured claims add agent progress.';
  if (level >= 1) return 'Can gather XP motes and handle chores when approved. Grows when secured claims add agent progress.';
  return 'Follows you, observes the claim, and suggests work. Grows when secured claims add agent progress.';
}
