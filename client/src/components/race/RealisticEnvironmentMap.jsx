import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Cache generated environment textures by skyTheme to avoid re-generating on every render
const textureCache = new Map();

const generateEnvTexture = (skyTheme) => {
  if (textureCache.has(skyTheme)) {
    return textureCache.get(skyTheme);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Sky vertical gradient (Zenith -> Horizon -> Ground)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);

  if (skyTheme === 'coastal') {
    skyGrad.addColorStop(0.0, '#0c1626');
    skyGrad.addColorStop(0.3, '#1e293b');
    skyGrad.addColorStop(0.55, '#ea580c');
    skyGrad.addColorStop(0.65, '#f59e0b');
    skyGrad.addColorStop(0.72, '#38bdf8');
    skyGrad.addColorStop(1.0, '#082f49');
  } else if (skyTheme === 'chennai') {
    skyGrad.addColorStop(0.0, '#090e1f');
    skyGrad.addColorStop(0.32, '#1e293b');
    skyGrad.addColorStop(0.58, '#ea580c');
    skyGrad.addColorStop(0.68, '#fb923c');
    skyGrad.addColorStop(0.74, '#fed7aa');
    skyGrad.addColorStop(1.0, '#0c4a6e');
  } else if (skyTheme === 'delhi') {
    skyGrad.addColorStop(0.0, '#070b1a');
    skyGrad.addColorStop(0.35, '#1e1135');
    skyGrad.addColorStop(0.60, '#7c2d12');
    skyGrad.addColorStop(0.68, '#d97706');
    skyGrad.addColorStop(0.74, '#fbbf24');
    skyGrad.addColorStop(1.0, '#14532d');
  } else if (skyTheme === 'snow') {
    skyGrad.addColorStop(0.0, '#020617');
    skyGrad.addColorStop(0.35, '#0f172a');
    skyGrad.addColorStop(0.60, '#334155');
    skyGrad.addColorStop(0.68, '#93c5fd');
    skyGrad.addColorStop(0.75, '#e2e8f0');
    skyGrad.addColorStop(1.0, '#64748b');
  } else if (skyTheme === 'city') {
    skyGrad.addColorStop(0.0, '#030712');
    skyGrad.addColorStop(0.35, '#1e1035');
    skyGrad.addColorStop(0.60, '#581c87');
    skyGrad.addColorStop(0.68, '#e879f9');
    skyGrad.addColorStop(0.72, '#38bdf8');
    skyGrad.addColorStop(1.0, '#090d16');
  } else {
    // Mountain Pass
    skyGrad.addColorStop(0.0, '#081426');
    skyGrad.addColorStop(0.35, '#172554');
    skyGrad.addColorStop(0.58, '#1e3a8a');
    skyGrad.addColorStop(0.68, '#38bdf8');
    skyGrad.addColorStop(0.72, '#22c55e');
    skyGrad.addColorStop(1.0, '#14532d');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Radiant Sun Glint
  const sunGrad = ctx.createRadialGradient(320, 260, 4, 320, 260, 120);
  sunGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  sunGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.9)');
  sunGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.45)');
  sunGrad.addColorStop(1.0, 'rgba(249, 115, 22, 0.0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(320, 260, 120, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;

  textureCache.set(skyTheme, texture);
  return texture;
};

/**
 * Rock-solid, zero-crash Environment Reflection Map
 * Generates an equirectangular reflection map cached in memory with zero WebGL disposal crashes.
 */
export const RealisticEnvironmentMap = ({ skyTheme = 'mountain' }) => {
  const { scene } = useThree();
  const appliedThemeRef = useRef(null);

  useEffect(() => {
    if (appliedThemeRef.current === skyTheme) return;
    appliedThemeRef.current = skyTheme;

    const envTex = generateEnvTexture(skyTheme);
    scene.environment = envTex;
  }, [skyTheme, scene]);

  return null;
};
