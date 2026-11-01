"""Turn a small final step into a short list of recognisable cases.

states: dict key->state (all states that can appear at this step)
actions: list of (label, alg) the guide teaches (alg may include whole-puzzle rotations first)
feature(state) -> hashable description a person can see (e.g. which pieces are wrong)
Finds, for every feature class, one action that brings *every* state in that class closer to solved
(by BFS distance using the same actions), so "look, do this, look again" always finishes.
"""
from collections import deque


def synthesize(puz, states, actions, key, feature, is_solved):
    # BFS distances from solved using actions in reverse is awkward; do forward BFS over the state set
    idx = {key(s): s for s in states}
    dist = {}
    # multi-source: distance 0 = solved states
    q = deque()
    for k, s in idx.items():
        if is_solved(s):
            dist[k] = 0
    # iterate relaxation until stable (state sets are small)
    changed = True
    while changed:
        changed = False
        for k, s in idx.items():
            best = dist.get(k)
            for lab, alg in actions:
                k2 = key(puz.apply(s, alg))
                if k2 in dist and (best is None or dist[k2] + 1 < best):
                    best = dist[k2] + 1
            if best is not None and dist.get(k) != best:
                dist[k] = best
                changed = True
    unreached = [k for k in idx if k not in dist]
    classes = {}
    for k, s in idx.items():
        if dist.get(k, 0) == 0:
            continue
        classes.setdefault(feature(s), []).append(s)
    rules = {}
    for f, ss in classes.items():
        for lab, alg in actions:
            if all(key(puz.apply(s, alg)) in dist and dist[key(puz.apply(s, alg))] < dist[key(s)] for s in ss):
                rules[f] = lab
                break
        else:
            rules[f] = None
    return rules, dist, unreached
