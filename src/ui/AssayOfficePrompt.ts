export class AssayOfficePrompt {
  private readonly root = document.createElement('div');

  constructor(parent: HTMLElement) {
    this.root.className = 'assay-office-prompt';
    this.root.dataset.testid = 'assay-office-prompt';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-live', 'polite');
    this.root.hidden = true;
    const debug = new URLSearchParams(window.location.search).has('debug');
    this.root.innerHTML = debug
      ? '<span class="assay-office-prompt__key">Enter - </span>Assay Office · debug crafting'
      : '<span class="assay-office-prompt__key">Enter - </span>Complaints Desk';
    parent.append(this.root);
  }

  update(inRange: boolean): void {
    const benchOpen = document.querySelector('[data-assay-office-surface]:not([hidden])') !== null;
    this.root.hidden = !inRange || benchOpen;
  }

  dispose(): void {
    this.root.remove();
  }
}
