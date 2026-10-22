import * as THREE from 'three';
import { TrackConfig } from './types.js';

export interface BuiltTrack {
  curve: THREE.CatmullRomCurve3;
  trackGroup: THREE.Group;
  roadWidth: number;
  length: number;
  startLightMeshes: THREE.Mesh[];
}

export class TrackBuilder {
  public static buildTrack(config: TrackConfig): BuiltTrack {
    const trackGroup = new THREE.Group();
    const roadWidth = 16.0;

    // 1. Generate Spline Curve Points
    const points = this.generateTrackPoints(config.theme);
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    const length = curve.getLength();

    // 2. Generate Road Mesh along curve
    const roadMesh = this.generateRoadMesh(curve, roadWidth, config);
    trackGroup.add(roadMesh);

    // 3. Generate Edge Barriers / Guardrails
    const barriers = this.generateBarriers(curve, roadWidth, config);
    trackGroup.add(barriers);

    // 4. Generate Start Gantry & Finish Line
    const { startGantry, lights } = this.generateStartGantry(curve, roadWidth);
    const finishArch = this.generateFinishArch(curve, roadWidth);
    trackGroup.add(startGantry, finishArch);

    // 5. Generate Theme Environment Scenery
    const scenery = this.generateThemeScenery(curve, roadWidth, config.theme);
    trackGroup.add(scenery);

    return {
      curve,
      trackGroup,
      roadWidth,
      length,
      startLightMeshes: lights
    };
  }

  // --- TRACK POINTS DEFINITIONS ---
  private static generateTrackPoints(theme: 'tokyo' | 'swiss' | 'dubai'): THREE.Vector3[] {
    if (theme === 'swiss') {
      // Winding mountain pass with dramatic elevation shifts
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 2, 100),
        new THREE.Vector3(50, 8, 220),
        new THREE.Vector3(120, 16, 280),
        new THREE.Vector3(180, 24, 250),
        new THREE.Vector3(200, 32, 160),
        new THREE.Vector3(170, 36, 60),
        new THREE.Vector3(120, 42, -40),
        new THREE.Vector3(50, 45, -120),
        new THREE.Vector3(-30, 40, -180),
        new THREE.Vector3(-120, 32, -220),
        new THREE.Vector3(-200, 24, -180),
        new THREE.Vector3(-240, 16, -100),
        new THREE.Vector3(-220, 10, 0),
        new THREE.Vector3(-160, 5, 80),
        new THREE.Vector3(-80, 2, 40),
      ];
    } else if (theme === 'dubai') {
      // Sweeping high-speed desert perimeter
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 150),
        new THREE.Vector3(60, 1, 300),
        new THREE.Vector3(160, 2, 400),
        new THREE.Vector3(300, 1, 380),
        new THREE.Vector3(380, 0, 260),
        new THREE.Vector3(350, 2, 120),
        new THREE.Vector3(280, 0, 20),
        new THREE.Vector3(240, 0, -120),
        new THREE.Vector3(180, 2, -240),
        new THREE.Vector3(60, 1, -300),
        new THREE.Vector3(-80, 0, -260),
        new THREE.Vector3(-180, 1, -160),
        new THREE.Vector3(-160, 0, -40),
        new THREE.Vector3(-80, 0, 0),
      ];
    } else {
      // Tokyo Night Run: Elevated highway with sharp chicanes and high-speed bridges
      return [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 5, 120),
        new THREE.Vector3(40, 6, 240),
        new THREE.Vector3(110, 8, 320),
        new THREE.Vector3(220, 10, 340),
        new THREE.Vector3(310, 8, 280),
        new THREE.Vector3(330, 6, 180),
        new THREE.Vector3(270, 5, 80),
        new THREE.Vector3(240, 5, -20),
        new THREE.Vector3(260, 7, -140),
        new THREE.Vector3(210, 9, -240),
        new THREE.Vector3(120, 8, -300),
        new THREE.Vector3(10, 6, -280),
        new THREE.Vector3(-90, 5, -220),
        new THREE.Vector3(-140, 6, -120),
        new THREE.Vector3(-110, 5, -20),
      ];
    }
  }

  // --- ROAD GEOMETRY GENERATOR ---
  private static generateRoadMesh(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Mesh {
    const numSteps = 400;
    const halfWidth = roadWidth / 2;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      // Left vertex
      const leftPos = new THREE.Vector3().copy(point).addScaledVector(binormal, -halfWidth);
      positions.push(leftPos.x, leftPos.y, leftPos.z);
      normals.push(0, 1, 0);
      uvs.push(0, t * 80);

      // Right vertex
      const rightPos = new THREE.Vector3().copy(point).addScaledVector(binormal, halfWidth);
      positions.push(rightPos.x, rightPos.y, rightPos.z);
      normals.push(0, 1, 0);
      uvs.push(1, t * 80);

      if (i < numSteps) {
        const v1 = i * 2;
        const v2 = i * 2 + 1;
        const v3 = (i + 1) * 2;
        const v4 = (i + 1) * 2 + 1;

        indices.push(v1, v2, v3);
        indices.push(v2, v4, v3);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Procedural road texture with 4 lanes and asphalt noise
    const roadTexture = this.createRoadCanvasTexture(config);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 120);

    const roadMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.35,
      metalness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, roadMaterial);
    mesh.receiveShadow = true;
    return mesh;
  }

  // --- PROCEDURAL ROAD TEXTURE ---
  private static createRoadCanvasTexture(config: TrackConfig): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Asphalt dark base
    ctx.fillStyle = config.roadColor;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Curbs on edges (Red/White or Neon/Dark)
    const curbWidth = 24;
    // Left curb
    ctx.fillStyle = config.curbColor;
    ctx.fillRect(0, 0, curbWidth, 512);
    // Right curb
    ctx.fillRect(512 - curbWidth, 0, curbWidth, 512);

    // White outer solid boundary lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(curbWidth + 4, 0, 6, 512);
    ctx.fillRect(512 - curbWidth - 10, 0, 6, 512);

    // 4 Lane Dividers (Dashed lines)
    // Lane 1 divider (x ~ 140)
    // Center divider (x = 256)
    // Lane 3 divider (x ~ 372)
    ctx.fillStyle = config.theme === 'swiss' ? '#facc15' : 'rgba(255, 255, 255, 0.7)';
    const dashLength = 48;
    const gapLength = 32;
    const totalCycle = dashLength + gapLength;

    for (let y = 0; y < 512; y += totalCycle) {
      // Lane 1/2 line
      ctx.fillRect(146, y, 4, dashLength);
      // Center line (double bright)
      ctx.fillRect(254, y, 5, dashLength);
      // Lane 3/4 line
      ctx.fillRect(362, y, 4, dashLength);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // --- EDGE BARRIERS / GUARD RAILS ---
  private static generateBarriers(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const barriersGroup = new THREE.Group();
    const numPoints = 250;
    const halfWidth = roadWidth / 2 + 0.4;
    const up = new THREE.Vector3(0, 1, 0);

    const barrierMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.theme === 'tokyo' ? '#0f172a' : '#64748b'),
      roughness: 0.4,
      metalness: 0.8,
    });

    const neonMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.neonColor),
    });

    const leftBarrierPts: THREE.Vector3[] = [];
    const rightBarrierPts: THREE.Vector3[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      const left = new THREE.Vector3().copy(pt).addScaledVector(binormal, -halfWidth);
      left.y += 0.5;
      leftBarrierPts.push(left);

      const right = new THREE.Vector3().copy(pt).addScaledVector(binormal, halfWidth);
      right.y += 0.5;
      rightBarrierPts.push(right);

      // Add vertical stanchions every 6 steps
      if (i % 5 === 0) {
        const postGeo = new THREE.BoxGeometry(0.18, 1.0, 0.18);
        const postLeft = new THREE.Mesh(postGeo, barrierMat);
        postLeft.position.set(left.x, left.y - 0.2, left.z);

        const postRight = new THREE.Mesh(postGeo, barrierMat);
        postRight.position.set(right.x, right.y - 0.2, right.z);

        barriersGroup.add(postLeft, postRight);
      }
    }

    const leftRailCurve = new THREE.CatmullRomCurve3(leftBarrierPts, true);
    const rightRailCurve = new THREE.CatmullRomCurve3(rightBarrierPts, true);

    const railGeoLeft = new THREE.TubeGeometry(leftRailCurve, 250, 0.14, 6, true);
    const railGeoRight = new THREE.TubeGeometry(rightRailCurve, 250, 0.14, 6, true);

    const railMeshLeft = new THREE.Mesh(railGeoLeft, config.theme === 'tokyo' ? neonMat : barrierMat);
    const railMeshRight = new THREE.Mesh(railGeoRight, config.theme === 'tokyo' ? neonMat : barrierMat);

    barriersGroup.add(railMeshLeft, railMeshRight);
    return barriersGroup;
  }

  // --- START GANTRY & COUNTDOWN LIGHTS ---
  private static generateStartGantry(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number
  ): { startGantry: THREE.Group; lights: THREE.Mesh[] } {
    const gantry = new THREE.Group();
    const lights: THREE.Mesh[] = [];

    const startPt = curve.getPointAt(0.0);
    const tangent = curve.getTangentAt(0.0).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.7,
    });

    const halfW = roadWidth / 2 + 1.5;
    const height = 6.5;

    // Left & Right upright pillars
    const pillarGeo = new THREE.BoxGeometry(0.8, height, 0.8);
    const leftPillar = new THREE.Mesh(pillarGeo, trussMat);
    leftPillar.position.copy(startPt).addScaledVector(binormal, -halfW);
    leftPillar.position.y += height / 2;

    const rightPillar = new THREE.Mesh(pillarGeo, trussMat);
    rightPillar.position.copy(startPt).addScaledVector(binormal, halfW);
    rightPillar.position.y += height / 2;

    // Crossbeam truss
    const beamGeo = new THREE.BoxGeometry(roadWidth + 3.0, 0.9, 0.9);
    const beam = new THREE.Mesh(beamGeo, trussMat);
    beam.position.copy(startPt);
    beam.position.y += height;
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

    gantry.add(leftPillar, rightPillar, beam);

    // 5 Countdown Lights across the gantry
    for (let i = -2; i <= 2; i++) {
      const lightGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x330000 }); // Dim red by default
      const light = new THREE.Mesh(lightGeo, lightMat);

      const offsetPos = new THREE.Vector3()
        .copy(startPt)
        .addScaledVector(binormal, i * 2.2);
      offsetPos.y += height - 0.9;
      offsetPos.addScaledVector(tangent, -0.6); // Slightly facing oncoming racers
      light.position.copy(offsetPos);

      gantry.add(light);
      lights.push(light);
    }

    return { startGantry: gantry, lights };
  }

  // --- FINISH ARCH ---
  private static generateFinishArch(curve: THREE.CatmullRomCurve3, roadWidth: number): THREE.Group {
    const arch = new THREE.Group();
    const finishPt = curve.getPointAt(0.995);
    const tangent = curve.getTangentAt(0.995).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.8,
    });

    const neonLimeMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });

    const halfW = roadWidth / 2 + 1.2;
    const height = 7.0;

    // Posts
    const pGeo = new THREE.BoxGeometry(0.7, height, 0.7);
    const lp = new THREE.Mesh(pGeo, carbonMat);
    lp.position.copy(finishPt).addScaledVector(binormal, -halfW);
    lp.position.y += height / 2;

    const rp = new THREE.Mesh(pGeo, carbonMat);
    rp.position.copy(finishPt).addScaledVector(binormal, halfW);
    rp.position.y += height / 2;

    // Overhead Banner: "VELOCE FINISH"
    const bannerGeo = new THREE.BoxGeometry(roadWidth + 2.4, 1.4, 0.6);
    const banner = new THREE.Mesh(bannerGeo, carbonMat);
    banner.position.copy(finishPt);
    banner.position.y += height;
    banner.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

    // Glowing finish neon strip
    const stripGeo = new THREE.BoxGeometry(roadWidth + 2.5, 0.15, 0.65);
    const strip = new THREE.Mesh(stripGeo, neonLimeMat);
    strip.position.copy(finishPt);
    strip.position.y += height - 0.7;
    strip.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

    arch.add(lp, rp, banner, strip);
    return arch;
  }

  // --- THEMED SCENERY (TOKYO, SWISS, DUBAI) ---
  private static generateThemeScenery(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    theme: 'tokyo' | 'swiss' | 'dubai'
  ): THREE.Group {
    const scenery = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);

    if (theme === 'tokyo') {
      // Modern skyscrapers, illuminated glass towers, cyber highway signs
      const buildingMatDark = new THREE.MeshStandardMaterial({
        color: 0x090b12,
        roughness: 0.2,
        metalness: 0.9,
      });

      const neonPinkMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
      const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const neonLimeMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });

      // Place 45 buildings at safe distances along the track
      for (let i = 0; i < 45; i++) {
        const t = (i / 45);
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = roadWidth / 2 + 25 + Math.random() * 45;
        const bPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * dist);

        const bWidth = 14 + Math.random() * 18;
        const bDepth = 14 + Math.random() * 18;
        const bHeight = 40 + Math.random() * 85;

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMesh = new THREE.Mesh(bGeo, buildingMatDark);
        bMesh.position.set(bPos.x, bHeight / 2 - 10, bPos.z);
        scenery.add(bMesh);

        // Rooftop glowing neon halo
        const haloGeo = new THREE.BoxGeometry(bWidth + 0.5, 1.2, bDepth + 0.5);
        const haloMat = i % 3 === 0 ? neonCyanMat : i % 3 === 1 ? neonPinkMat : neonLimeMat;
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(bPos.x, bHeight - 10, bPos.z);
        scenery.add(halo);
      }

      // Highway streetlamps
      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const lampPt = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 1.2);
        const lampPoleGeo = new THREE.CylinderGeometry(0.1, 0.14, 7.5);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const lamp = new THREE.Mesh(lampPoleGeo, lampMat);
        lamp.position.set(lampPt.x, lampPt.y + 3.75, lampPt.z);

        const lightBulbGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const lightBulb = new THREE.Mesh(lightBulbGeo, neonCyanMat);
        lightBulb.position.set(lampPt.x, lampPt.y + 7.5, lampPt.z);

        scenery.add(lamp, lightBulb);
      }
    } else if (theme === 'swiss') {
      // Pine trees and granite mountain peaks
      const pineNeedleMat = new THREE.MeshStandardMaterial({
        color: 0x143422,
        roughness: 0.9,
      });
      const pineTrunkMat = new THREE.MeshStandardMaterial({
        color: 0x3e2723,
        roughness: 0.8,
      });
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.8,
      });

      // Scatter 70 pine trees
      for (let i = 0; i < 70; i++) {
        const t = i / 70;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = roadWidth / 2 + 8 + Math.random() * 50;
        const pos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * dist);

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3);
        const trunk = new THREE.Mesh(trunkGeo, pineTrunkMat);
        trunk.position.set(pos.x, pos.y + 1.5, pos.z);

        // Conifer foliage layers
        const c1Geo = new THREE.ConeGeometry(2.8, 4, 7);
        const c1 = new THREE.Mesh(c1Geo, pineNeedleMat);
        c1.position.set(pos.x, pos.y + 4.5, pos.z);

        const c2Geo = new THREE.ConeGeometry(2.0, 3.2, 7);
        const c2 = new THREE.Mesh(c2Geo, pineNeedleMat);
        c2.position.set(pos.x, pos.y + 6.8, pos.z);

        scenery.add(trunk, c1, c2);
      }

      // Distant Alpine granite rock boulders
      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = roadWidth / 2 + 35 + Math.random() * 40;
        const rPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * dist);

        const rockGeo = new THREE.DodecahedronGeometry(8 + Math.random() * 12, 1);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(rPos.x, rPos.y + 5, rPos.z);
        scenery.add(rock);
      }
    } else {
      // Dubai Desert: Golden dunes, palm trees, futuristic illuminated arch pylons
      const duneMat = new THREE.MeshStandardMaterial({
        color: 0x92400e,
        roughness: 0.9,
      });
      const archMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.3,
        metalness: 0.8,
      });
      const goldGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

      // Dunes
      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = roadWidth / 2 + 25 + Math.random() * 30;
        const dPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * dist);

        const duneGeo = new THREE.SphereGeometry(15 + Math.random() * 15, 12, 8);
        duneGeo.scale(1.8, 0.4, 1.8);
        const dune = new THREE.Mesh(duneGeo, duneMat);
        dune.position.set(dPos.x, dPos.y - 2, dPos.z);
        scenery.add(dune);
      }

      // 6 Futuristic illuminated gateway pylons over the track
      for (let i = 0; i < 6; i++) {
        const t = (i + 0.5) / 6;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const pylonGeo = new THREE.TorusGeometry(roadWidth / 2 + 3, 0.6, 8, 24, Math.PI);
        const pylon = new THREE.Mesh(pylonGeo, archMat);
        pylon.position.copy(pt);
        pylon.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
        pylon.rotateZ(Math.PI);

        // Gold light ring
        const ringGeo = new THREE.TorusGeometry(roadWidth / 2 + 3.2, 0.15, 8, 24, Math.PI);
        const ring = new THREE.Mesh(ringGeo, goldGlowMat);
        ring.position.copy(pt);
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
        ring.rotateZ(Math.PI);

        scenery.add(pylon, ring);
      }
    }

    return scenery;
  }
}
