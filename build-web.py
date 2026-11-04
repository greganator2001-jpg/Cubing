# Builds the single-file web version (published as the artifact) from the same sources.
import sys
s=open('src-body.html').read()
s=s.replace('/*SCRW*/',open('tools/scramble-worker.bundle.js').read().strip()).replace('/*CUBE*/',open('src-cube.js').read()+open('src-nxn.js').read()+open('src-poly.js').read()).replace('/*F2L*/',open('src-f2l.json').read()).replace('/*GUIDES*/',open('src-guides.js').read()).replace('/*SPEED*/',open('src-speed.js').read()).replace('/*SMART*/',open('src-smart.js').read()).replace('/*SYNC*/',open('src-sync.js').read()).replace('/*CROSS*/',open('src-cross.js').read()).replace('/*PLFONT*/',open('tools/helvetiker_bold.typeface.json').read())
gb=open('app/vendor/gan-bt.js').read().replace('</script','<\\/script')
s='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+s if not s.lstrip().startswith('<!doctype') else s
s=s.replace('<style>','<script>'+gb+'</script>\n<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Last Layer Lab"><meta name="apple-mobile-web-app-status-bar-style" content="black"><meta name="theme-color" content="#0B0C0F"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="data:image/png;base64,'+open('tools/touch-icon.b64').read()+'">\n<style>',1)
open(sys.argv[1],'w').write(s)
