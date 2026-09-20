import { ride } from '../gauntlet-heat-20260824/ride.mjs';

const at = (what, x, z, rotationSteps) => ({ what, x, z, rotationSteps });

await ride({
  contract: 'e1-baron',
  seed: 'e1-baron-01',
  repairPct: 60,
  repairWave: 10,
  upgradeTurrets: true,
  upgradeWalls: false,
  upgradeWave: 12,
  explicitPicks: true,
  oneLine: true,
  plan: (_claim, wave) => [
    at('turret', -5.4, 2), at('turret', -1.8, 2), at('turret', 1.8, 2), at('turret', 5.4, 2),
    at('sentry_beacon', -5.4, 4), at('sentry_beacon', -1.8, 4), at('sentry_beacon', 1.8, 4),
    at('sentry_beacon', 5.4, 4), at('sentry_beacon', -3.6, 5.5), at('sentry_beacon', 3.6, 5.5),
    ...(wave < 12 ? [] : [-10.5, -7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5]
      .flatMap((x) => [at('palisade', x, -4, 1), at('palisade', x, -7, 1)])),
  ],
});
