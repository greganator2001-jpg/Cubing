exec(open('t_sk4.py').read().split("r={}")[0])
B4=['DFR','DFL','DBR','DBL']
res=search(S,gens,lambda st: ok(st,Ulay) and not all(tw(st,k) for k in B4),11)
print(res)
if res:
  st=S.apply(S.solved(),res);print({k:(pos(st,k),tw(st,k)) for k in B4}, 'centers moved',sum(st[i]!=i for i in cents))
