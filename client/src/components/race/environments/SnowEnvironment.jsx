import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 03 SNOW CIRCUIT ENVIRONMENT
// Winter alpine snowbanks, snow-laden frosted pine trees, icy reflective road, red-white snow hazard poles, snow flurries
export const SnowEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const snowTreesGroupRef = useRef();
  const snowFlurriesRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 22;
    }

    // Moving roadside snow trees & hazard stakes loop
    if (snowTreesGroupRef.current) {
      snowTreesGroupRef.current.position.z = (snowTreesGroupRef.current.position.z + moveStep * 0.7) % 70;
    }

    // Swirling falling snow flurries
    if (snowFlurriesRef.current) {
      snowFlurriesRef.current.position.z = ((snowFlurriesRef.current.position.z + moveStep * 0.4) % 60) - 20;
      snowFlurriesRef.current.rotation.y += delta * 0.2;
    }
  });

  // Wet Icy Road Surface Texture with Frost Markings
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#141c26';
    ctx.fillRect(0, 0, 256, 512);

    // Frosty dashed white center markings
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(124, 40, 8, 140);
    ctx.fillRect(124, 290, 8, 140);

    // Frosty edge snow lines
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(14, 0, 6, 512);
    ctx.fillRect(236, 0, 6, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }, []);

  // Snow Flurry Particles
  const snowParticles = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 400; i++) {
      const x = (Math.random() - 0.5) * 45;
      const y = Math.random() * 16 + 0.5;
      const z = (Math.random() - 0.5) * 120 + 20;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  return (
    <group>
      {/* 1. Wet, Icy Asphalt Road Surface */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 260]} />
        <meshStandardMaterial 
          color="#151b24" 
          roughness={0.32} 
          metalness={0.45} 
        />
      </mesh>

      {/* Frost-Dusted Road Markings */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 260]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.85} />
      </mesh>

      {/* 2. Thick Snowbanks Along Left & Right Road Edges */}
      <mesh position={[-8.8, 0.4, 40]}>
        <boxGeometry args={[2.2, 0.9, 260]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      <mesh position={[8.8, 0.4, 40]}>
        <boxGeometry args={[2.2, 0.9, 260]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Metal Guardrails in the Snow */}
      <mesh position={[-8.1, 0.5, 40]}>
        <boxGeometry args={[0.25, 0.65, 260]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[8.1, 0.5, 40]}>
        <boxGeometry args={[0.25, 0.65, 260]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* 3. Snow-Covered Elevated Viaduct Arch Bridge Ahead */}
      <group position={[0, 9, 130]}>
        {/* Viaduct Deck covered in snow */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[70, 3.5, 9]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        <mesh position={[0, 7.1, 0]}>
          <boxGeometry args={[70, 0.8, 9.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        {/* Viaduct Pillars */}
        {[-22, 0, 22].map((xArch, i) => (
          <group key={i} position={[xArch, -3.5, 0]}>
            <mesh position={[-6, 0, 0]}>
              <boxGeometry args={[2.5, 10, 7]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[6, 0, 0]}>
              <boxGeometry args={[2.5, 10, 7]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Majestic Snow-Clad Mountains in Backdrop */}
      <group position={[-46, 25, 80]}>
        <mesh rotation={[0, 0.3, 0]}>
          <coneGeometry args={[48, 70, 5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        <mesh position={[24, -10, -30]} rotation={[0, -0.4, 0]}>
          <coneGeometry args={[36, 55, 5]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
      </group>
      <group position={[50, 26, 95]}>
        <mesh rotation={[0, -0.2, 0]}>
          <coneGeometry args={[45, 68, 5]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>
      </group>

      {/* 5. Looping Snow-Covered Pine Trees & Red-White Hazard Stakes */}
      <group ref={snowTreesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Snow-Laden Pine Trees */}
            <SnowPineTree position={[-14, 0, 0]} scale={1.25} />
            <SnowPineTree position={[-20, 0, -4]} scale={1.55} />
            <SnowPineTree position={[-26, 0, 5]} scale={1.9} />

            {/* Right Snow-Laden Pine Trees */}
            <SnowPineTree position={[14, 0, 2]} scale={1.3} />
            <SnowPineTree position={[21, 0, -5]} scale={1.65} />

            {/* Red and White Striped Alpine Snow Stakes (every 30m) */}
            <SnowHazardPole position={[-8.4, 0.9, 0]} />
            <SnowHazardPole position={[8.4, 0.9, 0]} />
          </group>
        ))}
      </group>

      {/* 6. Falling Snow Flurry Particles */}
      <points ref={snowFlurriesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={snowParticles.length / 3}
            array={snowParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.35} color="#ffffff" transparent opacity={0.85} />
      </points>
    </group>
  );
};

// Pine Tree with Heavy Snow Blankets
const SnowPineTree = ({ position, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    {/* Trunk */}
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.18, 0.28, 2.4, 6]} />
      <meshStandardMaterial color="#2d2424" roughness={0.9} />
    </mesh>
    {/* Bottom Tier: Pine Needle Base + Snow Cap */}
    <mesh position={[0, 2.7, 0]}>
      <coneGeometry args={[1.5, 2.0, 6]} />
      <meshStandardMaterial color="#1b382b" roughness={0.85} />
    </mesh>
    <mesh position={[0, 3.2, 0]}>
      <coneGeometry args={[1.4, 1.1, 6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.9} />
    </mesh>
    {/* Middle Tier: Pine Needle + Snow Cap */}
    <mesh position={[0, 3.9, 0]}>
      <coneGeometry args={[1.1, 1.8, 6]} />
      <meshStandardMaterial color="#1b382b" roughness={0.85} />
    </mesh>
    <mesh position={[0, 4.3, 0]}>
      <coneGeometry args={[1.05, 1.0, 6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.9} />
    </mesh>
    {/* Top Tier: Snow Tip */}
    <mesh position={[0, 4.9, 0]}>
      <coneGeometry args={[0.7, 1.6, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.85} />
    </mesh>
  </group>
);

// Red-and-White Striped Alpine Snow Marker Stake
const SnowHazardPole = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 1.8]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    {/* Red Hazard Stripes */}
    {[-0.5, 0, 0.5].map((yOffset, i) => (
      <mesh key={i} position={[0, yOffset, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.22]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    ))}
  </group>
);
