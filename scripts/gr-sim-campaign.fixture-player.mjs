export default function fixtureOrders() {
  return [];
}

// Plumbing fixture only: proves campaign sequencing without claiming a script beat E1.
export function fixtureOutcome({ contractId, seed }) {
  const waves = contractId === 'the-claim' ? 10 : contractId === 'e1-night-shift' ? 25 : 20;
  return {
    secured: true,
    waves,
    timeMs: 1_000,
    gold: 0,
    kills: 0,
    calls: 0,
    defaultedPicks: 0,
    defaultedSecure: 0,
    eventLogHash: `fixture:${contractId}:${seed}`,
  };
}
