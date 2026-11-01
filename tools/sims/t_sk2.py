exec(open('t_skewb.py').read().split("gens=")[0])
def desc(alg):
  st=S.apply(S.solved(),alg);mv=set(S.moved(st))
  cs=sorted({T[i][1] for i in mv if T[i][0]=='center'});co=sorted({''.join('UD'[c[1]<0] if False else '' for _ in [0]) or name(T[i][1]) for i in mv if T[i][0]=='corner'})
  return 'centers',cs,'corners',co
def name(c):
  x,y,z=c;return ('U' if y>0 else 'D')+('F' if z>0 else 'B')+('R' if x>0 else 'L')
import itertools
for a in ["R' L R L'","R L' R' L","L' R L R'","R' B R B'","U' L U L'","B' R B R'","L' B L B'","R U' R' U"]:
  print(a,desc(a))
