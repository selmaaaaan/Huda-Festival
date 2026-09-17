import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { WORLDS, PATH_START_X } from './worldData';
import { livePalette } from './paletteState';
import { Sky, Sun, Ground, Clouds, Particles } from './Environment';
import WorldStation from './WorldStation';
import Rig from './Rig';

function FogController() {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.color.copy(livePalette.fog);
  });
  return <fogExp2 ref={ref} attach="fog" args={['#c4d6e6', 0.0115]} />;
}

function Effects({ quality }) {
  if (quality === 'low') {
    return (
      <EffectComposer>
        <Vignette offset={0.3} darkness={0.55} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0006, 0.0006)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette offset={0.32} darkness={0.62} />
      <Noise premultiply opacity={0.045} />
    </EffectComposer>
  );
}

export default function WorldCanvas({ controls, quality = 'high', frameloop = 'always' }) {
  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, quality === 'low' ? 1 : 1.8]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 55, near: 0.1, far: 2000, position: [PATH_START_X, 6, 8] }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <FogController />
      <Sky quality={quality} />
      <Sun />
      <Ground />
      <Clouds quality={quality} />
      <Particles quality={quality} />

      {WORLDS.map((w, i) => (
        <WorldStation key={w.id} world={w} index={i} />
      ))}

      <Rig controls={controls} />
      <Effects quality={quality} />
    </Canvas>
  );
}
