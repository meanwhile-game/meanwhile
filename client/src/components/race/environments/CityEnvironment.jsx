import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 04 NEON CITY ENVIRONMENT (Dynamic Moving Metropolis)
// Futuristic NYC-inspired metropolis, skyscrapers, elevated highway flyovers, illuminated billboards, neon signage, and cyber finish gantry
export const CityEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const buildingsGroupRef = useRef();
  const flyoverGroupRef = useRef();
  const billboardPortalRef = useRef();
  const finishGantryRef = useRef();

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

    // --- LANDMARK PROGRESSION (Metropolis landscape changes as car travels!) ---
    // 1. ELEVATED EXPRESSWAY FLYOVER: Approaches and spans overhead (Z=240 -> -50) during progress 20% -> 60%
    if (flyoverGroupRef.current) {
      const flyoverTargetZ = 240 - ((progress - 0.18) / 0.42) * 300;
      flyoverGroupRef.current.position.z = THREE.MathUtils.lerp(
        flyoverGroupRef.current.position.z,
        flyoverTargetZ,
        delta * 3.5
      );
    }

    // 2. TIMES SQUARE CYBER BILLBOARD PORTAL: Approaches during progress 50% -> 85%
    if (billboardPortalRef.current) {
      const billboardTargetZ = 250 - ((progress - 0.48) / 0.38) * 280;
      billboardPortalRef.current.position.z = THREE.MathUtils.lerp(
        billboardPortalRef.current.position.z,
        billboardTargetZ,
        delta * 3.5
      );
    }

    // 3. CYBER METROPOLIS FINISH GANTRY: Approaches during final stretch (progress 78% -> 100%)
    if (finishGantryRef.current) {
      const gantryTargetZ = 240 - ((progress - 0.78) / 0.22) * 255;
      finishGantryRef.current.position.z = THREE.MathUtils.lerp(
        finishGantryRef.current.position.z,
        gantryTargetZ,
        delta * 3.5
      );
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

      {/* 3. APPROACHING MULTI-LEVEL ELEVATED HIGHWAY FLYOVER (Spans overhead - car speeds underneath!) */}
      <group ref={flyoverGroupRef} position={[0, 0, 240]}>
        {/* Curved Elevated Highway Deck passing overhead */}
        <mesh position={[0, 9.5, 0]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[75, 2.5, 14]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* Glowing Vehicle Light Trails on the Flyover Deck */}
        <mesh position={[0, 11.2, -3.0]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[75, 0.2, 0.5]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 11.2, 3.0]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[75, 0.2, 0.5]} />
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

      {/* 4. TIMES SQUARE CYBER BILLBOARD PORTAL (Sector 2-3) */}
      <group ref={billboardPortalRef} position={[0, 0, 250]}>
        {/* Left Giant Billboard */}
        <group position={[-18, 16, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 20, 14]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0.45, 0, 0]}>
            <boxGeometry args={[0.05, 18.5, 12.8]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
          <pointLight position={[3, 0, 0]} intensity={4.5} distance={32} color="#c084fc" />
        </group>
        {/* Right Giant Billboard */}
        <group position={[18, 16, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 16, 20]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[-0.45, 0, 0]}>
            <boxGeometry args={[0.05, 14.5, 18.5]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <pointLight position={[-3, 0, 0]} intensity={4.0} distance={32} color="#38bdf8" />
        </group>
      </group>

      {/* 5. CYBER METROPOLIS FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <CityFinishGantry />
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

// High-Tech Cyber Metropolis Finish Line Gantry
const CityFinishGantry = () => (
  <group>
    {/* Left Heavy Carbon Truss Pillar */}
    <mesh position={[-9.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#050812" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Right Heavy Carbon Truss Pillar */}
    <mesh position={[9.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#050812" metalness={0.9} roughness={0.2} />
    </mesh>

    {/* Overhead Electronic Gantry Bridge */}
    <mesh position={[0, 10.5, 0]}>
      <boxGeometry args={[20.5, 1.8, 2.2]} />
      <meshStandardMaterial color="#0b0f19" metalness={0.9} roughness={0.15} />
    </mesh>

    {/* Checkered LED Racing Matrix */}
    <mesh position={[0, 9.2, 0.2]}>
      <boxGeometry args={[17, 1.4, 0.1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>

    {/* Digital Neon Time & Leaderboard Display */}
    <mesh position={[0, 9.2, 0.3]}>
      <boxGeometry args={[10, 0.9, 0.05]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>

    {/* Green Laser Finish Strobes */}
    {[-7, -2.5, 2.5, 7].map((fx, i) => (
      <group key={i} position={[fx, 8.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={4.0} distance={24} color="#22c55e" />
      </group>
    ))}

    {/* Magenta / Cyan Edge Neon Accents */}
    <mesh position={[0, 11.45, 0]}>
      <boxGeometry args={[20.8, 0.15, 0.15]} />
      <meshBasicMaterial color="#e879f9" />
    </mesh>

    {/* Road Finish Line Stripe on Wet Neon Asphalt */}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16.5, 2.8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.7} />
    </mesh>
  </group>
);

