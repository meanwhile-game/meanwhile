import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Preload the GT sports car GLB model using local draco decoder
useGLTF.preload('/models/ferrari.glb', '/draco/');

// Cached AO Shadow Texture
let cachedAoTexture = null;
const getAoTexture = () => {
  if (cachedAoTexture) return cachedAoTexture;
  const loader = new THREE.TextureLoader();
  cachedAoTexture = loader.load('/models/ferrari_ao.png');
  return cachedAoTexture;
};

/**
 * Inner Realistic GT Sports Car Model
 * Loads the photorealistic GT Supercar GLB model with realistic bodywork,
 * clearcoat PBR paint, functional glass, wheels with Brembo calipers,
 * interior cockpit, and real-time wheel spin physics.
 */
const RealisticCarModel = ({
  color = '#f8fafc',
  isPlayer = false,
  speed = 100,
  turntable = false
}) => {
  const groupRef = useRef();
  const bodyRef = useRef();

  // Load GLB with local Draco decoder
  const gltf = useGLTF('/models/ferrari.glb', '/draco/');

  // Independent scene clone for each vehicle instance
  const sceneClone = useMemo(() => {
    return SkeletonUtils.clone(gltf.scene);
  }, [gltf.scene]);

  // Find wheels for real-time angular rotation
  const wheels = useMemo(() => {
    const list = [];
    if (!sceneClone) return list;
    sceneClone.traverse((child) => {
      if (child.name === 'wheel_rr' || child.name === 'wheel_rl' || child.name === 'wheel_fl' || child.name === 'wheel_fr') {
        list.push(child);
      }
    });
    return list;
  }, [sceneClone]);

  // Apply PBR Materials & Custom Paint
  useEffect(() => {
    if (!sceneClone) return;

    const targetColor = new THREE.Color(color);

    sceneClone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const matName = child.material?.name || '';
        const meshName = child.name || '';

        // 1. High-Gloss Clearcoat Automotive Paint
        if (matName === 'Body_Color' || meshName === 'body') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: targetColor,
            metalness: 0.88,
            roughness: 0.14,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            reflectivity: 0.98,
            envMapIntensity: 2.2
          });
        }

        // 2. Carbon Fiber Aerodynamic Trim & Diffuser
        else if (matName.toLowerCase().includes('carbon')) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#111419',
            roughness: 0.32,
            metalness: 0.75
          });
        }

        // 3. Cockpit Glass & Windshield with Realistic Reflection
        else if (matName.toLowerCase().includes('glass') && matName !== 'Taillight_Glass' && matName !== 'Projector_Glass') {
          child.material = new THREE.MeshPhysicalMaterial({
            color: '#0f172a',
            transparent: true,
            opacity: 0.36,
            roughness: 0.04,
            metalness: 0.92,
            clearcoat: 1.0
          });
        }

        // 4. Luminous Ruby Taillights
        else if (matName === 'Taillight_Glass' || meshName.includes('lights_red')) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#dc2626',
            emissive: '#ef4444',
            emissiveIntensity: isPlayer ? 3.2 : 2.2,
            roughness: 0.15
          });
        }

        // 5. Projector LED Headlights
        else if (matName === 'Projector_Glass' || matName === 'Turn_Signal_LED' || meshName.includes('leds')) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#f0f9ff',
            emissive: '#38bdf8',
            emissiveIntensity: 2.4,
            roughness: 0.1
          });
        }

        // 6. Brembo Racing Brake Calipers
        else if (meshName.toLowerCase().includes('brake') || matName.toLowerCase().includes('brake')) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#dc2626',
            metalness: 0.82,
            roughness: 0.28
          });
        }

        // 7. Concave Alloy Rims & Center Nuts
        else if (meshName.toLowerCase().includes('rim') || meshName.toLowerCase().includes('centre')) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#e2e8f0',
            metalness: 0.92,
            roughness: 0.18
          });
        }

        // 8. Performance Rubber Tires
        else if (matName.toLowerCase().includes('tire')) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#11141a',
            roughness: 0.88,
            metalness: 0.08
          });
        }
      }
    });
  }, [sceneClone, color, isPlayer]);

  // Animation Loop: Wheel Rotation, Suspension Physics & Throttle Squat
  useFrame((state, delta) => {
    // Turntable Mode for Garage Showcase
    if (turntable && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
      return;
    }

    // 1. Wheel angular rotation proportional to speed
    const spinDelta = (speed / 3.6) * delta * 5.6;
    wheels.forEach((w) => {
      if (w) w.rotation.x += spinDelta;
    });

    // 2. High-speed engine vibration & acceleration squat
    if (bodyRef.current) {
      const rumble = Math.sin(state.clock.elapsedTime * 40) * Math.max(0.0008, (speed / 320) * 0.0035);
      const squat = Math.min(0.018, (speed / 320) * 0.018);
      bodyRef.current.position.y = rumble - (isPlayer ? squat * 0.5 : 0);
      bodyRef.current.rotation.x = isPlayer ? squat * 0.25 : 0;
    }
  });

  const aoShadow = useMemo(() => getAoTexture(), []);

  return (
    <group ref={groupRef}>
      {/* Dynamic Car Body Assembly */}
      <group ref={bodyRef}>
        {/* Model is rotated so front faces +Z (down the road) */}
        <primitive 
          object={sceneClone} 
          scale={[1.05, 1.05, 1.05]} 
          rotation={[0, Math.PI, 0]} 
          position={[0, 0, 0]} 
        />
      </group>

      {/* Baked Soft Contact Shadow Plane underneath the car */}
      <mesh position={[0, 0.012, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 4.8]} />
        <meshBasicMaterial 
          map={aoShadow} 
          transparent 
          opacity={0.86} 
          depthWrite={false} 
        />
      </mesh>
    </group>
  );
};

// Fallback while 3D Model loads asynchronously
const CarFallback = ({ color = '#f8fafc' }) => (
  <group position={[0, 0.35, 0]}>
    <mesh castShadow>
      <boxGeometry args={[1.9, 0.45, 4.2]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

/**
 * RealisticRaceCar Component
 * Used in both active 3D racing and the interactive 3D garage turntable.
 */
export const RealisticRaceCar = ({
  position = [0, 0, 0],
  color = '#f8fafc',
  isPlayer = false,
  speed = 100,
  driverTag = null,
  turntable = false,
  vehicleId = 'vortex'
}) => {
  return (
    <group position={position}>
      {/* Floating Driver Badge for Opponents */}
      {driverTag && (
        <Html position={[0, 1.85, 0]} center distanceFactor={18}>
          <div className="px-2.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-xl whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5">
            <span className="text-amber-400 font-mono-num">#{driverTag.rank}</span>
            <span className="tracking-wide">{driverTag.name}</span>
          </div>
        </Html>
      )}

      {/* Realistic 3D Model with Suspense */}
      <Suspense fallback={<CarFallback color={color} />}>
        <RealisticCarModel
          color={color}
          isPlayer={isPlayer}
          speed={speed}
          turntable={turntable}
        />
      </Suspense>
    </group>
  );
};
