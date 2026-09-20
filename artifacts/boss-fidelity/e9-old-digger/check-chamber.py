from pathlib import Path
import bpy,json,os
out=Path.cwd()/os.environ['DIGGER_CANDIDATE'];bpy.ops.wm.open_mainfile(filepath=str(out/'old-digger.blend'));o=bpy.data.objects['tape_deck']
def points(group,state):
 index=o.vertex_groups[group].index
 ids=[v.index for v in o.data.vertices if any(x.group==index and x.weight>0 for x in v.groups)]
 return sorted(tuple(float(n) for n in o.data.shape_keys.key_blocks[state].data[i].co) for i in ids)
working=points('RedemptionAmberHeart',0);gentle=points('RedemptionTealHeart',1)
error=max(sum((x-y)**2 for x,y in zip(a,b))**.5 for a,b in zip(working,gentle));report={'workingAmberPoints':working,'gentleTealPoints':gentle,'maxVertexError':error,'tolerance':1e-5,'sameSurface':len(working)==len(gentle) and error<1e-5}
(out/'chamber-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'sameSurface':report['sameSurface']}));assert report['sameSurface'],'Gentle chamber must occupy the working chamber surface behind the cage'
