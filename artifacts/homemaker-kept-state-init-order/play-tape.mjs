// Deterministic scripted ride for e6-glow-mesa: same orders every time, tape recorded.
// Usage: node play-tape.mjs <repoRoot> <tapePath>
import { spawn } from 'node:child_process';

const [root, tapePath] = process.argv.slice(2);

const outcome = await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [
    'scripts/gr-sim.mjs', '--contract', 'e6-glow-mesa', '--seed', 'e6-glow-mesa-01', '--tape', tapePath,
  ], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  let buffer = '';
  let stderr = '';
  let result;
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const message = JSON.parse(line);
      if (message.schema !== 'goldrush.view.v1') { result = message; continue; }
      const now = message.now;
      const orders = [];
      if (now.pendingOffer?.[0]) orders.push({ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id });
      else {
        const built = now.works.byKind ?? {};
        if ((built.stockpile ?? 0) < 1) orders.push({ verb: 'BUILD', what: 'stockpile', where: { x: 0, z: -13 }, when: { goldGte: 25 } });
        if ((built.palisade ?? 0) < 2) {
          orders.push({ verb: 'BUILD', what: 'palisade', where: { x: -5, z: -16 }, when: { goldGte: 10 } });
          orders.push({ verb: 'BUILD', what: 'palisade', where: { x: 5, z: -16 }, when: { goldGte: 10 } });
        }
        const seam = (now.seams ?? []).find(({ active, remaining }) => active && remaining > 0);
        if (seam) for (let i = 0; i < 4; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
        if (now.works.hp > 0 && now.works.hp < now.works.maxHp * 0.6) orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
        orders.push({ verb: 'HOLD', pos: { x: 0, z: 6 } });
      }
      child.stdin.write(`${JSON.stringify(orders.slice(0, 32))}\n`);
    }
  });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code !== 0 && !result) reject(new Error(`rc=${code} ${stderr}`));
    else resolve(result);
  });
});

process.stdout.write(`${JSON.stringify({
  secured: outcome.secured, waves: outcome.waves, timeMs: outcome.timeMs,
  gold: outcome.gold, kills: outcome.kills, eventLogHash: outcome.eventLogHash,
})}\n`);
