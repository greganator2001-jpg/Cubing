exec(open('t_sk4.py').read().split("r={}")[0])
import numpy as np, itertools, random
S.add_move('y',(0,1,0),CW/4,np.ones(S.n,bool))
A3="R L' B' U B U' R' U"; X="R L R L' R' B' L' B"
# Build all center states with corners solved: BFS using A3, X and y-conjugates
def cstate(st): return tuple(T[st[j]][1] for f in 'UDFBRL' for j in center[f])
def wrong(st): return [f for f in 'DFBRL' for j in center[f] if T[st[j]][1]!=f]
def colorAt(st,f): return T[st[center[f][0]]][1]
# procedure works on actual sticker colours relative to fixed frame; y rotation changes frame: we simulate holding by conjugating
def solve(st,limit=12):
  steps=0
  while steps<limit:
    # compare each center to the corner colours: in the fixed frame corners are solved so center f should be f
    w=wrong(st)
    if not w: return steps
    done=False
    if len(w)==3:
      for r in range(4):
        pre='y '*r; post="y' "*r
        w2=wrong(S.apply(st,pre.strip() or 'y y y y'))
        if set(w2)=={'F','R','B'}:
          st=S.apply(st,(pre+A3+' '+post).strip());steps+=1;done=True;break
    if not done:
      st=S.apply(st,X);steps+=1
  return None
# generate states
seen={};frontier=[S.solved()]
seen[cstate(S.solved())]=S.solved()
gens=[A3,X]+['y '+A3+" y'",'y '+X+" y'","y2 "+A3+" y2","y' "+A3+" y"]
S.moves['y2']=S.moves['y'][S.moves['y']]
while frontier:
  nf=[]
  for st in frontier:
    for g in gens:
      s2=S.apply(st,g);k=cstate(s2)
      if k not in seen: seen[k]=s2;nf.append(s2)
  frontier=nf
print('center states',len(seen))
res=[solve(s) for s in seen.values()]
print('unsolved',sum(r is None for r in res),'max steps',max(r for r in res if r is not None))
