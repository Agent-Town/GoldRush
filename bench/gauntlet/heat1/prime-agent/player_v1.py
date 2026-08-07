"""
Gold Rush Player - v1
Strategy: Harvest gold, build palisades + turrets, survive to wave 10.
"""
import json, sys, os, subprocess

# Costs
PALISADE_COST = 10
SLUICE_COST = 40
TURRET_COST = 50  # first
STOCKPILE_COST = 60
BEACON_COST = 25  # first

# Seam positions
SEAMS = {
    "gold-seam-1": {"x": -22, "z": -6.8},
    "gold-seam-2": {"x": -9, "z": 6.7},
    "gold-seam-3": {"x": -1.5, "z": -6.4},
    "gold-seam-4": {"x": 7.5, "z": 6.5},
    "gold-seam-5": {"x": 18, "z": -7},
    "gold-seam-6": {"x": 25, "z": 6.9},
}

# Claim position
CLAIM = {"x": 0, "z": 12}

def dist(a, b):
    return ((a["x"] - b["x"])**2 + (a["z"] - b["z"])**2)**0.5

def closest_active_seam(view):
    """Find the closest active seam to the hero."""
    hero = view["now"]["hero"]
    hero_pos = {"x": hero["x"], "z": hero["z"]}
    best = None
    best_dist = float("inf")
    for seam in view["now"]["seams"]:
        if seam["active"] and seam["remaining"] > 0:
            d = dist(hero_pos, {"x": seam["x"], "z": seam["z"]})
            if d < best_dist:
                best_dist = d
                best = seam
    return best

def make_orders(view, history):
    """Decide orders based on the current view."""
    now = view["now"]
    hero = now["hero"]
    gold = now["gold"]
    wave = now["wave"]
    hp = hero["hp"]
    works = now["works"]
    threats = now["threats"]

    hero_pos = {"x": hero["x"], "z": hero["z"]}

    orders = []

    # Check if we have accepted orders already - only send new ones when needed
    existing_orders = now.get("orders", [])

    # If we have existing pending orders, don't resend unless they're done
    if existing_orders:
        active_pending = [o for o in existing_orders if o.get("status") in ("pending", "active")]
        if active_pending:
            return None  # Keep existing orders

    # Strategy decisions:

    # PHASE 1: Early waves (0-3) - harvest gold, build basic defenses
    if wave <= 3:
        # If we have gold, build palisades for defense
        if gold >= PALISADE_COST:
            # Build palisades around the claim
            # Place at the claim perimeter
            pal_positions = [
                {"x": 0, "z": 8},   # south of claim
                {"x": 0, "z": 16},  # north of claim
                {"x": -3, "z": 12}, # west of claim
                {"x": 3, "z": 12},  # east of claim
            ]
            # Find which palisades we already have built
            # We don't have a built list, so let's build based on wave
            build_idx = min(wave, len(pal_positions) - 1)
            pos = pal_positions[build_idx]
            orders.append({
                "verb": "BUILD",
                "what": "palisade",
                "where": pos,
                "when": {"goldGte": PALISADE_COST}
            })

        # Harvest from closest active seam
        seam = closest_active_seam(view)
        if seam and gold < 30:
            # Move to seam and harvest
            seam_pos = {"x": seam["x"], "z": seam["z"]}
            if dist(hero_pos, seam_pos) > 2:
                orders.append({"verb": "MOVE_TO", "pos": seam_pos})
            orders.append({"verb": "HARVEST", "seam": seam["id"]})

        # Hold position
        orders.append({"verb": "HOLD", "pos": hero_pos})

    # PHASE 2: Mid waves (4-7) - stronger defenses
    elif wave <= 7:
        # Build turrets 
        if gold >= TURRET_COST:
            turret_positions = [
                {"x": -4, "z": 6},
                {"x": 4, "z": 6},
                {"x": -4, "z": 18},
                {"x": 4, "z": 18},
            ]
            # Check which turret to build
            for pos in turret_positions:
                orders.append({
                    "verb": "BUILD",
                    "what": "turret",
                    "where": pos,
                    "when": {"goldGte": TURRET_COST}
                })

        # Build more palisades
        if gold >= PALISADE_COST:
            for x in [-5, 5]:
                for z in [8, 16]:
                    orders.append({
                        "verb": "BUILD",
                        "what": "palisade",
                        "where": {"x": x, "z": z},
                        "when": {"goldGte": PALISADE_COST}
                    })

        # Harvest
        seam = closest_active_seam(view)
        if seam:
            seam_pos = {"x": seam["x"], "z": seam["z"]}
            if dist(hero_pos, seam_pos) > 2:
                orders.append({"verb": "MOVE_TO", "pos": seam_pos})
            orders.append({"verb": "HARVEST", "seam": seam["id"]})

        # Hold
        orders.append({"verb": "HOLD", "pos": hero_pos})

    # PHASE 3: Late waves (8-10) - hold and repair
    else:
        # Repair if needed
        if works["hp"] < works["maxHp"] * 0.5:
            orders.append({"verb": "REPAIR_UNDER", "pct": 50})

        # Build more turrets
        if gold >= TURRET_COST:
            orders.append({
                "verb": "BUILD",
                "what": "turret",
                "where": {"x": 0, "z": 6},
                "when": {"goldGte": TURRET_COST}
            })

        # Harvest
        seam = closest_active_seam(view)
        if seam:
            seam_pos = {"x": seam["x"], "z": seam["z"]}
            if dist(hero_pos, seam_pos) > 2:
                orders.append({"verb": "MOVE_TO", "pos": seam_pos})
            orders.append({"verb": "HARVEST", "seam": seam["id"]})

        # Hold
        orders.append({"verb": "HOLD", "pos": hero_pos})

    # Cap at 32 orders as per grammar
    return orders[:32]


def run(seed='e1-the-claim-02', contract='the-claim'):
    proc = subprocess.Popen(
        ['node', 'scripts/gr-sim.mjs', '--contract', contract, '--seed', seed],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, cwd=os.getcwd()
    )
    views = []
    orders_sent = 0
    outcome = None
    try:
        while True:
            line = proc.stdout.readline()
            if not line:
                break
            line = line.strip()
            if not line:
                continue
            data = json.loads(line)
            if data.get('schema') == 'goldrush.view.v1':
                views.append(data)
                orders = make_orders(data, views)
                if orders is not None:
                    proc.stdin.write(json.dumps(orders) + '\n')
                    proc.stdin.flush()
                    orders_sent += 1
            else:
                outcome = data
                break
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        proc.kill()
    finally:
        err = proc.stderr.read()
        proc.wait()
    return outcome, views, orders_sent, err

if __name__ == '__main__':
    outcome, views, orders_sent, err = run()
    print(f"Orders sent: {orders_sent}")
    print(f"Outcome: {json.dumps(outcome, indent=2)}")
    print(f"Stderr: {err[:500]}")
