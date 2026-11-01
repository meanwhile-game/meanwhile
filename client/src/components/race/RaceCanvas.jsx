import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore.js';
import { getTrackById } from '../../data/tracks.js';
import { RealisticRaceCar } from './RealisticRaceCar.jsx';
import { RealisticSkyDome } from './RealisticSkyDome.jsx';
import { RealisticEnvironmentMap } from './RealisticEnvironmentMap.jsx';
import { CurvedHighway, getTrackCurvature } from './CurvedHighway.jsx';
import { MountainEnvironment } from './environments/MountainEnvironment.jsx';
import { CoastalEnvironment } from './environments/CoastalEnvironment.jsx';
import { SnowEnvironment } from './environments/SnowEnvironment.jsx';
import { CityEnvironment } from './environments/CityEnvironment.jsx';
import { ChennaiEnvironment } from './environments/ChennaiEnvironment.jsx';
import { DelhiEnvironment } from './environments/DelhiEnvironment.jsx';

// High-Speed Wind Particle Streaks rushing past the camera
const SpeedWindStreaks = ({ speedKmh = 100 }) => {
  const streaksRef = useRef();

  const streakLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = Math.random() * 3.5 + 0.5;
      const z = (Math.random() - 0.5) * 70 + 10;
      lines.push(x, y, z);
    }
    return new Float32Array(lines);
  }, []);

  useFrame((state, delta) => {
    if (streaksRef.current && speedKmh > 70) {
      const move = (speedKmh / 3.6) * delta * 2.5;
      streaksRef.current.position.z = ((streaksRef.current.position.z - move) % 70);
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
        size={0.16} 
        color="#ffffff" 
        transparent 
        opacity={Math.min(0.55, (speedKmh - 70) / 200)} 
        depthWrite={false}
      />
    </points>
  );
};

// Dynamic Chase Camera with Curve Anticipation, Spring Physics & Velocity Banking
const DynamicChaseCamera = ({ speedKmh = 100, progress = 0, skyTheme = 'mountain', distanceTraveled = 0 }) => {
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
      const shakeIntensity = ((speedKmh - 120) / 200) * 0.012;
      rumbleX = (Math.random() - 0.5) * shakeIntensity;
      rumbleY = (Math.random() - 0.5) * shakeIntensity;
    }

    // Road curve anticipation: Camera smoothly leads the turn looking toward the upcoming apex
    const curveApex = getTrackCurvature(skyTheme, 28, distanceTraveled);
    const curveOrigin = getTrackCurvature(skyTheme, 0, distanceTraveled);

    const targetCamX = curveOrigin.x * 0.85 + rumbleX;
    const targetCamY = 2.05 + curveOrigin.y + rumbleY;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, delta * 6.0);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, delta * 6.0);
    
    // Look ahead into the curve
    camera.lookAt(curveApex.x, 1.1 + curveApex.y, 24);
  });

  return null;
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
    // Smooth atmospheric fog distance: 75m to 380m
    scene.fog = new THREE.Fog(fogCol, 75, 380);
  }, [track.id, track.skyTheme, track.skyColorTop, track.fogColor, scene]);

  return null;
};

// Wrapper for Player Car that positions, steers, and banks along the Road Curve
const CurveFollowerCar = ({ 
  speedKmh = 100, 
  color = '#161d28', 
  skyTheme = 'mountain',
  distanceTraveled = 0,
  vehicleId = 'vortex'
}) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      const curve = getTrackCurvature(skyTheme, 0, distanceTraveled);
      groupRef.current.position.x = curve.x;
      groupRef.current.position.y = curve.y;
      groupRef.current.position.z = 0;
      
      // Dynamic steering rotation matching road heading
      groupRef.current.rotation.y = curve.yaw * 0.95;
      // Dynamic chassis banking matching centrifugal roll
      groupRef.current.rotation.z = curve.roll;
    }
  });

  return (
    <group ref={groupRef}>
      <RealisticRaceCar 
        position={[0, 0, 0]} 
        color={color} 
        speed={speedKmh}
        isPlayer={true}
        vehicleId={vehicleId}
      />
    </group>
  );
};

// Wrapper for Opponents that bend along the Road Curve at their respective forward distances
const CurveFollowerOpponent = ({ 
  opponent, 
  skyTheme = 'mountain', 
  distanceTraveled = 0 
}) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      const zPos = opponent.position[2];
      const curve = getTrackCurvature(skyTheme, zPos, distanceTraveled);
      const cosYaw = Math.cos(curve.yaw);
      const sinYaw = Math.sin(curve.yaw);

      // Offset by lane width perpendicular to curve
      const laneOffset = opponent.position[0];
      groupRef.current.position.x = curve.x + laneOffset * cosYaw;
      groupRef.current.position.y = curve.y;
      groupRef.current.position.z = zPos - laneOffset * sinYaw;
      groupRef.current.rotation.y = curve.yaw * 0.95;
      groupRef.current.rotation.z = curve.roll;
    }
  });

  return (
    <group ref={groupRef}>
      <RealisticRaceCar
        position={[0, 0, 0]}
        color={opponent.color}
        isPlayer={false}
        speed={opponent.speed}
        driverTag={{ rank: opponent.rank, name: opponent.name }}
      />
    </group>
  );
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
  const distanceRef = useRef(0);

  // Position opponent cars ahead on the road with driver tags
  const visibleOpponents = useMemo(() => {
    const playerRacer = racers.find(r => r.isPlayer);
    const playerProg = playerRacer?.progress || progress;

    const opponents = racers.filter(r => !r.isPlayer);
    const colors = ['#0f172a', '#1e293b', '#7c2d12', '#14532d', '#1e1b4b', '#4c1d95', '#831843'];

    return opponents.slice(0, 6).map((racer, idx) => {
      const racerProg = racer.progress || 0;
      const deltaProg = racerProg - playerProg;
      const laneX = racer.lane !== undefined ? racer.lane * 3.2 : (idx % 2 === 0 ? 3.1 : -3.1);
      const baseZ = (8 - (racer.gridPosition || (idx < 3 ? idx + 1 : idx + 2))) * 4 + 12;
      const zPos = Math.max(-12, Math.min(100, baseZ + deltaProg * 320));

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

  // Track Road Properties based on Track Type
  const roadProps = useMemo(() => {
    if (track.skyTheme === 'mountain') {
      return { lanes: 3, doubleCenter: true, isWet: true, dashedColor: '#f8fafc', edgeColor: '#f8fafc', roadWidth: 16.8 };
    } else if (track.skyTheme === 'coastal') {
      return { lanes: 3, doubleCenter: false, isWet: false, dashedColor: '#f8fafc', edgeColor: '#f59e0b', roadWidth: 16.8 };
    } else if (track.skyTheme === 'snow') {
      return { lanes: 2, doubleCenter: false, isWet: true, dashedColor: '#f1f5f9', edgeColor: '#e2e8f0', roadWidth: 16.5 };
    } else if (track.skyTheme === 'city') {
      return { lanes: 4, doubleCenter: false, isWet: true, dashedColor: '#38bdf8', edgeColor: '#c084fc', roadWidth: 17.5 };
    } else if (track.skyTheme === 'chennai') {
      return { lanes: 4, doubleCenter: false, isWet: true, dashedColor: '#f8fafc', edgeColor: '#fbbf24', roadWidth: 18.0 };
    } else {
      // Delhi
      return { lanes: 4, doubleCenter: false, isWet: true, dashedColor: '#f8fafc', edgeColor: '#fbbf24', roadWidth: 18.2 };
    }
  }, [track.skyTheme]);

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
          toneMappingExposure: 1.24
        }}
      >
        {/* Dynamic Sky Background and Fog */}
        <SceneEnvironmentConfig track={track} />
        <RealisticSkyDome track={track} />

        {/* Procedural High-Dynamic-Range Environment Reflection Map (IBL) */}
        <RealisticEnvironmentMap skyTheme={track.skyTheme} />

        <DynamicChaseCamera 
          speedKmh={speedKmh} 
          progress={progress} 
          skyTheme={track.skyTheme} 
          distanceTraveled={distanceRef.current} 
        />
        
        <SpeedWindStreaks speedKmh={speedKmh} />

        {/* --- High-Performance Dynamic 3D Curving Highway Ribbon --- */}
        <CurvedHighway 
          speedKmh={speedKmh} 
          track={track}
          roadWidth={roadProps.roadWidth}
          lanes={roadProps.lanes}
          dashedColor={roadProps.dashedColor}
          edgeColor={roadProps.edgeColor}
          isWet={roadProps.isWet}
          doubleCenter={roadProps.doubleCenter}
        />

        {/* --- Track-Specific Realistic Lighting with High-Resolution Shadows --- */}
        {track.skyTheme === 'mountain' && (
          <>
            <ambientLight intensity={0.65} color="#86efac" />
            <directionalLight 
              position={[-18, 26, 30]} 
              intensity={2.4} 
              color="#fef08a" 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
              shadow-bias={-0.0002}
              shadow-camera-near={0.5}
              shadow-camera-far={130}
              shadow-camera-left={-28}
              shadow-camera-right={28}
              shadow-camera-top={28}
              shadow-camera-bottom={-28}
            />
            <directionalLight position={[15, 8, -20]} intensity={0.6} color="#7dd3fc" />
          </>
        )}

        {track.skyTheme === 'coastal' && (
          <>
            <ambientLight intensity={0.7} color="#fed7aa" />
            <directionalLight 
              position={[-16, 20, 32]} 
              intensity={2.2} 
              color="#fb923c" 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
              shadow-bias={-0.0002}
              shadow-camera-near={0.5}
              shadow-camera-far={130}
              shadow-camera-left={-28}
              shadow-camera-right={28}
              shadow-camera-top={28}
              shadow-camera-bottom={-28}
            />
            <directionalLight position={[15, 6, -20]} intensity={0.55} color="#818cf8" />
          </>
        )}

        {track.skyTheme === 'snow' && (
          <>
            <ambientLight intensity={0.85} color="#bfdbfe" />
            <directionalLight 
              position={[-14, 28, 25]} 
              intensity={2.0} 
              color="#e0f2fe" 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
              shadow-bias={-0.0002}
              shadow-camera-near={0.5}
              shadow-camera-far={130}
              shadow-camera-left={-28}
              shadow-camera-right={28}
              shadow-camera-top={28}
              shadow-camera-bottom={-28}
            />
            <directionalLight position={[12, 6, -15]} intensity={0.6} color="#93c5fd" />
          </>
        )}

        {track.skyTheme === 'city' && (
          <>
            <ambientLight intensity={0.6} color="#581c87" />
            <directionalLight 
              position={[-25, 22, 22]} 
              intensity={2.5} 
              color="#d946ef" 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
              shadow-bias={-0.0002}
              shadow-camera-near={0.5}
              shadow-camera-far={130}
              shadow-camera-left={-28}
              shadow-camera-right={28}
              shadow-camera-top={28}
              shadow-camera-bottom={-28}
            />
            <directionalLight position={[25, 15, -10]} intensity={2.2} color="#38bdf8" />
          </>
        )}

        {track.skyTheme === 'chennai' && (
          <>
            <ambientLight intensity={0.75} color="#fed7aa" />
            <directionalLight 
              position={[-16, 18, 34]} 
              intensity={2.7} 
              color="#fb923c" 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
              shadow-bias={-0.0002}
              shadow-camera-near={0.5}
              shadow-camera-far={130}
              shadow-camera-left={-28}
              shadow-camera-right={28}
              shadow-camera-top={28}
              shadow-camera-bottom={-28}
            />
            <directionalLight position={[20, 8, -15]} intensity={0.7} color="#38bdf8" />
          </>
        )}

        {track.skyTheme === 'delhi' && (
          <>
            <ambientLight intensity={0.65} color="#c084fc" />
            <directionalLight 
              position={[-18, 24, 30]} 
              intensity={2.5} 
              color="#f59e0b" 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
              shadow-bias={-0.0002}
              shadow-camera-near={0.5}
              shadow-camera-far={130}
              shadow-camera-left={-28}
              shadow-camera-right={28}
              shadow-camera-top={28}
              shadow-camera-bottom={-28}
            />
            <directionalLight position={[18, 14, -20]} intensity={1.3} color="#6366f1" />
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

        {/* Player's Car (Bends and banks dynamically along the Curve) */}
        <CurveFollowerCar
          speedKmh={speedKmh}
          color={selectedPaint || '#161d28'}
          skyTheme={track.skyTheme}
          distanceTraveled={distanceRef.current}
          vehicleId={selectedVehicleId}
        />

        {/* Opponent Cars (Follow the curve ahead on their lanes) */}
        {visibleOpponents.map(opp => (
          <CurveFollowerOpponent
            key={opp.id}
            opponent={opp}
            skyTheme={track.skyTheme}
            distanceTraveled={distanceRef.current}
          />
        ))}

        {/* Soft Ambient Contact Shadow beneath Player Car */}
        <ContactShadows 
          position={[0, -0.04, 0]} 
          opacity={0.92} 
          scale={7.2} 
          blur={1.3} 
          far={3.0} 
        />
      </Canvas>
    </div>
  );
};
