export type AgentPermissionLevel = 0 | 1 | 2 | 3;

export type MetaProgressAgentGate = {
  readonly agentAutonomyLevel?: number;
};

export type PermissionDecision =
  | { ok: true; level: AgentPermissionLevel }
  | { ok: false; level: AgentPermissionLevel; reason: 'PERMISSION_DENIED'; requiredLevel: AgentPermissionLevel };

export const AGENT_PERMISSION_LABELS: Record<AgentPermissionLevel, string> = {
  0: 'suggest-only',
  1: 'approval-required',
  2: 'trusted-routine',
  3: 'autonomous-within-budget',
};

export function readAgentPermissionLevel(meta?: MetaProgressAgentGate | null): AgentPermissionLevel {
  const raw = meta?.agentAutonomyLevel ?? 0;
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(3, Math.floor(raw))) as AgentPermissionLevel;
}

export function decideToolPermission(
  meta: MetaProgressAgentGate | AgentPermissionLevel | null | undefined,
  sideEffect: boolean,
): PermissionDecision {
  const level = typeof meta === 'number' ? readAgentPermissionLevel({ agentAutonomyLevel: meta }) : readAgentPermissionLevel(meta);
  if (!sideEffect || level > 0) return { ok: true, level };
  return { ok: false, level, reason: 'PERMISSION_DENIED', requiredLevel: 1 };
}
