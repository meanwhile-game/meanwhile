import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPhotorealisticRoadTexture, RealisticGuardrails, RealisticRumbleKerbs } from '../RealisticRoadElements.jsx';

/**
 * 01 MOUNTAIN PASS ENVIRONMENT (Photorealistic Alpine Canyon)
 * Matching Reference Image: Dense pine forests framing the winding road,
 * stratified granite canyon walls, roaring cascading waterfall gorge,
 * alpine stone viaduct, and distant snow-dusted peaks.
 */
export const MountainEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const treesGroupRef = useRef();
  const mistGroupRef = useRef();
  const waterfallGroupRef = useRef();
  const waterfallStreamRef = useRef();
  const waterfallSprayRef = useRef();
  const viaductGroupRef = useRef();
  const summitGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 28;
    }

    // Roadside pine trees streaming past with multi-layer depth
    if (treesGroupRef.current) {
      treesGroupRef.current.position.z = (treesGroupRef.current.position.z + moveStep * 0.95) % 70;
    }

    // Floating mountain valley mist drift
    if (mistGroupRef.current) {
      mistGroupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 3.0;
      mistGroupRef.current.position.z = (mistGroupRef.current.position.z + moveStep * 0.25) % 110;
    }

    // Cascading waterfall animation
    if (waterfallStreamRef.current && waterfallStreamRef.current.material) {
      waterfallStreamRef.current.material.opacity = 0.88 + Math.sin(state.clock.elapsedTime * 14) * 0.08;
    }
    if (waterfallSprayRef.current) {
      waterfallSprayRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.18;
      waterfallSprayRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 8) * 0.14;
    }

    // --- LANDMARK PROGRESSION ---
    // 1. The Great Waterfall Gorge (progress 0% -> 50%)
    if (waterfallGroupRef.current) {
      const waterfallZ = 220 - (progress / 0.45) * 300;
      waterfallGroupRef.current.position.z = THREE.MathUtils.lerp(
        waterfallGroupRef.current.position.z,
        waterfallZ,
        delta * 3.5
      );
    }

    // 2. High Alpine Stone Viaduct Arch Bridge (progress 35% -> 80%)
    if (viaductGroupRef.current) {
      const viaductZ = 260 - ((progress - 0.35) / 0.40) * 340;
      viaductGroupRef.current.position.z = THREE.MathUtils.lerp(
        viaductGroupRef.current.position.z,
        viaductZ,
        delta * 3.5
      );
    }

    // 3. Mountain Summit Finish Gantry (progress 70% -> 100%)
    if (summitGroupRef.current) {
      const summitZ = 240 - ((progress - 0.70) / 0.30) * 260;
      summitGroupRef.current.position.z = THREE.MathUtils.lerp(
        summitGroupRef.current.position.z,
        summitZ,
        delta * 3.5
      );
    }
  });

  // Photorealistic Mountain Asphalt Texture with Double Yellow Center Lines & Tire Tracks
  const dashesTexture = useMemo(() => {
    return createPhotorealisticRoadTexture({
      lanes: 3,
      doubleCenter: true,
      edgeColor: '#f8fafc',
      isWet: true
    });
  }, []);

  return (
    <group>
      {/* 1. Mountain Asphalt Road Surface with Natural PBR Roughness */}
      <mesh position={[0, -0.05, 50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.8, 300]} />
        <meshPhysicalMaterial 
          color="#161e27" 
          roughness={0.28} 
          metalness={0.55}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          reflectivity={0.94}
        />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.5, 300]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.96} />
      </mesh>

      {/* FIA Red & White Rumble Kerbs */}
      <RealisticRumbleKerbs length={300} xLeft={-8.35} xRight={8.35} />

      {/* Realistic Corrugated Galvanized Steel Guardrails with I-Beams & Reflectors */}
      <RealisticGuardrails length={300} xLeft={-8.85} xRight={8.85} />

      {/* 2. Lush Green Mountain Earth Verges on Left & Right */}
      <mesh position={[-25, -0.15, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 340]} />
        <meshStandardMaterial color="#1b3824" roughness={0.92} />
      </mesh>
      <mesh position={[25, -0.15, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 340]} />
        <meshStandardMaterial color="#1b3824" roughness={0.92} />
      </mesh>

      {/* 3. DYNAMIC LANDMARK: CASCADING WATERFALL GORGE (Right Side) */}
      <group ref={waterfallGroupRef} position={[28, 18, 220]}>
        {/* Massive Granite Rock Cliff Face */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[22, 52, 70]} />
          <meshStandardMaterial color="#1e293b" roughness={0.94} />
        </mesh>
        {/* Upper Forest Ridge */}
        <mesh position={[-2, 27, 0]}>
          <boxGeometry args={[20, 4, 70]} />
          <meshStandardMaterial color="#14532d" roughness={0.9} />
        </mesh>

        {/* Multi-Tier Cascading Waterfall Stream */}
        <mesh ref={waterfallStreamRef} position={[-11, 3, 2]}>
          <planeGeometry args={[7.5, 46]} />
          <meshPhysicalMaterial 
            color="#38bdf8" 
            emissive="#0284c7" 
            emissiveIntensity={0.35} 
            roughness={0.12} 
            metalness={0.6} 
            transparent 
            opacity={0.92} 
          />
        </mesh>
        {/* Foaming Plunge Pool */}
        <mesh ref={waterfallSprayRef} position={[-10.6, -18, 2]}>
          <boxGeometry args={[9, 3.5, 14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} transparent opacity={0.88} />
        </mesh>
        <pointLight position={[-9, -8, 2]} intensity={2.5} distance={38} color="#7dd3fc" />
      </group>

      {/* 4. DYNAMIC LANDMARK: HIGH ALPINE STONE VIADUCT ARCH BRIDGE */}
      <group ref={viaductGroupRef} position={[0, 12, 280]}>
        <mesh position={[0, 5.2, 0]} castShadow>
          <boxGeometry args={[78, 4.2, 13]} />
          <meshStandardMaterial color="#334155" roughness={0.88} />
        </mesh>
        <mesh position={[0, 7.8, -6.2]}>
          <boxGeometry args={[78, 1.2, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        <mesh position={[0, 7.8, 6.2]}>
          <boxGeometry args={[78, 1.2, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {[-22, 0, 22].map((xArch, i) => (
          <group key={i} position={[xArch, 0, 0]}>
            <mesh position={[-5.8, -4, 0]} castShadow>
              <boxGeometry args={[2.8, 13, 9.5]} />
              <meshStandardMaterial color="#1e293b" roughness={0.92} />
            </mesh>
            <mesh position={[5.8, -4, 0]} castShadow>
              <boxGeometry args={[2.8, 13, 9.5]} />
              <meshStandardMaterial color="#1e293b" roughness={0.92} />
            </mesh>
            <mesh position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[11.5, 3.8, 9.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.92} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. DYNAMIC LANDMARK: MOUNTAIN SUMMIT FINISH GANTRY */}
      <group ref={summitGroupRef} position={[0, 6, 260]}>
        <mesh position={[0, 5.6, 0]} castShadow>
          <boxGeometry args={[22.5, 1.9, 1.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[-9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>
        <mesh position={[9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 5.6, 0.72]}>
          <planeGeometry args={[18.5, 1.4]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* 6. DISTANT ALPINE PEAKS WITH SNOW CAPS */}
      <group position={[-58, 34, 170]}>
        <mesh rotation={[0, 0.4, 0]}>
          <coneGeometry args={[55, 85, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.94} />
        </mesh>
        <mesh position={[0, 32, 0]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[18, 25, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.82} />
        </mesh>
      </group>
      <group position={[62, 32, 185]}>
        <mesh rotation={[0, -0.3, 0]}>
          <coneGeometry args={[52, 80, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.94} />
        </mesh>
        <mesh position={[0, 29, 0]} rotation={[0, -0.3, 0]}>
          <coneGeometry args={[17, 23, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.82} />
        </mesh>
      </group>

      {/* 7. MIST DRIFT */}
      <group ref={mistGroupRef} position={[0, 6, 80]}>
        <mesh position={[-20, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[48, 32]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.14} depthWrite={false} />
        </mesh>
        <mesh position={[18, 4, 25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[42, 30]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>

      {/* 8. LOOPING DENSE ALPINE FIR / PINE FOREST */}
      <group ref={treesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Trees & Rocks */}
            <RealisticPineTree position={[-13.5, 0, 0]} scale={1.3} />
            <RealisticPineTree position={[-19, 0, -4]} scale={1.7} dark />
            <RealisticPineTree position={[-26, 0, 6]} scale={2.0} />
            <RockBoulder position={[-11, 0.4, 3]} scale={1.2} />

            {/* Right Trees & Rocks */}
            <RealisticPineTree position={[13.5, 0, 2]} scale={1.35} />
            <RealisticPineTree position={[19.5, 0, -5]} scale={1.75} dark />
            <RealisticPineTree position={[26, 0, 4]} scale={2.1} />
            <RockBoulder position={[11, 0.4, -2]} scale={1.1} />
          </group>
        ))}
      </group>
    </group>
  );
};

// Lush, Multi-Tiered Organic Pine Tree with Realistic Canopy Layers
const RealisticPineTree = ({ position, scale = 1, dark = false }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <cylinderGeometry args={[0.20, 0.32, 2.4, 8]} />
      <meshStandardMaterial color="#2d1c15" roughness={0.95} />
    </mesh>
    <mesh position={[0, 2.7, 0]} castShadow>
      <coneGeometry args={[1.65, 2.4, 8]} />
      <meshStandardMaterial color={dark ? '#113824' : '#1b4a30'} roughness={0.86} />
    </mesh>
    <mesh position={[0, 4.0, 0]} castShadow>
      <coneGeometry args={[1.25, 2.2, 8]} />
      <meshStandardMaterial color={dark ? '#14462c' : '#1e5a39'} roughness={0.86} />
    </mesh>
    <mesh position={[0, 5.1, 0]} castShadow>
      <coneGeometry args={[0.85, 2.0, 8]} />
      <meshStandardMaterial color={dark ? '#175435' : '#236e45'} roughness={0.86} />
    </mesh>
    <mesh position={[0, 6.0, 0]} castShadow>
      <coneGeometry args={[0.45, 1.6, 8]} />
      <meshStandardMaterial color={dark ? '#1d633e' : '#2e8b57'} roughness={0.86} />
    </mesh>
  </group>
);

// Natural Granite Boulder along Road Verge
const RockBoulder = ({ position, scale = 1 }) => (
  <mesh position={position} scale={[scale * 1.4, scale * 0.9, scale * 1.2]} castShadow receiveShadow>
    <dodecahedronGeometry args={[0.85, 1]} />
    <meshStandardMaterial color="#334155" roughness={0.92} />
  </mesh>
);
