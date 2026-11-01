from sq1 import *
import pickle
seen=pickle.load(open('/tmp/sq1bfs.pkl','rb'))
S=solved()
def plist(L): return [p for i,p in pieces(L)]
def diff(st):
  # best final twist (multiples of 3) minimizing differences
  best=None
  for a in (0,3,6,9):
    for b in (0,3,6,9):
      s2=twist(st,a,b)
      if not is_cube(s2): continue
      t,d,m=s2
      if [x[0] for x in t]!=[x[0] for x in S[0]] and plist(t)!=plist(S[0]): pass
      dt=[(i,S[0][i][0],t[i][0]) for i in range(12) if t[i]!=S[0][i]]
      db=[(i,S[1][i][0],d[i][0]) for i in range(12) if d[i]!=S[1][i]]
      score=len(dt)+len(db)
      if best is None or score<best[0]: best=(score,a,b,dt,db,m)
  return best
cands=[]
for st,p in seen.items():
  if not is_cube(st): continue
  r=diff(st)
  if r is None: continue
  score,a,b,dt,db,m=r
  topp={x[1] for x in dt};botp={x[1] for x in db}
  cands.append((score,m,len(p),p+('(%d,%d)'%(a,b) if (a,b)!=(0,0) else ''),sorted(set((x[1],x[2]) for x in dt)),sorted(set((x[1],x[2]) for x in db))))
def show(filt,name,k=3):
  r=sorted([c for c in cands if filt(c)],key=lambda c:(c[2],c[0]))[:k]
  print('==',name)
  for c in r: print('  ',c[3],'| mid',c[1],'| top',c[4],'| bottom',c[5])
isC=lambda x:'c' in x[0][1:3]
show(lambda c:c[1]==0 and c[0]>0 and all('c' in a for a,b in c[4]) and not c[5],'top corners only')
show(lambda c:c[1]==0 and c[0]>0 and all('e' in a for a,b in c[4]) and not c[5],'top edges only')
show(lambda c:c[1]==0 and c[0]>0 and all('c' in a for a,b in c[4]+c[5]),'corners only (both layers)')
show(lambda c:c[1]==0 and c[0]>0 and all('e' in a for a,b in c[4]+c[5]),'edges only (both layers)')
show(lambda c:c[1]==1 and c[0]==0,'middle only')
print('distinct cube states',sum(1 for c in cands))
