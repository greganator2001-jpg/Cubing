# Builds the single-file web version (published as the artifact) from the same sources.
import sys
s=open('src-body.html').read()
s=s.replace('/*SCRW*/',open('tools/scramble-worker.bundle.js').read().strip()).replace('/*CUBE*/',open('src-cube.js').read()+open('src-nxn.js').read()+open('src-poly.js').read()).replace('/*F2L*/',open('src-f2l.json').read()).replace('/*GUIDES*/',open('src-guides.js').read()).replace('/*SPEED*/',open('src-speed.js').read()).replace('/*PLFONT*/',open('tools/helvetiker_bold.typeface.json').read())
open(sys.argv[1],'w').write(s)
