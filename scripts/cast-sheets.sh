#!/usr/bin/env bash
# Regenerate logs/cast-sheets.html (raw sheets w/ direction labels + processed in-game cells) and open it.
cd "$(dirname "$0")/.." || exit 1
python3 - <<'PY'
import pathlib, html, json
root = pathlib.Path('.')
DIRS = {0: 'row 0 → DOWN (south)', 1: 'row 1 → LEFT (west)', 2: 'row 2 → RIGHT (east)', 3: 'row 3 → UP (north)'}
sheets = sorted(root.glob('assets/raw/char-*-sheet-*.png'))
contacts = sorted(root.glob('assets/motion-pilot/production-*/contact-sheets/*owner-contact*.png'))

def processed_for(sheet: pathlib.Path):
    fj = root / 'assets/processed' / (sheet.stem + '.frames.json')
    if not fj.exists(): return ''
    data = json.loads(fj.read_text())
    rows = {}
    for cell in data.get('cells', []):
        if cell.get('empty'): continue
        rows.setdefault(cell['row'], []).append(cell['file'])
    out = ''
    for row in sorted(rows):
        cells = ''.join(
            f'<div class="cell"><img loading="lazy" src="../assets/processed/{html.escape(f)}"><span>{html.escape(f.split("-")[-1].replace(".png",""))}</span></div>'
            for f in sorted(rows[row]))
        out += f'<div class="rowlabel">{DIRS.get(row, f"row {row}")}</div><div class="cellrow">{cells}</div>'
    return f'<details><summary>processed in-game cells ({sum(len(v) for v in rows.values())}) — these are what the game renders</summary>{out}</details>'

def sheet_card(f: pathlib.Path):
    return (f'<figure><img loading="lazy" src="../{f.as_posix()}">'
            f'<figcaption>{html.escape(f.name)}<br><small>rows top→bottom: DOWN · LEFT · RIGHT · UP — columns: the frame cycle</small></figcaption>'
            f'{processed_for(f)}</figure>')

cards = ''.join(sheet_card(f) for f in sheets)
boards = ''.join(f'<figure><img loading="lazy" src="../{f.as_posix()}"><figcaption>{html.escape(f.name)}</figcaption></figure>' for f in contacts)
page = f"""<!doctype html><meta charset="utf-8"><title>Gold Rush — Cast Sheets</title>
<style>
body{{background:#f5e6c8;color:#2e1b0e;font-family:Georgia,serif;margin:24px}}
h1{{margin:0 0 4px}}.sub{{opacity:.75;margin:0 0 20px;max-width:900px}}
h2{{border-bottom:2px solid #2e1b0e;padding-bottom:4px;margin-top:36px}}
.grid{{display:grid;gap:18px}}
figure{{margin:0;background:#fff8e8;border:2px solid #2e1b0e;border-radius:8px;padding:10px;box-shadow:0 4px 0 rgba(46,27,14,.4)}}
figure>img{{width:100%;image-rendering:pixelated;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/24px 24px}}
figcaption{{font-weight:bold;margin-top:6px}}
details{{margin-top:8px}} summary{{cursor:pointer;font-weight:bold;color:#5b8a8a}}
.rowlabel{{font-weight:bold;margin:10px 0 4px}}
.cellrow{{display:flex;flex-wrap:wrap;gap:6px}}
.cell{{text-align:center}}
.cell img{{height:128px;image-rendering:pixelated;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/16px 16px;border:1px solid #2e1b0e}}
.cell span{{display:block;font-size:11px}}
</style>
<h1>Gold Rush — Cast Sheets</h1>
<p class="sub">Raw sheets from assets/raw with the row→direction key, plus (expand each) the PROCESSED cells the game actually renders — checkerboard = transparency, so any opaque background wedge (cutting artifact) shows immediately. Report findings by cell name, e.g. "hero walk8 r1c2". Regenerate: <code>bash scripts/cast-sheets.sh</code></p>
<h2>Character sheets ({len(sheets)})</h2><div class="grid">{cards}</div>
<h2>Owner contact boards ({len(contacts)})</h2><div class="grid">{boards}</div>
"""
pathlib.Path('logs/cast-sheets.html').write_text(page)
print(f"gallery: {len(sheets)} sheets (+processed cell strips) + {len(contacts)} boards")
PY
open logs/cast-sheets.html
