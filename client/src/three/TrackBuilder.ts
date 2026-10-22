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

    // 1. Generate Spline Curve Points with natural elevation & sweep
    const points = this.generateTrackPoints(config.theme);
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    const length = curve.getLength();

    // 2. Realistic Road Surface with Banking, Apex Skids, and Grid Slots
    const roadMesh = this.generateRealisticRoadMesh(curve, roadWidth, config);
    trackGroup.add(roadMesh);

    // 3. 3D Raised Beveled Rumble Strips (Kerbs) on apexes
    const kerbs = this.generate3DKerbs(curve, roadWidth, config);
    trackGroup.add(kerbs);

    // 4. Realistic Armco Steel Crash Barriers & Tire Walls
    const barriers = this.generateRealisticBarriers(curve, roadWidth, config);
    trackGroup.add(barriers);

    // 5. Start Gantry & Checkered Finish Arch
    const { startGantry, lights } = this.generateStartGantry(curve, roadWidth);
    const finishArch = this.generateFinishArch(curve, roadWidth);
    trackGroup.add(startGantry, finishArch);

    // 6. Distance Marker Boards (150m, 100m, 50m) approaching curves
    const brakeBoards = this.generateDistanceBrakeBoards(curve, roadWidth);
    trackGroup.add(brakeBoards);

    // 7. Immersive Themed Environmental Scenery
    const scenery = this.generateThemeScenery(curve, roadWidth, config);
    trackGroup.add(scenery);

    return {
      curve,
      trackGroup,
      roadWidth,
      length,
      startLightMeshes: lights
    };
  }

  // --- SPLINE POINTS WITH REALISTIC RACING FLOW & ELEVATION ---
  private static generateTrackPoints(theme: 'tokyo' | 'swiss' | 'dubai'): THREE.Vector3[] {
    if (theme === 'swiss') {
      // High-altitude mountain pass with sweeping hairpins, elevation ascents & descents
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(15, 3, 110),
        new THREE.Vector3(75, 10, 210),
        new THREE.Vector3(150, 18, 260),
        new THREE.Vector3(220, 28, 230),
        new THREE.Vector3(230, 36, 140),
        new THREE.Vector3(190, 42, 40),
        new THREE.Vector3(130, 48, -50),
        new THREE.Vector3(50, 52, -140),
        new THREE.Vector3(-40, 46, -200),
        new THREE.Vector3(-140, 38, -230),
        new THREE.Vector3(-220, 28, -170),
        new THREE.Vector3(-250, 18, -80),
        new THREE.Vector3(-220, 10, 20),
        new THREE.Vector3(-150, 5, 90),
        new THREE.Vector3(-70, 2, 40),
      ];
    } else if (theme === 'dubai') {
      // Modern Grade-1 FIA grand prix layout with fast chicanes and wide parabolic sweepers
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 160),
        new THREE.Vector3(70, 1.5, 310),
        new THREE.Vector3(180, 2.5, 410),
        new THREE.Vector3(320, 1.8, 370),
        new THREE.Vector3(390, 0.5, 240),
        new THREE.Vector3(340, 2.0, 110),
        new THREE.Vector3(260, 0.5, 10),
        new THREE.Vector3(220, 0.2, -130),
        new THREE.Vector3(160, 2.2, -250),
        new THREE.Vector3(50, 1.2, -310),
        new THREE.Vector3(-90, 0.5, -270),
        new THREE.Vector3(-190, 1.5, -150),
        new THREE.Vector3(-160, 0.5, -30),
        new THREE.Vector3(-70, 0, 0),
      ];
    } else {
      // Tokyo Night Run: Elevated Shuto expressway with bridges, tunnels & urban viaducts
      return [
        new THREE.Vector3(0, 6, 0),
        new THREE.Vector3(0, 6, 130),
        new THREE.Vector3(45, 7.5, 250),
        new THREE.Vector3(120, 9.5, 330),
        new THREE.Vector3(230, 11, 350),
        new THREE.Vector3(320, 9, 270),
        new THREE.Vector3(335, 7.5, 170),
        new THREE.Vector3(265, 6, 70),
        new THREE.Vector3(230, 6.5, -30),
        new THREE.Vector3(250, 8.5, -150),
        new THREE.Vector3(195, 10.5, -250),
        new THREE.Vector3(110, 9.5, -310),
        new THREE.Vector3(5, 7.5, -290),
        new THREE.Vector3(-95, 6, -210),
        new THREE.Vector3(-145, 7, -110),
        new THREE.Vector3(-105, 6, -15),
      ];
    }
  }

  // --- REALISTIC ROAD MESH WITH CURVE BANKING & DETAILED SHADER/CANVAS ---
  private static generateRealisticRoadMesh(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Mesh {
    const numSteps = 500;
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
      let binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      // Realistic Corner Banking (tilt road into apex)
      const nextT = Math.min(1.0, t + 0.008);
      const nextTangent = curve.getTangentAt(nextT).normalize();
      const curvature = tangent.clone().cross(nextTangent).y;
      const bankAngle = THREE.MathUtils.clamp(-curvature * 12.0, -0.15, 0.15);

      // Rotate binormal slightly along tangent to bank road
      const bankedBinormal = binormal.clone().applyAxisAngle(tangent, bankAngle);
      const normal = new THREE.Vector3().crossVectors(tangent, bankedBinormal).normalize();

      // Left vertex
      const leftPos = new THREE.Vector3().copy(point).addScaledVector(bankedBinormal, -halfWidth);
      positions.push(leftPos.x, leftPos.y, leftPos.z);
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(0, t * 100);

      // Right vertex
      const rightPos = new THREE.Vector3().copy(point).addScaledVector(bankedBinormal, halfWidth);
      positions.push(rightPos.x, rightPos.y, rightPos.z);
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(1, t * 100);

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

    // High-resolution procedural texture with asphalt grain, tire skid marks, and lane markings
    const roadTexture = this.createRealisticRoadTexture(config);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 140);

    const roadMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: config.theme === 'tokyo' ? 0.28 : 0.45,
      metalness: 0.15,
    });

    const mesh = new THREE.Mesh(geometry, roadMaterial);
    mesh.receiveShadow = true;
    return mesh;
  }

  // --- PROCEDURAL REALISTIC ASPHALT & RACING ROAD TEXTURE ---
  private static createRealisticRoadTexture(config: TrackConfig): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Asphalt Base
    ctx.fillStyle = config.roadColor;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Fine Aggregate Grain Noise
    const grainCount = 6000;
    for (let i = 0; i < grainCount; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1024;
      const brightness = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)';
      ctx.fillStyle = brightness;
      ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }

    // 3. Racing Line Darkening (Rubber groove where cars repeatedly drive)
    const rubberLanes = [230, 410, 614, 794];
    rubberLanes.forEach(rx => {
      const grad = ctx.createLinearGradient(rx - 45, 0, rx + 45, 0);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(rx - 45, 0, 90, 1024);
    });

    // 4. Heavy Braking Skid Marks (Feathered rubber trails)
    ctx.fillStyle = 'rgba(10, 10, 12, 0.35)';
    for (let i = 0; i < 4; i++) {
      const sy = Math.random() * 700;
      const sx = rubberLanes[i % 4];
      ctx.fillRect(sx - 14, sy, 8, 160 + Math.random() * 80);
      ctx.fillRect(sx + 14, sy, 8, 160 + Math.random() * 80);
    }

    // 5. Outer Solid White Edge Boundaries
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(35, 0, 12, 1024);
    ctx.fillRect(1024 - 47, 0, 12, 1024);

    // 6. Realistic Dashed Lane Lines (4 Lanes, 3 Dividers)
    // Lane 1 divider (x ~ 285)
    // Center divider (x = 512, double dashed line)
    // Lane 3 divider (x ~ 739)
    const dashLength = 96;
    const gapLength = 64;
    const totalCycle = dashLength + gapLength;

    ctx.fillStyle = config.theme === 'swiss' ? '#eab308' : 'rgba(255, 255, 255, 0.85)';
    for (let y = 0; y < 1024; y += totalCycle) {
      // Lane 1/2 divider
      ctx.fillRect(288, y, 8, dashLength);
      // Center line (double bright high-visibility)
      ctx.fillRect(507, y, 5, dashLength);
      ctx.fillRect(516, y, 5, dashLength);
      // Lane 3/4 divider
      ctx.fillRect(736, y, 8, dashLength);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // --- 3D RAISED BEVELED RUMBLE STRIPS (FIA KERBS) ---
  private static generate3DKerbs(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const kerbGroup = new THREE.Group();
    const numPoints = 300;
    const halfWidth = roadWidth / 2;
    const up = new THREE.Vector3(0, 1, 0);

    const redMat = new THREE.MeshStandardMaterial({
      color: config.theme === 'tokyo' ? 0x00e5ff : 0xdc2626,
      roughness: 0.6,
      metalness: 0.1,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: config.theme === 'tokyo' ? 0x0f172a : 0xf8fafc,
      roughness: 0.6,
      metalness: 0.1,
    });

    const kerbWidth = 1.0;
    const kerbHeight = 0.14;

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      // Only place kerbs in curvy sections or alternating segments for realism
      const nextT = Math.min(1.0, t + 0.01);
      const nextTangent = curve.getTangentAt(nextT).normalize();
      const curvature = Math.abs(tangent.clone().cross(nextTangent).y);

      // Place kerbs continuously or concentrated on turns
      if (curvature > 0.003 || i % 6 < 4) {
        const mat = i % 2 === 0 ? redMat : whiteMat;
        const boxGeo = new THREE.BoxGeometry(kerbWidth, kerbHeight, (curve.getLength() / numPoints) * 1.05);

        // Left Kerb
        const leftMesh = new THREE.Mesh(boxGeo, mat);
        const leftPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, -(halfWidth + kerbWidth / 2));
        leftPos.y += kerbHeight / 2;
        leftMesh.position.copy(leftPos);
        leftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        leftMesh.receiveShadow = true;

        // Right Kerb
        const rightMesh = new THREE.Mesh(boxGeo, mat);
        const rightPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, halfWidth + kerbWidth / 2);
        rightPos.y += kerbHeight / 2;
        rightMesh.position.copy(rightPos);
        rightMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        rightMesh.receiveShadow = true;

        kerbGroup.add(leftMesh, rightMesh);
      }
    }

    return kerbGroup;
  }

  // --- REALISTIC CORRUGATED ARMCO GUARDRAILS & TIRE PACKS ---
  private static generateRealisticBarriers(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const barriersGroup = new THREE.Group();
    const numPoints = 280;
    const halfWidth = roadWidth / 2 + 1.2;
    const up = new THREE.Vector3(0, 1, 0);

    const steelMat = new THREE.MeshStandardMaterial({
      color: config.theme === 'tokyo' ? 0x1e293b : 0x94a3b8,
      roughness: 0.35,
      metalness: 0.85,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.05,
    });

    const reflectorMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber reflector cat-eyes
    });

    const leftBarrierPts: THREE.Vector3[] = [];
    const rightBarrierPts: THREE.Vector3[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      const left = new THREE.Vector3().copy(pt).addScaledVector(binormal, -halfWidth);
      left.y += 0.65;
      leftBarrierPts.push(left);

      const right = new THREE.Vector3().copy(pt).addScaledVector(binormal, halfWidth);
      right.y += 0.65;
      rightBarrierPts.push(right);

      // Galvanized I-beam vertical posts every 4 steps
      if (i % 4 === 0) {
        const postGeo = new THREE.BoxGeometry(0.18, 1.3, 0.18);
        const postLeft = new THREE.Mesh(postGeo, steelMat);
        postLeft.position.set(left.x, left.y - 0.25, left.z);

        const postRight = new THREE.Mesh(postGeo, steelMat);
        postRight.position.set(right.x, right.y - 0.25, right.z);

        barriersGroup.add(postLeft, postRight);

        // Amber reflector cat-eye on posts facing oncoming traffic
        const reflectorGeo = new THREE.BoxGeometry(0.1, 0.18, 0.05);
        const refMesh = new THREE.Mesh(reflectorGeo, reflectorMat);
        refMesh.position.set(left.x, left.y + 0.15, left.z);
        refMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        barriersGroup.add(refMesh);
      }

      // Stacked Safety Tire Walls on outer hairpins (high curvature sections)
      const nextT = Math.min(1.0, t + 0.015);
      const nextTan = curve.getTangentAt(nextT).normalize();
      const curvature = tangent.clone().cross(nextTan).y;

      if (Math.abs(curvature) > 0.007 && i % 6 === 0) {
        const side = curvature > 0 ? -1 : 1;
        const tirePos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * (halfWidth + 0.9));
        
        // Stack of 3 rubber tires
        for (let row = 0; row < 2; row++) {
          const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12);
          const tireMesh = new THREE.Mesh(tireGeo, tireMat);
          tireMesh.position.set(tirePos.x, pt.y + 0.25 + row * 0.4, tirePos.z);
          barriersGroup.add(tireMesh);
        }
      }
    }

    // Double-rail corrugated Armco tubing
    const leftRailCurve = new THREE.CatmullRomCurve3(leftBarrierPts, true);
    const rightRailCurve = new THREE.CatmullRomCurve3(rightBarrierPts, true);

    const railGeoLeft = new THREE.TubeGeometry(leftRailCurve, 280, 0.16, 8, true);
    const railGeoRight = new THREE.TubeGeometry(rightRailCurve, 280, 0.16, 8, true);

    const railMeshLeft = new THREE.Mesh(railGeoLeft, steelMat);
    const railMeshRight = new THREE.Mesh(railGeoRight, steelMat);

    barriersGroup.add(railMeshLeft, railMeshRight);
    return barriersGroup;
  }

  // --- DISTANCE BRAKE MARKERS (150m, 100m, 50m) ---
  private static generateDistanceBrakeBoards(curve: THREE.CatmullRomCurve3, roadWidth: number): THREE.Group {
    const group = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);

    // Place distance boards before key braking zones (e.g. at t = 0.22, t = 0.55, t = 0.82)
    const brakeZones = [0.22, 0.55, 0.82];
    const distances = ['150', '100', '50'];

    brakeZones.forEach(zoneT => {
      distances.forEach((distStr, idx) => {
        const t = THREE.MathUtils.clamp(zoneT - 0.03 * (idx + 1), 0.01, 0.99);
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const boardPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, -(roadWidth / 2 + 2.5));

        // Create board mesh
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(boardPos.x, boardPos.y + 1.4, boardPos.z);

        // Sign plate
        const plateGeo = new THREE.BoxGeometry(1.4, 0.9, 0.1);
        const plateCanvas = document.createElement('canvas');
        plateCanvas.width = 128;
        plateCanvas.height = 128;
        const pCtx = plateCanvas.getContext('2d')!;
        pCtx.fillStyle = '#0f172a';
        pCtx.fillRect(0, 0, 128, 128);
        pCtx.strokeStyle = '#f59e0b';
        pCtx.lineWidth = 8;
        pCtx.strokeRect(4, 4, 120, 120);
        pCtx.fillStyle = '#ffffff';
        pCtx.font = 'bold 52px monospace';
        pCtx.textAlign = 'center';
        pCtx.textBaseline = 'middle';
        pCtx.fillText(distStr, 64, 64);

        const plateTex = new THREE.CanvasTexture(plateCanvas);
        const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.set(boardPos.x, boardPos.y + 2.4, boardPos.z);
        plate.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        group.add(post, plate);
      });
    });

    return group;
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
      roughness: 0.4,
      metalness: 0.8,
    });

    const halfW = roadWidth / 2 + 1.8;
    const height = 7.0;

    // Upright pillars
    const pillarGeo = new THREE.BoxGeometry(0.9, height, 0.9);
    const leftPillar = new THREE.Mesh(pillarGeo, trussMat);
    leftPillar.position.copy(startPt).addScaledVector(binormal, -halfW);
    leftPillar.position.y += height / 2;

    const rightPillar = new THREE.Mesh(pillarGeo, trussMat);
    rightPillar.position.copy(startPt).addScaledVector(binormal, halfW);
    rightPillar.position.y += height / 2;

    // Crossbeam truss
    const beamGeo = new THREE.BoxGeometry(roadWidth + 3.6, 1.1, 1.1);
    const beam = new THREE.Mesh(beamGeo, trussMat);
    beam.position.copy(startPt);
    beam.position.y += height;
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

    // Sponsor Banner Header
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const bCtx = bannerCanvas.getContext('2d')!;
    bCtx.fillStyle = '#050608';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.fillStyle = '#00ff87';
    bCtx.font = '900 48px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('VELOCE GRAND PRIX', 256, 80);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const bannerGeo = new THREE.BoxGeometry(roadWidth - 2.0, 1.2, 0.2);
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.copy(startPt);
    banner.position.y += height + 0.9;
    banner.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

    gantry.add(leftPillar, rightPillar, beam, banner);

    // 5 Countdown Lights across the gantry
    for (let i = -2; i <= 2; i++) {
      const lightHousingGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16);
      const housingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const housing = new THREE.Mesh(lightHousingGeo, housingMat);

      const offsetPos = new THREE.Vector3()
        .copy(startPt)
        .addScaledVector(binormal, i * 2.3);
      offsetPos.y += height - 1.0;
      offsetPos.addScaledVector(tangent, -0.6);
      housing.position.copy(offsetPos);
      housing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

      const lightGeo = new THREE.SphereGeometry(0.36, 16, 16);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x220005 });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.copy(offsetPos).addScaledVector(tangent, -0.15);

      gantry.add(housing, light);
      lights.push(light);
    }

    return { startGantry: gantry, lights };
  }

  // --- FINISH ARCH & CHECKERED BANNER ---
  private static generateFinishArch(curve: THREE.CatmullRomCurve3, roadWidth: number): THREE.Group {
    const arch = new THREE.Group();
    const finishPt = curve.getPointAt(0.995);
    const tangent = curve.getTangentAt(0.995).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });

    const halfW = roadWidth / 2 + 1.5;
    const height = 7.5;

    // Posts
    const pGeo = new THREE.BoxGeometry(0.9, height, 0.9);
    const lp = new THREE.Mesh(pGeo, carbonMat);
    lp.position.copy(finishPt).addScaledVector(binormal, -halfW);
    lp.position.y += height / 2;

    const rp = new THREE.Mesh(pGeo, carbonMat);
    rp.position.copy(finishPt).addScaledVector(binormal, halfW);
    rp.position.y += height / 2;

    // Checkered Banner
    const checkCanvas = document.createElement('canvas');
    checkCanvas.width = 512;
    checkCanvas.height = 128;
    const cCtx = checkCanvas.getContext('2d')!;
    const sq = 32;
    for (let x = 0; x < 512; x += sq) {
      for (let y = 0; y < 128; y += sq) {
        cCtx.fillStyle = (x / sq + y / sq) % 2 === 0 ? '#ffffff' : '#111827';
        cCtx.fillRect(x, y, sq, sq);
      }
    }
    cCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    cCtx.fillRect(80, 28, 352, 72);
    cCtx.fillStyle = '#00ff87';
    cCtx.font = '900 44px sans-serif';
    cCtx.textAlign = 'center';
    cCtx.fillText('FINISH LINE', 256, 78);

    const checkTex = new THREE.CanvasTexture(checkCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: checkTex });
    const bannerGeo = new THREE.BoxGeometry(roadWidth + 3.0, 1.8, 0.6);
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.copy(finishPt);
    banner.position.y += height;
    banner.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

    arch.add(lp, rp, banner);
    return arch;
  }

  // --- THEMED SCENERY (TOKYO, SWISS, DUBAI) WITH PHOTOREALISTIC DETAILS ---
  private static generateThemeScenery(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const scenery = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);

    if (config.theme === 'tokyo') {
      // 1. Concrete Viaduct Piers under elevated expressway
      const pierMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.7,
        metalness: 0.2,
      });

      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        const pt = curve.getPointAt(t);
        const pierHeight = Math.max(8.0, pt.y + 12);
        const pierGeo = new THREE.CylinderGeometry(1.2, 1.4, pierHeight, 8);
        const pier = new THREE.Mesh(pierGeo, pierMat);
        pier.position.set(pt.x, pt.y - pierHeight / 2 + 0.1, pt.z);
        scenery.add(pier);
      }

      // 2. Realistic Japanese Overhead Expressway Route Direction Signs
      const shutoSigns = [
        { text: 'C1 都心環状線 SHUTO EXP', dest: '銀座 GINZA • 渋谷 SHIBUYA', exit: '出口 12' },
        { text: '11 台場線 BAYSIDE ROUTE', dest: 'レインボーブリッジ RAINBOW BRG', exit: '出口 08' },
        { text: '9 深川線 FUKAGAWA', dest: '辰巳 JCT • 湾岸線 WANGAN', exit: '出口 15' },
      ];

      shutoSigns.forEach((sign, idx) => {
        const t = (idx + 0.25) / 3;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 256;
        const sCtx = signCanvas.getContext('2d')!;

        // Japanese expressway dark green sign
        sCtx.fillStyle = '#065f46';
        sCtx.fillRect(0, 0, 512, 256);
        sCtx.strokeStyle = '#ffffff';
        sCtx.lineWidth = 8;
        sCtx.strokeRect(6, 6, 500, 244);

        sCtx.fillStyle = '#fef08a';
        sCtx.font = 'bold 36px sans-serif';
        sCtx.fillText(sign.text, 24, 60);

        sCtx.fillStyle = '#ffffff';
        sCtx.font = '32px sans-serif';
        sCtx.fillText(sign.dest, 24, 130);

        sCtx.fillStyle = '#38bdf8';
        sCtx.font = 'bold 28px sans-serif';
        sCtx.fillText(sign.exit, 24, 200);

        const signTex = new THREE.CanvasTexture(signCanvas);
        const signMat = new THREE.MeshBasicMaterial({ map: signTex });
        const signGeo = new THREE.BoxGeometry(roadWidth - 2.0, 3.2, 0.3);
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(pt.x, pt.y + 7.5, pt.z);
        signMesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

        // Sign support truss
        const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const sTrussGeo = new THREE.BoxGeometry(roadWidth + 2.0, 0.4, 0.4);
        const sTruss = new THREE.Mesh(sTrussGeo, trussMat);
        sTruss.position.set(pt.x, pt.y + 9.2, pt.z);
        sTruss.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

        scenery.add(signMesh, sTruss);
      });

      // 3. Dense Tokyo City Skyline with illuminated window matrices & aviation beacons
      const buildingMatDark = new THREE.MeshStandardMaterial({
        color: 0x090b14,
        roughness: 0.25,
        metalness: 0.85,
      });

      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 }); // Red aviation strobe

      for (let i = 0; i < 50; i++) {
        const t = (i / 50);
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = roadWidth / 2 + 28 + Math.random() * 55;
        const bPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * dist);

        const bWidth = 16 + Math.random() * 22;
        const bDepth = 16 + Math.random() * 22;
        const bHeight = 45 + Math.random() * 110;

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMesh = new THREE.Mesh(bGeo, buildingMatDark);
        bMesh.position.set(bPos.x, bHeight / 2 - 15, bPos.z);
        scenery.add(bMesh);

        // Rooftop antenna tower & red flashing strobe light
        const antennaGeo = new THREE.CylinderGeometry(0.15, 0.35, 12, 6);
        const antennaMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(bPos.x, bHeight - 15 + 6, bPos.z);

        const strobeGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const strobe = new THREE.Mesh(strobeGeo, beaconMat);
        strobe.position.set(bPos.x, bHeight - 15 + 12, bPos.z);

        scenery.add(antenna, strobe);
      }

      // 4. Curved Japanese Expressway Dual-Streetlamps
      const neonAquaMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      for (let i = 0; i < 35; i++) {
        const t = i / 35;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const lampPt = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 1.4);
        const lampPoleGeo = new THREE.CylinderGeometry(0.12, 0.16, 8.5);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
        const lamp = new THREE.Mesh(lampPoleGeo, lampMat);
        lamp.position.set(lampPt.x, lampPt.y + 4.25, lampPt.z);

        // Lamp arm arching over roadway
        const armGeo = new THREE.BoxGeometry(2.8, 0.1, 0.1);
        const arm = new THREE.Mesh(armGeo, lampMat);
        arm.position.set(lampPt.x - binormal.x * 1.2, lampPt.y + 8.4, lampPt.z - binormal.z * 1.2);
        arm.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

        const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const bulb = new THREE.Mesh(bulbGeo, neonAquaMat);
        bulb.position.set(lampPt.x - binormal.x * 2.0, lampPt.y + 8.2, lampPt.z - binormal.z * 2.0);

        scenery.add(lamp, arm, bulb);
      }

    } else if (config.theme === 'swiss') {
      // 1. Continuous Undulating Alpine Valley & Mountain Terrain
      const terrainGeo = new THREE.PlaneGeometry(800, 800, 32, 32);
      terrainGeo.rotateX(-Math.PI / 2);
      const posAttr = terrainGeo.attributes.position;
      for (let k = 0; k < posAttr.count; k++) {
        const vx = posAttr.getX(k);
        const vz = posAttr.getZ(k);
        const distFromCenter = Math.sqrt(vx * vx + vz * vz);
        // Elevate surrounding peaks higher as distance increases
        const peakHeight = Math.sin(vx * 0.015) * Math.cos(vz * 0.015) * 45 + (distFromCenter * 0.18) - 15;
        posAttr.setY(k, peakHeight);
      }
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        color: 0x1f3427, // Alpine meadow dark green
        roughness: 0.95,
        metalness: 0.05,
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.position.set(0, -10, 0);
      scenery.add(terrainMesh);

      // 2. High-Density Norwegian Spruce & Swiss Pine Forest
      const pineNeedleMat = new THREE.MeshStandardMaterial({ color: 0x143722, roughness: 0.9 });
      const snowNeedleMat = new THREE.MeshStandardMaterial({ color: 0x244a33, roughness: 0.85 });
      const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });

      for (let i = 0; i < 90; i++) {
        const t = i / 90;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = roadWidth / 2 + 10 + Math.random() * 65;
        const pos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * dist);

        const treeScale = 0.8 + Math.random() * 0.7;

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.35 * treeScale, 0.6 * treeScale, 3.5 * treeScale);
        const trunk = new THREE.Mesh(trunkGeo, pineTrunkMat);
        trunk.position.set(pos.x, pos.y + 1.75 * treeScale, pos.z);

        // 3 Tiers of Conifer Foliage
        const needleMat = i % 3 === 0 ? snowNeedleMat : pineNeedleMat;
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(3.2 * treeScale, 4.5 * treeScale, 7), needleMat);
        c1.position.set(pos.x, pos.y + 4.5 * treeScale, pos.z);

        const c2 = new THREE.Mesh(new THREE.ConeGeometry(2.3 * treeScale, 3.8 * treeScale, 7), needleMat);
        c2.position.set(pos.x, pos.y + 7.0 * treeScale, pos.z);

        const c3 = new THREE.Mesh(new THREE.ConeGeometry(1.4 * treeScale, 2.8 * treeScale, 7), needleMat);
        c3.position.set(pos.x, pos.y + 9.2 * treeScale, pos.z);

        scenery.add(trunk, c1, c2, c3);
      }

      // 3. Swiss Timber Chalets with Slate Roofs & Warm Windows
      const chaletWallMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
      const chaletRoofMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.7 });
      const warmWindowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

      for (let c = 0; c < 5; c++) {
        const t = (c + 0.3) / 5;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const chaletPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 32 + Math.random() * 15);

        // House body
        const houseGeo = new THREE.BoxGeometry(10, 6, 8);
        const house = new THREE.Mesh(houseGeo, chaletWallMat);
        house.position.set(chaletPos.x, chaletPos.y + 3, chaletPos.z);

        // Pitched roof
        const roofGeo = new THREE.ConeGeometry(8, 4.5, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeo, chaletRoofMat);
        roof.position.set(chaletPos.x, chaletPos.y + 7.5, chaletPos.z);

        // Window
        const winGeo = new THREE.BoxGeometry(1.6, 1.6, 0.2);
        const win = new THREE.Mesh(winGeo, warmWindowMat);
        win.position.set(chaletPos.x, chaletPos.y + 3.2, chaletPos.z + 4.1);

        scenery.add(house, roof, win);
      }

      // 4. Granite Alpine Rock Cliffs
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
      for (let i = 0; i < 25; i++) {
        const t = i / 25;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const rPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, (i % 2 === 0 ? 1 : -1) * (roadWidth / 2 + 38 + Math.random() * 40));
        const rockGeo = new THREE.DodecahedronGeometry(12 + Math.random() * 15, 1);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(rPos.x, rPos.y + 4, rPos.z);
        scenery.add(rock);
      }

    } else {
      // DUBAI GRAND CIRCUIT: Modern Grade-1 FIA Grand Prix look
      // 1. Turquoise & White Painted Asphalt Run-Off Zones (Yas Marina style)
      const runoffMatTurquoise = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.5 });
      const runoffMatWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });

      for (let i = 0; i < 30; i++) {
        const t = (i + 0.5) / 30;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const rPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * (roadWidth / 2 + 5.0));

        const rGeo = new THREE.BoxGeometry(7.0, 0.05, 18.0);
        const rMat = i % 2 === 0 ? runoffMatTurquoise : runoffMatWhite;
        const rMesh = new THREE.Mesh(rGeo, rMat);
        rMesh.position.set(rPos.x, pt.y + 0.02, rPos.z);
        rMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        scenery.add(rMesh);
      }

      // 2. Tall F1 Stadium Floodlight Towers (Yas Marina style high-mast towers)
      const floodlightMastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
      const floodlightBulbMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 }); // Warm intense light

      for (let i = 0; i < 18; i++) {
        const t = i / 18;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const fPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 12);

        // Mast pole
        const mastHeight = 24.0;
        const mastGeo = new THREE.CylinderGeometry(0.35, 0.6, mastHeight, 8);
        const mast = new THREE.Mesh(mastGeo, floodlightMastMat);
        mast.position.set(fPos.x, fPos.y + mastHeight / 2, fPos.z);

        // Multi-lamp floodlight head (array of 8 lamps)
        const headGeo = new THREE.BoxGeometry(4.2, 2.2, 0.6);
        const head = new THREE.Mesh(headGeo, floodlightMastMat);
        head.position.set(fPos.x, fPos.y + mastHeight, fPos.z);
        head.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

        const bulbGeo = new THREE.BoxGeometry(4.0, 2.0, 0.2);
        const bulb = new THREE.Mesh(bulbGeo, floodlightBulbMat);
        bulb.position.set(fPos.x - binormal.x * 0.35, fPos.y + mastHeight, fPos.z - binormal.z * 0.35);
        bulb.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

        scenery.add(mast, head, bulb);
      }

      // 3. Covered Main Grandstands along start straightaway
      const grandstandSeatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

      for (let g = 0; g < 3; g++) {
        const t = 0.04 + g * 0.05;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const gPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, -(roadWidth / 2 + 18));

        // Stepped seating stand
        const standGeo = new THREE.BoxGeometry(14, 6, 28);
        const stand = new THREE.Mesh(standGeo, grandstandSeatMat);
        stand.position.set(gPos.x, gPos.y + 3, gPos.z);
        stand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        // Curved fabric roof canopy
        const canopyGeo = new THREE.CylinderGeometry(16, 16, 30, 16, 1, false, 0, Math.PI / 2);
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(gPos.x, gPos.y + 11, gPos.z);
        canopy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        scenery.add(stand, canopy);
      }

      // 4. Desert Date Palms & Golden Sand Dunes
      const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const palmFrondMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
      const duneMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.95 });

      for (let p = 0; p < 45; p++) {
        const t = p / 45;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = p % 2 === 0 ? 1 : -1;
        const pPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * (roadWidth / 2 + 16 + Math.random() * 45));

        // Palm trunk with slight bend
        const pHeight = 7 + Math.random() * 4;
        const pTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, pHeight, 8), palmTrunkMat);
        pTrunk.position.set(pPos.x, pPos.y + pHeight / 2, pPos.z);

        // Fronds canopy
        const frondGeo = new THREE.ConeGeometry(4.2, 1.8, 8);
        const fronds = new THREE.Mesh(frondGeo, palmFrondMat);
        fronds.position.set(pPos.x, pPos.y + pHeight, pPos.z);

        scenery.add(pTrunk, fronds);
      }

      // Rolling sand dunes
      for (let d = 0; d < 35; d++) {
        const t = d / 35;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = d % 2 === 0 ? 1 : -1;
        const dPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * (roadWidth / 2 + 40 + Math.random() * 50));

        const duneRadius = 20 + Math.random() * 25;
        const duneGeo = new THREE.SphereGeometry(duneRadius, 14, 8);
        duneGeo.scale(1.9, 0.35, 1.9);
        const dune = new THREE.Mesh(duneGeo, duneMat);
        dune.position.set(dPos.x, dPos.y - 4, dPos.z);
        scenery.add(dune);
      }
    }

    return scenery;
  }
}
