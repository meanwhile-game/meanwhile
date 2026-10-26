import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 02 COASTAL RUN ENVIRONMENT (Reference Quadrant 2)
// Scenic highway following the ocean, coastal cliffs, turquoise water, seaside structures, bridges, and warm sunset lighting
export const CoastalEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const lampsGroupRef = useRef();
  const oceanRef = useRef();
  const sunGlowRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 24;
    }

    // Moving roadside golden lamps & cypress trees loop
    if (lampsGroupRef.current) {
      lampsGroupRef.current.position.z = (lampsGroupRef.current.position.z + moveStep * 0.7) % 80;
    }

    // Gentle ocean wave pulsation
    if (oceanRef.current) {
      oceanRef.current.position.y = -2.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }

    // Sun corona pulse
    if (sunGlowRef.current) {
      sunGlowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  // Coastal 3-Lane Road Markings Texture
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#141a27';
    ctx.fillRect(0, 0, 256, 512);

    // Subtle grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 2, 2);
    }

    // White dashed lane divider lines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(80, 40, 6, 140);
    ctx.fillRect(80, 290, 6, 140);
    ctx.fillRect(170, 40, 6, 140);
    ctx.fillRect(170, 290, 6, 140);

    // Outer shoulder lines
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(14, 0, 5, 512);
    ctx.fillRect(238, 0, 5, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }, []);

  return (
    <group>
      {/* 1. Coastal 3-Lane Asphalt Road Surface */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.5, 280]} />
        <meshStandardMaterial color="#161c2b" roughness={0.72} metalness={0.28} />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.2, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.92} />
      </mesh>

      {/* Left and Right Steel Guardrails with Sunset Warm Specular */}
      <mesh position={[-8.4, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.72, 280]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[8.4, 0.45, 40]}>
        <boxGeometry args={[0.3, 0.72, 280]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* 2. GOLDEN SUNSET SUN ORB & CORONA ON THE OCEAN HORIZON */}
      <group position={[85, 12, 180]}>
        {/* Core Sun Disk */}
        <mesh>
          <sphereGeometry args={[12, 32, 32]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        {/* Radiant Sunset Corona Halo */}
        <mesh ref={sunGlowRef}>
          <sphereGeometry args={[22, 32, 32]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        {/* Intense Directional Sunset Sunlight */}
        <pointLight intensity={6.0} distance={250} color="#fb923c" />
      </group>

      {/* 3. RIGHT SIDE: SPARKLING TURQUOISE MEDITERRANEAN OCEAN */}
      <group ref={oceanRef} position={[75, -2.2, 40]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[130, 320]} />
          <meshStandardMaterial 
            color="#0e7490" 
            roughness={0.08} 
            metalness={0.88} 
          />
        </mesh>

        {/* Specular Golden Sun Reflection Ribbon along the water */}
        <mesh position={[-15, 0.05, 70]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[35, 180]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.32} depthWrite={false} />
        </mesh>

        {/* Distant Sailboat Silhouettes with White Sails */}
        <group position={[18, 2.5, 50]}>
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[1.6, 5.2, 3]} />
            <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
          </mesh>
          <mesh position={[0, -2.2, 0]}>
            <boxGeometry args={[4.2, 0.7, 1.2]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        <group position={[40, 2, 100]}>
          <mesh position={[0, 0, 0]}>
            <coneGeometry args={[1.3, 4.2, 3]} />
            <meshBasicMaterial color="#ffffff" opacity={0.75} transparent />
          </mesh>
          <mesh position={[0, -1.8, 0]}>
            <boxGeometry args={[3.4, 0.6, 1.0]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Distant Coastal Sea Stacks / Rocky Outcroppings */}
        <mesh position={[50, 4, 30]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[14, 18, 5]} />
          <meshStandardMaterial color="#292524" roughness={0.95} />
        </mesh>
      </group>

      {/* 4. LEFT SIDE: MEDITERRANEAN CLIFFS WITH STONE COLONNADE ARCHES & VILLAS (Matching Reference Image) */}
      <group position={[-36, 16, 65]}>
        {/* Coastal Rock Cliff Wall */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[24, 44, 70]} />
          <meshStandardMaterial color="#2d2538" roughness={0.95} />
        </mesh>

        {/* Terracotta Cliffside Villa with Arched Balconies */}
        <group position={[11, 10, -5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[8, 12, 18]} />
            <meshStandardMaterial color="#d4a373" roughness={0.8} />
          </mesh>
          {/* Terracotta Pitched Tile Roof */}
          <mesh position={[0, 6.8, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[6.5, 3.5, 4]} />
            <meshStandardMaterial color="#9a3412" roughness={0.85} />
          </mesh>
          {/* Warm Illuminated Villa Windows */}
          <mesh position={[4.1, 0, -4]}>
            <boxGeometry args={[0.1, 2.2, 1.6]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <mesh position={[4.1, 0, 4]}>
            <boxGeometry args={[0.1, 2.2, 1.6]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>

        {/* Mediterranean Stone Viaduct Arcade Colonnade (Arches along the road as in Reference Screenshot) */}
        <group position={[11.5, -4, 18]}>
          {[-12, -4, 4, 12].map((zArch, i) => (
            <group key={i} position={[0, 0, zArch]}>
              <mesh position={[0, 0, -2.8]}>
                <boxGeometry args={[1.8, 8, 1.4]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0, 2.8]}>
                <boxGeometry args={[1.8, 8, 1.4]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.85} />
              </mesh>
              <mesh position={[0, 3.8, 0]}>
                <boxGeometry args={[1.8, 1.6, 5.8]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 5. OVERHEAD COASTAL VIADUCT BRIDGE AT DISTANCE */}
      <group position={[-4, 10, 140]}>
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[65, 3.5, 9]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Massive Arch Openings */}
        {[-18, 6].map((xArch, i) => (
          <group key={i} position={[xArch, -2, 0]}>
            <mesh position={[-6, 0, 0]}>
              <boxGeometry args={[2.5, 9, 7]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[6, 0, 0]}>
              <boxGeometry args={[2.5, 9, 7]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. LOOPING GOLDEN HIGHWAY STREET LAMPS & MEDITERRANEAN CYPRESS TREES */}
      <group ref={lampsGroupRef} position={[0, 0, 0]}>
        {[-50, -10, 30, 70, 110, 150].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Elegant Curved Lamppost on the Left Roadside */}
            <mesh position={[-8.9, 4.0, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 8.0]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[-7.9, 7.6, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <cylinderGeometry args={[0.06, 0.06, 2.5]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Warm Golden Streetlamp Fixture & Pool of Light */}
            <mesh position={[-7.2, 7.2, 0]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight position={[-7.2, 6.8, 0]} intensity={2.2} distance={24} color="#f59e0b" />

            {/* Slender Mediterranean Cypress Tree along the Cliff Wall */}
            <CypressTree position={[-13.5, 0, 0]} scale={1.2} />
            <CypressTree position={[-16.5, 0, -4]} scale={1.5} />
          </group>
        ))}
      </group>
    </group>
  );
};

// Slender Italian Mediterranean Cypress Tree
const CypressTree = ({ position, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 1.0, 0]}>
      <cylinderGeometry args={[0.12, 0.18, 2.0, 6]} />
      <meshStandardMaterial color="#422006" roughness={0.9} />
    </mesh>
    <mesh position={[0, 3.8, 0]}>
      <coneGeometry args={[0.7, 5.2, 8]} />
      <meshStandardMaterial color="#14532d" roughness={0.85} />
    </mesh>
  </group>
);
