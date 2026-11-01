import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPhotorealisticRoadTexture } from '../RealisticRoadElements.jsx';

// 06 NEW DELHI — RAJPATH CIRCUIT (Reference Right Panel)
// Ceremonial avenues of Kartavya Path, towering India Gate landmark ahead,
// illuminated Rashtrapati Bhavan dome, water fountains, tricolor banners,
// and rain-slicked twilight road reflections in amber and midnight blue.
export const DelhiEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const avenueGroupRef = useRef();
  const fountainsGroupRef = useRef();
  const trafficGroupRef = useRef();
  const indiaGateRef = useRef();
  const raisinaHillRef = useRef();
  const finishGantryRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Road texture animation
    if (dashesMatRef.current && dashesMatRef.current.map) {
      dashesMatRef.current.map.offset.y -= (speedKmh / 3600) * delta * 24;
    }

    // Moving ceremonial roadside trees, lamps & tricolor banners loop
    if (avenueGroupRef.current) {
      avenueGroupRef.current.position.z = (avenueGroupRef.current.position.z + moveStep * 0.7) % 80;
    }

    // Looping illuminated fountains
    if (fountainsGroupRef.current) {
      fountainsGroupRef.current.position.z = (fountainsGroupRef.current.position.z + moveStep * 0.7) % 120;
    }

    // Moving traffic ahead
    if (trafficGroupRef.current) {
      trafficGroupRef.current.position.z = (trafficGroupRef.current.position.z + moveStep * 0.45) % 110;
    }

    // --- LANDMARK PROGRESSION (The landscape actually changes and takes the driver!) ---
    // 1. TOWERING INDIA GATE ARCH: Approaches from far horizon (Z=260) and car zooms directly under it (Z=-50) during progress 15% -> 55%
    if (indiaGateRef.current) {
      const gateTargetZ = 260 - (progress / 0.52) * 320;
      indiaGateRef.current.position.z = THREE.MathUtils.lerp(
        indiaGateRef.current.position.z,
        gateTargetZ,
        delta * 3.5
      );
    }

    // 2. RAISINA HILL & RASHTRAPATI BHAVAN DOME: Rises and approaches in Sector 3 (progress 50% -> 95%)
    if (raisinaHillRef.current) {
      const hillTargetZ = 280 - ((progress - 0.48) / 0.48) * 260;
      raisinaHillRef.current.position.z = THREE.MathUtils.lerp(
        raisinaHillRef.current.position.z,
        hillTargetZ,
        delta * 3.5
      );
    }

    // 3. GRAND PRIX FINISH LINE GANTRY: Approaches as the race concludes (progress 78% -> 100%)
    if (finishGantryRef.current) {
      const gantryTargetZ = 240 - ((progress - 0.78) / 0.22) * 255;
      finishGantryRef.current.position.z = THREE.MathUtils.lerp(
        finishGantryRef.current.position.z,
        gantryTargetZ,
        delta * 3.5
      );
    }
  });

  // Rain-Slicked Ceremonial Avenue Road Texture with 4 Lanes & Red Sandstone Curbs
  const dashesTexture = useMemo(() => {
    return createPhotorealisticRoadTexture({
      lanes: 4,
      dashedColor: '#f8fafc',
      edgeColor: '#fbbf24',
      isWet: true
    });
  }, []);

  return (
    <group>
      {/* 1. RAIN-SLICKED WET MIRROR CEREMONIAL ASPHALT WITH DEEP SPECULAR REFLECTIONS */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18.5, 280]} />
        <meshPhysicalMaterial 
          color="#080b13" 
          roughness={0.08} 
          metalness={0.88} 
          clearcoat={1.0} 
          clearcoatRoughness={0.05} 
        />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18.2, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.94} />
      </mesh>

      {/* Wet Road Mirror Taillight & Monument Glow Reflection Streaks */}
      <mesh position={[0, -0.035, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 70]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.038, 75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.0, 150]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      {/* Dholpur Red Sandstone Curbs & Pavements */}
      <mesh position={[-9.6, 0.15, 40]}>
        <boxGeometry args={[1.4, 0.35, 280]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      <mesh position={[9.6, 0.15, 40]}>
        <boxGeometry args={[1.4, 0.35, 280]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>

      {/* Manicured Lawns of Kartavya Path flanking both sides */}
      <mesh position={[-25, -0.02, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 280]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} />
      </mesh>
      <mesh position={[25, -0.02, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 280]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} />
      </mesh>

      {/* Trimmed Green Hedges along Avenue Borders */}
      <mesh position={[-10.8, 0.45, 40]}>
        <boxGeometry args={[0.8, 0.8, 280]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
      <mesh position={[10.8, 0.45, 40]}>
        <boxGeometry args={[0.8, 0.8, 280]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>

      {/* 2. THE MAGNIFICENT INDIA GATE (Spans the avenue - car drives right under it!) */}
      <group ref={indiaGateRef} position={[0, 0, 260]}>
        <IndiaGateMonument />
      </group>

      {/* 3. RAISINA HILL & RASHTRAPATI BHAVAN DOME (Approaches during Sector 3) */}
      <group ref={raisinaHillRef} position={[0, 0, 280]}>
        <group position={[-28, 0, 0]}>
          <RashtrapatiBhavanDome />
        </group>
        {/* North Block & South Block Classical Colonnaded Wings */}
        <group position={[-28, 0, -25]}>
          <mesh position={[0, 6, 0]}>
            <boxGeometry args={[28, 12, 45]} />
            <meshStandardMaterial color="#b45309" roughness={0.75} />
          </mesh>
          {/* Classical Sandstone Colonnade */}
          {[-18, -9, 0, 9, 18].map((cz, ci) => (
            <mesh key={ci} position={[12, 6, cz]}>
              <cylinderGeometry args={[0.5, 0.5, 12, 12]} />
              <meshStandardMaterial color="#d97706" roughness={0.7} />
            </mesh>
          ))}
        </group>
        <group position={[28, 0, -25]}>
          <mesh position={[0, 6, 0]}>
            <boxGeometry args={[28, 12, 45]} />
            <meshStandardMaterial color="#b45309" roughness={0.75} />
          </mesh>
          {[-18, -9, 0, 9, 18].map((cz, ci) => (
            <mesh key={ci} position={[-12, 6, cz]}>
              <cylinderGeometry args={[0.5, 0.5, 12, 12]} />
              <meshStandardMaterial color="#d97706" roughness={0.7} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 4. GRAND PRIX FINISH LINE GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 260]}>
        <DelhiFinishGantry />
      </group>

      {/* 5. ILLUMINATED WATER CANALS & FOUNTAINS OF RAJPATH (Flanking the Avenue) */}
      <group ref={fountainsGroupRef} position={[0, 0, 0]}>
        {[-40, 20, 80].map((z, idx) => (
          <React.Fragment key={idx}>
            <RajpathFountain position={[-18, 0, z]} />
            <RajpathFountain position={[18, 0, z + 10]} />
          </React.Fragment>
        ))}
      </group>

      {/* 6. LOOPING CEREMONIAL TREES, ORNAMENTAL LAMPOSTS & TRICOLOR BANNERS */}
      <group ref={avenueGroupRef} position={[0, 0, 0]}>
        {[-60, -20, 20, 60, 100, 140].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            <AvenueTree position={[-14.5, 0, 0]} scale={1.2} />
            <AvenueTree position={[14.5, 0, 0]} scale={1.2} />
            <RajpathLamppost position={[-10.2, 0, 0]} facing={1} />
            <RajpathLamppost position={[10.2, 0, 0]} facing={-1} />
          </group>
        ))}
      </group>

      {/* 7. DRAMATIC TWILIGHT SKY CLOUDS & AMBER ILLUMINATION */}
      <group position={[0, 32, 160]}>
        <mesh position={[-25, 4, -10]}>
          <boxGeometry args={[80, 8, 14]} />
          <meshStandardMaterial color="#3b0764" transparent opacity={0.45} roughness={1} />
        </mesh>
        <mesh position={[28, 6, 0]}>
          <boxGeometry args={[70, 7, 12]} />
          <meshStandardMaterial color="#4c1d95" transparent opacity={0.4} roughness={1} />
        </mesh>
        <mesh position={[0, 10, -20]}>
          <boxGeometry args={[90, 6, 12]} />
          <meshStandardMaterial color="#581c87" transparent opacity={0.35} roughness={1} />
        </mesh>
      </group>

      {/* 8. DISTANT TRAFFIC AHEAD */}
      <group ref={trafficGroupRef} position={[0, 0, 0]}>
        {[-25, 30, 85].map((z, idx) => (
          <group key={idx} position={[3.2 * ((idx % 3) - 1), 0.45, z]}>
            <mesh>
              <boxGeometry args={[1.8, 0.7, 3.8]} />
              <meshStandardMaterial color="#0b0f19" roughness={0.4} />
            </mesh>
            <mesh position={[-0.65, 0.1, -1.92]}>
              <boxGeometry args={[0.38, 0.12, 0.06]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.65, 0.1, -1.92]}>
              <boxGeometry args={[0.38, 0.12, 0.06]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <pointLight position={[0, 0.1, -2.1]} intensity={2.0} distance={15} color="#ef4444" />
          </group>
        ))}
      </group>
    </group>
  );
};

// 3D Monumental India Gate Archway (Accurately proportioned triumphal sandstone arch spanning the 4-lane avenue)
const IndiaGateMonument = () => (
  <group>
    {/* Stepped Plinth Foundation (Red Sandstone flanking both sides of the roadway) */}
    {/* Left Plinth */}
    <mesh position={[-15, 1.2, 0]}>
      <boxGeometry args={[11, 2.4, 18]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>
    <mesh position={[-15, 2.8, 0]}>
      <boxGeometry args={[10, 1.2, 16.5]} />
      <meshStandardMaterial color="#92400e" roughness={0.8} />
    </mesh>
    {/* Right Plinth */}
    <mesh position={[15, 1.2, 0]}>
      <boxGeometry args={[11, 2.4, 18]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>
    <mesh position={[15, 2.8, 0]}>
      <boxGeometry args={[10, 1.2, 16.5]} />
      <meshStandardMaterial color="#92400e" roughness={0.8} />
    </mesh>

    {/* Main Pylons (Left & Right Massive Piers Flanking Roadway) */}
    {/* Left Pier */}
    <mesh position={[-15, 13.5, 0]}>
      <boxGeometry args={[9.5, 20, 15.5]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>
    {/* Right Pier */}
    <mesh position={[15, 13.5, 0]}>
      <boxGeometry args={[9.5, 20, 15.5]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>

    {/* Central Semicircular Arch Vault Spanning Over the Road (Width 20.5m, Height 21m) */}
    <group position={[0, 16.5, 0]}>
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[10.3, 10.3, 15.6, 24, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
    </group>

    {/* Upper Arch Spandrel & Entablature Beam across Top */}
    <mesh position={[0, 25.5, 0]}>
      <boxGeometry args={[40, 4.5, 16]} />
      <meshStandardMaterial color="#d97706" roughness={0.65} />
    </mesh>

    {/* "INDIA" Inscription Frieze Band */}
    <mesh position={[0, 28.5, 0]}>
      <boxGeometry args={[38, 2.2, 15]} />
      <meshStandardMaterial color="#b45309" roughness={0.7} />
    </mesh>
    {/* Front Inscription Relief Plate with Gold Inscription Glow */}
    <mesh position={[0, 28.5, 7.6]}>
      <boxGeometry args={[16, 1.5, 0.2]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>

    {/* Molded Cornice Projection */}
    <mesh position={[0, 30.2, 0]}>
      <boxGeometry args={[41, 1.4, 17]} />
      <meshStandardMaterial color="#fef08a" roughness={0.6} />
    </mesh>

    {/* Stepped Attic Stage on Roof */}
    <mesh position={[0, 32.0, 0]}>
      <boxGeometry args={[32, 2.2, 13.5]} />
      <meshStandardMaterial color="#b45309" roughness={0.7} />
    </mesh>
    <mesh position={[0, 34.0, 0]}>
      <boxGeometry args={[26, 1.8, 11]} />
      <meshStandardMaterial color="#92400e" roughness={0.7} />
    </mesh>

    {/* Top Ceremonial Shallow Domed Urn / Chhatri Bowl */}
    <mesh position={[0, 36.0, 0]}>
      <cylinderGeometry args={[3.5, 2.5, 1.8, 16]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>

    {/* AMAR JAWAN JYOTI: Eternal Golden Flame in Road Median under Arch Vault */}
    <group position={[0, 0.6, 0]}>
      {/* Black Marble Cenotaph Plinth */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.4, 0.8, 1.4]} />
        <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Inverted Rifle & Helmet */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.0]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color="#1e3a1e" roughness={0.7} />
      </mesh>
      {/* 4 Corner Eternal Flame Urns */}
      {[-0.55, 0.55].map((fx, i) =>
        [-0.55, 0.55].map((fz, j) => (
          <group key={`${i}-${j}`} position={[fx, 0.85, fz]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.06, 0.15, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <coneGeometry args={[0.1, 0.35, 8]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
          </group>
        ))
      )}
      {/* Warm Golden Uplight Illuminating Interior Archway Vault as car zooms through */}
      <pointLight position={[0, 3.5, 0]} intensity={5.5} distance={38} color="#f59e0b" />
    </group>

    {/* Distant Illuminated Chhatri / Canopy visible beyond archway */}
    <group position={[0, 4, 38]}>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 8, 8]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0, 8.5, 0]}>
        <sphereGeometry args={[1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <pointLight position={[0, 7, 0]} intensity={2.5} distance={20} color="#fef08a" />
    </group>

    {/* Intense Golden Floodlighting Washing India Gate against Twilight */}
    <pointLight position={[-16, 2, 12]} intensity={6.5} distance={42} color="#f59e0b" />
    <pointLight position={[16, 2, 12]} intensity={6.5} distance={42} color="#f59e0b" />
    <pointLight position={[0, 2, 14]} intensity={7.0} distance={45} color="#fbbf24" />
    <pointLight position={[0, 16, 0]} intensity={4.0} distance={30} color="#fde047" />
  </group>
);

// Distant Rashtrapati Bhavan Grand Dome (Inspired by Lutyens' Buddhist stupa copper dome)
const RashtrapatiBhavanDome = () => (
  <group>
    {/* Elevated Raisina Hill Sandstone Base */}
    <mesh position={[0, 5, 0]}>
      <boxGeometry args={[42, 10, 24]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>

    {/* Classical Classical Colonnade Pavilion */}
    <mesh position={[0, 12, 0]}>
      <boxGeometry args={[36, 4.5, 20]} />
      <meshStandardMaterial color="#b45309" roughness={0.75} />
    </mesh>

    {/* Cylindrical Colonnaded Drum Base of Dome */}
    <mesh position={[0, 16.5, 0]}>
      <cylinderGeometry args={[8.5, 9.2, 5, 24]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>

    {/* Grand Copper/Sandstone Buddhist Stupa Dome Profile */}
    <mesh position={[0, 22.5, 0]}>
      <sphereGeometry args={[8.4, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#ca8a04" metalness={0.65} roughness={0.35} />
    </mesh>

    {/* Top Lantern & Golden Finial */}
    <mesh position={[0, 31.5, 0]}>
      <cylinderGeometry args={[1.2, 1.4, 2.2, 12]} />
      <meshBasicMaterial color="#fef08a" />
    </mesh>
    <mesh position={[0, 33.2, 0]}>
      <sphereGeometry args={[0.8, 12, 12]} />
      <meshBasicMaterial color="#fbbf24" />
    </mesh>

    {/* Radiant Amber Glow from Rashtrapati Bhavan */}
    <pointLight position={[0, 24, 12]} intensity={6.0} distance={65} color="#f59e0b" />
    <pointLight position={[0, 32, 0]} intensity={4.5} distance={50} color="#fef08a" />
  </group>
);

// Illuminated Canal Water Fountain of Rajpath
const RajpathFountain = ({ position }) => {
  const waterRef = useRef();

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Rectangular Sandstone Reflecting Pool Rim */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[4.2, 0.5, 9.0]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      {/* Illuminated Water Pool Surface */}
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 8.4]} />
        <meshStandardMaterial color="#0284c7" roughness={0.05} metalness={0.9} />
      </mesh>

      {/* Vertical Arched Spray Jet Plumes */}
      <group ref={waterRef} position={[0, 0.5, 0]}>
        {[-2.5, 0, 2.5].map((fz, fi) => (
          <group key={fi} position={[0, 0, fz]}>
            {/* Center Vertical Spray */}
            <mesh position={[0, 2.4, 0]}>
              <cylinderGeometry args={[0.06, 0.25, 4.8, 8]} />
              <meshBasicMaterial color="#7dd3fc" transparent opacity={0.8} />
            </mesh>
            {/* Spray Tip Corona */}
            <mesh position={[0, 4.8, 0]}>
              <sphereGeometry args={[0.45, 8, 8]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Turquoise / White Fountain Underwater Illuminator */}
      <pointLight position={[0, 1.2, 0]} intensity={3.0} distance={14} color="#38bdf8" />
    </group>
  );
};

// Ceremonial Rajpath Cast-Iron Lamppost with Tricolor Banner
const RajpathLamppost = ({ position, facing = 1 }) => (
  <group position={position}>
    {/* Sandstone Octagonal Base */}
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.3, 0.38, 0.8, 8]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>

    {/* Cast-Iron Fluted Column Post */}
    <mesh position={[0, 4.0, 0]}>
      <cylinderGeometry args={[0.08, 0.12, 6.8, 8]} />
      <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
    </mesh>

    {/* Ornamental Brackets */}
    <mesh position={[0, 7.3, 0]}>
      <sphereGeometry args={[0.22, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.8} />
    </mesh>
    <mesh position={[facing * 0.4, 7.6, 0]}>
      <boxGeometry args={[0.8, 0.1, 0.1]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>

    {/* Amber Glowing Lantern */}
    <mesh position={[facing * 0.75, 7.3, 0]}>
      <cylinderGeometry args={[0.22, 0.15, 0.5, 6]} />
      <meshBasicMaterial color="#fef08a" />
    </mesh>
    {/* Amber Pool of Light on Roadside */}
    <pointLight position={[facing * 0.75, 7.0, 0]} intensity={2.6} distance={24} color="#f59e0b" />

    {/* INDIAN TRICOLOR CEREMONIAL VERTICAL BANNER (Saffron, White, Green) */}
    <group position={[facing * -0.3, 5.0, 0]} rotation={[0, (facing * Math.PI) / 2, 0]}>
      {/* Saffron Top Stripe */}
      <mesh position={[0, 0.75, 0]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshBasicMaterial color="#ff9933" side={THREE.DoubleSide} />
      </mesh>
      {/* White Middle Stripe */}
      <mesh position={[0, 0.25, 0]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* Green Bottom Stripe */}
      <mesh position={[0, -0.25, 0]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshBasicMaterial color="#138808" side={THREE.DoubleSide} />
      </mesh>
    </group>
  </group>
);

// Avenue Shade Tree (Neem / Jamun tree with dense rounded crown)
const AvenueTree = ({ position, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    {/* Tree Trunk */}
    <mesh position={[0, 2.2, 0]}>
      <cylinderGeometry args={[0.25, 0.35, 4.4, 8]} />
      <meshStandardMaterial color="#3f271d" roughness={0.9} />
    </mesh>
    {/* Dense Lush Crown */}
    <mesh position={[0, 5.8, 0]}>
      <sphereGeometry args={[2.8, 12, 12]} />
      <meshStandardMaterial color="#14532d" roughness={0.85} />
    </mesh>
    <mesh position={[0.8, 6.4, 0.5]}>
      <sphereGeometry args={[2.1, 10, 10]} />
      <meshStandardMaterial color="#166534" roughness={0.85} />
    </mesh>
    <mesh position={[-0.7, 6.2, -0.4]}>
      <sphereGeometry args={[1.9, 10, 10]} />
      <meshStandardMaterial color="#15803d" roughness={0.85} />
    </mesh>
  </group>
);

// Grand Prix Finish Line Gantry across Kartavya Path
const DelhiFinishGantry = () => (
  <group>
    {/* Left Truss Support Column */}
    <mesh position={[-10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
    </mesh>
    {/* Right Truss Support Column */}
    <mesh position={[10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
    </mesh>
    {/* Overhead Bridge Truss */}
    <mesh position={[0, 10.5, 0]}>
      <boxGeometry args={[22.5, 1.6, 2.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
    </mesh>

    {/* Checkered Finish Line Banner */}
    <mesh position={[0, 9.2, 0.2]}>
      <boxGeometry args={[19, 1.4, 0.1]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.4} />
    </mesh>
    {/* Digital LED Timing Display */}
    <mesh position={[0, 9.2, 0.3]}>
      <boxGeometry args={[10, 0.9, 0.05]} />
      <meshBasicMaterial color="#f59e0b" />
    </mesh>

    {/* Green Finish Flashers & Spotlights */}
    {[-8, -4, 0, 4, 8].map((fx, i) => (
      <group key={i} position={[fx, 8.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={3.5} distance={22} color="#22c55e" />
      </group>
    ))}

    {/* Tricolor LEDs on Gantry Edge */}
    <mesh position={[-5, 11.4, 0]}>
      <boxGeometry args={[6, 0.15, 0.15]} />
      <meshBasicMaterial color="#ff9933" />
    </mesh>
    <mesh position={[0, 11.4, 0]}>
      <boxGeometry args={[4, 0.15, 0.15]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh position={[5, 11.4, 0]}>
      <boxGeometry args={[6, 0.15, 0.15]} />
      <meshBasicMaterial color="#138808" />
    </mesh>

    {/* Road Finish Line Stripe on Asphalt */}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[18.5, 2.8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.5} />
    </mesh>
  </group>
);

