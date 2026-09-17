import React from 'react';
import { Plaza, Palm } from '../Bits';

// World 02 — TAHRIR. A stylized Cairo civic square: central obelisk on a
// plinth, large circular plaza, palms and surrounding urban blocks.
export default function Tahrir({ palette }) {
  const stone = palette.landmark;
  const accent = palette.accent;
  return (
    <group>
      <Plaza radius={44} color={stone} y={0.05} />

      {/* Plinth */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[14, 2.4, 14]} />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>

      {/* Obelisk */}
      <mesh position={[0, 18, 0]} castShadow>
        <cylinderGeometry args={[1.1, 2.2, 32, 4]} />
        <meshStandardMaterial color={stone} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 35.5, 0]} castShadow>
        <coneGeometry args={[1.4, 4, 4]} />
        <meshStandardMaterial color={accent} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Surrounding urban blocks */}
      {[
        [-34, -20, 10, 16, 10],
        [36, -16, 12, 22, 12],
        [-30, 26, 14, 18, 12],
        [32, 28, 10, 14, 10],
        [0, -40, 18, 12, 14],
      ].map(([x, z, w, h, d], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={i % 2 ? '#d9c79c' : '#cdb98a'} roughness={1} />
        </mesh>
      ))}

      {/* Palms framing the plaza */}
      {[
        [-22, -10],
        [22, -10],
        [-22, 12],
        [22, 12],
        [-16, 22],
        [16, 22],
      ].map(([x, z], i) => (
        <Palm key={i} position={[x, 0, z]} scale={1.1} />
      ))}
    </group>
  );
}
