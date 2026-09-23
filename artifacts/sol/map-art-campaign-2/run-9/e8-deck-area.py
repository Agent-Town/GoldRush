"""Measure the retained chamfered visual base independently of collision data."""
from pathlib import Path
import bpy, json

root = Path.cwd()
pack = root / 'assets/pilots/map-rebuild-spike'
out = root / 'artifacts/sol/map-art-campaign-2/run-9/e8-low-orbit'

def measure(path):
    bpy.ops.wm.open_mainfile(filepath=str(path))
    vertices = bpy.data.objects['claw-carcass-rig'].data.vertices
    floor = min(v.co.z for v in vertices)
    points = sorted(set((float(v.co.x), float(v.co.y)) for v in vertices if abs(v.co.z - floor) < 1e-6))
    def cross(o, a, b):
        return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lower, upper = [], []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    area = abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(hull,hull[1:]+hull[:1]))) / 2
    rectangle = (max(x for x,y in hull)-min(x for x,y in hull)) * (max(y for x,y in hull)-min(y for x,y in hull))
    return {'vertices': hull, 'area': area, 'boundingRectangleArea': rectangle, 'reductionFromBoundingRectanglePercent': (1-area/rectangle)*100}

before = measure(pack / 'sources/e8-low-orbit-fidelity-2/landmarks-input.blend')
after = measure(pack / 'landmarks/low-orbit/low-orbit-landmarks.blend')
result = {'before': before, 'after': after, 'areaChangePercent': (after['area']/before['area']-1)*100, 'scope': 'Rendered bottom-face hull only; collision footprint is separately byte-verified unchanged.'}
(out / 'deck-area.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result, indent=2))
