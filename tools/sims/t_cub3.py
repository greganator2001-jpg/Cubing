import numpy as np
from core import *
from puzzles import *
def mk(dims):
  P=cuboid(dims)
  for k in 'RLFB': P.moves[k+'2']=P.moves[k]
  return P
def describe(P,dims,a):
  X=P.P;maxy=dims[1]/2
  st=P.apply(P.solved(),a)
  best=None
  for u in ['','U','U2',"U'"]:
    s2=P.apply(st,u) if u else st
    mv=P.moved(s2)
    if best is None or len(mv)<len(best[1]): best=(u,mv)
  u,mv=best
  layer=lambda i:'top' if X[i,1]>maxy-1+1e-6 else ('bottom' if X[i,1]<-maxy+1-1e-6 else 'mid')
  isC=lambda i:(abs(X[i,0])>=dims[0]/2-.5) and (abs(X[i,2])>=dims[2]/2-.5)
  from collections import Counter
  return 'AUF',u or '-', Counter((layer(i),'corner' if isC(i) else 'edge') for i in mv)
D=mk((3,2,3))
for a in ["R2 U R2 U' R2","R2 U2 R2 U2 R2","R2 U R2 U R2 U2 R2","R2 F2 R2","R2 U' F2 U2 R2 U R2","U2 R2 U2 R2 U2 R2","R2 U2 R2 F2 U2 R2 F2 U2 F2","R2 U R2 U' R2 U R2 U' R2"]:
  print('domino',a,describe(D,(3,2,3),a))
Tw=mk((2,3,2))
for a in ["R2 U R2 U' R2","R2 U2 R2 U2 R2","R2 U R2 U R2 U2 R2","R2 U2 R2 U2 R2 U2"]:
  print('tower',a,describe(Tw,(2,3,2),a))
