import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DistantCity } from './Environment';
import { Tree, Palm, Lamp } from './Bits';
import { travelState } from './paletteState';
import { STATION_X } from './worldData';

import Bastille from './landmarks/Bastille';
import Tahrir from './landmarks/Tahrir';
import Syntagma from './landmarks/Syntagma';
import Tiananmen from './landmarks/Tiananmen';

const LANDMARKS = {
  bastille: Bastille,
  tahrir: Tahrir,
  syntagma: Syntagma,
  tiananmen: Tiananmen,
};

const VISIBLE_RANGE = 125;

// Foreground parallax props placed at the path edge so they rush past the
// camera, reinforcing a sense of travel. Per-world flavour.
function Foreground({ id, x }) {
  if (id === 'bastille')
    return (
      <group>
        <Tree position={[x - 12, 0, 6]} scale={1.2} />
        <Tree position={[x + 16, 0, 5]} scale={1} />
      </group>
    );
  if (id === 'tahrir')
    return (
      <group>
        <Palm position={[x - 10, 0, 6]} scale={1.2} />
        <Palm position={[x + 18, 0, 5]} scale={1} />
        <Lamp position={[x + 4, 0, 7]} />
      </group>
    );
  if (id === 'syntagma')
    return (
      <group>
        <Tree position={[x - 14, 0, 6]} scale={1.1} />
        <Lamp position={[x + 6, 0, 7]} />
        <Tree position={[x + 20, 0, 5]} scale={1} />
      </group>
    );
  // tiananmen
  return (
    <group>
      <Lamp position={[x - 8, 0, 7]} />
      <Lamp position={[x + 10, 0, 7]} />
      <Tree position={[x + 22, 0, 5]} scale={0.9} />
    </group>
  );
}

export default function WorldStation({ world, index }) {
  const groupRef = useRef();
  const stationX = STATION_X[index];
  const Landmark = LANDMARKS[world.id];

  useFrame(() => {
    if (!groupRef.current) return;
    const d = Math.abs(travelState.camX - stationX);
    groupRef.current.visible = d < VISIBLE_RANGE;
  });

  return (
    <group ref={groupRef} position={[stationX, 0, -6]}>
      <Landmark palette={world.palette} />
      <DistantCity centerX={stationX} seed={index + 1} />
      <Foreground id={world.id} x={0} />
    </group>
  );
}
