import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RealisticRoadSurface, DelhiSandstoneCurbs } from '../RealisticRoadElements.jsx';

/**
 * 06 NEW DELHI — RAJPATH CIRCUIT (Kartavya Path & Central Vista)
 * Authentic real-life landmarks along New Delhi's Ceremonial Boulevard:
 * 1. India Gate (42m high triumphal sandstone arch spanning the 4-lane avenue)
 * 2. Amar Jawan Jyoti (Eternal flame & black marble cenotaph)
 * 3. The Grand 73-foot Sandstone Canopy (Chhatri)
 * 4. National War Memorial (Concentric circular courtyards & 15.5m granite obelisk)
 * 5. North Block & South Block (Herbert Baker's sandstone ministries with chhatris & colonnades)
 * 6. Rashtrapati Bhavan (Presidential Palace on Raisina Hill with Sanchi copper dome)
 * 7. Reflecting water canals with illuminated tiered water fountains
 * 8. Victorian cast-iron lampposts with Indian Tricolor ceremonial banners
 */
export const DelhiEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const avenueGroupRef = useRef();
  const fountainsGroupRef = useRef();
  const indiaGateRef = useRef();
  const canopyRef = useRef();
  const warMemorialRef = useRef();
  const secretariatRef = useRef();
  const raisinaHillRef = useRef();
  const finishGantryRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Moving ceremonial roadside trees, lamps & tricolor banners loop
    if (avenueGroupRef.current) {
      avenueGroupRef.current.position.z = (avenueGroupRef.current.position.z + moveStep * 0.7) % 80;
    }

    // Looping illuminated water fountains
    if (fountainsGroupRef.current) {
      fountainsGroupRef.current.position.z = (fountainsGroupRef.current.position.z + moveStep * 0.7) % 120;
    }

    // --- REAL-WORLD DELHI LANDMARK PROGRESSION ---
    // 1. NATIONAL WAR MEMORIAL (Sector 1, progress 8% -> 42%)
    if (warMemorialRef.current) {
      const memorialTargetZ = 240 - ((progress - 0.08) / 0.34) * 280;
      warMemorialRef.current.position.z = THREE.MathUtils.lerp(
        warMemorialRef.current.position.z,
        memorialTargetZ,
        delta * 3.5
      );
    }

    // 2. TOWERING INDIA GATE ARCH & AMAR JAWAN JYOTI (Car drives directly under it at progress 18% -> 58%)
    if (indiaGateRef.current) {
      const gateTargetZ = 260 - (progress / 0.52) * 320;
      indiaGateRef.current.position.z = THREE.MathUtils.lerp(
        indiaGateRef.current.position.z,
        gateTargetZ,
        delta * 3.5
      );
    }

    // 3. THE GRAND CANOPY (CHHATRI) (progress 28% -> 68%)
    if (canopyRef.current) {
      const canopyTargetZ = 270 - ((progress - 0.25) / 0.40) * 300;
      canopyRef.current.position.z = THREE.MathUtils.lerp(
        canopyRef.current.position.z,
        canopyTargetZ,
        delta * 3.5
      );
    }

    // 4. NORTH BLOCK & SOUTH BLOCK (SECRETARIAT MINISTRIES) (progress 45% -> 85%)
    if (secretariatRef.current) {
      const secTargetZ = 270 - ((progress - 0.42) / 0.40) * 290;
      secretariatRef.current.position.z = THREE.MathUtils.lerp(
        secretariatRef.current.position.z,
        secTargetZ,
        delta * 3.5
      );
    }

    // 5. RAISINA HILL & RASHTRAPATI BHAVAN (Presidential Palace, progress 55% -> 95%)
    if (raisinaHillRef.current) {
      const hillTargetZ = 280 - ((progress - 0.50) / 0.45) * 260;
      raisinaHillRef.current.position.z = THREE.MathUtils.lerp(
        raisinaHillRef.current.position.z,
        hillTargetZ,
        delta * 3.5
      );
    }

    // 6. GRAND PRIX FINISH LINE GANTRY (Final Stretch, progress 78% -> 100%)
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
      {/* 1. CEREMONIAL 4-LANE RAJPATH ASPHALT WITH 3D CROWN & WET TWILIGHT SPECULAR REFLECTIONS */}
      <RealisticRoadSurface
        lanes={4}
        dashedColor="#f8fafc"
        edgeColor="#fbbf24"
        isWet={true}
        roadWidth={18.5}
        length={320}
        speedKmh={speedKmh}
      />

      {/* Authentic Dholpur Red Sandstone Curbs (Reference Image 6) */}
      <DelhiSandstoneCurbs length={300} xLeft={-9.4} xRight={9.4} />

      {/* Manicured Lawns of Kartavya Path flanking both sides */}
      <mesh position={[-25, -0.02, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 280]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} />
      </mesh>
      <mesh position={[25, -0.02, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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

      {/* 2. NATIONAL WAR MEMORIAL (Rashtriya Samar Smarak) */}
      <group ref={warMemorialRef} position={[28, 0, 240]}>
        <NationalWarMemorial />
      </group>

      {/* 3. MONUMENTAL INDIA GATE ARCHWAY & AMAR JAWAN JYOTI */}
      <group ref={indiaGateRef} position={[0, 0, 260]}>
        <IndiaGateMonument />
      </group>

      {/* 4. THE GRAND CANOPY (CHHATRI) BEHIND INDIA GATE */}
      <group ref={canopyRef} position={[0, 0, 295]}>
        <IndiaGateCanopyChhatri />
      </group>

      {/* 5. NORTH BLOCK & SOUTH BLOCK (SECRETARIAT MINISTRIES) */}
      <group ref={secretariatRef} position={[0, 0, 270]}>
        <NorthSouthBlockComplex />
      </group>

      {/* 6. RASHTRAPATI BHAVAN (PRESIDENTIAL PALACE ON RAISINA HILL) */}
      <group ref={raisinaHillRef} position={[0, 0, 280]}>
        <RashtrapatiBhavanDome />
      </group>

      {/* 7. GRAND PRIX FINISH LINE GANTRY */}
      <group ref={finishGantryRef} position={[0, 0, 240]}>
        <DelhiFinishGantry />
      </group>

      {/* 8. LOOPING WATER CANAL FOUNTAINS */}
      <group ref={fountainsGroupRef} position={[0, 0, 0]}>
        {[-80, -20, 40, 100].map((fz, idx) => (
          <group key={idx} position={[0, 0, fz]}>
            <RajpathFountain position={[-15, 0, 0]} />
            <RajpathFountain position={[15, 0, 0]} />
          </group>
        ))}
      </group>

      {/* 9. LOOPING CEREMONIAL TREES, TRICOLOR BANNERS & CAST-IRON LAMPPOSTS */}
      <group ref={avenueGroupRef} position={[0, 0, 0]}>
        {[-60, -20, 20, 60, 100, 140].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            <RajpathLamppost position={[-9.8, 0, 0]} facing={1} />
            <RajpathLamppost position={[9.8, 0, 0]} facing={-1} />

            {/* Manicured Jamun / Neem Trees of Kartavya Path */}
            <group position={[-20, 0, 0]}>
              <mesh position={[0, 3.5, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.45, 7, 8]} />
                <meshStandardMaterial color="#422006" roughness={0.9} />
              </mesh>
              <mesh position={[0, 7.8, 0]} castShadow>
                <sphereGeometry args={[4.2, 12, 12]} />
                <meshStandardMaterial color="#166534" roughness={0.8} />
              </mesh>
            </group>
            <group position={[20, 0, 0]}>
              <mesh position={[0, 3.5, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.45, 7, 8]} />
                <meshStandardMaterial color="#422006" roughness={0.9} />
              </mesh>
              <mesh position={[0, 7.8, 0]} castShadow>
                <sphereGeometry args={[4.2, 12, 12]} />
                <meshStandardMaterial color="#166534" roughness={0.8} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
};

/**
 * Monumental India Gate Archway
 * Accurately proportioned 42m triumphal sandstone arch designed by Sir Edwin Lutyens.
 */
const IndiaGateMonument = () => (
  <group>
    {/* Stepped Bharatpur Sandstone Base Plinths */}
    <mesh position={[-15, 1.0, 0]}>
      <boxGeometry args={[11, 2.0, 18]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>
    <mesh position={[15, 1.0, 0]}>
      <boxGeometry args={[11, 2.0, 18]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>

    {/* Main Pylons (Left & Right Massive Sandstone Piers Flanking Roadway) */}
    <mesh position={[-15, 13.5, 0]}>
      <boxGeometry args={[9.5, 20, 15.5]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>
    <mesh position={[15, 13.5, 0]}>
      <boxGeometry args={[9.5, 20, 15.5]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>

    {/* Central Semicircular Barrel Arch Vault Spanning the Avenue */}
    <group position={[0, 16.5, 0]}>
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[10.3, 10.3, 15.6, 24, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
    </group>

    {/* Upper Arch Spandrel & Entablature */}
    <mesh position={[0, 25.5, 0]}>
      <boxGeometry args={[40, 4.5, 16]} />
      <meshStandardMaterial color="#d97706" roughness={0.65} />
    </mesh>

    {/* Inscription Frieze Band */}
    <mesh position={[0, 28.5, 0]}>
      <boxGeometry args={[38, 2.2, 15]} />
      <meshStandardMaterial color="#b45309" roughness={0.7} />
    </mesh>
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

    {/* Top Ceremonial Urn / Chhatri Bowl */}
    <mesh position={[0, 36.0, 0]}>
      <cylinderGeometry args={[3.5, 2.5, 1.8, 16]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>

    {/* AMAR JAWAN JYOTI: Eternal Golden Flame Cenotaph under Arch */}
    <group position={[0, 0.6, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.4, 0.8, 1.4]} />
        <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
      </mesh>
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
      <pointLight position={[0, 3.5, 0]} intensity={5.5} distance={38} color="#f59e0b" />
    </group>

    {/* Floodlighting Washing India Gate */}
    <pointLight position={[-16, 2, 12]} intensity={6.5} distance={42} color="#f59e0b" />
    <pointLight position={[16, 2, 12]} intensity={6.5} distance={42} color="#f59e0b" />
    <pointLight position={[0, 2, 14]} intensity={7.0} distance={45} color="#fbbf24" />
  </group>
);

/**
 * 73-Foot Sandstone Canopy (Chhatri)
 * Located on the central axis directly behind India Gate.
 */
const IndiaGateCanopyChhatri = () => (
  <group>
    {/* Octagonal Plinth */}
    <mesh position={[0, 1.2, 0]}>
      <cylinderGeometry args={[6.5, 7.5, 2.4, 8]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>
    {/* 4 Fluted Red Sandstone Columns */}
    {[-2.8, 2.8].map((cx, i) =>
      [-2.8, 2.8].map((cz, j) => (
        <mesh key={`${i}-${j}`} position={[cx, 8.5, cz]}>
          <cylinderGeometry args={[0.42, 0.55, 12, 12]} />
          <meshStandardMaterial color="#d97706" roughness={0.7} />
        </mesh>
      ))
    )}
    {/* Domed Sandstone Cupola */}
    <mesh position={[0, 16.5, 0]}>
      <sphereGeometry args={[4.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#b45309" roughness={0.65} />
    </mesh>
    <mesh position={[0, 21.2, 0]}>
      <cylinderGeometry args={[0.15, 0.35, 2.8, 8]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.9} />
    </mesh>
    <pointLight position={[0, 14, 0]} intensity={4.5} distance={30} color="#f59e0b" />
  </group>
);

/**
 * National War Memorial (Rashtriya Samar Smarak)
 * Concentric circles of bravery with central 15.5m black granite obelisk.
 */
const NationalWarMemorial = () => (
  <group>
    {/* Concentric Memorial Chakras (Circular Pavements) */}
    <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[8, 16, 32]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2, 6, 32]} />
      <meshStandardMaterial color="#ca8a04" roughness={0.6} />
    </mesh>
    {/* Central Amar Chakra Black Granite Memorial Obelisk */}
    <mesh position={[0, 7.8, 0]}>
      <cylinderGeometry args={[0.7, 1.2, 15.5, 4]} rotation={[0, Math.PI / 4, 0]} />
      <meshStandardMaterial color="#020617" roughness={0.15} metalness={0.85} />
    </mesh>
    {/* Golden Ashoka Capital Emblem on Top */}
    <mesh position={[0, 16.2, 0]}>
      <sphereGeometry args={[0.65, 12, 12]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.9} />
    </mesh>
    <pointLight position={[0, 3, 0]} intensity={4.5} distance={28} color="#fef08a" />
  </group>
);

/**
 * North Block & South Block (Secretariat Ministries)
 * Herbert Baker's grand neoclassical Dholpur sandstone ministries with chhatris & colonnades.
 */
const NorthSouthBlockComplex = () => (
  <group>
    {/* Left Complex (South Block - Prime Minister's Office & Ministry of External Affairs) */}
    <group position={[-36, 0, 0]}>
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[28, 16, 48]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>
      {/* Classical Colonnaded Loggia */}
      {[-16, -8, 0, 8, 16].map((z, i) => (
        <mesh key={i} position={[14.2, 7.5, z]}>
          <cylinderGeometry args={[0.5, 0.6, 13, 8]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      ))}
      {/* Traditional Sandstone Chhatris on Roof */}
      {[-18, 18].map((z, i) => (
        <group key={i} position={[0, 18, z]}>
          <cylinderGeometry args={[2.2, 2.2, 3.5, 8]} />
          <mesh position={[0, 3.2, 0]}>
            <sphereGeometry args={[2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
        </group>
      ))}
      <pointLight position={[15, 6, 0]} intensity={4.0} distance={30} color="#f59e0b" />
    </group>

    {/* Right Complex (North Block - Ministry of Home Affairs & Finance) */}
    <group position={[36, 0, 0]}>
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[28, 16, 48]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>
      {/* Classical Colonnaded Loggia */}
      {[-16, -8, 0, 8, 16].map((z, i) => (
        <mesh key={i} position={[-14.2, 7.5, z]}>
          <cylinderGeometry args={[0.5, 0.6, 13, 8]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      ))}
      {/* Traditional Sandstone Chhatris on Roof */}
      {[-18, 18].map((z, i) => (
        <group key={i} position={[0, 18, z]}>
          <cylinderGeometry args={[2.2, 2.2, 3.5, 8]} />
          <mesh position={[0, 3.2, 0]}>
            <sphereGeometry args={[2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
        </group>
      ))}
      <pointLight position={[-15, 6, 0]} intensity={4.0} distance={30} color="#f59e0b" />
    </group>
  </group>
);

/**
 * Rashtrapati Bhavan Grand Dome (Presidential Palace on Raisina Hill)
 * Edwin Lutyens' copper Buddhist stupa dome and grand classical colonnade.
 */
const RashtrapatiBhavanDome = () => (
  <group>
    {/* Raisina Hill Sandstone Base */}
    <mesh position={[0, 5, 0]}>
      <boxGeometry args={[48, 10, 26]} />
      <meshStandardMaterial color="#78350f" roughness={0.8} />
    </mesh>
    {/* Classical Colonnade Pavilion */}
    <mesh position={[0, 12, 0]}>
      <boxGeometry args={[42, 4.5, 22]} />
      <meshStandardMaterial color="#b45309" roughness={0.75} />
    </mesh>
    {/* Colonnaded Drum Base of Dome */}
    <mesh position={[0, 16.5, 0]}>
      <cylinderGeometry args={[9.5, 10.2, 5, 24]} />
      <meshStandardMaterial color="#d97706" roughness={0.7} />
    </mesh>
    {/* Grand Copper Sanchi Stupa Dome */}
    <mesh position={[0, 22.5, 0]}>
      <sphereGeometry args={[9.4, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#ca8a04" metalness={0.65} roughness={0.35} />
    </mesh>
    {/* Top Lantern & Golden Finial */}
    <mesh position={[0, 32.5, 0]}>
      <cylinderGeometry args={[1.2, 1.4, 2.2, 12]} />
      <meshBasicMaterial color="#fef08a" />
    </mesh>
    <mesh position={[0, 34.2, 0]}>
      <sphereGeometry args={[0.8, 12, 12]} />
      <meshBasicMaterial color="#fbbf24" />
    </mesh>
    <pointLight position={[0, 24, 12]} intensity={6.0} distance={65} color="#f59e0b" />
  </group>
);

/**
 * Linear Water Fountain of Kartavya Path
 */
const RajpathFountain = ({ position }) => {
  const waterRef = useRef();

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[4.2, 0.5, 9.0]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 8.4]} />
        <meshStandardMaterial color="#0284c7" roughness={0.05} metalness={0.9} />
      </mesh>
      <group ref={waterRef} position={[0, 0.5, 0]}>
        {[-2.5, 0, 2.5].map((fz, fi) => (
          <group key={fi} position={[0, 0, fz]}>
            <mesh position={[0, 2.4, 0]}>
              <cylinderGeometry args={[0.06, 0.25, 4.8, 8]} />
              <meshBasicMaterial color="#7dd3fc" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 4.8, 0]}>
              <sphereGeometry args={[0.45, 8, 8]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.9} />
            </mesh>
          </group>
        ))}
      </group>
      <pointLight position={[0, 1.2, 0]} intensity={3.0} distance={14} color="#38bdf8" />
    </group>
  );
};

/**
 * Ceremonial Rajpath Cast-Iron Lamppost with Tricolor Banner
 */
const RajpathLamppost = ({ position, facing = 1 }) => (
  <group position={position}>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.3, 0.38, 0.8, 8]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>
    <mesh position={[0, 4.0, 0]}>
      <cylinderGeometry args={[0.08, 0.12, 6.8, 8]} />
      <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
    </mesh>
    <mesh position={[0, 7.3, 0]}>
      <sphereGeometry args={[0.22, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.8} />
    </mesh>
    <mesh position={[facing * 0.4, 7.6, 0]}>
      <boxGeometry args={[0.8, 0.1, 0.1]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
    <mesh position={[facing * 0.75, 7.3, 0]}>
      <cylinderGeometry args={[0.22, 0.15, 0.5, 6]} />
      <meshBasicMaterial color="#fef08a" />
    </mesh>
    <pointLight position={[facing * 0.75, 7.0, 0]} intensity={2.6} distance={24} color="#f59e0b" />

    {/* Indian National Tricolor Vertical Banner */}
    <group position={[facing * -0.3, 5.0, 0]} rotation={[0, (facing * Math.PI) / 2, 0]}>
      <mesh position={[0, 0.75, 0]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshBasicMaterial color="#ff9933" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshBasicMaterial color="#138808" side={THREE.DoubleSide} />
      </mesh>
    </group>
  </group>
);

/**
 * Grand Prix Finish Line Gantry (New Delhi Rajpath)
 */
const DelhiFinishGantry = () => (
  <group>
    <mesh position={[-10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#78350f" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[10.5, 5.5, 0]}>
      <boxGeometry args={[1.2, 11, 1.2]} />
      <meshStandardMaterial color="#78350f" metalness={0.8} roughness={0.3} />
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
      <meshBasicMaterial color="#f59e0b" />
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
