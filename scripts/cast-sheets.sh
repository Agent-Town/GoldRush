#!/usr/bin/env bash
# Regenerate logs/cast-sheets.html (all char sheets + owner contact boards) and open it.
cd "$(dirname "$0")/.." || exit 1
python3 - <<'PY'
import pathlib, html
root = pathlib.Path('.')
sheets = sorted(root.glob('assets/raw/char-*-sheet-*.png'))
contacts = sorted(root.glob('assets/motion-pilot/production-*/contact-sheets/*owner-contact*.png'))
def section(title, files):
    cards = ''.join(f'<figure><img loading="lazy" src="../{f.as_posix()}"><figcaption>{html.escape(f.name)}</figcaption></figure>' for f in files)
    return f'<h2>{html.escape(title)} ({len(files)})</h2><div class="grid">{cards}</div>'
page = f"""<!doctype html><meta charset="utf-8"><title>Gold Rush — Cast Sheets</title>
<style>body{{background:#f5e6c8;color:#2e1b0e;font-family:Georgia,serif;margin:24px}}h1{{margin:0 0 4px}}.sub{{opacity:.7;margin:0 0 20px}}h2{{border-bottom:2px solid #2e1b0e;padding-bottom:4px;margin-top:36px}}.grid{{display:grid;gap:18px}}figure{{margin:0;background:#fff8e8;border:2px solid #2e1b0e;border-radius:8px;padding:10px;box-shadow:0 4px 0 rgba(46,27,14,.4)}}img{{width:100%;image-rendering:pixelated;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/24px 24px}}figcaption{{font-weight:bold;margin-top:6px}}</style>
<h1>Gold Rush — Cast Sheets</h1>
<p class="sub">Every character sheet in assets/raw (rows = down/left/right/up · columns = the frame cycle · checkerboard shows transparency) + the owner contact boards.</p>
{section('Character sheets (raw)', sheets)}
{section('Owner contact boards (extraction QA)', contacts)}
"""
pathlib.Path('logs/cast-sheets.html').write_text(page)
print(f"gallery: {len(sheets)} sheets + {len(contacts)} contact boards → logs/cast-sheets.html")
PY
open logs/cast-sheets.html
