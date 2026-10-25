import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore.js';
import { getTrackById } from '../../data/tracks.js';

// High-fidelity 3D Racing Car matching the exact rear view in the reference screenshot
const RealisticRaceCar = ({ 
  position = [0, 0, 0], 
  color = '#f8fafc', 
  isPlayer = false, 
  speed = 100,
  driverTag = null 
}) => {
  const carRef = useRef();
  const wheelsRef = useRef([]);

  useFrame((state, delta) => {
    // Wheel angular spin
    const spinDelta = (speed / 3.6) * delta * 5.2;
    wheelsRef.current.forEach(w => {
      if (w) w.rotation.x += spinDelta;
    });

    // Subtle engine & suspension vibration
    if (carRef.current && isPlayer) {
      const rumble = Math.sin(state.clock.elapsedTime * 35) * (speed / 300) * 0.008;
      carRef.current.position.y = position[1] + rumble;
    }
  });

  const carColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group ref={carRef} position={position}>
      {/* Floating Driver Tag for Opponent Cars matching Screenshot (e.g. "1 kero", "2 aryan") */}
      {driverTag && (
        <Html position={[0, 1.8, 0]} center distanceFactor={18}>
          <div className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-lg whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5">
            <span className="text-amber-400 font-mono-num">{driverTag.rank}</span>
            <span>{driverTag.name}</span>
          </div>
        </Html>
      )}

      {/* Main Sculpted GT Body */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[1.88, 0.42, 4.2]} />
        <meshPhysicalMaterial 
          color={carColor} 
          metalness={0.88} 
          roughness={0.16} 
          clearcoat={1.0} 
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Aerodynamic Cockpit & Tinted Rear Window */}
      <mesh position={[0, 0.82, -0.2]} castShadow>
        <boxGeometry args={[1.42, 0.44, 2.1]} />
        <meshStandardMaterial color="#050810" roughness={0.1} metalness={0.92} />
      </mesh>

      {/* Carbon Rear Wing / Spoiler matching Screenshot */}
      <mesh position={[0, 1.05, -1.9]} castShadow>
        <boxGeometry args={[1.82, 0.05, 0.38]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Wing Struts */}
      <mesh position={[-0.55, 0.88, -1.9]}>
        <cylinderGeometry args={[0.02, 0.02, 0.32]} />
        <meshStandardMaterial color="#000000" metalness={0.9} />
      </mesh>
      <mesh position={[0.55, 0.88, -1.9]}>
        <cylinderGeometry args={[0.02, 0.02, 0.32]} />
        <meshStandardMaterial color="#000000" metalness={0.9} />
      </mesh>

      {/* Glowing Continuous Red Horizontal LED Taillight Bar matching Screenshot */}
      <mesh position={[0, 0.58, -2.12]}>
        <boxGeometry args={[1.72, 0.05, 0.04]} />
        <meshBasicMaterial color="#ff1111" />
      </mesh>
      {/* Left and Right Tail Clusters */}
      <mesh position={[-0.68, 0.58, -2.12]}>
        <boxGeometry args={[0.38, 0.12, 0.04]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>
      <mesh position={[0.68, 0.58, -2.12]}>
        <boxGeometry args={[0.38, 0.12, 0.04]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>

      {/* Rear License Plate Reading "meanwhile" matching Screenshot */}
      <mesh position={[0, 0.38, -2.12]}>
        <boxGeometry args={[0.55, 0.16, 0.02]} />
        <meshStandardMaterial color="#0a0e1a" roughness={0.6} />
      </mesh>
      {isPlayer && (
        <Html position={[0, 0.38, -2.14]} transform rotation={[0, Math.PI, 0]} scale={0.25} distanceFactor={10}>
          <div className="px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[7px] font-bold font-mono tracking-widest text-[#f8fafc] uppercase pointer-events-none select-none">
            meanwhile
          </div>
        </Html>
      )}

      {/* Dual Exhaust Tips */}
      <mesh position={[-0.45, 0.24, -2.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.45, 0.24, -2.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* 4 Wide Performance Wheels */}
      {[-0.96, 0.96].map((x, xi) =>
        [-1.3, 1.3].map((z, zi) => (
          <mesh
            key={`${xi}-${zi}`}
            ref={el => (wheelsRef.current[xi * 2 + zi] = el)}
            position={[x, 0.32, z]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.35, 0.35, 0.3, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.85} />
          </mesh>
        ))
      )}
    </group>
  );
};

// Scenic Coastal Highway Environment with Tunnel Portal and Ocean matching Screenshot
const ScenicCoastalRoad = ({ speedKmh = 100 }) => {
  const roadOffsetRef = useRef(0);
  const roadMatRef = useRef();
  const dashesMatRef = useRef();
  const lampsGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;
    roadOffsetRef.current = (roadOffsetRef.current + moveStep) % 60;

    if (dashesMatRef.current) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 22;
    }

    if (lampsGroupRef.current) {
      lampsGroupRef.current.position.z = (lampsGroupRef.current.position.z + moveStep * 0.5) % 80;
    }
  });

  // Dashed lane line texture
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111726';
    ctx.fillRect(0, 0, 128, 512);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(60, 40, 8, 140);
    ctx.fillRect(60, 290, 8, 140);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 20);
    return tex;
  }, []);

  return (
    <group>
      {/* 3-Lane Asphalt Road Surface */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 260]} />
        <meshStandardMaterial 
          ref={roadMatRef}
          color="#161c2b" 
          roughness={0.75} 
          metalness={0.25} 
        />
      </mesh>

      {/* Road Markings */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 260]} />
        <meshBasicMaterial 
          ref={dashesMatRef}
          map={dashesTexture} 
          transparent 
          opacity={0.85} 
        />
      </mesh>

      {/* Left & Right Guardrails */}
      <mesh position={[-8.2, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.7, 260]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[8.2, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.7, 260]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Tunnel Entrance Portal Ahead on the Left matching Screenshot */}
      <group position={[-6, 4, 120]}>
        {/* Stone Arch Portal */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[14, 9, 8]} />
          <meshStandardMaterial color="#2d3748" roughness={0.9} />
        </mesh>
        {/* Tunnel Interior Void */}
        <mesh position={[0, -0.5, 2]}>
          <boxGeometry args={[11, 7, 7]} />
          <meshBasicMaterial color="#050810" />
        </mesh>
        {/* Warm Golden Illuminated Tunnel Portal Light matching Screenshot */}
        <pointLight position={[0, 1.5, 1]} intensity={3.5} distance={35} color="#f59e0b" />
        <pointLight position={[0, 2, 6]} intensity={2.5} distance={25} color="#fbbf24" />
      </group>

      {/* Left Side: Steep Coastal Mountain Cliffs matching Screenshot */}
      <group position={[-38, 20, 70]}>
        <mesh rotation={[0, 0.3, 0]}>
          <coneGeometry args={[45, 55, 6]} />
          <meshStandardMaterial color="#2a1f33" roughness={0.95} />
        </mesh>
        <mesh position={[12, -8, 40]} rotation={[0, -0.2, 0]}>
          <coneGeometry args={[35, 45, 6]} />
          <meshStandardMaterial color="#1f1826" roughness={0.95} />
        </mesh>
      </group>

      {/* Right Side: Mediterranean Sunset Ocean with Calm Waters matching Screenshot */}
      <group position={[70, -2, 40]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[110, 280]} />
          <meshStandardMaterial color="#14213d" roughness={0.1} metalness={0.85} />
        </mesh>
        {/* Distant Sailboat Silhouettes */}
        <mesh position={[15, 2, 30]}>
          <coneGeometry args={[1.5, 4, 3]} />
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
        <mesh position={[30, 1.5, 70]}>
          <coneGeometry args={[1.2, 3.2, 3]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      </group>

      {/* Passing Golden Lampposts matching Screenshot */}
      <group ref={lampsGroupRef} position={[0, 0, 0]}>
        {[-50, -10, 30, 70, 110, 150].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Lamppost */}
            <mesh position={[-8.8, 3.8, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 7.5]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-7.8, 7.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <cylinderGeometry args={[0.06, 0.06, 2.4]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <pointLight position={[-7.2, 6.8, 0]} intensity={1.8} distance={22} color="#f59e0b" />
          </group>
        ))}
      </group>
    </group>
  );
};

// Dynamic Camera with Chase Cam and Speed FOV
const DynamicChaseCamera = ({ speedKmh = 100 }) => {
  const { camera } = useThree();

  useFrame((state, delta) => {
    // Dynamic FOV increases with speed
    const targetFov = 55 + Math.min(22, (speedKmh / 300) * 22);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 3.5);
    camera.updateProjectionMatrix();

    // Smooth subtle camera sway
    const sway = Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
    camera.position.x = sway;
  });

  return null;
};

export const RaceCanvas = () => {
  const { 
    speedKmh, 
    selectedPaint, 
    selectedTrackId, 
    racers, 
    progress 
  } = useGameStore();

  const track = getTrackById(selectedTrackId);

  // Position opponent cars ahead on the road with driver tags matching the screenshot!
  // In the screenshot: 1 kero (right), 2 aryan (middle), 3 nova (left)
  const visibleOpponents = useMemo(() => {
    const playerRacer = racers.find(r => r.isPlayer);
    const playerProg = playerRacer?.progress || progress;

    const opponentConfigs = [
      { name: 'kero', rank: 1, laneX: 3.2, baseOffsetZ: 14, color: '#090d16' },
      { name: 'aryan', rank: 2, laneX: 0.0, baseOffsetZ: 28, color: '#1e293b' },
      { name: 'nova', rank: 3, laneX: -3.2, baseOffsetZ: 38, color: '#7c2d12' }
    ];

    return opponentConfigs.map((cfg) => {
      const racerData = racers.find(r => (r.name || r.username)?.toLowerCase() === cfg.name) || {};
      const botProg = racerData.progress || 0;
      const deltaProg = botProg - playerProg;
      const zPos = Math.max(-10, Math.min(85, cfg.baseOffsetZ + deltaProg * 350));

      return {
        id: `opp-${cfg.name}`,
        name: cfg.name,
        rank: cfg.rank,
        position: [cfg.laneX, 0, zPos],
        color: cfg.color,
        speed: racerData.speed || 116
      };
    });
  }, [racers, progress]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 2.05, -5.8], fov: 56, near: 0.1, far: 500 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ scene }) => {
          // Warm sunset twilight sky gradient matching screenshot
          scene.background = new THREE.Color('#2d1838');
          scene.fog = new THREE.FogExp2('#351d3e', 0.0032);
        }}
      >
        <DynamicChaseCamera speedKmh={speedKmh} />

        {/* Ambient & Golden Sunset Directional Sunlight */}
        <ambientLight intensity={0.7} color="#fed7aa" />
        <directionalLight 
          position={[-15, 18, 30]} 
          intensity={1.9} 
          color="#fb923c" 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[15, 6, -20]} intensity={0.4} color="#818cf8" />

        {/* Twilight Stars */}
        <Stars radius={200} depth={50} count={900} factor={3} saturation={0} fade speed={1} />

        {/* Coastal Highway & Mountain Environment with Tunnel */}
        <ScenicCoastalRoad speedKmh={speedKmh} />

        {/* Player's Car (White Sports Car with 'meanwhile' plate matching Screenshot) */}
        <RacingCarWithPlate 
          position={[0, 0, 0]} 
          color={selectedPaint || '#f8fafc'} 
          speed={speedKmh}
        />

        {/* Opponent Cars with Floating Driver Tags (1 kero, 2 aryan, 3 nova) */}
        {visibleOpponents.map(opp => (
          <RealisticRaceCar
            key={opp.id}
            position={opp.position}
            color={opp.color}
            isPlayer={false}
            speed={opp.speed}
            driverTag={{ rank: opp.rank, name: opp.name }}
          />
        ))}

        {/* Contact Shadow beneath Player Car */}
        <ContactShadows 
          position={[0, -0.04, 0]} 
          opacity={0.88} 
          scale={6.5} 
          blur={1.4} 
          far={2.8} 
        />
      </Canvas>
    </div>
  );
};

// Player Car with White Finish and 'meanwhile' plate
const RacingCarWithPlate = ({ position, color, speed }) => (
  <RealisticRaceCar
    position={position}
    color={color}
    isPlayer={true}
    speed={speed}
  />
);
