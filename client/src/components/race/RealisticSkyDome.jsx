import React, { useMemo } from 'react';
import * as THREE from 'three';

const skyDomeCache = new Map();

/**
 * Photorealistic Multi-Layered Atmospheric Sky Dome
 * Features natural atmospheric light scattering, glowing sun disk with corona,
 * layered panoramic cloud formations, and multi-depth mountain ridge horizons.
 */
export const RealisticSkyDome = ({ track }) => {
  const texture = useMemo(() => {
    if (skyDomeCache.has(track.skyTheme)) {
      return skyDomeCache.get(track.skyTheme);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Natural Atmospheric Sky Gradient (Zenith to Horizon)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    if (track.skyTheme === 'coastal') {
      skyGrad.addColorStop(0.0, '#061122');
      skyGrad.addColorStop(0.35, '#1e293b');
      skyGrad.addColorStop(0.60, '#c2410c');
      skyGrad.addColorStop(0.75, '#ea580c');
      skyGrad.addColorStop(0.85, '#f59e0b');
      skyGrad.addColorStop(0.92, '#fde68a');
      skyGrad.addColorStop(1.0, '#38bdf8');
    } else if (track.skyTheme === 'chennai') {
      skyGrad.addColorStop(0.0, '#060a19');
      skyGrad.addColorStop(0.38, '#1e293b');
      skyGrad.addColorStop(0.62, '#b45309');
      skyGrad.addColorStop(0.78, '#ea580c');
      skyGrad.addColorStop(0.88, '#f59e0b');
      skyGrad.addColorStop(0.94, '#fed7aa');
      skyGrad.addColorStop(1.0, '#0284c7');
    } else if (track.skyTheme === 'delhi') {
      skyGrad.addColorStop(0.0, '#050816');
      skyGrad.addColorStop(0.38, '#180d2b');
      skyGrad.addColorStop(0.65, '#581c87');
      skyGrad.addColorStop(0.80, '#b45309');
      skyGrad.addColorStop(0.90, '#d97706');
      skyGrad.addColorStop(0.95, '#fbbf24');
      skyGrad.addColorStop(1.0, '#15803d');
    } else if (track.skyTheme === 'mountain') {
      skyGrad.addColorStop(0.0, '#051329');
      skyGrad.addColorStop(0.35, '#0f274a');
      skyGrad.addColorStop(0.65, '#1e3a8a');
      skyGrad.addColorStop(0.80, '#0284c7');
      skyGrad.addColorStop(0.90, '#38bdf8');
      skyGrad.addColorStop(0.95, '#86efac');
      skyGrad.addColorStop(1.0, '#15803d');
    } else if (track.skyTheme === 'snow') {
      skyGrad.addColorStop(0.0, '#020617');
      skyGrad.addColorStop(0.35, '#0b162c');
      skyGrad.addColorStop(0.68, '#1e293b');
      skyGrad.addColorStop(0.82, '#475569');
      skyGrad.addColorStop(0.92, '#93c5fd');
      skyGrad.addColorStop(0.96, '#e2e8f0');
      skyGrad.addColorStop(1.0, '#cbd5e1');
    } else {
      // City (Neon Metropolis)
      skyGrad.addColorStop(0.0, '#02040a');
      skyGrad.addColorStop(0.38, '#150a24');
      skyGrad.addColorStop(0.70, '#3b0764');
      skyGrad.addColorStop(0.84, '#701a75');
      skyGrad.addColorStop(0.92, '#a21caf');
      skyGrad.addColorStop(1.0, '#0284c7');
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // 2. Radiant Sun with Multilayer Corona
    const sunX = 1450;
    const sunY = 720;
    const sunColor = track.skyTheme === 'snow' ? '#ffffff' : (track.skyTheme === 'coastal' || track.skyTheme === 'chennai') ? '#fef08a' : '#fef9c3';
    
    // Outer atmospheric bloom
    const outerCorona = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 320);
    outerCorona.addColorStop(0.0, 'rgba(254, 240, 138, 0.45)');
    outerCorona.addColorStop(0.4, 'rgba(251, 146, 60, 0.20)');
    outerCorona.addColorStop(1.0, 'rgba(251, 146, 60, 0.0)');
    ctx.fillStyle = outerCorona;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 320, 0, Math.PI * 2);
    ctx.fill();

    // Inner brilliant sun disk
    const innerCorona = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 45);
    innerCorona.addColorStop(0.0, '#ffffff');
    innerCorona.addColorStop(0.7, sunColor);
    innerCorona.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = innerCorona;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 45, 0, Math.PI * 2);
    ctx.fill();

    // 3. Layered Wispy Clouds Lit by Sunlight
    ctx.fillStyle = track.skyTheme === 'snow' ? 'rgba(226, 232, 240, 0.25)' : 'rgba(254, 215, 170, 0.22)';
    for (let c = 0; c < 12; c++) {
      const cx = (c * 190 + 80) % 2048;
      const cy = 480 + Math.sin(c * 1.5) * 80;
      const cw = 280 + (c % 4) * 60;
      const ch = 28 + (c % 3) * 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, cw / 2, ch / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Multi-Layer Distant Horizon Mountain Ridges (Layered Atmospheric Depth)
    // Layer A: Very distant hazy ridge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, 1024);
    for (let x = 0; x <= 2048; x += 16) {
      const y = Math.sin(x * 0.006) * 75 + Math.cos(x * 0.014) * 45 + 780;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(2048, 1024);
    ctx.closePath();
    ctx.fill();

    // Layer B: Mid-distance jagged mountain peaks
    ctx.fillStyle = 'rgba(11, 17, 32, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, 1024);
    for (let x = 0; x <= 2048; x += 16) {
      const y = Math.sin(x * 0.012 + 2) * 55 + Math.cos(x * 0.025) * 35 + Math.sin(x * 0.05) * 18 + 840;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(2048, 1024);
    ctx.closePath();
    ctx.fill();

    // Layer C: Near terrain foothills / shoreline silhouette
    ctx.fillStyle = 'rgba(6, 10, 20, 0.88)';
    ctx.beginPath();
    ctx.moveTo(0, 1024);
    for (let x = 0; x <= 2048; x += 16) {
      const y = Math.sin(x * 0.018 + 4) * 30 + Math.cos(x * 0.04) * 20 + 895;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(2048, 1024);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    skyDomeCache.set(track.skyTheme, tex);
    return tex;
  }, [track.skyTheme]);

  return (
    <mesh position={[0, -10, 0]}>
      <sphereGeometry args={[450, 48, 24]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
};

