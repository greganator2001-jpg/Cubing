# The Cube Timer

(formerly Last Layer Lab)

Speedcubing trainer for Windows, 2x2 through 9x9.

- **Cases:** F2L (41), 2-look OLL (10), full OLL (57), PLL (21), 2x2 CLL (42), 4x4/5x5/6x6 parity, 6x6/7x7/9x9 center commutators. Every alg is verified on a virtual cube.
- **Drill:** 3D cube that animates each alg, setup scrambles, timer, smart review (spaced repetition), left-hand mirror mode, alternate algs and notes per case.
- **Timer:** random-state 3x3 scrambles (two-phase solver in a worker), random-move for other cubes, inspection with 8s/12s calls, step splits, ao5/ao12/ao50, PB celebration.
- **Progress:** session charts, PB history, daily drill trend, slowest cases, review status. Backup/restore and csTimer export/import.

## Building
`python3 assemble.py` builds `app/index.html` from `src-body.html`, `src-cube.js`, `src-nxn.js`, `src-f2l.json` and the bundled scramble worker (`tools/`). `npm run dist` builds the installer.

## Releasing an update
1. Bump `version` in `package.json` and push.
2. On GitHub, open **Actions → Release → Run workflow**. It builds the installer on Windows and publishes it as a release.
3. Installed copies pick it up on their next launch (or within 4 hours) and offer "Restart and update".
