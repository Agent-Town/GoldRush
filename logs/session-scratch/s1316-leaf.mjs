import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(readFileSync(p, 'utf8'));

let parent = null;
(function walk(n) {
  for (const k of ['goals', 'subgoals', 'tasks'])
    for (const c of n[k] || []) {
      if (c.id === 'f1314-3-stockpile-tier-voice') parent = n;
      walk(c);
    }
})(g);
if (!parent) throw new Error('parent e1-frontier not found');

if (parent.tasks.some((t) => t.id === 'f1316-1-float-text-legibility')) throw new Error('leaf already exists');

parent.tasks.push({
  id: 'f1316-1-float-text-legibility',
  title:
    'F-1316-1 — every buildable upgrade float renders as a mid-word fragment: createTextTexture allocates a FIXED 192x96 canvas and drawTextTexture draws at a FIXED 64px Georgia bold, centred, with no measureText/fit/wrap, so "Stockpile Yard II - the yard holds more gold" reaches the player as the six glyphs "the ya". Fit the SIGN to the sentence (canvas width chosen from the measured text, sprite.scale.x kept in step, pool slots reset per call), and — the point of the slice — make the acceptance test assert RENDERED EXTENT instead of lastFloatText.text, which is the intended string recorded before rasterisation and has been certifying an unreadable message green.',
  taskFile: 'lane-a-f1316-1-float-text-legibility.md',
  status: 'queued',
  lane: 'lane-a',
  spec: 'specs/building-tiers/README.md',
  authoredBy: 's1316 (fire-authored)',
  authorNotes:
    'Spawned by the f1314-3 drain (reviews/f1314-3-stockpile-tier-voice.md, F-1316-1). MEASURED, not inferred: the runner reported "long labels are visibly clipped"; reading artifacts/f1314-3-stockpile-tier-voice/desktop-chrome-float.png shows it is worse than clipping — centred draw discards overflow from BOTH ends, so the player sees a different message, not a truncated one. VERIFIED AT SOURCE s1316: canvas.width=192/height=96 hard-coded in createTextTexture (~Vfx.ts:141-142); font "700 64px Georgia, serif" + textAlign centre + strokeText/fillText at canvas.width/2 in drawTextTexture (~:157-165), with no measureText anywhere in the file; sprite.scale.set(1.6,0.8,1) in the pool constructor (~:41), whose 2:1 aspect already mirrors the canvas 192:96 — that coupling is what makes the fit-the-sign cure safe. PRE-EXISTING and CLASS-WIDE: every upgradeFloatText string is a sentence (turret/sluice/palisade too) and all have been unreadable since the feature shipped; short floats (damage, gold) fit, which is why it survived. Game.ts:4438 passes lastFloatText through wholesale, so new diagnostic fields need NO Game.ts edit — verified, and Game.ts is on the NO list for that reason. COPY CHANGES ARE FORBIDDEN in this slice: shortening the strings is one of the three cures offered to the owner on the desk and is not the runner\'s call. THE REAL SUBJECT is the trap, not the pixels: every existing assertion reads lastFloatText.text (the intent, recorded pre-rasterisation), so a cure whose test still reads it has not been tested — the master makes that an automatic REJECT and demands renderedWidthPx/canvasWidthPx/fontPx assertions plus an explicit pool-reuse case (shared round-robin pool: a slot reused for a short string must return to a narrow canvas AND a narrow sprite). Known reds to expect and NOT repair: the two documented bt-01-tiers cases (reviews/bt-02-production-semantics.md). Node-guards baseline measured 204 by s1316 on this tree.',
});

writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf f1316-1-float-text-legibility registered under e1-frontier');
