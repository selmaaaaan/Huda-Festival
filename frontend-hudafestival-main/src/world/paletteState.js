import * as THREE from 'three';
import { PATH_START_X } from './worldData';

// Mutable, frame-updated state shared between the camera director and the
// environment. Kept outside React so high-frequency updates never trigger
// re-renders.

export const livePalette = {
  skyTop: new THREE.Color('#9ec7e8'),
  skyBottom: new THREE.Color('#e9f2f8'),
  fog: new THREE.Color('#c4d6e6'),
  sun: new THREE.Color('#fff4e0'),
  ground: new THREE.Color('#9bb08c'),
  landmark: new THREE.Color('#cdbf9e'),
  accent: new THREE.Color('#6f8fb0'),
  light: 1.15,
  ambient: 0.55,
};

export const travelState = {
  progress: 0,            // 0..1 along the camera rail
  camX: PATH_START_X,     // current world X of the camera
  boosting: 0,            // 0..1 one-shot forward push (logo entry)
  active: false,          // true once the user is exploring
  introDim: 1,            // 1 = world dimmed behind the logo, 0 = full bright
};
