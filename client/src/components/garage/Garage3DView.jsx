import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Procedural 3D Sports Car Component for Garage Showcase
const ShowcaseCar = ({ color = '#f8fafc', carId = 'vortex' }) => {
  const groupRef = useRef();

  // Slow smooth turntable rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  const carColor = new THREE.Color(color);

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* Lower Chassis / Underbody */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.9, 0.3, 4.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Main Sculpted Car Body */}
      <mesh position={[0, 0.55, 0.1]} castShadow>
        <boxGeometry args={[1.85, 0.42, 4.1]} />
        <meshPhysicalMaterial 
          color={carColor} 
          roughness={0.15} 
          metalness={0.85} 
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Hood Scoop / Front Nose */}
      <mesh position={[0, 0.52, 1.8]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[1.75, 0.28, 1.1]} />
        <meshPhysicalMaterial color={carColor} roughness={0.15} metalness={0.85} clearcoat={1.0} />
      </mesh>

      {/* Greenhouse / Cockpit Cabin */}
      <mesh position={[0, 0.95, -0.2]} castShadow>
        <boxGeometry args={[1.45, 0.48, 2.1]} />
        <meshPhysicalMaterial 
          color="#050810" 
          roughness={0.1} 
          metalness={0.9} 
          transmission={0.6}
          thickness={0.5}
        />
      </mesh>

      {/* Rear Wing / Spoiler */}
      <mesh position={[0, 1.1, -1.9]} castShadow>
        <boxGeometry args={[1.8, 0.06, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Spoiler Struts */}
      <mesh position={[-0.6, 0.9, -1.9]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4]} />
        <meshStandardMaterial color="#000000" metalness={0.9} />
      </mesh>
      <mesh position={[0.6, 0.9, -1.9]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4]} />
        <meshStandardMaterial color="#000000" metalness={0.9} />
      </mesh>

      {/* Front Headlight Strips */}
      <mesh position={[-0.65, 0.55, 2.16]}>
        <boxGeometry args={[0.4, 0.08, 0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.65, 0.55, 2.16]}>
        <boxGeometry args={[0.4, 0.08, 0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Rear Taillight Bar (Reference glow) */}
      <mesh position={[0, 0.65, -2.16]}>
        <boxGeometry args={[1.7, 0.07, 0.05]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* 4 Wheels */}
      {/* Front Left */}
      <mesh position={[-0.95, 0.35, 1.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.28, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      {/* Front Right */}
      <mesh position={[0.95, 0.35, 1.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.28, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      {/* Rear Left */}
      <mesh position={[-0.95, 0.35, -1.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.32, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      {/* Rear Right */}
      <mesh position={[0.95, 0.35, -1.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.32, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Brake Calipers / Wheel Rims */}
      <mesh position={[-0.96, 0.35, 1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.29, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.96, 0.35, 1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.29, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.96, 0.35, -1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.23, 0.23, 0.33, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.96, 0.35, -1.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.23, 0.23, 0.33, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Underglow Neon Accent */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 3.8]} />
        <meshBasicMaterial color={carColor} transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

export const Garage3DView = ({ color = '#f8fafc', vehicleId = 'vortex' }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [3.8, 2.2, 4.5], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        {/* Studio Lighting */}
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.8} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 4, -4]} intensity={0.9} color="#93c5fd" />
        <pointLight position={[0, 4, -3]} intensity={1.5} color="#ef4444" />
        <pointLight position={[0, 2, 4]} intensity={1.2} color="#f59e0b" />

        {/* Studio Floor Pedestal */}
        <mesh position={[0, -0.42, 0]} receiveShadow>
          <cylinderGeometry args={[3.6, 3.8, 0.08, 48]} />
          <meshStandardMaterial color="#0b101d" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.46, 0]} receiveShadow>
          <cylinderGeometry args={[3.85, 3.85, 0.04, 48]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* Vertical Studio Warm Light Pillars in Background (matching reference screenshot) */}
        <mesh position={[-3.2, 1.5, -3.2]}>
          <cylinderGeometry args={[0.04, 0.04, 4.2]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[3.2, 1.5, -3.2]}>
          <cylinderGeometry args={[0.04, 0.04, 4.2]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* 3D Car */}
        <ShowcaseCar color={color} carId={vehicleId} />

        {/* Soft Contact Shadows on Floor */}
        <ContactShadows 
          position={[0, -0.38, 0]} 
          opacity={0.85} 
          scale={7} 
          blur={1.5} 
          far={3} 
        />

        {/* Orbit Controls for interactive 360 preview */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.05} 
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};
