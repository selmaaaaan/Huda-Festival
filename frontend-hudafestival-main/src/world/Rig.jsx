import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { buildPath, paletteAt, PATH_START_X, PATH_END_X } from './worldData';
import { livePalette, travelState } from './paletteState';

const SPEED = 0.1;        // progress units / second at full steer
const MAX_PITCH = 0.16;   // radians
const BOOST_SPEED = 0.12; // entry push

// The cinematic camera rail + colour director.
// Reads the shared `controls` ref (pointer / boost state) and drives the
// camera, the live palette, the lights and the travel-state singleton.
export default function Rig({ controls }) {
  const { camera } = useThree();
  const curve = useMemo(() => buildPath(), []);
  const velRef = useRef(0);
  const pitchRef = useRef(0);
  const ambRef = useRef();
  const dirRef = useRef();
  const hemiRef = useRef();
  const _pos = useMemo(() => new THREE.Vector3(), []);
  const _tgt = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const c = controls.current;
    const d = Math.min(dt, 0.05);

    // --- progress integration -------------------------------------------
    if (c.active) {
      const desiredVel = c.nx * SPEED;
      velRef.current = THREE.MathUtils.lerp(velRef.current, desiredVel, d * 3);
      travelState.progress += velRef.current * d;
    }
    if (c.boost > 0) {
      travelState.progress += BOOST_SPEED * d;
      c.boost -= d;
    }
    // wheel / drag nudges
    if (c.wheelDelta) {
      travelState.progress += c.wheelDelta;
      c.wheelDelta = 0;
    }
    travelState.progress = THREE.MathUtils.clamp(travelState.progress, 0, 1);

    // intro dim eases toward bright once exploring
    const dimTarget = c.active ? 0 : 1;
    travelState.introDim = THREE.MathUtils.lerp(travelState.introDim, dimTarget, d * 2.2);

    // pitch (mouse Y) smoothing
    const pitchTarget = c.active ? -c.ny * MAX_PITCH : 0;
    pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, pitchTarget, d * 2.5);

    // --- camera placement ------------------------------------------------
    const p = travelState.progress;
    curve.getPointAt(p, _pos);
    _pos.y += Math.sin(state.clock.elapsedTime * 0.6) * 0.35;
    _pos.z += Math.sin(state.clock.elapsedTime * 0.4) * 0.5;
    camera.position.copy(_pos);
    travelState.camX = _pos.x;

    _tgt.set(_pos.x + 12, _pos.y + pitchRef.current * 9 - 0.5, -6);
    camera.lookAt(_tgt);

    // --- palette + lights ------------------------------------------------
    paletteAt(_pos.x, livePalette);
    const dim = 1 - 0.7 * travelState.introDim;
    if (ambRef.current) ambRef.current.intensity = livePalette.ambient * dim;
    if (hemiRef.current) hemiRef.current.intensity = 0.6 * dim;
    if (dirRef.current) {
      dirRef.current.intensity = livePalette.light * dim;
      dirRef.current.color.copy(livePalette.sun);
    }

    // --- throttled HUD update -------------------------------------------
    if (c.onHud) {
      c._acc = (c._acc || 0) + d;
      if (c._acc > 0.08) {
        c._acc = 0;
        c.onHud(travelState.progress, _pos.x);
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={livePalette.ambient} />
      <hemisphereLight ref={hemiRef} color="#ffffff" groundColor="#888888" intensity={0.6} />
      <directionalLight
        ref={dirRef}
        position={[60, 90, 40]}
        intensity={livePalette.light}
        color={livePalette.sun}
      />
    </>
  );
}
