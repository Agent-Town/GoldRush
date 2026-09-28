"""Compare the same upper body region with its own run-6 accepted candidate."""
from pathlib import Path
from PIL import Image
import numpy as np
import json

base = Path('artifacts/sol/map-art-campaign-2')
out = base / 'run-9/e9-devils-alley'
rows = []
for width in [1280, 390]:
    for label, path, arm in [
        ('run6', base / 'run-6/e9-devils-alley', 'after'),
        ('currentBefore', out, 'before'),
        ('candidate', out, 'after'),
    ]:
        prefix = f'station-{arm}-center-wind-anchor-3-{width}'
        im = np.array(Image.open(path / (prefix + '-body.png')).convert('RGB')) / 255
        mask = np.array(Image.open(path / (prefix + '-mask.png')).convert('RGB')) / 255
        m = (mask[:, :, 0] > .7) & (mask[:, :, 1] < .24) & (mask[:, :, 2] > .7)
        y, _ = np.where(m)
        top, bottom = int(y.min()), int(y.max())
        cut = top + (bottom - top) * .4
        m[int(cut) + 1:] = False
        v = (im @ np.array([.2126, .7152, .0722]))[m]
        rows.append({'width': width, 'source': label, 'region': [top, cut],
                     'pixels': int(m.sum()), 'median': float(np.median(v)),
                     'darkShareBelow01Percent': float((v < .1).mean() * 100)})
(out / 'upper-mast-metrics.json').write_text(json.dumps({
    'method': 'Top 40 percent of each isolated body mask at the unchanged 3 m station. Luminance measures upper-body separation, not surface realism.',
    'rows': rows,
}, indent=2) + '\n')
