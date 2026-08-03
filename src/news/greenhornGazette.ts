import { HERO_INPUT_BINDINGS } from '../core/InputController';

export type GazetteInputMode = 'keyboard' | 'touch';

type GazetteBindings = Pick<
  typeof HERO_INPUT_BINDINGS,
  'moveLeft' | 'moveRight' | 'moveUp' | 'moveDown' | 'confirm' | 'upgrade' | 'rotateBuild' | 'weaponToggle' | 'build' | 'buildSlots' | 'cancel' | 'pause' | 'mute'
>;

export const PROSPECTORS_HANDS_PANEL_ID = 'prospectors-hands';

export type GreenhornGazetteControlCopy = {
  works: string;
  arms: string;
  hands: readonly string[];
};

export function greenhornGazetteControlCopy(
  mode: GazetteInputMode,
  bindings: GazetteBindings = HERO_INPUT_BINDINGS,
): GreenhornGazetteControlCopy {
  const controls = controlLabels(mode, bindings);
  return mode === 'keyboard'
    ? {
        works: `Press ${controls.build} to open Build; ${controls.buildSlots} choose the works, and ${controls.confirm} sets them down.`,
        arms: `Press ${controls.weaponToggle} to hurl the Blast Charge; aim with the mouse.`,
        hands: [
          `Move with ${controls.move}; aim and pan with the mouse.`,
          `${controls.weaponToggle} hurls the Blast Charge. ${controls.build} opens Build; ${controls.buildSlots} choose works, ${controls.rotateBuild} rotates, and ${controls.confirm} places.`,
          `${controls.upgrade} takes an upgrade. ${controls.pause} pauses, ${controls.mute} mutes, and ${controls.cancel} backs out.`,
        ],
      }
    : {
        works: `Tap ${controls.build} to open the works; choose one, then tap ${controls.confirm} to set it down.`,
        arms: `Tap ${controls.weaponToggle} to hurl the Blast Charge; drag the view to aim.`,
        hands: [
          'Move with the Touch Stick; drag the view to aim and pan.',
          `${controls.weaponToggle} hurls the Blast Charge. ${controls.build} opens the works; choose one, then ${controls.confirm} places it.`,
          `${controls.rotateBuild} turns a work before placing it; Catch Your Breath pauses the claim.`,
        ],
      };
}

function controlLabels(mode: GazetteInputMode, bindings: GazetteBindings): Record<string, string> {
  if (mode === 'touch') {
    return {
      weaponToggle: touchLabel(bindings.weaponToggle),
      build: 'Build',
      confirm: touchLabel(bindings.confirm),
      rotateBuild: touchLabel(bindings.rotateBuild),
    };
  }
  return {
    move: `${movementLetters(bindings)} or the arrow keys`,
    weaponToggle: keyboardLabel(bindings.weaponToggle),
    build: keyboardLabel(bindings.build),
    buildSlots: `${keyLabel(bindings.buildSlots[0][0])}–${keyLabel(bindings.buildSlots.at(-1)![0])}`,
    confirm: bindings.confirm.filter((code) => !code.startsWith('Touch')).map(keyLabel).join(' or '),
    rotateBuild: keyboardLabel(bindings.rotateBuild),
    upgrade: keyboardLabel(bindings.upgrade),
    pause: keyboardLabel(bindings.pause),
    mute: keyboardLabel(bindings.mute),
    cancel: keyboardLabel(bindings.cancel),
  };
}

function movementLetters(bindings: GazetteBindings): string {
  return [bindings.moveUp, bindings.moveLeft, bindings.moveDown, bindings.moveRight]
    .map(keyboardLabel)
    .join('');
}

function keyboardLabel(codes: readonly string[]): string {
  return keyLabel(codes.find((code) => !code.startsWith('Touch')) ?? '');
}

function touchLabel(codes: readonly string[]): string {
  return (codes.find((code) => code.startsWith('Touch')) ?? '')
    .slice('Touch'.length)
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

function keyLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}
