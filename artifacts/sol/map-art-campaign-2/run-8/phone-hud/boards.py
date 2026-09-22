"""Unretouched 390px before/after entries beside each map's existing concept plate."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
root=Path(__file__).parent
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',18)
before=json.loads((root/'before.json').read_text())
after=json.loads((root/'after.json').read_text())
for a in after['rows']:
    if a['width']!=390: continue
    name=a['map']; b=next(r for r in before['rows'] if r['map']==name and r['width']==390)
    plate=Path('assets/raw')/f'plate-contract-{name}.png'
    if not plate.exists(): plate=Path('assets/raw')/f'plate-contract-{name[3:]}.png'
    concept=Image.open(plate).convert('RGB'); concept.thumbnail((780,470))
    board=Image.new('RGB',(780,concept.height+80+844),(31,31,29));d=ImageDraw.Draw(board)
    d.text((10,5),f'{name} | existing concept / plain 390px entry',font=font,fill='white')
    board.paste(concept,((780-concept.width)//2,30))
    y=concept.height+80
    for x,phase,row in [(0,'before',b),(390,'after',a)]:
        frame=Image.open(root/name/f'{phase}-390-plain.png').convert('RGB')
        assert frame.size==(390,844)
        board.paste(frame,(x,y))
        d.text((x+10,y-30),f'{phase.upper()} | HUD union {row["unionPercent"]:.2f}%',font=font,fill='white')
    board.save(root/name/'board-390.png')
