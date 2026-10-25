import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore.js';
import { getTrackById } from '../../data/tracks.js';
import { MountainEnvironment } from './environments/MountainEnvironment.jsx';
import { CoastalEnvironment } from './environments/CoastalEnvironment.jsx';
import { SnowEnvironment } from './environments/SnowEnvironment.jsx';
import { CityEnvironment } from './environments/CityEnvironment.jsx';

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

// Scene Sky & Atmospheric Fog Manager driven by selected track
const SceneEnvironmentConfig = ({ track }) => {
  const { scene } = useThree();

  useEffect(() => {
    if (track.skyTheme === 'mountain') {
      scene.background = new THREE.Color(track.skyColorTop || '#152938');
      scene.fog = new THREE.FogExp2(track.fogColor || '#1c3032', track.fogDensity || 0.0028);
    } else if (track.skyTheme === 'snow') {
      scene.background = new THREE.Color(track.skyColorTop || '#0e1826');
      scene.fog = new THREE.FogExp2(track.fogColor || '#1e293b', track.fogDensity || 0.0038);
    } else if (track.skyTheme === 'city') {
      scene.background = new THREE.Color(track.skyColorTop || '#04060f');
      scene.fog = new THREE.FogExp2(track.fogColor || '#160826', track.fogDensity || 0.0024);
    } else {
      // Coastal sunset default
      scene.background = new THREE.Color(track.skyColorTop || '#2d1838');
      scene.fog = new THREE.FogExp2(track.fogColor || '#351d3e', track.fogDensity || 0.0032);
    }
  }, [track.id, scene]);

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

  // Position opponent cars ahead on the road with driver tags matching the screenshot
  const visibleOpponents = useMemo(() => {
    const playerRacer = racers.find(r => r.isPlayer);
    const playerProg = playerRacer?.progress || progress;

    const opponents = racers.filter(r => !r.isPlayer);
    const colors = ['#090d16', '#1e293b', '#7c2d12', '#14532d', '#1e1b4b', '#4c1d95', '#831843'];

    return opponents.slice(0, 6).map((racer, idx) => {
      const racerProg = racer.progress || 0;
      const deltaProg = racerProg - playerProg;
      const laneX = racer.lane !== undefined ? racer.lane * 3.2 : (idx % 2 === 0 ? 3.1 : -3.1);
      const baseZ = (8 - (racer.gridPosition || (idx < 3 ? idx + 1 : idx + 2))) * 4 + 10;
      const zPos = Math.max(-15, Math.min(90, baseZ + deltaProg * 320));

      return {
        id: racer.id || `opp-${idx}`,
        name: racer.name || racer.username,
        rank: racer.position || (idx + 1),
        position: [laneX, 0, zPos],
        color: colors[idx % colors.length],
        speed: racer.speed || 110
      };
    });
  }, [racers, progress]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 2.05, -5.8], fov: 56, near: 0.1, far: 500 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Dynamic Sky Background and Fog */}
        <SceneEnvironmentConfig track={track} />

        <DynamicChaseCamera speedKmh={speedKmh} />

        {/* --- Track-Specific Realistic Lighting --- */}
        {track.skyTheme === 'mountain' && (
          <>
            <ambientLight intensity={0.65} color="#86efac" />
            <directionalLight 
              position={[-18, 25, 30]} 
              intensity={2.2} 
              color="#fef08a" 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            <directionalLight position={[15, 8, -20]} intensity={0.4} color="#7dd3fc" />
          </>
        )}

        {track.skyTheme === 'coastal' && (
          <>
            <ambientLight intensity={0.7} color="#fed7aa" />
            <directionalLight 
              position={[-15, 18, 30]} 
              intensity={2.0} 
              color="#fb923c" 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            <directionalLight position={[15, 6, -20]} intensity={0.4} color="#818cf8" />
          </>
        )}

        {track.skyTheme === 'snow' && (
          <>
            <ambientLight intensity={0.85} color="#bfdbfe" />
            <directionalLight 
              position={[-12, 28, 25]} 
              intensity={1.9} 
              color="#e0f2fe" 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            <directionalLight position={[12, 6, -15]} intensity={0.5} color="#93c5fd" />
          </>
        )}

        {track.skyTheme === 'city' && (
          <>
            <ambientLight intensity={0.6} color="#581c87" />
            <directionalLight 
              position={[-25, 20, 20]} 
              intensity={2.4} 
              color="#d946ef" 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            <directionalLight position={[25, 15, -10]} intensity={2.0} color="#38bdf8" />
          </>
        )}

        {/* Ambient Twilight Stars */}
        <Stars radius={200} depth={50} count={900} factor={3} saturation={0} fade speed={1} />

        {/* --- Track-Specific 3D Landscapes & Scenery --- */}
        {track.id === 'mountain-circuit' && <MountainEnvironment speedKmh={speedKmh} />}
        {track.id === 'coastal-circuit' && <CoastalEnvironment speedKmh={speedKmh} />}
        {track.id === 'snow-circuit' && <SnowEnvironment speedKmh={speedKmh} />}
        {track.id === 'city-circuit' && <CityEnvironment speedKmh={speedKmh} />}

        {/* Fallback for any other custom circuit */}
        {!['mountain-circuit', 'coastal-circuit', 'snow-circuit', 'city-circuit'].includes(track.id) && (
          <CoastalEnvironment speedKmh={speedKmh} />
        )}

        {/* Player's Car (White Sports Car with 'meanwhile' plate matching Screenshot) */}
        <RealisticRaceCar 
          position={[0, 0, 0]} 
          color={selectedPaint || '#f8fafc'} 
          speed={speedKmh}
          isPlayer={true}
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
