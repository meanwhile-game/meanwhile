import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 06 NEW DELHI — RAJPATH CIRCUIT (Reference Right Panel)
// Ceremonial avenues of Kartavya Path, towering India Gate landmark ahead,
// illuminated Rashtrapati Bhavan dome, water fountains, tricolor banners,
// and rain-slicked twilight road reflections in amber and midnight blue.
export const DelhiEnvironment = ({ speedKmh = 100 }) => {
  const dashesMatRef = useRef();
  const avenueGroupRef = useRef();
  const fountainsGroupRef = useRef();
  const trafficGroupRef = useRef();
  const indiaGateRef = useRef();

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

    // India Gate subtle monumental presence and light breathe
    if (indiaGateRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      indiaGateRef.current.position.y = 0 + pulse;
    }
  });

  // Rain-Slicked Ceremonial Avenue Road Texture with 4 Lanes & Red Sandstone Curbs
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#090c14';
    ctx.fillRect(0, 0, 256, 512);

    // Wet sheen noise
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 2, 2);
    }

    // Crisp white dashed lane divider lines
    ctx.fillStyle = '#f8fafc';
    [64, 128, 192].forEach((x) => {
      ctx.fillRect(x - 2, 35, 5, 145);
      ctx.fillRect(x - 2, 285, 5, 145);
    });

    // Solid outer edge boundary lines
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(10, 0, 4, 512);
    ctx.fillRect(242, 0, 4, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
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

      {/* Wet Road Mirror Taillight & Monument Glow Reflection Streaks (Matching Screenshot) */}
      {/* Red Taillight Reflection Streak */}
      <mesh position={[0, -0.035, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 70]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* Amber Monument Light Reflection Streak down Center Axis */}
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

      {/* 2. THE MAGNIFICENT INDIA GATE (Ahead on Axis - Towering Landmark) */}
      <group ref={indiaGateRef} position={[0, 0, 140]}>
        <IndiaGateMonument />
      </group>

      {/* 3. DISTANT RASHTRAPATI BHAVAN DOME (Left Distance, Glowing Golden in Twilight) */}
      <group position={[-38, 0, 115]}>
        <RashtrapatiBhavanDome />
      </group>

      {/* 4. ILLUMINATED WATER CANALS & FOUNTAINS OF RAJPATH (Flanking the Avenue) */}
      <group ref={fountainsGroupRef} position={[0, 0, 0]}>
        {[-40, 20, 80].map((z, idx) => (
          <React.Fragment key={idx}>
            {/* Left Canal Fountain */}
            <RajpathFountain position={[-18, 0, z]} />
            {/* Right Canal Fountain */}
            <RajpathFountain position={[18, 0, z + 10]} />
          </React.Fragment>
        ))}
      </group>

      {/* 5. LOOPING CEREMONIAL TREES, ORNAMENTAL LAMPOSTS & TRICOLOR BANNERS */}
      <group ref={avenueGroupRef} position={[0, 0, 0]}>
        {[-60, -20, 20, 60, 100, 140].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            {/* Mature Avenue Neem / Jamun Trees with Dense Rounded Crowns */}
            <AvenueTree position={[-14.5, 0, 0]} scale={1.2} />
            <AvenueTree position={[14.5, 0, 0]} scale={1.2} />

            {/* Classic Ceremonial Cast-Iron Lamp Post with Amber Lantern & Tricolor Banner */}
            <RajpathLamppost position={[-10.2, 0, 0]} facing={1} />
            <RajpathLamppost position={[10.2, 0, 0]} facing={-1} />
          </group>
        ))}
      </group>

      {/* 6. DRAMATIC TWILIGHT SKY CLOUDS & AMBER ILLUMINATION */}
      <group position={[0, 32, 160]}>
        {/* Purple/Indigo Twilight Clouds backlit with sunset gold */}
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

      {/* 7. DISTANT TRAFFIC AHEAD (Moving Red Taillights and Headlights along Rajpath) */}
      <group ref={trafficGroupRef} position={[0, 0, 0]}>
        {[-25, 30, 85].map((z, idx) => (
          <group key={idx} position={[3.2 * ((idx % 3) - 1), 0.45, z]}>
            <mesh>
              <boxGeometry args={[1.8, 0.7, 3.8]} />
              <meshStandardMaterial color="#0b0f19" roughness={0.4} />
            </mesh>
            {/* Taillights */}
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

// 3D Monumental India Gate Archway (Accurately proportioned triumphal sandstone arch)
const IndiaGateMonument = () => (
  <group>
    {/* Stepped Plinth Foundation (Red Sandstone) */}
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[26, 2.4, 16]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>
    <mesh position={[0, 2.8, 0]}>
      <boxGeometry args={[24, 1.2, 14.5]} />
      <meshStandardMaterial color="#92400e" roughness={0.8} />
    </mesh>

    {/* Main Pylons (Left & Right Massive Piers) */}
    {/* Left Pier */}
    <mesh position={[-7.5, 12.5, 0]}>
      <boxGeometry args={[8.5, 18, 13.5]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>
    {/* Right Pier */}
    <mesh position={[7.5, 12.5, 0]}>
      <boxGeometry args={[8.5, 18, 13.5]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>

    {/* Central Semicircular Arch Vault */}
    <group position={[0, 14.5, 0]}>
      {/* Arch Keystone & Intrados */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[4.25, 4.25, 13.6, 20, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
    </group>

    {/* Upper Arch Spandrel & Entablature Beam across Top */}
    <mesh position={[0, 22.5, 0]}>
      <boxGeometry args={[24.5, 3.5, 14]} />
      <meshStandardMaterial color="#d97706" roughness={0.65} />
    </mesh>

    {/* "INDIA" Inscription Frieze Band */}
    <mesh position={[0, 24.8, 0]}>
      <boxGeometry args={[23.5, 1.6, 13.5]} />
      <meshStandardMaterial color="#b45309" roughness={0.7} />
    </mesh>
    {/* Front Inscription Relief Plate */}
    <mesh position={[0, 24.8, 6.8]}>
      <boxGeometry args={[11, 1.1, 0.2]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>

    {/* Molded Cornice Projection */}
    <mesh position={[0, 26.2, 0]}>
      <boxGeometry args={[25.5, 1.2, 15]} />
      <meshStandardMaterial color="#fef08a" roughness={0.6} />
    </mesh>

    {/* Stepped Attic Stage on Roof */}
    <mesh position={[0, 27.5, 0]}>
      <boxGeometry args={[21, 1.8, 12]} />
      <meshStandardMaterial color="#b45309" roughness={0.7} />
    </mesh>
    <mesh position={[0, 29.0, 0]}>
      <boxGeometry args={[17, 1.4, 9.5]} />
      <meshStandardMaterial color="#92400e" roughness={0.7} />
    </mesh>

    {/* Top Ceremonial Shallow Domed Urn / Chhatri Bowl */}
    <mesh position={[0, 30.5, 0]}>
      <cylinderGeometry args={[2.5, 1.8, 1.2, 16]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>

    {/* Distant Illuminated Chhatri / Canopy visible through archway */}
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
    <pointLight position={[-12, 2, 10]} intensity={6.5} distance={42} color="#f59e0b" />
    <pointLight position={[12, 2, 10]} intensity={6.5} distance={42} color="#f59e0b" />
    <pointLight position={[0, 2, 12]} intensity={7.0} distance={45} color="#fbbf24" />
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
