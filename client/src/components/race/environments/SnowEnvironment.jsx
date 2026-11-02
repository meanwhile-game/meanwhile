import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RealisticRoadSurface } from '../RealisticRoadElements.jsx';

/**
 * 03 SNOW CIRCUIT ENVIRONMENT (Photorealistic Alpine Winter)
 * Matching Reference Image: Road curving into an arched stone mountain tunnel,
 * deep snowdrifts blanketing the verges, heavily snow-laden fir trees,
 * turquoise frozen glacier lake, swirling 3D snow flurries, and summit finish.
 */
export const SnowEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const snowTreesGroupRef = useRef();
  const snowFlurriesRef = useRef();
  const tunnelGroupRef = useRef();
  const glacierVistaRef = useRef();
  const finishGantryRef = useRef();

  // Swirling 3D snow flurry particles
  const snowParticles = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = Math.random() * 12 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80 + 20;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Moving roadside snow trees & hazard stakes loop
    if (snowTreesGroupRef.current) {
      snowTreesGroupRef.current.position.z = (snowTreesGroupRef.current.position.z + moveStep * 0.75) % 70;
    }

    // Swirling falling snow flurries with speed-responsive rush
    if (snowFlurriesRef.current) {
      snowFlurriesRef.current.position.z = ((snowFlurriesRef.current.position.z + moveStep * 0.45) % 80) - 20;
      snowFlurriesRef.current.rotation.y += delta * 0.15;
    }

    // --- LANDMARK PROGRESSION ---
    // 1. ALPINE ROCK TUNNEL: Approaches from distance and car drives straight inside (progress 20% -> 60%)
    if (tunnelGroupRef.current) {
      const tunnelTargetZ = 240 - ((progress - 0.18) / 0.42) * 300;
      tunnelGroupRef.current.position.z = THREE.MathUtils.lerp(
        tunnelGroupRef.current.position.z,
        tunnelTargetZ,
        delta * 3.5
      );
    }

    // 2. FROZEN GLACIER LAKE RIDGE (progress 55% -> 90%)
    if (glacierVistaRef.current) {
      const glacierTargetZ = 250 - ((progress - 0.50) / 0.40) * 260;
      glacierVistaRef.current.position.z = THREE.MathUtils.lerp(
        glacierVistaRef.current.position.z,
        glacierTargetZ,
        delta * 3.5
      );
    }

    // 3. ALPINE SUMMIT FINISH GANTRY (progress 78% -> 100%)
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
      {/* 1. Wet, Highly Reflective Icy Road Surface with Frost Markings */}
      <RealisticRoadSurface
        lanes={2}
        dashedColor="#f1f5f9"
        edgeColor="#e2e8f0"
        isWet={true}
        roadWidth={16.5}
        length={320}
        speedKmh={speedKmh}
      />

      {/* 2. Deep Pure White Snowpack Verges Flanking Roadway on Left & Right */}
      <mesh position={[-25, -0.1, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 340]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.95} />
      </mesh>
      <mesh position={[25, -0.1, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 340]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.95} />
      </mesh>

      {/* Undulating Snowdrift Banks along Road Shoulders */}
      <mesh position={[-10.2, 0.45, 60]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.95, 340]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.92} />
      </mesh>
      <mesh position={[10.2, 0.45, 60]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.95, 340]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.92} />
      </mesh>

      {/* Galvanized Metal Guardrails embedded in snow */}
      <mesh position={[-8.3, 0.55, 50]} castShadow>
        <boxGeometry args={[0.22, 0.65, 300]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.28} />
      </mesh>
      <mesh position={[8.3, 0.55, 50]} castShadow>
        <boxGeometry args={[0.22, 0.65, 300]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.28} />
      </mesh>

      {/* 3. APPROACHING ALPINE STONE TUNNEL (Centered over Roadway) */}
      <group ref={tunnelGroupRef} position={[0, 0, 240]}>
        <AlpineRoadTunnel />
      </group>

      {/* 4. FROZEN GLACIER LAKE RIDGE VISTA (Right Side) */}
      <group ref={glacierVistaRef} position={[42, 0, 250]}>
        <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[70, 180]} />
          <meshPhysicalMaterial 
            color="#0891b2" 
            roughness={0.08} 
            metalness={0.92} 
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            reflectivity={0.98}
          />
        </mesh>
        {[-40, 0, 40].map((iz, idx) => (
          <mesh key={idx} position={[-12, 0.5, iz]} rotation={[0, idx * 0.4, 0]} castShadow>
            <coneGeometry args={[7.5, 6.5, 5]} />
            <meshStandardMaterial color="#cffafe" roughness={0.25} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* 5. ALPINE SUMMIT FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <SnowFinishGantry />
      </group>

      {/* 6. TOWERING JAGGED SNOW-COVERED MOUNTAIN PEAKS */}
      <group position={[-52, 30, 110]}>
        <mesh rotation={[0, 0.35, 0]}>
          <coneGeometry args={[55, 82, 6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.85} />
        </mesh>
        <mesh position={[26, -12, -35]} rotation={[0, -0.4, 0]}>
          <coneGeometry args={[42, 65, 6]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
        </mesh>
      </group>
      <group position={[54, 32, 120]}>
        <mesh rotation={[0, -0.25, 0]}>
          <coneGeometry args={[52, 78, 6]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
      </group>

      {/* 7. LOOPING SNOW-COVERED PINES & ALPINE HAZARD STAKES */}
      <group ref={snowTreesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            <SnowPineTree position={[-14.5, 0, 0]} scale={1.3} />
            <SnowPineTree position={[-20.5, 0, -4]} scale={1.7} />
            <SnowPineTree position={[-26.5, 0, 5]} scale={2.0} />

            <SnowPineTree position={[14.5, 0, 2]} scale={1.35} />
            <SnowPineTree position={[21.5, 0, -5]} scale={1.75} />
            <SnowHazardPole position={[-9.8, 0.9, 0]} />
            <SnowHazardPole position={[9.8, 0.9, 0]} />
          </group>
        ))}
      </group>

      {/* 8. SWIRLING 3D SNOW FLURRY PARTICLES */}
      <points ref={snowFlurriesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={snowParticles.length / 3}
            array={snowParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.36} color="#ffffff" transparent opacity={0.88} />
      </points>
    </group>
  );
};

// Pine Tree heavily frosted with Realistic Snow Blankets
const SnowPineTree = ({ position, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.28, 2.4, 6]} />
      <meshStandardMaterial color="#2d2424" roughness={0.9} />
    </mesh>
    <mesh position={[0, 2.7, 0]} castShadow>
      <coneGeometry args={[1.5, 2.0, 6]} />
      <meshStandardMaterial color="#1b382b" roughness={0.85} />
    </mesh>
    <mesh position={[0, 3.2, 0]}>
      <coneGeometry args={[1.45, 1.1, 6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.92} />
    </mesh>
    <mesh position={[0, 3.9, 0]} castShadow>
      <coneGeometry args={[1.1, 1.8, 6]} />
      <meshStandardMaterial color="#1b382b" roughness={0.85} />
    </mesh>
    <mesh position={[0, 4.3, 0]}>
      <coneGeometry args={[1.08, 1.0, 6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.92} />
    </mesh>
    <mesh position={[0, 4.9, 0]} castShadow>
      <coneGeometry args={[0.7, 1.6, 6]} />
      <meshStandardMaterial color="#ffffff" roughness={0.88} />
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

// High Alpine Stone Mountain Road Tunnel (Matching Reference Image)
const AlpineRoadTunnel = () => (
  <group>
    <mesh position={[-16, 12, 0]} castShadow receiveShadow>
      <boxGeometry args={[16, 26, 42]} />
      <meshStandardMaterial color="#1e293b" roughness={0.95} />
    </mesh>
    <mesh position={[16, 12, 0]} castShadow receiveShadow>
      <boxGeometry args={[16, 26, 42]} />
      <meshStandardMaterial color="#1e293b" roughness={0.95} />
    </mesh>
    <mesh position={[0, 18, 0]} castShadow>
      <boxGeometry args={[48, 14, 42]} />
      <meshStandardMaterial color="#0f172a" roughness={0.95} />
    </mesh>
    <mesh position={[0, 25.5, 0]}>
      <boxGeometry args={[50, 2.8, 44]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.92} />
    </mesh>

    {/* Arched Stone Entrance Portals */}
    {[-20, 20].map((pz, idx) => (
      <group key={idx} position={[0, 9.5, pz]}>
        <mesh position={[-10.8, 0, 0]} castShadow>
          <boxGeometry args={[3.8, 11, 2.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[10.8, 0, 0]} castShadow>
          <boxGeometry args={[3.8, 11, 2.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[0, 5.5, 0]} castShadow>
          <boxGeometry args={[25.5, 3.5, 2.5]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        <mesh position={[0, 4.2, idx === 0 ? -1.4 : 1.4]}>
          <sphereGeometry args={[0.3, 10, 10]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <pointLight position={[0, 4.2, idx === 0 ? -2 : 2]} intensity={3.5} distance={25} color="#f59e0b" />
      </group>
    ))}

    {/* Tunnel Interior Arched Vault Ceiling */}
    <mesh position={[0, 8.5, 0]}>
      <cylinderGeometry args={[10.5, 10.5, 40, 20, 1, true, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#0b0f19" roughness={0.95} side={THREE.BackSide} />
    </mesh>

    {/* Interior Sodium Tunnel Strip Lights */}
    {[-14, -5, 5, 14].map((lz, idx) => (
      <group key={idx} position={[0, 7.8, lz]}>
        <mesh>
          <boxGeometry args={[1.2, 0.15, 2.5]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0, -0.6, 0]} intensity={3.8} distance={20} color="#f59e0b" />
      </group>
    ))}
  </group>
);

// Alpine Summit Finish Line Gantry
const SnowFinishGantry = () => (
  <group>
    <mesh position={[-9.5, 5.5, 0]} castShadow>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} />
    </mesh>
    <mesh position={[9.5, 5.5, 0]} castShadow>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} />
    </mesh>
    <mesh position={[0, 10.5, 0]} castShadow>
      <boxGeometry args={[20.5, 1.8, 2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.9} />
    </mesh>
    <mesh position={[0, 9.2, 0.2]}>
      <boxGeometry args={[17, 1.4, 0.1]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.4} />
    </mesh>
    <mesh position={[0, 9.2, 0.3]}>
      <boxGeometry args={[9, 0.85, 0.05]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>
    <mesh position={[0, 11.5, 0]}>
      <boxGeometry args={[20.8, 0.4, 2.2]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.9} />
    </mesh>
  </group>
);
