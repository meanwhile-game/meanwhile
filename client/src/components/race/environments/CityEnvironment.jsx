import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPhotorealisticRoadTexture } from '../RealisticRoadElements.jsx';

/**
 * 04 NEON CITY ENVIRONMENT (Photorealistic Dynamic Metropolis)
 * Features rain-slicked wet asphalt with realistic puddle reflections,
 * dense architectural skyscrapers with varied office window illumination,
 * elevated highway flyovers with moving vehicle light streaks,
 * Times Square high-res cyber billboards, and illuminated guardrails.
 */
export const CityEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const buildingsGroupRef = useRef();
  const flyoverGroupRef = useRef();
  const billboardPortalRef = useRef();
  const finishGantryRef = useRef();
  const trafficStreaksRef = useRef();

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

    // Flyover vehicle light streaks
    if (trafficStreaksRef.current) {
      trafficStreaksRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 6;
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

  // Rain-Slicked High-Definition City Road Texture
  const dashesTexture = useMemo(() => {
    return createPhotorealisticRoadTexture({
      lanes: 4,
      dashedColor: '#38bdf8',
      edgeColor: '#c084fc',
      isWet: true
    });
  }, []);

  return (
    <group>
      {/* 1. Rain-Slicked Wet Mirror Asphalt with Deep Specular Reflections & Puddle Sheen */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[17.5, 280]} />
        <meshPhysicalMaterial 
          color="#080c16" 
          roughness={0.24} 
          metalness={0.65} 
          clearcoat={0.92}
          clearcoatRoughness={0.08}
          reflectivity={0.95}
          envMapIntensity={2.4}
        />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[17.2, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.95} />
      </mesh>

      {/* 2. GLOWING HIGH-TECH HIGHWAY GUARDRAIL BARRIERS */}
      {/* Left Guardrail: Electric Magenta LED Strip with Metallic Post Supports */}
      <group position={[-8.8, 0.45, 40]}>
        {/* Steel Backing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.65, 280]} />
          <meshStandardMaterial color="#1e1329" metalness={0.88} roughness={0.3} />
        </mesh>
        {/* Glowing LED Blade */}
        <mesh position={[0.12, 0.12, 0]}>
          <boxGeometry args={[0.04, 0.12, 280]} />
          <meshBasicMaterial color="#e879f9" />
        </mesh>
        <pointLight position={[0.6, 0.2, -10]} intensity={1.8} distance={16} color="#e879f9" />
        <pointLight position={[0.6, 0.2, 50]} intensity={1.8} distance={16} color="#e879f9" />
        <pointLight position={[0.6, 0.2, 110]} intensity={1.8} distance={16} color="#e879f9" />
      </group>

      {/* Right Guardrail: High-Voltage Cyan LED Strip */}
      <group position={[8.8, 0.45, 40]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.65, 280]} />
          <meshStandardMaterial color="#111c29" metalness={0.88} roughness={0.3} />
        </mesh>
        <mesh position={[-0.12, 0.12, 0]}>
          <boxGeometry args={[0.04, 0.12, 280]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[-0.6, 0.2, -10]} intensity={1.8} distance={16} color="#38bdf8" />
        <pointLight position={[-0.6, 0.2, 50]} intensity={1.8} distance={16} color="#38bdf8" />
        <pointLight position={[-0.6, 0.2, 110]} intensity={1.8} distance={16} color="#38bdf8" />
      </group>

      {/* 3. APPROACHING MULTI-LEVEL ELEVATED HIGHWAY FLYOVER */}
      <group ref={flyoverGroupRef} position={[0, 0, 240]}>
        {/* Curved Elevated Highway Deck passing overhead */}
        <mesh position={[0, 9.8, 0]} rotation={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[78, 2.4, 14]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Concrete Safety Barriers on Flyover Deck */}
        <mesh position={[0, 11.4, -6.5]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[78, 1.2, 0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        <mesh position={[0, 11.4, 6.5]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[78, 1.2, 0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
        {/* Vehicle Light Trails on the Flyover Deck */}
        <group ref={trafficStreaksRef}>
          <mesh position={[0, 11.2, -3.2]} rotation={[0, -0.15, 0]}>
            <boxGeometry args={[78, 0.18, 0.4]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 11.2, 3.2]} rotation={[0, -0.15, 0]}>
            <boxGeometry args={[78, 0.18, 0.4]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
        {/* Flyover Heavy Cylindrical Concrete Pillars */}
        <mesh position={[-16, 4.8, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.3, 10, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[16, 4.8, 0]} castShadow>
          <cylinderGeometry args={[1.1, 1.3, 10, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>

      {/* 4. TIMES SQUARE CYBER BILLBOARD PORTAL (Sector 2-3) */}
      <group ref={billboardPortalRef} position={[0, 0, 250]}>
        {/* Left Giant Billboard Display */}
        <group position={[-19, 16, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 20, 15]} />
            <meshStandardMaterial color="#020617" metalness={0.9} />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[0.05, 18.8, 13.8]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
          <pointLight position={[3.5, 0, 0]} intensity={3.5} distance={30} color="#c084fc" />
        </group>
        {/* Right Giant Billboard Display */}
        <group position={[19, 16, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 17, 21]} />
            <meshStandardMaterial color="#020617" metalness={0.9} />
          </mesh>
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[0.05, 15.6, 19.6]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <pointLight position={[-3.5, 0, 0]} intensity={3.5} distance={30} color="#38bdf8" />
        </group>
      </group>

      {/* 5. CYBER METROPOLIS FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <CityFinishGantry />
      </group>

      {/* 6. TOWERING SKYSCRAPERS WITH ILLUMINATED WINDOW MATRICES & ARCHITECTURAL SPIRES */}
      <group ref={buildingsGroupRef} position={[0, 0, 0]}>
        {[-70, -20, 30, 80, 130, 180].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Left Skyscrapers */}
            <SkyscraperTower 
              position={[-23, 0, -10]} 
              width={15} 
              depth={19} 
              height={62} 
              neonColor="#e879f9" 
              windowWarmth={idx % 2 === 0 ? '#fde047' : '#38bdf8'}
              hasEmpireSpire={idx % 2 === 0} 
            />
            <SkyscraperTower 
              position={[-36, 0, 16]} 
              width={19} 
              depth={23} 
              height={84} 
              neonColor="#38bdf8" 
              windowWarmth="#67e8f9"
            />
            <SkyscraperTower 
              position={[-21, 0, 38]} 
              width={14} 
              depth={17} 
              height={50} 
              neonColor="#a855f7" 
              windowWarmth="#fed7aa"
            />

            {/* Right Skyscrapers */}
            <SkyscraperTower 
              position={[23, 0, -10]} 
              width={15} 
              depth={19} 
              height={66} 
              neonColor="#38bdf8" 
              windowWarmth="#fde047"
              hasEmpireSpire={idx % 2 !== 0} 
            />
            <SkyscraperTower 
              position={[36, 0, 17]} 
              width={19} 
              depth={23} 
              height={88} 
              neonColor="#e879f9" 
              windowWarmth="#a78bfa"
            />
            <SkyscraperTower 
              position={[21, 0, 40]} 
              width={14} 
              depth={17} 
              height={52} 
              neonColor="#34d399" 
              windowWarmth="#86efac"
            />
          </group>
        ))}
      </group>
    </group>
  );
};

// High-fidelity skyscraper with illuminated architectural facades & glass curtain wall
const SkyscraperTower = ({ 
  position, 
  width = 16, 
  depth = 20, 
  height = 50, 
  neonColor = '#38bdf8', 
  windowWarmth = '#fde047',
  hasEmpireSpire = false 
}) => {
  // Procedural illuminated office window texture
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, 128, 256);

    // Grid of office windows
    const cols = 8;
    const rows = 16;
    const w = 10;
    const h = 10;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Stochastic office lights on/off
        if (Math.random() > 0.42) {
          ctx.fillStyle = Math.random() > 0.5 ? windowWarmth : '#e0f2fe';
          ctx.fillRect(c * 16 + 3, r * 16 + 3, w, h);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, Math.floor(height / 12));
    return tex;
  }, [height, windowWarmth]);

  return (
    <group position={position}>
      {/* Main Structural Mass */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#060912" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Illuminated Glass Curtain Wall Facade */}
      <mesh position={[0, height * 0.55, 0]}>
        <boxGeometry args={[width + 0.12, height * 0.72, depth + 0.12]} />
        <meshStandardMaterial 
          map={windowTexture} 
          roughness={0.2} 
          metalness={0.8} 
          emissiveMap={windowTexture}
          emissive="#ffffff"
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* Neon Architectural Accent Ribs */}
      <mesh position={[0, height * 0.88, 0]}>
        <boxGeometry args={[width + 0.22, 0.5, depth + 0.22]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
      <mesh position={[0, height * 0.45, 0]}>
        <boxGeometry args={[width + 0.22, 0.5, depth + 0.22]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* Rooftop Mechanical Penthouse & Spire */}
      <group position={[0, height, 0]}>
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[width * 0.6, 4.4, depth * 0.6]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.8} />
        </mesh>
        {hasEmpireSpire && (
          <group position={[0, 4.4, 0]}>
            <mesh position={[0, 5, 0]}>
              <cylinderGeometry args={[0.08, 0.45, 10, 8]} />
              <meshBasicMaterial color={neonColor} />
            </mesh>
            <pointLight position={[0, 9.5, 0]} intensity={2.0} distance={32} color={neonColor} />
          </group>
        )}
      </group>
    </group>
  );
};

// High-Tech Cyber Metropolis Finish Line Gantry
const CityFinishGantry = () => (
  <group>
    {/* Left Heavy Carbon Truss Pillar */}
    <mesh position={[-9.6, 5.5, 0]} castShadow>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#080c16" metalness={0.92} roughness={0.2} />
    </mesh>
    {/* Right Heavy Carbon Truss Pillar */}
    <mesh position={[9.6, 5.5, 0]} castShadow>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#080c16" metalness={0.92} roughness={0.2} />
    </mesh>

    {/* Overhead Electronic Gantry Bridge */}
    <mesh position={[0, 10.6, 0]} castShadow>
      <boxGeometry args={[20.8, 1.9, 2.2]} />
      <meshStandardMaterial color="#0b0f19" metalness={0.92} roughness={0.18} />
    </mesh>

    {/* Checkered LED Racing Matrix */}
    <mesh position={[0, 9.4, 0.2]}>
      <boxGeometry args={[17.2, 1.4, 0.1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.5} />
    </mesh>

    {/* Digital Neon Time & Leaderboard Display */}
    <mesh position={[0, 9.4, 0.3]}>
      <boxGeometry args={[10.5, 0.9, 0.05]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>

    {/* Green Laser Finish Strobes */}
    {[-7, -2.5, 2.5, 7].map((fx, i) => (
      <group key={i} position={[fx, 8.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={3.5} distance={22} color="#22c55e" />
      </group>
    ))}

    {/* Neon Edge Accents */}
    <mesh position={[0, 11.6, 0]}>
      <boxGeometry args={[21, 0.15, 0.15]} />
      <meshBasicMaterial color="#e879f9" />
    </mesh>

    {/* Road Finish Line Stripe on Wet Neon Asphalt */}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[17.5, 2.8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.7} />
    </mesh>
  </group>
);
