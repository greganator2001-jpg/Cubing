import math
import itertools
import numpy as np
from core import Puzzle, rot_matrix

CW = -2 * math.pi  # clockwise (looking at the axis tip from outside) = negative angle
FACES = {'U': (0, 1, 0), 'D': (0, -1, 0), 'R': (1, 0, 0), 'L': (-1, 0, 0), 'F': (0, 0, 1), 'B': (0, 0, -1)}


def face_of(n):
    for k, v in FACES.items():
        if np.allclose(n, v):
            return k


def cube_face_frames():
    for k, n in FACES.items():
        n = np.array(n, float)
        corners = [np.array(c, float) for c in itertools.product([-1, 1], repeat=3) if np.dot(c, n) == 1]
        yield k, n, corners


def corner_axes():
    return {
        # WCA-style corner names (U/D first, then F/B, then R/L)
        'UFR': (1, 1, 1), 'UFL': (-1, 1, 1), 'UBR': (1, 1, -1), 'UBL': (-1, 1, -1),
        'DFR': (1, -1, 1), 'DFL': (-1, -1, 1), 'DBR': (1, -1, -1), 'DBL': (-1, -1, -1)}


def corner_turner(kind, names):
    """Skewb ('skewb'), Dino ('dino'), Redi ('redi'), Ivy ('ivy') on the cube [-1,1]^3."""
    pts, cols, tags = [], [], []
    for k, n, corners in cube_face_frames():
        c = n.copy()
        edges = [(a, b) for a, b in itertools.combinations(corners, 2) if np.sum(np.abs(a - b)) == 2]
        if kind == 'skewb':
            pts.append(c); cols.append(k); tags.append(('center', k))
            for V in corners:
                ms = [(V + W) / 2 for W in corners if np.sum(np.abs(V - W)) == 2]
                pts.append((V + ms[0] + ms[1]) / 3); cols.append(k); tags.append(('corner', tuple(V), k))
        elif kind == 'dino':
            for a, b in edges:
                pts.append((c + a + b) / 3); cols.append(k); tags.append(('edge', tuple((a + b) / 2), k))
        elif kind == 'redi':
            for V in corners:
                pts.append(c + .8 * (V - c)); cols.append(k); tags.append(('corner', tuple(V), k))
            for a, b in edges:
                m = (a + b) / 2
                pts.append(c + .8 * (m - c)); cols.append(k); tags.append(('edge', tuple(m), k))
        elif kind == 'ivy':
            pts.append(c); cols.append(k); tags.append(('petal', k))
            for V in corners:
                if np.prod(V) > 0:  # the four ivy corners (1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1)
                    pts.append(c + .6 * (V - c)); cols.append(k); tags.append(('corner', tuple(V), k))
    P = Puzzle(pts, cols)
    P.tags = tags
    ax = corner_axes()
    for name, cname in names.items():
        a = np.array(ax[cname], float)
        ah = a / np.linalg.norm(a)
        d = P.P @ ah
        if kind == 'skewb':
            cut = 0.0
        elif kind == 'ivy':
            cut = 0.3
        else:  # dino / redi: only pieces touching that corner
            vals = sorted(set(np.round(d, 4)), reverse=True)
            # find the biggest gap below the top group of values that contains the corner's edges
            cut = _gap_cut(d, want=6 if kind == 'dino' else 9)
        P.add_move(name, a, CW / 3, d > cut)
    return P


def _gap_cut(d, want):
    s = np.sort(d)[::-1]
    return (s[want - 1] + s[want]) / 2


def pyraminx(n=3):
    s3 = math.sqrt(3)
    V = {'U': np.array([0, 1, 0.]), }
    # regular tetrahedron with U on top, front face facing +z
    U = np.array([0, 3, 0.]) / 3
    ang = [math.radians(a) for a in (90 + 120, 90 + 240, 90)]  # L (front-left), R (front-right), B (back)
    h = -1 / 3
    r = math.sqrt(8) / 3
    L = np.array([r * math.cos(ang[0]), h, r * math.sin(ang[0])])
    R = np.array([r * math.cos(ang[1]), h, r * math.sin(ang[1])])
    B = np.array([r * math.cos(ang[2]), h, r * math.sin(ang[2])])
    # make L front-left, R front-right, B back: rotate so B is at -z
    verts = {'U': U, 'L': L, 'R': R, 'B': B}
    # rotate around y so that B has x=0, z<0
    th = math.atan2(B[0], -B[2])
    Ry = rot_matrix((0, 1, 0), th)
    verts = {k: Ry @ v for k, v in verts.items()}
    if verts['L'][0] > verts['R'][0]:
        verts['L'], verts['R'] = verts['R'], verts['L']
    faces = {'F': ('U', 'L', 'R'), 'Lf': ('U', 'B', 'L'), 'Rf': ('U', 'R', 'B'), 'D': ('L', 'B', 'R')}
    pts, cols, tags = [], [], []
    for fk, (a, b, c) in faces.items():
        A, Bv, C = verts[a], verts[b], verts[c]
        for i in range(n):
            for j in range(i + 1):
                p = lambda ii, jj: A + (Bv - A) * ii / n + (C - Bv) * jj / n
                tri = [p(i, j), p(i + 1, j), p(i + 1, j + 1)]
                pts.append(sum(tri) / 3); cols.append(fk); tags.append((fk, i, j, 'up'))
                if j < i:
                    tri = [p(i, j), p(i, j + 1), p(i + 1, j + 1)]
                    pts.append(sum(tri) / 3); cols.append(fk); tags.append((fk, i, j, 'down'))
    P = Puzzle(pts, cols)
    P.tags = tags
    P.verts = verts
    for k, v in verts.items():
        ah = v / np.linalg.norm(v)
        d = P.P @ ah
        top, bot = 1.0, -1 / 3  # vertex distance 1, opposite face at -1/3
        step = (top - bot) / n
        for depth in range(1, n):
            cut = top - depth * step
            name = {1: k.lower(), 2: k}.get(depth, '%d%s' % (depth, k)) if n == 3 else {1: k.lower(), 2: k, 3: '3' + k}.get(depth)
            if n == 4:
                name = {1: k.lower(), 2: k, 3: k + 'w'}[depth]  # tip, tip+axial... see guide
            P.add_move(name, v, CW / 3, d > cut + 1e-6)
    return P


def megaminx(kilo=False):
    phi = (1 + 5 ** .5) / 2
    normals = []
    for a, b in itertools.product([-1, 1], repeat=2):
        normals += [(0, a * phi, b), (a * phi, b, 0), (b, 0, a * phi)]
    normals = [np.array(v) / np.linalg.norm(v) for v in normals]
    verts = [np.array(v, float) for v in itertools.product([-1, 1], repeat=3)]
    for a, b in itertools.product([-1, 1], repeat=2):
        verts += [np.array((0, a / phi, b * phi)), np.array((a / phi, b * phi, 0)), np.array((b * phi, 0, a / phi))]
    pts, cols, tags = [], [], []
    for fi, n in enumerate(normals):
        dots = [np.dot(v, n) for v in verts]
        mx = max(dots)
        fv = [v for v, d in zip(verts, dots) if abs(d - mx) < 1e-6]
        c = n * mx
        # order vertices around the face
        u = fv[0] - c; u /= np.linalg.norm(u); w = np.cross(n, u)
        fv.sort(key=lambda v: math.atan2(np.dot(v - c, w), np.dot(v - c, u)))
        if not kilo:
            pts.append(c); cols.append(fi); tags.append(('center', fi))
        for i in range(5):
            pts.append(c + .72 * (fv[i] - c)); cols.append(fi); tags.append(('corner', fi, tuple(np.round(fv[i], 3))))
            if not kilo:
                m = (fv[i] + fv[(i + 1) % 5]) / 2
                pts.append(c + .72 * (m - c)); cols.append(fi); tags.append(('edge', fi, tuple(np.round(m, 3))))
    P = Puzzle(pts, cols)
    P.tags = tags
    P.normals = normals
    for fi, n in enumerate(normals):
        d = P.P @ n
        # moving: this face's facelets + the 3 (or 2 for kilo) facelets on each of 5 neighbours
        want = (11 + 15) if not kilo else (5 + 10)
        cut = _gap_cut(d, want)
        P.add_move('f%d' % fi, n, CW / 5, d > cut)
    return P


def name_megaminx_faces(P):
    """Pick U, F, R, L, BR, BL, DR, DL, D... relative to a chosen view. Returns dict name->face index."""
    N = P.normals
    up = np.array([0, 1, 0.])
    U = max(range(12), key=lambda i: np.dot(N[i], up))
    adj = [i for i in range(12) if i != U and np.dot(N[i], N[U]) > .3]
    F = max(adj, key=lambda i: N[i][2])
    # right: adjacent to U and F with positive x
    rl = [i for i in adj if np.dot(N[i], N[F]) > .3]
    R = max(rl, key=lambda i: N[i][0]); L = min(rl, key=lambda i: N[i][0])
    br = [i for i in adj if i not in (F, R, L)]
    BR = max(br, key=lambda i: N[i][0]); BL = min(br, key=lambda i: N[i][0])
    D = min(range(12), key=lambda i: np.dot(N[i], up))
    # lower ring: faces adjacent to D
    low = [i for i in range(12) if i not in (U, D) and i not in adj]
    DR = max([i for i in low if np.dot(N[i], N[F]) > .3 and np.dot(N[i], N[R]) > .3] or [None], key=lambda i: 0)
    DL = max([i for i in low if np.dot(N[i], N[F]) > .3 and np.dot(N[i], N[L]) > .3] or [None], key=lambda i: 0)
    return {'U': U, 'F': F, 'R': R, 'L': L, 'BR': BR, 'BL': BL, 'D': D, 'DR': DR, 'DL': DL}


def cuboid(dims):
    """dims = (nx, ny, nz) layers. Square cross-sections get quarter turns, others only half turns."""
    nx, ny, nz = dims
    hx, hy, hz = nx / 2, ny / 2, nz / 2
    pts, cols = [], []
    ctr = lambda n, i: -n / 2 + .5 + i
    for i in range(ny):
        for k in range(nz):
            pts += [(hx, ctr(ny, i), ctr(nz, k)), (-hx, ctr(ny, i), ctr(nz, k))]; cols += ['R', 'L']
    for i in range(nx):
        for k in range(nz):
            pts += [(ctr(nx, i), hy, ctr(nz, k)), (ctr(nx, i), -hy, ctr(nz, k))]; cols += ['U', 'D']
    for i in range(nx):
        for k in range(ny):
            pts += [(ctr(nx, i), ctr(ny, k), hz), (ctr(nx, i), ctr(ny, k), -hz)]; cols += ['F', 'B']
    P = Puzzle(pts, cols)
    spec = {'R': (0, 1, nx, (ny, nz)), 'L': (0, -1, nx, (ny, nz)), 'U': (1, 1, ny, (nx, nz)), 'D': (1, -1, ny, (nx, nz)),
            'F': (2, 1, nz, (nx, ny)), 'B': (2, -1, nz, (nx, ny))}
    for name, (axi, sgn, nl, cross) in spec.items():
        axis = [0, 0, 0]; axis[axi] = sgn
        half = nl / 2
        sel = P.P[:, axi] * sgn > half - 1 + 1e-6 if nl > 1 else P.P[:, axi] * sgn > -1e9
        if nl == 1:
            sel = np.ones(P.n, bool)  # floppy: whole puzzle (only meaningful for flips)
        ang = CW / 4 if cross[0] == cross[1] else CW / 2
        P.add_move(name, axis, ang, sel)
    return P
