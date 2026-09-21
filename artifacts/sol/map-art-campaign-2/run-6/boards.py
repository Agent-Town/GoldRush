"""Compose unretouched plain captures beside the existing concept plate."""
from pathlib import Path
import sys, os
from PIL import Image, ImageDraw, ImageFont

root = Path('artifacts/sol/map-art-campaign-2/run-6')
plates = Path('assets/raw')
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 20)
for name in sys.argv[1:]:
    folder = root / name
    plate_path = plates / f'plate-contract-{name}.png'
    if not plate_path.exists():
        plate_path = plates / f'plate-contract-{name[3:]}.png'
    plate = Image.open(plate_path).convert('RGB')
    for width in (1280,390):
        before = Image.open(folder / f'before-plain-{width}.png').convert('RGB')
        after = Image.open(folder / f'{os.environ.get("AFTER_PHASE","after")}-plain-{width}.png').convert('RGB')
        panel_width = 1280 if width == 1280 else 780
        ph = round(plate.height * panel_width / plate.width)
        # Native captures, no rescaling of the game's pixels. Phone views sit side by side.
        board = Image.new('RGB',(max(panel_width,before.width*2),ph+70+before.height),(31,31,29))
        board.paste(plate.resize((panel_width,ph)),((board.width-panel_width)//2,30))
        y = ph+70
        board.paste(before,(0,y)); board.paste(after,(before.width,y))
        d = ImageDraw.Draw(board)
        d.text((10,5),f'{name} — existing concept / {width}px plain boot',fill='white',font=font)
        d.text((10,y-29),os.environ.get('BEFORE_LABEL','BEFORE'),fill='white',font=font)
        d.text((before.width+10,y-29),os.environ.get('AFTER_LABEL','CANDIDATE'),fill='white',font=font)
        board.save(folder / f'{os.environ.get("BOARD_PREFIX","board")}-{width}.png')
