import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 01 MOUNTAIN PASS ENVIRONMENT (Reference Quadrant 1)
// Dense green forests, towering mountains, waterfalls, mist, winding asphalt roads, bridges, and roadside guardrails
export const MountainEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const treesGroupRef = useRef();
  const mistGroupRef = useRef();
  const waterfallStreamRef = useRef();
  const waterfallSprayRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 24;
    }

    // Moving roadside pine trees loop
    if (treesGroupRef.current) {
      treesGroupRef.current.position.z = (treesGroupRef.current.position.z + moveStep * 0.7) % 70;
    }

    // Floating mountain valley mist drift
    if (mistGroupRef.current) {
      mistGroupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 3;
      mistGroupRef.current.position.z = (mistGroupRef.current.position.z + moveStep * 0.15) % 120;
    }

    // Cascading waterfall animation
    if (waterfallStreamRef.current && waterfallStreamRef.current.material) {
      waterfallStreamRef.current.material.opacity = 0.88 + Math.sin(state.clock.elapsedTime * 12) * 0.08;
    }

    // Pulsing white foam spray at waterfall plunge pool
    if (waterfallSprayRef.current) {
      waterfallSprayRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
      waterfallSprayRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 8) * 0.15;
    }
  });

  // Mountain Asphalt Texture: Double Yellow Center Line + Crisp White Shoulder Lines
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#161f28';
    ctx.fillRect(0, 0, 256, 512);

    // Subtle asphalt grain texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 2, 2);
    }

    // Double yellow center divider line
    ctx.fillStyle = '#facc15';
    ctx.fillRect(124, 0, 3, 512);
    ctx.fillRect(129, 0, 3, 512);

    // Solid white outer shoulder lines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(16, 0, 5, 512);
    ctx.fillRect(235, 0, 5, 512);

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
        <planeGeometry args={[16.5, 280]} />
        <meshStandardMaterial color="#141c24" roughness={0.78} metalness={0.22} />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.2, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.92} />
      </mesh>

      {/* 2. Steel Guardrails with Amber Reflectors */}
      <group position={[-8.4, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.3, 0.72, 280]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.28} />
        </mesh>
        {/* Guardrail posts */}
        {[-80, -40, 0, 40, 80, 120].map((zP, i) => (
          <mesh key={i} position={[0, -0.4, zP]}>
            <cylinderGeometry args={[0.06, 0.06, 0.9]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        ))}
      </group>

      <group position={[8.4, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.3, 0.72, 280]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.28} />
        </mesh>
        {[-80, -40, 0, 40, 80, 120].map((zP, i) => (
          <mesh key={i} position={[0, -0.4, zP]}>
            <cylinderGeometry args={[0.06, 0.06, 0.9]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 3. LEFT SIDE: Cascading Mountain Waterfall Down Rocky Cliff (Matching Reference Image) */}
      <group position={[-32, 18, 75]}>
        {/* Massive Granite Cliff Face */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[22, 48, 65]} />
          <meshStandardMaterial color="#1e293b" roughness={0.96} />
        </mesh>
        {/* Forested Cliff Ridge */}
        <mesh position={[2, 25, 0]}>
          <boxGeometry args={[20, 4, 65]} />
          <meshStandardMaterial color="#14532d" roughness={0.9} />
        </mesh>

        {/* Multi-Tier Cascading Waterfall Stream */}
        <mesh ref={waterfallStreamRef} position={[10.8, 3, 2]}>
          <planeGeometry args={[7.5, 42]} />
          <meshStandardMaterial 
            color="#38bdf8" 
            emissive="#0284c7" 
            emissiveIntensity={0.35} 
            roughness={0.15} 
            metalness={0.8} 
            transparent 
            opacity={0.92} 
          />
        </mesh>

        {/* Second Waterfall Trough */}
        <mesh position={[10.5, 12, -14]}>
          <planeGeometry args={[4.5, 26]} />
          <meshStandardMaterial color="#7dd3fc" roughness={0.2} metalness={0.7} transparent opacity={0.85} />
        </mesh>

        {/* Foaming Plunge Pool at Waterfall Base */}
        <mesh ref={waterfallSprayRef} position={[10.5, -16, 2]}>
          <boxGeometry args={[8.5, 3.2, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.1} transparent opacity={0.85} />
        </mesh>

        {/* Rushing Waterfall Mist Glow Light */}
        <pointLight position={[9, -8, 2]} intensity={3.5} distance={38} color="#7dd3fc" />
        <pointLight position={[9, 14, 2]} intensity={2.0} distance={30} color="#bae6fd" />
      </group>

      {/* 4. OVERHEAD: Stone Viaduct Arch Bridge Spanning at Distance */}
      <group position={[0, 10.5, 145]}>
        {/* Upper Viaduct Deck */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[75, 4, 11]} />
          <meshStandardMaterial color="#334155" roughness={0.92} />
        </mesh>
        {/* 3 Heavy Stone Arches */}
        {[-24, 0, 24].map((xArch, i) => (
          <group key={i} position={[xArch, 0, 0]}>
            <mesh position={[-6.5, -4, 0]}>
              <boxGeometry args={[3, 10, 8.5]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[6.5, -4, 0]}>
              <boxGeometry args={[3, 10, 8.5]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[11, 3.5, 8.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. DISTANT ALPINE PEAKS WITH SNOW CAPS & VALLEY MIST */}
      <group position={[-52, 28, 115]}>
        <mesh rotation={[0, 0.4, 0]}>
          <coneGeometry args={[52, 78, 5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        {/* White Snow Summit */}
        <mesh position={[0, 29, 0]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[17, 22, 5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      </group>

      <group position={[56, 26, 125]}>
        <mesh rotation={[0, -0.3, 0]}>
          <coneGeometry args={[48, 72, 5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        <mesh position={[0, 26, 0]} rotation={[0, -0.3, 0]}>
          <coneGeometry args={[15, 20, 5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      </group>

      {/* 6. MIST & CLOUD BANKS HOVERING OVER THE MOUNTAIN VALLEY */}
      <group ref={mistGroupRef} position={[0, 6, 80]}>
        <mesh position={[-20, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[45, 30]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.14} depthWrite={false} />
        </mesh>
        <mesh position={[18, 4, 25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 28]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>

      {/* 7. LOOPING EVERGREEN PINE FOREST CLUSTERS */}
      <group ref={treesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Pine Trees along Cliff Base */}
            <MountainPine position={[-13.5, 0, 0]} scale={1.25} />
            <MountainPine position={[-19, 0, -4]} scale={1.6} dark />
            <MountainPine position={[-25, 0, 6]} scale={1.9} />

            {/* Right Pine Trees climbing the slope */}
            <MountainPine position={[13.5, 0, 2]} scale={1.3} />
            <MountainPine position={[19.5, 0, -5]} scale={1.65} dark />
            <MountainPine position={[26, 0, 4]} scale={2.0} />

            {/* Yellow Roadside Chevron Turn Warning Signs */}
            {idx % 2 === 0 && (
              <group position={[8.9, 1.8, 0]} rotation={[0, -Math.PI / 9, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[1.3, 1.3, 0.08]} />
                  <meshStandardMaterial color="#eab308" roughness={0.35} />
                </mesh>
                <mesh position={[0, -1.2, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.7]} />
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

// Lush Multi-Tiered Mountain Pine Tree
const MountainPine = ({ position, scale = 1, dark = false }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[0.18, 0.28, 2.4, 6]} />
      <meshStandardMaterial color="#3e2723" roughness={0.9} />
    </mesh>
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
