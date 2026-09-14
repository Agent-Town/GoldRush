export type ProspectorDispatchTarget = { id: string; label: string };

const HOLD_MS = 500;
/** Browsers without `click.pointerType` (older WebKit) still synthesise a click after a touch; ignore it. */
const TOUCH_CLICK_WINDOW_MS = 700;

/**
 * The player's half of the Same Laws (owner playtest 16, 2026-09-02): the human can send the
 * Prospector to a seam or sluice exactly as a rider's HARVEST order does.
 *   desktop: click the target while the Prospector is selected (its charter was opened once),
 *            or Alt/Shift-click it without selecting;
 *   touch:   hold the target ~0.5 s and confirm the "Send the Prospector" prompt.
 * `dispatch(id)` lands in Game.dispatchProspector -> the run tape (`prospector_dispatch`) -> the
 * same travel-then-`panAgentAt` path; this class never touches the sim.
 */
export class ProspectorDispatchInput {
  private holdTimer = 0;
  private confirmPressed = false;
  private holdTarget: ProspectorDispatchTarget | null = null;
  private holdX = 0;
  private holdY = 0;
  private lastTouchAt = Number.NEGATIVE_INFINITY;
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
    this.prompt.addEventListener('pointerdown', this.onPromptPointerDown);
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
    this.prompt.removeEventListener('pointerdown', this.onPromptPointerDown);
    this.prompt.removeEventListener('click', this.onPromptClick);
    this.prompt.remove();
  }

  private readonly onClick = (event: MouseEvent): void => {
    if (this.isTouchClick(event)) return;
    if (!this.selected() && !event.altKey && !event.shiftKey) return;
    const target = this.targetAt(event.clientX, event.clientY);
    if (target) this.dispatch(target.id);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.hidePrompt();
    if (event.pointerType !== 'touch') return;
    this.lastTouchAt = performance.now();
    this.holdX = event.clientX;
    this.holdY = event.clientY;
    this.holdTarget = this.targetAt(event.clientX, event.clientY);
    if (!this.holdTarget) return;
    const { clientX, clientY } = event;
    this.holdTimer = window.setTimeout(() => {
      if (!this.holdTarget) return;
      this.prompt.textContent = `Send the Prospector to the ${this.holdTarget.label}`;
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

  private readonly onPromptPointerDown = (): void => {
    this.confirmPressed = true;
  };

  private readonly onPromptClick = (event: MouseEvent): void => {
    // A held finger can release over the newly appeared button. Require a fresh press,
    // while retaining keyboard and assistive activation (detail === 0).
    if (event.detail !== 0 && !this.confirmPressed) return;
    if (this.holdTarget) this.dispatch(this.holdTarget.id);
    this.hidePrompt();
  };

  private hidePrompt(): void {
    this.confirmPressed = false;
    this.prompt.hidden = true;
    this.holdTarget = null;
  }

  private isTouchClick(event: MouseEvent): boolean {
    const pointerType = (event as Partial<PointerEvent>).pointerType;
    if (pointerType) return pointerType === 'touch';
    return performance.now() - this.lastTouchAt < TOUCH_CLICK_WINDOW_MS;
  }
}
