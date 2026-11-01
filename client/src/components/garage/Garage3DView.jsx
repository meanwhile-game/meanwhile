import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { RealisticRaceCar } from '../race/RealisticRaceCar.jsx';
import { RealisticEnvironmentMap } from '../race/RealisticEnvironmentMap.jsx';

/**
 * High-Fidelity 3D Garage Showcase
 * Interactive 360-degree turntable showcasing the hyper-realistic GT supercar
 * with studio lighting, realistic reflections, and carbon fiber display pedestal.
 */
export const Garage3DView = ({ color = '#f8fafc', vehicleId = 'vortex' }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [3.8, 2.2, 4.5], fov: 42 }}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        {/* Procedural High-Dynamic-Range Studio Environment Reflection Map */}
        <RealisticEnvironmentMap skyTheme="city" />

        <ambientLight intensity={0.65} />
        
        {/* Studio Key Spotlight */}
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={2.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0002}
        />
        {/* Cool Rim Backlight */}
        <directionalLight position={[-5, 4, -4]} intensity={1.2} color="#93c5fd" />
        
        {/* Warm Studio Accent Fill */}
        <pointLight position={[0, 4, -3]} intensity={1.8} color="#ef4444" />
        <pointLight position={[0, 2, 4]} intensity={1.4} color="#f59e0b" />

        {/* Studio Carbon Turntable Pedestal */}
        <group position={[0, -0.42, 0]}>
          {/* Main Turntable Platform */}
          <mesh receiveShadow>
            <cylinderGeometry args={[3.6, 3.8, 0.08, 64]} />
            <meshStandardMaterial color="#0c111d" roughness={0.35} metalness={0.7} />
          </mesh>
          {/* Polished Aluminum Bevel Rim */}
          <mesh position={[0, -0.04, 0]} receiveShadow>
            <cylinderGeometry args={[3.85, 3.85, 0.04, 64]} />
            <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Glowing Ambient Turntable Accent Ring */}
          <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.2, 3.25, 64]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Vertical Studio Warm Light Pillars in Background */}
        <mesh position={[-3.2, 1.5, -3.2]}>
          <cylinderGeometry args={[0.04, 0.04, 4.2]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[3.2, 1.5, -3.2]}>
          <cylinderGeometry args={[0.04, 0.04, 4.2]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Hyper-Realistic 3D Supercar on Turntable */}
        <RealisticRaceCar 
          position={[0, -0.4, 0]} 
          color={color} 
          turntable={true} 
          vehicleId={vehicleId} 
          isPlayer={true}
          speed={0}
        />

        {/* Realistic Soft Contact Shadows on Floor */}
        <ContactShadows 
          position={[0, -0.38, 0]} 
          opacity={0.88} 
          scale={7} 
          blur={1.4} 
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
