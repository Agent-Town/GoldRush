import { ride } from './ride.mjs';
const at = (claim, what, dx, dz) => ({ what, x: claim.x + dx, z: claim.z + dz });
await ride({
  contract: 'e2-hill-mine', seed: 'e2-hill-mine-01', repairPct: 72, upgradeTurrets: true, upgradeWave: 11,
  explicitPicks: true, oneLine: true,
  plan: (claim) => [
    at(claim, 'turret', -5.4, 0), at(claim, 'turret', 5.4, 0),
    at(claim, 'sentry_beacon', -12, 0), at(claim, 'sentry_beacon', 12, 0),
    at(claim, 'sentry_beacon', -18, 0), at(claim, 'sentry_beacon', 18, 0),
    { what: 'turret', x: -26, z: 8.5 }, { what: 'turret', x: 26, z: 8.5 },
    at(claim, 'boiler_house', 0, -2.5),
  ],
});
