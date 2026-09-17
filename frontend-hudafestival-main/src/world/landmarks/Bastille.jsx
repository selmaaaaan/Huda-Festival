import React from 'react';
import { Crenellations } from '../Bits';

// World 01 — BASTILLE. A stylized stone fortress: central keep, corner
// towers, fortified walls and a moat. Cool blue / cream / muted stone.
export default function Bastille({ palette }) {
  const stone = palette.landmark;
  const roof = palette.accent;
  const tower = 30;
  const corners = [
    [-10, -10],
    [10, -10],
    [-10, 10],
    [10, 10],
  ];
  return (
    <group>
      {/* Moat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[26, 34, 48]} />
        <meshStandardMaterial color="#5b7fa6" roughness={0.3} metalness={0.1} transparent opacity={0.85} />
      </mesh>

      {/* Fortified walls connecting corners (low, with crenellations) */}
      <mesh position={[0, 7, -10]} castShadow>
        <boxGeometry args={[28, 14, 2.5]} />
        <meshStandardMaterial color={stone} roughness={0.95} />
      </mesh>
      <mesh position={[0, 7, 10]} castShadow>
        <boxGeometry args={[28, 14, 2.5]} />
        <meshStandardMaterial color={stone} roughness={0.95} />
      </mesh>
      <mesh position={[-10, 7, 0]} castShadow>
        <boxGeometry args={[2.5, 14, 28]} />
        <meshStandardMaterial color={stone} roughness={0.95} />
      </mesh>
      <mesh position={[10, 7, 0]} castShadow>
        <boxGeometry args={[2.5, 14, 28]} />
        <meshStandardMaterial color={stone} roughness={0.95} />
      </mesh>
      <Crenellations width={28} depth={2.5} height={14.7} color={stone} count={9} />
      <group position={[0, 0, 10]}>
        <Crenellations width={28} depth={2.5} height={14.7} color={stone} count={9} />
      </group>
      <group position={[-10, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Crenellations width={28} depth={2.5} height={14.7} color={stone} count={9} />
      </group>
      <group position={[10, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Crenellations width={28} depth={2.5} height={14.7} color={stone} count={9} />
      </group>

      {/* Corner towers */}
      {corners.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, tower / 2, 0]} castShadow>
            <cylinderGeometry args={[3.6, 4, tower, 12]} />
            <meshStandardMaterial color={stone} roughness={0.95} />
          </mesh>
          <mesh position={[0, tower + 2.4, 0]} castShadow>
            <coneGeometry args={[4.6, 5, 12]} />
            <meshStandardMaterial color={roof} roughness={0.8} />
          </mesh>
          <Crenellations width={7} depth={7} height={tower + 0.2} color={stone} count={4} />
        </group>
      ))}

      {/* Central keep */}
      <mesh position={[0, 11, 0]} castShadow>
        <boxGeometry args={[12, 22, 12]} />
        <meshStandardMaterial color={stone} roughness={0.95} />
      </mesh>
      <mesh position={[0, 22.6, 0]} castShadow>
        <coneGeometry args={[9, 5, 4]} />
        <meshStandardMaterial color={roof} roughness={0.8} />
      </mesh>
      <Crenellations width={12} depth={12} height={22.4} color={stone} count={5} />
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Crenellations width={12} depth={12} height={22.4} color={stone} count={5} />
      </group>

      {/* Gate detail */}
      <mesh position={[0, 3, 11.4]}>
        <boxGeometry args={[5, 6, 0.6]} />
        <meshStandardMaterial color={roof} roughness={0.8} />
      </mesh>
    </group>
  );
}
