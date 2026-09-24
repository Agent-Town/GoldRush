from pathlib import Path
import json
p=Path(__file__).parent
before=json.loads((p/'before.json').read_text());after=json.loads((p/'after.json').read_text())
new=['e1-night-shift','e1-twin-banks','e1-baron','e2-trestle']
def row(report,m,w):return next(r for r in report['rows'] if r['map']==m and r['width']==w)
def pct(n):return 'OFFSCREEN' if n is None else f'{n:.2f}%'
def bodies(r):return '; '.join(l['focus']+': '+pct(l['persistentHudCoveragePercent']) for l in r['landmarks'])
lines=['# Phone entry census, run 10','', '2026-09-24. Plain launches at 10 simulation seconds, 390×844 and 1280×800. All 40 before/after boots have no test hook and zero console/page errors. The run-6 selector and color threshold are unchanged. No camera, spawn, art or simulation source changes in this slice.','', '| New map | Width | Painted union before → after | Entry body before → after | Visible body pixels before → after |','|---|---:|---:|---|---:|']
for m in new:
 for w in [390,1280]:
  b,a=row(before,m,w),row(after,m,w);bl,al=b['landmarks'][0],a['landmarks'][0]
  lines.append(f"| {m} | {w} | {b['unionPercent']:.6f}% → {a['unionPercent']:.6f}% | {pct(bl['persistentHudCoveragePercent'])} → {pct(al['persistentHudCoveragePercent'])} | {bl['bodyPixels']} → {al['bodyPixels']} |")
lines+=['','The clipped rectangle union (which includes touch hit boxes) falls from 25.497451% to 24.836374% for Night Shift and Twin Banks. Baron remains 25.497451%; Trestle remains 27.537796%. This measure overestimates painted coverage but confirms the reduced confirmation-button area.']
lines+=['','## Original six maps','', 'All twelve painted union values equal the saved run-8 after values exactly. All panel boxes equal the run-10 before boxes exactly, at both widths. Body-mask sampling remains live: small differences are not credited to CSS. The desktop Relay Rush frame varies by about one point despite identical panel boxes and no matching new CSS selector.','', '| Map | Width | Union before → after | Body coverage before | Body coverage after |','|---|---:|---:|---|---|']
for m in dict.fromkeys(r['map'] for r in before['rows']):
 if m in new:continue
 for w in [390,1280]:
  b,a=row(before,m,w),row(after,m,w)
  lines.append(f"| {m} | {w} | {b['unionPercent']:.6f}% → {a['unionPercent']:.6f}% | {bodies(b)} | {bodies(a)} |")
lines+=['','## Boards and limits','']
for m in new:lines.append(f'- [{m}: existing plate and unretouched phone before/after]({m}/board-390.png).')
lines+=['','The inherited union backdrop at z-index 4 excludes the lower-stacked touch controls; the retained selector also omits the prompt-stack parent backing. The landmark persistent masks include the touch controls and establish the phone-body improvement. The unchanged union value must not be read as unchanged touch-button area. Per-panel clipped rectangles, painted masks, live clock and body denominators are in [before.json](before.json) and [after.json](after.json). Transient story cards differ naturally between plain frames and are excluded only from the labelled persistent masks.','', 'Trestle bridge, Glow Mesa cooling rack and Relay Rush west dishes/charting station remain OFFSCREEN on phone. Relay Rush west dishes also remain OFFSCREEN on desktop. These are camera handoffs, never zero-coverage passes. Baron entry rigs are a prior run-3 camera hold; this pass measures its fort only. Desktop body coverage is not cured by this phone-only slice.']
(p/'census.md').write_text('\n'.join(lines)+'\n')
