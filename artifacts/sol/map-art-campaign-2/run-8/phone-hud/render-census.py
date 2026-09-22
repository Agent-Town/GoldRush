"""Render the saved, guard-checked census into a reviewable panel/body table."""
from pathlib import Path
import json

root = Path(__file__).parent
before = json.loads((root / 'before.json').read_text())
after = json.loads((root / 'after.json').read_text())
names = {'e8-low-orbit': 'Low Orbit', 'e9-seed-run': 'Seed Run', 'e10-archive-world': 'Archive World',
         'e7-dead-band': 'Dead Band', 'e7-relay-rush': 'Relay Rush', 'e6-glow-mesa': 'Glow Mesa'}

def row(data, map_id, width):
    return next(r for r in data['rows'] if r['map'] == map_id and r['width'] == width)

def percent(value):
    return 'OFFSCREEN' if value is None else f'{value:.2f}%'

lines = ['# Phone entry census — final run 8', '',
         f'Captured {after["capturedAt"]}. UI source fingerprint `{after["sourceHash"]}`.', '',
         'Painted union uses the inherited run-6 persistent mask. Per-panel percentages below are clipped rectangle areas, not painted area, and must not be summed. Transient story cards are excluded only in the labelled masks. The inherited mask also excludes the prompt-stack parent backing; ordinary frames retain it. Zero body pixels means OFFSCREEN, never a 0% clearance pass.', '',
         '| Map | Phone union before → after | Reduction | Desktop union before → after |',
         '|---|---:|---:|---:|']
for current in after['rows']:
    if current['width'] != 390:
        continue
    map_id = current['map']
    old, desktop, old_desktop = row(before, map_id, 390), row(after, map_id, 1280), row(before, map_id, 1280)
    lines.append(f'| {names[map_id]} | {percent(old["unionPercent"])} → {percent(current["unionPercent"])} | {(1-current["unionPercent"]/old["unionPercent"])*100:.2f}% | {percent(old_desktop["unionPercent"])} → {percent(desktop["unionPercent"])} |')

lines += ['', '## Entry bodies', '', '| Map / viewport | Body | Before | After | After body pixels |', '|---|---|---:|---:|---:|']
for current in after['rows']:
    old = row(before, current['map'], current['width'])
    for body in current['landmarks']:
        original = next(b for b in old['landmarks'] if b['focus'] == body['focus'])
        lines.append(f'| {names[current["map"]]} / {current["width"]} | `{body["focus"]}` | {percent(original["persistentHudCoveragePercent"])} | {percent(body["persistentHudCoveragePercent"])} | {body["bodyPixels"]} |')

for current in after['rows']:
    map_id, width = current['map'], current['width']
    old = row(before, map_id, width)
    lines += ['', f'## {names[map_id]} — {width}×{current["height"]}', '',
              f'[Before]({map_id}/before-{width}-plain.png) · [After]({map_id}/after-{width}-plain.png) · [Phone board]({map_id}/board-390.png)', '',
              '| Panel | Before box (x, y, w, h) | Before area | After box (x, y, w, h) | After area |', '|---|---|---:|---|---:|']
    for panel in current['panels']:
        original = next(p for p in old['panels'] if p['id'] == panel['id'])
        def box(p):
            return ', '.join(f'{p["box"][key]:.2f}' for key in ['x', 'y', 'width', 'height'])
        lines.append(f'| `{panel["id"]}` | {box(original)} | {original["screenPercent"]:.3f}% | {box(panel)} | {panel["screenPercent"]:.3f}% |')
(root / 'census.md').write_text('\n'.join(lines) + '\n')
