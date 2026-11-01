exec(open('t_cub3.py').read().split("D=mk")[0])
ok=lambda st,ids: all(st[i]==i for i in ids)
def findtop(dims,name,depth):
  P=mk(dims);X=P.P;maxy=dims[1]/2
  topL=[i for i in range(P.n) if X[i,1]>maxy-1+1e-6];rest=[i for i in range(P.n) if i not in topL]
  isC=lambda i:(abs(X[i,0])>=dims[0]/2-.5) and (abs(X[i,2])>=dims[2]/2-.5)
  tc=[i for i in topL if isC(i)];te=[i for i in topL if not isC(i) and not(abs(X[i,0])<.1 and abs(X[i,2])<.1)]
  Upows=[P.moves['U'],P.moves['U2'],P.moves["U'"]]
  def goal(st):
    if not ok(st,rest) or not ok(st,te): return False
    if ok(st,tc): return False
    for p in Upows:
      s2=st[p]
      if ok(s2,tc) and (not te or ok(s2,te)): return False
    return True
  a=search(P,['U',"U'",'U2','R2','F2'],goal,depth);print(name,a)
  return P,a
findtop((2,3,2),'tower top-corner alg',13)
