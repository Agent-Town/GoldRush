"""Repeat fixed-region display luminance measurements from the retained frozen frames."""
from pathlib import Path
from PIL import Image
import numpy as np
import json

folder = Path(__file__).resolve().parent
rows = []
for width, bank, water in [(1280, [980,450,1050,550], [250,210,480,275]), (390, [20,380,115,415], [20,292,80,318])]:
    for name, box in [('bank', bank), ('water', water)]:
        pair = {}
        for arm in ['before', 'after']:
            image = Image.open(folder / f'{arm}-frozen-{width}.png').convert('RGB').crop(box)
            rgb = np.asarray(image, dtype=float) / 255
            luminance = rgb @ np.array([.2126,.7152,.0722])
            pair[arm] = {'median': float(np.median(luminance)), 'rms': float(np.std(luminance)), 'rgbMean': rgb.mean(axis=(0,1)).tolist(), 'gradientRmsX': float(np.std(np.diff(luminance,axis=1))), 'gradientRmsY': float(np.std(np.diff(luminance,axis=0)))}
            image.resize((image.width*3,image.height*3)).save(folder / f'crop-{arm}-{name}-{width}.png')
        rows.append({'width':width,'region':name,'box':box,**pair,'medianChangePercent':(pair['after']['median']/pair['before']['median']-1)*100,'rmsChangePercent':(pair['after']['rms']/pair['before']['rms']-1)*100})
report = {'method':'Frozen full-tier normal-HUD captures. Display RGB Rec.709 luminance; fixed unobscured ROIs. Water is animated, so one frozen sample measures the captured surface and is not a temporal stability statistic. Zero mounted landmarks: station/body-emission/HUD body coverage are not applicable.','rows':rows}
(folder/'visual-metrics.json').write_text(json.dumps(report,indent=2)+'\n')
