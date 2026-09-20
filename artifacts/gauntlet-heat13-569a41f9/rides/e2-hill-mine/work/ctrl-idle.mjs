export default function make() {
  return {
    onView(v, rows) {
      const n = v.now;
      rows.push(JSON.stringify({
        t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave, hp: n.hero?.hp,
        hx: +(n.hero?.x ?? 0).toFixed(1), hz: +(n.hero?.z ?? 0).toFixed(1),
        gold: n.gold, pan: n.score?.goldPanned, alive: n.threats?.alive,
        works: n.works?.standing, wrecked: n.works?.wrecked,
      }));
      return null;
    },
  };
}
