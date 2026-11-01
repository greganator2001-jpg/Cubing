import sq1
from sq1 import *
def mk(pt,pb):
  def layer(name,pat):
    L=[];k={'e':0,'c':0}
    i=0
    while len(L)<12:
      ch=pat[i%3]
      if ch=='e': L.append((name+'e%d'%k['e'],0));k['e']+=1;i+=1
      else: L.append((name+'c%d'%k['c'],0));L.append((name+'c%d'%k['c'],1));k['c']+=1;i+=2
    return tuple(L)
  return (layer('U',pt),layer('D',pb),0)
algs={'parity':"/(3,3)/(1,0)/(-2,-2)/(2,0)/(2,2)/(-1,0)/(-3,-3)/(-2,0)/(3,3)/(3,0)/(-1,-1)/(-3,0)/(1,1)/(-4,-3)",
 'EP':"/(-3,0)/(0,3)/(0,-3)/(0,3)/(2,0)/(0,2)/(-2,0)/(4,0)/(0,-2)/(0,2)/(-1,4)/(0,-3)/(0,3)",'cp':"/(3,-3)/(3,0)/(-3,0)/(0,3)/(-3,0)/",'mid':"/(6,0)/(6,0)/"}
for pt in ['ecc','cce']:
  for pb in ['ecc','cce']:
    S=mk(pt,pb);res={}
    for n,a in algs.items():
      try:
        st=apply(S,a);best=None
        for x in range(12):
          for y in range(12):
            s2=twist(st,x,y);dt=sorted(set((S[0][i][0],s2[0][i][0]) for i in range(12) if s2[0][i]!=S[0][i]));db=sorted(set((S[1][i][0],s2[1][i][0]) for i in range(12) if s2[1][i]!=S[1][i]))
            sc=len(dt)+len(db)
            if best is None or sc<best[0]: best=(sc,x,y,dt,db,s2[2])
        res[n]=best
      except Exception as e: res[n]='ERR'
    print(pt,pb);[print('   ',k,v) for k,v in res.items()]
