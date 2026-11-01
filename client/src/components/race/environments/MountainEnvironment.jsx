import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 01 MOUNTAIN PASS ENVIRONMENT (Dynamic Moving Landscape)
// Dense pine forests, waterfalls, alpine stone viaduct, and summit pass that dynamically approach and pass the driver
export const MountainEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const curbLeftMatRef = useRef();
  const curbRightMatRef = useRef();
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
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 30;
    }
    if (curbLeftMatRef.current && curbLeftMatRef.current.map) {
      curbLeftMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 30;
    }
    if (curbRightMatRef.current && curbRightMatRef.current.map) {
      curbRightMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 30;
    }

    // Roadside pine trees streaming past
    if (treesGroupRef.current) {
      treesGroupRef.current.position.z = (treesGroupRef.current.position.z + moveStep * 0.9) % 60;
    }

    // Floating mountain valley mist drift
    if (mistGroupRef.current) {
      mistGroupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 2;
      mistGroupRef.current.position.z = (mistGroupRef.current.position.z + moveStep * 0.2) % 100;
    }

    // Cascading waterfall animation
    if (waterfallStreamRef.current && waterfallStreamRef.current.material) {
      waterfallStreamRef.current.material.opacity = 0.85 + Math.sin(state.clock.elapsedTime * 12) * 0.08;
    }
    if (waterfallSprayRef.current) {
      waterfallSprayRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
      waterfallSprayRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 8) * 0.15;
    }

    // --- PROGRESSION OF LANDMARKS (The landscape actually changes and takes the driver!) ---
    // 1. The Great Waterfall Gorge: approaches during first half of race (progress 0% -> 50%)
    if (waterfallGroupRef.current) {
      const waterfallZ = 220 - (progress / 0.45) * 300;
      waterfallGroupRef.current.position.z = THREE.MathUtils.lerp(
        waterfallGroupRef.current.position.z,
        waterfallZ,
        delta * 3.5
      );
    }

    // 2. High Alpine Stone Viaduct Arch Bridge: approaches and car drives underneath it (progress 35% -> 80%)
    if (viaductGroupRef.current) {
      const viaductZ = 260 - ((progress - 0.35) / 0.40) * 340;
      viaductGroupRef.current.position.z = THREE.MathUtils.lerp(
        viaductGroupRef.current.position.z,
        viaductZ,
        delta * 3.5
      );
    }

    // 3. Mountain Summit Finish Gantry: approaches during race conclusion (progress 70% -> 100%)
    if (summitGroupRef.current) {
      const summitZ = 240 - ((progress - 0.70) / 0.30) * 260;
      summitGroupRef.current.position.z = THREE.MathUtils.lerp(
        summitGroupRef.current.position.z,
        summitZ,
        delta * 3.5
      );
    }
  });

  // Mountain Asphalt Texture: Double Yellow Center Line + White Shoulder Lines
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#161e26';
    ctx.fillRect(0, 0, 256, 512);

    // Subtle aggregate noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
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

  // Red & White FIA Racing Rumble Strips
  const curbTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#f8fafc';
      ctx.fillRect(0, i * 32, 64, 32);
    }
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
        <planeGeometry args={[16.5, 300]} />
        <meshStandardMaterial color="#161e26" roughness={0.78} metalness={0.18} />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.2, 300]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.92} />
      </mesh>

      {/* Red/White FIA Kerbs on road edges */}
      <mesh position={[-8.3, -0.035, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 300]} />
        <meshBasicMaterial ref={curbLeftMatRef} map={curbTexture} />
      </mesh>
      <mesh position={[8.3, -0.035, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 300]} />
        <meshBasicMaterial ref={curbRightMatRef} map={curbTexture} />
      </mesh>

      {/* Steel Guardrails with Amber Reflectors */}
      <group position={[-8.8, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.25, 0.72, 300]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.28} />
        </mesh>
        {[-90, -50, -10, 30, 70, 110, 150].map((zP, i) => (
          <mesh key={i} position={[0, -0.4, zP]}>
            <cylinderGeometry args={[0.06, 0.06, 0.9]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        ))}
      </group>

      <group position={[8.8, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.25, 0.72, 300]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.28} />
        </mesh>
        {[-90, -50, -10, 30, 70, 110, 150].map((zP, i) => (
          <mesh key={i} position={[0, -0.4, zP]}>
            <cylinderGeometry args={[0.06, 0.06, 0.9]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 2. DYNAMIC LANDMARK: CASCADING WATERFALL GORGE (Moves and passes the player!) */}
      <group ref={waterfallGroupRef} position={[-28, 18, 220]}>
        {/* Massive Granite Cliff Face */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[22, 48, 65]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
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
            emissiveIntensity={0.25} 
            roughness={0.15} 
            metalness={0.8} 
            transparent 
            opacity={0.92} 
          />
        </mesh>
        {/* Foaming Plunge Pool */}
        <mesh ref={waterfallSprayRef} position={[10.5, -16, 2]}>
          <boxGeometry args={[8.5, 3.2, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.1} transparent opacity={0.85} />
        </mesh>
        <pointLight position={[9, -8, 2]} intensity={2.5} distance={35} color="#7dd3fc" />
      </group>

      {/* 3. DYNAMIC LANDMARK: HIGH ALPINE STONE VIADUCT ARCH BRIDGE (Car drives underneath!) */}
      <group ref={viaductGroupRef} position={[0, 12, 280]}>
        {/* Upper Viaduct Deck */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[75, 4, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* 3 Heavy Stone Arches spanning over the highway */}
        {[-22, 0, 22].map((xArch, i) => (
          <group key={i} position={[xArch, 0, 0]}>
            <mesh position={[-5.8, -4, 0]}>
              <boxGeometry args={[2.5, 12, 9]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[5.8, -4, 0]}>
              <boxGeometry args={[2.5, 12, 9]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[11, 3.5, 8.8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. DYNAMIC LANDMARK: MOUNTAIN SUMMIT FINISH GANTRY (Approaches at finish!) */}
      <group ref={summitGroupRef} position={[0, 6, 260]}>
        {/* Checkered Racing Finish Gantry */}
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[22, 1.8, 1.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* Support Pylons on left and right */}
        <mesh position={[-9.5, 2.5, 0]}>
          <boxGeometry args={[0.8, 6.5, 0.8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} />
        </mesh>
        <mesh position={[9.5, 2.5, 0]}>
          <boxGeometry args={[0.8, 6.5, 0.8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} />
        </mesh>
        {/* Finish Line Banner Text Bar */}
        <mesh position={[0, 5.5, 0.65]}>
          <planeGeometry args={[18, 1.4]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* 5. DISTANT ALPINE PEAKS WITH SNOW CAPS (Natural Parallax) */}
      <group position={[-55, 32, 160]}>
        <mesh rotation={[0, 0.4, 0]}>
          <coneGeometry args={[55, 82, 5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        <mesh position={[0, 31, 0]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[18, 24, 5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      </group>

      <group position={[58, 30, 175]}>
        <mesh rotation={[0, -0.3, 0]}>
          <coneGeometry args={[50, 75, 5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
        <mesh position={[0, 28, 0]} rotation={[0, -0.3, 0]}>
          <coneGeometry args={[16, 22, 5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      </group>

      {/* 6. MIST DRIFT */}
      <group ref={mistGroupRef} position={[0, 6, 80]}>
        <mesh position={[-20, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[45, 30]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <mesh position={[18, 4, 25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 28]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.10} depthWrite={false} />
        </mesh>
      </group>

      {/* 7. LOOPING EVERGREEN PINE FOREST CLUSTERS */}
      <group ref={treesGroupRef} position={[0, 0, 0]}>
        {[-45, -15, 15, 45, 75, 105, 135].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            <MountainPine position={[-13.5, 0, 0]} scale={1.25} />
            <MountainPine position={[-19, 0, -4]} scale={1.6} dark />
            <MountainPine position={[-25, 0, 6]} scale={1.9} />

            <MountainPine position={[13.5, 0, 2]} scale={1.3} />
            <MountainPine position={[19.5, 0, -5]} scale={1.65} dark />
            <MountainPine position={[26, 0, 4]} scale={2.0} />

            {idx % 2 === 0 && (
              <group position={[9.2, 1.8, 0]} rotation={[0, -Math.PI / 9, 0]}>
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
