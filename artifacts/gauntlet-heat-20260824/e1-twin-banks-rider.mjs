import { ride } from './ride.mjs';
const at = (claim, what, dx, dz) => ({ what, x: claim.x + dx, z: claim.z + dz });
await ride({
  contract: 'e1-twin-banks', seed: 'e1-twin-banks-01', repairPct: 55,
  plan: (claim) => [
    at(claim, 'turret', -3, 1), at(claim, 'turret', 3, 1),
    at(claim, 'turret', -3, -3), at(claim, 'turret', 3, -3),
    at(claim, 'sentry_beacon', -8, 0), at(claim, 'sentry_beacon', 8, 0),
    at(claim, 'sentry_beacon', -8, -5), at(claim, 'sentry_beacon', 8, -5),
    at(claim, 'palisade', -6, 4), at(claim, 'palisade', -3, 4),
    at(claim, 'palisade', 3, 4), at(claim, 'palisade', 6, 4),
    at(claim, 'palisade', -6, -6), at(claim, 'palisade', 6, -6),
    at(claim, 'sluice', -16, 5), at(claim, 'sluice', 16, 5),
  ],
});
