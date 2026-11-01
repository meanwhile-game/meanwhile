import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPhotorealisticRoadTexture, RealisticGuardrails, RealisticRumbleKerbs } from '../RealisticRoadElements.jsx';

/**
 * 02 COASTAL RUN ENVIRONMENT (Photorealistic Riviera Landscape)
 * Scenic Mediterranean highway following the ocean, seaside cliffs,
 * turquoise water with specular wave reflections, Roman stone viaduct,
 * cliffside villa arcade with Tuscan colonnade, and warm sunset lighting.
 */
export const CoastalEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const oceanRef = useRef();
  const oceanWavesRef = useRef();
  const cliffsGroupRef = useRef();
  const viaductGroupRef = useRef();
  const finishGantryRef = useRef();
  const cypressGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 24;
    }

    // Moving roadside cypress trees loop
    if (cypressGroupRef.current) {
      cypressGroupRef.current.position.z = (cypressGroupRef.current.position.z + moveStep * 0.7) % 80;
    }

    // Gentle Mediterranean ocean wave ripple animation
    if (oceanRef.current) {
      oceanRef.current.position.y = -2.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
    if (oceanWavesRef.current) {
      oceanWavesRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.8) * 4;
    }

    // --- LANDMARK PROGRESSION ---
    // 1. CLIFFSIDE VILLA & STONE ARCADE COLONNADE (progress 20% -> 60%)
    if (cliffsGroupRef.current) {
      const cliffsTargetZ = 250 - ((progress - 0.18) / 0.42) * 290;
      cliffsGroupRef.current.position.z = THREE.MathUtils.lerp(
        cliffsGroupRef.current.position.z,
        cliffsTargetZ,
        delta * 3.5
      );
    }

    // 2. OVERHEAD ROMAN VIADUCT AQUEDUCT (progress 45% -> 80%)
    if (viaductGroupRef.current) {
      const viaductTargetZ = 260 - ((progress - 0.42) / 0.38) * 310;
      viaductGroupRef.current.position.z = THREE.MathUtils.lerp(
        viaductGroupRef.current.position.z,
        viaductTargetZ,
        delta * 3.5
      );
    }

    // 3. RIVIERA GRAND PRIX FINISH GANTRY (progress 78% -> 100%)
    if (finishGantryRef.current) {
      const gantryTargetZ = 240 - ((progress - 0.78) / 0.22) * 255;
      finishGantryRef.current.position.z = THREE.MathUtils.lerp(
        finishGantryRef.current.position.z,
        gantryTargetZ,
        delta * 3.5
      );
    }
  });

  // Photorealistic Coastal Asphalt Texture
  const dashesTexture = useMemo(() => {
    return createPhotorealisticRoadTexture({
      lanes: 3,
      dashedColor: '#f8fafc',
      edgeColor: '#f59e0b',
      isWet: false
    });
  }, []);

  return (
    <group>
      {/* 1. Coastal 3-Lane Asphalt Road Surface with Clearcoat Sheen */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.8, 280]} />
        <meshPhysicalMaterial 
          color="#141a26" 
          roughness={0.46} 
          metalness={0.22} 
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          reflectivity={0.9}
        />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.6, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.96} />
      </mesh>

      {/* 3D Raised Beveled Racing Kerbs */}
      <RealisticRumbleKerbs length={280} xLeft={-8.4} xRight={8.4} />

      {/* Steel Guardrails with Reflectors */}
      <RealisticGuardrails length={280} xLeft={-8.8} xRight={8.8} />

      {/* 2. MEDITERRANEAN OCEAN WITH SUNSET SPECULAR SHIMMER */}
      <group position={[50, -2.2, 40]} ref={oceanRef}>
        {/* Deep Ocean Surface with Physical Wave Sheen */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[120, 300]} />
          <meshPhysicalMaterial 
            color="#0369a1" 
            roughness={0.12} 
            metalness={0.88} 
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={0.98}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* Shimmering Sun Light Path on Water */}
        <mesh ref={oceanWavesRef} position={[-20, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[35, 300]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      </group>

      {/* 3. CLIFFSIDE MEDITERRANEAN VILLA & STONE ARCADE */}
      <group ref={cliffsGroupRef} position={[-25, 0, 250]}>
        {/* Massive Seaside Cliff Rock Wall */}
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 26, 75]} />
          <meshStandardMaterial color="#334155" roughness={0.92} />
        </mesh>

        {/* Terracotta-Roofed Classical Italian Villa Colonnade */}
        <group position={[6.5, 4, 0]}>
          {/* Terracotta Tile Sloping Roof */}
          <mesh position={[0, 7.2, 0]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[7, 0.6, 55]} />
            <meshStandardMaterial color="#c2410c" roughness={0.7} />
          </mesh>
          {/* Stone Arcade Base */}
          <mesh position={[-1.5, 2.5, 0]}>
            <boxGeometry args={[4, 5, 55]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.8} />
          </mesh>
          {/* Classical Tuscan Stone Columns */}
          {[-20, -10, 0, 10, 20].map((cz, idx) => (
            <mesh key={idx} position={[1.5, 2.5, cz]} castShadow>
              <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.75} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 4. OVERHEAD CLASSICAL ROMAN AQUEDUCT VIADUCT */}
      <group ref={viaductGroupRef} position={[0, 12, 260]}>
        {/* Overhead Bridge Deck */}
        <mesh position={[0, 5.2, 0]} castShadow>
          <boxGeometry args={[78, 3.8, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.85} />
        </mesh>
        {/* Roman Stone Arches Spanning Roadway */}
        {[-22, 0, 22].map((ax, idx) => (
          <group key={idx} position={[ax, 0, 0]}>
            <mesh position={[-5.8, -4, 0]} castShadow>
              <boxGeometry args={[2.5, 12, 9]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.88} />
            </mesh>
            <mesh position={[5.8, -4, 0]} castShadow>
              <boxGeometry args={[2.5, 12, 9]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.88} />
            </mesh>
            <mesh position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[11, 3.5, 8.8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.88} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. RIVIERA GRAND PRIX FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 6, 240]}>
        {/* Overhead Truss Bridge */}
        <mesh position={[0, 5.6, 0]} castShadow>
          <boxGeometry args={[22, 1.8, 1.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} />
        </mesh>
        {/* Left & Right Support Columns */}
        <mesh position={[-9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.8} />
        </mesh>
        <mesh position={[9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.8} />
        </mesh>
        {/* Checkered Racing Banner */}
        <mesh position={[0, 5.6, 0.72]}>
          <planeGeometry args={[18.5, 1.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Green Laser Finish Strobes */}
        {[-7, -2.5, 2.5, 7].map((fx, i) => (
          <group key={i} position={[fx, 4.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            <pointLight position={[0, -0.5, 0]} intensity={3.5} distance={22} color="#22c55e" />
          </group>
        ))}
      </group>

      {/* 6. LOOPING MEDITERRANEAN CYPRESS TREES & SEASIDE LAMPS */}
      <group ref={cypressGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Roadside: Mediterranean Cypress Trees */}
            <MediterraneanCypress position={[-12.5, 0, 0]} scale={1.3} />
            <MediterraneanCypress position={[-17, 0, -4]} scale={1.7} />
            <MediterraneanCypress position={[-23, 0, 5]} scale={2.0} />

            {/* Right Roadside: Coastal Balustrade & Streetlamps */}
            <mesh position={[9.5, 0.5, 0]}>
              <boxGeometry args={[0.3, 0.8, 12]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.8} />
            </mesh>
            <mesh position={[9.8, 2.2, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 3.6, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[9.2, 3.8, 0]}>
              <sphereGeometry args={[0.25, 10, 10]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight position={[9.2, 3.4, 0]} intensity={1.8} distance={16} color="#f59e0b" />
          </group>
        ))}
      </group>
    </group>
  );
};

// Slender, Elegant Mediterranean Cypress Tree
const MediterraneanCypress = ({ position, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <cylinderGeometry args={[0.14, 0.22, 2.4, 6]} />
      <meshStandardMaterial color="#3e2723" roughness={0.9} />
    </mesh>
    {/* Columnar Foliage */}
    <mesh position={[0, 4.2, 0]} castShadow>
      <cylinderGeometry args={[0.35, 0.75, 6.2, 8]} />
      <meshStandardMaterial color="#143e26" roughness={0.82} />
    </mesh>
    <mesh position={[0, 7.6, 0]} castShadow>
      <coneGeometry args={[0.35, 1.8, 8]} />
      <meshStandardMaterial color="#1a4d30" roughness={0.82} />
    </mesh>
  </group>
);
