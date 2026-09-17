import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { livePalette } from './paletteState';
import { softCircleTexture, cloudTexture, sunTexture } from './textures';

// ---------------------------------------------------------------------------
// Sky dome — gradient shader sphere, colors driven by the live palette.
// ---------------------------------------------------------------------------
const skyVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
    float f = max(pow(max(h, 0.0), exponent), 0.0);
    gl_FragColor = vec4(mix(bottomColor, topColor, f), 1.0);
  }
`;

export function Sky({ quality }) {
  const matRef = useRef();
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color('#9ec7e8') },
      bottomColor: { value: new THREE.Color('#e9f2f8') },
      offset: { value: 80 },
      exponent: { value: 0.7 },
    }),
    []
  );

  useFrame(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.topColor.value.copy(livePalette.skyTop);
    matRef.current.uniforms.bottomColor.value.copy(livePalette.skyBottom);
  });

  return (
    <mesh scale={[1, 1, 1]} frustumCulled={false}>
      <sphereGeometry args={[900, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Sun — additive billboard far down the travel axis, tinted by the palette.
// ---------------------------------------------------------------------------
export function Sun() {
  const ref = useRef();
  const tex = useMemo(() => sunTexture(), []);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    // Sit far ahead of the camera, high up.
    ref.current.position.set(camera.position.x + 260, 120, -40);
    ref.current.quaternion.copy(camera.quaternion);
    ref.current.material.color.copy(livePalette.sun);
  });
  return (
    <sprite ref={ref} scale={[260, 260, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.9}
      />
    </sprite>
  );
}

// ---------------------------------------------------------------------------
// Ground — single large plane, color driven by the live palette.
// ---------------------------------------------------------------------------
export function Ground() {
  const matRef = useRef();
  useFrame(() => {
    if (matRef.current) matRef.current.color.copy(livePalette.ground);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000, 1, 1]} />
      <meshStandardMaterial ref={matRef} color="#9bb08c" roughness={1} metalness={0} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Distant city — a ring of dark silhouette blocks around a station center.
// ---------------------------------------------------------------------------
export function DistantCity({ centerX = 0, seed = 1 }) {
  const ref = useRef();
  const data = useMemo(() => {
    const rng = mulberry32(seed * 9871 + 13);
    const items = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + rng() * 0.2;
      const radius = 95 + rng() * 70;
      const x = centerX + Math.cos(ang) * radius;
      const z = Math.sin(ang) * radius - 10;
      // Keep the near (camera-side) band clearer so landmarks read.
      const h = 8 + rng() * 38;
      const w = 6 + rng() * 10;
      const d = 6 + rng() * 10;
      items.push({ x, z, h, w, d });
    }
    return items;
  }, [centerX, seed]);

  useFrame(() => {
    if (ref.current) ref.current.material.color.copy(livePalette.fog).multiplyScalar(0.6);
  });

  return (
    <instancedMesh
      ref={(m) => {
        if (!m) return;
        ref.current = m;
        const dummy = new THREE.Object3D();
        data.forEach((it, i) => {
          dummy.position.set(it.x, it.h / 2, it.z);
          dummy.scale.set(it.w, it.h, it.d);
          dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
      }}
      args={[null, null, data.length]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8090a0" roughness={1} metalness={0} />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Clouds — drifting soft billboards, gentle parallax.
// ---------------------------------------------------------------------------
export function Clouds({ quality = 'high' }) {
  const ref = useRef();
  const count = quality === 'low' ? 10 : 22;
  const tex = useMemo(() => cloudTexture(), []);
  const data = useMemo(() => {
    const rng = mulberry32(77);
    return Array.from({ length: count }, () => ({
      x: (rng() - 0.5) * 600,
      y: 70 + rng() * 90,
      z: -60 + rng() * 160,
      s: 60 + rng() * 90,
      spd: 1.5 + rng() * 2.5,
    }));
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      const d = data[i];
      c.position.x += d.spd * dt;
      if (c.position.x > 360) c.position.x = -360;
    });
  });

  return (
    <group ref={ref}>
      {data.map((d, i) => (
        <sprite key={i} position={[d.x, d.y, d.z]} scale={[d.s, d.s * 0.55, 1]}>
          <spriteMaterial
            map={tex}
            transparent
            opacity={0.85}
            depthWrite={false}
            color="#ffffff"
          />
        </sprite>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Atmospheric particles — drifting motes / leaves for depth.
// ---------------------------------------------------------------------------
export function Particles({ quality = 'high' }) {
  const ref = useRef();
  const count = quality === 'low' ? 350 : 1200;
  const tex = useMemo(() => softCircleTexture(), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const rng = mulberry32(1234);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() - 0.5) * 700;
      pos[i * 3 + 1] = rng() * 90;
      pos[i * 3 + 2] = (rng() - 0.5) * 260;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x += dt * 2;
    if (ref.current.position.x > 350) ref.current.position.x = -350;
    ref.current.material.color.copy(livePalette.accent);
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={tex}
        size={1.4}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ffffff"
      />
    </points>
  );
}

// Small deterministic PRNG so layouts are stable across renders.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
