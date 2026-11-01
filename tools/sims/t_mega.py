import numpy as np
from core import *
from puzzles import *
M=megaminx()
nm=name_megaminx_faces(M)
print(nm)
inv={v:k for k,v in nm.items()}
for k,v in nm.items():
  if v is None: continue
  for s in ["","'","2","2'"]: M.moves[k+s]=M.moves['f%d'%v+s]
T=M.tags
def piece_facelets():
  # group corner/edge facelets into pieces by proximity of the cube vertex/edge they belong to: use positions clustering
  pass
st=M.apply(M.solved(),'R'); print('R moves', len(M.moved(st)))
print('order R', order(M,'R'), 'sexy', order(M,"R U R' U'"))
for a in ["F R U R' U' F'","R U R' U R U2' R'","R U2 R' U2' R U2 R'", "U R U' L' U R' U' L","R' D' R D"]:
  try:
    st=M.apply(M.solved(),a);print(a,'moved',len(M.moved(st)))
  except KeyError as e: print('no move',e)
N=M.normals
for a in 'URLF': print(a, nm[a], np.round(N[nm[a]],2))
print(order(M,"U L"), order(M,"R L"), len(M.moved(M.apply(M.solved(),"L"))))
for a in ["U","U R","U R U'","U R U' L'","U R U' L' U","U R U' L' U R'","U R U' L' U R' U'","U R U' L' U R' U' L"]:
  print(a,len(M.moved(M.apply(M.solved(),a))))
print(parse("U R U' L' U R' U' L"))
