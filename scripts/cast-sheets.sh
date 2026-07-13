#!/usr/bin/env bash
# Regenerate logs/cast-sheets.html — ONLY the sheets the game actually uses
# (derived live from assets/layer-contracts/characters.v2.json + src/town/townsfolk.ts),
# with row→direction key + the processed in-game cells. Then open it.
# `bash scripts/cast-sheets.sh --all` includes every raw sheet (the old full view).
cd "$(dirname "$0")/.." || exit 1
MODE="${1:-live}" python3 - <<'PY'
import pathlib, html, json, re, os
root = pathlib.Path('.')
DIRS = {0: 'row 0 → DOWN (south)', 1: 'row 1 → LEFT (west)', 2: 'row 2 → RIGHT (east)', 3: 'row 3 → UP (north)'}

live = {}
contracts = json.loads((root / 'assets/layer-contracts/characters.v2.json').read_text())
def walk(o, slot=''):
    if isinstance(o, dict):
        sid = o.get('id') or slot
        for k, v in o.items():
            if k == 'file' and isinstance(v, str):
                m = re.match(r'(char-[a-z0-9-]+-sheet-[a-z0-9-]+?)(-r\d+c\d+)?\.png$', v)
                if m: live.setdefault(m.group(1), set()).add(f'run: {sid or "contract"}')
            walk(v, sid)
    elif isinstance(o, list):
        for v in o: walk(v, slot)
walk(contracts)
ts = (root / 'src/town/townsfolk.ts').read_text()
for who, sheet in re.findall(r"id: '([a-z_]+)'[\s\S]{0,900}?fullBody: \{ sheet: '(char-[a-z0-9-]+)'", ts):
    live.setdefault(sheet, set()).add(f'town plaza: {who}')

if os.environ.get('MODE') == '--all':
    sheets = [(p.stem, p, ['(unwired — reference only)'] if p.stem not in live else sorted(live[p.stem])) for p in sorted(root.glob('assets/raw/char-*-sheet-*.png'))]
else:
    sheets = [(stem, root / f'assets/raw/{stem}.png', sorted(users)) for stem, users in sorted(live.items())]

def processed_for(stem):
    fj = root / 'assets/processed' / (stem + '.frames.json')
    if not fj.exists(): return '<p><small>no processed set (rendered whole-sheet via UV windows)</small></p>'
    data = json.loads(fj.read_text())
    rows = {}
    for cell in data.get('cells', []):
        if cell.get('empty'): continue
        rows.setdefault(cell['row'], []).append(cell['file'])
    out = ''
    for row in sorted(rows):
        cells = ''.join(
            f'<div class="cell"><img loading="lazy" src="../assets/processed/{html.escape(f)}"><span>{html.escape(f.rsplit("-",1)[-1].replace(".png",""))}</span></div>'
            for f in sorted(rows[row]))
        out += f'<div class="rowlabel">{DIRS.get(row, f"row {row}")}</div><div class="cellrow">{cells}</div>'
    return f'<details open><summary>processed in-game cells ({sum(len(v) for v in rows.values())})</summary>{out}</details>'

cards = ''
missing = []
for stem, path, users in sheets:
    if not path.exists():
        missing.append(stem); continue
    cards += (f'<figure><figcaption>{html.escape(stem)}.png<br><small>USED BY: {html.escape(", ".join(users))} · rows top→bottom: DOWN · LEFT · RIGHT · UP</small></figcaption>'
              f'<img loading="lazy" src="../{path.as_posix()}">{processed_for(stem)}</figure>')
warn = f'<p class="warn">⚠ wired but missing from assets/raw: {", ".join(missing)}</p>' if missing else ''
page = f"""<!doctype html><meta charset="utf-8"><title>Gold Rush — Live Cast Sheets</title>
<style>
body{{background:#f5e6c8;color:#2e1b0e;font-family:Georgia,serif;margin:24px}}
h1{{margin:0 0 4px}}.sub{{opacity:.75;margin:0 0 20px;max-width:900px}}.warn{{color:#8a2e2e;font-weight:bold}}
.grid{{display:grid;gap:18px}}
figure{{margin:0;background:#fff8e8;border:2px solid #2e1b0e;border-radius:8px;padding:10px;box-shadow:0 4px 0 rgba(46,27,14,.4)}}
figure>img{{width:100%;image-rendering:pixelated;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/24px 24px}}
figcaption{{font-weight:bold;margin-bottom:6px}}
details{{margin-top:8px}} summary{{cursor:pointer;font-weight:bold;color:#5b8a8a}}
.rowlabel{{font-weight:bold;margin:10px 0 4px}}
.cellrow{{display:flex;flex-wrap:wrap;gap:6px}}
.cell{{text-align:center}}
.cell img{{height:128px;image-rendering:pixelated;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/16px 16px;border:1px solid #2e1b0e}}
.cell span{{display:block;font-size:11px}}
</style>
<h1>Gold Rush — Live Cast Sheets ({len(sheets)})</h1>
<p class="sub">ONLY the sheets the game is wired to use, derived from the layer contracts + townsfolk definitions at generation time. Each card: who uses it, the raw sheet, and the processed cells the game renders (checkerboard = transparency — opaque wedges are cutting artifacts). Report by cell name (e.g. "hero walk8 r1c2"). Full archive view: <code>bash scripts/cast-sheets.sh --all</code></p>
{warn}<div class="grid">{cards}</div>
"""
pathlib.Path('logs/cast-sheets.html').write_text(page)
print(f"gallery: {len(sheets)} live sheets{' · MISSING: ' + ', '.join(missing) if missing else ''}")
PY
MODE="${1:-live}" || true
open logs/cast-sheets.html
