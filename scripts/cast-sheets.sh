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
rowmap = {}   # stem -> {row: set(direction)} — what the CONTRACT says each row means
# s1047 anim pass: the old derivation found 14 of the 45 live sheets. Three bugs,
# all of them silent: (1) it only read scalar "file" keys, so every
# "frames": {"files": [...]} array — i.e. most of the contract — was skipped;
# (2) its pattern had no underscore, dropping every char-e6..e9-*_*-sheet;
# (3) townsfolk.ts binds through town-actor-sheets.json, so no sheet name appears
# in the .ts and all ten plaza actors were invisible. The half-figure defect in
# assay-clerk/preacher/schoolteacher lived in that blind spot.
SHEET_RE = re.compile(r'(char-[a-z0-9_-]+-sheet-[a-z0-9-]+?)(-r(\d+)c\d+)?\.png$')
contracts = json.loads((root / 'assets/layer-contracts/characters.v2.json').read_text())

def note(v, who, direction=None):
    if not isinstance(v, str): return
    m = SHEET_RE.match(v)
    if not m: return
    live.setdefault(m.group(1), set()).add(who)
    if direction and m.group(3) is not None:
        rowmap.setdefault(m.group(1), {}).setdefault(int(m.group(3)), set()).add(direction)

def walk(o, slot='', direction=None):
    if isinstance(o, dict):
        sid = o.get('slot') or slot
        for k, v in o.items():
            d = k if k in ('s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw') else direction
            note(v, f'contract: {sid or "contract"}', d)
            walk(v, sid, d)
    elif isinstance(o, list):
        for v in o:
            note(v, f'contract: {slot or "contract"}', direction)
            walk(v, slot, direction)
walk(contracts)

# Town plaza actors bind through a JSON indirection, and TownScene.directionRow
# fixes their row semantics at row0=s row1=w row2=e row3=n.
actors = json.loads((root / 'src/town/town-actor-sheets.json').read_text())
for who, sheet in actors.items():
    live.setdefault(sheet, set()).add(f'town plaza: {who}')
    if who != 'prospector':
        for r, d in enumerate(('s', 'w', 'e', 'n')): rowmap.setdefault(sheet, {}).setdefault(r, set()).add(d)

# THE EIGHT WINDS (2026-07-28): the diagonal siblings are not in any contract yet
# — the code slice that binds them is a separate task — but their row order is
# fixed by the naming convention, so the gallery states it instead of shrugging.
# Captioning a sheet the reviewer cannot read is how F-A5 produced false defect
# reports; a sheet whose rows are knowable should always say what they mean.
for p in root.glob('assets/raw/char-*-sheet-*diag*.png'):
    if not re.search(r'-sheet-(?:walk|hover)diag\d+(?:-[ab])?$', p.stem): continue
    for r, d in enumerate(('sw', 'se', 'nw', 'ne')):
        rowmap.setdefault(p.stem, {}).setdefault(r, set()).add(d)

if os.environ.get('MODE') == '--all':
    sheets = [(p.stem, p, ['(unwired — reference only)'] if p.stem not in live else sorted(live[p.stem])) for p in sorted(root.glob('assets/raw/char-*-sheet-*.png'))]
else:
    sheets = [(stem, root / f'assets/raw/{stem}.png', sorted(users)) for stem, users in sorted(live.items())]

DIR_WORD = {'s': 'DOWN/south', 'se': 'down-right/SE', 'e': 'RIGHT/east', 'ne': 'up-right/NE',
            'n': 'UP/north', 'nw': 'up-left/NW', 'w': 'LEFT/west', 'sw': 'down-left/SW'}

def rowlabel(stem, row):
    """The row's meaning comes from the contract, per sheet. Hemisphere sheets
    (hero/jumper/prospector walk4-a = s/se/e/ne) are NOT down/left/right/up, and
    captioning them so invites false defect reports."""
    dirs = rowmap.get(stem, {}).get(row)
    if not dirs: return DIRS.get(row, f'row {row}')
    order = {d: i for i, d in enumerate(('s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw'))}
    names = ' + '.join(DIR_WORD[d] for d in sorted(dirs, key=lambda d: order.get(d, 9)))
    return f'row {row} → {names}'

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
        out += f'<div class="rowlabel">{html.escape(rowlabel(stem, row))}</div><div class="cellrow">{cells}</div>'
    return f'<details open><summary>processed in-game cells ({sum(len(v) for v in rows.values())})</summary>{out}</details>'

cards = ''
missing = []
for stem, path, users in sheets:
    if not path.exists():
        missing.append(stem); continue
    if rowmap.get(stem):
        rows_txt = ' · '.join(rowlabel(stem, r) for r in sorted(rowmap[stem]))
    else:
        fjp = root / 'assets/processed' / (stem + '.frames.json')
        nrows = json.loads(fjp.read_text())['grid']['rows'] if fjp.exists() else 0
        rows_txt = ('flat walk clip — row 0 = frames 0-3, row 1 = frames 4-7, NOT directional' if nrows == 2
                    else 'no direction map in the contract for this sheet (check the slot clips block before reporting a facing defect)')
    cards += (f'<figure><figcaption>{html.escape(stem)}.png<br><small>USED BY: {html.escape(", ".join(users))}<br>ROWS: {html.escape(rows_txt)}</small></figcaption>'
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
# CAST_SHEETS_NO_OPEN=1 lets an unattended pass regenerate the page without
# throwing a browser window at whoever is (not) sitting there.
[ -n "$CAST_SHEETS_NO_OPEN" ] || open logs/cast-sheets.html
