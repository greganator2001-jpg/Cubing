"""Generic facelet simulator used to check the algorithms written in the Learn guides.

A puzzle is a list of facelet points (with a colour label each) and a set of named moves.
Each move rotates every facelet on one side of a cut plane around an axis; the rotated
points are matched back to facelet slots to get a permutation. State = colour per slot.
"""
import math
import itertools
import numpy as np


def rot_matrix(axis, ang):
    a = np.asarray(axis, float)
    a = a / np.linalg.norm(a)
    x, y, z = a
    c, s = math.cos(ang), math.sin(ang)
    C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s],
                     [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
                     [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])


class Puzzle:
    def __init__(self, points, colors, normals=None):
        self.P = np.asarray(points, float)
        self.colors = list(colors)
        self.N = None if normals is None else np.asarray(normals, float)
        self.moves = {}
        self.n = len(self.P)

    def _match(self, Q):
        perm = []
        for q in Q:
            d = np.linalg.norm(self.P - q, axis=1)
            j = int(np.argmin(d))
            if d[j] > 1e-4:
                raise ValueError('rotation does not map facelets onto facelets (min dist %.4f)' % d[j])
            perm.append(j)
        if len(set(perm)) != len(perm):
            raise ValueError('not a permutation')
        return perm

    def add_move(self, name, axis, ang, select):
        """select: bool mask of moving facelets. Clockwise when looking at the axis tip = negative angle."""
        R = rot_matrix(axis, ang)
        Q = self.P.copy()
        Q[select] = (R @ self.P[select].T).T
        perm = self._match(Q)  # facelet i moves to slot perm[i]
        p = np.empty(self.n, int)
        p[np.array(perm)] = np.arange(self.n)  # new_state[j] = old_state[p[j]]
        self.moves[name] = p
        # inverse and doubles
        inv = np.empty(self.n, int)
        inv[p] = np.arange(self.n)
        self.moves[name + "'"] = inv
        self.moves[name + '2'] = p[p]
        self.moves[name + "2'"] = inv[inv]

    def solved(self):
        return np.arange(self.n)  # state holds original slot ids; colours looked up later

    def apply(self, state, alg):
        for m in parse(alg):
            state = state[self.moves[m]]
        return state

    def col(self, state):
        return [self.colors[i] for i in state]

    def is_solved_colors(self, state, faces):
        """faces: list of slot-index groups that must each be one colour"""
        c = self.col(state)
        return all(len({c[i] for i in g}) == 1 for g in faces)

    def moved(self, state):
        return [i for i in range(self.n) if state[i] != i]


def parse(alg):
    out = []
    for tok in alg.replace('(', ' ').replace(')', ' ').split():
        if tok.endswith('++') or tok.endswith('--'):
            out.append(tok)
            continue
        out.append(tok)
    return out


def power(p, k):
    q = np.arange(len(p))
    for _ in range(k):
        q = q[p]
    return q


def order(puz, alg):
    st = puz.apply(puz.solved(), alg)
    p = st.copy()
    k = 1
    while not np.array_equal(p, np.arange(puz.n)):
        p = p[st]
        k += 1
        if k > 5000:
            return None
    return k


def search(puz, gens, goal, maxlen, start=None, avoid_same=True):
    """Iterative deepening: find shortest sequence of generator names whose result satisfies goal(state)."""
    start = puz.solved() if start is None else start
    base = {g: puz.moves[g] for g in gens}
    face = {g: g.rstrip("'2") for g in gens}
    res = []

    def dfs(state, depth, path):
        if depth == 0:
            if goal(state):
                res.append(' '.join(path))
                return True
            return False
        for g in gens:
            if path and avoid_same and face[g] == face[path[-1]]:
                continue
            if dfs(state[base[g]], depth - 1, path + [g]):
                return True
        return False

    for L in range(1, maxlen + 1):
        if dfs(start, L, []):
            return res[0]
    return None


def bidir(puz, gens, target, depth):
    """Meet-in-the-middle: shortest alg turning solved into `target` (array). Returns alg string or None."""
    inv = {g: (g[:-1] if g.endswith("'") else g + "'") for g in gens}
    start = puz.solved()
    fw = {start.tobytes(): ''}
    frontier = [(start, '')]
    for _ in range(depth):
        nf = []
        for st, path in frontier:
            for g in gens:
                s2 = st[puz.moves[g]]
                k = s2.tobytes()
                if k not in fw:
                    fw[k] = (path + ' ' + g).strip()
                    nf.append((s2, fw[k]))
        frontier = nf
    # backward from target: apply inverse moves on the right: target = start*alg  => search  t*g^-1
    bw = {np.asarray(target).tobytes(): ''}
    frontier = [(np.asarray(target), '')]
    best = None
    for d in range(depth + 1):
        for st, path in frontier:
            k = st.tobytes()
            if k in fw:
                cand = (fw[k] + ' ' + path).strip()
                if best is None or len(cand.split()) < len(best.split()):
                    best = cand
        if best:
            return best
        nf = []
        for st, path in frontier:
            for g in gens:
                s2 = st[puz.moves[inv[g]]]
                k = s2.tobytes()
                if k not in bw:
                    bw[k] = (g + ' ' + path).strip()
                    nf.append((s2, bw[k]))
        frontier = nf
    return best
