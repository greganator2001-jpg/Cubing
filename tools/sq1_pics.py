# Draws top-view Square-1 diagrams for the guide (front at the bottom of the picture).
import math, json
def pt(deg, r=1.0):
    # angle measured clockwise from the front as seen from above; front = down on screen
    # sim unit angle -> real angle: units 0-5 are the right half, running back -> front
    # (positive twists turn clockwise seen from above); +15 deg = real slice skew
    a = math.radians(deg + 180 + 15)
    x, y = -math.sin(a), math.cos(a)       # top view, front at the bottom of the picture
    # project onto the square of half-size 1
    m = max(abs(x), abs(y))
    return (50 + 40 * x / m * r, 50 + 40 * y / m * r)
def wedge(u0, u1):
    pts = [(50, 50)]
    for k in range(u0 * 6, u1 * 6 + 1):
        pts.append(pt(k * 5))
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
LAYOUT = [('c0', 0, 2), ('e0', 2, 3), ('c1', 3, 5), ('e1', 5, 6), ('c2', 6, 8), ('e2', 8, 9), ('c3', 9, 11), ('e3', 11, 12)]
def mid(name):
    for n, a, b in LAYOUT:
        if n == name:
            return pt((a + b) / 2 * 30, .62)
def svg(hl=(), arrows=(), color='#FFD500'):
    s = ['<svg width="84" height="84" viewBox="0 0 100 100" aria-hidden="true"><defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker></defs>']
    s.append('<rect x="8" y="8" width="84" height="84" rx="6" fill="#0A0A0C"/>')
    for n, a, b in LAYOUT:
        fill = '#2F6BFF' if n in hl else ('#3A3F49' if n.startswith('e') else '#4A505C')
        s.append(f'<polygon points="{wedge(a, b)}" fill="{fill}" stroke="#0A0A0C" stroke-width="2.2" stroke-linejoin="round"/>')
    (ax, ay), (bx, by) = pt(0, 1.12), pt(180, 1.12)
    s.append(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="#FFB020" stroke-width="1.2" stroke-dasharray="3 3"/>')
    for a, b in arrows:
        (x1, y1), (x2, y2) = mid(a), mid(b)
        s.append(f'<path d="M{x1:.1f},{y1:.1f} Q50,50 {x2:.1f},{y2:.1f}" fill="none" stroke="#fff" stroke-width="2.2" marker-end="url(#ah)" marker-start="url(#ah)"/>')
    s.append('<text x="50" y="99" font-size="7" fill="#8A919D" text-anchor="middle" font-family="sans-serif">FRONT</text></svg>')
    return ''.join(s)
P = {
 'frontcorners': svg(('c1', 'c2'), [('c1', 'c2')]),
 'diag': svg(('c0', 'c2'), [('c0', 'c2')]),
 'neighbors': svg(('e0', 'e1'), [('e0', 'e1')]),
 'frontback': svg(('e1', 'e3'), [('e1', 'e3')]),
 'trade': svg(('c0', 'e0', 'c1')),
}
open('tools/sq1_pics.json', 'w').write(json.dumps(P))
