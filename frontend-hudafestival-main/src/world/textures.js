import * as THREE from 'three';

// Procedurally generated textures so the experience needs zero external assets.
// Everything is drawn to an offscreen canvas and uploaded as a THREE.Texture.

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

let _soft;
export function softCircleTexture() {
  if (_soft) return _soft;
  const c = canvas(128);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _soft = t;
  return t;
}

let _cloud;
export function cloudTexture() {
  if (_cloud) return _cloud;
  const c = canvas(256);
  const ctx = c.getContext('2d');
  // Several overlapping soft blobs to make a puffy cloud.
  const blobs = [
    [128, 140, 70],
    [90, 150, 55],
    [170, 150, 55],
    [128, 110, 50],
    [110, 120, 45],
    [150, 120, 45],
  ];
  for (const [x, y, r] of blobs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.4)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _cloud = t;
  return t;
}

let _sun;
export function sunTexture() {
  if (_sun) return _sun;
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,250,235,0.95)');
  g.addColorStop(0.45, 'rgba(255,240,200,0.35)');
  g.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _sun = t;
  return t;
}

let _leaf;
export function leafTexture() {
  if (_leaf) return _leaf;
  const c = canvas(64);
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.beginPath();
  ctx.ellipse(32, 32, 14, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _leaf = t;
  return t;
}
