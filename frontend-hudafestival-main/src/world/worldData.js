import * as THREE from 'three';

// Data-driven configuration for the four festival worlds.
// Each world is a stylized 3D landmark station the camera travels through.
// Colors are authored as hex and converted to THREE.Color at runtime so the
// sky / fog / light / ground can smoothly interpolate as the camera flies.

export const SPACING = 90;

export const WORLDS = [
  {
    id: 'bastille',
    index: '01',
    name: 'BASTILLE',
    city: 'PARIS',
    country: 'FRANCE',
    description: 'A fortress remembered through revolution and history.',
    // cool morning / soft blue
    palette: {
      skyTop: '#9ec7e8',
      skyBottom: '#e9f2f8',
      fog: '#c4d6e6',
      sun: '#fff4e0',
      ground: '#9bb08c',
      landmark: '#cdbf9e',
      accent: '#6f8fb0',
      light: 1.15,
      ambient: 0.55,
    },
  },
  {
    id: 'tahrir',
    index: '02',
    name: 'TAHRIR',
    city: 'CAIRO',
    country: 'EGYPT',
    description: 'A landmark square in the heart of modern Cairo.',
    // warm golden daylight
    palette: {
      skyTop: '#f2b66b',
      skyBottom: '#ffe7bd',
      fog: '#f1d6a4',
      sun: '#ffcf7a',
      ground: '#d8b67c',
      landmark: '#ecd8ad',
      accent: '#e08a3c',
      light: 1.3,
      ambient: 0.62,
    },
  },
  {
    id: 'syntagma',
    index: '03',
    name: 'SYNTAGMA',
    city: 'ATHENS',
    country: 'GREECE',
    description: 'The central square beside the Greek Parliament.',
    // Mediterranean afternoon
    palette: {
      skyTop: '#7fb4e0',
      skyBottom: '#dceef7',
      fog: '#cfe2ec',
      sun: '#fff1d6',
      ground: '#c8cea0',
      landmark: '#f1eee4',
      accent: '#5e9bc4',
      light: 1.2,
      ambient: 0.6,
    },
  },
  {
    id: 'tiananmen',
    index: '04',
    name: 'TIANANMEN',
    city: 'BEIJING',
    country: 'CHINA',
    description: 'An iconic civic landmark at the heart of Beijing.',
    // clear blue daylight, strong red / gold
    palette: {
      skyTop: '#3f8ad6',
      skyBottom: '#bfe0f5',
      fog: '#bcd6ea',
      sun: '#fff4cc',
      ground: '#cbb89a',
      landmark: '#c8102e',
      accent: '#e0b020',
      light: 1.25,
      ambient: 0.6,
    },
  },
];

// World station X positions along the travel path.
export const STATION_X = WORLDS.map((_, i) => i * SPACING);

// Camera travel curve bounds.
export const PATH_START_X = -28;
export const PATH_END_X = STATION_X[STATION_X.length - 1] + 28;

// Approximate progress (0..1) at which each station is "centered".
export const STATION_T = STATION_X.map(
  (x) => (x - PATH_START_X) / (PATH_END_X - PATH_START_X)
);

// Build the cinematic camera rail (Catmull-Rom spline with gentle weave).
export function buildPath() {
  const pts = [];
  pts.push(new THREE.Vector3(PATH_START_X, 6, 8));
  STATION_X.forEach((x, i) => {
    pts.push(
      new THREE.Vector3(
        x,
        5 + Math.sin(i * 0.9) * 0.8,
        Math.sin(i * 1.3) * 5
      )
    );
  });
  pts.push(new THREE.Vector3(PATH_END_X, 5.5, 2));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  return curve;
}

// Interpolate the full palette for a given world X position.
const _cA = new THREE.Color();
const _cB = new THREE.Color();
function lerpHex(out, a, b, t) {
  _cA.set(a);
  _cB.set(b);
  out.copy(_cA).lerp(_cB, t);
  return out;
}

const PALETTE_KEYS = [
  'skyTop',
  'skyBottom',
  'fog',
  'sun',
  'ground',
  'landmark',
  'accent',
];

export function paletteAt(worldX, target) {
  const xs = STATION_X;
  const out = target || {};
  let i = 0;
  if (worldX <= xs[0]) {
    i = 0;
    for (const k of PALETTE_KEYS) out[k] = out[k] || new THREE.Color();
    copyWorld(WORLDS[0].palette, out);
    out.light = WORLDS[0].palette.light;
    out.ambient = WORLDS[0].palette.ambient;
    return out;
  }
  if (worldX >= xs[xs.length - 1]) {
    const w = WORLDS[WORLDS.length - 1].palette;
    for (const k of PALETTE_KEYS) (out[k] = out[k] || new THREE.Color()).set(w[k]);
    out.light = w.light;
    out.ambient = w.ambient;
    return out;
  }
  for (let n = 0; n < xs.length - 1; n++) {
    if (worldX >= xs[n] && worldX < xs[n + 1]) {
      i = n;
      break;
    }
  }
  const t = (worldX - xs[i]) / (xs[i + 1] - xs[i]);
  const a = WORLDS[i].palette;
  const b = WORLDS[i + 1].palette;
  for (const k of PALETTE_KEYS) {
    out[k] = out[k] || new THREE.Color();
    lerpHex(out[k], a[k], b[k], t);
  }
  out.light = a.light + (b.light - a.light) * t;
  out.ambient = a.ambient + (b.ambient - a.ambient) * t;
  return out;
}

function copyWorld(src, out) {
  for (const k of PALETTE_KEYS) (out[k] = out[k] || new THREE.Color()).set(src[k]);
  out.light = src.light;
  out.ambient = src.ambient;
}

// Which station index is "current" for a given progress value.
export function stationIndexAt(progress) {
  let best = 0;
  let bestD = Infinity;
  STATION_T.forEach((t, i) => {
    const d = Math.abs(progress - t);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}
