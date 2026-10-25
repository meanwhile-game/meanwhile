import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore.js';
import { getTrackById } from '../../data/tracks.js';
import { getVehicleById } from '../../data/vehicles.js';

// Realistic 3D Car Model for Highway Simulation
const RacingCar = ({ position = [0, 0, 0], color = '#f8fafc', isPlayer = false, speed = 100 }) => {
  const carRef = useRef();
  const wheelsRef = useRef([]);

  useFrame((state, delta) => {
    // Wheel spin based on speed
    const spinDelta = (speed / 3.6) * delta * 5;
    wheelsRef.current.forEach(w => {
      if (w) w.rotation.x += spinDelta;
    });

    // Subtle suspension vibration
    if (carRef.current && isPlayer) {
      const rumble = Math.sin(state.clock.elapsedTime * 35) * (speed / 300) * 0.012;
      carRef.current.position.y = position[1] + rumble;
    }
  });

  const carColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group ref={carRef} position={position}>
      {/* Chassis Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.85, 0.42, 4.2]} />
        <meshPhysicalMaterial 
          color={carColor} 
          metalness={0.85} 
          roughness={0.18} 
          clearcoat={1.0} 
        />
      </mesh>

      {/* Cockpit / Greenhouse Glass */}
      <mesh position={[0, 0.8, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.46, 2.0]} />
        <meshStandardMaterial color="#050810" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Rear Wing */}
      <mesh position={[0, 0.95, -1.9]}>
        <boxGeometry args={[1.8, 0.05, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Glowing Taillights */}
      <mesh position={[-0.65, 0.52, -2.12]}>
        <boxGeometry args={[0.45, 0.08, 0.04]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.65, 0.52, -2.12]}>
        <boxGeometry args={[0.45, 0.08, 0.04]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Headlight Beams */}
      <mesh position={[-0.65, 0.45, 2.12]}>
        <boxGeometry args={[0.35, 0.08, 0.04]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.65, 0.45, 2.12]}>
        <boxGeometry args={[0.35, 0.08, 0.04]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 4 Wheels */}
      {[-0.95, 0.95].map((x, xi) =>
        [-1.3, 1.3].map((z, zi) => (
          <mesh
            key={`${xi}-${zi}`}
            ref={el => (wheelsRef.current[xi * 2 + zi] = el)}
            position={[x, 0.3, z]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.34, 0.34, 0.28, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.85} />
          </mesh>
        ))
      )}
    </group>
  );
};

// Continuous Moving Asphalt Road with Dashed Lane Lines & Roadside Lights
const HighwayEnvironment = ({ speedKmh = 100, theme = 'sunset' }) => {
  const roadOffsetRef = useRef(0);
  const roadMatRef = useRef();
  const dashesMatRef = useRef();
  const lampsGroupRef = useRef();

  useFrame((state, delta) => {
    // Offset road texture coordinates based on speed
    const moveStep = (speedKmh / 3.6) * delta;
    roadOffsetRef.current = (roadOffsetRef.current + moveStep) % 60;

    if (dashesMatRef.current) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 25;
    }

    if (lampsGroupRef.current) {
      lampsGroupRef.current.position.z = (lampsGroupRef.current.position.z + moveStep * 0.5) % 80;
    }
  });

  // Procedural dashed line texture
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 128, 512);

    // Center dashed white line
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
      {/* 3-Lane Asphalt Road Plane */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 260]} />
        <meshStandardMaterial 
          ref={roadMatRef}
          color="#0f1422" 
          roughness={0.85} 
          metalness={0.2} 
        />
      </mesh>

      {/* Road Lane Markings Overlay */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 260]} />
        <meshBasicMaterial 
          ref={dashesMatRef}
          map={dashesTexture} 
          transparent 
          opacity={0.8} 
        />
      </mesh>

      {/* Road Guardrails (Left and Right) */}
      <mesh position={[-8.2, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.7, 260]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[8.2, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.7, 260]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Roadside Lamp Posts passing by */}
      <group ref={lampsGroupRef} position={[0, 0, 0]}>
        {[-60, -20, 20, 60, 100, 140].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Lamp Post */}
            <mesh position={[-8.8, 3.5, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 7]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-7.8, 6.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <cylinderGeometry args={[0.06, 0.06, 2.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <pointLight position={[-7.2, 6.5, 0]} intensity={1.5} distance={20} color="#f59e0b" />

            {/* Right Lamp Post */}
            <mesh position={[8.8, 3.5, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 7]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <pointLight position={[7.2, 6.5, 0]} intensity={1.5} distance={20} color="#f59e0b" />
          </group>
        ))}
      </group>

      {/* Scenery Environment Background */}
      {theme === 'sunset' && (
        <group position={[0, 0, 180]}>
          {/* Distant Mountain Silhouettes */}
          <mesh position={[-50, 25, 0]}>
            <coneGeometry args={[60, 50, 4]} />
            <meshBasicMaterial color="#180e29" />
          </mesh>
          <mesh position={[45, 30, 10]}>
            <coneGeometry args={[70, 60, 4]} />
            <meshBasicMaterial color="#241238" />
          </mesh>
          {/* Ocean Plane on the Left */}
          <mesh position={[-80, -2, -60]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[120, 300]} />
            <meshStandardMaterial color="#0c1b33" roughness={0.1} metalness={0.8} />
          </mesh>
        </group>
      )}

      {theme === 'night' && (
        <group position={[0, 0, 160]}>
          {/* Cyber City Skyscrapers */}
          {[-45, -30, -18, 18, 30, 45].map((xPos, idx) => (
            <mesh key={idx} position={[xPos, 25 + (idx % 3) * 15, (idx % 2) * 20]}>
              <boxGeometry args={[14, 60 + (idx % 4) * 20, 16]} />
              <meshStandardMaterial color="#080c18" roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Camera Controller with Speed-Dependent Dynamic FOV and Chase Cam
const DynamicChaseCamera = ({ speedKmh = 100 }) => {
  const { camera } = useThree();

  useFrame((state, delta) => {
    // Dynamic FOV increases with speed (sensation of high velocity)
    const targetFov = 56 + Math.min(22, (speedKmh / 300) * 22);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 3);
    camera.updateProjectionMatrix();

    // Smooth subtle camera drift
    const sway = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    camera.position.x = sway;
  });

  return null;
};

export const RaceCanvas = () => {
  const { 
    speedKmh, 
    selectedPaint, 
    selectedTrackId, 
    selectedVehicleId, 
    racers, 
    progress 
  } = useGameStore();

  const track = getTrackById(selectedTrackId);

  // Position opponent cars on the road relative to player progress
  const visibleOpponents = useMemo(() => {
    const playerRacer = racers.find(r => r.isPlayer);
    const playerProg = playerRacer?.progress || progress;

    return racers
      .filter(r => !r.isPlayer)
      .slice(0, 4)
      .map((bot, idx) => {
        // Delta progress determines distance ahead/behind
        const deltaProgress = (bot.progress || 0) - playerProg;
        // Map delta progress to road Z meters (e.g. 5% ahead = 25m ahead)
        const relZ = Math.max(-15, Math.min(65, 8 + deltaProgress * 450));
        const laneX = bot.lane !== undefined ? bot.lane * 3.2 : ((idx % 2 === 0 ? -1 : 1) * 3.2);

        const botColors = ['#ef4444', '#38bdf8', '#a855f7', '#f59e0b'];

        return {
          id: bot.id,
          name: bot.name,
          position: [laneX, 0, relZ],
          color: botColors[idx % botColors.length],
          speed: bot.speed || 100
        };
      });
  }, [racers, progress]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 2.2, -5.5], fov: 58, near: 0.1, far: 500 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          scene.background = new THREE.Color(track.skyColorTop || '#080c16');
          scene.fog = new THREE.FogExp2(track.fogColor || '#0a1020', 0.0035);
        }}
      >
        <DynamicChaseCamera speedKmh={speedKmh} />

        {/* Ambient & Atmospheric Sun/Night Lights */}
        <ambientLight intensity={0.6} color={track.ambientLight || '#ffffff'} />
        <directionalLight 
          position={[0, 15, 20]} 
          intensity={1.4} 
          color="#fde047" 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[0, 8, -20]} intensity={0.5} color="#93c5fd" />

        {/* Distant Stars in Night / Twilight Skies */}
        <Stars radius={180} depth={50} count={1200} factor={4} saturation={0} fade speed={1} />

        {/* Road and Highway Environment */}
        <HighwayEnvironment speedKmh={speedKmh} theme={track.skyTheme || 'sunset'} />

        {/* Player's Car (Centered in Middle Lane) */}
        <RacingCar 
          position={[0, 0, 0]} 
          color={selectedPaint || '#f8fafc'} 
          isPlayer={true} 
          speed={speedKmh}
        />

        {/* Opponent Bot & Multiplayer Cars on the Road */}
        {visibleOpponents.map(opp => (
          <RacingCar
            key={opp.id}
            position={opp.position}
            color={opp.color}
            isPlayer={false}
            speed={opp.speed}
          />
        ))}

        {/* Contact Shadow beneath Player Car */}
        <ContactShadows 
          position={[0, -0.04, 0]} 
          opacity={0.8} 
          scale={6} 
          blur={1.2} 
          far={2.5} 
        />
      </Canvas>
    </div>
  );
};
