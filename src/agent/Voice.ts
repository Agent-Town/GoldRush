import type { GoldRushToolName, ToolReceipt } from './ToolSurface';

export const AGENT_DISPLAY_NAME = 'the Prospector';

export type AgentVoiceKind = 'pan' | 'repair' | 'chase' | 'place' | 'gather' | 'refusal' | 'survey';

export const AGENT_BARKS: Record<AgentVoiceKind, readonly string[]> = {
  pan: ['pan...', 'sift...', 'shine', 'banked'],
  repair: ['shore...', 'patch...', 'mend...', 'braced'],
  chase: ['tracks', 'runner', 'pouch', 'mark'],
  place: ['stake...', 'timber', 'set'],
  gather: ['motes', 'sweep', 'spark'],
  refusal: ['held', 'ask me', 'no trust'],
  survey: ['survey', 'ledger'],
};

const TOOL_KIND: Partial<Record<GoldRushToolName, AgentVoiceKind>> = {
  'et.goldrush.pan_at': 'pan',
  'et.goldrush.repair': 'repair',
  'et.goldrush.chase_mark': 'chase',
  'et.goldrush.collect_xp': 'gather',
  'et.goldrush.place_building': 'place',
};

const FEED_LABEL: Record<AgentVoiceKind, string> = {
  pan: 'Pan',
  repair: 'Repair',
  chase: 'Chase',
  place: 'Build',
  gather: 'Gather',
  refusal: 'Held',
  survey: 'Survey',
};

export function voiceKindForReceipt(receipt: ToolReceipt): AgentVoiceKind | null {
  if (receipt.tool === 'et.goldrush.get_state') return null;
  if (!receipt.outcome.ok && receipt.outcome.reason !== 'NO_SYSTEM_API') return 'refusal';
  return TOOL_KIND[receipt.tool] ?? 'survey';
}

export function barkForReceipt(receipt: ToolReceipt, index: number): string | null {
  const kind = voiceKindForReceipt(receipt);
  if (!kind) return null;
  if (receipt.tool === 'et.goldrush.pan_at' && !receipt.outcome.ok && receipt.outcome.reason === 'NO_SYSTEM_API') {
    return 'pan...';
  }
  return agentBark(kind, index);
}

export function feedLineForReceipt(receipt: ToolReceipt, index: number): string | null {
  const kind = voiceKindForReceipt(receipt);
  if (!kind) return null;
  const cost = receipt.cost ? ` -${receipt.cost}g` : '';
  return `${FEED_LABEL[kind]}: ${barkForReceipt(receipt, index)}${cost}`;
}

export function agentBark(kind: AgentVoiceKind, index: number): string {
  const lines = AGENT_BARKS[kind];
  return lines[Math.abs(index) % lines.length] ?? AGENT_BARKS.survey[0];
}
