import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 01 MOUNTAIN CIRCUIT ENVIRONMENT
// Lush pine forests, towering mountain peaks, stone viaduct bridge, waterfall, yellow-striped road
export const MountainEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const treesGroupRef = useRef();
  const waterfallSprayRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 22;
    }

    // Moving roadside pine trees loop
    if (treesGroupRef.current) {
      treesGroupRef.current.position.z = (treesGroupRef.current.position.z + moveStep * 0.7) % 70;
    }

    // Shimmering waterfall
    if (waterfallSprayRef.current) {
      waterfallSprayRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 8) * 0.4;
    }
  });

  // Road Dashed & Solid Lines Texture (Mountain double yellow center line + white shoulders)
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#17202a';
    ctx.fillRect(0, 0, 256, 512);

    // Double yellow center line
    ctx.fillStyle = '#facc15';
    ctx.fillRect(124, 0, 3, 512);
    ctx.fillRect(129, 0, 3, 512);

    // White outer shoulder lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 0, 4, 512);
    ctx.fillRect(236, 0, 4, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }, []);

  return (
    <group>
      {/* 1. Mountain Asphalt Road Surface */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 260]} />
        <meshStandardMaterial color="#161f28" roughness={0.82} metalness={0.2} />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 260]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.9} />
      </mesh>

      {/* 2. Metal Guardrails with Yellow Reflectors */}
      <mesh position={[-8.2, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.7, 260]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[8.2, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.7, 260]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 3. Mountain Viaduct Stone Arch Bridge spanning overhead at distance */}
      <group position={[0, 9, 135]}>
        {/* Main upper deck */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[65, 3.5, 9]} />
          <meshStandardMaterial color="#334155" roughness={0.92} />
        </mesh>
        {/* 3 Massive Arch Openings */}
        {[-22, 0, 22].map((xArch, i) => (
          <group key={i} position={[xArch, 0, 0]}>
            <mesh position={[-6, -4, 0]}>
              <boxGeometry args={[2.5, 9, 7]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[6, -4, 0]}>
              <boxGeometry args={[2.5, 9, 7]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[10, 2.5, 6.8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Right Side: Mountain Waterfall & River Canyon */}
      <group position={[34, 14, 85]}>
        {/* Rocky Cliff Wall */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[18, 38, 55]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        {/* Cascading Blue Waterfall Stream */}
        <mesh position={[-8.5, 0, 0]}>
          <planeGeometry args={[5, 36]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Waterfall White Foaming Water Spray at Base */}
        <mesh ref={waterfallSprayRef} position={[-8.2, 8, 0]}>
          <boxGeometry args={[6, 3, 4]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.75} roughness={0.1} />
        </mesh>
        <pointLight position={[-7, 10, 0]} intensity={2.5} distance={30} color="#7dd3fc" />
      </group>

      {/* 5. Left Side: Massive Alpine Granite Peaks with Snow Caps */}
      <group position={[-42, 22, 90]}>
        <mesh rotation={[0, 0.4, 0]}>
          <coneGeometry args={[42, 65, 5]} />
          <meshStandardMaterial color="#2d3748" roughness={0.95} />
        </mesh>
        {/* Snow Peak Cap */}
        <mesh position={[0, 24, 0]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[14, 20, 5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        {/* Secondary Mountain Peak */}
        <mesh position={[18, -12, -35]} rotation={[0, -0.3, 0]}>
          <coneGeometry args={[32, 50, 5]} />
          <meshStandardMaterial color="#1a202c" roughness={0.95} />
        </mesh>
      </group>

      {/* 6. Looping Roadside Evergreen Pine Forest Clusters */}
      <group ref={treesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Pine Trees */}
            <PineTree position={[-13.5, 0, 0]} scale={1.2} />
            <PineTree position={[-19, 0, -4]} scale={1.5} dark />
            <PineTree position={[-25, 0, 6]} scale={1.8} />

            {/* Right Pine Trees */}
            <PineTree position={[13.5, 0, 2]} scale={1.3} />
            <PineTree position={[20, 0, -5]} scale={1.6} dark />

            {/* Roadside Yellow Chevron Turn Sign every 60m */}
            {idx % 2 === 0 && (
              <group position={[8.8, 1.8, 0]} rotation={[0, -Math.PI / 8, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[1.2, 1.2, 0.08]} />
                  <meshStandardMaterial color="#eab308" roughness={0.4} />
                </mesh>
                <mesh position={[0, -1.2, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.6]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

// Lush Multi-Tiered Pine Tree
const PineTree = ({ position, scale = 1, dark = false }) => (
  <group position={position} scale={[scale, scale, scale]}>
    {/* Tree Trunk */}
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.18, 0.28, 2.4, 6]} />
      <meshStandardMaterial color="#3e2723" roughness={0.9} />
    </mesh>
    {/* Foliage Cones */}
    <mesh position={[0, 2.8, 0]}>
      <coneGeometry args={[1.5, 2.2, 6]} />
      <meshStandardMaterial color={dark ? '#14532d' : '#166534'} roughness={0.85} />
    </mesh>
    <mesh position={[0, 4.0, 0]}>
      <coneGeometry args={[1.15, 2.0, 6]} />
      <meshStandardMaterial color={dark ? '#166534' : '#15803d'} roughness={0.85} />
    </mesh>
    <mesh position={[0, 5.0, 0]}>
      <coneGeometry args={[0.75, 1.8, 6]} />
      <meshStandardMaterial color={dark ? '#15803d' : '#22c55e'} roughness={0.85} />
    </mesh>
  </group>
);
