exec(open('t_sk4.py').read().split("r={}")[0])
from core import bidir
import numpy as np
def twisted(pairs):
  t=np.arange(S.n)
  for k,d in pairs:
    ids=C[k]
    # find the rotation that maps the corner's facelets cyclically: use a move that twists it
    # build cycle order by position angle around the corner axis
    import math
    c=np.array([v for v in corner_axes()[k]],float)
    pts=S.P[ids]; u=np.cross(c,[0,0,1]) if abs(c[2])<.9 else np.cross(c,[1,0,0]); w=np.cross(c,u)
    order_=sorted(ids,key=lambda i: math.atan2(S.P[i]@w,S.P[i]@u))
    for a in range(3):
      t[order_[a]]=order_[(a+d)%3]
  return t
for pairs in [[('DFL',1),('DBR',2)],[('DFL',1),('DBL',2)],[('DBR',1),('DBL',2)],[('DFL',1),('DBR',1),('DBL',1)]]:
  tg=twisted(pairs); a=bidir(S,gens,tg,7); print(pairs,a)
  if a: st=S.apply(S.solved(),a); print('  check equal:',np.array_equal(st,tg))
