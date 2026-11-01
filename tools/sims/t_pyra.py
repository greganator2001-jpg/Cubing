import numpy as np
from core import *
from puzzles import *
Y=pyraminx(3)
print(sorted(k for k in Y.moves if "'" not in k and '2' not in k))
print({k:order(Y,k) for k in ['U','u','R','L','B']}, Y.n)
for a in ['U','u']: print(a,len(Y.moved(Y.apply(Y.solved(),a))))
T=Y.tags
D=[i for i,t in enumerate(T) if t[0]=='D']
nonedge=[]
# classify facelets: tips/axials/edges per face by (row, j, up/down)
def kind(t):
  f,i,j,ud=t
  if ud=='down': return 'axial'
  if (i,j) in [(0,0),(2,0),(2,2)]: return 'tip'
  return 'edge'
K=[kind(t) for t in T]
fixed=[i for i in range(Y.n) if K[i]!='edge' or T[i][0]=='D']
# D-face edges also include their partner facelets on side faces: find by applying: an edge piece's two facelets
# simpler: require all D facelets and all non-edge facelets home, plus edge facelets on side faces in row 2 (bottom row edges)
botedge=[i for i in range(Y.n) if K[i]=='edge' and T[i][0]!='D' and T[i][1]==2]
keep=fixed+botedge
top=[i for i in range(Y.n) if K[i]=='edge' and T[i][0]!='D' and T[i][1]==1]
print('top edge facelets',len(top),'bottom-edge partner facelets',len(botedge))
G=['U',"U'",'R',"R'",'L',"L'"]
okk=lambda st,ids:all(st[i]==i for i in ids)
cyc=search(Y,G,lambda st: okk(st,keep) and sum(st[i]!=i for i in top)==6 and len({st[i] for i in top})==6,9)
print('3-cycle',cyc)
print('flip2',search(Y,G+['B',"B'"],lambda st: okk(st,keep) and sum(st[i]!=i for i in top)==4,10))
