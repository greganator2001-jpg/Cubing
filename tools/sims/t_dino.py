import numpy as np
from core import *
from puzzles import *
names={'UFR':'UFR','UFL':'UFL','UBR':'UBR','UBL':'UBL','DFR':'DFR','DFL':'DFL','DBR':'DBR','DBL':'DBL'}
Dn=corner_turner('dino',names)
T=Dn.tags
print({k:len(Dn.moved(Dn.apply(Dn.solved(),k))) for k in ['UFR','DFR']})
edges={}
for i,t in enumerate(T): edges.setdefault(t[1],[]).append(i)
def ename(m):
  x,y,z=m; return ''.join(s for s,c in [('U',y>0),('D',y<0),('F',z>0),('B',z<0),('R',x>0),('L',x<0)] if c and ( (s in 'UD' and y!=0) or (s in 'FB' and z!=0) or (s in 'RL' and x!=0)))
EN={ename(k):v for k,v in edges.items()}
print(sorted(EN))
top=[i for k,v in EN.items() if 'U' in k for i in v]
rest=[i for k,v in EN.items() if 'U' not in k for i in v]
G=[c+s for c in ['UFR','UFL','UBR','UBL'] for s in ['',"'"]]
ok=lambda st,ids: all(st[i]==i for i in ids)
a=search(Dn,G,lambda st: ok(st,rest) and sum(st[i]!=i for i in top)==6,8)
print('top 3-cycle (U corners only):',a)
st=Dn.apply(Dn.solved(),a)
mv=sorted({(ename(T[st[j]][1]),'->',ename(T[j][1])) for j in top if st[j]!=j});print(mv)
