import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 03 SNOW CIRCUIT ENVIRONMENT (Dynamic Moving Alpine Landscape)
// Snow-covered mountains, pine forests, icy roads, snow particles, alpine rock tunnel, and summit finish gantry
export const SnowEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const snowTreesGroupRef = useRef();
  const snowFlurriesRef = useRef();
  const tunnelGroupRef = useRef();
  const glacierVistaRef = useRef();
  const finishGantryRef = useRef();

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

    // --- PROGRESSION OF LANDMARKS (The alpine landscape moves and takes the driver!) ---
    // 1. ALPINE ROCK TUNNEL: Approaches from far horizon (Z=240) and car zooms straight through it (Z=-60) during progress 20% -> 60%
    if (tunnelGroupRef.current) {
      const tunnelTargetZ = 240 - ((progress - 0.18) / 0.42) * 300;
      tunnelGroupRef.current.position.z = THREE.MathUtils.lerp(
        tunnelGroupRef.current.position.z,
        tunnelTargetZ,
        delta * 3.5
      );
    }

    // 2. FROZEN GLACIER LAKE RIDGE: Approaches as car emerges from tunnel (progress 55% -> 90%)
    if (glacierVistaRef.current) {
      const glacierTargetZ = 250 - ((progress - 0.50) / 0.40) * 260;
      glacierVistaRef.current.position.z = THREE.MathUtils.lerp(
        glacierVistaRef.current.position.z,
        glacierTargetZ,
        delta * 3.5
      );
    }

    // 3. ALPINE SUMMIT FINISH GANTRY: Approaches during final stretch (progress 78% -> 100%)
    if (finishGantryRef.current) {
      const gantryTargetZ = 240 - ((progress - 0.78) / 0.22) * 255;
      finishGantryRef.current.position.z = THREE.MathUtils.lerp(
        finishGantryRef.current.position.z,
        gantryTargetZ,
        delta * 3.5
      );
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

      {/* 3. APPROACHING ALPINE STONE TUNNEL (Spans over road - car drives straight inside!) */}
      <group ref={tunnelGroupRef} position={[0, 0, 240]}>
        <AlpineRoadTunnel />
      </group>

      {/* 4. FROZEN GLACIER LAKE RIDGE VISTA (Approaches after tunnel in Sector 3) */}
      <group ref={glacierVistaRef} position={[0, 0, 250]}>
        {/* Right Side: Frozen Turquoise Ice Lake with Specular Reflections */}
        <mesh position={[40, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[65, 180]} />
          <meshPhysicalMaterial 
            color="#0891b2" 
            roughness={0.06} 
            metalness={0.92} 
            clearcoat={1.0}
            clearcoatRoughness={0.04}
          />
        </mesh>
        {/* Jagged Iceberg Crags protruding from frozen lake */}
        {[-40, 0, 40].map((iz, idx) => (
          <mesh key={idx} position={[26, 0.5, iz]} rotation={[0, idx * 0.4, 0]}>
            <coneGeometry args={[7, 6, 5]} />
            <meshStandardMaterial color="#cffafe" roughness={0.2} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* 5. ALPINE SUMMIT FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <SnowFinishGantry />
      </group>

      {/* 6. TOWERING JAGGED SNOW-COVERED MOUNTAIN PEAKS */}
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

      {/* 7. LOOPING SNOW-COVERED PINES & RED-WHITE ALPINE HAZARD STAKES */}
      <group ref={snowTreesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            <SnowPineTree position={[-14, 0, 0]} scale={1.25} />
            <SnowPineTree position={[-20, 0, -4]} scale={1.6} />
            <SnowPineTree position={[-26, 0, 5]} scale={1.9} />
            <SnowPineTree position={[14, 0, 2]} scale={1.3} />
            <SnowPineTree position={[21, 0, -5]} scale={1.7} />
            <SnowHazardPole position={[-8.5, 0.9, 0]} />
            <SnowHazardPole position={[8.5, 0.9, 0]} />
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

// High Alpine Stone Mountain Road Tunnel (Spans the road - car drives inside!)
const AlpineRoadTunnel = () => (
  <group>
    {/* Left Mountain Rock Cliff flanking roadway */}
    <mesh position={[-16, 12, 0]}>
      <boxGeometry args={[16, 26, 42]} />
      <meshStandardMaterial color="#1e293b" roughness={0.95} />
    </mesh>
    {/* Right Mountain Rock Cliff */}
    <mesh position={[16, 12, 0]}>
      <boxGeometry args={[16, 26, 42]} />
      <meshStandardMaterial color="#1e293b" roughness={0.95} />
    </mesh>

    {/* Arched Stone Tunnel Roof & Mountain Pass Overhead */}
    <mesh position={[0, 18, 0]}>
      <boxGeometry args={[48, 14, 42]} />
      <meshStandardMaterial color="#0f172a" roughness={0.95} />
    </mesh>
    {/* Heavy Snow Drift Blanketing the Tunnel Ridge */}
    <mesh position={[0, 25.5, 0]}>
      <boxGeometry args={[50, 2.8, 44]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.92} />
    </mesh>

    {/* Stone Entrance Portals (Front & Rear Masonry Keystones) */}
    {[-20, 20].map((pz, idx) => (
      <group key={idx} position={[0, 9.5, pz]}>
        {/* Massive Arch Keystone Masonry */}
        <mesh position={[-9.5, 0, 0]}>
          <boxGeometry args={[3.5, 11, 2.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[9.5, 0, 0]}>
          <boxGeometry args={[3.5, 11, 2.5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[22.5, 3.5, 2.5]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Yellow Hazard Tunnel Warning Beacon */}
        <mesh position={[0, 4.2, idx === 0 ? -1.4 : 1.4]}>
          <sphereGeometry args={[0.3, 10, 10]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <pointLight position={[0, 4.2, idx === 0 ? -2 : 2]} intensity={3.5} distance={25} color="#f59e0b" />
      </group>
    ))}

    {/* Tunnel Interior Arched Vault Ceiling */}
    <mesh position={[0, 8.5, 0]}>
      <cylinderGeometry args={[9.5, 9.5, 40, 20, 1, true, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#0b0f19" roughness={0.95} side={THREE.BackSide} />
    </mesh>

    {/* Interior Sodium Tunnel Strip Lights (Warm yellow pools illuminating the road) */}
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
    {/* High-Visibility Steel Support Columns */}
    <mesh position={[-9.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} />
    </mesh>
    <mesh position={[9.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} />
    </mesh>

    {/* Overhead Race Timing Bridge */}
    <mesh position={[0, 10.5, 0]}>
      <boxGeometry args={[20.5, 1.8, 2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.9} />
    </mesh>

    {/* Checkered Finish Line Banner */}
    <mesh position={[0, 9.2, 0.2]}>
      <boxGeometry args={[17, 1.4, 0.1]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.4} />
    </mesh>

    {/* Digital Timing Display */}
    <mesh position={[0, 9.2, 0.3]}>
      <boxGeometry args={[9, 0.85, 0.05]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>

    {/* Green Finish Flashers */}
    {[-6, -2, 2, 6].map((fx, i) => (
      <group key={i} position={[fx, 8.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={3.5} distance={22} color="#22c55e" />
      </group>
    ))}

    {/* Snow Drift on Gantry Truss */}
    <mesh position={[0, 11.5, 0]}>
      <boxGeometry args={[20.8, 0.4, 2.2]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.9} />
    </mesh>

    {/* Road Finish Line Stripe on Icy Asphalt */}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16.5, 2.8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>
  </group>
);

