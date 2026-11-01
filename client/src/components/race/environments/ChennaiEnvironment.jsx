import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RealisticRoadSurface, ChennaiStripedCurbs } from '../RealisticRoadElements.jsx';

// 05 CHENNAI — MARINA DRIVE CIRCUIT (Reference Left Panel)
// Coastal highway, Bay of Bengal sunset, historic Indo-Saracenic red-brick clock tower,
// Marina beach, swaying palm trees, stone balustrade, and warm golden reflections.
export const ChennaiEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const streetGroupRef = useRef();
  const oceanRef = useRef();
  const sunGlowRef = useRef();
  const lighthouseBeamRef = useRef();
  const heritageGroupRef = useRef();
  const lighthouseGroupRef = useRef();
  const finishGantryRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Moving roadside palm trees & streetlamps loop
    if (streetGroupRef.current) {
      streetGroupRef.current.position.z = (streetGroupRef.current.position.z + moveStep * 0.7) % 80;
    }

    // Gentle Bay of Bengal wave pulsation
    if (oceanRef.current) {
      oceanRef.current.position.y = -2.1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.08;
    }

    // Sunset sun corona pulse
    if (sunGlowRef.current) {
      sunGlowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.05);
    }

    // Rotating Marina Lighthouse beam sweep
    if (lighthouseBeamRef.current) {
      lighthouseBeamRef.current.rotation.y = state.clock.elapsedTime * 1.2;
    }

    // --- LANDMARK PROGRESSION (Marina coastal landscape takes the driver!) ---
    // 1. INDO-SARACENIC CLOCK TOWER COMPLEX: Approaches and looms on the left (Z=260 -> -40) during progress 20% -> 60%
    if (heritageGroupRef.current) {
      const heritageTargetZ = 260 - ((progress - 0.18) / 0.42) * 300;
      heritageGroupRef.current.position.z = THREE.MathUtils.lerp(
        heritageGroupRef.current.position.z,
        heritageTargetZ,
        delta * 3.5
      );
    }

    // 2. CHENNAI MARINA LIGHTHOUSE: Approaches on the coastal side (Z=250 -> -20) during progress 48% -> 85%
    if (lighthouseGroupRef.current) {
      const lighthouseTargetZ = 250 - ((progress - 0.48) / 0.38) * 270;
      lighthouseGroupRef.current.position.z = THREE.MathUtils.lerp(
        lighthouseGroupRef.current.position.z,
        lighthouseTargetZ,
        delta * 3.5
      );
    }

    // 3. MARINA BEACH GRAND PRIX FINISH GANTRY: Approaches during final stretch (progress 78% -> 100%)
    if (finishGantryRef.current) {
      const gantryTargetZ = 240 - ((progress - 0.78) / 0.22) * 255;
      finishGantryRef.current.position.z = THREE.MathUtils.lerp(
        finishGantryRef.current.position.z,
        gantryTargetZ,
        delta * 3.5
      );
    }
  });

  return (
    <group>
      {/* 1. WIDE 4-LANE COASTAL ASPHALT WITH WET SUNSET SPECULAR REFLECTION */}
      <RealisticRoadSurface
        lanes={4}
        dashedColor="#f8fafc"
        edgeColor="#fbbf24"
        isWet={true}
        roadWidth={18.5}
        length={320}
        speedKmh={speedKmh}
      />

      {/* Authentic Yellow and Black Striped Highway Curbs (Reference Image 5) */}
      <ChennaiStripedCurbs length={300} xLeft={-9.4} xRight={9.4} />

      {/* Promenade Sand & Pavement Verges */}
      <mesh position={[-25, -0.12, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 340]} />
        <meshStandardMaterial color="#334155" roughness={0.88} />
      </mesh>
      <mesh position={[25, -0.12, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 340]} />
        <meshStandardMaterial color="#d4a373" roughness={0.92} />
      </mesh>

      {/* Left Roadside: Paved Footpath & City Boundary */}
      <mesh position={[-11.4, 0.12, 40]} receiveShadow>
        <boxGeometry args={[3.6, 0.24, 280]} />
        <meshStandardMaterial color="#475569" roughness={0.85} />
      </mesh>
      <mesh position={[-13.25, 0.45, 40]}>
        <boxGeometry args={[0.2, 0.65, 280]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Right Roadside: Iconic Marina Beach Promenade Classical Stone Balustrade */}
      <group position={[9.7, 0, 40]}>
        {/* Raised Promenade Pavement */}
        <mesh position={[1.8, 0.12, 0]} receiveShadow>
          <boxGeometry args={[3.4, 0.24, 280]} />
          <meshStandardMaterial color="#d4a373" roughness={0.88} />
        </mesh>
        {/* Balustrade Base & Coping Railing */}
        <mesh position={[3.4, 0.35, 0]}>
          <boxGeometry args={[0.35, 0.15, 280]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
        </mesh>
        <mesh position={[3.4, 0.95, 0]}>
          <boxGeometry args={[0.4, 0.12, 280]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
        </mesh>
        {/* Classical Stone Balusters along the beach */}
        {Array.from({ length: 45 }).map((_, i) => (
          <mesh key={i} position={[3.4, 0.65, -120 + i * 6]}>
            <cylinderGeometry args={[0.08, 0.1, 0.45, 8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 2. GLOWING GOLDEN SUNSET SUN ON THE BAY OF BENGAL HORIZON */}
      <group position={[70, 14, 185]}>
        {/* Sun Disk */}
        <mesh>
          <sphereGeometry args={[11, 32, 32]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        {/* Radiant Sunset Corona Halo */}
        <mesh ref={sunGlowRef}>
          <sphereGeometry args={[26, 32, 32]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.38} depthWrite={false} />
        </mesh>
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[35, 32, 32]} />
          <meshBasicMaterial color="#ea580c" transparent opacity={0.18} depthWrite={false} />
        </mesh>
        {/* Powerful Golden Sunset Sun Light */}
        <pointLight intensity={7.0} distance={300} color="#fb923c" />
      </group>

      {/* Layered Sunset Clouds */}
      <group position={[30, 26, 170]}>
        <mesh position={[-20, 4, 0]}>
          <boxGeometry args={[75, 7, 12]} />
          <meshStandardMaterial color="#ea580c" transparent opacity={0.4} roughness={1} />
        </mesh>
        <mesh position={[25, 8, -10]}>
          <boxGeometry args={[65, 6, 10]} />
          <meshStandardMaterial color="#f97316" transparent opacity={0.35} roughness={1} />
        </mesh>
        <mesh position={[-50, 12, 10]}>
          <boxGeometry args={[55, 5, 8]} />
          <meshStandardMaterial color="#c2410c" transparent opacity={0.3} roughness={1} />
        </mesh>
      </group>

      {/* 3. RIGHT SIDE: MARINA BEACH & BAY OF BENGAL OCEAN */}
      {/* Golden Sand Beach */}
      <mesh position={[42, -1.0, 40]} rotation={[-Math.PI / 2, -0.05, 0]}>
        <planeGeometry args={[60, 300]} />
        <meshStandardMaterial color="#d4a373" roughness={0.95} />
      </mesh>

      {/* Beach Umbrellas & Colorful Seaside Sunshades */}
      {[-60, -20, 25, 65, 110].map((z, idx) => (
        <group key={idx} position={[24 + (idx % 3) * 6, -0.6, z]}>
          {/* Umbrella Pole */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Canopy Cone */}
          <mesh position={[0, 2.2, 0]} rotation={[0, idx * 0.7, 0]}>
            <coneGeometry args={[1.8, 0.9, 8]} />
            <meshStandardMaterial color={['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#ec4899'][idx % 5]} />
          </mesh>
        </group>
      ))}

      {/* Bay of Bengal Ocean Surface */}
      <group ref={oceanRef} position={[85, -2.1, 40]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 320]} />
          <meshStandardMaterial color="#0369a1" roughness={0.06} metalness={0.88} />
        </mesh>
        {/* Surf Foam Line along beach */}
        <mesh position={[-45, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 320]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
        {/* Specular Sunset Reflection Ribbon on Ocean */}
        <mesh position={[-15, 0.05, 60]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[35, 190]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.42} depthWrite={false} />
        </mesh>

        {/* Distant Cargo Ships / Catamarans on Horizon */}
        <group position={[40, 1.5, 80]}>
          <mesh>
            <boxGeometry args={[12, 2.2, 3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[2, 2, 0]}>
            <boxGeometry args={[3.5, 2.0, 2]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      </group>

      {/* 3. APPROACHING CHENNAI MARINA LIGHTHOUSE (Coastal landmark with revolving beam) */}
      <group ref={lighthouseGroupRef} position={[42, 0, 250]}>
        {/* Lighthouse Base */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[6, 8, 6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        {/* Tower with Red & White Horizontal Maritime Bands */}
        <mesh position={[0, 14, 0]}>
          <cylinderGeometry args={[1.8, 2.4, 14, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.7} />
        </mesh>
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[2.0, 2.2, 4, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[0, 17, 0]}>
          <cylinderGeometry args={[1.6, 1.8, 3, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        {/* Observation Gallery */}
        <mesh position={[0, 21.5, 0]}>
          <cylinderGeometry args={[2.6, 2.4, 0.6, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Lantern Room & Glass Dome */}
        <mesh position={[0, 23.5, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 2.4, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        {/* Revolving Golden Searchlight Beam */}
        <group ref={lighthouseBeamRef} position={[0, 23.5, 0]}>
          <mesh position={[0, 0, 30]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[4.5, 60, 16]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.25} depthWrite={false} />
          </mesh>
          <pointLight intensity={3.5} distance={50} color="#fef08a" />
        </group>
      </group>

      {/* 4. APPROACHING HISTORIC INDO-SARACENIC RED-BRICK CLOCK TOWER COMPLEX */}
      <group ref={heritageGroupRef} position={[0, 0, 260]}>
        <IndoSaracenicClockTower position={[-26, 0, 0]} />
        <ColonialHeritageHall position={[-30, 0, 50]} />
      </group>

      {/* 5. MARINA BEACH GRAND PRIX FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <ChennaiFinishGantry />
      </group>

      {/* Distant Urban Chennai Skyline Silhouettes */}
      <group position={[-50, 0, 160]}>
        {[-30, -10, 15, 35, 55].map((x, i) => (
          <mesh key={i} position={[x, 14 + (i % 3) * 6, 0]}>
            <boxGeometry args={[12, 28 + (i % 3) * 12, 10]} />
            <meshStandardMaterial color="#1e2433" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 5. LOOPING PALM TREES & DUAL-ARM HIGHWAY STREETLAMPS */}
      <group ref={streetGroupRef} position={[0, 0, 0]}>
        {[-60, -20, 20, 60, 100, 140].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            {/* Swaying Coastal Coconut Palm Trees on Left Median & Sidewalk */}
            <ChennaiPalmTree position={[-12.5, 0, 0]} scale={1.25} rotationSeed={idx} />
            <ChennaiPalmTree position={[-15.5, 0, -5]} scale={1.4} rotationSeed={idx + 2} />

            {/* Modern Curved Dual-Arm Highway Streetlamp */}
            <group position={[-9.6, 0, 0]}>
              {/* Lamppost Mast */}
              <mesh position={[0, 4.5, 0]}>
                <cylinderGeometry args={[0.09, 0.12, 9.0]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
              </mesh>
              {/* Curved Arm over Road */}
              <mesh position={[1.2, 8.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.07, 0.07, 2.8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} />
              </mesh>
              {/* Luminaire Fixture & Pool of Golden Light */}
              <mesh position={[2.2, 8.2, 0]}>
                <boxGeometry args={[0.7, 0.15, 0.35]} />
                <meshBasicMaterial color="#fef08a" />
              </mesh>
              <pointLight position={[2.2, 7.8, 0]} intensity={2.8} distance={26} color="#fbbf24" />
            </group>
          </group>
        ))}
      </group>

    </group>
  );
};

// Historic Indo-Saracenic Victorian Red-Brick Clock Tower (Inspired by Chennai Central / Ripon Building)
const IndoSaracenicClockTower = ({ position }) => (
  <group position={position}>
    {/* Foundation Plinth */}
    <mesh position={[0, 1.0, 0]}>
      <boxGeometry args={[28, 2.0, 16]} />
      <meshStandardMaterial color="#475569" roughness={0.8} />
    </mesh>

    {/* Main Terracotta Red Brick Building Body */}
    <mesh position={[0, 8.5, 0]}>
      <boxGeometry args={[26, 13.0, 14]} />
      <meshStandardMaterial color="#881c1c" roughness={0.75} />
    </mesh>

    {/* White Stone Decorative Cornice Bands & Trims */}
    {[-1, 4, 9, 14.8].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <boxGeometry args={[26.6, 0.45, 14.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
    ))}

    {/* Ground-Floor Arcaded Colonnade Arches along facade */}
    {[-9, -5, -1, 3, 7].map((x, i) => (
      <group key={i} position={[x, 4.5, 7.1]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 4.2, 0.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Arch Frame */}
        <mesh position={[0, 2.2, 0.05]}>
          <cylinderGeometry args={[1.1, 1.1, 0.2, 12, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
    ))}

    {/* Upper Colonial Arched Windows with Warm Interior Glow */}
    {[-9, -5, 5, 9].map((x, i) => (
      <group key={i} position={[x, 10.5, 7.1]}>
        <mesh>
          <boxGeometry args={[1.8, 3.2, 0.2]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[0, 1.8, 0.05]}>
          <cylinderGeometry args={[0.9, 0.9, 0.2, 12, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
    ))}

    {/* CENTRAL CLOCK TOWER (Soaring Multi-Tier Indo-Saracenic Tower) */}
    <group position={[0, 15, 0]}>
      {/* Lower Tower Tier */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[8.5, 10, 8.5]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
      </mesh>
      {/* Middle Belfry Stage with Arches */}
      <mesh position={[0, 11.5, 0]}>
        <boxGeometry args={[7.2, 4.5, 7.2]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      {/* White Quoins on Tower Corners */}
      {[-4.1, 4.1].map((cx, xi) =>
        [-4.1, 4.1].map((cz, zi) => (
          <mesh key={`${xi}-${zi}`} position={[cx, 5, cz]}>
            <boxGeometry args={[0.6, 10, 0.6]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
        ))
      )}

      {/* CLOCK STAGE (4-Sided Illuminated Clock Faces matching Reference) */}
      <group position={[0, 15.5, 0]}>
        <mesh>
          <boxGeometry args={[6.8, 4.8, 6.8]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
        {/* Front Clock Face looking at road */}
        <mesh position={[0, 0, 3.45]} rotation={[0, 0, 0]}>
          <circleGeometry args={[1.65, 32]} />
          <meshBasicMaterial color="#fffbeb" />
        </mesh>
        {/* Clock Hands & Rim */}
        <mesh position={[0, 0, 3.48]}>
          <ringGeometry args={[1.55, 1.75, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 3.5]}>
          <boxGeometry args={[0.12, 0.95, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.3, 0, 3.5]} rotation={[0, 0, -Math.PI / 3]}>
          <boxGeometry args={[0.1, 0.7, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Warm Ambient Clock Illumination */}
        <pointLight position={[0, 0, 4.5]} intensity={2.4} distance={16} color="#fef08a" />
      </group>

      {/* Gothic / Indo-Saracenic Pyramid Steeple Roof with Cupolas */}
      <group position={[0, 20.5, 0]}>
        <mesh position={[0, 3, 0]}>
          <coneGeometry args={[4.2, 6.5, 4]} rotation={[0, Math.PI / 4, 0]} />
          <meshStandardMaterial color="#450a0a" roughness={0.6} />
        </mesh>
        {/* Golden Gilded Spire Finial */}
        <mesh position={[0, 7.2, 0]}>
          <cylinderGeometry args={[0.08, 0.22, 2.4, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>

    {/* Corner Domed Chhatri Turrets on Left & Right Wings */}
    {[-12.5, 12.5].map((tx, idx) => (
      <group key={idx} position={[tx, 15, 6]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 3, 12]} />
          <meshStandardMaterial color="#991b1b" />
        </mesh>
        {/* Miniature Dome */}
        <mesh position={[0, 3.8, 0]}>
          <sphereGeometry args={[1.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.4} />
        </mesh>
        {/* Finial */}
        <mesh position={[0, 5.8, 0]}>
          <cylinderGeometry args={[0.06, 0.1, 1.2]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} />
        </mesh>
      </group>
    ))}

    {/* Architectural Uplighting Spotlights Washing the Facade */}
    <pointLight position={[-8, 1, 9]} intensity={3.5} distance={28} color="#f59e0b" />
    <pointLight position={[8, 1, 9]} intensity={3.5} distance={28} color="#f59e0b" />
    <pointLight position={[0, 1, 9]} intensity={4.0} distance={30} color="#fef08a" />
  </group>
);

// Secondary Colonial Indo-Saracenic Hall / Heritage Architecture down the avenue
const ColonialHeritageHall = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 7, 0]}>
      <boxGeometry args={[32, 14, 16]} />
      <meshStandardMaterial color="#831843" roughness={0.8} />
    </mesh>
    {/* White Colonnade */}
    <mesh position={[0, 14.5, 0]}>
      <boxGeometry args={[32.5, 0.8, 16.5]} />
      <meshStandardMaterial color="#f8fafc" />
    </mesh>
    {/* Pitched Terracotta Tile Roof */}
    <mesh position={[0, 17.5, 0]} rotation={[0, 0, 0]}>
      <coneGeometry args={[14, 5.5, 4]} rotation={[0, Math.PI / 4, 0]} />
      <meshStandardMaterial color="#7f1d1d" roughness={0.9} />
    </mesh>
    {/* Arched Windows */}
    {[-10, -5, 0, 5, 10].map((wx, i) => (
      <mesh key={i} position={[wx, 7, 8.1]}>
        <boxGeometry args={[1.8, 3.2, 0.2]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
    ))}
    <pointLight position={[0, 2, 10]} intensity={3.0} distance={25} color="#fb923c" />
  </group>
);

// Realistic Coastal Coconut Palm Tree with Swaying Fronds
const ChennaiPalmTree = ({ position, scale = 1, rotationSeed = 0 }) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[0, rotationSeed * 0.8, 0]}>
    {/* Gently Curved Ringed Trunk */}
    <mesh position={[0.2, 2.5, 0]} rotation={[0, 0, -0.08]}>
      <cylinderGeometry args={[0.18, 0.26, 5.0, 8]} />
      <meshStandardMaterial color="#573a24" roughness={0.9} />
    </mesh>
    <mesh position={[0.7, 6.8, 0]} rotation={[0, 0, -0.15]}>
      <cylinderGeometry args={[0.14, 0.18, 4.2, 8]} />
      <meshStandardMaterial color="#6b4423" roughness={0.9} />
    </mesh>

    {/* Crown of Tropical Palm Fronds */}
    <group position={[1.1, 8.8, 0]}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <group key={i} rotation={[0, rad, 0]}>
            <mesh position={[1.4, -0.4, 0]} rotation={[0, 0, -0.55]}>
              <boxGeometry args={[2.8, 0.04, 0.55]} />
              <meshStandardMaterial color="#15803d" roughness={0.75} />
            </mesh>
            <mesh position={[2.6, -1.2, 0]} rotation={[0, 0, -0.9]}>
              <boxGeometry args={[1.8, 0.04, 0.45]} />
              <meshStandardMaterial color="#166534" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
      {/* Golden Sunset Edge Rim Highlight on Palm Crown */}
      <pointLight position={[0.5, 0.5, 0.5]} intensity={0.8} distance={8} color="#fbbf24" />
    </group>
  </group>
);

// Marina Beach Grand Prix Finish Line Gantry
const ChennaiFinishGantry = () => (
  <group>
    {/* Left Tropical Wood & Steel Pillar */}
    <mesh position={[-10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Right Tropical Wood & Steel Pillar */}
    <mesh position={[10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
    </mesh>

    {/* Overhead Grand Prix Bridge Truss */}
    <mesh position={[0, 10.5, 0]}>
      <boxGeometry args={[22.5, 1.6, 2.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
    </mesh>

    {/* Checkered Finish Line Banner */}
    <mesh position={[0, 9.2, 0.2]}>
      <boxGeometry args={[19, 1.4, 0.1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>

    {/* Digital Sunset Amber Timing Display */}
    <mesh position={[0, 9.2, 0.3]}>
      <boxGeometry args={[10, 0.9, 0.05]} />
      <meshBasicMaterial color="#fb923c" />
    </mesh>

    {/* Green Finish Flashers */}
    {[-8, -4, 0, 4, 8].map((fx, i) => (
      <group key={i} position={[fx, 8.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={3.5} distance={22} color="#22c55e" />
      </group>
    ))}

    {/* Golden Rim Accent on Truss Edge */}
    <mesh position={[0, 11.4, 0]}>
      <boxGeometry args={[22.8, 0.15, 0.15]} />
      <meshBasicMaterial color="#fef08a" />
    </mesh>

    {/* Road Finish Line Stripe on Wet Asphalt */}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[18.5, 2.8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.6} />
    </mesh>
  </group>
);

