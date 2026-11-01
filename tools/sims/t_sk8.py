exec(open('t_sk4.py').read().split("r={}")[0])
for a in ["R L' B' U B U' R' U","R L R L' R' B' L' B"]:
  st=S.apply(S.solved(),a); print(a,[(T[st[j]][1],'->',T[j][1]) for f in 'DFBRL' for j in center[f] if st[j]!=j], 'corners ok', all(tw(st,k) for k in C))
a="R B R B' U' L U";st=S.apply(S.solved(),a)
print(a,'centers',[(T[st[j]][1],'->',T[j][1]) for f in 'UDFBRL' for j in center[f] if st[j]!=j])
# twist direction: where does the D-sticker of DFL go
for k in ['DFL','DBR']:
  for j in C[k]:
    i=st[j]
    if T[i][2]=='D': print(k,'D sticker now on face',T[j][2])
