import React from 'react';
import { Plaza, Lamp, Banner } from '../Bits';

// World 04 — TIANANMEN. A monumental red gate with arch openings and gold
// trim, a broad plaza, ornamental lamps and red banners. Strong red / gold.
export default function Tiananmen({ palette }) {
  const red = palette.landmark;       // #c8102e
  const gold = palette.accent;        // #e0b020
  const dark = '#7a0c1c';
  const arches = [-16, 0, 16];
  return (
    <group>
      <Plaza radius={52} color="#d9c7a3" y={0.05} />

      {/* Main gatehouse — thin along X so the camera passes beside it. */}
      <mesh position={[0, 9, 0]} castShadow>
        <boxGeometry args={[8, 18, 52]} />
        <meshStandardMaterial color={red} roughness={0.7} />
      </mesh>

      {/* Gold cornice + base trim */}
      <mesh position={[0, 18.2, 0]}>
        <boxGeometry args={[9, 1.2, 54]} />
        <meshStandardMaterial color={gold} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[9, 1.6, 54]} />
        <meshStandardMaterial color={gold} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Arch openings on the -X (camera-facing) face */}
      {arches.map((z, i) => (
        <group key={i} position={[-4.1, 0, z]}>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[1.4, 9, 6]} />
            <meshStandardMaterial color={dark} roughness={0.9} />
          </mesh>
          {/* gold arch frame */}
          <mesh position={[0.1, 9, 0]}>
            <boxGeometry args={[1.2, 0.8, 7]} />
            <meshStandardMaterial color={gold} metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Upper window band */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-4.1, 13.5, -21 + i * 7]}>
          <boxGeometry args={[1.2, 2.4, 3]} />
          <meshStandardMaterial color={dark} roughness={0.9} />
        </mesh>
      ))}

      {/* Central portrait panel with gold frame */}
      <mesh position={[-4.15, 11, 0]}>
        <boxGeometry args={[0.6, 7, 5.4]} />
        <meshStandardMaterial color="#caa64a" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-4.45, 11, 0]}>
        <boxGeometry args={[0.3, 6, 4.6]} />
        <meshStandardMaterial color={red} roughness={0.7} />
      </mesh>

      {/* End towers */}
      {[-26, 26].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          <mesh position={[0, 12, 0]} castShadow>
            <boxGeometry args={[10, 24, 10]} />
            <meshStandardMaterial color={red} roughness={0.7} />
          </mesh>
          <mesh position={[0, 24.6, 0]} castShadow>
            <boxGeometry args={[11, 1.4, 11]} />
            <meshStandardMaterial color={gold} metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Ornamental lamps flanking the plaza */}
      <Lamp position={[-6, 0, 20]} />
      <Lamp position={[-6, 0, -20]} />
      <Lamp position={[6, 0, 28]} />
      <Lamp position={[6, 0, -28]} />

      {/* Red banners */}
      <Banner position={[2, 0, 34]} color={red} height={16} />
      <Banner position={[2, 0, -34]} color={red} height={16} />
    </group>
  );
}
