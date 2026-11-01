import React, { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural High-Dynamic-Range Environment Map & IBL (Image-Based Lighting) Generator
 * Runs 100% locally with zero external network dependencies.
 * Synthesizes a 360-degree equirectangular panoramic radiance map tailored to each track
 * and computes pre-filtered radiance mipmaps via THREE.PMREMGenerator so every metallic
 * car surface, clearcoat paint, glass windshield, and wet asphalt reflects realistic sky,
 * sun glint, and terrain horizons.
 */
export const RealisticEnvironmentMap = ({ skyTheme = 'mountain' }) => {
  const { gl, scene } = useThree();

  useEffect(() => {
    // 1. Synthesize 1024x512 Equirectangular Radiance Panorama
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sky vertical gradient (Zenith -> Horizon -> Ground)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);

    if (skyTheme === 'coastal') {
      skyGrad.addColorStop(0.0, '#0c1626');   // Zenith deep navy
      skyGrad.addColorStop(0.3, '#1e293b');
      skyGrad.addColorStop(0.55, '#ea580c');  // Sunset orange
      skyGrad.addColorStop(0.65, '#f59e0b');  // Golden horizon
      skyGrad.addColorStop(0.72, '#38bdf8');  // Sea reflection
      skyGrad.addColorStop(1.0, '#082f49');   // Deep ocean base
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
      skyGrad.addColorStop(0.75, '#e2e8f0');  // High albedo snow horizon
      skyGrad.addColorStop(1.0, '#64748b');
    } else if (skyTheme === 'city') {
      skyGrad.addColorStop(0.0, '#030712');
      skyGrad.addColorStop(0.35, '#1e1035');
      skyGrad.addColorStop(0.60, '#581c87');
      skyGrad.addColorStop(0.68, '#e879f9');
      skyGrad.addColorStop(0.72, '#38bdf8');
      skyGrad.addColorStop(1.0, '#090d16');
    } else {
      // Mountain Pass (Default)
      skyGrad.addColorStop(0.0, '#081426');
      skyGrad.addColorStop(0.35, '#172554');
      skyGrad.addColorStop(0.58, '#1e3a8a');
      skyGrad.addColorStop(0.68, '#38bdf8');
      skyGrad.addColorStop(0.72, '#22c55e');
      skyGrad.addColorStop(1.0, '#14532d');
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Radiant Sun High-Dynamic-Range Glint in Panorama
    const sunGrad = ctx.createRadialGradient(320, 260, 4, 320, 260, 120);
    sunGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    sunGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.9)');
    sunGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.45)');
    sunGrad.addColorStop(1.0, 'rgba(249, 115, 22, 0.0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(320, 260, 120, 0, Math.PI * 2);
    ctx.fill();

    // Distant mountain & cloud silhouettes in environment reflection
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 360);
    for (let x = 0; x <= 1024; x += 16) {
      const h = Math.sin(x * 0.015) * 25 + Math.cos(x * 0.035) * 15 + 340;
      ctx.lineTo(x, h);
    }
    ctx.lineTo(1024, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.mapping = THREE.EquirectangularReflectionMapping;

    // 2. Pre-filter Radiance Map into Physical Environment via PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const envRenderTarget = pmremGenerator.fromEquirectangular(canvasTexture);

    scene.environment = envRenderTarget.texture;

    // Cleanup resources when component unmounts or theme changes
    return () => {
      pmremGenerator.dispose();
      canvasTexture.dispose();
      envRenderTarget.dispose();
    };
  }, [skyTheme, gl, scene]);

  return null;
};

