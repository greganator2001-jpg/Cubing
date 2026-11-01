exec(open('t_dino.py').read().replace("corner_turner('dino'","corner_turner('redi'").split("edges={}")[0])
pieces={}
for i,t in enumerate(T): pieces.setdefault((t[0],t[1]),[]).append(i)
def nm(m):
  x,y,z=m; return ''.join(s for s,c in [('U',y>0),('D',y<0),('F',z>0),('B',z<0),('R',x>0),('L',x<0)] if c)
topE=[i for (k,m),v in pieces.items() if k=='edge' and m[1]>0 for i in v]
rest=[i for i in range(Dn.n) if i not in topE]
G=[c+s for c in ['UFR','UFL','UBR','UBL'] for s in ['',"'"]]
ok=lambda st,ids: all(st[i]==i for i in ids)
a=search(Dn,G,lambda st: ok(st,rest) and sum(st[i]!=i for i in topE)==6,10)
print('redi top 3-cycle',a)
st=Dn.apply(Dn.solved(),a);print(sorted({(nm(T[st[j]][1]),'->',nm(T[j][1])) for j in topE if st[j]!=j}))
