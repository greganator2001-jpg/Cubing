// Web worker: random-state 3x3 scrambles (Kociemba two-phase via cubejs).
const Cube = require('cubejs');
require('cubejs/lib/solve');
Cube.initSolver();
self.postMessage({ type: 'ready' });
self.onmessage = (e) => {
  if (e.data && e.data.type === 'scramble') self.postMessage({ type: 'scramble', id: e.data.id, scramble: Cube.scramble() });
};
