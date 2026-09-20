// usage: node declare-era6.mjs <tree> <64hex hash> <declaredAt YYYY-MM-DD>
import fs from 'node:fs';
const [,, tree, hash, date] = process.argv;
if (!/^[0-9a-f]{64}$/.test(hash)) throw new Error('bad hash');
const p = `${tree}/assets/engine-era.json`; const e = JSON.parse(fs.readFileSync(p, 'utf8'));
if (e.era !== 5) throw new Error('expected era 5, found ' + e.era);
e.history = [...(e.history || []), { era: 5, name: e.name, declaredAt: e.declaredAt, engineHash: e.engineHash, pins: e.pins.length, note: `${e.note} — closed 2026-09-14 by maps-campaign-land-era6: Astra's map campaign re-surveyed 17 contracts and tightened the door, so no era-5 reel installs on the era-6 engine; the 17 verified rows of the Replayed Board retire counted (owner 2026-09-13: "we don't have players yet so we can just keep going").` }];
e.era = 6; e.name = 'the Re-surveyed Claims'; e.declaredAt = date;
e.note = `Era 6 opens with Astra's map campaign (sol/map-art-inventory-20260908 7c2744e5a) landed by maps-campaign-land-era6 on ${date}: 17 contracts re-parameterised (tileParams on 13, twists on 3, briefings on 5), the door tightened to the contract's own research epoch, 66 src files, the map-rebuild-spike terrain, plaza props and flotilla models. Owner ruling 2026-09-13, verbatim: "ah, that is all no problem. we don't have players yet so we can just keep going" and "we then have to make another run in the future but not immediately"; the name ratified 2026-09-14 ("the Re-surveye Claims" is good for me). Every era-5 reel reads "This reel rode era 5; the county accepts era 6" and stands retired, counted. Heat 14 re-rides the boards on this era when the owner says so.`;
e.engineHash = hash;
e.pins = [{ engineHash: hash, pinnedAt: date, cause: 'era 6 opened by maps-campaign-land-era6: the merged tree of main 3b3f427a3 + Astra\'s map campaign 7c2744e5a with the drain\'s cures (E1/E2/E3 engineDependencies declarations restored from main, F-MAPL-2; census pins re-pointed; null floors re-recorded)', aliases: [] }];
fs.writeFileSync(p, JSON.stringify(e, null, 2) + '\n');
console.log('era', e.era, e.name, 'pins', e.pins.length, 'history', e.history.length);
