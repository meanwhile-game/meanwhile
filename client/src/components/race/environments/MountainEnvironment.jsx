import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RealisticRoadSurface, RealisticGravelShoulder, RealisticGuardrails } from '../RealisticRoadElements.jsx';

/**
 * 01 MOUNTAIN PASS ENVIRONMENT (Photorealistic Alpine Canyon)
 * Matching Reference Image 1:
 * - Alpine canyon road with smooth perspective curve and white center dashes
 * - Unified PBR asphalt with mineral aggregate, rubbered-in tire wear lines, and thermoplastic striping
 * - Compacted crushed stone shoulders and heavy galvanized W-beam guardrails
 * - Towering dense conifer pine forests rising on the ascending left mountain slope (InstancedMesh)
 * - Stratified dark granite cliff face with massive roaring cascading waterfall gorge on right
 * - Rushing white-water waterfall with rapid UV flow and foaming spray mist pool
 * - Roadside yellow diamond chevron warning sign
 * - Distant snow-capped alpine peaks with atmospheric scattering
 */
export const MountainEnvironment = ({ speedKmh = 100, progress = 0 }) => {
  const waterfallStreamRef = useRef();
  const waterfallSprayRef = useRef();
  const waterfallGroupRef = useRef();
  const viaductGroupRef = useRef();
  const summitGroupRef = useRef();
  const mistGroupRef = useRef();

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta;

    // Waterfall rushing water UV flow
    if (waterfallStreamRef.current && waterfallStreamRef.current.material && waterfallStreamRef.current.material.map) {
      waterfallStreamRef.current.material.map.offset.y -= delta * 3.8;
    }

    // Foaming waterfall spray pulse
    if (waterfallSprayRef.current) {
      waterfallSprayRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.16;
      waterfallSprayRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 8) * 0.12;
    }

    // Floating mountain valley mist drift
    if (mistGroupRef.current) {
      mistGroupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 3.0;
      mistGroupRef.current.position.z = (mistGroupRef.current.position.z + moveStep * 0.25) % 110;
    }

    // --- LANDMARK PROGRESSION ---
    // 1. The Great Waterfall Gorge (progress 0% -> 50%)
    if (waterfallGroupRef.current) {
      const waterfallZ = 220 - (progress / 0.45) * 300;
      waterfallGroupRef.current.position.z = THREE.MathUtils.lerp(
        waterfallGroupRef.current.position.z,
        waterfallZ,
        delta * 3.5
      );
    }

    // 2. High Alpine Stone Viaduct Arch Bridge (progress 35% -> 80%)
    if (viaductGroupRef.current) {
      const viaductZ = 260 - ((progress - 0.35) / 0.40) * 340;
      viaductGroupRef.current.position.z = THREE.MathUtils.lerp(
        viaductGroupRef.current.position.z,
        viaductZ,
        delta * 3.5
      );
    }

    // 3. Mountain Summit Finish Gantry (progress 70% -> 100%)
    if (summitGroupRef.current) {
      const summitZ = 240 - ((progress - 0.70) / 0.30) * 260;
      summitGroupRef.current.position.z = THREE.MathUtils.lerp(
        summitGroupRef.current.position.z,
        summitZ,
        delta * 3.5
      );
    }
  });

  // Procedural Rushing Water Texture for Waterfall
  const waterfallTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 128, 512);

    // Whitewater foam cascades
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 512;
      const h = Math.random() * 32 + 8;
      const w = Math.random() * 5 + 1;
      ctx.fillRect(x, y, w, h);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return tex;
  }, []);

  return (
    <group>
      {/* 1. Unified Photorealistic PBR Road Surface with Aggregate, Rubber Wear & Thermoplastic Markings */}
      <RealisticRoadSurface
        lanes={3}
        doubleCenter={true}
        edgeColor="#f8fafc"
        isWet={true}
        roadWidth={16.8}
        length={320}
        speedKmh={speedKmh}
      />

      {/* Compacted Crushed Gravel Shoulder Run-Off */}
      <RealisticGravelShoulder length={320} xLeft={-8.4} xRight={8.4} width={1.2} />

      {/* Heavy Galvanized Steel Guardrails with Hazard Reflectors */}
      <RealisticGuardrails length={300} xLeft={-9.8} xRight={9.8} />

      {/* Yellow Warning Diamond Chevron Sign (Reference Image 1) */}
      <group position={[9.2, 0, 32]}>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.1, 0]} rotation={[0, -0.2, Math.PI / 4]}>
          <boxGeometry args={[0.95, 0.95, 0.04]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 2.1, 0.03]} rotation={[0, -0.2, 0]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>
      </group>

      {/* 2. Left Alpine Mountain Embankment: Sloping upward with pine forest and granite boulders */}
      <group position={[-25, 2.8, 60]} rotation={[0, 0, 0.18]}>
        <mesh receiveShadow>
          <planeGeometry args={[36, 340]} />
          <meshStandardMaterial color="#172e20" roughness={0.95} />
        </mesh>
        {/* Stratified Granite Rock Outcroppings on left slope */}
        {[-30, 20, 70, 120].map((rz, i) => (
          <mesh key={i} position={[2, 0.8, rz]} rotation={[0.2, (i * 0.7), -0.1]} castShadow receiveShadow>
            <dodecahedronGeometry args={[2.8 + (i % 3) * 0.8, 1]} />
            <meshStandardMaterial color="#2d3748" roughness={0.92} />
          </mesh>
        ))}
      </group>

      {/* Right Canyon Shoulder Verge */}
      <mesh position={[24, -0.15, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 340]} />
        <meshStandardMaterial color="#1d2b21" roughness={0.95} />
      </mesh>

      {/* 3. DYNAMIC LANDMARK: CASCADING WATERFALL GORGE (Right Side) */}
      <group ref={waterfallGroupRef} position={[28, 18, 220]}>
        {/* Stratified Granite Rock Cliff Face */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[22, 52, 70]} />
          <meshStandardMaterial color="#1e293b" roughness={0.94} />
        </mesh>
        <mesh position={[-2, 27, 0]}>
          <boxGeometry args={[20, 4, 70]} />
          <meshStandardMaterial color="#14532d" roughness={0.9} />
        </mesh>

        {/* Multi-Tier Cascading Waterfall Stream with UV flow */}
        <mesh ref={waterfallStreamRef} position={[-11, 3, 2]}>
          <planeGeometry args={[8.5, 48]} />
          <meshPhysicalMaterial 
            map={waterfallTexture}
            color="#38bdf8" 
            emissive="#0284c7" 
            emissiveIntensity={0.4} 
            roughness={0.08} 
            metalness={0.5} 
            transparent 
            opacity={0.94} 
          />
        </mesh>
        {/* Foaming Plunge Pool */}
        <mesh ref={waterfallSprayRef} position={[-10.6, -18, 2]}>
          <boxGeometry args={[10, 4, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} transparent opacity={0.9} />
        </mesh>
        <pointLight position={[-9, -8, 2]} intensity={2.5} distance={38} color="#7dd3fc" />
      </group>

      {/* 4. DYNAMIC LANDMARK: HIGH ALPINE STONE VIADUCT ARCH BRIDGE */}
      <group ref={viaductGroupRef} position={[0, 12, 280]}>
        <mesh position={[0, 5.2, 0]} castShadow>
          <boxGeometry args={[78, 4.2, 13]} />
          <meshStandardMaterial color="#334155" roughness={0.88} />
        </mesh>
        <mesh position={[0, 7.8, -6.2]}>
          <boxGeometry args={[78, 1.2, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        <mesh position={[0, 7.8, 6.2]}>
          <boxGeometry args={[78, 1.2, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {[-22, 0, 22].map((xArch, i) => (
          <group key={i} position={[xArch, 0, 0]}>
            <mesh position={[-5.8, -4, 0]} castShadow>
              <boxGeometry args={[2.8, 13, 9.5]} />
              <meshStandardMaterial color="#1e293b" roughness={0.92} />
            </mesh>
            <mesh position={[5.8, -4, 0]} castShadow>
              <boxGeometry args={[2.8, 13, 9.5]} />
              <meshStandardMaterial color="#1e293b" roughness={0.92} />
            </mesh>
            <mesh position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[11.5, 3.8, 9.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.92} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. DYNAMIC LANDMARK: MOUNTAIN SUMMIT FINISH GANTRY */}
      <group ref={summitGroupRef} position={[0, 6, 260]}>
        <mesh position={[0, 5.6, 0]} castShadow>
          <boxGeometry args={[22.5, 1.9, 1.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[-9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>
        <mesh position={[9.6, 2.6, 0]} castShadow>
          <boxGeometry args={[0.9, 7.2, 0.9]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 5.6, 0.72]}>
          <planeGeometry args={[18.5, 1.4]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* 6. DISTANT ALPINE PEAKS WITH SNOW CAPS */}
      <group position={[-58, 34, 170]}>
        <mesh rotation={[0, 0.4, 0]}>
          <coneGeometry args={[55, 85, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.94} />
        </mesh>
        <mesh position={[0, 32, 0]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[18, 25, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.82} />
        </mesh>
      </group>
      <group position={[62, 32, 185]}>
        <mesh rotation={[0, -0.3, 0]}>
          <coneGeometry args={[52, 80, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.94} />
        </mesh>
        <mesh position={[0, 29, 0]} rotation={[0, -0.3, 0]}>
          <coneGeometry args={[17, 23, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.82} />
        </mesh>
      </group>

      {/* 7. MIST DRIFT */}
      <group ref={mistGroupRef} position={[0, 6, 80]}>
        <mesh position={[-20, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[48, 32]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.14} depthWrite={false} />
        </mesh>
        <mesh position={[18, 4, 25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[42, 30]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>

      {/* 8. HIGH-PERFORMANCE INSTANCED ALPINE CONIFER FOREST (2 draw calls for all trees) */}
      <InstancedPineForest speedKmh={speedKmh} />
    </group>
  );
};

// High-Performance Instanced Alpine Conifer Forest
const InstancedPineForest = ({ speedKmh = 100 }) => {
  const foliageRef = useRef();
  const trunkRef = useRef();
  const count = 48;

  const { foliageGeo, trunkGeo, foliageMat, trunkMat, fMats, tMats } = useMemo(() => {
    const fGeo = new THREE.ConeGeometry(1.6, 3.8, 7);
    const tGeo = new THREE.CylinderGeometry(0.2, 0.35, 2.4, 6);
    const fMat = new THREE.MeshStandardMaterial({ color: '#133e28', roughness: 0.88 });
    const tMat = new THREE.MeshStandardMaterial({ color: '#271810', roughness: 0.95 });

    const fMatrixList = [];
    const tMatrixList = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const isLeft = i < 28;
      const x = isLeft ? -13 - (i % 7) * 3.8 : 14.5 + (i % 5) * 4.2;
      const z = -40 + Math.floor(i / (isLeft ? 7 : 5)) * 36 + (i % 3) * 6;
      const scale = 0.9 + (i % 4) * 0.35;
      const rotY = (i * 1.3) % (Math.PI * 2);

      // Trunk
      dummy.position.set(x, 1.2 * scale, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, rotY, 0);
      dummy.updateMatrix();
      tMatrixList.push(dummy.matrix.clone());

      // Foliage
      dummy.position.set(x, 3.2 * scale, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, rotY, 0);
      dummy.updateMatrix();
      fMatrixList.push(dummy.matrix.clone());
    }

    return { foliageGeo: fGeo, trunkGeo: tGeo, foliageMat: fMat, trunkMat: tMat, fMats: fMatrixList, tMats: tMatrixList };
  }, []);

  useEffect(() => {
    if (foliageRef.current && trunkRef.current) {
      for (let i = 0; i < count; i++) {
        foliageRef.current.setMatrixAt(i, fMats[i]);
        trunkRef.current.setMatrixAt(i, tMats[i]);
      }
      foliageRef.current.instanceMatrix.needsUpdate = true;
      trunkRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [fMats, tMats]);

  useFrame((state, delta) => {
    const moveStep = (speedKmh / 3.6) * delta * 0.95;
    if (foliageRef.current && trunkRef.current) {
      foliageRef.current.position.z = (foliageRef.current.position.z + moveStep) % 72;
      trunkRef.current.position.z = foliageRef.current.position.z;
    }
  });

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, count]} castShadow />
      <instancedMesh ref={foliageRef} args={[foliageGeo, foliageMat, count]} castShadow />
    </group>
  );
};

