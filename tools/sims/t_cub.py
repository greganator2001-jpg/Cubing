import numpy as np
from core import *
from puzzles import *
def info(P,name):
  print(name,P.n,{k:len(P.moved(P.apply(P.solved(),k))) for k in 'RLUDFB'})
F1=cuboid((3,1,3)); info(F1,'floppy')
X=F1.P
corner=[i for i in range(F1.n) if abs(X[i,0])>=1 and abs(X[i,2])>=1 and abs(X[i,1])<1] + [i for i in range(F1.n) if abs(X[i,1])==0.5 and abs(X[i,0])==1 and abs(X[i,2])==1]
G=['R','L','F','B']
ok=lambda st,ids: all(st[i]==i for i in ids)
# corners = facelets at x,z extremes (|x|=1,|z|=1) on U/D faces plus side facelets at corners
cornerF=[i for i in range(F1.n) if (abs(round(X[i,0]))==1 or abs(X[i,0])==1.5) and (abs(round(X[i,2]))==1 or abs(X[i,2])==1.5) and not (abs(X[i,0])==1.5 and abs(X[i,2])==1.5)]
cornerF=[i for i in range(F1.n) if abs(X[i,0])>=1 and abs(X[i,2])>=1]
edgeF=[i for i in range(F1.n) if i not in cornerF and not (X[i,0]==0 and X[i,2]==0)]
print('corner facelets',len(cornerF),'edge facelets',len(edgeF))
a=search(F1,G,lambda st: ok(st,cornerF) and not ok(st,edgeF),10)
print('flip edges keeping corners:',a)
st=F1.apply(F1.solved(),a);print('edge facelets moved',sum(st[i]!=i for i in edgeF))
