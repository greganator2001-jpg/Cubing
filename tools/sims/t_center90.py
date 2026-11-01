import numpy as np, math
from core import *
from puzzles import CW
pts=[];cols=[]
ctr=lambda i:-1+i
for face,(ax,s) in {'R':(0,1),'L':(0,-1),'U':(1,1),'D':(1,-1),'F':(2,1),'B':(2,-1)}.items():
  o=[a for a in range(3) if a!=ax]
  for i in range(3):
    for j in range(3):
      p=[0,0,0];p[ax]=1.5*s;p[o[0]]=ctr(i);p[o[1]]=ctr(j);pts.append(p);cols.append(face)
  # markers
  for d in [(0.3,0),(-0.3,0),(0,0.3),(0,-0.3)]:
    p=[0,0,0];p[ax]=1.5*s;p[o[0]]=d[0];p[o[1]]=d[1];pts.append(p);cols.append('m'+face)
P=Puzzle(pts,cols)
X=P.P
spec={'R':((1,0,0),X[:,0]>0.9),'L':((-1,0,0),X[:,0]<-0.9),'U':((0,1,0),X[:,1]>0.9),'D':((0,-1,0),X[:,1]<-0.9),'F':((0,0,1),X[:,2]>0.9),'B':((0,0,-1),X[:,2]<-0.9),
 'M':((-1,0,0),abs(X[:,0])<0.9),'E':((0,-1,0),abs(X[:,1])<0.9),'S':((0,0,1),abs(X[:,2])<0.9)}
for k,(a,sel) in spec.items(): P.add_move(k,a,CW/4,sel)
real=[i for i,c in enumerate(cols) if not c.startswith('m')]
marks={f:[i for i,c in enumerate(cols) if c=='m'+f] for f in 'UDFBRL'}
# target: U rotated cw 90 (as by a U turn applied only to markers), F rotated ccw
def rotmarkers(t,f,mv):
  st=P.apply(P.solved(),mv)
  for j in marks[f]: t[j]=st[j]
  return t
tg=np.arange(P.n); tg=rotmarkers(tg,'U','U'); tg=rotmarkers(tg,'F',"F'")
gens=[g+s for g in 'RLUFBDMES' for s in ['',"'"]]+[g+'2' for g in 'RLUFMES']
P.moves.update({g+'2':P.moves[g+'2'] for g in 'RLUFMES'})
a=bidir(P,gens,tg,5); print('U cw + F ccw:',a)
tg2=np.arange(P.n); tg2=rotmarkers(tg2,'U','U'); tg2=rotmarkers(tg2,'D',"D'")
print('U cw + D ccw:',bidir(P,gens,tg2,5))
tg3=np.arange(P.n); tg3=rotmarkers(tg3,'U','U2')
print('U 180:',bidir(P,gens,tg3,5))
