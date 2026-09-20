// Route probe: the hero has NO pathfinder (StandingOrders MOVE_HERO refuses UNREACHABLE_APPROACH
// after four seconds of no progress). tune-1 got stuck at (3.6, 2) walking west along z=2.
// This probe walks a set of candidate legs and records where the body actually ends up.
const LEGS = [
  { x: -27, z: 2 },  // west deck, direct from the claim
  { x: 0, z: 12 },
  { x: 27, z: 2 },   // east deck, proven in tune-1
  { x: 0, z: 12 },
  { x: -27, z: 8 },  // west deck via the northern lane
  { x: 0, z: 12 },
  { x: -20, z: 12 }, // straight west along the claim's row
  { x: -27, z: 8 },
  { x: 0, z: 12 },
];
let idx = 0;

export default function controller(view, rows) {
  const now = view.now;
  rows.push({
    t: +(now.timers?.runSeconds ?? 0).toFixed(1), w: now.wave,
    hero: [+now.hero.x.toFixed(2), +now.hero.z.toFixed(2)], hp: now.hero.hp,
    suit: now.air?.suit?.seconds, dome: now.air?.suit?.inDome,
    cr: now.air?.crossing ? `${now.air.crossing.credited}/${now.air.crossing.required} w${now.air.crossing.window} r=${now.air.crossing.reached.join('+')}` : null,
    fails: (now.orders || []).filter((r) => r.status === 'failed').map((r) => `${r.order.verb}@${JSON.stringify(r.order.pos || r.order.where || '')}:${String(r.reason).slice(0, 40)}`),
  });
  if (now.pendingSecure) return null;
  const orders = LEGS.map((p) => ({ verb: 'MOVE_HERO', pos: p }));
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  if (live[0]) for (let i = 0; i < 8; i += 1) orders.push({ verb: 'HARVEST', seam: live[0].id });
  return orders.slice(0, 32);
}
