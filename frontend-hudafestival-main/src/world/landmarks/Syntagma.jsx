import React from 'react';
import { Plaza, Tree } from '../Bits';

// World 03 — SYNTAGMA. A stylized Mediterranean civic square: a parliament
// building with a colonnade and pediment, large plaza, trees and city blocks.
export default function Syntagma({ palette }) {
  const stone = palette.landmark;
  const accent = palette.accent;
  const columns = 11;
  const span = 6;
  const startX = -((columns - 1) * span) / 2;
  return (
    <group>
      <Plaza radius={46} color={stone} y={0.05} />

      {/* Colonnade */}
      {Array.from({ length: columns }).map((_, i) => (
        <mesh key={i} position={[startX + i * span, 7, -6]} castShadow>
          <cylinderGeometry args={[1.1, 1.1, 14, 16]} />
          <meshStandardMaterial color={stone} roughness={0.85} />
        </mesh>
      ))}

      {/* Entablature */}
      <mesh position={[0, 15.2, -6]} castShadow>
        <boxGeometry args={[columns * span + 4, 2.4, 5]} />
        <meshStandardMaterial color={stone} roughness={0.85} />
      </mesh>

      {/* Pediment (triangular prism via 3-sided cylinder) */}
      <mesh position={[0, 18.4, -6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[3.2, 3.2, columns * span + 4, 3]} />
        <meshStandardMaterial color={stone} roughness={0.85} />
      </mesh>

      {/* Building body behind the colonnade */}
      <mesh position={[0, 8, -12]} castShadow>
        <boxGeometry args={[columns * span + 8, 16, 8]} />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>

      {/* Steps */}
      <mesh position={[0, 0.6, 2]}>
        <boxGeometry args={[columns * span + 8, 1.2, 8]} />
        <meshStandardMaterial color={stone} roughness={0.95} />
      </mesh>

      {/* Flag pole with accent flag */}
      <group position={[0, 0, 18]}>
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 20, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <mesh position={[1.4, 18, 0]}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial color={accent} side={2} roughness={0.8} />
        </mesh>
      </group>

      {/* Trees + city blocks */}
      {[
        [-30, 8],
        [30, 6],
        [-26, 24],
        [28, 26],
        [0, -34],
      ].map(([x, z], i) => (
        <Tree key={`t${i}`} position={[x, 0, z]} scale={1.15} />
      ))}
      {[
        [-40, -22, 12, 20],
        [40, -18, 14, 26],
        [-34, 30, 12, 16],
        [38, 32, 12, 22],
      ].map(([x, z, w, h], i) => (
        <mesh key={`b${i}`} position={[x, h / 2, z]} castShadow>
          <boxGeometry args={[w, h, 12]} />
          <meshStandardMaterial color={i % 2 ? '#e7e2d4' : '#d7d2c2'} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
