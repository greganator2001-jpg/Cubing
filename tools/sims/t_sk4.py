exec(open('t_skewb.py').read().split("gens=")[0])
def name(c):
  x,y,z=c;return ('U' if y>0 else 'D')+('F' if z>0 else 'B')+('R' if x>0 else 'L')
C={name(c):ids for c,ids in corner.items()}
Ulay=center['U']+[i for k in ['UFR','UFL','UBR','UBL'] for i in C[k]]
cents=[i for f in 'DFBRL' for i in center[f]]
gens=['R',"R'",'L',"L'",'U',"U'",'B',"B'"]
tw=lambda st,k: all(st[i]==i for i in C[k])
pos=lambda st,k: set(st[i] for i in C[k])==set(C[k])
r={}
r['twist DFR+DFL']=search(S,gens,lambda st: ok(st,Ulay) and all(pos(st,k) for k in ['DFR','DFL','DBR','DBL']) and not tw(st,'DFR') and not tw(st,'DFL') and tw(st,'DBR') and tw(st,'DBL'),9)
r['twist DFR+DBR']=search(S,gens,lambda st: ok(st,Ulay) and all(pos(st,k) for k in ['DFR','DFL','DBR','DBL']) and not tw(st,'DFR') and not tw(st,'DBR') and tw(st,'DFL') and tw(st,'DBL'),9)
allc=[i for k in C for i in C[k]]
r['center 3cycle']=search(S,gens,lambda st: ok(st,allc) and ok(st,center['U']) and sum(st[i]!=i for i in cents)==3,10)
r['center 2x2swap']=search(S,gens,lambda st: ok(st,allc) and ok(st,center['U']) and sum(st[i]!=i for i in cents)==4,10)
for k,v in r.items(): print(k,'=>',v)
