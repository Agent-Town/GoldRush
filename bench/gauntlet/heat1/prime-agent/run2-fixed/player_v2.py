"""
Gold Rush Player - v2
Strategy: Harvest gold, build palisades + turrets, survive to wave 10.
"""
import json, sys, os, subprocess

PALISADE_COST = 10
SLUICE_COST = 40
TURRET_COST = 50
BEACON_COST = 25
STOCKPILE_COST = 60
CLAIM = {"x": 0, "z": 12}

def dist(a, b):
    return ((a["x"] - b["x"])**2 + (a["z"] - b["z"])**2)**0.5

def make_orders(view, history):
    now = view["now"]
    hero = now["hero"]
    gold = now["gold"]
    wave = now["wave"]
    works = now["works"]

    hero_pos = {"x": hero["x"], "z": hero["z"]}

    # Build seam pos lookup from stablePrefix.map.seams
    seam_positions = {}
    for s in view["stablePrefix"]["map"]["seams"]:
        seam_positions[s["id"]] = {"x": s["x"], "z": s["z"]}

    # Find closest active seam with position
    best_seam = None
    best_dist = float("inf")
    for s in now["seams"]:
        if s["active"] and s["remaining"] > 0:
            pos = seam_positions.get(s["id"])
            if pos:
                d = dist(hero_pos, pos)
                if d < best_dist:
                    best_dist = d
                    best_seam = {"id": s["id"], "pos": pos}

    orders = []

    # PHASE 1: Early waves - harvest and build palisades
    if wave <= 3:
        # Harvest from seam first (we need gold!)
        if best_seam and gold < 30:
            if dist(hero_pos, best_seam["pos"]) > 1.5:
                orders.append({"verb": "MOVE_TO", "pos": best_seam["pos"]})
            orders.append({"verb": "HARVEST", "seam": best_seam["id"]})

        # Build palisades if we have gold
        if gold >= PALISADE_COST:
            # Build palisade ring around claim
            pal_positions = [
                {"x": 0, "z": 8},
                {"x": 0, "z": 16},
                {"x": -3, "z": 12},
                {"x": 3, "z": 12},
            ]
            for pos in pal_positions:
                orders.append({
                    "verb": "BUILD",
                    "what": "palisade",
                    "where": pos,
                    "when": {"goldGte": PALISADE_COST}
                })

        # Hold position
        orders.append({"verb": "HOLD", "pos": hero_pos})

    # PHASE 2: Mid waves
    elif wave <= 7:
        # Build turrets for firepower
        if gold >= TURRET_COST:
            turret_positions = [
                {"x": -4, "z": 6},
                {"x": 4, "z": 6},
                {"x": -5, "z": 18},
                {"x": 5, "z": 18},
            ]
            for i, pos in enumerate(turret_positions):
                orders.append({
                    "verb": "BUILD",
                    "what": "turret",
                    "where": pos,
                    "when": {"goldGte": TURRET_COST + i * 20}
                })

        # Build palisade walls
        if gold >= PALISADE_COST:
            for x in [-5, -2, 2, 5]:
                for z in [8, 16]:
                    orders.append({
                        "verb": "BUILD",
                        "what": "palisade",
                        "where": {"x": x, "z": z},
                        "when": {"goldGte": PALISADE_COST}
                    })

        # Harvest
        if best_seam:
            if dist(hero_pos, best_seam["pos"]) > 1.5:
                orders.append({"verb": "MOVE_TO", "pos": best_seam["pos"]})
            orders.append({"verb": "HARVEST", "seam": best_seam["id"]})

        orders.append({"verb": "HOLD", "pos": hero_pos})

    # PHASE 3: Late waves
    else:
        # Repair if needed
        if works["hp"] < works["maxHp"] * 0.5 and works["maxHp"] > 0:
            orders.append({"verb": "REPAIR_UNDER", "pct": 50})

        # More turrets
        if gold >= 50:
            orders.append({
                "verb": "BUILD",
                "what": "turret",
                "where": {"x": 0, "z": 6},
                "when": {"goldGte": 50}
            })

        # Harvest
        if best_seam:
            if dist(hero_pos, best_seam["pos"]) > 1.5:
                orders.append({"verb": "MOVE_TO", "pos": best_seam["pos"]})
            orders.append({"verb": "HARVEST", "seam": best_seam["id"]})

        orders.append({"verb": "HOLD", "pos": hero_pos})

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
                    if orders_sent > 100:
                        print("Too many orders, aborting", file=sys.stderr)
                        break
            else:
                outcome = data
                break
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        proc.kill()
    finally:
        err = proc.stderr.read()
        proc.wait()
    return outcome, views, orders_sent, err

if __name__ == '__main__':
    outcome, views, orders_sent, err = run()
    print(f"Orders sent: {orders_sent}")
    if outcome:
        print(f"Outcome: {json.dumps(outcome, indent=2)}")
    print(f"Stderr: {err[:600]}")
