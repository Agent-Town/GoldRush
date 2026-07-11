import * as THREE from 'three';

export const HERO_INPUT_BINDINGS = {
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  confirm: ['Space', 'Enter', 'TouchConfirm'],
  upgrade: ['KeyU'],
  rotateBuild: ['KeyR', 'TouchRotate'],
  weaponToggle: ['KeyQ', 'TouchWeaponToggle'],
  build: ['KeyB'],
  cancel: ['Escape'],
  pause: ['KeyP', 'Escape'],
  mute: ['KeyM'],
  debugSpawn: ['KeyT'],
  debugXp: ['KeyX'],
} as const;

export function heroLedgerControlLines(): string[] {
  return [
    `Move: ${labelKeys([...HERO_INPUT_BINDINGS.moveUp, ...HERO_INPUT_BINDINGS.moveLeft, ...HERO_INPUT_BINDINGS.moveDown, ...HERO_INPUT_BINDINGS.moveRight])} or touch stick`,
    'Primary: Spark Rig auto-fires nearest threat',
    `Ability: ${labelKeys(HERO_INPUT_BINDINGS.weaponToggle)} toggles Spark Rig / Blast Charge`,
  ];
}

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
  upgrade: boolean;
  rotateBuild: boolean;
  weaponToggle: boolean;
  build: boolean;
  cancel: boolean;
  buildSlot: number | null;
  restart: boolean;
  pause: boolean;
  mute: boolean;
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
  private previousConfirm = false;
  private previousBuild = false;
  private previousUpgrade = false;
  private previousRotateBuild = false;
  private previousWeaponToggle = false;
  private previousMute = false;
  private previousDebugXp = false;
  private readonly intents: Intents = {
    move: new THREE.Vector2(),
    confirm: false,
    upgrade: false,
    rotateBuild: false,
    weaponToggle: false,
    build: false,
    cancel: false,
    buildSlot: null,
    restart: false,
    pause: false,
    mute: false,
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

  private readonly rotateButton: HTMLButtonElement = document.createElement('button');
  private readonly weaponButton: HTMLButtonElement = document.createElement('button');

  private readonly onRotateDown = (event: PointerEvent) => {
    event.preventDefault();
    this.keys.add('TouchRotate');
    this.tapped.add('TouchRotate');
  };

  private readonly onRotateUp = (event: PointerEvent) => {
    event.preventDefault();
    this.keys.delete('TouchRotate');
  };

  private readonly onWeaponDown = (event: PointerEvent) => {
    event.preventDefault();
    this.keys.add('TouchWeaponToggle');
    this.tapped.add('TouchWeaponToggle');
  };

  private readonly onWeaponUp = (event: PointerEvent) => {
    event.preventDefault();
    this.keys.delete('TouchWeaponToggle');
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
    this.rotateButton.id = 'rotate-button';
    this.rotateButton.type = 'button';
    this.rotateButton.textContent = 'R';
    this.rotateButton.setAttribute('aria-label', 'Rotate build ghost');
    this.rotateButton.addEventListener('pointerdown', this.onRotateDown);
    this.rotateButton.addEventListener('pointerup', this.onRotateUp);
    this.rotateButton.addEventListener('pointercancel', this.onRotateUp);
    this.rotateButton.addEventListener('pointerleave', this.onRotateUp);
    this.weaponButton.id = 'weapon-toggle-button';
    this.weaponButton.type = 'button';
    this.weaponButton.textContent = 'Q';
    this.weaponButton.setAttribute('aria-label', 'Toggle weapon');
    this.weaponButton.addEventListener('pointerdown', this.onWeaponDown);
    this.weaponButton.addEventListener('pointerup', this.onWeaponUp);
    this.weaponButton.addEventListener('pointercancel', this.onWeaponUp);
    this.weaponButton.addEventListener('pointerleave', this.onWeaponUp);
    this.confirmButton.before(this.rotateButton, this.weaponButton);
  }

  readIntents(): Intents {
    const down = (code: string): boolean => this.keys.has(code) || this.tapped.has(code);
    const anyDown = (codes: readonly string[]): boolean => codes.some(down);
    this.readMovement(this.intents.move);
    const confirmHeld = anyDown(HERO_INPUT_BINDINGS.confirm);
    this.intents.confirm = confirmHeld && !this.previousConfirm;
    this.previousConfirm = HERO_INPUT_BINDINGS.confirm.some((code) => this.keys.has(code));
    const upgradeHeld = anyDown(HERO_INPUT_BINDINGS.upgrade);
    this.intents.upgrade = upgradeHeld && !this.previousUpgrade;
    this.previousUpgrade = this.keys.has('KeyU');
    const rotateHeld = anyDown(HERO_INPUT_BINDINGS.rotateBuild);
    this.intents.rotateBuild = rotateHeld && !this.previousRotateBuild;
    this.previousRotateBuild = this.keys.has('KeyR') || this.keys.has('TouchRotate');
    const weaponHeld = anyDown(HERO_INPUT_BINDINGS.weaponToggle);
    this.intents.weaponToggle = weaponHeld && !this.previousWeaponToggle;
    this.previousWeaponToggle = this.keys.has('KeyQ') || this.keys.has('TouchWeaponToggle');
    const buildHeld = anyDown(HERO_INPUT_BINDINGS.build);
    this.intents.build = buildHeld && !this.previousBuild;
    this.previousBuild = this.keys.has('KeyB');
    this.intents.cancel = anyDown(HERO_INPUT_BINDINGS.cancel);
    this.intents.buildSlot =
      down('Digit1') || down('Numpad1')
        ? 0
        : down('Digit2') || down('Numpad2')
          ? 1
          : down('Digit3') || down('Numpad3')
            ? 2
            : down('Digit4') || down('Numpad4')
              ? 3
              : down('Digit5') || down('Numpad5')
                ? 4
                : down('Digit6') || down('Numpad6')
                  ? 5
                  : null;
    this.intents.restart = down('KeyR');
    this.intents.pause = anyDown(HERO_INPUT_BINDINGS.pause);
    const muteHeld = anyDown(HERO_INPUT_BINDINGS.mute);
    this.intents.mute = muteHeld && !this.previousMute;
    this.previousMute = this.keys.has('KeyM');
    this.intents.debugSpawn = anyDown(HERO_INPUT_BINDINGS.debugSpawn);
    const debugXpHeld = anyDown(HERO_INPUT_BINDINGS.debugXp);
    this.intents.debugXp = debugXpHeld && !this.previousDebugXp;
    this.previousDebugXp = this.keys.has('KeyX');
    this.tapped.clear();
    return this.intents;
  }

  readMovement(target: THREE.Vector2): THREE.Vector2 {
    this.keyVector.set(0, 0);
    if (HERO_INPUT_BINDINGS.moveLeft.some((code) => this.keys.has(code))) this.keyVector.x -= 1;
    if (HERO_INPUT_BINDINGS.moveRight.some((code) => this.keys.has(code))) this.keyVector.x += 1;
    if (HERO_INPUT_BINDINGS.moveUp.some((code) => this.keys.has(code))) this.keyVector.y -= 1;
    if (HERO_INPUT_BINDINGS.moveDown.some((code) => this.keys.has(code))) this.keyVector.y += 1;

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
    this.rotateButton.removeEventListener('pointerdown', this.onRotateDown);
    this.rotateButton.removeEventListener('pointerup', this.onRotateUp);
    this.rotateButton.removeEventListener('pointercancel', this.onRotateUp);
    this.rotateButton.removeEventListener('pointerleave', this.onRotateUp);
    this.weaponButton.removeEventListener('pointerdown', this.onWeaponDown);
    this.weaponButton.removeEventListener('pointerup', this.onWeaponUp);
    this.weaponButton.removeEventListener('pointercancel', this.onWeaponUp);
    this.weaponButton.removeEventListener('pointerleave', this.onWeaponUp);
    this.rotateButton.remove();
    this.weaponButton.remove();
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

function labelKeys(codes: readonly string[]): string {
  return codes.map(labelKey).join(' / ');
}

function labelKey(code: string): string {
  if (code === 'TouchWeaponToggle') return 'touch Q';
  if (code === 'TouchRotate') return 'touch R';
  if (code === 'TouchConfirm') return 'touch confirm';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Arrow')) return code.slice(5);
  return code;
}
