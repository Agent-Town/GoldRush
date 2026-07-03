export type DeathLedger = {
  timeAlive: number;
  kills: number;
  goldPanned: number;
};

export class DeathOverlay {
  private readonly root: HTMLElement;
  private readonly timeValue: HTMLElement;
  private readonly killsValue: HTMLElement;
  private readonly goldValue: HTMLElement;
  private readonly button: HTMLButtonElement;
  private visible = false;

  constructor(parent: HTMLElement, private readonly onStakeAgain: () => void) {
    this.root = document.createElement('section');
    this.root.className = 'death-overlay';
    this.root.dataset.testid = 'death-overlay';
    this.root.setAttribute('aria-label', 'Run ledger');
    this.root.setAttribute('aria-hidden', 'true');
    this.root.innerHTML = `
      <div class="death-overlay__panel">
        <p class="death-overlay__eyebrow">The claim went quiet.</p>
        <h1>Run Ledger</h1>
        <dl class="death-overlay__ledger">
          <div>
            <dt>Time Held</dt>
            <dd data-death-time>00:00</dd>
          </div>
          <div>
            <dt>Claim Jumpers Turned Back</dt>
            <dd data-death-kills>0</dd>
          </div>
          <div>
            <dt>Gold Panned</dt>
            <dd data-death-gold>0</dd>
          </div>
        </dl>
        <button class="death-overlay__button" type="button" data-testid="stake-again">Stake Again</button>
      </div>
    `;

    this.timeValue = this.get('[data-death-time]');
    this.killsValue = this.get('[data-death-kills]');
    this.goldValue = this.get('[data-death-gold]');
    this.button = this.get<HTMLButtonElement>('[data-testid="stake-again"]');

    this.button.addEventListener('click', this.handleStakeAgain);
    window.addEventListener('keydown', this.handleKeyDown);
    parent.append(this.root);
  }

  show(ledger: DeathLedger): void {
    this.visible = true;
    this.timeValue.textContent = this.formatTime(ledger.timeAlive);
    this.killsValue.textContent = ledger.kills.toString();
    this.goldValue.textContent = ledger.goldPanned.toString();
    this.root.classList.add('death-overlay--visible');
    this.root.setAttribute('aria-hidden', 'false');
    this.button.focus({ preventScroll: true });
  }

  hide(): void {
    this.visible = false;
    this.root.classList.remove('death-overlay--visible');
    this.root.setAttribute('aria-hidden', 'true');
  }

  dispose(): void {
    this.button.removeEventListener('click', this.handleStakeAgain);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.root.remove();
  }

  private readonly handleStakeAgain = () => {
    if (this.visible) this.onStakeAgain();
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.visible || event.code !== 'KeyR') return;
    event.preventDefault();
    this.onStakeAgain();
  };

  private formatTime(secondsAlive: number): string {
    const minutes = Math.floor(secondsAlive / 60).toString().padStart(2, '0');
    const seconds = Math.floor(secondsAlive % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private get<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing death overlay element: ${selector}`);
    return element;
  }
}
