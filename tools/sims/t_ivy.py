import numpy as np
from core import *
from puzzles import *
I=corner_turner('ivy',{'R':'DBR','L':'DFL','U':'UBL','F':'UFR'})
T=I.tags
petal={t[1]:i for i,t in enumerate(T) if t[0]=='petal'}
corn=[i for i,t in enumerate(T) if t[0]=='corner']
G=['R',"R'",'L',"L'",'U',"U'",'F',"F'"]
ok=lambda st,ids: all(st[i]==i for i in ids)
a=search(I,G,lambda st: ok(st,corn) and sum(st[petal[f]]!=petal[f] for f in petal)==3,8)
print('petal 3-cycle',a)
st=I.apply(I.solved(),a);print([(T[st[petal[f]]][1],'->',f) for f in petal if st[petal[f]]!=petal[f]])
print('R moves petals',[T[i][1] for i in I.moved(I.apply(I.solved(),'R')) if T[i][0]=='petal'])
