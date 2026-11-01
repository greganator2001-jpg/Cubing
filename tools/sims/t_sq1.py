from sq1 import *
S=solved()
def show(st):
  top,bot,mid=st;return ' '.join(p for i,p in pieces(top)),'|',' '.join(p for i,p in pieces(bot)),'mid',mid
st=apply(S,"/ (6,0) / (6,0) /");print('middle flip:',show(st), 'same pieces?', st[0]==S[0] and st[1]==S[1])
st=apply(S,"/ (3,0) / (-3,0)");print('trade:',show(st),'cube',is_cube(st))
st=apply(S,"/ (3,0) / (-3,0) /");print('trade+/:',show(st),'cube',is_cube(st))
