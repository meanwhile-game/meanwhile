import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 02 COASTAL CIRCUIT ENVIRONMENT
// Mediterranean ocean highway, sparkling water, sailboats, coastal cliffs, illuminated tunnel portal, golden streetlamps
export const CoastalEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const lampsGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    if (dashesMatRef.current && dashesMatRef.current.map) {
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
      {/* 1. Coastal 3-Lane Asphalt Road Surface */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 260]} />
        <meshStandardMaterial color="#161c2b" roughness={0.75} metalness={0.25} />
      </mesh>

      {/* Road Markings */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 260]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.88} />
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

      {/* 2. Tunnel Entrance Portal Ahead on the Left */}
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
        {/* Warm Golden Illuminated Tunnel Portal Light */}
        <pointLight position={[0, 1.5, 1]} intensity={3.5} distance={35} color="#f59e0b" />
        <pointLight position={[0, 2, 6]} intensity={2.5} distance={25} color="#fbbf24" />
      </group>

      {/* 3. Left Side: Steep Coastal Mountain Cliffs */}
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

      {/* 4. Right Side: Sparkling Mediterranean Ocean Waters */}
      <group position={[70, -2, 40]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[110, 280]} />
          <meshStandardMaterial color="#14213d" roughness={0.12} metalness={0.85} />
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

      {/* 5. Passing Golden Curved Lampposts */}
      <group ref={lampsGroupRef} position={[0, 0, 0]}>
        {[-50, -10, 30, 70, 110, 150].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
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
