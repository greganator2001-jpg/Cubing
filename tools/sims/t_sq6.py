from sq1 import *
import time
S=solved()
def moves_from(st):
  for a in range(12):
    s1=twist(st,a,0)
    for b in range(12):
      s2=twist(s1,0,b);s3=slash(s2)
      if s3 is not None: yield (a if a<=6 else a-12, b if b<=6 else b-12), s3
def fw_layers(start,depth):
  seen={start:''};fr=[start]
  for d in range(depth):
    nf=[]
    for st in fr:
      for (a,b),s3 in moves_from(st):
        if s3 not in seen: seen[s3]=seen[st]+('(%d,%d)/'%(a,b) if (a,b)!=(0,0) else '/');nf.append(s3)
    fr=nf
  return seen
t=time.time();FW=fw_layers(S,3);print('fw',len(FW),time.time()-t)
def inv_moves(st):
  # predecessor: st = slash(twist(p,a,b)) -> p = twist(slash(st),-a,-b)
  s1=slash(st)
  if s1 is None: return
  for a in range(12):
    for b in range(12):
      p=twist(s1,-a,-b)
      yield (a if a<=6 else a-12, b if b<=6 else b-12),p
def solve_target(targets,depthB=3):
  # targets: list of (state, trailing twist string)
  bw={};fr=[]
  for st,tail in targets:
    if st not in bw: bw[st]=tail;fr.append(st)
  for d in range(depthB+1):
    hits=[(FW[s]+bw[s]) for s in fr if s in FW]
    if hits: return min(hits,key=lambda x:x.count('/'))
    nf=[]
    for st in fr:
      for (a,b),p in inv_moves(st):
        if p not in bw: bw[p]=('(%d,%d)/'%(a,b) if (a,b)!=(0,0) else '/')+bw[st];nf.append(p)
    fr=nf
    print('  bw depth',d+1,len(bw))
  return None
def with_tails(tg):
  out=[]
  for x in range(12):
    for y in range(12):
      # alg = path + (x,y) final twist ; path ends at state twist(tg,-x,-y)
      out.append((twist(tg,-x,-y),'(%d,%d)'%(x if x<=6 else x-12,y if y<=6 else y-12) if (x,y)!=(0,0) else ''))
  return out
def swap(st,layer,p,q):
  top,bot,m=st;L=list(top if layer==0 else bot)
  i=[k for k in range(12) if L[k][0]==p];j=[k for k in range(12) if L[k][0]==q]
  for a,b in zip(i,j): L[a],L[b]=L[b],L[a]
  return (tuple(L),bot,m) if layer==0 else (top,tuple(L),m)
import pickle
res={}
for name,tg in [('top adjacent corner swap',swap(S,0,'Uc0','Uc1')),('top diagonal corner swap',swap(S,0,'Uc0','Uc2')),('top adjacent edge swap',swap(S,0,'Ue0','Ue1'))]:
  t=time.time();a=solve_target(with_tails(tg),3);print(name,'=>',a,round(time.time()-t,1));res[name]=a
