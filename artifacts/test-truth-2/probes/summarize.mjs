#!/usr/bin/env node
// Summarise the test-truth-2 probe outputs (./out/*.json) into the few numbers the report quotes.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out');
const read = (name) => JSON.parse(fs.readFileSync(path.join(OUT, name), 'utf8'));
const f = (v, d = 4) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(d) : String(v));
const files = fs.existsSync(OUT) ? fs.readdirSync(OUT) : [];

for (const name of files.filter((n) => n.endsWith('-night-hero.json')).sort()) {
  const r = read(name);
  console.log(`\n## ${r.project} night hero  dpr=${r.context.dpr} rect=${r.context.rect.w}x${r.context.rect.h} post=${r.overlay.enabled} exposure=${r.exposure} pilot=${r.context.pilotState}`);
  for (const label of ['day', 'dark']) {
    const p = r.phases[label];
    console.log(`  ${label}: hero=${f(p.hero.x, 2)},${f(p.hero.y, 3)},${f(p.hero.z, 2)} darkness=${p.lighting?.nightShift?.darkness} old@origin=${f(p.oldHelperAtOrigin?.value, 5)} overlay@origin=${JSON.stringify(p.oldHelperAtOrigin?.overlay)}`);
    const frame = p.frames[0];
    console.log(`    css/m=${JSON.stringify(frame.cssPerMetre)} overlay@hero=${JSON.stringify(frame.overlayAtCentre)}`);
  }
  const day = r.phases.day.frames, dark = r.phases.dark.frames;
  console.log('    h    | scene p95 day..dark ratio (f0,f1,f2)          | scene p50 ratio | luma p95 day/dark | small patch scene ratio');
  for (let i = 0; i < day[0].rows.length; i += 1) {
    const h = day[0].rows[i].h;
    const ratios = [0, 1, 2].map((k) => dark[k]?.rows[i] && day[k]?.rows[i] ? dark[k].rows[i].cssPatch.scene.p95 / day[k].rows[i].cssPatch.scene.p95 : NaN);
    const r50 = dark[0].rows[i].cssPatch.scene.p50 / day[0].rows[i].cssPatch.scene.p50;
    const small = dark[0].rows[i].smallCssPatch.scene.p95 / day[0].rows[i].smallCssPatch.scene.p95;
    console.log(`    ${f(h, 1)}  | ${f(day[0].rows[i].cssPatch.scene.p95)}..${f(dark[0].rows[i].cssPatch.scene.p95)} ${ratios.map((x) => f(x, 3)).join(',')} | ${f(r50, 3)} | ${f(day[0].rows[i].cssPatch.luma.p95)}/${f(dark[0].rows[i].cssPatch.luma.p95)} | ${f(small, 3)}`);
  }
}

for (const name of files.filter((n) => n.endsWith('-night-lantern.json')).sort()) {
  const r = read(name);
  console.log(`\n## ${r.project} night lantern  post=${r.overlay.enabled} enemies=${JSON.stringify(r.enemies.map((e) => ({ x: +e.x.toFixed(2), y: +e.y.toFixed(3), z: +e.z.toFixed(2), light: +e.light.toFixed(3) })))}`);
  for (const label of ['in', 'out']) {
    const x = r.readings[label];
    console.log(`  ${label}: old helper (abs y 1.25, fixed px)=${f(x.oldHelper, 5)} css patch abs 1.25 luma p95=${f(x.oldHelperCssPatchAbsolute125?.luma.p95, 5)}  css/m=${JSON.stringify(x.profile.cssPerMetre)} overlay=${JSON.stringify(x.profile.overlayAtCentre)}`);
    for (const row of x.profile.rows) console.log(`    h=${f(row.h, 1)} luma p95 css=${f(row.cssPatch.luma.p95)} fixedPx=${f(row.fixedPxPatch.luma.p95)} small=${f(row.smallCssPatch.luma.p95)} scene p95=${f(row.cssPatch.scene.p95)}`);
  }
}

for (const name of files.filter((n) => n.includes('-twin-ready-')).sort()) {
  const r = read(name);
  for (const which of ['first', 'second']) {
    const b = r[which];
    const firstReady = b.timeline.find((row) => row.pilotState && row.pilotState !== 'loading');
    const yChanges = b.timeline.filter((row, i, all) => i === 0 || row.heroY !== all[i - 1].heroY).map((row) => `${row.frame}:${row.heroY}(${row.pilotState}/${row.terrainLoad}/${row.landmarkLoad})`);
    console.log(`\n## ${name} ${which}: old snapshot frame ${b.atOldSnapshot.frame} heroY ${b.atOldSnapshot.heroY} pilot ${b.atOldSnapshot.pilotState}; ready wait ${b.readyAfterMs} ms; first non-loading at frame ${firstReady?.frame}; after heroY ${b.after.heroY} ${b.after.pilotState}/${b.after.heightSource}`);
    console.log(`   heroY timeline: ${yChanges.join(' -> ')}`);
  }
}

for (const name of files.filter((n) => n.endsWith('-reed.json')).sort()) {
  const r = read(name);
  console.log(`\n## ${r.project} reed census: ${JSON.stringify(r.census)} swaying total ${r.swayingTotal}; live ${JSON.stringify(r.live?.classes)}`);
  for (const [label, pose] of Object.entries(r.poses)) {
    console.log(`  ${label}: swaying in view ${pose.swayingInView}, in old region ${pose.swayingInOldRegion}; ${JSON.stringify(pose.results)}`);
  }
}
