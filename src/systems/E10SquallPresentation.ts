import type { SquallDiagnostics, SquallPhase } from './E10SquallScheduler';

/**
 * E10S-2 PRESENTATION — THE SQUALL, MADE VISIBLE AND AUDIBLE, THINLY.
 *
 * The spec's slice wording is the whole brief and the whole limit
 * (`specs/agent-play/e10-ember-shore-preserve.md` §4): "**E10S-2 — squall scheduler +
 * presentation-thin desat**: phase machine + browser vignette/mix-duck stub (the full aura shader
 * is the Quiet's finale tech — NOT built here)". So this is a screen wash and a gain number.
 * There is no shader, no post pass and no aura; §6 correction point 4 records the full effect as
 * deferred and one owner word away.
 *
 * WHY IT EXISTS AT ALL RATHER THAN LANDING WITH E10S-3. Mistake #10, the Debug-Gate Leftover: a
 * merge that a player cannot see in a plain boot is a merge nobody can check. The Seed Run one
 * epoch over shipped its mechanic invisible and the owner's playtest said so in as many words
 * ("I was not even aware that there is a caravan to protect", 2026-08-20). A squall a player
 * cannot see is a clock, not weather.
 *
 * ZERO SIM REACH, the contract `CanalFlowPresentation` and `SeedCaravanPresentation` hold:
 * constructed only by the browser, reads already-rounded published diagnostics, writes nothing
 * back. `HeadlessContractSim` never sees it, so no event-log hash and no null floor can move
 * because of anything in this file. The sim/render separation is the `visualY` rule in its
 * general form — the phase is sim, the paleness is render.
 *
 * NO `three` IMPORT, DELIBERATELY. The squall has no position, so it has nothing to draw in the
 * world: it is a full-screen wash, and the house already owns that shape as a DOM layer
 * (`.damage-vignette`, `Game.ts:728`). Styling is inline rather than a class so this slice adds
 * no rule to `src/ui/theme.css` — one file, one concern, and the firewall stays honest.
 *
 * THE DUCK IS REAL, NOT A NUMBER IN A REPORT. `gain` is multiplied into the ambience loop volumes
 * at `Game.syncAudioLoops`, which is the one place this project sets them. It is published here
 * too so a spec can assert it without listening to anything.
 */

/** Peak wash opacity at full squall. Thin on purpose: the map must stay readable while it blows. */
const MAX_WASH_OPACITY = 0.34;

/** Peak `grayscale()` on the backdrop. The Static drains colour; it does not black the map out. */
const MAX_DESATURATION = 0.55;

/** Peak duck: ambience drops to 55% while the squall blows, so the wind is what you hear. */
const MAX_DUCK_DEPTH = 0.45;

/** The Static's own pale slate, one shade cooler than A5's front band (`0x9aa3a8`). */
const WASH_COLOR = '150, 158, 164';

/** What a PLAIN boot can see and hear of the squall — this presentation's whole acceptance surface. */
export type SquallPresentationDiagnostics = Readonly<{
  phase: SquallPhase;
  /** 0 in calm, ramping through telegraph, 1 through the squall, ramping back down in recover. */
  intensity: number;
  /** The wash layer's live opacity — what an e2e reads off the element to prove it is painted. */
  washOpacity: number;
  /** The backdrop desaturation actually requested, in [0,1]. */
  desaturation: number;
  /** The multiplier applied to ambience loop volume. 1 = untouched, <1 = ducked. */
  gain: number;
  /** True once the layer has been attached to the page. */
  mounted: boolean;
}>;

export class E10SquallPresentation {
  private readonly layer = document.createElement('div');
  private state: SquallPresentationDiagnostics = {
    phase: 'calm', intensity: 0, washOpacity: 0, desaturation: 0, gain: 1, mounted: false,
  };

  constructor(host: HTMLElement) {
    this.layer.dataset.testid = 'e10-squall-wash';
    // Inline, so no CSS rule is added for one map. `absolute` + `inset` matches `.damage-vignette`
    // and sits at the same stacking depth as the other world washes, under every HUD panel.
    Object.assign(this.layer.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '4',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 160ms linear',
      background: `radial-gradient(circle at 50% 50%, transparent 34%, rgba(${WASH_COLOR}, 0.5) 82%),`
        + ` linear-gradient(rgba(${WASH_COLOR}, 0.22), rgba(${WASH_COLOR}, 0.22))`,
    } satisfies Partial<CSSStyleDeclaration>);
    host.append(this.layer);
    this.state = { ...this.state, mounted: true };
  }

  get diagnostics(): SquallPresentationDiagnostics {
    return this.state;
  }

  /** The gain a caller multiplies into an ambience volume. 1 whenever nothing is blowing. */
  get gain(): number {
    return this.state.gain;
  }

  /**
   * Idempotent and cheap: reads the published phase, writes two style properties. Called every
   * frame from `Game`'s sim block, and does nothing at all outside a squall cycle.
   */
  sync(squall: SquallDiagnostics): void {
    const intensity = intensityOf(squall);
    const washOpacity = round(intensity * MAX_WASH_OPACITY);
    const desaturation = round(intensity * MAX_DESATURATION);
    const gain = round(1 - intensity * MAX_DUCK_DEPTH);
    if (intensity !== this.state.intensity) {
      this.layer.style.opacity = washOpacity.toFixed(3);
      // Progressive: where a browser cannot composite a backdrop filter the wash alone still
      // reads, so the squall is never invisible for want of an optional feature.
      this.layer.style.backdropFilter = desaturation > 0 ? `grayscale(${desaturation.toFixed(3)})` : '';
    }
    this.state = { phase: squall.phase, intensity, washOpacity, desaturation, gain, mounted: true };
  }

  /** A new run starts calm, whatever phase the last one ended in. */
  reset(): void {
    this.layer.style.opacity = '0';
    this.layer.style.backdropFilter = '';
    this.state = { phase: 'calm', intensity: 0, washOpacity: 0, desaturation: 0, gain: 1, mounted: true };
  }

  dispose(): void {
    this.layer.remove();
    this.state = { ...this.state, mounted: false };
  }
}

/**
 * THE RAMP, and the reason the recover phase earns its name. Calm is nothing; the telegraph is
 * the 8s in which "wind rises, edges pale" (spec §3), so it ramps IN; the squall is full; the
 * recover is the same ramp run backwards. A step function would have made the recover phase
 * indistinguishable from the calm it precedes.
 */
function intensityOf(squall: SquallDiagnostics): number {
  if (!squall.declared) return 0;
  switch (squall.phase) {
    case 'telegraph': return round(clamp01(squall.phaseProgress));
    case 'squall': return 1;
    case 'recover': return round(clamp01(1 - squall.phaseProgress));
    default: return 0;
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
