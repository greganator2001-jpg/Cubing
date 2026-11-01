from clock import *
import random
cells=[(r,c) for r in range(3) for c in range(3)]
def scramble():
  F={c:0 for c in cells};B={c:0 for c in cells}
  for _ in range(30):
    up=set(p for p in BLK if random.random()<.5)
    if not up: up={'UL'}
    w=random.choice(list(BLK));F,B=turn(F,B,up,w,random.randint(1,11))
  return F,B
def align(F,B,up,target_cell,ref_cell,side='F'):
  # turn a wheel in the up group until dial target_cell equals ref_cell value (on side)
  w=next(iter(up))
  for k in range(12):
    F2,B2=turn(F,B,up,w,k)
    D=F2 if side=='F' else B2
    if D[target_cell]==D[ref_cell]: return F2,B2
  raise Exception('cannot align')
def solve_side(F,B):
  # cross
  F,B=align(F,B,{'DL','DR'},(1,1),(0,1))
  F,B=align(F,B,{'UR','DR'},(1,1),(1,0))
  F,B=align(F,B,{'UL','DL'},(1,1),(1,2))
  F,B=align(F,B,{'UL','UR'},(1,1),(2,1))
  for p in BLK:
    others=set(BLK)-{p}
    F,B=align(F,B,others,(1,1),CORN[p])
  # set to 12
  w='UL';v=F[(1,1)];F,B=turn(F,B,set(BLK),w,(-v)%12)
  return F,B
def flip(F,B):
  # turn over left-right: new front = old back; positions mirror columns; values: back dials read as seen from back.
  # In our model B values already 'as seen from back' and keyed by front coords; mirror columns.
  nF={(r,c):B[(r,2-c)] for (r,c) in cells}; nB={(r,c):F[(r,2-c)] for (r,c) in cells}
  return nF,nB
ok=0
for t in range(2000):
  F,B=scramble()
  F,B=solve_side(F,B)
  assert all(v==0 for v in F.values())
  F,B=flip(F,B)
  F,B=solve_side(F,B)
  if all(v==0 for v in F.values()) and all(v==0 for v in B.values()): ok+=1
print('solved',ok,'/2000')
