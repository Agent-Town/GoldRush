"""Check the candidate's actual deformation loop without starting Blender."""
import ast
import math
from pathlib import Path
from types import SimpleNamespace as NS

source = Path(__file__).parent / 'candidate-model/build_dredge_queen.py'
tree = ast.parse(source.read_text())
compile(tree, str(source), 'exec')
function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'add_damage_shapes')
loop = next(n for n in function.body if isinstance(n, ast.For) and isinstance(n.target, ast.Tuple)
            and [getattr(x, 'id', None) for x in n.target.elts] == ['group', 'mast_x'])
points = [NS(x=x, y=.2, z=5.) for x in (2.59, 2.61, 4.91, 4.93)]
groups = {'DamageMainFlag': (0, 1), 'DamageAftFlag': (2, 3)}
env = dict(MAIN_MAST_X=.90, AFT_MAST_X=4.92, hold=None,
           cracked=NS(data=[NS(co=p) for p in points]),
           kit=NS(group_vertex_indices=lambda _, group: groups[group]))
exec(compile(ast.Module(body=[loop], type_ignores=[]), str(source), 'exec'), env)
assert math.isclose(points[1].x-points[0].x, .006), 'Main sail stretches across the old x=2.60 cutoff'
assert math.isclose((points[2].x+points[3].x)/2, 4.92), 'Aft sail folds around its own mast'
assert all(math.isclose(p.y, .15-(p.x-.90)*.90) for p in points[:2])
assert all(math.isclose(p.y, .15) for p in points[2:])
assert all(math.isclose(p.z, 4.064) for p in points[:2])
assert all(math.isclose(p.z, 4.556) for p in points[2:])
assert 'DamageFlag' not in source.read_text(), 'Unassigned legacy flag group remains'
print('Actual sail fold loop: main cloth continuous across x=2.60; aft pivot independent.')
