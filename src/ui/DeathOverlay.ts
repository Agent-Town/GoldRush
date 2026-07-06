export type DeathLedger = {
  timeAlive: number;
  kills: number;
  goldPanned: number;
  spent: number;
  beaconsBuilt: number;
  wavesSurvived: number;
  weaponToggles: number;
  blastTime: number;
};

export type BestClaimRow = {
  waves: number;
  kills: number;
  gold: number;
  timeAlive: number;
  at: number;
  secured?: boolean;
};

export class DeathOverlay {
  private readonly root: HTMLElement;
  private readonly timeValue: HTMLElement;
  private readonly killsValue: HTMLElement;
  private readonly goldValue: HTMLElement;
  private readonly spentValue: HTMLElement;
  private readonly beaconsBuiltValue: HTMLElement;
  private readonly weaponTogglesValue: HTMLElement;
  private readonly blastTimeValue: HTMLElement;
  private readonly wavesValue: HTMLElement;
  private readonly bestClaimsList: HTMLElement;
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
        <p class="death-overlay__flavor">The claim was overrun. The gold remembers.</p>
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
            <dt>Waves Survived</dt>
            <dd data-death-waves>0</dd>
          </div>
          <div>
            <dt>Gold Panned</dt>
            <dd data-death-gold>0</dd>
          </div>
          <div>
            <dt>Spent</dt>
            <dd data-death-spent>0</dd>
          </div>
          <div>
            <dt>Beacons Built</dt>
            <dd data-death-beacons-built>0</dd>
          </div>
          <div>
            <dt>Blast Toggles</dt>
            <dd data-death-weapon-toggles>0</dd>
          </div>
          <div>
            <dt>Blast Charge Time</dt>
            <dd data-death-blast-time>00:00</dd>
          </div>
        </dl>
        <section class="death-overlay__scores" aria-label="Best Claims">
          <h2>Best Claims</h2>
          <ol data-best-claims></ol>
        </section>
        <button class="death-overlay__button" type="button" data-testid="stake-again">Try Again</button>
      </div>
    `;

    this.timeValue = this.get('[data-death-time]');
    this.killsValue = this.get('[data-death-kills]');
    this.wavesValue = this.get('[data-death-waves]');
    this.goldValue = this.get('[data-death-gold]');
    this.spentValue = this.get('[data-death-spent]');
    this.beaconsBuiltValue = this.get('[data-death-beacons-built]');
    this.weaponTogglesValue = this.get('[data-death-weapon-toggles]');
    this.blastTimeValue = this.get('[data-death-blast-time]');
    this.bestClaimsList = this.get('[data-best-claims]');
    this.button = this.get<HTMLButtonElement>('[data-testid="stake-again"]');

    this.button.addEventListener('click', this.handleStakeAgain);
    window.addEventListener('keydown', this.handleKeyDown);
    parent.append(this.root);
  }

  show(ledger: DeathLedger, scores: readonly BestClaimRow[] = [], currentAt = 0): void {
    this.visible = true;
    this.timeValue.textContent = this.formatTime(ledger.timeAlive);
    this.killsValue.textContent = ledger.kills.toString();
    this.wavesValue.textContent = ledger.wavesSurvived.toString();
    this.goldValue.textContent = ledger.goldPanned.toString();
    this.spentValue.textContent = ledger.spent.toString();
    this.beaconsBuiltValue.textContent = ledger.beaconsBuilt.toString();
    this.weaponTogglesValue.textContent = ledger.weaponToggles.toString();
    this.blastTimeValue.textContent = this.formatTime(ledger.blastTime);
    this.renderScores(scores, currentAt);
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

  private renderScores(scores: readonly BestClaimRow[], currentAt: number): void {
    this.bestClaimsList.innerHTML = '';
    if (scores.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'death-overlay__score death-overlay__score--empty';
      empty.textContent = 'No claims logged yet.';
      this.bestClaimsList.append(empty);
      return;
    }

    for (const score of scores) {
      const row = document.createElement('li');
      row.className = 'death-overlay__score';
      row.dataset.testid = 'best-claim-row';
      if (score.at === currentAt) {
        row.classList.add('death-overlay__score--current');
        row.dataset.currentRun = 'true';
      }

      const summary = document.createElement('span');
      summary.className = 'death-overlay__score-summary';
      summary.textContent = `${score.waves} waves - ${this.formatTime(score.timeAlive)}`;

      const detail = document.createElement('span');
      detail.className = 'death-overlay__score-detail';
      detail.textContent = `${score.kills} turned back - ${score.gold} gold`;

      const stamp = document.createElement('strong');
      stamp.className = 'death-overlay__score-stamp';
      stamp.textContent = score.secured ? 'SECURED' : 'OVERRUN';

      row.append(summary, stamp, detail);
      this.bestClaimsList.append(row);
    }
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
