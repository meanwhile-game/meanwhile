import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 03 SNOW CIRCUIT ENVIRONMENT (Reference Quadrant 3)
// Snow-covered mountains, pine forests, icy roads, snow particles, alpine tunnels, and cold atmospheric lighting
export const SnowEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const snowTreesGroupRef = useRef();
  const snowFlurriesRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 24;
    }

    // Moving roadside snow trees & hazard stakes loop
    if (snowTreesGroupRef.current) {
      snowTreesGroupRef.current.position.z = (snowTreesGroupRef.current.position.z + moveStep * 0.7) % 70;
    }

    // Swirling falling snow flurries with speed-responsive rush
    if (snowFlurriesRef.current) {
      snowFlurriesRef.current.position.z = ((snowFlurriesRef.current.position.z + moveStep * 0.45) % 80) - 20;
      snowFlurriesRef.current.rotation.y += delta * 0.15;
    }
  });

  // Wet Icy Road Surface Texture with Frost Markings
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#121822';
    ctx.fillRect(0, 0, 256, 512);

    // Subtle frost noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 500; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 2, 2);
    }

    // Frosty dashed white center markings
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(124, 40, 8, 140);
    ctx.fillRect(124, 290, 8, 140);

    // Frosty edge snow lines
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(14, 0, 6, 512);
    ctx.fillRect(236, 0, 6, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }, []);

  // 3D Snow Flurry Particles
  const snowParticles = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 600; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = Math.random() * 18 + 0.5;
      const z = (Math.random() - 0.5) * 140 + 20;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  return (
    <group>
      {/* 1. Wet, Highly Reflective Icy Road Surface */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.5, 280]} />
        <meshPhysicalMaterial 
          color="#131922" 
          roughness={0.16} 
          metalness={0.65} 
          clearcoat={1.0}
          clearcoatRoughness={0.12}
        />
      </mesh>

      {/* Frost-Dusted Road Markings */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.2, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.88} />
      </mesh>

      {/* 2. Thick Snowbanks Along Left & Right Road Edges */}
      <mesh position={[-8.9, 0.45, 40]}>
        <boxGeometry args={[2.4, 0.95, 280]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.92} />
      </mesh>
      <mesh position={[8.9, 0.45, 40]}>
        <boxGeometry args={[2.4, 0.95, 280]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.92} />
      </mesh>

      {/* Metal Guardrails embedded in snow */}
      <mesh position={[-8.2, 0.55, 40]}>
        <boxGeometry args={[0.25, 0.65, 280]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[8.2, 0.55, 40]}>
        <boxGeometry args={[0.25, 0.65, 280]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.35} />
      </mesh>

      {/* 3. LEFT SIDE: ALPINE STONE TUNNEL PORTAL (Matching Reference Image 03) */}
      <group position={[-16, 5.5, 95]}>
        {/* Massive Rock Cliff surrounding tunnel */}
        <mesh position={[-8, 8, 0]}>
          <boxGeometry args={[22, 28, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        {/* Snow Layer on Tunnel Roof */}
        <mesh position={[-8, 22.5, 0]}>
          <boxGeometry args={[24, 2.5, 34]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>

        {/* Arched Stone Portal Masonry */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 11, 6]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Dark Tunnel Interior Void */}
        <mesh position={[0, -0.6, 2]}>
          <boxGeometry args={[7.8, 9, 7]} />
          <meshBasicMaterial color="#030712" />
        </mesh>

        {/* Warm Amber Tunnel Entrance Warning Beacon */}
        <pointLight position={[0, 4, 3.5]} intensity={3.5} distance={28} color="#f59e0b" />
        <mesh position={[0, 4.2, 3.2]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Alpine Yellow Tunnel Caution Sign */}
        <mesh position={[5.2, 2.5, 3.2]}>
          <boxGeometry args={[1.6, 1.6, 0.08]} />
          <meshStandardMaterial color="#eab308" roughness={0.4} />
        </mesh>
      </group>

      {/* 4. TOWERING JAGGED SNOW-COVERED MOUNTAIN PEAKS */}
      <group position={[-50, 30, 110]}>
        <mesh rotation={[0, 0.35, 0]}>
          <coneGeometry args={[55, 82, 5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.85} />
        </mesh>
        <mesh position={[26, -12, -35]} rotation={[0, -0.4, 0]}>
          <coneGeometry args={[42, 65, 5]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
        </mesh>
      </group>

      <group position={[54, 32, 120]}>
        <mesh rotation={[0, -0.25, 0]}>
          <coneGeometry args={[52, 78, 5]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
      </group>

      {/* 5. OVERHEAD SNOW-COVERED VIADUCT ARCH BRIDGE AT DISTANCE */}
      <group position={[0, 10.5, 150]}>
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[75, 4, 11]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Snow Cap on Viaduct */}
        <mesh position={[0, 7.3, 0]}>
          <boxGeometry args={[75, 1.0, 11.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        {/* Pillars */}
        {[-24, 0, 24].map((xArch, i) => (
          <group key={i} position={[xArch, -3.5, 0]}>
            <mesh position={[-6.5, 0, 0]}>
              <boxGeometry args={[3, 11, 8.5]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[6.5, 0, 0]}>
              <boxGeometry args={[3, 11, 8.5]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. LOOPING SNOW-COVERED PINES & RED-WHITE ALPINE HAZARD STAKES */}
      <group ref={snowTreesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Snow Pines */}
            <SnowPineTree position={[-14, 0, 0]} scale={1.25} />
            <SnowPineTree position={[-20, 0, -4]} scale={1.6} />
            <SnowPineTree position={[-26, 0, 5]} scale={1.9} />

            {/* Right Snow Pines */}
            <SnowPineTree position={[14, 0, 2]} scale={1.3} />
            <SnowPineTree position={[21, 0, -5]} scale={1.7} />

            {/* Red and White Striped Alpine Snow Marker Stakes */}
            <SnowHazardPole position={[-8.5, 0.9, 0]} />
            <SnowHazardPole position={[8.5, 0.9, 0]} />

            {/* Yellow Turn Warning Sign */}
            {idx % 3 === 0 && (
              <group position={[9.1, 1.8, 0]} rotation={[0, -Math.PI / 8, 0]}>
                <mesh>
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

      {/* 7. FALLING 3D SNOW FLURRY PARTICLES */}
      <points ref={snowFlurriesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={snowParticles.length / 3}
            array={snowParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.38} color="#ffffff" transparent opacity={0.88} />
      </points>
    </group>
  );
};

// Pine Tree heavily frosted with Snow Blankets
const SnowPineTree = ({ position, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.18, 0.28, 2.4, 6]} />
      <meshStandardMaterial color="#2d2424" roughness={0.9} />
    </mesh>
    {/* Tier 1 */}
    <mesh position={[0, 2.7, 0]}>
      <coneGeometry args={[1.5, 2.0, 6]} />
      <meshStandardMaterial color="#1b382b" roughness={0.85} />
    </mesh>
    <mesh position={[0, 3.2, 0]}>
      <coneGeometry args={[1.4, 1.1, 6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.9} />
    </mesh>
    {/* Tier 2 */}
    <mesh position={[0, 3.9, 0]}>
      <coneGeometry args={[1.1, 1.8, 6]} />
      <meshStandardMaterial color="#1b382b" roughness={0.85} />
    </mesh>
    <mesh position={[0, 4.3, 0]}>
      <coneGeometry args={[1.05, 1.0, 6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.9} />
    </mesh>
    {/* Tier 3 */}
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
    {[-0.5, 0, 0.5].map((yOffset, i) => (
      <mesh key={i} position={[0, yOffset, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.22]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    ))}
  </group>
);
