import numpy as np
from core import *
from puzzles import *
S=corner_turner('skewb',{'R':'DBR','L':'DFL','U':'UBL','B':'DBL'})
T=S.tags
def idx(pred): return [i for i,t in enumerate(T) if pred(t)]
center={f:idx(lambda t,f=f:t[0]=='center' and t[1]==f) for f in 'UDFBRL'}
corner={}
for i,t in enumerate(T):
  if t[0]=='corner': corner.setdefault(t[1],[]).append(i)
def ok(st,ids): return all(st[i]==i for i in ids)
print('orders', {m:order(S,m) for m in 'RLUB'})
# which corners move with R
st=S.apply(S.solved(),'R'); print('R moves corners', sorted({T[i][1] for i in S.moved(st) if T[i][0]=='corner'}), 'centers',sorted({T[i][1] for i in S.moved(st) if T[i][0]=='center'}))
Ucorn=[i for c,ids in corner.items() if c[1]==1 for i in ids]
keepU=center['U']+Ucorn
cents=[i for f in 'DFBRL' for i in center[f]]
Dcorn=[i for c,ids in corner.items() if c[1]==-1 for i in ids]
gens=['R',"R'",'L',"L'",'U',"U'",'B',"B'"]
import time
def goal_corners_only(st): return ok(st,keepU) and ok(st,cents) and not ok(st,Dcorn)
def goal_centers_only(st): return ok(st,keepU) and ok(st,Dcorn) and not ok(st,cents)
t=time.time();print('corner-only:',search(S,gens,goal_corners_only,8),time.time()-t)
t=time.time();print('center-only:',search(S,gens,goal_centers_only,9),time.time()-t)
