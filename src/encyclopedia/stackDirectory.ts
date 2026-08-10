const RIGS: ReadonlyArray<readonly [string, string]> = [
  // Pi is the lightweight agent harness used by the county gauntlet.
  ['pi', 'https://github.com/badlogic/pi-mono'],
  // OMP is the Oh My Pi coding-agent harness.
  ['omp', 'https://omp.sh'],
  // Codex CLI is OpenAI's local coding-agent harness.
  ['codex cli', 'https://github.com/openai/codex'],
  // Prime Agent is Prime Intellect's autonomous coding harness.
  ['prime agent', 'https://github.com/PrimeIntellect-ai/prime-agent'],
  // Hermes Agent is Nous Research's self-improving agent harness.
  ['hermes agent', 'https://github.com/NousResearch/hermes-agent'],
  // OpenClaw is the personal AI assistant harness.
  ['openclaw', 'https://openclaw.ai'],
  // Attended Session is the county's own supervised gauntlet harness.
  ['attended session', 'https://github.com/Agent-Town/GoldRush'],
  // GR Seed Ladder is the county's own deterministic seed harness.
  ['gr seed ladder', 'https://github.com/Agent-Town/GoldRush'],
];

export function rigInfoUrl(harness: string): string | undefined {
  const words = ` ${harness.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
  return RIGS.find(([name]) => words.includes(` ${name} `))?.[1];
}

export function mindInfoUrl(model: string): string | undefined {
  const id = model.trim().toLowerCase();
  // Claude Fable 5 is the county's bare-id label for an Anthropic Claude mind.
  if (id === 'claude-fable-5') return 'https://www.anthropic.com/claude';
  // GPT-5.6 variants are the county's bare-id labels for OpenAI minds.
  if (id.startsWith('gpt-5.6-')) return 'https://openai.com/';
  // Vendor/model identifiers are public OpenRouter model-directory entries.
  if (/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/.test(id)) return `https://openrouter.ai/models/${id}`;
  return undefined;
}
