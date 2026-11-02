exec(open('t_sq6.py').read().split("import pickle")[0].replace("FW=fw_layers(S,3)","FW=fw_layers(S,3)").replace("def solve_target(targets,depthB=3):","def solve_target(targets,depthB=2):"))
def cyc(st,layer,names):
  top,bot,m=st;L=list(top if layer==0 else bot)
  idx=[[k for k in range(12) if L[k][0]==n] for n in names]
  vals=[[L[k] for k in ii] for ii in idx]
  for j in range(len(names)):
    for k,v in zip(idx[(j+1)%len(names)],vals[j]): L[k]=v
  return (tuple(L),bot,m) if layer==0 else (top,tuple(L),m)
for name,tg in [('top diagonal corner swap + bottom diag',cyc(cyc(S,0,['Uc0','Uc2']),1,['Dc0','Dc2'])),
                ('top corner 3-cycle',cyc(S,0,['Uc0','Uc1','Uc2'])),
                ('top edge 3-cycle',cyc(S,0,['Ue0','Ue1','Ue2'])),
                ('top diagonal corner swap only',cyc(S,0,['Uc0','Uc2']))]:
  import time;t=time.time();a=solve_target(with_tails(tg),2);print(name,'=>',a,round(time.time()-t,1),flush=True)
