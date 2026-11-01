import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Creates high-fidelity procedural road textures with authentic asphalt aggregate,
 * rubbered-in tire wear racing lines, weathered thermoplastic lines, and reflective road studs.
 */
export const createPhotorealisticRoadTexture = ({
  lanes = 3,
  dashedColor = '#f8fafc',
  edgeColor = '#f59e0b',
  isWet = false,
  doubleCenter = false
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. Base Weathered Asphalt
  ctx.fillStyle = isWet ? '#0c1018' : '#141a24';
  ctx.fillRect(0, 0, 512, 1024);

  // 2. High-Density Stochastic Aggregate Noise (Sand, gravel, tar binder)
  for (let i = 0; i < 3500; i++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 1024;
    const gr = Math.random() * 2.2 + 0.8;
    const isLight = Math.random() > 0.65;
    ctx.fillStyle = isLight 
      ? (isWet ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.035)')
      : 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(gx, gy, gr, gr);
  }

  // 3. Dark Rubbered-in Racing Lines / Tire Wear Paths in each lane
  ctx.fillStyle = isWet ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.22)';
  const laneWidth = 512 / lanes;
  for (let l = 0; l < lanes; l++) {
    const laneCenter = (l + 0.5) * laneWidth;
    // Left & right tire tracks per lane
    ctx.fillRect(laneCenter - 34, 0, 24, 1024);
    ctx.fillRect(laneCenter + 10, 0, 24, 1024);
  }

  // 4. Center Divider & Lane Markings
  if (doubleCenter) {
    // Double Yellow Center Lines (e.g. Mountain Pass)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(250, 0, 4, 1024);
    ctx.fillRect(258, 0, 4, 1024);
  } else {
    // Dashed White Lane Divider Lines
    ctx.fillStyle = dashedColor;
    for (let l = 1; l < lanes; l++) {
      const lx = l * laneWidth;
      ctx.fillRect(lx - 3, 50, 6, 260);
      ctx.fillRect(lx - 3, 560, 6, 260);

      // Reflective Cats-Eyes / Pavement Studs (Amber/Gold with metal housing)
      ctx.fillStyle = '#475569';
      ctx.fillRect(lx - 5, 335, 10, 16);
      ctx.fillRect(lx - 5, 845, 10, 16);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lx - 3, 338, 6, 10);
      ctx.fillRect(lx - 3, 848, 6, 10);
      ctx.fillStyle = dashedColor;
    }
  }

  // 5. Solid Outer Edge Shoulder Lines
  ctx.fillStyle = edgeColor;
  ctx.fillRect(18, 0, 6, 1024);
  ctx.fillRect(488, 0, 6, 1024);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 14);
  return tex;
};

/**
 * High-detail realistic corrugated galvanized steel W-beam guardrails
 * with galvanized metallic sheen, vertical I-beam support posts, and retroreflective hazard studs.
 */
export const RealisticGuardrails = ({ length = 280, xLeft = -8.7, xRight = 8.7 }) => {
  const postsZ = useMemo(() => {
    const list = [];
    for (let z = -60; z <= 180; z += 18) {
      list.push(z);
    }
    return list;
  }, []);

  return (
    <group>
      {/* Left Guardrail Assembly */}
      <group position={[xLeft, 0.48, 40]}>
        {/* Main Corrugated W-Beam Rail Face (Beveled upper and lower ridges) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.14, 0.52, length]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.24} />
        </mesh>
        <mesh position={[0.04, 0, 0]}>
          <boxGeometry args={[0.04, 0.22, length]} />
          <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.28} />
        </mesh>

        {/* Galvanized Steel I-Beam Support Posts */}
        {postsZ.map((pz, idx) => (
          <group key={idx} position={[-0.1, -0.22, pz]}>
            <mesh>
              <boxGeometry args={[0.08, 0.72, 0.12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.35} />
            </mesh>
            {/* Retroreflective Amber Hazard Stud */}
            <mesh position={[0.15, 0.24, 0]}>
              <boxGeometry args={[0.02, 0.08, 0.08]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right Guardrail Assembly */}
      <group position={[xRight, 0.48, 40]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.14, 0.52, length]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.24} />
        </mesh>
        <mesh position={[-0.04, 0, 0]}>
          <boxGeometry args={[0.04, 0.22, length]} />
          <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.28} />
        </mesh>

        {postsZ.map((pz, idx) => (
          <group key={idx} position={[0.1, -0.22, pz]}>
            <mesh>
              <boxGeometry args={[0.08, 0.72, 0.12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.35} />
            </mesh>
            {/* Retroreflective Red/White Hazard Stud */}
            <mesh position={[-0.15, 0.24, 0]}>
              <boxGeometry args={[0.02, 0.08, 0.08]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

/**
 * 3D Raised Beveled Racing Kerbs (FIA Red & White Rumble Strips with rubber scuffs)
 */
export const RealisticRumbleKerbs = ({ length = 280, xLeft = -8.3, xRight = 8.3 }) => {
  const curbTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#f8fafc';
      ctx.fillRect(0, i * 32, 64, 32);
      // Realistic tire rubber skid marks on kerbs
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.fillRect(10, i * 32 + 6, 44, 20);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }, []);

  return (
    <group>
      {/* Left Kerb */}
      <mesh position={[xLeft, 0.035, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.65, length]} />
        <meshStandardMaterial map={curbTexture} roughness={0.65} metalness={0.15} />
      </mesh>
      {/* Right Kerb */}
      <mesh position={[xRight, 0.035, 40]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.65, length]} />
        <meshStandardMaterial map={curbTexture} roughness={0.65} metalness={0.15} />
      </mesh>
    </group>
  );
};

