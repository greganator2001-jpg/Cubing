exec(open('t_sk9.py').read().split("# generate states")[0])
exec(open('t_sk9.py').read().split("# generate states")[1].split("print('center states'")[0])
from rules import synthesize
S.moves["y'"]=S.moves['y'][S.moves['y']][S.moves['y']]
acts=[]
for r,(pre,post) in enumerate([('',''),('y ',"y' "),('y2 ','y2 '),("y' ",'y ')]):
  for lab,a in [('A',A3),('X',X)]:
    acts.append((f'{lab}@{r}',(pre+a+' '+post).strip()))
def feat(st):
  w=wrong(st);cyc=[]
  # describe where each wrong center's colour actually belongs
  return tuple(sorted((f,colorAt(st,f)) for f in w))
rules,dist,un=synthesize(S,list(seen.values()),acts,cstate,lambda s:frozenset(wrong(s)),lambda s:not wrong(s))
print('unreached',len(un),'max dist',max(dist.values()))
for k,v in sorted(rules.items(),key=lambda x:(len(x[0]),sorted(x[0]))): print(sorted(k),v)
