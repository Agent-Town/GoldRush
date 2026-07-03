import { upgradeEffect, type UpgradeDef, type UpgradeId } from '../game/Upgrades';

export type UpgradeChoice = {
  def: UpgradeDef;
  stacks: number;
};

export type UpgradeIntent = {
  type: 'pick_upgrade';
  index: number;
};

export class UpgradeOverlay {
  private readonly root: HTMLElement;
  private readonly cards: HTMLButtonElement[] = [];
  private visible = false;
  private choices: UpgradeChoice[] = [];
  private offerKey = '';

  constructor(parent: HTMLElement, private readonly onIntent: (intent: UpgradeIntent) => void) {
    this.root = document.createElement('section');
    this.root.className = 'upgrade-overlay';
    this.root.dataset.testid = 'upgrade-overlay';
    this.root.setAttribute('aria-label', 'Patent Office choices');
    this.root.setAttribute('aria-hidden', 'true');
    this.root.innerHTML = `
      <div class="upgrade-overlay__panel">
        <p class="upgrade-overlay__eyebrow">Patent Office</p>
        <h1>Choose an Invention</h1>
        <div class="upgrade-overlay__cards"></div>
      </div>
    `;

    const mount = this.get('.upgrade-overlay__cards');
    for (let i = 0; i < 3; i += 1) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'upgrade-card';
      card.dataset.testid = `upgrade-card-${i}`;
      card.addEventListener('click', () => this.pick(i));
      mount.append(card);
      this.cards.push(card);
    }

    window.addEventListener('keydown', this.handleKeyDown);
    parent.append(this.root);
  }

  show(choices: UpgradeChoice[]): void {
    const nextKey = choices.map((choice) => `${choice.def.id}:${choice.stacks}`).join('|');
    if (this.visible && nextKey === this.offerKey) return;
    this.visible = true;
    this.choices = choices;
    this.offerKey = nextKey;
    for (let i = 0; i < this.cards.length; i += 1) {
      const card = this.cards[i];
      const choice = choices[i];
      if (!card || !choice) continue;
      card.dataset.upgradeId = choice.def.id;
      card.dataset.slot = `ui.upgrade.${choice.def.id}`;
      card.innerHTML = this.renderCard(choice, i);
    }
    this.root.classList.add('upgrade-overlay--visible');
    this.root.setAttribute('aria-hidden', 'false');
    this.cards[0]?.focus({ preventScroll: true });
  }

  hide(): void {
    this.visible = false;
    this.choices = [];
    this.offerKey = '';
    this.root.classList.remove('upgrade-overlay--visible');
    this.root.setAttribute('aria-hidden', 'true');
  }

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    for (const card of this.cards) card.replaceWith();
    this.root.remove();
  }

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.visible) return;
    const index = event.code === 'Digit1' ? 0 : event.code === 'Digit2' ? 1 : event.code === 'Digit3' ? 2 : -1;
    if (index < 0) return;
    event.preventDefault();
    this.pick(index);
  };

  private pick(index: number): void {
    if (!this.visible || !this.choices[index]) return;
    this.onIntent({ type: 'pick_upgrade', index });
  }

  private renderCard(choice: UpgradeChoice, index: number): string {
    const pips = Array.from({ length: choice.def.maxStacks }, (_, pip) => {
      const filled = pip < choice.stacks;
      return `<span class="upgrade-card__pip${filled ? ' upgrade-card__pip--filled' : ''}"></span>`;
    }).join('');
    return `
      <span class="upgrade-card__key">${index + 1}</span>
      <span class="upgrade-card__icon" data-slot="ui.upgrade.${this.escape(choice.def.id)}" aria-hidden="true">
        ${this.renderGlyph(choice.def.id)}
      </span>
      <span class="upgrade-card__name">${this.escape(choice.def.name)}</span>
      <span class="upgrade-card__effect">${this.escape(upgradeEffect(choice.def))}</span>
      <span class="upgrade-card__description">${this.escape(choice.def.description)}</span>
      <span class="upgrade-card__pips" aria-label="${choice.stacks} of ${choice.def.maxStacks} stacks">${pips}</span>
    `;
  }

  private renderGlyph(id: UpgradeId): string {
    const glyphs: Record<UpgradeId, string> = {
      double_tap_coil: '<path d="M16 31c10-16 22 16 32 0"/><path d="M16 21c10-16 22 16 32 0"/>',
      heavy_spark: '<path d="M34 8 20 34h13l-5 22 17-29H32z"/>',
      long_resonator: '<path d="M16 36h24l10-8v24l-10-8H16z"/><path d="M18 30v20"/>',
      split_spark: '<path d="M16 32h20"/><path d="m36 32 12-12"/><path d="m36 32 12 12"/>',
      tinkers_plating: '<path d="M32 9 50 17v14c0 12-8 20-18 24-10-4-18-12-18-24V17z"/>',
      spring_heels: '<path d="M19 42h17l9-8"/><path d="M22 25c8-7 15 7 7 14"/><path d="M34 19c9-5 13 8 4 13"/>',
      pan_legend: '<path d="M15 30c7 17 27 17 34 0z"/><path d="M20 30c8-7 20-7 28 0"/><path d="M47 30l8-5"/>',
      prospectors_luck: '<path d="M31 10 48 24 42 48H22l-6-24z"/><path d="M26 25h12"/><path d="M24 34h16"/>',
      beacon_dynamo: '<path d="M32 12v40"/><path d="M22 52h20"/><path d="M24 24c5-6 11-6 16 0"/><path d="M19 17c8-9 18-9 26 0"/>',
    };
    return `<svg viewBox="0 0 64 64" focusable="false">${glyphs[id]}</svg>`;
  }

  private get(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing upgrade overlay element: ${selector}`);
    return element;
  }

  private escape(value: string | UpgradeId): string {
    return value.replace(/[&<>"']/g, (char) => {
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '"') return '&quot;';
      return '&#39;';
    });
  }
}
