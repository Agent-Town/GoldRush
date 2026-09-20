from pathlib import Path
root=Path.cwd();out=root/'artifacts/boss-fidelity/e9-old-digger/candidate-v1';out.mkdir(exist_ok=True)
s=(root/'assets/pilots/old-digger-3d/build_old_digger.py').read_text()
s=s.replace('ROOT = Path(__file__).resolve().parents[3]',f'ROOT = Path({str(root)!r})').replace('assert triangles <= 12_000','assert triangles <= 24_000')
start=s.index('def build_wheel(');end=s.index('\ndef build_bucket_wheels',start)
s=s[:start]+'''def build_wheel(parts, label, center, radius, buckets, material):
    group = f"Redemption{label}Wheel"
    depth = 1.34
    parts.append(dq.cylinder(f"{label} wheel barrel", radius*.84, depth, tuple(center), "iron", material, vertices=32, rotation=(math.pi/2,0,0), bevel=0, damage_group=group))
    for side in (-1,1):
        face=center+Vector((0,side*(depth/2+.025),0))
        for fraction, thickness, region in ((.91,.065,"plate"),(.73,.045,"brass"),(.48,.035,"brass")):
            parts.append(dq.torus(f"{label} rim {side} {fraction}",radius*fraction,radius*thickness,tuple(face),region,material,rotation=(math.pi/2,0,0),damage_group=group,major_segments=32))
        for i in range(12):
            a=math.tau*i/12
            edge=face+Vector((math.cos(a)*radius*.88,0,math.sin(a)*radius*.88))
            parts.append(dq.beam(f"{label} spoke {side} {i}",tuple(face),tuple(edge),radius*.035,"brass",material,group))
    parts.append(dq.cylinder(f"{label} wheel hub",radius*.20,depth+.30,tuple(center),"brass",material,vertices=20,rotation=(math.pi/2,0,0),bevel=0,damage_group=group))
    parts.append(dq.ico_sphere(f"{label} teal bearing",radius*.12,tuple(center+Vector((0,-depth/2-.17,0))),"teal",material,group,scale=(1,.28,1)))
    for i in range(buckets):
        a=math.tau*i/buckets
        radial=Vector((math.cos(a),0,math.sin(a))); tangent=Vector((-math.sin(a),0,math.cos(a)))
        at=center+radial*radius*.91
        # Four plates form a scoop open at the cutting edge; no solid tooth box.
        pieces=[("bed",(.07,depth+.18,radius*.34),(0,0,0)),
                ("back",(radius*.25,depth+.18,.065),(radius*.10,0,-radius*.17)),
                ("cheek A",(radius*.25,.07,radius*.34),(radius*.10,-depth/2-.055,0)),
                ("cheek B",(radius*.25,.07,radius*.34),(radius*.10,depth/2+.055,0))]
        for name,size,(r,y,t) in pieces:
            p=at+radial*r+Vector((0,y,0))+tangent*t
            parts.append(dq.box(f"{label} scoop {i} {name}",size,tuple(p),"plate",material,0,rotation=(0,-a,0),damage_group=group))
    parts.append(dq.cylinder(f"Hidden {label} gentle hub cap",radius*.16,.06,tuple(center+Vector((0,.02,0))),"teal",material,vertices=16,rotation=(math.pi/2,0,0),bevel=0,damage_group=f"Redemption{label}HubCap"))

''' +s[end:]
s=s.replace('co.y -= 0.62','co.y -= 0.90')
s=s.replace('0.14, "iron", material','0.25, "iron", material').replace('0.14, "plate", material','0.25, "plate", material').replace('0.075, "brass", material))','0.12, "brass", material))').replace('0.060, "brass", material))','0.10, "brass", material))')
s=s.replace('(3.25, 2.72, 1.62), (0.20, 0, 1.76)','(3.25, 2.72, 2.30), (0.20, 0, 2.10)').replace('(0.15, 0, 2.68)','(0.15, 0, 3.36)').replace('(0.74, 0.20, 3.46)','(0.74, 0.20, 4.14)').replace('(0.74, -0.70, 3.44)','(0.74, -0.70, 4.12)')
s=s.replace('3.25 + height * 0.35','3.90 + height * 0.35').replace('3.25 + height * 0.85','3.90 + height * 0.85')
s=s.replace('0.16, height,','0.23, height,').replace('0.20, 0.036,','0.28, 0.045,')
needle='    return parts\n\n\ndef strip_micro_bevels'
s=s.replace(needle,'''    for part in parts:
        if part.name.startswith("Ghost"):
            part.location.z += .40
        if "tape" in part.name.lower():
            part.location.z += .25
    for side in (-1,1):
        y=side*1.45
        for z in (1.2,2.1,3.2):
            parts.append(dq.beam(f"Hall horizontal frame {side} {z}",(-1.5,y,z),(1.9,y,z),.11,"brass",material))
        for x in (-1.5,-.65,.2,1.05,1.9):
            parts.append(dq.beam(f"Hall upright frame {side} {x}",(x,y,1.2),(x,y,3.2),.10,"brass",material))
        for x in (-1.0,-.2,.6,1.4):
            parts.append(dq.cylinder(f"Track road wheel {side} {x}",.30,.58,(x,y,.68),"iron",material,vertices=14,rotation=(math.pi/2,0,0),bevel=0))
    # Central survey lantern supplies the missing upper industrial tier.
    parts.append(dq.cylinder("Survey lantern tower",.35,1.4,(-.55,.15,4.75),"iron",material,vertices=16,bevel=0))
    parts.append(dq.cylinder("Survey lantern glazing",.29,.85,(-.55,.15,4.9),"teal",material,vertices=16,bevel=0))
    for i in range(8):
        a=math.tau*i/8;x=-.55+math.cos(a)*.32;y=.15+math.sin(a)*.32
        parts.append(dq.beam(f"Survey lantern mullion {i}",(x,y,4.45),(x,y,5.35),.055,"brass",material))
    for z in (4.35,5.4):
        parts.append(dq.torus(f"Survey lantern cornice {z}",.39,.07,(-.55,.15,z),"brass",material,major_segments=16))
    parts.append(dq.cone("Survey lantern cap",.4,.06,.4,(-.55,.15,5.65),"brass",material,vertices=16))
    return parts


def strip_micro_bevels''')
(out/'build_old_digger.py').write_text(s)
