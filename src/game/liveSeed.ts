import rotationSeeds from '../../assets/rotations/rotation-seeds.json' with { type: 'json' };

// THE LIVE SEED: the seed a run rides when nothing pins one. Owner ruling 2026-09-24 on
// docs/OWNER-DECISIONS-2026-09-24.md item 2, verbatim "(a)", the option that reads: "Humans ride the
// open rotation's seed per contract: everyone in a week plays the same map, the board compares like
// with like, and the seed changes every Monday." Before it, every human run of every contract rode the
// literal 'gold-rush', because a release build has no `?seed=` (src/core/DebugParams.ts) and nothing
// under src/ read the weekly rotation registry that the county door enforces.
//
// The rules, in order (tasks/live-seed-rotation-1.md, scope item 1):
//   1. OPEN WEEK. The seed of the rotation open at `now` for this contract, `opensAt <= now < closesAt`:
//      the same half-open UTC window the door checks (functions/api/standings.ts `rotationForSeed` and
//      its `rotation_closed` refusal), so the week turns at Monday 00:00:00.000 UTC for every rider on
//      every clock and time zone.
//   2. CLOSED WEEK. Else the seed of the latest rotation that has ALREADY OPENED and carries this
//      contract: a closed week is better than a constant. A rotation that has not opened yet is never
//      ridden, because its seed is held out until it opens (specs/transfer-board.md L2) and the door
//      refuses it before its window anyway (L3).
//   3. CONSTANT. Else 'gold-rush', the seed every human rode before the ruling, for a contract the
//      registry does not carry (every contract outside the six rotation boards).
//
// Callers keep a replay tape's seed and a dev `?seed=` pin ahead of this. The module reads nothing but
// the registry bundled at build time: no URL, no storage, no network. It imports nothing else either,
// which is what lets `scripts/live-seed-rotation.test.mjs` run it under plain node.

export const LIVE_SEED_CONSTANT = 'gold-rush';

export type LiveRotation = {
  readonly id: string;
  readonly opensAt: string;
  readonly closesAt: string;
  readonly seeds: Readonly<Record<string, string>>;
};

const REGISTRY: readonly LiveRotation[] = rotationSeeds.rotations;
const ROTATION_ID = /^r(\d{4})w(\d{2})$/;

export function resolveLiveSeed(
  contractId: string,
  now: number = Date.now(),
  rotations: readonly LiveRotation[] = REGISTRY,
): string {
  let open: { opensAt: number; seed: string } | null = null;
  let closed: { opensAt: number; seed: string } | null = null;
  for (const rotation of rotations) {
    const seed = rotation.seeds[contractId];
    const opensAt = Date.parse(rotation.opensAt);
    const closesAt = Date.parse(rotation.closesAt);
    if (typeof seed !== 'string' || seed.length === 0 || !Number.isFinite(opensAt) || !Number.isFinite(closesAt)) continue;
    if (!(opensAt <= now)) continue;
    // Two windows never overlap in a minted registry; if one ever did, the newer week wins, so the
    // answer does not depend on the registry's array order.
    if (now < closesAt) {
      if (!open || opensAt > open.opensAt) open = { opensAt, seed };
    } else if (!closed || opensAt > closed.opensAt) {
      closed = { opensAt, seed };
    }
  }
  return open?.seed ?? closed?.seed ?? LIVE_SEED_CONSTANT;
}

// The plain-words name of a live seed for the existing seed line (scope item 4): "Week 39 claim" for a
// seed the registry minted, null for any other seed (the constant, a bench seed, a dev pin), which the
// line then shows as it always has. The week is the ISO week in the rotation id `r<year>w<week>` that
// scripts/rotation-mint.mjs writes.
export function liveSeedLabel(seed: string, rotations: readonly LiveRotation[] = REGISTRY): string | null {
  const rotation = rotations.find((entry) => Object.values(entry.seeds).includes(seed));
  const week = rotation ? ROTATION_ID.exec(rotation.id) : null;
  return week ? `Week ${Number(week[2])} claim` : null;
}

// The id of the registry week that minted a live seed (county-board-open-week-1, F-LSR1-1): the week the
// county board asks the door for, so the board a player opens is the one their own live run posted to.
// Null for any seed the registry did not mint.
export function liveSeedRotationId(seed: string, rotations: readonly LiveRotation[] = REGISTRY): string | null {
  return rotations.find((entry) => Object.values(entry.seeds).includes(seed))?.id ?? null;
}
