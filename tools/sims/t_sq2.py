from sq1 import *
import collections,time
S=solved()
T=[(a,b) for a in (0,3,6,-3) for b in (0,3,6,-3)]
def nbrs(st):
  for a,b in T:
    s2=twist(st,a,b);s3=slash(s2)
    if s3 is not None: yield (a,b),s3
t=time.time()
seen={S:''};q=collections.deque([S])
while q and len(seen)<3000000:
  st=q.popleft()
  for (a,b),s3 in nbrs(st):
    if s3 not in seen:
      seen[s3]=seen[st]+('(%d,%d)/'%(a,b) if (a,b)!=(0,0) else '/');q.append(s3)
print(len(seen),time.time()-t)
cube=[s for s in seen if is_cube(s)];print('cube states',len(cube))
import pickle;pickle.dump(seen,open('/tmp/sq1bfs.pkl','wb'))
