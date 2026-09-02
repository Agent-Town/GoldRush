export type ProspectorDispatchTarget = { id: string; label: string };

const HOLD_MS = 500;

export class ProspectorDispatchInput {
  private holdTimer = 0;
  private holdTarget: ProspectorDispatchTarget | null = null;
  private holdX = 0;
  private holdY = 0;
  private suppressClick = false;
  private readonly prompt = document.createElement('button');

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly selected: () => boolean,
    private readonly targetAt: (x: number, y: number) => ProspectorDispatchTarget | null,
    private readonly dispatch: (id: string) => void,
  ) {
    this.prompt.type = 'button';
    this.prompt.dataset.testid = 'prospector-dispatch-confirm';
    this.prompt.className = 'prospector-dispatch-prompt';
    this.prompt.hidden = true;
    this.prompt.addEventListener('click', this.onPromptClick);
    document.body.append(this.prompt);
    canvas.addEventListener('click', this.onClick);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.cancelHold);
    canvas.addEventListener('pointercancel', this.cancelHold);
    canvas.addEventListener('pointermove', this.onPointerMove);
  }

  dispose(): void {
    window.clearTimeout(this.holdTimer);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.cancelHold);
    this.canvas.removeEventListener('pointercancel', this.cancelHold);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.prompt.removeEventListener('click', this.onPromptClick);
    this.prompt.remove();
  }

  private readonly onClick = (event: MouseEvent): void => {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    if (!this.selected() && !event.altKey && !event.shiftKey) return;
    const target = this.targetAt(event.clientX, event.clientY);
    if (target) this.dispatch(target.id);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') return;
    this.suppressClick = true;
    this.holdX = event.clientX;
    this.holdY = event.clientY;
    this.holdTarget = this.targetAt(event.clientX, event.clientY);
    if (!this.holdTarget) return;
    const { clientX, clientY } = event;
    this.holdTimer = window.setTimeout(() => {
      if (!this.holdTarget) return;
      this.prompt.textContent = `Send the Prospector to ${this.holdTarget.label}`;
      this.prompt.style.left = `${Math.max(8, Math.min(clientX, window.innerWidth - 240))}px`;
      this.prompt.style.top = `${Math.max(8, Math.min(clientY, window.innerHeight - 52))}px`;
      this.prompt.hidden = false;
    }, HOLD_MS);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' && Math.hypot(event.clientX - this.holdX, event.clientY - this.holdY) > 12) this.cancelHold();
  };

  private readonly cancelHold = (): void => {
    window.clearTimeout(this.holdTimer);
    this.holdTimer = 0;
  };

  private readonly onPromptClick = (): void => {
    if (this.holdTarget) this.dispatch(this.holdTarget.id);
    this.holdTarget = null;
    this.prompt.hidden = true;
  };
}
