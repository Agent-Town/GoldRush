"""Compare the raw route with the actual finale lever destination, without retouching game pixels."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

folder=Path(__file__).resolve().parent
plate=Image.open('assets/raw/plate-contract-e10-river.png').convert('RGB')
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',20)
for width in [1280,390]:
    raw=Image.open(folder/f'after-plain-{width}.png').convert('RGB')
    charter=Image.open(folder/f'finale-charter-plain-{width}.png').convert('RGB')
    pw=1280 if width==1280 else 780;ph=round(plate.height*pw/plate.width)
    board=Image.new('RGB',(width*2,ph+70+raw.height),(31,31,29))
    board.paste(plate.resize((pw,ph)),((board.width-pw)//2,30))
    y=ph+70;board.paste(raw,(0,y));board.paste(charter,(width,y));draw=ImageDraw.Draw(board)
    draw.text((10,5),'River — existing concept / distinct plain routes',fill='white',font=font)
    draw.text((10,y-29),'RAW RIVER: 128 m painted',fill='white',font=font)
    draw.text((width+10,y-29),'FINALE CHARTER: 64 m Claim',fill='white',font=font)
    board.save(folder/f'route-board-{width}.png')
