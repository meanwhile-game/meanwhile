import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 04 CITY CIRCUIT ENVIRONMENT (Tokyo / Cyber Night)
// Midnight metropolis, glowing skyscraper grids, Tokyo neon billboards, illuminated magenta/cyan barrier strips, overhead highway gantries, wet glossy reflective road
export const CityEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const buildingsGroupRef = useRef();
  const gantriesGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 22;
    }

    // Moving city elements & overhead gantries loop
    if (buildingsGroupRef.current) {
      buildingsGroupRef.current.position.z = (buildingsGroupRef.current.position.z + moveStep * 0.6) % 100;
    }
    if (gantriesGroupRef.current) {
      gantriesGroupRef.current.position.z = (gantriesGroupRef.current.position.z + moveStep * 0.8) % 90;
    }
  });

  // Rain-slicked Glossy Road Markings Texture
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, 256, 512);

    // Glowing cyan/white dashed lane lines
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(80, 40, 6, 140);
    ctx.fillRect(80, 290, 6, 140);
    ctx.fillRect(170, 40, 6, 140);
    ctx.fillRect(170, 290, 6, 140);

    // Outer neon glow boundaries
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(14, 0, 4, 512);
    ctx.fillRect(238, 0, 4, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }, []);

  return (
    <group>
      {/* 1. Rain-Slicked Wet Mirror Asphalt */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 260]} />
        <meshStandardMaterial 
          color="#070a14" 
          roughness={0.16} 
          metalness={0.75} 
        />
      </mesh>

      {/* Road Markings */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15.6, 260]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.9} />
      </mesh>

      {/* 2. Glowing Neon Highway Guardrail Barrier Strips matching Screenshot */}
      {/* Left Guardrail: Electric Magenta LED Strip */}
      <group position={[-8.2, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.3, 0.7, 260]} />
          <meshStandardMaterial color="#1e112a" roughness={0.5} />
        </mesh>
        <mesh position={[0.16, 0.15, 0]}>
          <boxGeometry args={[0.06, 0.12, 260]} />
          <meshBasicMaterial color="#e879f9" />
        </mesh>
        <pointLight position={[0.8, 0.2, -10]} intensity={2.0} distance={15} color="#e879f9" />
        <pointLight position={[0.8, 0.2, 50]} intensity={2.0} distance={15} color="#e879f9" />
        <pointLight position={[0.8, 0.2, 110]} intensity={2.0} distance={15} color="#e879f9" />
      </group>

      {/* Right Guardrail: High-Voltage Cyan / Purple LED Strip */}
      <group position={[8.2, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.3, 0.7, 260]} />
          <meshStandardMaterial color="#111c2a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.16, 0.15, 0]}>
          <boxGeometry args={[0.06, 0.12, 260]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[-0.8, 0.2, -10]} intensity={2.0} distance={15} color="#38bdf8" />
        <pointLight position={[-0.8, 0.2, 50]} intensity={2.0} distance={15} color="#38bdf8" />
        <pointLight position={[-0.8, 0.2, 110]} intensity={2.0} distance={15} color="#38bdf8" />
      </group>

      {/* 3. Tokyo Cyber Neon Billboards & Overhead Viaduct Bridge Ahead */}
      <group position={[0, 8.5, 125]}>
        {/* Overhead Express Flyover */}
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[70, 3, 10]} />
          <meshStandardMaterial color="#111827" metalness={0.7} />
        </mesh>
        {/* Huge Tokyo Kanji Neon Billboard matching Screenshot */}
        <group position={[18, 7.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[14, 7, 0.6]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.35]}>
            <boxGeometry args={[13.2, 6.2, 0.05]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <pointLight position={[0, 0, 3]} intensity={3.5} distance={25} color="#38bdf8" />
        </group>
        {/* Magenta Meanwhile Billboard on Left */}
        <group position={[-18, 7.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[14, 7, 0.6]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.35]}>
            <boxGeometry args={[13.2, 6.2, 0.05]} />
            <meshBasicMaterial color="#d946ef" />
          </mesh>
          <pointLight position={[0, 0, 3]} intensity={3.5} distance={25} color="#d946ef" />
        </group>
      </group>

      {/* 4. Overhead Highway Sign Gantries Passing Overhead */}
      <group ref={gantriesGroupRef} position={[0, 0, 0]}>
        {[-30, 60, 150].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Gantry Arch Truss */}
            <mesh position={[-8.5, 3.8, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 7.6]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[8.5, 3.8, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 7.6]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, 7.2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 17.5]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Overhead LED Green Sign Boards */}
            <mesh position={[-3.2, 6.5, 0]}>
              <boxGeometry args={[4.2, 1.8, 0.15]} />
              <meshStandardMaterial color="#065f46" roughness={0.3} />
            </mesh>
            <mesh position={[3.2, 6.5, 0]}>
              <boxGeometry args={[4.2, 1.8, 0.15]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.3} />
            </mesh>
            <pointLight position={[0, 6.5, 1]} intensity={1.8} distance={18} color="#34d399" />
          </group>
        ))}
      </group>

      {/* 5. Looping Cyber Skyscrapers on Left and Right Skyline */}
      <group ref={buildingsGroupRef} position={[0, 0, 0]}>
        {[-70, -20, 30, 80, 130, 180].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Skyscrapers */}
            <CyberSkyscraper position={[-20, 0, -10]} width={14} depth={18} height={52} neonColor="#e879f9" />
            <CyberSkyscraper position={[-32, 0, 12]} width={18} depth={20} height={72} neonColor="#38bdf8" />
            <CyberSkyscraper position={[-18, 0, 32]} width={12} depth={16} height={40} neonColor="#a855f7" />
            <CyberSkyscraper position={[-30, 0, 50]} width={20} depth={22} height={85} neonColor="#f43f5e" />

            {/* Right Skyscrapers */}
            <CyberSkyscraper position={[20, 0, -10]} width={14} depth={18} height={58} neonColor="#38bdf8" />
            <CyberSkyscraper position={[32, 0, 14]} width={18} depth={20} height={76} neonColor="#e879f9" />
            <CyberSkyscraper position={[18, 0, 34]} width={13} depth={16} height={44} neonColor="#34d399" />
            <CyberSkyscraper position={[30, 0, 52]} width={22} depth={24} height={82} neonColor="#f59e0b" />
          </group>
        ))}
      </group>
    </group>
  );
};

// Cyberpunk Skyscraper with Glowing Window Matrix & Rooftop Neon Spire
const CyberSkyscraper = ({ position, width = 16, depth = 20, height = 50, neonColor = '#38bdf8' }) => (
  <group position={position}>
    {/* Main Tower Mass */}
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#070a14" roughness={0.3} metalness={0.7} />
    </mesh>
    {/* Illuminated Window Matrix Band */}
    <mesh position={[0, height * 0.6, 0]}>
      <boxGeometry args={[width + 0.1, height * 0.45, depth + 0.1]} />
      <meshStandardMaterial color="#17122b" roughness={0.2} metalness={0.6} />
    </mesh>
    {/* Glowing Neon Horizontal Ribs */}
    <mesh position={[0, height * 0.75, 0]}>
      <boxGeometry args={[width + 0.2, 0.4, depth + 0.2]} />
      <meshBasicMaterial color={neonColor} />
    </mesh>
    {/* Rooftop Neon Beacon Spire */}
    <mesh position={[0, height + 4, 0]}>
      <cylinderGeometry args={[0.08, 0.35, 8]} />
      <meshBasicMaterial color={neonColor} />
    </mesh>
    <pointLight position={[0, height + 6, 0]} intensity={1.5} distance={35} color={neonColor} />
  </group>
);
