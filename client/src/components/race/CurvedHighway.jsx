import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPhotorealisticRoadTexture } from './RealisticRoadElements.jsx';

/**
 * Computes procedural track curvature and elevation at distance z ahead of camera
 * given the cumulative travel distance along the track.
 */
export const getTrackCurvature = (skyTheme, z, dist) => {
  const t = (z + dist);
  let x = 0;
  let y = 0;

  if (skyTheme === 'mountain') {
    // Winding alpine mountain hairpins & sweepers
    x = Math.sin(t * 0.016) * 13.5 + Math.sin(t * 0.035) * 6.0;
    y = Math.sin(t * 0.011) * 2.5;
  } else if (skyTheme === 'coastal') {
    // Riviera coastal cliff S-curves
    x = Math.sin(t * 0.014) * 15.0 + Math.cos(t * 0.030) * 4.5;
    y = Math.sin(t * 0.009) * 1.8;
  } else if (skyTheme === 'snow') {
    // Alpine curves leading into rock tunnel
    x = Math.cos(t * 0.015) * 12.5 + Math.sin(t * 0.032) * 5.0;
    y = Math.cos(t * 0.011) * 2.4;
  } else if (skyTheme === 'city') {
    // Metropolis multi-lane expressway sweeping turns
    x = Math.sin(t * 0.013) * 9.0 + Math.cos(t * 0.026) * 3.5;
    y = Math.sin(t * 0.007) * 1.2;
  } else if (skyTheme === 'chennai') {
    // Marina coastal boulevard sweep
    x = Math.sin(t * 0.011) * 8.0 + Math.cos(t * 0.022) * 3.0;
    y = Math.sin(t * 0.005) * 0.5;
  } else if (skyTheme === 'delhi') {
    // Grand ceremonial Rajpath avenue with subtle perspective sweep
    x = Math.sin(t * 0.010) * 6.5;
    y = Math.cos(t * 0.007) * 0.4;
  } else {
    x = Math.sin(t * 0.014) * 11.0;
    y = 0;
  }

  // Numerical tangent heading (yaw)
  const dt = 1.0;
  const tNext = t + dt;
  let xNext = 0;
  if (skyTheme === 'mountain') {
    xNext = Math.sin(tNext * 0.016) * 13.5 + Math.sin(tNext * 0.035) * 6.0;
  } else if (skyTheme === 'coastal') {
    xNext = Math.sin(tNext * 0.014) * 15.0 + Math.cos(tNext * 0.030) * 4.5;
  } else if (skyTheme === 'snow') {
    xNext = Math.cos(tNext * 0.015) * 12.5 + Math.sin(tNext * 0.032) * 5.0;
  } else if (skyTheme === 'city') {
    xNext = Math.sin(tNext * 0.013) * 9.0 + Math.cos(tNext * 0.026) * 3.5;
  } else if (skyTheme === 'chennai') {
    xNext = Math.sin(tNext * 0.011) * 8.0 + Math.cos(tNext * 0.022) * 3.0;
  } else if (skyTheme === 'delhi') {
    xNext = Math.sin(tNext * 0.010) * 6.5;
  } else {
    xNext = Math.sin(tNext * 0.014) * 11.0;
  }

  const dx = (xNext - x) / dt;
  const yaw = Math.atan2(dx, 1.0);
  const roll = -yaw * 0.35; // Centrifugal road banking

  return { x, y, yaw, roll, dx };
};

/**
 * High-Performance Dynamic 3D Curving Highway Ribbon
 * Physically constructs a segmented 3D ribbon that dynamically curves,
 * elevates, banks, and turns as the vehicle drives forward down the track.
 */
export const CurvedHighway = ({ 
  speedKmh = 100, 
  track,
  roadWidth = 17.2,
  lanes = 3,
  dashedColor = '#f8fafc',
  edgeColor = '#f59e0b',
  isWet = true,
  doubleCenter = false
}) => {
  const meshRef = useRef();
  const kerbLeftRef = useRef();
  const kerbRightRef = useRef();
  const guardLeftRef = useRef();
  const guardRightRef = useRef();
  const distanceRef = useRef(0);

  // Road configuration
  const SEGMENTS = 90;
  const Z_START = -18;
  const Z_END = 320;
  const SEG_LEN = (Z_END - Z_START) / SEGMENTS;

  // 1. Procedural High-Resolution Road Surface Texture
  const roadTexture = useMemo(() => {
    return createPhotorealisticRoadTexture({
      lanes,
      dashedColor,
      edgeColor,
      isWet,
      doubleCenter
    });
  }, [lanes, dashedColor, edgeColor, isWet, doubleCenter]);

  // FIA Red & White Rumble Kerb Texture
  const kerbTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#f8fafc';
      ctx.fillRect(0, i * 32, 64, 32);
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
        ctx.fillRect(10, i * 32 + 6, 44, 20);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
  }, []);

  // 2. Initial BufferGeometries
  const roadGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array((SEGMENTS + 1) * 2 * 3);
    const uvs = new Float32Array((SEGMENTS + 1) * 2 * 2);
    const indices = [];

    const halfW = roadWidth / 2;

    for (let i = 0; i <= SEGMENTS; i++) {
      const z = Z_START + i * SEG_LEN;
      const vIdx = i * 2;

      // Left vertex
      pos[vIdx * 3 + 0] = -halfW;
      pos[vIdx * 3 + 1] = 0;
      pos[vIdx * 3 + 2] = z;

      // Right vertex
      pos[(vIdx + 1) * 3 + 0] = halfW;
      pos[(vIdx + 1) * 3 + 1] = 0;
      pos[(vIdx + 1) * 3 + 2] = z;

      // UVs
      const v = (z - Z_START) / 24;
      uvs[vIdx * 2 + 0] = 0;
      uvs[vIdx * 2 + 1] = v;

      uvs[(vIdx + 1) * 2 + 0] = 1;
      uvs[(vIdx + 1) * 2 + 1] = v;

      if (i < SEGMENTS) {
        const a = i * 2;
        const b = i * 2 + 1;
        const c = (i + 1) * 2;
        const d = (i + 1) * 2 + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [roadWidth, SEGMENTS, SEG_LEN, Z_START]);

  // Kerb Geometries
  const createKerbGeo = () => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array((SEGMENTS + 1) * 2 * 3);
    const uvs = new Float32Array((SEGMENTS + 1) * 2 * 2);
    const indices = [];
    const kerbW = 0.85;

    for (let i = 0; i <= SEGMENTS; i++) {
      const z = Z_START + i * SEG_LEN;
      const vIdx = i * 2;
      pos[vIdx * 3 + 0] = -kerbW / 2;
      pos[vIdx * 3 + 1] = 0.04;
      pos[vIdx * 3 + 2] = z;

      pos[(vIdx + 1) * 3 + 0] = kerbW / 2;
      pos[(vIdx + 1) * 3 + 1] = 0.04;
      pos[(vIdx + 1) * 3 + 2] = z;

      const v = (z - Z_START) / 16;
      uvs[vIdx * 2 + 0] = 0;
      uvs[vIdx * 2 + 1] = v;
      uvs[(vIdx + 1) * 2 + 0] = 1;
      uvs[(vIdx + 1) * 2 + 1] = v;

      if (i < SEGMENTS) {
        indices.push(vIdx, vIdx + 1, vIdx + 2);
        indices.push(vIdx + 1, vIdx + 3, vIdx + 2);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const kerbLeftGeo = useMemo(() => createKerbGeo(), []);
  const kerbRightGeo = useMemo(() => createKerbGeo(), []);

  // Guardrail Geometries
  const createGuardGeo = () => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array((SEGMENTS + 1) * 2 * 3);
    const indices = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const z = Z_START + i * SEG_LEN;
      const vIdx = i * 2;
      pos[vIdx * 3 + 0] = 0;
      pos[vIdx * 3 + 1] = 0.15;
      pos[vIdx * 3 + 2] = z;

      pos[(vIdx + 1) * 3 + 0] = 0;
      pos[(vIdx + 1) * 3 + 1] = 0.72;
      pos[(vIdx + 1) * 3 + 2] = z;

      if (i < SEGMENTS) {
        indices.push(vIdx, vIdx + 1, vIdx + 2);
        indices.push(vIdx + 1, vIdx + 3, vIdx + 2);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const guardLeftGeo = useMemo(() => createGuardGeo(), []);
  const guardRightGeo = useMemo(() => createGuardGeo(), []);

  // 3. Dynamic Real-Time Spline Deformation in useFrame
  useFrame((state, delta) => {
    const distStep = (speedKmh / 3.6) * delta;
    distanceRef.current += distStep;
    const dist = distanceRef.current;
    const halfW = roadWidth / 2;
    const kerbW = 0.85;

    // A. Animate Road Texture UV offset smoothly
    if (roadTexture) {
      roadTexture.offset.y = -((dist % 24) / 24);
    }
    if (kerbTexture) {
      kerbTexture.offset.y = -((dist % 16) / 16);
    }

    // B. Deform Road Ribbon Vertices along the Curve
    if (meshRef.current) {
      const posAttr = meshRef.current.geometry.attributes.position;
      const posArray = posAttr.array;

      for (let i = 0; i <= SEGMENTS; i++) {
        const z = Z_START + i * SEG_LEN;
        const curve = getTrackCurvature(track.skyTheme, z, dist);
        const vIdx = i * 2;

        // Normal vector perpendicular to curve heading
        const cosYaw = Math.cos(curve.yaw);
        const sinYaw = Math.sin(curve.yaw);

        // Banking roll elevation delta
        const bankDy = Math.sin(curve.roll) * halfW;

        // Left road vertex
        posArray[vIdx * 3 + 0] = curve.x - halfW * cosYaw;
        posArray[vIdx * 3 + 1] = curve.y - bankDy;
        posArray[vIdx * 3 + 2] = z + halfW * sinYaw;

        // Right road vertex
        posArray[(vIdx + 1) * 3 + 0] = curve.x + halfW * cosYaw;
        posArray[(vIdx + 1) * 3 + 1] = curve.y + bankDy;
        posArray[(vIdx + 1) * 3 + 2] = z - halfW * sinYaw;
      }
      posAttr.needsUpdate = true;
    }

    // C. Deform Left & Right FIA Kerbs
    if (kerbLeftRef.current && kerbRightRef.current) {
      const klPos = kerbLeftRef.current.geometry.attributes.position.array;
      const krPos = kerbRightRef.current.geometry.attributes.position.array;

      for (let i = 0; i <= SEGMENTS; i++) {
        const z = Z_START + i * SEG_LEN;
        const curve = getTrackCurvature(track.skyTheme, z, dist);
        const cosYaw = Math.cos(curve.yaw);
        const sinYaw = Math.sin(curve.yaw);
        const vIdx = i * 2;

        // Left Kerb
        const lBaseX = curve.x - (halfW + 0.1) * cosYaw;
        const lBaseZ = z + (halfW + 0.1) * sinYaw;
        klPos[vIdx * 3 + 0] = lBaseX - (kerbW / 2) * cosYaw;
        klPos[vIdx * 3 + 1] = curve.y + 0.04;
        klPos[vIdx * 3 + 2] = lBaseZ + (kerbW / 2) * sinYaw;
        klPos[(vIdx + 1) * 3 + 0] = lBaseX + (kerbW / 2) * cosYaw;
        klPos[(vIdx + 1) * 3 + 1] = curve.y + 0.04;
        klPos[(vIdx + 1) * 3 + 2] = lBaseZ - (kerbW / 2) * sinYaw;

        // Right Kerb
        const rBaseX = curve.x + (halfW + 0.1) * cosYaw;
        const rBaseZ = z - (halfW + 0.1) * sinYaw;
        krPos[vIdx * 3 + 0] = rBaseX - (kerbW / 2) * cosYaw;
        krPos[vIdx * 3 + 1] = curve.y + 0.04;
        krPos[vIdx * 3 + 2] = rBaseZ + (kerbW / 2) * sinYaw;
        krPos[(vIdx + 1) * 3 + 0] = rBaseX + (kerbW / 2) * cosYaw;
        krPos[(vIdx + 1) * 3 + 1] = curve.y + 0.04;
        krPos[(vIdx + 1) * 3 + 2] = rBaseZ - (kerbW / 2) * sinYaw;
      }
      kerbLeftRef.current.geometry.attributes.position.needsUpdate = true;
      kerbRightRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // D. Deform Guardrails
    if (guardLeftRef.current && guardRightRef.current) {
      const glPos = guardLeftRef.current.geometry.attributes.position.array;
      const grPos = guardRightRef.current.geometry.attributes.position.array;
      const gOffset = halfW + 0.95;

      for (let i = 0; i <= SEGMENTS; i++) {
        const z = Z_START + i * SEG_LEN;
        const curve = getTrackCurvature(track.skyTheme, z, dist);
        const cosYaw = Math.cos(curve.yaw);
        const sinYaw = Math.sin(curve.yaw);
        const vIdx = i * 2;

        // Left Guardrail
        const lx = curve.x - gOffset * cosYaw;
        const lz = z + gOffset * sinYaw;
        glPos[vIdx * 3 + 0] = lx;
        glPos[vIdx * 3 + 1] = curve.y + 0.15;
        glPos[vIdx * 3 + 2] = lz;
        glPos[(vIdx + 1) * 3 + 0] = lx;
        glPos[(vIdx + 1) * 3 + 1] = curve.y + 0.72;
        glPos[(vIdx + 1) * 3 + 2] = lz;

        // Right Guardrail
        const rx = curve.x + gOffset * cosYaw;
        const rz = z - gOffset * sinYaw;
        grPos[vIdx * 3 + 0] = rx;
        grPos[vIdx * 3 + 1] = curve.y + 0.15;
        grPos[vIdx * 3 + 2] = rz;
        grPos[(vIdx + 1) * 3 + 0] = rx;
        grPos[(vIdx + 1) * 3 + 1] = curve.y + 0.72;
        grPos[(vIdx + 1) * 3 + 2] = rz;
      }
      guardLeftRef.current.geometry.attributes.position.needsUpdate = true;
      guardRightRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Main Curved Highway Road Ribbon with PBR Wet Asphalt Sheen */}
      <mesh ref={meshRef} geometry={roadGeo} receiveShadow>
        <meshPhysicalMaterial 
          map={roadTexture}
          color={isWet ? '#0d121c' : '#141a24'}
          roughness={isWet ? 0.22 : 0.42}
          metalness={isWet ? 0.75 : 0.25}
          clearcoat={isWet ? 1.0 : 0.4}
          clearcoatRoughness={0.08}
          reflectivity={0.96}
          envMapIntensity={2.2}
        />
      </mesh>

      {/* 2. Curved Red & White FIA Racing Kerbs on Left & Right */}
      <mesh ref={kerbLeftRef} geometry={kerbLeftGeo} receiveShadow>
        <meshStandardMaterial map={kerbTexture} roughness={0.65} metalness={0.15} />
      </mesh>
      <mesh ref={kerbRightRef} geometry={kerbRightGeo} receiveShadow>
        <meshStandardMaterial map={kerbTexture} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* 3. Curved Galvanized Steel W-Beam Guardrails */}
      <mesh ref={guardLeftRef} geometry={guardLeftGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={guardRightRef} geometry={guardRightGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

