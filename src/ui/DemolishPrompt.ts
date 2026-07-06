import type { DemolishCandidate } from '../systems/BuildSystem';

export class DemolishPrompt {
  private readonly root = document.createElement('div');
  private readonly key = document.createElement('span');
  private readonly message = document.createElement('span');
  private readonly button = document.createElement('button');

  constructor(parent: HTMLElement, onConfirm: () => void) {
    this.root.className = 'demolish-prompt';
    this.root.dataset.testid = 'demolish-prompt';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-live', 'polite');
    this.root.hidden = true;
    this.key.className = 'demolish-prompt__key';
    this.message.className = 'demolish-prompt__message';
    this.button.className = 'demolish-prompt__button';
    this.button.type = 'button';
    this.button.dataset.testid = 'demolish-confirm';
    this.button.textContent = 'Tear down';
    this.button.addEventListener('click', onConfirm);
    this.root.append(this.key, this.message, this.button);
    parent.append(this.root);
  }

  update(candidate: DemolishCandidate | null, keyEnabled: boolean): void {
    this.root.hidden = candidate === null;
    if (!candidate) return;
    this.key.textContent = keyEnabled ? 'Enter - ' : '';
    this.message.textContent = `Tear down the ${candidate.displayName.toLowerCase()}? The timber comes back, the labor doesn't. (+${candidate.refund}g)`;
  }

  dispose(): void {
    this.root.remove();
  }
}
