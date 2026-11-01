import numpy as np
from core import *
from puzzles import *
M=megaminx()
nm=name_megaminx_faces(M)
for k,v in nm.items():
  for s in ["","'","2","2'"]: M.moves[k+s]=M.moves['f%d'%v+s]
N=M.normals;T=M.tags
fname={v:k for k,v in nm.items()}
def adjname(pt):
  # name a piece by the faces it touches
  fs=sorted({T[i][1] for i in range(M.n) if T[i][0] in('corner','edge') and T[i][2]==pt})
  return '-'.join(fname.get(f,'f%d'%f) for f in fs)
def effect(alg):
  st=M.apply(M.solved(),alg);out=[]
  # piece moves: for each slot whose content changed, map original piece -> new position
  seen=set()
  for j in range(M.n):
    i=st[j]
    if i!=j and T[j][0] in ('corner','edge'):
      src=adjname(T[i][2]);dst=adjname(T[j][2])
      if src!=dst: seen.add((T[j][0],src,dst))
      else: seen.add((T[j][0]+' twist/flip',src,src))
  return sorted(seen)
