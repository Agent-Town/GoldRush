import type { AgentPermissionLevel } from './PermissionLadder';

export type AgentAbility = 'auto_collect' | 'auto_repair' | 'auto_pan' | 'light_duty';

export type AgentAbilityDef = {
  id: AgentAbility;
  level: AgentPermissionLevel;
  label: string;
};

export const AGENT_ABILITIES: readonly AgentAbilityDef[] = [
  { id: 'auto_collect', level: 1, label: 'Let the Prospector gather loose XP and dropped gold' },
  { id: 'auto_repair', level: 1, label: 'Let the Prospector tend walls' },
  { id: 'light_duty', level: 1, label: 'Let the Prospector light the trail' },
  { id: 'auto_pan', level: 3, label: 'Let the Prospector work claim pans' },
];

export type AgentConsentSnapshot = {
  ceiling: AgentPermissionLevel;
  rungs: Record<AgentPermissionLevel, { earned: boolean; granted: boolean }>;
  abilities: Record<AgentAbility, { earned: boolean; granted: boolean; allowed: boolean; level: AgentPermissionLevel }>;
};

type AgentConsentState = {
  rungs: Record<AgentPermissionLevel, boolean>;
  abilities: Record<AgentAbility, boolean>;
};

export type AgentConsentFutureState = AgentConsentState;

export class AgentConsentStore {
  private state = freshConsentState();

  reset(): void {
    this.state = freshConsentState();
  }

  captureFutureState(): AgentConsentFutureState {
    return { rungs: { ...this.state.rungs }, abilities: { ...this.state.abilities } };
  }

  restoreFutureState(state: AgentConsentFutureState): boolean {
    const rungValues = [state.rungs?.[0], state.rungs?.[1], state.rungs?.[2], state.rungs?.[3]];
    const abilityValues = [state.abilities?.auto_collect, state.abilities?.auto_repair, state.abilities?.auto_pan];
    if (![...rungValues, ...abilityValues].every((value) => typeof value === 'boolean')) return false;
    this.state = {
      rungs: { ...state.rungs },
      abilities: { ...state.abilities, light_duty: state.abilities.light_duty === true },
    };
    return true;
  }

  setRung(level: AgentPermissionLevel, granted: boolean): void {
    this.state.rungs[level] = granted;
  }

  setAbility(ability: AgentAbility, granted: boolean): void {
    this.state.abilities[ability] = granted;
  }

  allows(ability: AgentAbility, ceiling: AgentPermissionLevel): boolean {
    const def = AGENT_ABILITIES.find((entry) => entry.id === ability);
    if (!def || def.level > ceiling) return false;
    return this.state.rungs[def.level] && this.state.abilities[ability];
  }

  snapshot(ceiling: AgentPermissionLevel): AgentConsentSnapshot {
    return {
      ceiling,
      rungs: {
        0: this.rung(0, ceiling),
        1: this.rung(1, ceiling),
        2: this.rung(2, ceiling),
        3: this.rung(3, ceiling),
      },
      abilities: {
        auto_collect: this.ability('auto_collect', ceiling),
        auto_repair: this.ability('auto_repair', ceiling),
        light_duty: this.ability('light_duty', ceiling),
        auto_pan: this.ability('auto_pan', ceiling),
      },
    };
  }

  private rung(level: AgentPermissionLevel, ceiling: AgentPermissionLevel): { earned: boolean; granted: boolean } {
    return { earned: level <= ceiling, granted: this.state.rungs[level] };
  }

  private ability(
    ability: AgentAbility,
    ceiling: AgentPermissionLevel,
  ): { earned: boolean; granted: boolean; allowed: boolean; level: AgentPermissionLevel } {
    const def = AGENT_ABILITIES.find((entry) => entry.id === ability)!;
    const earned = def.level <= ceiling;
    const granted = this.state.abilities[ability];
    return { earned, granted, allowed: earned && this.state.rungs[def.level] && granted, level: def.level };
  }
}

function freshConsentState(): AgentConsentState {
  return {
    rungs: { 0: true, 1: true, 2: true, 3: true },
    abilities: { auto_collect: true, auto_repair: true, auto_pan: true, light_duty: false },
  };
}
