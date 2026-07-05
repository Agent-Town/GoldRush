import { upgradeEffect, type UpgradeDef } from '../game/Upgrades';

// Lazy glob (NOT eager) — same rule as Terrain.ts: eager would make every icon
// png a boot-time module dep; lazy keeps missing/blocked icons a silent
// fallback to the clean parchment card (placeholder-first).
const upgradeIconUrls = import.meta.glob<string>('../../assets/processed/icon-*.png', {
  query: '?url',
  import: 'default',
});
const upgradeIconUrlByFamily = new Map(
  Object.entries(upgradeIconUrls).map(([path, urlLoader]) => [
    (path.split('/').pop() ?? '').replace(/^icon-/, '').replace(/\.png$/, ''),
    urlLoader,
  ]),
);

export type UpgradeChoice = {
  def: UpgradeDef;
  familyStacks: number;
  effect?: string;
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
    const nextKey = choices.map((choice) => `${choice.def.id}:${choice.familyStacks}`).join('|');
    if (this.visible && nextKey === this.offerKey) return;
    this.visible = true;
    this.choices = choices;
    this.offerKey = nextKey;
    for (let i = 0; i < this.cards.length; i += 1) {
      const card = this.cards[i];
      const choice = choices[i];
      if (!card) continue;
      if (!choice) {
        card.hidden = true;
        card.disabled = true;
        delete card.dataset.upgradeId;
        delete card.dataset.slot;
        card.innerHTML = '';
        continue;
      }
      card.hidden = false;
      card.disabled = false;
      card.dataset.upgradeId = choice.def.id;
      card.dataset.slot = `ui.upgrade.icon.${choice.def.iconFamily}`;
      card.innerHTML = this.renderCard(choice, i);
      card.classList.remove('upgrade-card--icon');
      this.applyIcon(card, choice.def.iconFamily);
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

  /** Resolve ui.upgrade.icon.<family> to a processed png; no file -> clean card. */
  private applyIcon(card: HTMLButtonElement, family: string): void {
    const urlLoader = upgradeIconUrlByFamily.get(family);
    if (!urlLoader) return;
    void urlLoader().then(
      (url) => {
        if (card.dataset.slot !== `ui.upgrade.icon.${family}`) return; // re-rendered meanwhile
        const icon = document.createElement('span');
        icon.className = 'upgrade-card__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.backgroundImage = `url("${url}")`;
        card.append(icon);
        card.classList.add('upgrade-card--icon');
      },
      () => undefined,
    );
  }

  private renderCard(choice: UpgradeChoice, index: number): string {
    const stacks = choice.familyStacks > 0
      ? `<span class="upgrade-card__stacks" aria-label="${choice.familyStacks} ${choice.def.iconFamily} family stacks">${roman(choice.familyStacks)}</span>`
      : '';
    return `
      <span class="upgrade-card__key">${index + 1}</span>
      <span class="upgrade-card__name">${this.escape(choice.def.name)}</span>
      <span class="upgrade-card__effect">${this.escape(choice.effect ?? upgradeEffect(choice.def))}</span>
      ${stacks}
    `;
  }

  private get(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing upgrade overlay element: ${selector}`);
    return element;
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

function roman(value: number): string {
  const numerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return numerals[value] ?? String(value);
}
