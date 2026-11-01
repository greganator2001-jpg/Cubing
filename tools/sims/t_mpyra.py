from core import *
from puzzles import *
Y=pyraminx(4)
T=Y.tags
D=[i for i,t in enumerate(T) if t[0]=='D']
for a in ["Rw Uw Rw' Uw Rw Uw Rw'","Rw' Lw Rw Lw' Uw Lw' Uw' Lw"]:
  st=Y.apply(Y.solved(),a);mv=Y.moved(st)
  print(a,'moved',len(mv),'touches bottom face',any(i in D for i in mv), 'rows moved',sorted({T[i][1] for i in mv}))
