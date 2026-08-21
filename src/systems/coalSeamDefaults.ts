export type CoalSeamAnchor = { x: number; z: number };

/**
 * THE SEAMS THE HILL MINE WAS BUILT AROUND, and the fallback for every contract that declares none.
 * These three coordinates sit in the Hill Mine's minehead — 29wu from its stake — and were the ONLY
 * coal in the game until the owner ruled on 2026-08-21 (verbatim, to the F-E2PL-1 lever: **"sounds
 * like a good idea"**) that a contract may author its own. A contract that declares no `coalSeams`
 * gets exactly this list and therefore exactly the behaviour it had before the ruling.
 */
export const DEFAULT_COAL_SEAMS: readonly CoalSeamAnchor[] = [
  { x: -12, z: 39 },
  { x: -5, z: 43 },
  { x: 3, z: 39 },
] as const;
