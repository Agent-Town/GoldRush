from build123d import *
import math

# === AUTO-INJECTED SHIM ===
import functools, inspect as _inspect
def _fx(func, aliases=None, strip=True):
    aliases=aliases or {}
    @functools.wraps(func)
    def w(*a,**kw):
        ok=set(_inspect.signature(func).parameters.keys())
        f={}
        for k,v in kw.items():
            if k in ok:f[k]=v
            elif k in aliases:f[aliases[k]]=v
            elif not strip:f[k]=v
        return func(*a,**f)
    return w
import build123d.operations_part as _bp
import build123d.operations_generic as _bg
import build123d.operations_sketch as _bs
_bp.extrude=_fx(_bp.extrude,{'direction':'dir'})
_bp.revolve=_fx(_bp.revolve,{'angle':'revolution_arc'})
_bg.fillet=_fx(_bg.fillet,{'edges':'objects'})
_bg.chamfer=_fx(_bg.chamfer,{'edges':'objects'})
_bg.mirror=_fx(_bg.mirror,{})
_bs.make_face=_fx(_bs.make_face,{},strip=True)
from build123d import Hole as _H
_H.__init__=_fx(_H.__init__,{})
from build123d import BuildPart as _BPc,BuildSketch as _BSc,BuildLine as _BLc
_BPo=_BPc.__init__;_BSo=_BSc.__init__;_BLo=_BLc.__init__
def _bpi(self,*a,mode=Mode.ADD,**kw):
    wp=kw.pop('workplanes',a[0] if a else Plane.XY)
    return _BPo(self,wp,mode=mode,**kw)
def _bsi(self,*a,mode=Mode.ADD,**kw):
    wp=kw.pop('workplanes',a[0] if a else Plane.XY)
    return _BSo(self,wp,mode=mode,**kw)
def _bli(self,*a,mode=Mode.ADD,**kw):
    wp=kw.pop('workplane',kw.pop('workplanes',a[0] if a else Plane.XY))
    return _BLo(self,wp,mode=mode,**kw)
_BPc.__init__=_bpi;_BSc.__init__=_bsi;_BLc.__init__=_bli
extrude,revolve,fillet,chamfer,mirror,make_face=_bp.extrude,_bp.revolve,_bg.fillet,_bg.chamfer,_bg.mirror,_bs.make_face
Hole,BuildPart,BuildSketch,BuildLine=_H,_BPc,_BSc,_BLc
# === END SHIM ===

# === VALIDATION HELPERS ===
import json

_MEASUREMENTS = {}
_MISSED_CUTS = []

def _validate_solid(solid, name="solid"):
    errors = []
    try:
        if not solid.is_valid():
            errors.append(f"{name}: Solid is invalid")
    except Exception as e:
        errors.append(f"{name}: Validation error - {str(e)}")
    try:
        bb = solid.bounding_box()
        size_x = bb.max.X - bb.min.X
        size_y = bb.max.Y - bb.min.Y
        size_z = bb.max.Z - bb.min.Z
        if size_x < 0.01 or size_y < 0.01 or size_z < 0.01:
            errors.append(f"{name}: Dimensions too small ({size_x:.2f} x {size_y:.2f} x {size_z:.2f} mm)")
        max_dim = max(size_x, size_y, size_z)
        if max_dim > 1000:
            errors.append(f"{name}: Unusually large dimension ({max_dim:.2f} mm)")
    except Exception as e:
        errors.append(f"{name}: Cannot compute bounding box - {str(e)}")
    try:
        volume = solid.volume
        if volume < 0.001:
            errors.append(f"{name}: Volume too small ({volume:.6f} mm³)")
    except Exception as e:
        errors.append(f"{name}: Cannot compute volume - {str(e)}")
    return len(errors) == 0, errors

def _measure_feature(solid, name, feature_type="unknown"):
    try:
        bb = solid.bounding_box()
        size_x = bb.max.X - bb.min.X
        size_y = bb.max.Y - bb.min.Y
        size_z = bb.max.Z - bb.min.Z
        measurement = {
            "type": feature_type,
            "size_x": round(size_x, 3),
            "size_y": round(size_y, 3),
            "size_z": round(size_z, 3),
            "min_x": round(bb.min.X, 3),
            "min_y": round(bb.min.Y, 3),
            "min_z": round(bb.min.Z, 3),
            "max_x": round(bb.max.X, 3),
            "max_y": round(bb.max.Y, 3),
            "max_z": round(bb.max.Z, 3),
        }
        try:
            measurement["volume"] = round(solid.volume, 3)
        except:
            measurement["volume"] = None
        _MEASUREMENTS[name] = measurement
    except Exception as e:
        _MEASUREMENTS[name] = {"error": str(e)}

def _save_measurements(filename=None):
    if filename is None:
        import os as _os
        iteration = int(_os.environ.get("ITERATION", "0"))
        filename = f"temp_measurements_{iteration}.json"
    try:
        output_data = dict(_MEASUREMENTS)
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2)
        print(f"[DIAGNOSTICS] Saved {len(_MEASUREMENTS)} feature measurements to {filename}")
    except Exception as e:
        print(f"[DIAGNOSTICS] WARNING: Failed to save measurements: {e}")

def _safe_cut(body, tool, label=""):
    try:
        _before = body.volume
        result = body - tool
        _after = result.volume
        if abs(_after - _before) < 0.001:
            _MISSED_CUTS.append(f'MISSED_CUT: {label} — tool had NO effect on body. Position is WRONG.')
        return result
    except Exception:
        _MISSED_CUTS.append(f'CUT_ERROR: {label} — exception during cut')
        return body

def _safe_fillet(solid, edge_selector_fn, radius, label):
    try:
        edges = edge_selector_fn(solid)
        if not edges:
            _MISSED_CUTS.append(f'FILLET_FAILED: {label} — no edges matched filter')
            return solid
        _before = solid.volume
        _radii = [radius, radius * 0.5, radius * 0.25, radius * 0.125]
        _last_err = ''
        for _r in _radii:
            try:
                result = fillet(edges, radius=_r)
                _after = result.volume
                if abs(_after - _before) < 0.001:
                    _last_err = f'no volume change at radius {_r}'
                    continue
                if _r < radius:
                    _MISSED_CUTS.append(f'FILLET_DEGRADED: {label} — original radius {radius} failed, succeeded at {_r}.')
                return result
            except Exception as _e:
                _last_err = str(_e)
                continue
        _MISSED_CUTS.append(f'FILLET_FAILED: {label} — all radii {_radii} failed. Last: {_last_err}')
        return solid
    except Exception as _e:
        _MISSED_CUTS.append(f'FILLET_FAILED: {label} — {_e}')
        return solid

def _safe_chamfer(solid, edge_selector_fn, length, label):
    try:
        edges = edge_selector_fn(solid)
        if not edges:
            _MISSED_CUTS.append(f'CHAMFER_FAILED: {label} — no edges matched filter')
            return solid
        _before = solid.volume
        _lens = [length, length * 0.5, length * 0.25, length * 0.125]
        _last_err = ''
        for _l in _lens:
            try:
                result = chamfer(edges, length=_l)
                _after = result.volume
                if abs(_after - _before) < 0.001:
                    _last_err = f'no volume change at length {_l}'
                    continue
                if _l < length:
                    _MISSED_CUTS.append(f'CHAMFER_DEGRADED: {label} — original length {length} failed, succeeded at {_l}.')
                return result
            except Exception as _e:
                _last_err = str(_e)
                continue
        _MISSED_CUTS.append(f'CHAMFER_FAILED: {label} — all lengths {_lens} failed. Last: {_last_err}')
        return solid
    except Exception as _e:
        _MISSED_CUTS.append(f'CHAMFER_FAILED: {label} — {_e}')
        return solid

# === PARAMETERS ===
HOPPER_LENGTH = 600.0
HOPPER_WIDTH = 400.0
HOPPER_DEPTH = 350.0
WALL_THICKNESS = 5.0
FLARE_ANGLE_DEG = 15.0
FLARE_OFFSET = HOPPER_DEPTH * math.tan(math.radians(FLARE_ANGLE_DEG))  # ~93.8
TOP_LENGTH = HOPPER_LENGTH + 2 * FLARE_OFFSET
TOP_WIDTH = HOPPER_WIDTH + 2 * FLARE_OFFSET

FRAME_LENGTH = 700.0
FRAME_WIDTH = 400.0
FRAME_HEIGHT = 50.0
FRAME_CHAMFER = 5.0

WHEEL_DIAMETER = 100.0
WHEEL_RADIUS = 50.0
WHEEL_WIDTH = 30.0
FLANGE_HEIGHT = 15.0
FLANGE_RADIUS = 65.0
AXLE_DIAMETER = 20.0
AXLE_RADIUS = 10.0
AXLE_LENGTH = 400.0

HITCH_THICKNESS = 15.0
HITCH_HEIGHT = 40.0
HITCH_WIDTH = 20.0

LEVER_ARM_LENGTH = 200.0
LEVER_HEIGHT = 150.0
LEVER_THICKNESS = 20.0

RIVET_DIAMETER = 8.0
RIVET_SPACING = 50.0

FILLET_RADIUS = 3.0

def gen_step():
    # --- 1. Frame (wooden) ---
    # Rectangular stock with chamfered edges
    sk_frame = Rectangle(FRAME_LENGTH, FRAME_WIDTH)
    frame = extrude(sk_frame, amount=FRAME_HEIGHT)
    _measure_feature(frame, 'step-01-frame', 'extrude')

    # --- 2. Hopper (flared sides, open top) ---
    # Use loft between bottom rectangle and top rectangle
    # Bottom rectangle (inner dimensions)
    sk_bottom = Rectangle(HOPPER_LENGTH, HOPPER_WIDTH)
    # Top rectangle (flared)
    sk_top = Rectangle(TOP_LENGTH, TOP_WIDTH)
    # Loft to create outer shell
    # We need to position top at height HOPPER_DEPTH
    # build123d loft: need to create faces at different Z
    # Use BuildPart? No, we must use Algebra API.
    # Alternative: use extrude with taper? Not available.
    # Use a series of extrusions? Better: create a solid by lofting between two rectangles.
    # We can use a BuildPart context for the loft? But context managers are forbidden.
    # However, we can use the `loft` function from build123d directly.
    # The loft function expects a list of wires/faces. We can create wires at different Z.
    # Since we cannot use context managers, we can create the wires manually.
    # But the shim may not support loft. Let's use a simpler approach: create the hopper as a
    # solid block and then subtract the interior. But the flared sides require a tapered shape.
    # We'll create the outer shape by extruding the top rectangle and then cutting with a
    # tapered inner shape? That's complex.
    # Instead, we'll use a BuildLine to create a profile and then revolve? No.
    # Given time, I'll create the hopper as a simple rectangular box with flared sides approximated
    # by a trapezoidal prism using a loft. I'll use the `loft` function directly.
    # The loft function in build123d: loft([wire1, wire2, ...], ...)
    # We'll create wires at Z=0 and Z=HOPPER_DEPTH.
    # Since we cannot use context managers, we'll create the wires using make_face? No.
    # Actually, we can create a wire from a rectangle using `Rectangle().wire()`? Rectangle returns a face, we can get its outer wire.
    # But we need to position the top wire at Z=HOPPER_DEPTH.
    # Let's try:
    bottom_face = Rectangle(HOPPER_LENGTH, HOPPER_WIDTH)
    bottom_wire = bottom_face.wires()[0]  # outer wire
    top_face = Rectangle(TOP_LENGTH, TOP_WIDTH)
    top_wire = top_face.wires()[0]
    # Move top wire to Z=HOPPER_DEPTH
    top_wire_moved = Pos(0, 0, HOPPER_DEPTH) * top_wire
    # Loft
    hopper_outer = loft([bottom_wire, top_wire_moved])
    _measure_feature(hopper_outer, 'step-02-hopper-outer', 'loft')

    # Now create inner cavity: similar but smaller by wall thickness
    inner_bottom = Rectangle(HOPPER_LENGTH - 2*WALL_THICKNESS, HOPPER_WIDTH - 2*WALL_THICKNESS)
    inner_bottom_wire = inner_bottom.wires()[0]
    inner_top = Rectangle(TOP_LENGTH - 2*WALL_THICKNESS, TOP_WIDTH - 2*WALL_THICKNESS)
    inner_top_wire = inner_top.wires()[0]
    inner_top_moved = Pos(0, 0, HOPPER_DEPTH - WALL_THICKNESS) * inner_top_wire  # leave bottom thickness
    # Actually we want the cavity to be open at top, so we need to subtract a solid that goes from bottom to near top.
    # Better: create a solid from inner loft and then subtract from outer.
    # But the inner loft should be positioned such that its bottom is at Z=WALL_THICKNESS (floor thickness) and top at HOPPER_DEPTH (open).
    inner_bottom_moved = Pos(0, 0, WALL_THICKNESS) * inner_bottom_wire
    inner_top_moved = Pos(0, 0, HOPPER_DEPTH) * inner_top_wire  # open top
    hopper_inner = loft([inner_bottom_moved, inner_top_moved])
    # Subtract inner from outer to get hollow hopper
    hopper = hopper_outer - hopper_inner
    _measure_feature(hopper, 'step-03-hopper', 'boolean')

    # Position hopper on top of frame: frame top is at Z=FRAME_HEIGHT, hopper bottom at Z=FRAME_HEIGHT
    hopper = Pos(0, 0, FRAME_HEIGHT) * hopper

    # --- 3. Rivets along hopper edges ---
    # We'll add small spheres along the bottom edge and top edge? But rivets are small details.
    # For simplicity, we'll skip rivets for now to avoid complexity, but the spec requires them.
    # We'll add rivets as small cylinders along the bottom perimeter.
    # Since the hopper is flared, the bottom edge is at Z=FRAME_HEIGHT, rectangle 600x400.
    # We'll place rivets at 50mm spacing along the perimeter.
    rivets = None
    perimeter = 2 * (HOPPER_LENGTH + HOPPER_WIDTH)
    num_rivets = int(perimeter / RIVET_SPACING)
    # Create a single rivet as a cylinder with hemispherical ends? Use a sphere.
    rivet = Sphere(radius=RIVET_DIAMETER/2)
    # Place along bottom edge
    # We'll generate positions along the rectangle perimeter
    # Start at (-HOPPER_LENGTH/2, -HOPPER_WIDTH/2) and go around
    x0 = -HOPPER_LENGTH/2
    y0 = -HOPPER_WIDTH/2
    x1 = HOPPER_LENGTH/2
    y1 = HOPPER_WIDTH/2
    # We'll create a list of positions
    positions = []
    # Bottom edge (y=y0, x from x0 to x1)
    for i in range(int(HOPPER_LENGTH / RIVET_SPACING) + 1):
        x = x0 + i * RIVET_SPACING
        if x <= x1:
            positions.append((x, y0, FRAME_HEIGHT))
    # Right edge (x=x1, y from y0 to y1)
    for i in range(int(HOPPER_WIDTH / RIVET_SPACING) + 1):
        y = y0 + i * RIVET_SPACING
        if y <= y1:
            positions.append((x1, y, FRAME_HEIGHT))
    # Top edge (y=y1, x from x1 to x0)
    for i in range(int(HOPPER_LENGTH / RIVET_SPACING) + 1):
        x = x1 - i * RIVET_SPACING
        if x >= x0:
            positions.append((x, y1, FRAME_HEIGHT))
    # Left edge (x=x0, y from y1 to y0)
    for i in range(int(HOPPER_WIDTH / RIVET_SPACING) + 1):
        y = y1 - i * RIVET_SPACING
        if y >= y0:
            positions.append((x0, y, FRAME_HEIGHT))
    # Remove duplicates
    positions = list(set(positions))
    for pos in positions:
        r = Pos(pos[0], pos[1], pos[2]) * rivet
        if rivets is None:
            rivets = r
        else:
            rivets = rivets + r
    if rivets is not None:
        _measure_feature(rivets, 'step-04-rivets', 'rivets')

    # --- 4. Axle holes in frame ---
    # Two axles: front at X=340, rear at X=-340 (relative to frame center)
    # Frame is from -350 to 350 in X, so 340 is near edge.
    # Axle holes through frame in Y direction (through 0..FRAME_WIDTH? Actually frame width 400, so Y from -200 to 200)
    # We'll cut holes at Y=0, Z=FRAME_HEIGHT/2 (center of frame height)
    axle_hole = Cylinder(radius=AXLE_RADIUS, height=FRAME_WIDTH + 10, align=(Align.CENTER, Align.CENTER, Align.MIN))
    # Position at front and rear
    front_axle_hole = Pos(340, 0, FRAME_HEIGHT/2 - (FRAME_WIDTH+10)/2) * Rot(X=90) * axle_hole
    rear_axle_hole = Pos(-340, 0, FRAME_HEIGHT/2 - (FRAME_WIDTH+10)/2) * Rot(X=90) * axle_hole
    frame = _safe_cut(frame, front_axle_hole, 'front-axle-hole')
    frame = _safe_cut(frame, rear_axle_hole, 'rear-axle-hole')

    # --- 5. Hitches ---
    # Front hitch: at X=350 (front end of frame), Y=0, Z=0..HITCH_HEIGHT
    # Hitch is a rectangular block extending forward from frame
    hitch_front = extrude(Rectangle(HITCH_WIDTH, HITCH_HEIGHT), amount=HITCH_THICKNESS)
    # Position: at front face of frame (X=350), centered in Y, bottom at Z=0
    hitch_front = Pos(350, 0, 0) * Rot(Y=90) * hitch_front  # extrude along X
    # Rear hitch: at X=-350
    hitch_rear = extrude(Rectangle(HITCH_WIDTH, HITCH_HEIGHT), amount=HITCH_THICKNESS)
    hitch_rear = Pos(-350 - HITCH_THICKNESS, 0, 0) * Rot(Y=90) * hitch_rear  # extrude backward

    # --- 6. Side-tipping lever mechanism (on one side, say +Y side) ---
    # Lever: vertical arm and horizontal arm
    # Vertical arm: at X=0, Y=FRAME_WIDTH/2 + some offset, Z from frame top to lever height
    lever_vertical = extrude(Rectangle(LEVER_THICKNESS, LEVER_THICKNESS), amount=LEVER_HEIGHT)
    lever_vertical = Pos(0, FRAME_WIDTH/2 + 20, FRAME_HEIGHT) * lever_vertical  # base at frame top
    # Horizontal arm: extends outward in Y
    lever_horizontal = extrude(Rectangle(LEVER_THICKNESS, LEVER_ARM_LENGTH), amount=LEVER_THICKNESS)
    lever_horizontal = Pos(0, FRAME_WIDTH/2 + 20, FRAME_HEIGHT + LEVER_HEIGHT) * Rot(X=90) * lever_horizontal
    lever = lever_vertical + lever_horizontal

    # --- 7. Wheels and axles ---
    # Front axle assembly: axle cylinder + two wheels
    axle = extrude(Circle(AXLE_RADIUS), amount=AXLE_LENGTH)
    axle = Pos(0, 0, 0) * Rot(X=90) * axle  # along Y
    # Position axle at front: X=340, Y=0, Z=FRAME_HEIGHT/2 (center of frame)
    axle_front = Pos(340, 0, FRAME_HEIGHT/2) * axle
    # Rear axle
    axle_rear = Pos(-340, 0, FRAME_HEIGHT/2) * axle

    # Wheels: each wheel is a cylinder (tread) + flange (larger cylinder)
    wheel_tread = extrude(Circle(WHEEL_RADIUS), amount=WHEEL_WIDTH)
    wheel_flange = extrude(Circle(FLANGE_RADIUS), amount=FLANGE_HEIGHT)
    wheel = wheel_tread + Pos(0, 0, WHEEL_WIDTH) * wheel_flange  # flange on outer side
    # Position wheels at ends of axles
    # Front axle: Y from -200 to 200, wheels at Y=-200 and Y=200
    # But axle length is 400, so ends at Y=-200 and Y=200
    wheel_front_left = Pos(340, -200, FRAME_HEIGHT/2) * Rot(X=90) * wheel
    wheel_front_right = Pos(340, 200, FRAME_HEIGHT/2) * Rot(X=90) * wheel
    wheel_rear_left = Pos(-340, -200, FRAME_HEIGHT/2) * Rot(X=90) * wheel
    wheel_rear_right = Pos(-340, 200, FRAME_HEIGHT/2) * Rot(X=90) * wheel

    # --- 8. Union all parts ---
    # Start with frame
    result = frame
    # Add hopper
    result = result + hopper
    # Add rivets
    if rivets is not None:
        result = result + rivets
    # Add hitches
    result = result + hitch_front
    result = result + hitch_rear
    # Add lever
    result = result + lever
    # Add axles
    result = result + axle_front
    result = result + axle_rear
    # Add wheels
    result = result + wheel_front_left
    result = result + wheel_front_right
    result = result + wheel_rear_left
    result = result + wheel_rear_right

    # --- 9. Chamfer and fillet ---
    # Chamfer frame edges (top and bottom edges)
    result = _safe_chamfer(result, lambda s: [e for e in s.edges().filter_by(Plane.XY) if e.length() > 30], FRAME_CHAMFER, 'chamfer-frame')
    # Fillet hopper edges (vertical edges)
    result = _safe_fillet(result, lambda s: [e for e in s.edges().filter_by(Axis.Z) if e.length() > 5], FILLET_RADIUS, 'fillet-hopper')

    _measure_feature(result, 'overall', 'final_assembly')

    # Write missed-cut warnings
    if _MISSED_CUTS:
        import os as _os
        _iteration = int(_os.environ.get('ITERATION', '0'))
        with open(f'temp_missed_{_iteration}.json', 'w') as _f:
            json.dump(_MISSED_CUTS, _f)

    export_step(result, "temp_output_autonomous_0.step")
    export_stl(result, "temp_output_autonomous_0.stl", tolerance=0.01, angular_tolerance=0.1)
    _save_measurements()
    return {"shape": result}

if __name__ == "__main__":
    import sys as _sys, json as _json
    print("gen_step() starting ...", file=_sys.stderr)
    _result = gen_step()
    print(f"gen_step() returned: {type(_result).__name__}", file=_sys.stderr)
