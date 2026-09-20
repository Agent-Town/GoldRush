import { ride } from './ride.mjs';
const at = (claim, what, dx, dz, rotationSteps) => ({ what, x: claim.x + dx, z: claim.z + dz, rotationSteps });
await ride({
  contract: 'e1-night-shift', seed: 'e1-night-shift-01', repairPct: 60,
  plan: (claim) => [
    at(claim, 'turret', -3, -4), at(claim, 'palisade', -3, -2, 1), at(claim, 'palisade', 0, -2, 1),
    at(claim, 'palisade', 3, -2, 1), at(claim, 'palisade', 0, 2, 1), at(claim, 'sluice', -12, -5),
    at(claim, 'turret', 3, -4), at(claim, 'sluice', 0, -5), at(claim, 'turret', -4, 1),
    at(claim, 'sluice', 12, -5), at(claim, 'turret', 4, 1), at(claim, 'sentry_beacon', -6, -4),
    at(claim, 'sentry_beacon', 6, -4), at(claim, 'sentry_beacon', -7, 1), at(claim, 'sentry_beacon', 7, 1),
  ],
});
