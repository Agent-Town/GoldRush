export class AssayOfficePrompt {
  private readonly root = document.createElement('div');

  constructor(parent: HTMLElement) {
    this.root.className = 'assay-office-prompt';
    this.root.dataset.testid = 'assay-office-prompt';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-live', 'polite');
    this.root.hidden = true;
    this.root.innerHTML = '<span class="assay-office-prompt__key">Enter - </span>Assay Office';
    parent.append(this.root);
  }

  update(inRange: boolean): void {
    const benchOpen = document.querySelector('[data-testid="assay-bench"]:not([hidden])') !== null;
    this.root.hidden = !inRange || benchOpen;
  }

  dispose(): void {
    this.root.remove();
  }
}
