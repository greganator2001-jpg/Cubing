"""Square-1 simulator. Both layers indexed in 30-degree units, clockwise as seen from ABOVE,
unit 0 starting at the front slice line. (a,b): top a units clockwise seen from above, bottom b units
clockwise seen from below (WCA convention). '/' flips the right half (units 0-5) of both layers."""
import re

EDGE, CORNER = 'e', 'c'


def solved():
    top, bot = [], []
    # pattern: edge, corner(2) repeated; pieces named by layer+index
    for layer, L in (('U', top), ('D', bot)):
        k = 0
        for q in range(4):
            L.append((layer + 'c%d' % q, 0)); L.append((layer + 'c%d' % q, 1))
            L.append((layer + 'e%d' % q, 0))
    return (tuple(top), tuple(bot), 0)


def twist(st, a, b):
    top, bot, mid = st
    t = [None] * 12; d = [None] * 12
    for i in range(12):
        t[(i + a) % 12] = top[i]
        d[(i - b) % 12] = bot[i]
    return (tuple(t), tuple(d), mid)


def cut_ok(L):
    # a corner may not straddle unit 11|0 or 5|6
    return not (L[11][0] == L[0][0] or L[5][0] == L[6][0])


def slash(st):
    top, bot, mid = st
    if not (cut_ok(top) and cut_ok(bot)):
        return None
    t = list(top); d = list(bot)
    for i in range(6):
        t[i] = bot[5 - i]
        d[i] = top[5 - i]
    return (tuple(t), tuple(d), mid ^ 1)


def apply(st, alg):
    for tok in re.findall(r'\(\s*-?\d+\s*,\s*-?\d+\s*\)|/', alg):
        if tok == '/':
            st = slash(st)
            if st is None:
                raise ValueError('cannot slice here')
        else:
            a, b = map(int, re.findall(r'-?\d+', tok))
            st = twist(st, a, b)
    return st


def is_cube(st):
    top, bot, _ = st
    def shape(L):
        return ''.join('e' if L[i][0][1] == 'e' else 'c' for i in range(12))
    return all(shape(L) in ('ecc' * 4, 'cce' * 4, 'cec' * 4) for L in (top, bot))


def pieces(L):
    out = []
    for i in range(12):
        if L[i][1] == 0:
            out.append((i, L[i][0]))
    return out
