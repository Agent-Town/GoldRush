import * as THREE from 'three';

type PointerState = {
  active: boolean;
  id: number | null;
  centerX: number;
  centerY: number;
  radius: number;
};

export type Intents = {
  move: THREE.Vector2;
  confirm: boolean;
  build: boolean;
  cancel: boolean;
  buildSlot: number | null;
  restart: boolean;
  pause: boolean;
  debugSpawn: boolean;
  debugXp: boolean;
};

export class InputController {
  private readonly keys = new Set<string>();
  // Sub-frame tap buffer: a keydown+keyup pair that lands entirely between two
  // intent samples (low-fps frames) must still register for one sample.
  private readonly tapped = new Set<string>();
  private readonly pointer = new THREE.Vector2();
  private readonly keyVector = new THREE.Vector2();
  private previousBuild = false;
  private previousDebugXp = false;
  private readonly intents: Intents = {
    move: new THREE.Vector2(),
    confirm: false,
    build: false,
    cancel: false,
    buildSlot: null,
    restart: false,
    pause: false,
    debugSpawn: false,
    debugXp: false,
  };
  private readonly pointerState: PointerState = {
    active: false,
    id: null,
    centerX: 0,
    centerY: 0,
    radius: 1,
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.code);
    this.tapped.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private readonly onStickDown = (event: PointerEvent) => {
    event.preventDefault();
    const rect = this.stick.getBoundingClientRect();
    this.pointerState.active = true;
    this.pointerState.id = event.pointerId;
    this.pointerState.centerX = rect.left + rect.width / 2;
    this.pointerState.centerY = rect.top + rect.height / 2;
    this.pointerState.radius = rect.width * 0.42;
    try {
      this.stick.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic test events do not always have a capturable pointer id.
    }
    this.updatePointer(event.clientX, event.clientY);
  };

  private readonly onStickMove = (event: PointerEvent) => {
    if (!this.pointerState.active || event.pointerId !== this.pointerState.id) return;
    event.preventDefault();
    this.updatePointer(event.clientX, event.clientY);
  };

  private readonly onStickUp = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerState.id) return;
    event.preventDefault();
    this.pointerState.active = false;
    this.pointerState.id = null;
    this.pointer.set(0, 0);
    this.updateKnob();
  };

  private readonly onConfirmDown = (event: PointerEvent) => {
    event.preventDefault();
    this.keys.add('TouchConfirm');
    this.tapped.add('TouchConfirm');
  };

  private readonly onConfirmUp = (event: PointerEvent) => {
    event.preventDefault();
    this.keys.delete('TouchConfirm');
  };

  constructor(
    private readonly stick: HTMLElement,
    private readonly knob: HTMLElement,
    private readonly confirmButton: HTMLElement,
  ) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.stick.addEventListener('pointerdown', this.onStickDown);
    this.stick.addEventListener('pointermove', this.onStickMove);
    this.stick.addEventListener('pointerup', this.onStickUp);
    this.stick.addEventListener('pointercancel', this.onStickUp);
    this.confirmButton.addEventListener('pointerdown', this.onConfirmDown);
    this.confirmButton.addEventListener('pointerup', this.onConfirmUp);
    this.confirmButton.addEventListener('pointercancel', this.onConfirmUp);
    this.confirmButton.addEventListener('pointerleave', this.onConfirmUp);
  }

  readIntents(): Intents {
    const down = (code: string): boolean => this.keys.has(code) || this.tapped.has(code);
    this.readMovement(this.intents.move);
    this.intents.confirm = down('Space') || down('Enter') || down('TouchConfirm');
    const buildHeld = down('KeyB');
    this.intents.build = buildHeld && !this.previousBuild;
    this.previousBuild = this.keys.has('KeyB');
    this.intents.cancel = down('Escape');
    this.intents.buildSlot = down('Digit1') || down('Numpad1') ? 0 : down('Digit2') || down('Numpad2') ? 1 : null;
    this.intents.restart = down('KeyR');
    this.intents.pause = down('KeyP') || down('Escape');
    this.intents.debugSpawn = down('KeyT');
    const debugXpHeld = down('KeyX');
    this.intents.debugXp = debugXpHeld && !this.previousDebugXp;
    this.previousDebugXp = this.keys.has('KeyX');
    this.tapped.clear();
    return this.intents;
  }

  readMovement(target: THREE.Vector2): THREE.Vector2 {
    this.keyVector.set(0, 0);
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) this.keyVector.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) this.keyVector.x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) this.keyVector.y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) this.keyVector.y += 1;

    target.copy(this.keyVector).add(this.pointer);
    if (target.lengthSq() > 1) target.normalize();
    return target;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.stick.removeEventListener('pointerdown', this.onStickDown);
    this.stick.removeEventListener('pointermove', this.onStickMove);
    this.stick.removeEventListener('pointerup', this.onStickUp);
    this.stick.removeEventListener('pointercancel', this.onStickUp);
    this.confirmButton.removeEventListener('pointerdown', this.onConfirmDown);
    this.confirmButton.removeEventListener('pointerup', this.onConfirmUp);
    this.confirmButton.removeEventListener('pointercancel', this.onConfirmUp);
    this.confirmButton.removeEventListener('pointerleave', this.onConfirmUp);
  }

  private updatePointer(clientX: number, clientY: number): void {
    const dx = clientX - this.pointerState.centerX;
    const dy = clientY - this.pointerState.centerY;
    this.pointer.set(dx / this.pointerState.radius, dy / this.pointerState.radius);
    if (this.pointer.lengthSq() > 1) this.pointer.normalize();
    this.updateKnob();
  }

  private updateKnob(): void {
    const distance = 38;
    this.knob.style.transform = `translate(calc(-50% + ${this.pointer.x * distance}px), calc(-50% + ${this.pointer.y * distance}px))`;
  }
}
