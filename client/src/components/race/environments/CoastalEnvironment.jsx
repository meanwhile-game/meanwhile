import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 02 COASTAL RUN ENVIRONMENT (Cinematic Riviera Landscape)
 * Matching Reference Image: Scenic ocean highway along rocky coast,
 * shimmering turquoise sea with golden sunset path, iconic white headland lighthouse,
 * Roman stone viaduct, classical Italian arcade with Tuscan colonnade, and cypress trees.
 */
export const CoastalEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const oceanRef = useRef();
  const oceanWavesRef = useRef();
  const cliffsGroupRef = useRef();
  const viaductGroupRef = useRef();
  const finishGantryRef = useRef();
  const cypressGroupRef = useRef();
  const lighthouseGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Moving roadside cypress trees loop
    if (cypressGroupRef.current) {
      cypressGroupRef.current.position.z = (cypressGroupRef.current.position.z + moveStep * 0.75) % 80;
    }

    // Gentle Mediterranean ocean wave ripple animation
    if (oceanRef.current) {
      oceanRef.current.position.y = -2.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
    if (oceanWavesRef.current) {
      oceanWavesRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.8) * 4;
    }

    // --- LANDMARK PROGRESSION ---
    // 1. CLIFFSIDE VILLA & STONE ARCADE (progress 20% -> 60%)
    if (cliffsGroupRef.current) {
      const cliffsTargetZ = 250 - ((progress - 0.18) / 0.42) * 290;
      cliffsGroupRef.current.position.z = THREE.MathUtils.lerp(
        cliffsGroupRef.current.position.z,
        cliffsTargetZ,
        delta * 3.5
      );
    }

    // 2. HEADLAND COASTAL LIGHTHOUSE (progress 30% -> 75%)
    if (lighthouseGroupRef.current) {
      const lighthouseTargetZ = 280 - ((progress - 0.28) / 0.45) * 320;
      lighthouseGroupRef.current.position.z = THREE.MathUtils.lerp(
        lighthouseGroupRef.current.position.z,
        lighthouseTargetZ,
        delta * 3.5
      );
    }

    // 3. OVERHEAD ROMAN VIADUCT AQUEDUCT (progress 45% -> 80%)
    if (viaductGroupRef.current) {
      const viaductTargetZ = 260 - ((progress - 0.42) / 0.38) * 310;
      viaductGroupRef.current.position.z = THREE.MathUtils.lerp(
        viaductGroupRef.current.position.z,
        viaductTargetZ,
        delta * 3.5
      );
    }

    // 4. RIVIERA GRAND PRIX FINISH GANTRY (progress 78% -> 100%)
    if (finishGantryRef.current) {
      const gantryTargetZ = 240 - ((progress - 0.78) / 0.22) * 255;
      finishGantryRef.current.position.z = THREE.MathUtils.lerp(
        finishGantryRef.current.position.z,
        gantryTargetZ,
        delta * 3.5
      );
    }
  });

  return (
    <group>
      {/* 1. Rocky Shoreline Terrain Verge on Left */}
      <mesh position={[-25, -0.15, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 340]} />
        <meshStandardMaterial color="#334155" roughness={0.92} />
      </mesh>

      {/* 2. MEDITERRANEAN OCEAN WITH SUNSET SPECULAR SHIMMER (Left Side) */}
      <group position={[-50, -2.4, 60]} ref={oceanRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[140, 340]} />
          <meshPhysicalMaterial 
            color="#0284c7" 
            roughness={0.12} 
            metalness={0.88} 
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={0.98}
            envMapIntensity={2.5}
          />
        </mesh>
        {/* Shimmering Sun Light Path on Water */}
        <mesh ref={oceanWavesRef} position={[20, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[38, 340]} />
          <meshBasicMaterial color="#fef08a" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>

      {/* 3. ICONIC HEADLAND COASTAL LIGHTHOUSE (Matching Reference Image) */}
      <group ref={lighthouseGroupRef} position={[-38, 0, 280]}>
        {/* Rocky Promontory Cliff */}
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[14, 18, 16, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.94} />
        </mesh>
        {/* White Tapered Lighthouse Tower */}
        <mesh position={[0, 24, 0]} castShadow>
          <cylinderGeometry args={[2.0, 3.2, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        {/* Red Observation Gallery Ring */}
        <mesh position={[0, 32.5, 0]} castShadow>
          <cylinderGeometry args={[2.8, 2.8, 0.8, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        {/* Glass Lantern Housing with Glowing Beacon */}
        <mesh position={[0, 34.5, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 3.2, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0, 34.5, 0]} intensity={4.5} distance={60} color="#fef08a" />
      </group>

      {/* 4. CLIFFSIDE MEDITERRANEAN VILLA & STONE ARCADE (Right Side) */}
      <group ref={cliffsGroupRef} position={[26, 0, 250]}>
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 26, 75]} />
          <meshStandardMaterial color="#334155" roughness={0.92} />
        </mesh>
        <group position={[-6.5, 4, 0]}>
          <mesh position={[0, 7.2, 0]} rotation={[0, 0, 0.2]} castShadow>
            <boxGeometry args={[7, 0.6, 55]} />
            <meshStandardMaterial color="#c2410c" roughness={0.7} />
          </mesh>
          <mesh position={[1.5, 2.5, 0]}>
            <boxGeometry args={[4, 5, 55]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.8} />
          </mesh>
          {[-20, -10, 0, 10, 20].map((cz, idx) => (
            <mesh key={idx} position={[-1.5, 2.5, cz]} castShadow>
              <cylinderGeometry args={[0.3, 0.35, 5, 12]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.75} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 5. OVERHEAD CLASSICAL ROMAN AQUEDUCT VIADUCT */}
      <group ref={viaductGroupRef} position={[0, 12, 260]}>
        <mesh position={[0, 5.2, 0]} castShadow>
          <boxGeometry args={[78, 3.8, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.85} />
        </mesh>
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

      {/* 6. RIVIERA GRAND PRIX FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 6, 240]}>
        <mesh position={[0, 5.6, 0]} castShadow>
          <boxGeometry args={[22, 1.8, 1.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} />
        </mesh>
        <mesh position={[-9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.8} />
        </mesh>
        <mesh position={[9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.8} />
        </mesh>
        <mesh position={[0, 5.6, 0.72]}>
          <planeGeometry args={[18.5, 1.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* 7. LOOPING MEDITERRANEAN CYPRESS TREES & SEASIDE BALUSTRADE */}
      <group ref={cypressGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Right Roadside: Mediterranean Cypress Trees */}
            <MediterraneanCypress position={[13.5, 0, 0]} scale={1.3} />
            <MediterraneanCypress position={[18, 0, -4]} scale={1.7} />
            <MediterraneanCypress position={[24, 0, 5]} scale={2.0} />

            {/* Left Roadside: Coastal Promenade Balustrade & Streetlamps */}
            <mesh position={[-11.5, 0.5, 0]} castShadow>
              <boxGeometry args={[0.3, 0.8, 14]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.8} />
            </mesh>
            <mesh position={[-11.8, 2.2, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 3.6, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[-11.2, 3.8, 0]}>
              <sphereGeometry args={[0.25, 10, 10]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight position={[-11.2, 3.4, 0]} intensity={1.8} distance={16} color="#f59e0b" />
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
