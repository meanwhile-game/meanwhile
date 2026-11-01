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
import { ChennaiEnvironment } from './environments/ChennaiEnvironment.jsx';
import { DelhiEnvironment } from './environments/DelhiEnvironment.jsx';

// AAA-Grade High-Fidelity 3D GT Supercar Model
const RealisticRaceCar = ({ 
  position = [0, 0, 0], 
  color = '#f8fafc', 
  isPlayer = false, 
  speed = 100,
  driverTag = null 
}) => {
  const carRef = useRef();
  const wheelsRef = useRef([]);
  const exhaustGlowRef = useRef();

  useFrame((state, delta) => {
    // 1. Wheel angular rotation based on vehicle velocity
    const spinDelta = (speed / 3.6) * delta * 5.6;
    wheelsRef.current.forEach(w => {
      if (w) w.rotation.x += spinDelta;
    });

    // 2. Dynamic suspension physics & engine rumble
    if (carRef.current) {
      // Idle & road vibration
      const rumble = Math.sin(state.clock.elapsedTime * 36) * Math.max(0.002, (speed / 320) * 0.009);
      // Acceleration squat (rear dips subtly under heavy throttle)
      const squat = Math.min(0.035, (speed / 320) * 0.035);
      carRef.current.position.y = position[1] + rumble - (isPlayer ? squat * 0.5 : 0);
      carRef.current.rotation.x = isPlayer ? squat * 0.35 : 0;
    }

    // 3. Exhaust heat glow pulsation
    if (exhaustGlowRef.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 22) * 0.2;
      exhaustGlowRef.current.intensity = (speed / 300) * 2.5 * pulse;
    }
  });

  const carColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group ref={carRef} position={position}>
      {/* Floating Driver Badge for Opponents (e.g. "1 kero", "2 aryan") */}
      {driverTag && (
        <Html position={[0, 1.85, 0]} center distanceFactor={18}>
          <div className="px-2.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-xl whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5">
            <span className="text-amber-400 font-mono-num">#{driverTag.rank}</span>
            <span className="tracking-wide">{driverTag.name}</span>
          </div>
        </Html>
      )}

      {/* 1. AERODYNAMIC CARBON LOWER CHASSIS & FRONT SPLITTER */}
      <mesh position={[0, 0.16, 0.1]} castShadow>
        <boxGeometry args={[1.96, 0.08, 4.35]} />
        <meshStandardMaterial color="#090d16" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* Front Aero Splitter Winglets */}
      <mesh position={[-0.96, 0.16, 2.1]}>
        <boxGeometry args={[0.08, 0.12, 0.35]} />
        <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0.96, 0.16, 2.1]}>
        <boxGeometry args={[0.08, 0.12, 0.35]} />
        <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* 2. SCULPTED GT SUPERCAR BODY (High-Reflectivity Metallic Clearcoat) */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[1.92, 0.42, 4.2]} />
        <meshPhysicalMaterial 
          color={carColor} 
          metalness={0.88} 
          roughness={0.14} 
          clearcoat={1.0} 
          clearcoatRoughness={0.08}
          reflectivity={0.95}
        />
      </mesh>

      {/* Aerodynamic Flared Rear Fenders */}
      <mesh position={[-0.98, 0.46, -0.9]} castShadow>
        <boxGeometry args={[0.14, 0.36, 1.8]} />
        <meshPhysicalMaterial color={carColor} metalness={0.88} roughness={0.14} clearcoat={1.0} />
      </mesh>
      <mesh position={[0.98, 0.46, -0.9]} castShadow>
        <boxGeometry args={[0.14, 0.36, 1.8]} />
        <meshPhysicalMaterial color={carColor} metalness={0.88} roughness={0.14} clearcoat={1.0} />
      </mesh>

      {/* Side Air Scoops / Intakes */}
      <mesh position={[-0.97, 0.38, -0.2]}>
        <boxGeometry args={[0.08, 0.22, 0.7]} />
        <meshStandardMaterial color="#050810" roughness={0.5} />
      </mesh>
      <mesh position={[0.97, 0.38, -0.2]}>
        <boxGeometry args={[0.08, 0.22, 0.7]} />
        <meshStandardMaterial color="#050810" roughness={0.5} />
      </mesh>

      {/* 3. TINTED COCKPIT CANOPY & ROOF INTAKE */}
      <mesh position={[0, 0.82, -0.2]} castShadow>
        <boxGeometry args={[1.42, 0.44, 2.15]} />
        <meshStandardMaterial color="#05070e" roughness={0.08} metalness={0.94} />
      </mesh>
      {/* Aerodynamic Roof Scoop */}
      <mesh position={[0, 1.06, 0.2]}>
        <boxGeometry args={[0.38, 0.08, 0.65]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Rear Window Glass Louvers */}
      {[-0.6, -0.85, -1.1].map((zLouver, i) => (
        <mesh key={i} position={[0, 0.78, zLouver]}>
          <boxGeometry args={[1.15, 0.03, 0.18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}

      {/* 4. CARBON FIBER REAR WING / GT SPOILER WITH ENDPLATES */}
      <mesh position={[0, 1.08, -1.95]} castShadow>
        <boxGeometry args={[1.88, 0.05, 0.42]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Aerodynamic Endplates */}
      <mesh position={[-0.95, 1.08, -1.95]}>
        <boxGeometry args={[0.04, 0.22, 0.46]} />
        <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.95, 1.08, -1.95]}>
        <boxGeometry args={[0.04, 0.22, 0.46]} />
        <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Twin Aluminum Pylons */}
      <mesh position={[-0.55, 0.88, -1.95]}>
        <cylinderGeometry args={[0.025, 0.025, 0.36]} />
        <meshStandardMaterial color="#334155" metalness={0.95} />
      </mesh>
      <mesh position={[0.55, 0.88, -1.95]}>
        <cylinderGeometry args={[0.025, 0.025, 0.36]} />
        <meshStandardMaterial color="#334155" metalness={0.95} />
      </mesh>

      {/* 5. RADIANT REAR FASCIA & GLOWING LED LIGHTBAR */}
      {/* Continuous Horizontal LED Taillight Bar */}
      <mesh position={[0, 0.58, -2.12]}>
        <boxGeometry args={[1.76, 0.05, 0.04]} />
        <meshBasicMaterial color="#ff1111" />
      </mesh>
      {/* Outer Angular Brake Clusters */}
      <mesh position={[-0.72, 0.58, -2.12]}>
        <boxGeometry args={[0.34, 0.12, 0.04]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>
      <mesh position={[0.72, 0.58, -2.12]}>
        <boxGeometry args={[0.34, 0.12, 0.04]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>
      {/* White Reverse Lamp Inserts */}
      <mesh position={[-0.42, 0.54, -2.12]}>
        <boxGeometry args={[0.12, 0.04, 0.03]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.42, 0.54, -2.12]}>
        <boxGeometry args={[0.12, 0.04, 0.03]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* Ambient Red Taillight Road Wash Light for Player */}
      {isPlayer && (
        <pointLight position={[0, 0.55, -2.25]} intensity={2.2} distance={8} color="#ef4444" />
      )}

      {/* Rear License Plate Reading "meanwhile" */}
      <mesh position={[0, 0.38, -2.12]}>
        <boxGeometry args={[0.58, 0.17, 0.02]} />
        <meshStandardMaterial color="#080c18" roughness={0.6} />
      </mesh>
      {isPlayer && (
        <Html position={[0, 0.38, -2.14]} transform rotation={[0, Math.PI, 0]} scale={0.25} distanceFactor={10}>
          <div className="px-2 py-0.5 rounded bg-black/90 border border-white/25 text-[7px] font-bold font-mono tracking-widest text-[#f8fafc] uppercase pointer-events-none select-none shadow-md">
            meanwhile
          </div>
        </Html>
      )}

      {/* 6. REAR CARBON DIFFUSER WITH VERTICAL STRAKES */}
      <mesh position={[0, 0.22, -2.08]}>
        <boxGeometry args={[1.72, 0.18, 0.24]} />
        <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
      </mesh>
      {[-0.6, -0.2, 0.2, 0.6].map((xStrafe, idx) => (
        <mesh key={idx} position={[xStrafe, 0.2, -2.1]}>
          <boxGeometry args={[0.03, 0.16, 0.3]} />
          <meshStandardMaterial color="#050810" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* 7. DUAL TITANIUM EXHAUST TAILPIPES WITH HEAT GLOW */}
      <group position={[0, 0.24, -2.14]}>
        {/* Left Exhaust Pipe */}
        <mesh position={[-0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.12, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Left Glowing Heat Core */}
        <mesh position={[-0.45, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>

        {/* Right Exhaust Pipe */}
        <mesh position={[0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.12, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Right Glowing Heat Core */}
        <mesh position={[0.45, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>

        {/* Exhaust Heat Glow PointLight */}
        <pointLight ref={exhaustGlowRef} position={[0, 0, -0.2]} intensity={1.5} distance={5} color="#f97316" />
      </group>

      {/* 8. HIGH-DETAIL PERFORMANCE WHEELS WITH ROTORS & BREMBO CALIPERS */}
      {[-0.98, 0.98].map((x, xi) =>
        [-1.3, 1.3].map((z, zi) => (
          <group
            key={`${xi}-${zi}`}
            position={[x, 0.32, z]}
          >
            {/* Spinning Tire & Alloy Rim Wheel Group */}
            <group ref={el => (wheelsRef.current[xi * 2 + zi] = el)}>
              {/* Outer Performance Rubber Tire */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.28, 24]} />
                <meshStandardMaterial color="#090d16" roughness={0.88} />
              </mesh>
              {/* Inner Metallic Alloy Multi-Spoke Rim */}
              <mesh position={[xi === 0 ? -0.02 : 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.26, 0.26, 0.26, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />
              </mesh>
              {/* Center Wheel Hub Lug */}
              <mesh position={[xi === 0 ? -0.15 : 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.07, 0.07, 0.04, 12]} />
                <meshStandardMaterial color="#090d16" metalness={0.9} />
              </mesh>
            </group>

            {/* Static Drilled Carbon-Ceramic Brake Disc Rotor */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Static High-Performance Red Racing Brake Caliper */}
            <mesh position={[0, 0.14, 0.08]}>
              <boxGeometry args={[0.08, 0.12, 0.12]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
          </group>
        ))
      )}

      {/* 9. SPEED-RESPONSIVE TIRE SPRAY MIST & SPEED TRAILS */}
      {speed > 40 && (
        <group position={[0, 0.18, -2.35]}>
          <mesh position={[-0.98, 0, 0]} rotation={[-Math.PI / 5, 0, 0]}>
            <planeGeometry args={[0.45, 1.8]} />
            <meshBasicMaterial color="#e2e8f0" transparent opacity={Math.min(0.38, speed / 320)} depthWrite={false} />
          </mesh>
          <mesh position={[0.98, 0, 0]} rotation={[-Math.PI / 5, 0, 0]}>
            <planeGeometry args={[0.45, 1.8]} />
            <meshBasicMaterial color="#e2e8f0" transparent opacity={Math.min(0.38, speed / 320)} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// High-Speed Wind Particle Streaks rushing past the camera
const SpeedWindStreaks = ({ speedKmh = 100 }) => {
  const streaksRef = useRef();

  const streakLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = Math.random() * 3.5 + 0.5;
      const z = (Math.random() - 0.5) * 60 + 10;
      lines.push(x, y, z);
    }
    return new Float32Array(lines);
  }, []);

  useFrame((state, delta) => {
    if (streaksRef.current && speedKmh > 70) {
      const move = (speedKmh / 3.6) * delta * 2.5;
      streaksRef.current.position.z = ((streaksRef.current.position.z - move) % 60);
    }
  });

  if (speedKmh <= 70) return null;

  return (
    <points ref={streaksRef} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={streakLines.length / 3}
          array={streakLines}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.18} 
        color="#ffffff" 
        transparent 
        opacity={Math.min(0.55, (speedKmh - 70) / 200)} 
        depthWrite={false}
      />
    </points>
  );
};

// Dynamic Chase Camera with Spring Physics, Speed FOV & Dynamic Curve Banking
const DynamicChaseCamera = ({ speedKmh = 100, progress = 0 }) => {
  const { camera } = useThree();

  useFrame((state, delta) => {
    // Dynamic FOV widening: expands naturally from 56° at idle to 74° at maximum velocity
    const targetFov = 56 + Math.min(18, (speedKmh / 310) * 18);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 3.5);
    camera.updateProjectionMatrix();

    // Subtle acceleration pull-back: camera pulls back slightly during high speed
    const pullBackZ = -5.8 - Math.min(0.55, (speedKmh / 310) * 0.55);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, pullBackZ, delta * 3.0);

    // Natural road vibration (>120 km/h)
    let rumbleX = 0;
    let rumbleY = 0;
    if (speedKmh > 120) {
      const shakeIntensity = ((speedKmh - 120) / 200) * 0.014;
      rumbleX = (Math.random() - 0.5) * shakeIntensity;
      rumbleY = (Math.random() - 0.5) * shakeIntensity;
    }

    // Dynamic Road Curve Sway (gives real feeling of the road turning and taking the driver)
    const curveFactor = Math.sin(state.clock.elapsedTime * 0.4 + progress * 8) * 0.35;
    camera.position.x = curveFactor * 0.6 + rumbleX;
    camera.position.y = 2.05 + rumbleY;
    camera.lookAt(curveFactor * 0.3, 0.95, 22);
  });

  return null;
};

// Photorealistic Atmospheric Sky Dome with horizon gradients and distant terrain silhouettes
const RealisticSkyDome = ({ track }) => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sky gradient from zenith to horizon
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (track.skyTheme === 'coastal') {
      grad.addColorStop(0, '#0a1628');
      grad.addColorStop(0.35, '#1e293b');
      grad.addColorStop(0.65, '#ea580c');
      grad.addColorStop(0.85, '#f59e0b');
      grad.addColorStop(1.0, '#38bdf8');
    } else if (track.skyTheme === 'chennai') {
      grad.addColorStop(0, '#090e1f');
      grad.addColorStop(0.38, '#1e293b');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(0.9, '#f59e0b');
      grad.addColorStop(1.0, '#fed7aa');
    } else if (track.skyTheme === 'delhi') {
      grad.addColorStop(0, '#060a18');
      grad.addColorStop(0.4, '#17112b');
      grad.addColorStop(0.7, '#3b0764');
      grad.addColorStop(0.9, '#d97706');
      grad.addColorStop(1.0, '#fbbf24');
    } else if (track.skyTheme === 'mountain') {
      grad.addColorStop(0, '#081426');
      grad.addColorStop(0.4, '#172554');
      grad.addColorStop(0.72, '#1e3a8a');
      grad.addColorStop(0.9, '#22c55e');
      grad.addColorStop(1.0, '#86efac');
    } else if (track.skyTheme === 'snow') {
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.4, '#0f172a');
      grad.addColorStop(0.75, '#334155');
      grad.addColorStop(1.0, '#93c5fd');
    } else {
      // City
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.45, '#1e1035');
      grad.addColorStop(0.8, '#581c87');
      grad.addColorStop(1.0, '#38bdf8');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Distant mountain / skyline silhouettes on the horizon
    ctx.fillStyle = 'rgba(10, 15, 26, 0.72)';
    ctx.beginPath();
    ctx.moveTo(0, 512);
    for (let x = 0; x <= 1024; x += 16) {
      const peak = Math.sin(x * 0.02) * 45 + Math.cos(x * 0.05) * 25 + 410;
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(1024, 512);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [track.skyTheme]);

  return (
    <mesh position={[0, -10, 0]}>
      <sphereGeometry args={[420, 32, 16]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
};

// Scene Sky & Atmospheric Fog Manager driven by selected track
const SceneEnvironmentConfig = ({ track }) => {
  const { scene } = useThree();

  useEffect(() => {
    let topColor = track.skyColorTop || '#152938';
    let fogCol = track.fogColor || '#1c3032';

    if (track.skyTheme === 'mountain') {
      topColor = '#0f172a';
      fogCol = '#1e293b';
    } else if (track.skyTheme === 'snow') {
      topColor = '#0b1626';
      fogCol = '#1e293b';
    } else if (track.skyTheme === 'city') {
      topColor = '#060914';
      fogCol = '#160826';
    } else if (track.skyTheme === 'chennai') {
      topColor = '#162238';
      fogCol = '#2a1a28';
    } else if (track.skyTheme === 'delhi') {
      topColor = '#0a0e20';
      fogCol = '#1c102c';
    } else {
      topColor = '#141d2f';
      fogCol = '#251a34';
    }

    scene.background = new THREE.Color(topColor);
    // Realistic linear atmospheric fog from 70m to 360m (eliminates flat black box effect)
    scene.fog = new THREE.Fog(fogCol, 70, 360);
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
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ 
          antialias: true, 
          alpha: false, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25
        }}
      >
        {/* Dynamic Sky Background and Fog */}
        <SceneEnvironmentConfig track={track} />
        <RealisticSkyDome track={track} />

        <DynamicChaseCamera speedKmh={speedKmh} progress={progress} />
        <SpeedWindStreaks speedKmh={speedKmh} />

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

        {track.skyTheme === 'chennai' && (
          <>
            <ambientLight intensity={0.75} color="#fed7aa" />
            <directionalLight 
              position={[-15, 16, 32]} 
              intensity={2.6} 
              color="#fb923c" 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            <directionalLight position={[20, 8, -15]} intensity={0.65} color="#38bdf8" />
          </>
        )}

        {track.skyTheme === 'delhi' && (
          <>
            <ambientLight intensity={0.65} color="#c084fc" />
            <directionalLight 
              position={[-18, 22, 28]} 
              intensity={2.4} 
              color="#f59e0b" 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            <directionalLight position={[18, 14, -20]} intensity={1.2} color="#6366f1" />
          </>
        )}

        {/* Ambient Twilight Stars */}
        <Stars radius={200} depth={50} count={900} factor={3} saturation={0} fade speed={1} />

        {/* --- Track-Specific 3D Landscapes & Moving Scenery --- */}
        {(track.skyTheme === 'mountain' || track.id === 'mountain-pass' || track.id === 'mountain-circuit') && (
          <MountainEnvironment speedKmh={speedKmh} progress={progress} />
        )}
        {(track.skyTheme === 'coastal' || track.id === 'coastal-run' || track.id === 'coastal-circuit') && (
          <CoastalEnvironment speedKmh={speedKmh} progress={progress} />
        )}
        {(track.skyTheme === 'snow' || track.id === 'snow-circuit') && (
          <SnowEnvironment speedKmh={speedKmh} progress={progress} />
        )}
        {(track.skyTheme === 'city' || track.id === 'neon-city' || track.id === 'city-circuit') && (
          <CityEnvironment speedKmh={speedKmh} progress={progress} />
        )}
        {(track.skyTheme === 'chennai' || track.id === 'chennai-circuit' || track.id === 'chennai-marina') && (
          <ChennaiEnvironment speedKmh={speedKmh} progress={progress} />
        )}
        {(track.skyTheme === 'delhi' || track.id === 'delhi-circuit' || track.id === 'new-delhi-rajpath') && (
          <DelhiEnvironment speedKmh={speedKmh} progress={progress} />
        )}

        {/* Fallback for any other custom circuit */}
        {!['mountain', 'coastal', 'snow', 'city', 'chennai', 'delhi'].includes(track.skyTheme) && (
          <CoastalEnvironment speedKmh={speedKmh} progress={progress} />
        )}

        {/* Player's Car (GT Supercar with 'meanwhile' plate) */}
        <RealisticRaceCar 
          position={[0, 0, 0]} 
          color={selectedPaint || '#161d28'} 
          speed={speedKmh}
          isPlayer={true}
        />

        {/* Opponent Cars with Floating Driver Badges */}
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
