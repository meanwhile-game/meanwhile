import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Hyper-Realistic AAA GT Supercar 3D Model
 * Designed with authentic supercar curves, sculpted aerodynamics,
 * multi-layer clearcoat automotive paint, realistic wheels with Brembo calipers,
 * functional LED optics, glass cockpit with interior bucket seats,
 * carbon fiber aero splitters & rear diffuser, titanium exhausts with heat glow.
 */
export const RealisticRaceCar = ({ 
  position = [0, 0, 0], 
  color = '#f8fafc', 
  isPlayer = false, 
  speed = 100,
  driverTag = null,
  turntable = false,
  vehicleId = 'vortex'
}) => {
  const rootRef = useRef();
  const carBodyRef = useRef();
  const wheelsRef = useRef([]);
  const exhaustGlowRef = useRef();
  const brakeLightGlowRef = useRef();

  useFrame((state, delta) => {
    // 1. Turntable rotation for Garage showcase mode
    if (turntable && rootRef.current) {
      rootRef.current.rotation.y += delta * 0.45;
      return;
    }

    // 2. Wheel angular rotation based on vehicle velocity
    const spinDelta = (speed / 3.6) * delta * 5.6;
    wheelsRef.current.forEach(w => {
      if (w) w.rotation.x += spinDelta;
    });

    // 3. Dynamic suspension physics & engine rumble
    if (carBodyRef.current) {
      // Idle & road vibration (higher frequency at speed)
      const rumble = Math.sin(state.clock.elapsedTime * 42) * Math.max(0.0015, (speed / 320) * 0.008);
      // Acceleration squat (rear dips subtly under heavy throttle)
      const squat = Math.min(0.035, (speed / 320) * 0.035);
      carBodyRef.current.position.y = rumble - (isPlayer ? squat * 0.5 : 0);
      carBodyRef.current.rotation.x = isPlayer ? squat * 0.35 : 0;
      
      // Dynamic high-speed body sway on turns
      if (isPlayer) {
        const bodyRoll = Math.sin(state.clock.elapsedTime * 0.8) * Math.min(0.025, (speed / 320) * 0.025);
        carBodyRef.current.rotation.z = bodyRoll;
      }
    }

    // 4. Exhaust heat glow pulsation
    if (exhaustGlowRef.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 24) * 0.2;
      exhaustGlowRef.current.intensity = Math.max(0.2, (speed / 300) * 3.0 * pulse);
    }
  });

  // Physically accurate multi-layer automotive paint color
  const bodyColor = useMemo(() => new THREE.Color(color), [color]);
  
  // Tire tread canvas texture
  const tireTreadTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#11141a';
    ctx.fillRect(0, 0, 128, 256);
    
    // Tire grooves
    ctx.fillStyle = '#080a0f';
    for (let y = 0; y < 256; y += 16) {
      ctx.fillRect(10, y, 108, 4);
      ctx.fillRect(36, y + 8, 56, 4);
    }
    // Lateral drainage channels
    ctx.fillRect(30, 0, 4, 256);
    ctx.fillRect(94, 0, 4, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }, []);

  // Brake disc rotor texture with drilled radial holes
  const rotorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Steel disc brushed metallic circle
    const grad = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.3, '#94a3b8');
    grad.addColorStop(0.7, '#64748b');
    grad.addColorStop(1, '#475569');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Drilled cross-cooling holes
    ctx.fillStyle = '#1e293b';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      for (let r = 50; r < 115; r += 18) {
        const x = 128 + Math.cos(a + r * 0.02) * r;
        const y = 128 + Math.sin(a + r * 0.02) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <group ref={rootRef} position={position}>
      {/* Floating Driver Badge for Opponents */}
      {driverTag && (
        <Html position={[0, 1.85, 0]} center distanceFactor={18}>
          <div className="px-2.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-xl whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5">
            <span className="text-amber-400 font-mono-num">#{driverTag.rank}</span>
            <span className="tracking-wide">{driverTag.name}</span>
          </div>
        </Html>
      )}

      {/* Main Car Body Assembly with dynamic suspension offset */}
      <group ref={carBodyRef}>
        
        {/* ============================================================== */}
        {/* 1. AERODYNAMIC CARBON LOWER CHASSIS & FRONT SPLITTER           */}
        {/* ============================================================== */}
        {/* Carbon Undertray Floor */}
        <mesh position={[0, 0.16, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[1.96, 0.06, 4.35]} />
          <meshStandardMaterial color="#0b0f17" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* Front Carbon Splitter Blade */}
        <mesh position={[0, 0.14, 2.22]} castShadow>
          <boxGeometry args={[1.98, 0.04, 0.45]} />
          <meshStandardMaterial color="#080c14" roughness={0.3} metalness={0.8} />
        </mesh>
        
        {/* Front Splitter Aerodynamic Dive Canards (Left & Right) */}
        <mesh position={[-0.98, 0.19, 2.14]} rotation={[0, -0.2, 0.15]}>
          <boxGeometry args={[0.04, 0.14, 0.36]} />
          <meshStandardMaterial color="#080c14" roughness={0.25} metalness={0.8} />
        </mesh>
        <mesh position={[0.98, 0.19, 2.14]} rotation={[0, 0.2, -0.15]}>
          <boxGeometry args={[0.04, 0.14, 0.36]} />
          <meshStandardMaterial color="#080c14" roughness={0.25} metalness={0.8} />
        </mesh>

        {/* Sculpted Carbon Side Skirts with Aero Winglets */}
        {[-0.99, 0.99].map((sx, i) => (
          <group key={i} position={[sx, 0.17, 0]}>
            {/* Horizontal blade */}
            <mesh>
              <boxGeometry args={[0.08, 0.04, 2.7]} />
              <meshStandardMaterial color="#0b0f17" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Rear aerodynamic flick winglet ahead of rear wheel */}
            <mesh position={[i === 0 ? -0.02 : 0.02, 0.08, -0.9]} rotation={[0, 0, i === 0 ? 0.2 : -0.2]}>
              <boxGeometry args={[0.03, 0.16, 0.28]} />
              <meshStandardMaterial color="#0b0f17" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* ============================================================== */}
        {/* 2. SCULPTED AERODYNAMIC SUPERCAR MAIN BODYWORK                 */}
        {/* ============================================================== */}
        {/* Central Monocoque Body Tub */}
        <mesh position={[0, 0.40, 0.05]} castShadow>
          <boxGeometry args={[1.92, 0.36, 4.18]} />
          <meshPhysicalMaterial 
            color={bodyColor} 
            metalness={0.86} 
            roughness={0.16} 
            clearcoat={1.0} 
            clearcoatRoughness={0.04}
            reflectivity={0.98}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Sloping Aerodynamic Front Nose / Hood (Contoured down to front bumper) */}
        <mesh position={[0, 0.41, 1.48]} rotation={[-0.14, 0, 0]} castShadow>
          <boxGeometry args={[1.82, 0.26, 1.42]} />
          <meshPhysicalMaterial 
            color={bodyColor} 
            metalness={0.86} 
            roughness={0.16} 
            clearcoat={1.0} 
            clearcoatRoughness={0.04}
            reflectivity={0.98}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Slanted Front Bumper Nosecone */}
        <mesh position={[0, 0.28, 2.12]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[1.86, 0.24, 0.35]} />
          <meshPhysicalMaterial 
            color={bodyColor} 
            metalness={0.86} 
            roughness={0.16} 
            clearcoat={1.0} 
            clearcoatRoughness={0.04}
            reflectivity={0.98}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Front Center Radiator Air Intake Grille (Hex mesh aesthetic) */}
        <mesh position={[0, 0.25, 2.26]}>
          <boxGeometry args={[1.15, 0.16, 0.08]} />
          <meshStandardMaterial color="#05070d" roughness={0.7} metalness={0.5} />
        </mesh>

        {/* Lateral Front Brake Duct Intakes */}
        <mesh position={[-0.72, 0.25, 2.23]}>
          <boxGeometry args={[0.34, 0.14, 0.06]} />
          <meshStandardMaterial color="#05070d" roughness={0.7} metalness={0.5} />
        </mesh>
        <mesh position={[0.72, 0.25, 2.23]}>
          <boxGeometry args={[0.34, 0.14, 0.06]} />
          <meshStandardMaterial color="#05070d" roughness={0.7} metalness={0.5} />
        </mesh>

        {/* Aerodynamic Hood Air Extractor Vents (Dual Carbon Recesses) */}
        <mesh position={[-0.42, 0.48, 1.35]} rotation={[-0.14, 0, 0]}>
          <boxGeometry args={[0.26, 0.02, 0.52]} />
          <meshStandardMaterial color="#090d16" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0.42, 0.48, 1.35]} rotation={[-0.14, 0, 0]}>
          <boxGeometry args={[0.26, 0.02, 0.52]} />
          <meshStandardMaterial color="#090d16" roughness={0.35} metalness={0.8} />
        </mesh>

        {/* Flared Front Wheel Arches (Muscular front fenders) */}
        <mesh position={[-0.96, 0.45, 1.28]} castShadow>
          <boxGeometry args={[0.16, 0.32, 1.45]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.86} roughness={0.16} clearcoat={1.0} clearcoatRoughness={0.04} />
        </mesh>
        <mesh position={[0.96, 0.45, 1.28]} castShadow>
          <boxGeometry args={[0.16, 0.32, 1.45]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.86} roughness={0.16} clearcoat={1.0} clearcoatRoughness={0.04} />
        </mesh>

        {/* Front Fender Top Pressure Relief Louvers */}
        {[-0.96, 0.96].map((fx, i) => (
          <group key={i} position={[fx, 0.62, 1.3]}>
            {[-0.15, 0, 0.15].map((lz, j) => (
              <mesh key={j} position={[0, 0, lz]}>
                <boxGeometry args={[0.12, 0.015, 0.08]} />
                <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Flared Muscular Rear Wheel Haunches (Wide rear track stance) */}
        <mesh position={[-0.99, 0.47, -1.05]} castShadow>
          <boxGeometry args={[0.18, 0.38, 1.75]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.86} roughness={0.16} clearcoat={1.0} clearcoatRoughness={0.04} />
        </mesh>
        <mesh position={[0.99, 0.47, -1.05]} castShadow>
          <boxGeometry args={[0.18, 0.38, 1.75]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.86} roughness={0.16} clearcoat={1.0} clearcoatRoughness={0.04} />
        </mesh>

        {/* Sculpted Side Air Intakes / NACA Ducts feeding rear radiators */}
        <group position={[-0.97, 0.40, -0.15]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.24, 0.75]} />
            <meshStandardMaterial color="#04060b" roughness={0.6} />
          </mesh>
          <mesh position={[0.03, 0, 0]}>
            <boxGeometry args={[0.02, 0.22, 0.7]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
        <group position={[0.97, 0.40, -0.15]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.24, 0.75]} />
            <meshStandardMaterial color="#04060b" roughness={0.6} />
          </mesh>
          <mesh position={[-0.03, 0, 0]}>
            <boxGeometry args={[0.02, 0.22, 0.7]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* ============================================================== */}
        {/* 3. TINTED GLASS COCKPIT CANOPY, CABIN INTERIOR & MIRRORS      */}
        {/* ============================================================== */}
        {/* Sleek Aerodynamic Greenhouse Roof Canopy */}
        <mesh position={[0, 0.81, -0.22]} castShadow>
          <boxGeometry args={[1.40, 0.42, 2.18]} />
          <meshPhysicalMaterial 
            color="#050811" 
            roughness={0.05} 
            metalness={0.2} 
            transmission={0.70}
            thickness={0.8}
            ior={1.52}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
          />
        </mesh>

        {/* Slanted Front Windshield Rake */}
        <mesh position={[0, 0.74, 0.68]} rotation={[0.48, 0, 0]} castShadow>
          <boxGeometry args={[1.36, 0.04, 0.86]} />
          <meshPhysicalMaterial 
            color="#050811" 
            roughness={0.05} 
            metalness={0.2} 
            transmission={0.75}
            thickness={0.6}
            ior={1.52}
            clearcoat={1.0}
          />
        </mesh>

        {/* Gloss Black Windshield A-Pillars */}
        <mesh position={[-0.67, 0.74, 0.68]} rotation={[0.48, 0, 0]}>
          <boxGeometry args={[0.06, 0.05, 0.88]} />
          <meshStandardMaterial color="#070a10" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0.67, 0.74, 0.68]} rotation={[0.48, 0, 0]}>
          <boxGeometry args={[0.06, 0.05, 0.88]} />
          <meshStandardMaterial color="#070a10" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Sloping Fastback Rear Glass Decklid with Engine Bay Louvers */}
        <mesh position={[0, 0.73, -1.05]} rotation={[-0.38, 0, 0]} castShadow>
          <boxGeometry args={[1.34, 0.04, 0.92]} />
          <meshPhysicalMaterial 
            color="#050811" 
            roughness={0.05} 
            metalness={0.2} 
            transmission={0.65}
            thickness={0.8}
            ior={1.52}
            clearcoat={1.0}
          />
        </mesh>
        
        {/* Carbon Engine Bay Cooling Slats (Louvers) */}
        {[-0.75, -0.95, -1.15, -1.35].map((zL, i) => (
          <mesh key={i} position={[0, 0.76 - i * 0.04, zL]}>
            <boxGeometry args={[1.12, 0.025, 0.12]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}

        {/* Roof Aerodynamic Air Induction Scoop */}
        <mesh position={[0, 1.04, 0.12]} rotation={[-0.05, 0, 0]}>
          <boxGeometry args={[0.34, 0.07, 0.62]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Interior Cabin Elements (Visible through tinted glass) */}
        {/* Deep Matte Black Interior Tub */}
        <mesh position={[0, 0.62, -0.15]}>
          <boxGeometry args={[1.28, 0.28, 1.85]} />
          <meshStandardMaterial color="#070a12" roughness={0.9} />
        </mesh>
        {/* Twin Sports Racing Bucket Seats */}
        {[-0.34, 0.34].map((seatX, i) => (
          <group key={i} position={[seatX, 0.74, -0.25]}>
            {/* Seat Backrest */}
            <mesh position={[0, 0, 0]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.42, 0.44, 0.12]} />
              <meshStandardMaterial color="#1e2230" roughness={0.8} />
            </mesh>
            {/* Ergonomic Headrest */}
            <mesh position={[0, 0.28, -0.04]}>
              <boxGeometry args={[0.24, 0.18, 0.10]} />
              <meshStandardMaterial color="#0f131f" roughness={0.8} />
            </mesh>
            {/* Harness Pass-Through Slot in Red */}
            <mesh position={[0, 0.20, -0.02]}>
              <boxGeometry args={[0.18, 0.04, 0.12]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        ))}
        {/* Sport Racing Flat-Bottom Steering Wheel */}
        <group position={[-0.34, 0.72, 0.32]} rotation={[-0.35, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.12, 0.02, 8, 16]} />
            <meshStandardMaterial color="#090d16" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.18, 0.03, 0.015]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
        {/* Dashboard Gauge Cluster Glow */}
        <mesh position={[-0.34, 0.74, 0.48]}>
          <boxGeometry args={[0.22, 0.09, 0.02]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Aerodynamic Side View Mirrors with Reflective Glass */}
        {[-1, 1].map((side, i) => (
          <group key={i} position={[side * 0.92, 0.76, 0.62]}>
            {/* Carbon Support Stalk */}
            <mesh position={[side * -0.05, -0.04, 0]} rotation={[0, 0, side * -0.4]}>
              <boxGeometry args={[0.12, 0.03, 0.04]} />
              <meshStandardMaterial color="#0b0f17" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Sculpted Mirror Housing */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.10, 0.14]} />
              <meshPhysicalMaterial color={bodyColor} metalness={0.86} roughness={0.16} clearcoat={1.0} />
            </mesh>
            {/* Reflective Mirror Glass */}
            <mesh position={[0, 0, -0.075]}>
              <planeGeometry args={[0.15, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.05} />
            </mesh>
          </group>
        ))}

        {/* ============================================================== */}
        {/* 4. OPTICS: MODERN PROJECTOR HEADLIGHTS & TAILLIGHT BAR         */}
        {/* ============================================================== */}
        {/* Front Triple-Projector Jewel LED Headlights */}
        {[-0.72, 0.72].map((hx, i) => (
          <group key={i} position={[hx, 0.48, 2.08]} rotation={[-0.14, i === 0 ? -0.1 : 0.1, 0]}>
            {/* Smoked Dark Polycarbonate Lens Enclosure */}
            <mesh>
              <boxGeometry args={[0.34, 0.08, 0.16]} />
              <meshStandardMaterial color="#03060c" roughness={0.1} metalness={0.8} />
            </mesh>
            {/* Triple Projector LED Cores */}
            {[-0.10, 0, 0.10].map((px, j) => (
              <mesh key={j} position={[px, 0, 0.07]}>
                <sphereGeometry args={[0.026, 8, 8]} />
                <meshBasicMaterial color="#f0f9ff" />
              </mesh>
            ))}
            {/* Sweeping DRL Lightblade Strip */}
            <mesh position={[0, 0.035, 0.07]}>
              <boxGeometry args={[0.32, 0.015, 0.02]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}

        {/* Full-Width 3D Continuous LED Taillight Bar with Glowing Optic Core */}
        <group position={[0, 0.58, -2.14]}>
          {/* Smoked Ruby Transparent Outer Casing */}
          <mesh>
            <boxGeometry args={[1.82, 0.07, 0.05]} />
            <meshStandardMaterial color="#450a0a" roughness={0.2} metalness={0.6} />
          </mesh>
          {/* Continuous Radiant Red Laser LED Core */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.78, 0.045, 0.02]} />
            <meshBasicMaterial color="#ff1111" />
          </mesh>
          {/* Dual Dynamic Outer Brake Lamp Clusters */}
          <mesh position={[-0.76, 0, -0.02]}>
            <boxGeometry args={[0.26, 0.08, 0.025]} />
            <meshBasicMaterial color="#ff2222" />
          </mesh>
          <mesh position={[0.76, 0, -0.02]}>
            <boxGeometry args={[0.26, 0.08, 0.025]} />
            <meshBasicMaterial color="#ff2222" />
          </mesh>
          {/* White Crystal Reverse Lamp Accents */}
          <mesh position={[-0.38, 0, -0.02]}>
            <boxGeometry args={[0.12, 0.025, 0.025]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0.38, 0, -0.02]}>
            <boxGeometry args={[0.12, 0.025, 0.025]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>

        {/* Dynamic Taillight Road Wash Light for Player */}
        {isPlayer && (
          <pointLight 
            ref={brakeLightGlowRef}
            position={[0, 0.55, -2.35]} 
            intensity={2.8} 
            distance={9} 
            color="#ef4444" 
          />
        )}

        {/* Rear License Plate Reading "meanwhile" */}
        <group position={[0, 0.38, -2.14]}>
          <mesh>
            <boxGeometry args={[0.58, 0.17, 0.03]} />
            <meshStandardMaterial color="#090d16" roughness={0.5} />
          </mesh>
          <Html position={[0, 0, -0.02]} transform rotation={[0, Math.PI, 0]} scale={0.24} distanceFactor={10}>
            <div className="px-2 py-0.5 rounded bg-black/95 border border-white/30 text-[7px] font-black font-mono tracking-widest text-slate-100 uppercase pointer-events-none select-none shadow-md">
              meanwhile
            </div>
          </Html>
        </group>

        {/* ============================================================== */}
        {/* 5. CARBON FIBER REAR GT WING WITH SWAN-NECK MOUNTS            */}
        {/* ============================================================== */}
        {/* Cambered Airfoil Wing Blade */}
        <mesh position={[0, 1.10, -1.96]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[1.92, 0.045, 0.44]} />
          <meshStandardMaterial color="#0b0f17" roughness={0.25} metalness={0.8} />
        </mesh>
        {/* Aerodynamic Endplates with Vortex Slots */}
        {[-0.97, 0.97].map((wex, i) => (
          <mesh key={i} position={[wex, 1.10, -1.96]}>
            <boxGeometry args={[0.035, 0.24, 0.48]} />
            <meshStandardMaterial color="#080c14" roughness={0.2} metalness={0.85} />
          </mesh>
        ))}
        {/* Twin CNC Billet Aluminum Swan-Neck Pylons */}
        {[-0.55, 0.55].map((px, i) => (
          <mesh key={i} position={[px, 0.92, -1.96]}>
            <boxGeometry args={[0.03, 0.38, 0.08]} />
            <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}

        {/* ============================================================== */}
        {/* 6. REAR CARBON DIFFUSER & TITANIUM EXHAUST SYSTEM             */}
        {/* ============================================================== */}
        {/* Massive Rear Carbon Diffuser */}
        <mesh position={[0, 0.21, -2.10]} castShadow>
          <boxGeometry args={[1.76, 0.18, 0.28]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* 6 Vertical Aerodynamic Diffuser Fins */}
        {[-0.65, -0.38, -0.12, 0.12, 0.38, 0.65].map((fx, idx) => (
          <mesh key={idx} position={[fx, 0.18, -2.12]}>
            <boxGeometry args={[0.03, 0.18, 0.32]} />
            <meshStandardMaterial color="#060910" roughness={0.25} metalness={0.85} />
          </mesh>
        ))}

        {/* Twin Oversized Titanium Exhaust Tailpipes with Heat-Blued Gradient */}
        <group position={[0, 0.26, -2.16]}>
          {/* Left Exhaust Pipe */}
          <group position={[-0.46, 0, 0]}>
            {/* Outer Beveled Metal Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.14, 24]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.08} />
            </mesh>
            {/* Heat-Blued Titanium Lip Ring */}
            <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.082, 0.082, 0.02, 24]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.92} roughness={0.15} />
            </mesh>
            {/* Internal Glowing Core */}
            <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.062, 0.062, 0.02, 16]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
          </group>

          {/* Right Exhaust Pipe */}
          <group position={[0.46, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.14, 24]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.08} />
            </mesh>
            <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.082, 0.082, 0.02, 24]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.92} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.062, 0.062, 0.02, 16]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
          </group>

          {/* Throttle-Responsive Dynamic Exhaust Heat Glow PointLight */}
          <pointLight 
            ref={exhaustGlowRef} 
            position={[0, 0, -0.25]} 
            intensity={1.8} 
            distance={6} 
            color="#f97316" 
          />
        </group>

        {/* ============================================================== */}
        {/* 7. PERFORMANCE WHEELS WITH ROTATING RIMS & BREMBO CALIPERS     */}
        {/* ============================================================== */}
        {[-0.98, 0.98].map((wx, xi) =>
          [-1.32, 1.32].map((wz, zi) => {
            const isLeft = xi === 0;
            const wheelIdx = xi * 2 + zi;

            return (
              <group key={`${xi}-${zi}`} position={[wx, 0.33, wz]}>
                {/* Spinning Tire & Rim Assembly */}
                <group ref={el => (wheelsRef.current[wheelIdx] = el)}>
                  {/* High-Performance Contoured Rubber Tire with Tread */}
                  <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.35, 0.35, 0.28, 32]} />
                    <meshStandardMaterial 
                      color="#14171f" 
                      map={tireTreadTexture}
                      roughness={0.92} 
                      metalness={0.08}
                    />
                  </mesh>

                  {/* Rounded Tire Outer Shoulder (Torus bevel for authentic curved rubber sidewalls) */}
                  <mesh position={[isLeft ? -0.13 : 0.13, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[0.27, 0.07, 12, 32]} />
                    <meshStandardMaterial color="#11141b" roughness={0.94} />
                  </mesh>

                  {/* Deep-Dish Concave Alloy Wheel Outer Barrel */}
                  <mesh position={[isLeft ? -0.02 : 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.26, 0.26, 0.25, 24]} />
                    <meshStandardMaterial color="#475569" metalness={0.92} roughness={0.16} />
                  </mesh>

                  {/* High-Detail 5-Twin-Spoke Forged Alloy Rim Faces */}
                  {[0, 1, 2, 3, 4].map(spokeIdx => {
                    const angle = (spokeIdx * (Math.PI * 2)) / 5;
                    return (
                      <group key={spokeIdx} rotation={[angle, 0, 0]}>
                        <mesh position={[isLeft ? -0.14 : 0.14, 0.12, 0]} rotation={[0, 0, isLeft ? -0.06 : 0.06]}>
                          <boxGeometry args={[0.03, 0.18, 0.035]} />
                          <meshStandardMaterial color="#94a3b8" metalness={0.94} roughness={0.12} />
                        </mesh>
                        <mesh position={[isLeft ? -0.14 : 0.14, 0.12, 0.04]} rotation={[0, 0, isLeft ? -0.06 : 0.06]}>
                          <boxGeometry args={[0.03, 0.18, 0.02]} />
                          <meshStandardMaterial color="#94a3b8" metalness={0.94} roughness={0.12} />
                        </mesh>
                      </group>
                    );
                  })}

                  {/* Polished Rim Lip Highlight Ring */}
                  <mesh position={[isLeft ? -0.145 : 0.145, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[0.245, 0.015, 8, 32]} />
                    <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.06} />
                  </mesh>

                  {/* Center Wheel Hub with 5 Titanium Lug Nuts */}
                  <mesh position={[isLeft ? -0.13 : 0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.075, 0.075, 0.04, 16]} />
                    <meshStandardMaterial color="#0b0f17" metalness={0.9} />
                  </mesh>
                  {/* Center Emblem Jewel */}
                  <mesh position={[isLeft ? -0.155 : 0.155, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.032, 0.032, 0.01, 16]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                </group>

                {/* Static Cross-Drilled Carbon-Ceramic Brake Disc Rotor */}
                <mesh position={[isLeft ? -0.04 : 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.23, 0.23, 0.035, 24]} />
                  <meshStandardMaterial 
                    color="#94a3b8" 
                    map={rotorTexture}
                    metalness={0.88} 
                    roughness={0.24} 
                  />
                </mesh>

                {/* Static High-Performance 6-Piston Brembo-Style Racing Brake Caliper */}
                <group position={[isLeft ? -0.04 : 0.04, 0.14, 0.08]}>
                  <mesh>
                    <boxGeometry args={[0.07, 0.13, 0.14]} />
                    <meshStandardMaterial color="#ef4444" roughness={0.28} metalness={0.3} />
                  </mesh>
                  {/* Brembo White Lettering Accent */}
                  <mesh position={[isLeft ? -0.036 : 0.036, 0, 0]}>
                    <boxGeometry args={[0.005, 0.03, 0.08]} />
                    <meshBasicMaterial color="#f8fafc" />
                  </mesh>
                </group>
              </group>
            );
          })
        )}

        {/* ============================================================== */}
        {/* 8. SPEED-RESPONSIVE TIRE SPRAY MIST & SPEED TRAILS             */}
        {/* ============================================================== */}
        {speed > 45 && !turntable && (
          <group position={[0, 0.18, -2.4]}>
            <mesh position={[-0.98, 0, 0]} rotation={[-Math.PI / 5, 0, 0]}>
              <planeGeometry args={[0.5, 2.2]} />
              <meshBasicMaterial 
                color="#e2e8f0" 
                transparent 
                opacity={Math.min(0.42, speed / 320)} 
                depthWrite={false} 
              />
            </mesh>
            <mesh position={[0.98, 0, 0]} rotation={[-Math.PI / 5, 0, 0]}>
              <planeGeometry args={[0.5, 2.2]} />
              <meshBasicMaterial 
                color="#e2e8f0" 
                transparent 
                opacity={Math.min(0.42, speed / 320)} 
                depthWrite={false} 
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};
