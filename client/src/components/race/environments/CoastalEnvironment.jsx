import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 02 COASTAL RUN ENVIRONMENT (Reference Quadrant 2)
// Scenic highway following the ocean, coastal cliffs, turquoise water, seaside structures, bridges, and warm sunset lighting
// 02 COASTAL RUN ENVIRONMENT (Dynamic Moving Riviera Landscape)
// Scenic highway following the ocean, coastal cliffs, turquoise water, seaside arcade colonnade, Roman viaduct, and finish gantry
export const CoastalEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const dashesMatRef = useRef();
  const lampsGroupRef = useRef();
  const oceanRef = useRef();
  const sunGlowRef = useRef();
  const cliffsGroupRef = useRef();
  const viaductGroupRef = useRef();
  const finishGantryRef = useRef();

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

    // --- LANDMARK PROGRESSION (Riviera coastal landscape moves and takes the driver!) ---
    // 1. CLIFFSIDE VILLA & STONE ARCADE COLONNADE: Approaches on left (Z=250 -> -40) during progress 20% -> 60%
    if (cliffsGroupRef.current) {
      const cliffsTargetZ = 250 - ((progress - 0.18) / 0.42) * 290;
      cliffsGroupRef.current.position.z = THREE.MathUtils.lerp(
        cliffsGroupRef.current.position.z,
        cliffsTargetZ,
        delta * 3.5
      );
    }

    // 2. OVERHEAD ROMAN VIADUCT AQUEDUCT: Approaches and spans overhead (Z=260 -> -50) during progress 45% -> 80%
    if (viaductGroupRef.current) {
      const viaductTargetZ = 260 - ((progress - 0.42) / 0.38) * 310;
      viaductGroupRef.current.position.z = THREE.MathUtils.lerp(
        viaductGroupRef.current.position.z,
        viaductTargetZ,
        delta * 3.5
      );
    }

    // 3. RIVIERA GRAND PRIX FINISH GANTRY: Approaches during final stretch (progress 78% -> 100%)
    if (finishGantryRef.current) {
      const gantryTargetZ = 240 - ((progress - 0.78) / 0.22) * 255;
      finishGantryRef.current.position.z = THREE.MathUtils.lerp(
        finishGantryRef.current.position.z,
        gantryTargetZ,
        delta * 3.5
      );
    }
  });

  // High-Fidelity Coastal 3-Lane Asphalt Texture with road grain, thermo lines & cats-eyes
  const dashesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base dark weathered asphalt
    ctx.fillStyle = '#111722';
    ctx.fillRect(0, 0, 512, 1024);

    // Stochastic asphalt aggregate grain
    for (let i = 0; i < 2400; i++) {
      const gX = Math.random() * 512;
      const gY = Math.random() * 1024;
      const gR = Math.random() * 2 + 1;
      const shade = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.25)';
      ctx.fillStyle = shade;
      ctx.fillRect(gX, gY, gR, gR);
    }

    // Tire wear path sheen in lanes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.018)';
    ctx.fillRect(110, 0, 45, 1024);
    ctx.fillRect(200, 0, 45, 1024);
    ctx.fillRect(320, 0, 45, 1024);
    ctx.fillRect(410, 0, 45, 1024);

    // White dashed lane divider lines
    ctx.fillStyle = '#f8fafc';
    [160, 350].forEach((x) => {
      ctx.fillRect(x - 3, 50, 7, 260);
      ctx.fillRect(x - 3, 560, 7, 260);
    });

    // Solid outer edge boundary lines
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(22, 0, 6, 1024);
    ctx.fillRect(484, 0, 6, 1024);

    // Reflective Cats-Eyes / Road Studs
    ctx.fillStyle = '#fbbf24';
    [160, 350].forEach((x) => {
      ctx.fillRect(x - 4, 325, 9, 12);
      ctx.fillRect(x - 4, 835, 9, 12);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 14);
    return tex;
  }, []);

  return (
    <group>
      {/* 1. Coastal 3-Lane Asphalt Road Surface with Clearcoat Sheen */}
      <mesh position={[0, -0.05, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16.8, 280]} />
        <meshPhysicalMaterial 
          color="#121824" 
          roughness={0.42} 
          metalness={0.25} 
          clearcoat={0.65}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Road Markings Layer */}
      <mesh position={[0, -0.04, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16.6, 280]} />
        <meshBasicMaterial ref={dashesMatRef} map={dashesTexture} transparent opacity={0.96} />
      </mesh>

      {/* 3D Raised Beveled Racing Kerb Curbs (Left & Right Red/White) */}
      <mesh position={[-8.45, 0.04, 40]}>
        <boxGeometry args={[0.5, 0.12, 280]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>
      <mesh position={[8.45, 0.04, 40]}>
        <boxGeometry args={[0.5, 0.12, 280]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>

      {/* Left and Right Steel Guardrails with Specular Highlights */}
      <mesh position={[-8.75, 0.52, 40]}>
        <boxGeometry args={[0.22, 0.65, 280]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh position={[8.75, 0.52, 40]}>
        <boxGeometry args={[0.22, 0.65, 280]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
      </mesh>

      {/* 2. Realistic Directional Mediterranean Sunset Lighting with Warm Horizon Glow */}
      <directionalLight position={[65, 25, 120]} intensity={3.5} color="#ea580c" castShadow />
      <directionalLight position={[-40, 15, 60]} intensity={1.2} color="#f59e0b" />
      <ambientLight intensity={0.8} color="#fed7aa" />


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

      {/* 4. APPROACHING CLIFFSIDE VILLA & STONE ARCADE COLONNADE (Left Side) */}
      <group ref={cliffsGroupRef} position={[0, 0, 250]}>
        <group position={[-36, 16, 0]}>
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
      </group>

      {/* 5. APPROACHING OVERHEAD ROMAN VIADUCT AQUEDUCT (Spans overhead - car zooms underneath!) */}
      <group ref={viaductGroupRef} position={[0, 0, 260]}>
        <mesh position={[0, 14, 0]}>
          <boxGeometry args={[65, 3.5, 9]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Massive Arch Openings */}
        {[-18, 6].map((xArch, i) => (
          <group key={i} position={[xArch, 8, 0]}>
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

      {/* 6. RIVIERA GRAND PRIX FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <CoastalFinishGantry />
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

// Mediterranean Riviera Grand Prix Finish Line Gantry
const CoastalFinishGantry = () => (
  <group>
    {/* Left Stone Masonry Pillar */}
    <mesh position={[-9.5, 5.5, 0]}>
      <boxGeometry args={[1.4, 11, 1.4]} />
      <meshStandardMaterial color="#d4a373" roughness={0.8} />
    </mesh>
    {/* Right Stone Masonry Pillar */}
    <mesh position={[9.5, 5.5, 0]}>
      <boxGeometry args={[1.4, 11, 1.4]} />
      <meshStandardMaterial color="#d4a373" roughness={0.8} />
    </mesh>

    {/* Overhead Timber & Steel Arch Gantry */}
    <mesh position={[0, 10.5, 0]}>
      <boxGeometry args={[20.5, 1.8, 2.2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
    </mesh>

    {/* Checkered Finish Line Banner */}
    <mesh position={[0, 9.2, 0.2]}>
      <boxGeometry args={[17, 1.4, 0.1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>

    {/* Digital Riviera Sunset Amber Timing Display */}
    <mesh position={[0, 9.2, 0.3]}>
      <boxGeometry args={[9, 0.85, 0.05]} />
      <meshBasicMaterial color="#fb923c" />
    </mesh>

    {/* Green Finish Flashers */}
    {[-6, -2, 2, 6].map((fx, i) => (
      <group key={i} position={[fx, 8.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={3.5} distance={22} color="#22c55e" />
      </group>
    ))}

    {/* Terracotta Decorative Tile Cap */}
    <mesh position={[0, 11.5, 0]}>
      <boxGeometry args={[21, 0.35, 2.4]} />
      <meshStandardMaterial color="#9a3412" roughness={0.85} />
    </mesh>

    {/* Road Finish Line Stripe on Mediterranean Asphalt */}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16.5, 2.8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.5} />
    </mesh>
  </group>
);

