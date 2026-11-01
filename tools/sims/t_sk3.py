exec(open('t_skewb.py').read().split("gens=")[0])
def name(c):
  x,y,z=c;return ('U' if y>0 else 'D')+('F' if z>0 else 'B')+('R' if x>0 else 'L')
C={name(c):ids for c,ids in corner.items()}
D=center['D']+[i for k in ['DFR','DFL','DBR','DBL'] for i in C[k]]
cents=[i for f in 'UFBRL' for i in center[f]]
gens=['R',"R'",'L',"L'",'U',"U'",'B',"B'"]
def pos_ok(st,k):  # piece k in place (any twist)
  ids=C[k];return set(st[i] for i in ids)==set(ids)
def tw(st,k): return all(st[i]==i for i in C[k])
res={}
res['swap UFL-UBR (corners only, centers ignored)']=search(S,gens,lambda st:ok(st,D) and not pos_ok(st,'UFL') and all(st[i] in C['UBR'] for i in C['UFL']) and tw(st,'UBL') and tw(st,'UFR'),8)
res['twist UBL only (centers ignored)']=search(S,gens,lambda st:ok(st,D) and tw(st,'UFL') and tw(st,'UBR') and pos_ok(st,'UBL') and not tw(st,'UBL'),8)
res['twist UFL+UBR in place (centers ignored)']=search(S,gens,lambda st:ok(st,D) and pos_ok(st,'UFL') and pos_ok(st,'UBR') and not tw(st,'UFL') and tw(st,'UBL'),8)
res['centers 3-cycle']=search(S,gens,lambda st:ok(st,D) and all(tw(st,k) for k in ['UFL','UBR','UBL']) and sum(st[i]!=i for i in cents)==3,9)
res['centers 2 swaps']=search(S,gens,lambda st:ok(st,D) and all(tw(st,k) for k in ['UFL','UBR','UBL']) and sum(st[i]!=i for i in cents)==4,10)
for k,v in res.items():print(k,'=>',v)
