export type SoundGroup = 'sfx' | 'ui' | 'ambience' | 'voice' | 'music';

export type SoundName =
  | 'agent-works'
  | 'blast-charge-arm'
  | 'blast-charge-boom'
  | 'build-place'
  | 'chirp-acknowledge'
  | 'chirp-refuse'
  | 'defeat-sting'
  | 'demolish'
  | 'dredge-queen-arrival-horn'
  | 'e5-deepwater-ambience-loop'
  | 'epoch-door-sting'
  | 'era-e1-frontier-loop'
  | 'era-e2-steamworks-loop'
  | 'era-e3-voltage-loop'
  | 'gold-chime'
  | 'homemaker-done-chime'
  | 'invalid'
  | 'ledger-open'
  | 'menu-tap'
  | 'old-digger-tape-swap'
  | 'palisade-collapse'
  | 'palisade-crack'
  | 'palisade-hit'
  | 'pan-swish'
  | 'prospector-hover-loop'
  | 'research-pick'
  | 'river-ambience-loop'
  | 'sluice-water-loop'
  | 'spark-bolt-fire'
  | 'spark-bolt-hit'
  | 'stockpile-deposit'
  | 't4-engines-loop'
  | 't4-first-wave'
  | 't4-wind'
  | 't5-deep-hum-loop'
  | 't5-surfacing'
  | 't5-winch-rhythm'
  | 'tier-up'
  | 'title-theme'
  | 'turret-fire'
  | 'victory-sting'
  | 'wave-start-horn'
  | 'wind-gust';

export type SoundManifestEntry = {
  file: `${SoundName}.mp3`;
  volume: number;
  group: SoundGroup;
  loop?: boolean;
  minIntervalMs?: number;
  pitchVariance?: number;
};

// Manifest choice: keep the tuneable sound list explicit, but resolve URLs with
// Vite's lazy glob so absent raw files compile to silent no-ops.
const rawAudioUrls = import.meta.glob<string>('../../assets/audio/raw/*.mp3', {
  query: '?url',
  import: 'default',
});

export const soundManifest = {
  'agent-works': { file: 'agent-works.mp3', volume: 0.32, group: 'voice' },
  'blast-charge-arm': { file: 'blast-charge-arm.mp3', volume: 0.34, group: 'sfx' },
  'blast-charge-boom': { file: 'blast-charge-boom.mp3', volume: 0.48, group: 'sfx' },
  'build-place': { file: 'build-place.mp3', volume: 0.42, group: 'ui' },
  'chirp-acknowledge': { file: 'chirp-acknowledge.mp3', volume: 0.28, group: 'voice' },
  'chirp-refuse': { file: 'chirp-refuse.mp3', volume: 0.3, group: 'voice' },
  'defeat-sting': { file: 'defeat-sting.mp3', volume: 0.42, group: 'ui' },
  demolish: { file: 'demolish.mp3', volume: 0.42, group: 'ui' },
  'dredge-queen-arrival-horn': { file: 'dredge-queen-arrival-horn.mp3', volume: 0.44, group: 'sfx' },
  'e5-deepwater-ambience-loop': { file: 'e5-deepwater-ambience-loop.mp3', volume: 0.2, group: 'ambience', loop: true },
  'epoch-door-sting': { file: 'epoch-door-sting.mp3', volume: 0.46, group: 'ui' },
  'era-e1-frontier-loop': { file: 'era-e1-frontier-loop.mp3', volume: 0.42, group: 'music', loop: true },
  'era-e2-steamworks-loop': { file: 'era-e2-steamworks-loop.mp3', volume: 0.42, group: 'music', loop: true },
  'era-e3-voltage-loop': { file: 'era-e3-voltage-loop.mp3', volume: 0.42, group: 'music', loop: true },
  'gold-chime': { file: 'gold-chime.mp3', volume: 0.3, group: 'sfx' },
  'homemaker-done-chime': { file: 'homemaker-done-chime.mp3', volume: 0.34, group: 'sfx' },
  invalid: { file: 'invalid.mp3', volume: 0.34, group: 'ui' },
  'ledger-open': { file: 'ledger-open.mp3', volume: 0.36, group: 'ui' },
  'menu-tap': { file: 'menu-tap.mp3', volume: 0.3, group: 'ui' },
  'old-digger-tape-swap': { file: 'old-digger-tape-swap.mp3', volume: 0.34, group: 'sfx' },
  'palisade-collapse': { file: 'palisade-collapse.mp3', volume: 0.5, group: 'sfx' },
  'palisade-crack': { file: 'palisade-crack.mp3', volume: 0.44, group: 'sfx' },
  'palisade-hit': { file: 'palisade-hit.mp3', volume: 0.38, group: 'sfx' },
  'pan-swish': { file: 'pan-swish.mp3', volume: 0.32, group: 'sfx' },
  'prospector-hover-loop': { file: 'prospector-hover-loop.mp3', volume: 0.18, group: 'ambience', loop: true },
  'research-pick': { file: 'research-pick.mp3', volume: 0.34, group: 'ui' },
  'river-ambience-loop': { file: 'river-ambience-loop.mp3', volume: 0.18, group: 'ambience', loop: true },
  'sluice-water-loop': { file: 'sluice-water-loop.mp3', volume: 0.24, group: 'ambience', loop: true },
  'spark-bolt-fire': { file: 'spark-bolt-fire.mp3', volume: 0.13, group: 'sfx', minIntervalMs: 80, pitchVariance: 0.05 },
  'spark-bolt-hit': { file: 'spark-bolt-hit.mp3', volume: 0.24, group: 'sfx', minIntervalMs: 50, pitchVariance: 0.04 },
  'stockpile-deposit': { file: 'stockpile-deposit.mp3', volume: 0.34, group: 'sfx' },
  't4-engines-loop': { file: 't4-engines-loop.mp3', volume: 0.28, group: 'ambience', loop: true },
  't4-first-wave': { file: 't4-first-wave.mp3', volume: 0.34, group: 'ambience' },
  't4-wind': { file: 't4-wind.mp3', volume: 0.22, group: 'ambience' },
  't5-deep-hum-loop': { file: 't5-deep-hum-loop.mp3', volume: 0.24, group: 'ambience', loop: true },
  't5-surfacing': { file: 't5-surfacing.mp3', volume: 0.3, group: 'ambience' },
  't5-winch-rhythm': { file: 't5-winch-rhythm.mp3', volume: 0.3, group: 'sfx' },
  'tier-up': { file: 'tier-up.mp3', volume: 0.38, group: 'ui' },
  'title-theme': { file: 'title-theme.mp3', volume: 0.48, group: 'music', loop: true },
  'turret-fire': { file: 'turret-fire.mp3', volume: 0.24, group: 'sfx', minIntervalMs: 70, pitchVariance: 0.04 },
  'victory-sting': { file: 'victory-sting.mp3', volume: 0.42, group: 'ui' },
  'wave-start-horn': { file: 'wave-start-horn.mp3', volume: 0.4, group: 'sfx' },
  'wind-gust': { file: 'wind-gust.mp3', volume: 0.22, group: 'ambience' },
} satisfies Record<SoundName, SoundManifestEntry>;

export function soundUrlLoader(name: SoundName): (() => Promise<string>) | undefined {
  const entry = soundManifest[name];
  return rawAudioUrls[`../../assets/audio/raw/${entry.file}`];
}
