# Last Layer Lab

3x3 speedcubing algorithm trainer for Windows: all 41 F2L cases, 2-look OLL and PLL, a 3D cube that animates each algorithm, a spacebar timer, self-tests and a scramble generator.

## Releasing an update
1. Bump `version` in `package.json`.
2. `npm run release` (needs `GH_TOKEN` with repo access). This builds the installer and uploads it to a GitHub release.
3. Installed copies pick it up on their next launch (or within 4 hours) and offer "Restart and update".
