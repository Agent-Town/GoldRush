#!/usr/bin/env node
/**
 * anim-pass-prompt.mjs — THE EIGHT WINDS (2026-07-28), prompt arm.
 *
 * Builds one diagonal-row prompt from reviews/eight-winds/cast.json so that
 * sixty-odd prompts differ ONLY in the character and the wind, and every one of
 * them carries the house style anchor verbatim and the anti-mirror clauses.
 *
 * The geometry below is derived once and reused, because getting it wrong is the
 * expensive failure (a whole batch of moonwalkers). With the camera south of the
 * plaza looking north — screen down = south, screen right = east — a figure's
 * RIGHT side is its facing vector rotated (x,y) -> (-y,x):
 *   sw (down-left)   front three-quarter, the character's LEFT  side nearer the viewer
 *   se (down-right)  front three-quarter, the character's RIGHT side nearer the viewer
 *   nw (up-left)     back  three-quarter, the character's LEFT  side nearer the viewer
 *   ne (up-right)    back  three-quarter, the character's RIGHT side nearer the viewer
 * That asymmetry is what forbids the mirror cheat: sw and se show OPPOSITE sides
 * of the body, so a flipped sw puts the towel on the wrong shoulder.
 *
 *   node scripts/anim-pass-prompt.mjs <character> <sw|se|nw|ne> [--frames N] [--cols C] [--rows R]
 */
import fs from 'node:fs';
import path from 'node:path';

const CAST = JSON.parse(fs.readFileSync('reviews/eight-winds/cast.json', 'utf8')).cast;
const A = process.argv.slice(2);
const arg = (k, d = null) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const name = A[0], wind = A[1];
const c = CAST[name];
if (!c) { console.error(`unknown character ${name}; have ${Object.keys(CAST).join(', ')}`); process.exit(2); }

const frames = Number(arg('--frames', String(c.frames)));
const cols = Number(arg('--cols', String(frames >= 8 ? 4 : 2)));
const rows = Math.ceil(frames / cols);

/**
 * Where each side of the BODY lands on the SCREEN, per wind. Derived once, from
 * the facing vector f in screen coords (x right, y down = toward the viewer):
 * the character's left-shoulder offset is (fy, -fx), so its screen-x is fy and
 * its depth is -fx. This table is the correction that F-EW-1 forced: the first
 * tavernkeeper SE take came back with the towel on the wrong shoulder because
 * the prompt only said "the character's RIGHT side is nearer", which a generator
 * reads as "put the props on the near side". Naming the screen side outright is
 * the difference between a diagonal walker and a flipped one.
 *
 *   wind   character LEFT      character RIGHT
 *   sw     screen RIGHT, near  screen LEFT, far
 *   se     screen RIGHT, far   screen LEFT, near
 *   nw     screen LEFT, near   screen RIGHT, far
 *   ne     screen LEFT, far    screen RIGHT, near
 */
const WIND = {
  sw: { travel: 'DOWN-AND-LEFT, toward the lower-left corner of the frame', view: 'THREE-QUARTER FRONT', see: "the viewer sees the character's face and chest", near: 'LEFT', point: 'lower-left', L: ['RIGHT', 'nearer the viewer'], R: ['LEFT', 'farther from the viewer'] },
  se: { travel: 'DOWN-AND-RIGHT, toward the lower-right corner of the frame', view: 'THREE-QUARTER FRONT', see: "the viewer sees the character's face and chest", near: 'RIGHT', point: 'lower-right', L: ['RIGHT', 'farther from the viewer'], R: ['LEFT', 'nearer the viewer'] },
  nw: { travel: 'UP-AND-LEFT, away from the viewer toward the upper-left corner of the frame', view: 'THREE-QUARTER BACK', see: "the viewer sees the back of the head and the back of the body; the face is turned away and mostly hidden", near: 'LEFT', point: 'upper-left', L: ['LEFT', 'nearer the viewer'], R: ['RIGHT', 'farther from the viewer'] },
  ne: { travel: 'UP-AND-RIGHT, away from the viewer toward the upper-right corner of the frame', view: 'THREE-QUARTER BACK', see: "the viewer sees the back of the head and the back of the body; the face is turned away and mostly hidden", near: 'RIGHT', point: 'upper-right', L: ['LEFT', 'farther from the viewer'], R: ['RIGHT', 'nearer the viewer'] },
}[wind];
if (!WIND) { console.error('wind must be sw|se|nw|ne'); process.exit(2); }

const propLines = ((c.props ?? []).map((p) => {
  const [side, depth] = WIND[p.side];
  return `- ${p.what} belongs to the character's ${p.side === 'L' ? 'LEFT' : 'RIGHT'} side of the body. In THIS view that side of the body is ${depth}, so it must be drawn on the ${side}-HAND side of the figure in every one of the ${frames} frames${depth.startsWith('farther') ? ', partly hidden behind the head and torso' : ''}. It must never swap to the other side.`;
}).concat([
  // The universal anti-mirror invariant, and the only one a character with no
  // sided prop still has: a flipped frame is lit from the wrong side.
  `- The key light is ALWAYS from the upper left of the frame, never from the character's own left. A frame made by flipping another frame would be lit from the upper right, which is wrong. Light every frame from the upper left.`,
])).join('\n');

const hover = c.gait === 'hover';
const cycle = hover
  ? `${frames} frames of one complete hover-bob cycle — the body rises and sinks smoothly over the cycle while the arms drift, and the jet plume beneath pulses. Frame order left to right, top row first then bottom row: low, rising, high, falling, repeated once with slightly different arm drift so no two frames are identical.`
  : `${frames} frames of one complete walk cycle. Frame order left to right, top row first then bottom row: ${frames >= 8
      ? 'contact (left foot forward), down, passing, up, contact (right foot forward), down, passing, up'
      : 'contact (left foot forward), down, passing, up'}.`;

const orient = hover
  ? `THE DIRECTION — every one of the ${frames} frames shows this machine travelling ${WIND.travel}, over a flat ground plane seen from a slightly raised camera. This is a ${WIND.view} view: ${WIND.see}, turned 45 degrees away from a straight-on view so that the machine's ${WIND.near} side is the side nearer the viewer, and the porthole eye, the lamp and both arms all face toward the ${WIND.point} of the frame. Not a pure side view. Not a straight-on view. The travel direction is diagonal in all ${frames} frames, and the body never touches the ground.`
  : `THE DIRECTION — every one of the ${frames} frames shows this character walking ${WIND.travel}, on a flat ground plane seen from a slightly raised camera. This is a ${WIND.view} view: ${WIND.see}, turned 45 degrees away from a straight-on view so that the character's ${WIND.near} side is the side nearer the viewer, and the head, the chest and both boot toes all point toward the ${WIND.point} of the frame. Not a pure side profile. Not a straight-on front or back view. The travel direction is diagonal in all ${frames} frames.`;

const text = `Use your image generation tool to create ONE image and then stop. Do not write any files, do not run any shell commands, do not ask questions.

THE IMAGE — a sprite-sheet strip, exactly ${cols} columns x ${rows} rows of equal cells, ${cycle}

WHO — ${c.who}, the SAME character as the attached reference sheet: same outfit, same colours, same proportions, same face.

${orient}

BINDING FORMAT RULES
- Flat solid uniform bright magenta #ff00ff background filling every cell edge to edge, and no magenta anywhere on the figure.
- No borders, no grid lines, no drawn gutters, no frame numbers, no labels, no text, no letters, no numbers, no watermarks, no signatures.
- The SAME character in every cell: identical outfit, identical colours, identical proportions, identical scale, identical lighting.
- Constant eye-line and constant figure height across all ${frames} frames; the character must not grow, shrink or drift up and down between frames.
- Each figure fully inside its own cell with clear margin on all four sides; nothing touches or crosses a cell edge.
- Soft key light from the UPPER LEFT in every frame; shadows fall down and to the right. The lighting is identical in all ${frames} frames.
- ${frames} genuinely different poses. No duplicated frames. No mirrored or flipped copies of any frame.

WHICH SIDE EVERY ASYMMETRIC DETAIL GOES ON — this is the most important rule here, read it twice. This character is NOT symmetrical, and this view is NOT a flipped copy of the opposite view. Props do not move to whichever side happens to face the viewer; they stay bolted to the same side of the BODY:
${propLines}
- No firearms and no gun-like silhouettes. Nothing gory. No extra characters, no scenery, no props lying on the ground.

${A.includes('--retake-mirrored') ? `CRITICAL — READ AGAIN. The previous attempt at this view was a horizontally FLIPPED copy of the opposite view, which put every asymmetric detail on the wrong side of the body. Check yourself against this before you draw:
${(c.props ?? []).map((p) => `  · ${p.what} → MUST be on the ${WIND[p.side][0]}-HAND side of the figure as drawn.`).join('\n')}
If you find yourself drawing any of them on the other side, you have mirrored the wrong view. The key light is also from the upper LEFT — a flipped frame lights from the wrong side, which is the other way to catch this.

` : ''}STYLE ANCHOR, follow exactly:
Frontier Ledger style: hand-engraved storybook illustration, fine ink hatching and cross-hatch shading, parchment-warm palette of ochres, sepias and warm browns with restrained teal agent-tech glow accents; illustrated and warmly readable, never photorealistic, never gory, no text or letters or watermarks anywhere in the image.
`;

const outDir = 'reviews/eight-winds/prompts';
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${name}-${wind}.txt`);
fs.writeFileSync(outPath, text);
console.log(`${outPath}\t${cols}x${rows}\t${c.base}`);
