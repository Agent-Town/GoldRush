import { ride } from './ride.mjs';
const at = (claim, what, dx, dz) => ({ what, x: claim.x + dx, z: claim.z + dz });
await ride({
  contract: 'the-claim', seed: 'e1-the-claim-01', repairPct: 55,
  plan: (claim) => [
    at(claim, 'turret', -3, -4), at(claim, 'palisade', -3, -2), at(claim, 'palisade', 0, -2),
    at(claim, 'palisade', 3, -2), at(claim, 'turret', 3, -4), at(claim, 'palisade', -3, 2),
    at(claim, 'palisade', 3, 2), at(claim, 'turret', 0, 4), at(claim, 'sentry_beacon', 0, -4),
  ],
});
