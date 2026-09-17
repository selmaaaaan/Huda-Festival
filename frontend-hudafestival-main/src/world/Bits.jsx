import React from 'react';
import * as THREE from 'three';

// Small reusable geometry pieces shared by the landmark worlds.

export function Plaza({ radius = 42, color = '#e7dcc2', y = 0.05 }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <circleGeometry args={[radius, 48]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

export function Tree({ position = [0, 0, 0], scale = 1, trunk = '#6b4f33', leaf = '#5b7d4b' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 4.8, 6]} />
        <meshStandardMaterial color={trunk} roughness={1} />
      </mesh>
      <mesh position={[0, 5.6, 0]} castShadow>
        <icosahedronGeometry args={[2.4, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.4, 4.6, 0.3]} castShadow>
        <icosahedronGeometry args={[1.6, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

export function Palm({ position = [0, 0, 0], scale = 1, trunk = '#8a6b3f' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 4, 0]} rotation={[0.1, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.28, 0.45, 8, 6]} />
        <meshStandardMaterial color={trunk} roughness={1} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.1, 8, Math.sin(a) * 1.1]}
            rotation={[0.5, -a, 0]}
            castShadow
          >
            <coneGeometry args={[0.5, 3.2, 4]} />
            <meshStandardMaterial color="#4f8f3a" roughness={0.9} flatShading />
          </mesh>
        );
      })}
      <mesh position={[0, 8.2, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#5aa043" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

export function Lamp({ position = [0, 0, 0], pole = '#3a3a3a', glow = '#ffd96b' }) {
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 6, 8]} />
        <meshStandardMaterial color={pole} roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 6.1, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 6.1, 0]} color={glow} intensity={6} distance={22} decay={2} />
    </group>
  );
}

export function Crenellations({
  width,
  depth,
  height,
  color,
  count = 6,
}) {
  const items = [];
  const step = width / count;
  for (let i = 0; i < count; i++) {
    items.push(
      <mesh key={`f${i}`} position={[-width / 2 + step * (i + 0.5), height, 0]} castShadow>
        <boxGeometry args={[step * 0.6, 1.4, depth]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    );
  }
  return <group>{items}</group>;
}

export function Banner({ position = [0, 0, 0], color = '#c8102e', height = 14 }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 2, 6]} />
        <meshStandardMaterial color="#caa84a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, height / 2 + 2, 0]}>
        <planeGeometry args={[2.2, height]} />
        <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
