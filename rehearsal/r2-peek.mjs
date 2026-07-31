import { readFileSync } from 'node:fs';
const v = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (v.done || v.timeout) { console.log(JSON.stringify(v)); process.exit(0); }
const p = v.pilotReport;
console.log(`seq ${v.seq} trig ${v.trigger} wave ${v.wave} t ${v.runSeconds.toFixed(1)} bytes ${v.meter.viewBytes}`);
console.log(`gold ${p.gold} hp ${p.heroHp} works ${JSON.stringify(p.works)} enemies ${p.enemiesAlive} edge ${p.telegraphedEdge} nextWave ${p.nextWaveInSeconds}`);
console.log(`hero ${JSON.stringify(p.hero)} seams ${JSON.stringify(p.liveSeams)} standing ${JSON.stringify(p.standingFor)}`);
console.log('ORD ' + JSON.stringify((v.ordersSnapshot.orders || []).map((o) => o.id.replace('orders-', '') + ':' + o.order.verb + ':' + o.status + (o.reason ? ':' + o.reason : ''))));
console.log('appendLog ' + JSON.stringify((v.view.appendLog || []).slice(-3)));
console.log('score ' + JSON.stringify(v.view.now.score) + ' byKind ' + JSON.stringify(v.view.now.works.byKind) + ' worksHp ' + v.view.now.works.hp + '/' + v.view.now.works.maxHp);
console.log('almanac ' + JSON.stringify(v.view.almanac.projection) + ' next ' + JSON.stringify(v.view.almanac.nextWave.composition));
