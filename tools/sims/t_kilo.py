import numpy as np
from core import *
from puzzles import *
M=megaminx(kilo=True)
nm=name_megaminx_faces(M)
for k,v in nm.items():
  for s in ["","'","2","2'"]: M.moves[k+s]=M.moves['f%d'%v+s]
N=M.normals
U=set(np.where(M.P@N[nm['U']]>1.0)[0]);print('U layer',len(U))
for a in ["R U2' L' U2 R' U2' L U2","R' DR' R DR","R U R' U R U2' R'"]:
  st=M.apply(M.solved(),a);mv=set(M.moved(st));print(a,len(mv),mv<=U,order(M,a))
