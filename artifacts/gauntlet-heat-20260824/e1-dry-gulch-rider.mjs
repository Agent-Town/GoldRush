import { ride } from './ride.mjs';
const at = (claim, what, dx, dz) => ({ what, x: claim.x + dx, z: claim.z + dz });
await ride({
  contract: 'e1-dry-gulch', seed: 'e1-dry-gulch-01', repairPct: 65,
  plan: (claim) => [
    at(claim, 'turret', -3, -4), at(claim, 'palisade', -4, -1), at(claim, 'palisade', 4, -1),
    at(claim, 'palisade', -4, 2), at(claim, 'palisade', 4, 2), at(claim, 'turret', 3, -4),
    at(claim, 'turret', -3, 3), at(claim, 'sentry_beacon', -8, 0), at(claim, 'sentry_beacon', 8, 0),
    at(claim, 'turret', 3, 3), at(claim, 'sentry_beacon', 0, -8), at(claim, 'sentry_beacon', 0, 8),
  ],
});
