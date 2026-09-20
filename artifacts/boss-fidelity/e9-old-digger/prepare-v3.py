from pathlib import Path
r=Path('artifacts/boss-fidelity/e9-old-digger');out=r/'candidate-v3';out.mkdir(exist_ok=True)
s=(r/'candidate-v2/build_old_digger.py').read_text().replace('Vector((4.72, 0, 1.58))','Vector((5.80, 0, 1.58))')
a=s.index('def build_gantry(');b=s.index('\ndef strip_micro_bevels',a)
s=s[:a]+'''def build_gantry(material):
    parts=[]
    for label,xa,za,xb,zb in (("Port",-4.55,2.25,-1.45,3.20),("Starboard",1.45,3.10,5.80,1.58)):
        for side in (-1,1):
            y=side*.92
            for h in (0,1.05):
                parts.append(dq.beam(f"{label} main chord {side} {h}",(xa,y,za+h),(xb,y,zb+h),.22,"iron",material))
            for i in range(6):
                t=i/6;u=(i+1)/6;x=xa+(xb-xa)*t;xx=xa+(xb-xa)*u;z=za+(zb-za)*t;zz=za+(zb-za)*u
                parts.append(dq.beam(f"{label} truss diagonal {side} {i}",(x,y,z),(xx,y,zz+1.05),.12,"brass",material))
                parts.append(dq.beam(f"{label} truss post {side} {i}",(x,y,z),(x,y,z+1.05),.10,"plate",material))
        for i in range(7):
            t=i/6;x=xa+(xb-xa)*t;z=za+(zb-za)*t+.12
            parts.append(dq.beam(f"{label} conveyor roller {i}",(x,-.92,z),(x,.92,z),.16,"brass",material))
    # Broad tapered derrick, braced in both planes.
    for side in (-1,1):
        y=side*.8
        for x in (-4.0,-2.45):
            parts.append(dq.beam(f"Derrick leg {side} {x}",(x,y,3.25),(-3.2,side*.46,6.7),.17,"iron",material))
        for i in range(4):
            z=3.4+i*.8;t=(z-3.25)/3.45;left=-4+.8*t;right=-2.45-.75*t
            parts.append(dq.beam(f"Derrick brace {side} {i}",(left,y,z),(right,y,z+.65),.10,"brass",material))
    parts.append(dq.beam("Derrick head crosspiece",(-3.2,-.7,6.7),(-3.2,.7,6.7),.24,"brass",material))
    parts.append(dq.cylinder("Derrick pulley",.28,.48,(-3.2,0,6.6),"brass",material,vertices=16,rotation=(math.pi/2,0,0),bevel=0))
    for y in (-.3,.3):
        parts.append(dq.beam("Port load cable",(-3.2,y,6.55),(-4.55,y,3.3),.055,"rope",material))
        parts.append(dq.beam("Counter load cable",(-3.2,y,6.55),(5.8,y,2.5),.055,"rope",material))
    # Upper gallery rails rise from the roof edge when the machine is taught.
    for side in (-1,1):
        y=side*1.55
        parts.append(dq.beam(f"Hidden safe rail {side}",(-1.6,y,4.20),(1.6,y,4.20),.07,"brass",material,"RedemptionSafeRail"))
        for x in (-1.5,-.9,-.3,.3,.9,1.5):
            parts.append(dq.beam(f"Hidden safe post {side} {x}",(x,y,3.58),(x,y,4.20),.055,"brass",material,"RedemptionSafeRail"))
    for x in (-1.1,1.1):
        for offset in (-.24,.24):
            parts.append(dq.beam(f"Stowed access rail {x} {offset}",(x+offset,-1.6,2.4),(x+offset,-1.6,4.22),.055,"brass",material,"RedemptionBoardingSteps"))
        for i in range(16):
            z=2.4+1.82*i/15
            parts.append(dq.beam(f"Stowed access rung {x} {i}",(x-.24,-1.6,z),(x+.24,-1.6,z),.045,"brass",material,"RedemptionBoardingSteps"))
    return parts


def build_tape_deck(material):
    parts=[]
    parts.append(dq.box("Deep tracked chassis",(4.4,3.4,.8),(0,0,.75),"soot",material,.08))
    for side in (-1,1):
        y=side*1.65
        parts.append(dq.box(f"Continuous track casing {side}",(4.3,.82,1.10),(0,y,.70),"iron",material,.12))
        for i in range(14):
            x=-2.0+4*i/13
            for z in (.16,1.24):
                parts.append(dq.box(f"Track tread {side} {i} {z}",(.26,.94,.12),(x,y,z),"plate",material,0))
        for x in (-1.65,-.85,0,.85,1.65):
            parts.append(dq.cylinder(f"Track road wheel {side} {x}",.39,.12,(x,y+side*.45,.7),"brass",material,vertices=16,rotation=(math.pi/2,0,0),bevel=0))
    parts.append(dq.box("Tall machine hall",(3.25,2.95,3.0),(0,0,2.7),"iron",material,.08))
    parts.append(dq.box("Upper roof gallery",(3.65,3.3,.20),(0,0,4.24),"deck",material,.02))
    for side in (-1,1):
        y=side*1.52
        for z in (1.3,2.25,3.2,4.1):
            parts.append(dq.beam(f"Hall frame belt {side} {z}",(-1.65,y,z),(1.65,y,z),.10,"brass",material))
        for x in (-1.6,-.8,0,.8,1.6):
            parts.append(dq.beam(f"Hall frame post {side} {x}",(x,y,1.3),(x,y,4.1),.09,"brass",material))
    dome=Vector((.65,.25,4.35));radius=.92
    parts.append(dq.ico_sphere("Observatory dome",radius,tuple(dome),"plate",material,scale=(1,1,.9)))
    for i in range(10):
        a=math.tau*i/10
        for j in range(5):
            def point(t):return tuple(dome+Vector((math.cos(a)*radius*math.cos(t),math.sin(a)*radius*math.cos(t),radius*.9*math.sin(t))))
            parts.append(dq.beam(f"Dome rib {i} {j}",point(j*math.pi/10),point((j+1)*math.pi/10),.045,"brass",material))
    for x,y,z,radius in ((-.8,.25,5.25,.28),(1.25,.85,5.35,.20)):
        parts.append(dq.cylinder("Lantern pedestal",radius*1.15,.55,(x,y,z-.65),"iron",material,vertices=16,bevel=0))
        parts.append(dq.cylinder("Lantern glass",radius,.95,(x,y,z),"teal",material,vertices=16,bevel=0))
        for i in range(6):
            a=math.tau*i/6;xx=x+math.cos(a)*(radius+.02);yy=y+math.sin(a)*(radius+.02)
            parts.append(dq.beam(f"Lantern mullion {i}",(xx,yy,z-.48),(xx,yy,z+.48),.045,"brass",material))
        for zz in (z-.5,z+.5):parts.append(dq.torus("Lantern collar",radius*1.18,.055,(x,y,zz),"brass",material,major_segments=16))
        parts.append(dq.cone("Lantern cap",radius*1.2,.02,.35,(x,y,z+.68),"brass",material,vertices=16))
    crest=(0,-1.64,4.0)
    parts.append(dq.cylinder("Ghost crest backplate",.96,.15,crest,"plate",material,vertices=24,rotation=(math.pi/2,0,0),bevel=0))
    parts.append(dq.torus("Ghost crest rim",.9,.07,(0,-1.74,4.0),"brass",material,rotation=(math.pi/2,0,0),major_segments=24))
    for side in (-1,1):
        parts.append(dq.beam(f"Ghost pick handle {side}",(-.5*side,-1.79,3.55),(.5*side,-1.79,4.45),.10,"brass",material))
        parts.append(dq.beam(f"Ghost pick head {side}",(.17*side,-1.81,4.53),(.70*side,-1.81,4.22),.12,"brass",material))
    parts.append(dq.box("Tape chamber frame",(2.1,.20,1.15),(0,-1.65,2.60),"brass",material,.02))
    parts.append(dq.box("Amber tape chamber",(1.85,.08,.90),(0,-1.79,2.60),"cargo",material,0,damage_group="RedemptionAmberHeart"))
    parts.append(dq.box("Hidden teal chamber",(1.85,.08,.90),(0,-1.27,2.60),"teal",material,0,damage_group="RedemptionTealHeart"))
    for x in (-.65,0,.65):parts.append(dq.beam(f"Chamber cage {x}",(x,-1.85,2.15),(x,-1.85,3.05),.055,"iron",material))
    parts.append(dq.beam("Chamber cage belt",(-.95,-1.85,2.60),(.95,-1.85,2.60),.055,"iron",material))
    return parts

''' +s[b:]
s=s.replace('    for index in dq.group_vertex_indices(gantry, "RedemptionBoardingSteps"):\n        safe.data[index].co += Vector((0, -1.02, -0.76))','''    indices = dq.group_vertex_indices(gantry, "RedemptionBoardingSteps")
    low = min(safe.data[i].co.z for i in indices)
    high = max(safe.data[i].co.z for i in indices)
    for index in indices:
        co = safe.data[index].co
        t = (co.z-low)/(high-low)
        co.z = .10+t*(high-.10)
        co.y -= .25+(1-t)*1.5''')
(out/'build_old_digger.py').write_text(s)
