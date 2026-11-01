import math
K = '#0B0C0F'
Y, W, G, R, O, B, S, GD = '#FFD500', '#F2F2F2', '#11A35A', '#D0213B', '#FF7A1A', '#2F6BFF', '#B9C0CB', '#D9A93A'


def P(pts, fill, sw=.9):
    return '<polygon points="' + ' '.join(f'{x:.2f},{y:.2f}' for x, y in pts) + f'" fill="{fill}" stroke="{K}" stroke-width="{sw}" stroke-linejoin="round"/>'


def path(d, sw=.9):
    return f'<path d="{d}" stroke="{K}" stroke-width="{sw}" fill="none" stroke-linecap="round"/>'


# isometric frame: faces as (origin, u, v)
w, h, H = 13.0, 7.5, 15.0


def frames(top_h=H):
    T = (16, 1)
    L = (3, 1 + h)
    Bt = (16, 1 + 2 * h)
    return [(T, (w, h), (-w, h)), (L, (w, h), (0, top_h)), (Bt, (w, -h), (0, top_h))]


def at(f, a, b):
    p0, u, v = f
    return (p0[0] + u[0] * a + v[0] * b, p0[1] + u[1] * a + v[1] * b)


def face_poly(f, fill):
    return P([at(f, 0, 0), at(f, 1, 0), at(f, 1, 1), at(f, 0, 1)], fill)


def grid_lines(f, us, vs, sw=.9):
    d = ''
    for t in us:
        a, b = at(f, t, 0), at(f, t, 1)
        d += f'M{a[0]:.2f} {a[1]:.2f}L{b[0]:.2f} {b[1]:.2f}'
    for t in vs:
        a, b = at(f, 0, t), at(f, 1, t)
        d += f'M{a[0]:.2f} {a[1]:.2f}L{b[0]:.2f} {b[1]:.2f}'
    return path(d, sw) if d else ''


def uv_path(f, segs, sw=.9):
    d = ''
    for seg in segs:
        for k, (a, b) in enumerate(seg):
            x, y = at(f, a, b)
            d += ('M' if k == 0 else 'L') + f'{x:.2f} {y:.2f}'
    return path(d, sw)


def svg(inner, op=.8, size=30):
    return f'<svg width="{size}" height="{size*34/32:.0f}" viewBox="0 0 32 34" aria-hidden="true" style="opacity:{op}">{inner}</svg>'


COLS = [Y, G, O]


def nxn(n, cols=COLS):
    out = ''
    sw = max(.5, 1.6 - n * .12)
    for f, c in zip(frames(), cols):
        out += face_poly(f, c) + grid_lines(f, [i / n for i in range(1, n)], [i / n for i in range(1, n)], sw)
    return out


def cuboid(nu, nv, side_rows, top_h=H):
    out = ''
    fr = frames(top_h)
    out += face_poly(fr[0], Y) + grid_lines(fr[0], [i / nu for i in range(1, nu)], [i / nv for i in range(1, nv)])
    out += face_poly(fr[1], G) + grid_lines(fr[1], [i / nu for i in range(1, nu)], [i / side_rows for i in range(1, side_rows)])
    out += face_poly(fr[2], O) + grid_lines(fr[2], [i / nv for i in range(1, nv)], [i / side_rows for i in range(1, side_rows)])
    return out


def pyraminx(n=3, col=R):
    A, Bp, C = (16, 2), (30, 31), (2, 31)

    def L(i, j):
        return (A[0] + (C[0] - A[0]) * i / n + (Bp[0] - C[0]) * j / n, A[1] + (C[1] - A[1]) * i / n + (Bp[1] - C[1]) * j / n)
    out = ''
    for i in range(n):
        for j in range(i + 1):
            out += P([L(i, j), L(i + 1, j), L(i + 1, j + 1)], col, .8)
            if j < i:
                out += P([L(i, j), L(i, j + 1), L(i + 1, j + 1)], col, .8)
    return out


def pent(cx, cy, r, rot=-90):
    return [(cx + r * math.cos(math.radians(rot + 72 * k)), cy + r * math.sin(math.radians(rot + 72 * k))) for k in range(5)]


def megaminx(col=G, kilo=False):
    O_ = pent(16, 18, 15)
    out = P(O_, col)
    if kilo:
        d = ''
        for k in range(5):
            a, b = O_[k], O_[(k + 1) % 5]
            m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            d += f'M16 18L{m[0]:.2f} {m[1]:.2f}'
        return out + path(d)
    I = pent(16, 18, 6.5)
    d = ''.join(f'M{I[k][0]:.2f} {I[k][1]:.2f}L{O_[k][0]:.2f} {O_[k][1]:.2f}' for k in range(5))
    return out + path(d) + P(I, col)


def per_face(fn, cols=COLS):
    return ''.join(face_poly(f, c) + fn(f) for f, c in zip(frames(), cols))


def skewb():
    return per_face(lambda f: P([at(f, .5, 0), at(f, 1, .5), at(f, .5, 1), at(f, 0, .5)], 'none'))


def dino():
    return per_face(lambda f: uv_path(f, [[(0, 0), (1, 1)], [(1, 0), (0, 1)]]))


def redi():
    return per_face(lambda f: uv_path(f, [[(.38, 0), (0, .38)], [(.62, 0), (1, .38)], [(1, .62), (.62, 1)], [(.38, 1), (0, .62)]]))


def ivy():
    def leaf(f):
        pts = [at(f, 0, 0)]
        for k in range(1, 12):
            t = k / 12
            pts.append(at(f, t + .28 * math.sin(math.pi * t), t - .28 * math.sin(math.pi * t)))
        pts.append(at(f, 1, 1))
        for k in range(11, 0, -1):
            t = k / 12
            pts.append(at(f, t - .28 * math.sin(math.pi * t), t + .28 * math.sin(math.pi * t)))
        return P(pts, 'none')
    return per_face(leaf)


def mirror():
    return ''.join(face_poly(f, c) + grid_lines(f, [.22, .62], [.3, .74]) for f, c in zip(frames(), ['#D7DCE3', '#AEB5BF', '#8E96A1']))


def ghost():
    return ''.join(face_poly(f, c) + uv_path(f, [[(.3, 0), (.2, 1)], [(.7, 0), (.6, 1)], [(0, .35), (1, .25)], [(0, .75), (1, .62)]]) for f, c in zip(frames(), ['#D7DCE3', '#AEB5BF', '#8E96A1']))


def axis():
    return ''.join(face_poly(f, c) + uv_path(f, [[(.15, 0), (.45, 1)], [(.6, 0), (.9, 1)], [(0, .4), (1, .2)], [(0, .85), (1, .6)]]) for f, c in zip(frames(), [GD, '#B88A2A', '#9A7322']))


def fisher():
    def top(f):
        return uv_path(f, [[(.0, .45), (.55, 1)], [(.45, 0), (1, .55)], [(.0, .9), (.1, 1)], [(.9, 0), (1, .1)], [(.2, 0), (0, .2)], [(.8, 1), (1, .8)]])
    fr = frames()
    return face_poly(fr[0], Y) + top(fr[0]) + face_poly(fr[1], G) + grid_lines(fr[1], [.38, .7], [1 / 3, 2 / 3]) + face_poly(fr[2], O) + grid_lines(fr[2], [.3, .62], [1 / 3, 2 / 3])


def windmill():
    def top(f):
        return uv_path(f, [[(.28, 0), (.4, 1)], [(.6, 0), (.72, 1)], [(0, .38), (1, .28)], [(0, .72), (1, .6)]])
    fr = frames()
    return face_poly(fr[0], Y) + top(fr[0]) + face_poly(fr[1], G) + grid_lines(fr[1], [.3, .7], [1 / 3, 2 / 3]) + face_poly(fr[2], O) + grid_lines(fr[2], [.35, .65], [1 / 3, 2 / 3])


def gear():
    out = nxn(3)
    T = frames()[0]
    for a, b in [(.5, 1 / 6), (5 / 6, .5), (.5, 5 / 6), (1 / 6, .5)]:
        x, y = at(T, a, b)
        out += f'<ellipse cx="{x:.2f}" cy="{y:.2f}" rx="2.6" ry="1.5" fill="{K}" opacity=".55"/>'
    return out


def mastermorphix():
    return pyraminx(3, GD)


def clock():
    o = f'<circle cx="16" cy="17" r="14.5" fill="{B}" stroke="{K}" stroke-width=".9"/>'
    for i in range(3):
        for j in range(3):
            x, y = 8 + 8 * j, 9 + 8 * i
            o += f'<circle cx="{x}" cy="{y}" r="3.2" fill="#EEF0F4"/><path d="M{x} {y}L{x} {y-2.4}" stroke="{K}" stroke-width="1.1" stroke-linecap="round"/>'
    return o


def sq1():
    fr = frames()
    T = fr[0]
    out = face_poly(T, '#EEF0F4')
    d = ''
    c = at(T, .5, .5)
    for (a0, b0), (a1, b1) in [((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0))]:
        for t in (.36, .64):
            p = at(T, a0 + (a1 - a0) * t, b0 + (b1 - b0) * t)
            d += f'M{c[0]:.2f} {c[1]:.2f}L{p[0]:.2f} {p[1]:.2f}'
    out += path(d)
    for f, col in ((fr[1], B), (fr[2], R)):
        out += face_poly(f, col) + grid_lines(f, [], [.4, .6]) + uv_path(f, [[(.36, 0), (.36, .4)], [(.64, 0), (.64, .4)], [(.36, .6), (.36, 1)], [(.64, .6), (.64, 1)]])
    return out


PUZZLES = {
    # id: (label, short, icon_fn)
    '2': ('2x2', '2x2', lambda: nxn(2)), '3': ('3x3', '3x3', lambda: nxn(3)), '4': ('4x4', '4x4', lambda: nxn(4)),
    '5': ('5x5', '5x5', lambda: nxn(5)), '6': ('6x6', '6x6', lambda: nxn(6)), '7': ('7x7', '7x7', lambda: nxn(7)),
    '9': ('9x9', '9x9', lambda: nxn(9)),
    'pyra': ('Pyraminx', 'Pyra', lambda: pyraminx()), 'mega': ('Megaminx', 'Mega', lambda: megaminx()),
    'skewb': ('Skewb', 'Skewb', skewb), 'sq1': ('Square-1', 'SQ-1', sq1), 'clock': ('Clock', 'Clock', clock),
    'mirror': ('Mirror Cube', 'Mirror', mirror), 'gear': ('Gear Cube', 'Gear', gear), 'ivy': ('Ivy Cube', 'Ivy', ivy),
    'dino': ('Dino Cube', 'Dino', dino), 'redi': ('Redi Cube', 'Redi', redi), 'kilo': ('Kilominx', 'Kilo', lambda: megaminx(Y, True)),
    'mpyra': ('Master Pyraminx', 'M-Pyra', lambda: pyraminx(4, B)), 'morphix': ('Mastermorphix', 'Morphix', mastermorphix),
    'axis': ('Axis Cube', 'Axis', axis), 'fisher': ('Fisher Cube', 'Fisher', fisher), 'windmill': ('Windmill Cube', 'Windmill', windmill),
    'ghost': ('Ghost Cube', 'Ghost', ghost), 'floppy': ('Floppy 3x3x1', 'Floppy', lambda: cuboid(3, 3, 1, 5)),
    'domino': ('Domino 3x3x2', 'Domino', lambda: cuboid(3, 3, 2, 10)), 'tower': ('Tower 2x2x3', 'Tower', lambda: cuboid(2, 2, 3, 17)),
}
WCA = ['2', '3', '4', '5', '6', '7', '9', 'pyra', 'mega', 'skewb', 'sq1', 'clock']


def icon(pid, op=.8, size=30):
    return svg(PUZZLES[pid][2](), op, size)


def picker(active):
    btns = []
    for k, pid in enumerate(WCA):
        if pid == 'pyra':
            btns.append('<span aria-hidden="true" style="width: 1px; align-self: stretch; margin: 6px 4px; background: #2A2E37"></span>')
        a = pid == active
        st = 'background: #EEF0F4; color: #0B0C0F; box-shadow: 0 0 0 1px {{accent}}, 0 8px 20px -10px {{accent}}' if a else 'background: none; color: #7F8794'
        btns.append(f'<button aria-label="{PUZZLES[pid][0]}"{" aria-pressed=\"true\"" if a else ""} style="font: inherit; border: 0; {st}; padding: 6px 9px 5px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 3px">{icon(pid, 1 if a else .8)}<span>{PUZZLES[pid][1]}</span></button>')
    more_a = active not in WCA
    btns.append('<span aria-hidden="true" style="width: 1px; align-self: stretch; margin: 6px 4px; background: #2A2E37"></span>')
    btns.append(f'<button aria-label="More puzzles" style="font: inherit; border: 1px dashed {"{{accent}}" if more_a else "#3A3F49"}; background: none; color: {"#A9C1FF" if more_a else "#9AA1AD"}; padding: 6px 10px 5px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 3px"><span style="width: 30px; height: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; align-content: center">{icon("ivy",.9,14)}{icon("gear",.9,14)}{icon("mirror",.9,14)}{icon("kilo",.9,14)}</span><span>More ▾</span></button>')
    return ('<div role="group" aria-label="Puzzle" style="display: flex; flex-wrap: wrap; gap: 2px; background: #15171C; border: 1px solid #262A32; border-radius: 12px; padding: 4px; font-family: \'Chakra Petch\', sans-serif; font-weight: 600; font-size: 12px">\n        '
            + '\n        '.join(btns) + '\n      </div>')
