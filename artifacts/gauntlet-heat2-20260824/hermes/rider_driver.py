#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path


def pos_ring(claim):
    x, z = claim["x"], claim["z"]
    return [
        (x, z - 5), (x - 5, z), (x + 5, z), (x, z + 5),
        (x - 4, z - 4), (x + 4, z - 4), (x - 4, z + 4), (x + 4, z + 4),
        (x, z - 8), (x - 8, z), (x + 8, z), (x, z + 8),
    ]


def choose_build(contract, mechanics, now, claim):
    available = {b["id"]: b for b in mechanics.get("buildables", [])}
    counts = now.get("works", {}).get("byKind", {})
    standing = [e for e in now.get("works", {}).get("entries", []) if not e.get("wrecked")]
    occupied = [(e.get("position", {}).get("x"), e.get("position", {}).get("z")) for e in now.get("works", {}).get("entries", [])]

    if contract == "the-claim":
        plan = ["palisade", "palisade", "sentry_beacon", "palisade", "palisade", "turret", "sentry_beacon", "palisade", "turret", "palisade"]
    elif contract == "e1-night-shift":
        palisades = int(counts.get("palisade", 0))
        beacons = int(counts.get("sentry_beacon", 0))
        turrets = int(counts.get("turret", 0))
        if now.get("gold", 0) >= 50 and turrets < 2:
            wanted = "turret"
        elif palisades < 4:
            wanted = "palisade"
        elif beacons < 1:
            wanted = "sentry_beacon"
        else:
            wanted = "palisade"
        plan = [wanted]
    else:
        palisades = int(counts.get("palisade", 0))
        beacons = int(counts.get("sentry_beacon", 0))
        turrets = int(counts.get("turret", 0))
        if palisades < 4:
            wanted = "palisade"
        elif now.get("gold", 0) >= 50 and turrets < 3:
            wanted = "turret"
        elif beacons < 1:
            wanted = "sentry_beacon"
        else:
            wanted = "palisade"
        plan = [wanted]

    built_total = len(standing)
    wanted = plan[min(built_total, len(plan) - 1)]
    if wanted not in available:
        for fallback in ("turret", "sentry_beacon", "palisade", "boiler_house", "lantern_post"):
            if fallback in available:
                wanted = fallback
                break
        else:
            return None

    b = available[wanted]
    count = int(counts.get(wanted, 0)) if isinstance(counts, dict) else 0
    costs = b.get("costs", [b.get("cost", 0)])
    cost = costs[min(count, len(costs) - 1)]

    active_seams = [s for s in now.get("seams", []) if s.get("active")]
    projected = now.get("gold", 0) + 5 * len(active_seams)
    if projected < cost:
        return None

    if contract == "e2-hill-mine":
        x, z = claim["x"], claim["z"]
        ring = [(x, z + 4), (x - 4, z + 4), (x + 4, z + 4), (x, z + 8), (x - 6, z + 7), (x + 6, z + 7)]
    else:
        ring = pos_ring(claim)
    for px, pz in ring:
        if all(ox is None or (px - ox) ** 2 + (pz - oz) ** 2 >= 9 for ox, oz in occupied):
            return wanted, cost, {"x": px, "z": pz}
    return None


def orders_for(view):
    stable = view["stablePrefix"]
    now = view["now"]
    contract = stable["contract"]["id"]
    mechanics = stable["mechanics"]
    claim = stable["map"]["claim"]

    if now.get("pendingSecure"):
        return [{"verb": "SECURE_CHOICE", "choice": "bank"}]
    if now.get("pendingOffer"):
        offer = now["pendingOffer"]
        preferred = offer[0]
        for choice in offer:
            text = (choice.get("name", "") + " " + choice.get("effectText", "")).lower()
            if any(k in text for k in ("max hp", "heals", "health", "repair")):
                preferred = choice
                break
        else:
            for choice in offer:
                text = (choice.get("name", "") + " " + choice.get("effectText", "")).lower()
                if any(k in text for k in ("damage", "fire rate", "spark", "blast", "range")):
                    preferred = choice
                    break
        return [{"verb": "PICK_UPGRADE", "id": preferred["id"]}]

    orders = [{"verb": "SET_WEAPON", "weapon": "blast" if contract == "e2-hill-mine" else "rig"}]
    if now.get("threats", {}).get("alive", 0) and now.get("blastReadyInMs") == 0:
        hero = now.get("hero", {})
        tx, tz = hero.get("x", claim["x"]), hero.get("z", claim["z"])
        edge = now.get("threats", {}).get("edge")
        if edge == "north":
            tz += 8
        elif edge == "south":
            tz -= 8
        elif edge == "east":
            tx += 8
        elif edge == "west":
            tx -= 8
        orders.append({"verb": "BLAST_AT", "pos": {"x": tx, "z": tz}})
    if now.get("needsRider") and now.get("threats", {}).get("alive", 0):
        orders.append({"verb": "HOLD", "pos": claim})
        return orders
    active_seams = [s for s in now.get("seams", []) if s.get("active")]
    active_seams.sort(key=lambda s: (s.get("x", claim["x"]) - now.get("prospector", {}).get("x", claim["x"])) ** 2 + (s.get("z", claim["z"]) - now.get("prospector", {}).get("z", claim["z"])) ** 2)
    for seam in active_seams:
        orders.append({"verb": "HARVEST", "seam": seam["id"]})

    build = choose_build(contract, mechanics, now, claim)
    orders.append({"verb": "MOVE_TO", "pos": claim})
    if build:
        what, cost, where = build
        orders.append({"verb": "BUILD", "what": what, "where": where, "when": {"goldGte": cost}})
    orders.append({"verb": "REPAIR_UNDER", "pct": 75})
    orders.append({"verb": "HOLD", "pos": claim})
    return orders[:32]


def summary(view):
    now = view["now"]
    return {
        "wave": now.get("wave"),
        "gold": now.get("gold"),
        "heroHp": now.get("hero", {}).get("hp"),
        "prospector": now.get("prospector"),
        "works": now.get("works"),
        "threats": now.get("threats"),
        "seams": now.get("seams"),
        "offer": now.get("pendingOffer"),
        "secure": now.get("pendingSecure"),
        "needsRider": now.get("needsRider"),
        "lastLog": view.get("appendLog", [])[-1:] if view.get("appendLog") else [],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--contract", required=True)
    ap.add_argument("--seed", required=True)
    ap.add_argument("--tape", required=True)
    ap.add_argument("--transcript", required=True)
    args = ap.parse_args()
    cmd = ["node", "scripts/gr-sim.mjs", "--contract", args.contract, "--seed", args.seed, "--tape", args.tape]
    start = time.monotonic()
    with Path(args.transcript).open("w") as log:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        outcome = None
        assert proc.stdout and proc.stdin
        for line in proc.stdout:
            log.write("VIEW " + line)
            log.flush()
            obj = json.loads(line)
            if obj.get("schema") != "goldrush.view.v1":
                outcome = obj
                print(json.dumps({"outcome": obj, "wallSeconds": round(time.monotonic() - start, 3)}), flush=True)
                break
            print(json.dumps(summary(obj), separators=(",", ":")), flush=True)
            orders = orders_for(obj)
            log.write("ORDERS " + json.dumps(orders, separators=(",", ":")) + "\n")
            log.flush()
            proc.stdin.write(json.dumps(orders, separators=(",", ":")) + "\n")
            proc.stdin.flush()
        stderr = proc.stderr.read() if proc.stderr else ""
        code = proc.wait()
        log.write("STDERR\n" + stderr)
        log.write(f"\nEXIT {code}\nWALL {time.monotonic() - start:.3f}\n")
        if code != 0 or outcome is None:
            print(json.dumps({"exit": code, "stderr": stderr[-2000:], "wallSeconds": round(time.monotonic() - start, 3)}), flush=True)
            sys.exit(code or 2)


if __name__ == "__main__":
    main()
