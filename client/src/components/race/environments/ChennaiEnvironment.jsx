import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RealisticRoadSurface, ChennaiStripedCurbs } from '../RealisticRoadElements.jsx';

/**
 * 05 CHENNAI — MARINA DRIVE (Kamarajar Salai)
 * Authentic real-life landmarks along Chennai's Marina Beach:
 * 1. Madras University Senate House (Robert Chisholm's 1879 Indo-Saracenic masterpiece with 4 minarets & Byzantine dome)
 * 2. Presidency College Clock Tower (Iconic 1870 Victorian-Italianate red-brick university clock tower)
 * 3. Chepauk Palace (India's first Indo-Saracenic palace with red sandstone towers & cupolas)
 * 4. Chennai Marina Lighthouse (Iconic 46m triangular tower with bold red & white bands & rotating beam)
 * 5. Triumph of Labour Statue (Famous bronze monument on the sands of Marina Beach)
 * 6. Classical Marina Beach Promenade Balustrade & Bay of Bengal Golden Sunset
 */
export const ChennaiEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const streetGroupRef = useRef();
  const oceanRef = useRef();
  const sunGlowRef = useRef();
  const lighthouseBeamRef = useRef();
  const senateHouseRef = useRef();
  const presidencyCollegeRef = useRef();
  const chepaukPalaceRef = useRef();
  const labourStatueRef = useRef();
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

    // --- REAL-WORLD CHENNAI LANDMARK PROGRESSION ---
    // 1. TRIUMPH OF LABOUR STATUE (Beach sands, progress 5% -> 40%)
    if (labourStatueRef.current) {
      const statueTargetZ = 240 - ((progress - 0.05) / 0.35) * 280;
      labourStatueRef.current.position.z = THREE.MathUtils.lerp(
        labourStatueRef.current.position.z,
        statueTargetZ,
        delta * 3.5
      );
    }

    // 2. MADRAS UNIVERSITY SENATE HOUSE (Progress 12% -> 50%)
    if (senateHouseRef.current) {
      const senateTargetZ = 250 - ((progress - 0.12) / 0.38) * 290;
      senateHouseRef.current.position.z = THREE.MathUtils.lerp(
        senateHouseRef.current.position.z,
        senateTargetZ,
        delta * 3.5
      );
    }

    // 3. PRESIDENCY COLLEGE HISTORIC CLOCK TOWER (Progress 35% -> 72%)
    if (presidencyCollegeRef.current) {
      const collegeTargetZ = 260 - ((progress - 0.32) / 0.40) * 300;
      presidencyCollegeRef.current.position.z = THREE.MathUtils.lerp(
        presidencyCollegeRef.current.position.z,
        collegeTargetZ,
        delta * 3.5
      );
    }

    // 4. CHEPAUK PALACE COMPLEX (Progress 55% -> 90%)
    if (chepaukPalaceRef.current) {
      const chepaukTargetZ = 260 - ((progress - 0.52) / 0.38) * 300;
      chepaukPalaceRef.current.position.z = THREE.MathUtils.lerp(
        chepaukPalaceRef.current.position.z,
        chepaukTargetZ,
        delta * 3.5
      );
    }

    // 5. CHENNAI MARINA LIGHTHOUSE (Coastal side, progress 48% -> 85%)
    if (lighthouseGroupRef.current) {
      const lighthouseTargetZ = 250 - ((progress - 0.48) / 0.38) * 270;
      lighthouseGroupRef.current.position.z = THREE.MathUtils.lerp(
        lighthouseGroupRef.current.position.z,
        lighthouseTargetZ,
        delta * 3.5
      );
    }

    // 6. MARINA BEACH GRAND PRIX FINISH GANTRY (Progress 78% -> 100%)
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
      {/* 1. WIDE 4-LANE COASTAL ASPHALT WITH 3D CROWN & WET SUNSET SPECULAR REFLECTION */}
      <RealisticRoadSurface
        lanes={4}
        dashedColor="#f8fafc"
        edgeColor="#f59e0b"
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

      {/* 3. RIGHT SIDE: MARINA BEACH & BAY OF BENGAL OCEAN */}
      {/* Golden Sand Beach */}
      <mesh position={[42, -1.0, 40]} rotation={[-Math.PI / 2, -0.05, 0]}>
        <planeGeometry args={[60, 300]} />
        <meshStandardMaterial color="#d4a373" roughness={0.95} />
      </mesh>

      {/* Beach Umbrellas & Colorful Seaside Sunshades */}
      {[-60, -20, 25, 65, 110].map((z, idx) => (
        <group key={idx} position={[24 + (idx % 3) * 6, -0.6, z]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
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
        <mesh position={[-45, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 320]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
        <mesh position={[-15, 0.05, 60]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[35, 190]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.42} depthWrite={false} />
        </mesh>
      </group>

      {/* 4. TRIUMPH OF LABOUR STATUE (Iconic Marina Beach Monument) */}
      <group ref={labourStatueRef} position={[26, -0.4, 240]}>
        <TriumphOfLabourMonument />
      </group>

      {/* 5. MADRAS UNIVERSITY SENATE HOUSE (Robert Chisholm 1879 Indo-Saracenic Masterpiece) */}
      <group ref={senateHouseRef} position={[-28, 0, 250]}>
        <MadrasUniversitySenateHouse />
      </group>

      {/* 6. PRESIDENCY COLLEGE HISTORIC CLOCK TOWER */}
      <group ref={presidencyCollegeRef} position={[-28, 0, 260]}>
        <PresidencyCollegeClockTower />
      </group>

      {/* 7. CHEPAUK PALACE COMPLEX (Khalsa Mahal & Humayun Mahal) */}
      <group ref={chepaukPalaceRef} position={[-29, 0, 260]}>
        <ChepaukPalaceComplex />
      </group>

      {/* 8. CHENNAI MARINA LIGHTHOUSE (Triangular Red & White Striped Maritime Tower) */}
      <group ref={lighthouseGroupRef} position={[42, 0, 250]}>
        {/* Base Foundation */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[7, 8, 7]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        {/* Tower with Red & White Horizontal Maritime Bands */}
        <mesh position={[0, 14, 0]}>
          <cylinderGeometry args={[1.8, 2.5, 14, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.7} />
        </mesh>
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[2.0, 2.3, 4, 16]} />
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

      {/* 9. MARINA BEACH GRAND PRIX FINISH GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <ChennaiFinishGantry />
      </group>

      {/* 10. LOOPING COCONUT PALM TREES & DUAL-ARM HIGHWAY STREETLAMPS */}
      <group ref={streetGroupRef} position={[0, 0, 0]}>
        {[-60, -20, 20, 60, 100, 140].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            <ChennaiPalmTree position={[-12.5, 0, 0]} scale={1.25} rotationSeed={idx} />
            <ChennaiPalmTree position={[-15.5, 0, -5]} scale={1.4} rotationSeed={idx + 2} />

            {/* Modern Curved Highway Streetlamp */}
            <group position={[-9.6, 0, 0]}>
              <mesh position={[0, 4.5, 0]}>
                <cylinderGeometry args={[0.09, 0.12, 9.0]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[1.2, 8.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.07, 0.07, 2.8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} />
              </mesh>
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

/**
 * Madras University Senate House
 * Robert Chisholm's 1879 world-renowned Indo-Saracenic masterpiece on Kamarajar Salai.
 * Features 4 massive corner minarets, central octagonal Byzantine red & yellow dome,
 * polychrome geometric brickwork, and arcaded verandahs.
 */
const MadrasUniversitySenateHouse = () => (
  <group>
    {/* Raised Sandstone Plinth */}
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[36, 2.4, 22]} />
      <meshStandardMaterial color="#64748b" roughness={0.8} />
    </mesh>

    {/* Main Senate Hall Body in Terracotta Red & Yellow Polychrome Stone */}
    <mesh position={[0, 9, 0]}>
      <boxGeometry args={[32, 13.5, 18]} />
      <meshStandardMaterial color="#991b1b" roughness={0.7} />
    </mesh>
    <mesh position={[0, 9, 0]}>
      <boxGeometry args={[32.4, 1.2, 18.4]} />
      <meshStandardMaterial color="#ca8a04" roughness={0.6} />
    </mesh>

    {/* Arcaded Verandah with Horseshoe Arches */}
    {[-12, -6, 0, 6, 12].map((x, i) => (
      <group key={i} position={[x, 5.5, 9.2]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 5.5, 0.4]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 2.8, 0.1]}>
          <cylinderGeometry args={[1.6, 1.6, 0.3, 16, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#fde047" />
        </mesh>
      </group>
    ))}

    {/* Upper Byzantine Stained-Glass Clerestory Arches */}
    {[-10, -5, 0, 5, 10].map((x, i) => (
      <mesh key={i} position={[x, 11.5, 9.2]}>
        <circleGeometry args={[1.4, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    ))}

    {/* Central Octagonal Drum Base for Byzantine Dome */}
    <mesh position={[0, 17, 0]}>
      <cylinderGeometry args={[7.5, 8.2, 3.8, 8]} />
      <meshStandardMaterial color="#854d0e" roughness={0.65} />
    </mesh>

    {/* Massive Central Polychrome Senate House Dome */}
    <mesh position={[0, 22, 0]}>
      <sphereGeometry args={[7.2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#dc2626" roughness={0.5} />
    </mesh>
    <mesh position={[0, 26, 0]}>
      <cylinderGeometry args={[0.3, 0.6, 3.2, 8]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.9} />
    </mesh>

    {/* 4 Iconic Soaring Corner Minarets with Onion Cupolas */}
    {[-16.5, 16.5].map((cx, xi) =>
      [-9.5, 9.5].map((cz, zi) => (
        <group key={`${xi}-${zi}`} position={[cx, 0, cz]}>
          {/* Minaret Shaft */}
          <mesh position={[0, 12, 0]}>
            <cylinderGeometry args={[1.5, 1.8, 24, 8]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
          </mesh>
          {/* White Stone Balcony Gallery */}
          <mesh position={[0, 24, 0]}>
            <cylinderGeometry args={[2.2, 1.8, 1.2, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Domed Cupola */}
          <mesh position={[0, 26.5, 0]}>
            <sphereGeometry args={[1.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#fef08a" metalness={0.7} />
          </mesh>
          <mesh position={[0, 28.5, 0]}>
            <cylinderGeometry args={[0.08, 0.15, 1.8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
        </group>
      ))
    )}

    {/* Warm Evening Architectural Illumination */}
    <pointLight position={[0, 4, 12]} intensity={4.5} distance={35} color="#f59e0b" />
    <pointLight position={[0, 22, 10]} intensity={4.0} distance={30} color="#fbbf24" />
  </group>
);

/**
 * Presidency College Historic Clock Tower
 * Iconic 1870 Victorian-Italianate red-brick university building on Kamarajar Salai.
 */
const PresidencyCollegeClockTower = () => (
  <group>
    {/* Foundation Plinth */}
    <mesh position={[0, 1.0, 0]}>
      <boxGeometry args={[30, 2.0, 16]} />
      <meshStandardMaterial color="#475569" roughness={0.8} />
    </mesh>

    {/* Main Red-Brick Building Wings */}
    <mesh position={[0, 8.5, 0]}>
      <boxGeometry args={[28, 13.0, 14]} />
      <meshStandardMaterial color="#991b1b" roughness={0.75} />
    </mesh>

    {/* White Stone Quoins & Decorative Cornice Bands */}
    {[-1, 4, 9, 14.8].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <boxGeometry args={[28.6, 0.45, 14.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
    ))}

    {/* Upper Windows with Warm Glow */}
    {[-11, -7, 7, 11].map((x, i) => (
      <mesh key={i} position={[x, 10.5, 7.1]}>
        <boxGeometry args={[2.0, 3.4, 0.2]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
    ))}

    {/* Central High Clock Tower */}
    <group position={[0, 15, 0]}>
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[8.5, 10, 8.5]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 11.5, 0]}>
        <boxGeometry args={[7.2, 4.5, 7.2]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>

      {/* Clock Faces */}
      <group position={[0, 15.5, 0]}>
        <mesh>
          <boxGeometry args={[6.8, 4.8, 6.8]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
        <mesh position={[0, 0, 3.45]}>
          <circleGeometry args={[1.75, 32]} />
          <meshBasicMaterial color="#fffbeb" />
        </mesh>
        <mesh position={[0, 0, 3.48]}>
          <ringGeometry args={[1.65, 1.85, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <pointLight position={[0, 0, 4.5]} intensity={2.6} distance={18} color="#fef08a" />
      </group>

      {/* Gothic Pyramid Steeple Roof */}
      <mesh position={[0, 22.5, 0]}>
        <coneGeometry args={[4.2, 7.0, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshStandardMaterial color="#450a0a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 27.2, 0]}>
        <cylinderGeometry args={[0.08, 0.22, 2.8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} />
      </mesh>
    </group>
  </group>
);

/**
 * Chepauk Palace Complex (Humayun Mahal & Khalsa Mahal)
 * India's first Indo-Saracenic palace with red sandstone towers and cupolas.
 */
const ChepaukPalaceComplex = () => (
  <group>
    <mesh position={[0, 7.5, 0]}>
      <boxGeometry args={[34, 15, 18]} />
      <meshStandardMaterial color="#881c1c" roughness={0.78} />
    </mesh>
    {/* Cusped Islamic Arches Colonnade */}
    {[-12, -6, 0, 6, 12].map((x, i) => (
      <mesh key={i} position={[x, 5.5, 9.1]}>
        <boxGeometry args={[2.8, 4.5, 0.3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    ))}
    {/* Rooftop Onion Domes */}
    {[-14, 0, 14].map((x, i) => (
      <group key={i} position={[x, 16.5, 0]}>
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 3.2, 12]} />
          <meshStandardMaterial color="#991b1b" />
        </mesh>
        <mesh position={[0, 4.5, 0]}>
          <sphereGeometry args={[2.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#fef08a" metalness={0.7} />
        </mesh>
      </group>
    ))}
    <pointLight position={[0, 3, 11]} intensity={3.5} distance={28} color="#f59e0b" />
  </group>
);

/**
 * Triumph of Labour Monument (Uzhaippalar Silai)
 * World-famous bronze sculpture on the sands of Marina Beach near the shoreline.
 */
const TriumphOfLabourMonument = () => (
  <group>
    {/* Black Polished Granite Pedestal */}
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[6.5, 2.4, 4.2]} />
      <meshStandardMaterial color="#020617" roughness={0.15} metalness={0.8} />
    </mesh>
    {/* Massive Stone Boulder being moved */}
    <mesh position={[0.6, 3.4, 0]}>
      <dodecahedronGeometry args={[1.8, 1]} />
      <meshStandardMaterial color="#475569" roughness={0.92} />
    </mesh>
    {/* 4 Sculpted Bronze Labourers straining with wooden levers */}
    {[-1.8, -0.6, 1.6, 2.6].map((bx, i) => (
      <group key={i} position={[bx, 2.6, (i % 2 === 0 ? 0.6 : -0.6)]}>
        <mesh position={[0, 0.7, 0]} rotation={[0, 0, (i < 2 ? 0.35 : -0.35)]}>
          <cylinderGeometry args={[0.22, 0.28, 1.4, 8]} />
          <meshStandardMaterial color="#78350f" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color="#78350f" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
    ))}
    {/* Monument Night Floodlight */}
    <pointLight position={[0, 1.5, 3.5]} intensity={3.0} distance={16} color="#fbbf24" />
  </group>
);

/**
 * Realistic Coastal Coconut Palm Tree with Swaying Fronds
 */
const ChennaiPalmTree = ({ position, scale = 1, rotationSeed = 0 }) => (
  <group position={position} scale={[scale, scale, scale]} rotation={[0, rotationSeed * 0.8, 0]}>
    <mesh position={[0.2, 2.5, 0]} rotation={[0, 0, -0.08]}>
      <cylinderGeometry args={[0.18, 0.26, 5.0, 8]} />
      <meshStandardMaterial color="#573a24" roughness={0.9} />
    </mesh>
    <mesh position={[0.7, 6.8, 0]} rotation={[0, 0, -0.15]}>
      <cylinderGeometry args={[0.14, 0.18, 4.2, 8]} />
      <meshStandardMaterial color="#6b4423" roughness={0.9} />
    </mesh>
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
    </group>
  </group>
);

/**
 * Marina Beach Grand Prix Finish Line Gantry
 */
const ChennaiFinishGantry = () => (
  <group>
    <mesh position={[-10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 10.5, 0]}>
      <boxGeometry args={[22.5, 1.6, 2.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
    </mesh>
    <mesh position={[0, 9.2, 0.2]}>
      <boxGeometry args={[19, 1.4, 0.1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} />
    </mesh>
    <mesh position={[0, 9.2, 0.3]}>
      <boxGeometry args={[10, 0.9, 0.05]} />
      <meshBasicMaterial color="#fb923c" />
    </mesh>
    {[-8, -4, 0, 4, 8].map((fx, i) => (
      <group key={i} position={[fx, 8.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0, -0.5, 0]} intensity={3.5} distance={22} color="#22c55e" />
      </group>
    ))}
    <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[18.5, 2.8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.6} />
    </mesh>
  </group>
);
