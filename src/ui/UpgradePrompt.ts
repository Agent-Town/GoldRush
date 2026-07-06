import type { UpgradeCandidate } from '../systems/BuildSystem';

export class UpgradePrompt {
  private readonly root = document.createElement('div');
  private readonly key = document.createElement('span');
  private readonly message = document.createElement('span');
  private readonly button = document.createElement('button');

  constructor(parent: HTMLElement, onConfirm: () => void) {
    this.root.className = 'upgrade-prompt';
    this.root.dataset.testid = 'upgrade-prompt';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-live', 'polite');
    this.root.hidden = true;
    this.key.className = 'upgrade-prompt__key';
    this.message.className = 'upgrade-prompt__message';
    this.button.className = 'upgrade-prompt__button';
    this.button.type = 'button';
    this.button.dataset.testid = 'upgrade-confirm';
    this.button.textContent = 'Upgrade';
    this.button.addEventListener('click', onConfirm);
    this.root.append(this.key, this.message, this.button);
    parent.append(this.root);
  }

  update(candidate: UpgradeCandidate | null, keyEnabled: boolean): void {
    this.root.hidden = candidate === null;
    if (!candidate) return;
    this.key.textContent = keyEnabled && candidate.canUpgrade ? 'Enter - ' : '';
    this.message.textContent = upgradeMessage(candidate);
    this.button.disabled = !candidate.canUpgrade;
    this.button.textContent = candidate.canUpgrade ? 'Upgrade' : 'Wait';
  }

  dispose(): void {
    this.root.remove();
  }
}

function upgradeMessage(candidate: UpgradeCandidate): string {
  const name = candidate.displayName.toLowerCase();
  if (candidate.reason === 'max') return `The ${name} is already Tier ${candidate.maxTier}. The claim has no higher pattern yet.`;
  if (candidate.nextTier === null) return `The ${name} is already at the frontier ceiling.`;
  if (candidate.reason === 'gated') return `Tier ${candidate.nextTier} for the ${name} waits on science.`;
  if (candidate.reason === 'insufficient_gold') {
    return `Need ${candidate.cost} gold to raise the ${name} to Tier ${candidate.nextTier}.`;
  }
  return `Raise the ${name} to Tier ${candidate.nextTier}? ${candidate.cost} gold buys ${candidate.gain}.`;
}
