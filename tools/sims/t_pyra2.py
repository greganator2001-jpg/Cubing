exec(open('t_pyra.py').read().split("G=['U'")[0])
def desc(a):
  st=Y.apply(Y.solved(),a);ok=all(st[i]==i for i in keep);n=sum(st[i]!=i for i in top);return ok,n
for a in ["R U R' U R U R'","R' U' R U' R' U' R","R' L R L' U L' U' L","L R' L' R U' R U R'","R U' R' U' R U' R'","U R U' R' U R U' R'","R' L R L' U' L' U L","L' R L R' U R U' R'", "R U R' U' L' U' L U"]:
  print(a,desc(a))
nm={('F',1,0):'UL-edge(F side)',('F',1,1):'UR-edge(F side)',('Lf',1,0):'UB-edge(Lf side)',('Lf',1,1):'UL-edge(Lf side)',('Rf',1,0):'UR-edge(Rf side)',('Rf',1,1):'UB-edge(Rf side)'}
for a in ["R U R' U R U R'","R' U' R U' R' U' R","R' L R L' U L' U' L"]:
  st=Y.apply(Y.solved(),a)
  print(a,[ (nm.get(T[st[j]][:3]),'->',nm.get(T[j][:3])) for j in top if st[j]!=j])
