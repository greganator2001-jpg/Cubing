import random
# front dials 3x3 indices r*3+c; back dials mirrored: back position (r,c) seen from back = front (r,2-c)
# corners: UL=(0,0) UR=(0,2) DL=(2,0) DR=(2,2) (front coords). Pins named same (front view).
BLK={'UL':[(0,0),(0,1),(1,0),(1,1)],'UR':[(0,2),(0,1),(1,2),(1,1)],'DL':[(2,0),(1,0),(2,1),(1,1)],'DR':[(2,2),(1,2),(2,1),(1,1)]}
CORN={'UL':(0,0),'UR':(0,2),'DL':(2,0),'DR':(2,2)}
def turn(F,B,up,wheel,k):
  """up: set of pins up (front view). Turn wheel by k (clockwise as seen from front)."""
  F=dict(F);B=dict(B)
  grp=[p for p in BLK if (p in up)==(wheel in up)]
  if wheel in up:
    cells=set(c for p in grp for c in BLK[p])
    for c in cells: F[c]=(F[c]+k)%12
    for p in grp: r,c=CORN[p]; B[(r,c)]=(B[(r,c)]-k)%12   # back corner = same gear, seen mirrored
  else:
    cells=set(c for p in grp for c in BLK[p])
    for c in cells: B[c]=(B[c]-k)%12
    for p in grp: r,c=CORN[p]; F[(r,c)]=(F[(r,c)]+k)%12
  return F,B
# Note: B keyed by FRONT coordinates of the same physical spot; corners share the gear.
