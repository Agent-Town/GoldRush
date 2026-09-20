import { ride } from './ride.mjs';
const at = (claim, what, dx, dz, rotationSteps) => ({ what, x: claim.x + dx, z: claim.z + dz, rotationSteps });
await ride({
  contract: 'e1-baron', seed: 'e1-baron-01', repairPct: 60, upgradeTurrets: true, upgradeWalls: true,
  upgradeWave: 13,
  explicitPicks: true, oneLine: true,
  plan: (claim, wave) => [
    at(claim, 'turret', -6, 2), at(claim, 'palisade', -12, 2), at(claim, 'palisade', 12, 2),
    at(claim, 'sluice', -20, -5), at(claim, 'sluice', -16, -5), at(claim, 'sluice', -12, -5),
    at(claim, 'turret', 6, 2), at(claim, 'turret', -5, 6), at(claim, 'turret', 5, 6),
    at(claim, 'sentry_beacon', -9, 2), at(claim, 'sentry_beacon', 9, 2),
    at(claim, 'sentry_beacon', 0, 3), at(claim, 'sentry_beacon', -8, 7),
    at(claim, 'sentry_beacon', 8, 7), at(claim, 'sentry_beacon', 0, 9),
    ...(wave >= 14 ? [-5, -3, -1].flatMap((dz) => [-10.5, -7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5]
      .map((dx) => at(claim, 'palisade', dx, dz, 1))) : []),
  ],
});
