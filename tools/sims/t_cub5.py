exec(open('t_cub3.py').read().split("D=mk")[0])
def piecename(X,i,dims):
  x,y,z=X[i];hx,hy,hz=[d/2 for d in dims]
  s=''
  if y>=hy-.5 and dims[1]>1: s+='U'
  if y<=-hy+.5 and dims[1]>1: s+='D'
  if z>=hz-.5: s+='F'
  if z<=-hz+.5: s+='B'
  if x>=hx-.5: s+='R'
  if x<=-hx+.5: s+='L'
  return s
def moves(dims,a,u=''):
  P=mk(dims);st=P.apply(P.solved(),a+(' '+u if u else ''));X=P.P
  return sorted({(piecename(X,st[j],dims),'->',piecename(X,j,dims)) for j in range(P.n) if st[j]!=j})
print('floppy R L F R L B',moves((3,1,3),'R L F R L B'))
print('domino U2 R2 U2 R2 U2 R2',moves((3,2,3),'U2 R2 U2 R2 U2 R2'))
print('tower R2 U2 R2 U2 R2 U2',moves((2,3,2),'R2 U2 R2 U2 R2 U2'))
print('tower top',moves((2,3,2),"R2 U2 F2 U R2 U2 F2 U' R2 U2 F2"))
