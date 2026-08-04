import './PartyOverview.css';

export type PartyRiderSnapshot = {
  playerId: string;
  name: string;
  hp: number;
  maxHp: number;
  local: boolean;
};

export type PartyOverviewSnapshot = {
  riders: PartyRiderSnapshot[];
  sharedGold: number;
};

const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export class PartyOverview {
  readonly element = document.createElement('section');

  private readonly cards = document.createElement('div');
  private readonly sharedGold: HTMLElement;
  private selectedPlayerId: string | null = null;
  private rosterKey = '';

  constructor(root: HTMLElement, private readonly onGlance: (playerId: string | null) => void) {
    this.element.className = 'party-overview';
    this.element.dataset.testid = 'party-overview';
    this.element.setAttribute('aria-label', "The riders' roster");
    this.element.hidden = true;
    this.element.innerHTML = `
      <div class="party-overview__header">
        <span>Riders</span>
        <span class="party-overview__pot">Shared pot <strong data-party-gold>0</strong>g</span>
      </div>
    `;
    this.cards.className = 'party-overview__cards';
    this.cards.dataset.testid = 'party-rider-cards';
    this.element.append(this.cards);
    this.sharedGold = this.element.querySelector<HTMLElement>('[data-party-gold]')!;
    this.sharedGold.dataset.testid = 'party-shared-gold';
    root.append(this.element);
    window.addEventListener('keydown', this.onKeyDown, { capture: true });
    document.addEventListener('pointerdown', this.onPointerDown, { capture: true });
  }

  update(snapshot: PartyOverviewSnapshot): void {
    const riders = [...snapshot.riders].sort((a, b) => Number(b.local) - Number(a.local));
    this.element.hidden = riders.length < 2;
    if (riders.length < 2) {
      this.clearGlance();
      return;
    }

    const rosterKey = riders.map((rider) => `${rider.playerId}:${rider.name}:${rider.local}`).join('|');
    if (rosterKey !== this.rosterKey) {
      this.rosterKey = rosterKey;
      this.cards.replaceChildren(...riders.map((rider) => this.createCard(rider)));
    }
    if (this.selectedPlayerId && !riders.some((rider) => rider.playerId === this.selectedPlayerId && !rider.local)) {
      this.clearGlance();
    }
    this.sharedGold.textContent = Math.floor(snapshot.sharedGold).toString();
    for (const rider of riders) this.updateCard(rider);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown, { capture: true });
    document.removeEventListener('pointerdown', this.onPointerDown, { capture: true });
    this.element.remove();
  }

  private createCard(rider: PartyRiderSnapshot): HTMLButtonElement {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'party-rider-card';
    card.dataset.testid = 'party-rider-card';
    card.dataset.playerId = rider.playerId;
    card.innerHTML = `
      <span class="party-rider-card__topline">
        <strong data-rider-name></strong>
        <span data-rider-self hidden>You</span>
      </span>
      <span class="party-rider-card__hp"><span data-rider-hp-fill></span></span>
      <span class="party-rider-card__value" data-rider-hp></span>
    `;
    card.addEventListener('click', () => this.select(rider.playerId, rider.local));
    return card;
  }

  private updateCard(rider: PartyRiderSnapshot): void {
    const card = this.cards.querySelector<HTMLButtonElement>(`[data-player-id="${CSS.escape(rider.playerId)}"]`);
    if (!card) return;
    const percent = rider.maxHp > 0 ? Math.max(0, Math.min(100, rider.hp / rider.maxHp * 100)) : 0;
    card.dataset.self = String(rider.local);
    card.dataset.glancing = String(this.selectedPlayerId === rider.playerId);
    card.dataset.hp = String(Math.ceil(rider.hp));
    card.setAttribute('aria-pressed', String(this.selectedPlayerId === rider.playerId));
    card.setAttribute('aria-label', `${rider.local ? 'You, ' : ''}${rider.name}: ${Math.ceil(rider.hp)} of ${Math.round(rider.maxHp)} health${rider.local ? '' : '. Glance at rider'}`);
    card.querySelector<HTMLElement>('[data-rider-name]')!.textContent = rider.name;
    card.querySelector<HTMLElement>('[data-rider-self]')!.hidden = !rider.local;
    card.querySelector<HTMLElement>('[data-rider-hp-fill]')!.style.width = `${percent}%`;
    card.querySelector<HTMLElement>('[data-rider-hp]')!.textContent = `${Math.ceil(rider.hp)} / ${Math.round(rider.maxHp)}`;
  }

  private select(playerId: string, local: boolean): void {
    const next = local || this.selectedPlayerId === playerId ? null : playerId;
    this.selectedPlayerId = next;
    this.onGlance(next);
  }

  private clearGlance(): void {
    if (!this.selectedPlayerId) return;
    this.selectedPlayerId = null;
    this.onGlance(null);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.selectedPlayerId || (event.code !== 'Escape' && !MOVEMENT_KEYS.has(event.code))) return;
    this.clearGlance();
    if (event.code === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.selectedPlayerId && event.target instanceof Element && event.target.closest('#touch-stick')) this.clearGlance();
  };
}
