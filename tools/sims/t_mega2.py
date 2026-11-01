import numpy as np
from core import *
from puzzles import *
M=megaminx()
nm=name_megaminx_faces(M)
for k,v in nm.items():
  for s in ["","'","2","2'"]: M.moves[k+s]=M.moves['f%d'%v+s]
N=M.normals
print('DR adj F,R:', np.dot(N[nm['DR']],N[nm['F']]).round(2), np.dot(N[nm['DR']],N[nm['R']]).round(2))
Ulayer=set(np.where(M.P@N[nm['U']]>1.0)[0])  # U face + top strips
print('U layer facelets',len(Ulayer))
def eff(a):
  st=M.apply(M.solved(),a);mv=set(M.moved(st));return len(mv), mv<=Ulayer
for a in ["F R U R' U' F'","R U R' U R U2' R'","R U2 R' U2' R U2 R'","R U R' U R U2 R'","R U' L' U R' U' L U","R U2' L' U2 R' U2' L U2","L' U R U' L U R'","R' DR' R DR","R' DR' R DR R' DR' R DR"]:
  print(a,eff(a), 'order',order(M,a))
