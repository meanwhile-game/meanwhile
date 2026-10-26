import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 04 NEON CITY ENVIRONMENT (Reference Quadrant 4)
// Futuristic NYC-inspired metropolis, skyscrapers, elevated highways, illuminated billboards, neon signage, and reflective nighttime roads
export const CityEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const buildingsGroupRef = useRef();
  const flyoverGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 24;
    }

    // Moving city skyscrapers loop
    if (buildingsGroupRef.current) {
      buildingsGroupRef.current.position.z = (buildingsGroupRef.current.position.z + moveStep * 0.6) % 100;
    }

    // Elevated highway flyovers loop
    if (flyoverGroupRef.current) {
      flyoverGroupRef.current.position.z = (flyoverGroupRef.current.position.z + moveStep * 0.75) % 110;
    }
  });

  // Rain-Slicked Wet Mirror Road Texture with Neon Markings
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, 256, 512);

    // Glowing cyan/white dashed lane lines
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(80, 40, 6, 140);
    ctx.fillRect(80, 290, 6, 140);
    ctx.fillRect(170, 40, 6, 140);
    ctx.fillRect(170, 290, 6, 140);

    // Outer neon purple boundary strips
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
      {/* 1. Rain-Slicked Wet Mirror Asphalt with Deep Specular Reflections */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.5, 280]} />
        <meshPhysicalMaterial 
          color="#060913" 
          roughness={0.08} 
          metalness={0.88} 
          clearcoat={1.0}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* Road Markings */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.2, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.92} />
      </mesh>

      {/* 2. GLOWING NEON HIGHWAY GUARDRAIL BARRIERS (Matching Reference Image 04) */}
      {/* Left Guardrail: Electric Magenta LED Strip */}
      <group position={[-8.4, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.3, 0.72, 280]} />
          <meshStandardMaterial color="#1e112a" roughness={0.5} />
        </mesh>
        <mesh position={[0.16, 0.15, 0]}>
          <boxGeometry args={[0.06, 0.14, 280]} />
          <meshBasicMaterial color="#e879f9" />
        </mesh>
        <pointLight position={[0.8, 0.3, -10]} intensity={2.2} distance={18} color="#e879f9" />
        <pointLight position={[0.8, 0.3, 50]} intensity={2.2} distance={18} color="#e879f9" />
        <pointLight position={[0.8, 0.3, 110]} intensity={2.2} distance={18} color="#e879f9" />
      </group>

      {/* Right Guardrail: High-Voltage Cyan / Sky LED Strip */}
      <group position={[8.4, 0.45, 40]}>
        <mesh>
          <boxGeometry args={[0.3, 0.72, 280]} />
          <meshStandardMaterial color="#111c2a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.16, 0.15, 0]}>
          <boxGeometry args={[0.06, 0.14, 280]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[-0.8, 0.3, -10]} intensity={2.2} distance={18} color="#38bdf8" />
        <pointLight position={[-0.8, 0.3, 50]} intensity={2.2} distance={18} color="#38bdf8" />
        <pointLight position={[-0.8, 0.3, 110]} intensity={2.2} distance={18} color="#38bdf8" />
      </group>

      {/* 3. MULTI-LEVEL ELEVATED HIGHWAY FLYOVER CROSSING OVERHEAD (Matching Reference Image 04) */}
      <group ref={flyoverGroupRef} position={[0, 0, 0]}>
        {[-20, 90].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Curved Elevated Highway Deck passing overhead */}
            <mesh position={[0, 9.5, 0]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[75, 2.5, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Glowing Vehicle Light Trails on the Flyover */}
            <mesh position={[0, 11.2, -2.5]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[75, 0.15, 0.4]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 11.2, 2.5]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[75, 0.15, 0.4]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            {/* Flyover Support Columns */}
            <mesh position={[-16, 4.5, 0]}>
              <cylinderGeometry args={[0.9, 1.1, 9.5]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[16, 4.5, 0]}>
              <cylinderGeometry args={[0.9, 1.1, 9.5]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. MASSIVE ILLUMINATED NEON BILLBOARDS (Matching Reference Image 04) */}
      {/* Huge Vertical Cyberpunk Action Billboard on Left Skyscraper */}
      <group position={[-18, 18, 55]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 22, 14]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.05, 20.5, 12.8]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <pointLight position={[3, 0, 0]} intensity={4.5} distance={32} color="#c084fc" />
      </group>

      {/* Large Horizontal "MEANWHILE" Cyan Neon Billboard on Right Tower */}
      <group position={[18, 16, 65]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 12, 22]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[-0.45, 0, 0]}>
          <boxGeometry args={[0.05, 10.8, 20.5]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[-3, 0, 0]} intensity={4.0} distance={32} color="#38bdf8" />
      </group>

      {/* 5. TOWERING NYC SKYSCRAPERS WITH ILLUMINATED WINDOW MATRICES & EMPIRE SPIRES */}
      <group ref={buildingsGroupRef} position={[0, 0, 0]}>
        {[-70, -20, 30, 80, 130, 180].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Skyscrapers */}
            <SkyscraperTower 
              position={[-22, 0, -10]} 
              width={14} 
              depth={18} 
              height={58} 
              neonColor="#e879f9" 
              hasEmpireSpire={idx % 2 === 0} 
            />
            <SkyscraperTower 
              position={[-34, 0, 15]} 
              width={18} 
              depth={22} 
              height={78} 
              neonColor="#38bdf8" 
            />
            <SkyscraperTower 
              position={[-20, 0, 36]} 
              width={13} 
              depth={16} 
              height={46} 
              neonColor="#a855f7" 
            />

            {/* Right Skyscrapers */}
            <SkyscraperTower 
              position={[22, 0, -10]} 
              width={14} 
              depth={18} 
              height={62} 
              neonColor="#38bdf8" 
              hasEmpireSpire={idx % 2 !== 0} 
            />
            <SkyscraperTower 
              position={[34, 0, 16]} 
              width={18} 
              depth={22} 
              height={82} 
              neonColor="#e879f9" 
            />
            <SkyscraperTower 
              position={[20, 0, 38]} 
              width={13} 
              depth={16} 
              height={48} 
              neonColor="#34d399" 
            />
          </group>
        ))}
      </group>
    </group>
  );
};

// Skyscraper with illuminated window rows and rooftop spire
const SkyscraperTower = ({ position, width = 16, depth = 20, height = 50, neonColor = '#38bdf8', hasEmpireSpire = false }) => (
  <group position={position}>
    {/* Main Monolith Tower Mass */}
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#050812" roughness={0.25} metalness={0.75} />
    </mesh>

    {/* Illuminated Window Matrix Band */}
    <mesh position={[0, height * 0.58, 0]}>
      <boxGeometry args={[width + 0.15, height * 0.65, depth + 0.15]} />
      <meshStandardMaterial color="#16152b" roughness={0.15} metalness={0.65} />
    </mesh>

    {/* Neon Glowing Architectural Accent Ribs */}
    <mesh position={[0, height * 0.78, 0]}>
      <boxGeometry args={[width + 0.25, 0.45, depth + 0.25]} />
      <meshBasicMaterial color={neonColor} />
    </mesh>

    <mesh position={[0, height * 0.45, 0]}>
      <boxGeometry args={[width + 0.25, 0.45, depth + 0.25]} />
      <meshBasicMaterial color={neonColor} />
    </mesh>

    {/* Empire State / Chrysler Style Rooftop Art-Deco Spire */}
    {hasEmpireSpire && (
      <group position={[0, height, 0]}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[width * 0.5, 6, depth * 0.5]} />
          <meshStandardMaterial color="#090d1a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 8, 0]}>
          <cylinderGeometry args={[0.1, 0.4, 8, 8]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
        <pointLight position={[0, 11, 0]} intensity={2.5} distance={40} color={neonColor} />
      </group>
    )}
  </group>
);
