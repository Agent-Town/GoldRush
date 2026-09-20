// e5-regatta controller.
// The secure is a conjunction: wave >= 12 AND deepwater.race.finished.
// RegattaRaceSystem.advance() FREEZES once wave >= secureWave (12), so the course
// must be completed before t=272s. Racers = [prospectorPosition, boat.anchor];
// the boat anchor sits on start-line (-49,0), which is inside the FINAL gate's
// radius 6 — so passing the last beacon (49,0) finishes the race outright.
const COURSE = [
  { id: 'northwest-checkpoint', x: -28, z: 38 },
  { id: 'midcourse-checkpoint', x: 0, z: 18 },
  { id: 'northeast-checkpoint', x: 28, z: 38 },
  { id: 'finish-beacon', x: 49, z: 0 },
];
const HOME = { x: -49, z: 0 };
const HOLD_AT = { x: -51.5, z: 0 };

const PLATING = /plating|armor|armour|hp|health|vital|hearty|tough/i;

function pickUpgrade(offer) {
  const scored = offer.map((o) => {
    const text = `${o.name || ''} ${o.effectText || ''} ${o.id || ''}`;
    return { id: o.id, s: PLATING.test(text) ? 2 : 1 };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0].id;
}

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }

  const dw = now.deepwater || {};
  const pads = new Map((dw.pads || []).map((p) => [p.id, p.occupied]));
  // Free, zero-resource deck guns. DeepwaterArsenal only reads 'turret'
  // (harpoon ballista, r14) and 'sentry_beacon' (depth-charge rack, r12).
  if (pads.get('bow') === false) orders.push({ verb: 'BOAT_BUILD', padId: 'bow', buildingId: 'turret' });
  if (pads.get('port') === false) orders.push({ verb: 'BOAT_BUILD', padId: 'port', buildingId: 'sentry_beacon' });

  const race = dw.race || {};
  const passed = new Set((race.gatesPassed || []).map((g) => g.id));
  if (!race.finished) {
    for (const gate of COURSE) {
      if (!passed.has(gate.id)) orders.push({ verb: 'MOVE_TO', pos: { x: gate.x, z: gate.z } });
    }
  }
  orders.push({ verb: 'MOVE_TO', pos: HOME });

  // Once home, pan. Seams sit on the deck itself, so panning costs no commute.
  if (race.finished) {
    const seams = (now.seams || []).filter((s) => s.active);
    seams.sort((a, b) => Math.hypot(a.x - HOME.x, a.z - HOME.z) - Math.hypot(b.x - HOME.x, b.z - HOME.z));
    const slots = Math.max(0, 30 - orders.length);
    for (let i = 0; i < slots && seams.length; i += 1) {
      orders.push({ verb: 'HARVEST', seam: seams[i % seams.length].id });
    }
  }

  orders.push({ verb: 'HOLD', pos: HOLD_AT });
  return orders.slice(0, 32);
}
