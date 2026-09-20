// One-shot: splice the nine E6-E9 walk8 direction blocks into assets/layer-contracts/characters.v2.json,
// taking the file lists from sol/code-review-20260908's own contract (Astra authored them alongside the
// art) and dropping its groundContactY / frameBlendMs keys, which main's contract uses nowhere — mixing
// them into one slot's directions would anchor or blend that heading differently from its siblings.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const CONTRACT = 'assets/layer-contracts/characters.v2.json';
const branch = JSON.parse(execFileSync('git', ['show', `sol/code-review-20260908:${CONTRACT}`], { encoding: 'utf8', maxBuffer: 1e8 }));
let text = fs.readFileSync(CONTRACT, 'utf8');
const DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];
const summary = [];

for (const slot of branch.slots.filter((s) => /^char\.e[6-9]\./.test(s.slot))) {
  const w8 = slot.walk8;
  if (!w8) throw new Error(`no walk8 on ${slot.slot}`);
  const files = [];
  const lines = DIRS.map((d) => {
    const src = w8.directions[d];
    if (!src) throw new Error(`no ${d} on ${slot.slot}`);
    src.frames.files.forEach((f) => {
      if (!fs.existsSync(`assets/processed/${f}`)) throw new Error(`missing cell ${f}`);
      files.push(f);
    });
    const frames = src.clips.walk.frames;
    return `          ${JSON.stringify(d).padEnd(5)}: { "frames": { "files": ${JSON.stringify(src.frames.files)} }, "clips": { "walk": { "frames": ${JSON.stringify(frames)}, "fps": ${src.clips.walk.fps} } } }`;
  });
  const families = [...new Set(files.map((f) => f.replace(/-r\d+c\d+\.png$/, '')))];
  const bytes = files.reduce((s, f) => s + fs.statSync(`assets/processed/${f}`).size, 0);
  const note = `sprite-roster-remainder, 2026-09-17 — F-SPR-06 ("nine E6-E9 slots expose a flat loop without direction registrations; isolated animator boards show the same facing for all eight requested headings", reviews/sol-findings-sprite-roster-fixes-20260908.md:61). Astra AUTHORED eight headings for this slot on sol/code-review-20260908 and recorded them in the same review; only its flat 8-cell loop reached main at A19 stage 1, so the art existed with nothing referencing it (F-SPRDR-4b). This block registers it: ${DIRS.length} explicit headings, ${files.length} cells over ${families.length} famil${families.length === 1 ? 'y' : 'ies'} (${families.join(', ')}), ${bytes} B. The original flat loop is KEPT above as this slot's frames/clips fallback, exactly as the landed walk8 slots keep theirs. Astra's groundContactY and frameBlendMs keys are deliberately NOT taken: main's contract carries neither anywhere, and a per-direction value would anchor or blend that one heading unlike its siblings.`;
  const block = [
    '      "walk8": {',
    '        "version": 1,',
    '        "status": "ACTIVE",',
    '        "enabled": true,',
    `        "frameCount": ${w8.frameCount},`,
    `        "fps": ${w8.fps},`,
    '        "directions": {',
    lines.join(',\n'),
    '        },',
    '        "aliases": {},',
    `        "notes": ${JSON.stringify(note)}`,
    '      }',
  ].join('\n');

  // splice: the slot object ends with its "clips" line; append the walk8 block after it.
  const marker = `      "slot": "${slot.slot}",`;
  const at = text.indexOf(marker);
  if (at < 0) throw new Error(`slot ${slot.slot} not found`);
  const end = text.indexOf('\n    },', at);
  if (end < 0) throw new Error(`slot ${slot.slot} has no end`);
  text = `${text.slice(0, end)},\n${block}${text.slice(end)}`;
  summary.push({ slot: slot.slot, headings: DIRS.length, cells: files.length, families: families.length, bytes });
}

fs.writeFileSync(CONTRACT, text);
JSON.parse(fs.readFileSync(CONTRACT, 'utf8'));
console.log(JSON.stringify(summary, null, 1));
