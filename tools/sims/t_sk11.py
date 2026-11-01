exec(open('t_sk4.py').read().split("r={}")[0])
allc=[i for k in C for i in C[k]]
Dj=center['D'][0];Fi=center['F'][0]
P=search(S,gens,lambda st: ok(st,allc) and ok(st,center['U']) and st[Dj]==Fi,10)
print('P',P)
st=S.apply(S.solved(),P);print([(T[st[j]][1],'->',T[j][1]) for f in 'DFBRL' for j in center[f] if st[j]!=j])
