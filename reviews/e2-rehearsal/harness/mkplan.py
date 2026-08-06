#!/usr/bin/env python3
"""The rider's plan generator for the ER-02 card.

The plan it writes is the SAME plan for every arm — one gate answer that arms the
Prospector as a panner, one rotation answer per wave (the only sustainable economy
the language can express), and build answers triggered on AFFORDABILITY rather than
on a projected wave (the price trap, F-R2-4, cost this rehearsal two runs before the
trigger was moved onto gold).
"""
import json, sys

ANCHORS = {
    'e2-trestle': {1: (-24, -20), 2: (24, -20), 3: (-24, 20), 4: (24, 20)},
    'e2-incline': {1: (-30, -20), 2: (30, -20), 3: (-30, 26), 4: (30, 26), 5: (-22, 40), 6: (22, 40)},
}
# Cells inside a turret's 16 wu of the contract's rail line, on declared build-zone bank.
CELLS = {
    'e2-trestle': [(8, -9), (8, -16), (14, -10), (8, -22)],
    'e2-incline': [(-6, -12), (-6, -20), (-16, -12), (-18, -20)],
}
SEAM = {'e2-trestle': 'gold-seam-2', 'e2-incline': 'gold-seam-1'}
TURRET_LADDER = [50, 70, 95, 125]


def hold(contract, k):
    x, z = ANCHORS[contract][k]
    return {"verb": "HOLD", "pos": {"x": x, "z": z}}


LADDER = [('palisade', 10), ('sentry_beacon', 25), ('turret', 50), ('turret', 70), ('turret', 95), ('turret', 125)]


def plan(contract, waves=12, builds=True):
    keys = list(ANCHORS[contract])
    answers = [{
        "at": {"turn": 0},
        "orders": [{"verb": "HARVEST", "seam": SEAM[contract]}, hold(contract, keys[0])],
        "note": f"arm the panner, earn at anchor{keys[0]}",
    }]
    # BUILD answers first: an affordability trigger must outrank the standing rotation,
    # or the rotation consumes every turn and the purse simply climbs to its 200 cap.
    if builds:
        cells = CELLS[contract]
        for i, (what, price) in enumerate(LADDER):
            cell = cells[i % len(cells)]
            cell = (cell[0] + (2 if i >= len(cells) else 0), cell[1])
            k = keys[(i * 2 + 1) % len(keys)]
            answers.append({
                "at": {"gold": price},
                "orders": [
                    {"verb": "MOVE_TO", "pos": {"x": cell[0], "z": cell[1]}},
                    {"verb": "BUILD", "what": what, "where": {"x": cell[0], "z": cell[1]}, "when": {"waveGte": 0}},
                    {"verb": "REPAIR_UNDER", "pct": 60},
                    hold(contract, k),
                ],
                "note": f"{what} #{i + 1} at {cell} (afforded {price}), then earn at anchor{k}",
            })
    for w in range(2, waves + 3):
        k = keys[(w - 1) % len(keys)]
        answers.append({"at": {"wave": w}, "orders": [hold(contract, k)], "note": f"rotate to anchor{k}"})
    return {"label": f"{contract}-card", "carry": "remainder-noretry", "answers": answers}


if __name__ == '__main__':
    contract = sys.argv[1]
    out = sys.argv[2]
    builds = '--nobuild' not in sys.argv
    json.dump(plan(contract, builds=builds), open(out, 'w'), indent=1)
