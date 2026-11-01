import numpy as np
from core import *
from puzzles import *
ok=lambda st,ids: all(st[i]==i for i in ids)
def run(dims,name):
  P=cuboid(dims);X=P.P
  for k in ['U','D']: pass
  G=['U',"U'",'U2','R2','F2','L2','B2','D',"D'"]
  P.moves['R2']=P.moves['R'] if True else None
  # R/L/F/B are already half turns in cuboid(); alias names
  for k in 'RLFB': P.moves[k+'2']=P.moves[k]
  G=['U',"U'",'U2','R2','F2','L2','B2']
  top=X[:,1]>dims[1]/2-1+1e-6
  ys=X[:,1];maxy=dims[1]/2
  topLayer=[i for i in range(P.n) if X[i,1]>maxy-1+1e-6]
  rest=[i for i in range(P.n) if i not in topLayer]
  isCorner=lambda i: (abs(X[i,0])>=dims[0]/2-.5) and (abs(X[i,2])>=dims[2]/2-.5)
  tc=[i for i in topLayer if isCorner(i)]; te=[i for i in topLayer if not isCorner(i) and not (abs(X[i,0])<.1 and abs(X[i,2])<.1)]
  a=search(P,['U',"U'",'U2','R2','F2'],lambda st: ok(st,rest) and ok(st,te) and 0<sum(st[i]!=i for i in tc),13)
  print(name,'top corners only:',a)
  if a:
    st=P.apply(P.solved(),a);print('   corner facelets moved',sum(st[i]!=i for i in tc))
  if te:
    b=search(P,G,lambda st: ok(st,rest) and ok(st,tc) and 0<sum(st[i]!=i for i in te),9)
    print(name,'top edges only:',b)
    if b: st=P.apply(P.solved(),b);print('   edge facelets moved',sum(st[i]!=i for i in te))
run((3,2,3),'domino')
run((2,3,2),'tower')
