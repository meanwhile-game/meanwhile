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
  private static generateTrackPoints(theme: TrackConfig['theme']): THREE.Vector3[] {
    if (theme === 'chennai') {
      // Chennai Marina Coast: Long seaside straight along Kamarajar Salai, coastal esses & Napier Bridge sweep
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 180),          // Seaside acceleration straightaway (Kamarajar Salai)
        new THREE.Vector3(30, 0.5, 360),      // Gentle right curve past Marina Beach sands
        new THREE.Vector3(110, 1.2, 480),     // Sweep approaching Marina Lighthouse
        new THREE.Vector3(220, 2.0, 460),     // Lighthouse turnaround curve
        new THREE.Vector3(260, 2.5, 340),     // Santhome esses entry
        new THREE.Vector3(210, 3.0, 200),     // Santhome urban chicane
        new THREE.Vector3(240, 2.8, 60),      // Fast right kink
        new THREE.Vector3(220, 3.2, -80),     // Approach to Napier Bridge
        new THREE.Vector3(150, 4.5, -200),    // Over Napier Bridge arches (elevation rise)
        new THREE.Vector3(60, 3.5, -280),     // Bridge descent
        new THREE.Vector3(-40, 1.5, -310),    // Cooum rivermouth curve
        new THREE.Vector3(-150, 0.5, -240),   // Harbor road left sweeper
        new THREE.Vector3(-170, 0.2, -110),   // Coastal return lane
        new THREE.Vector3(-120, 0, 0),        // Final corner onto Main Straight
      ];
    } else if (theme === 'hyderabad') {
      // Hyderabad Cyber Pearl: High-speed highway through HITEC City, over Durgam Cheruvu Cable Bridge
      return [
        new THREE.Vector3(0, 8, 0),           // Elevated Mindspace flyover
        new THREE.Vector3(0, 8, 160),         // High-speed IT corridor sprint
        new THREE.Vector3(60, 9.5, 300),      // Curve past Cyber Towers
        new THREE.Vector3(160, 11.0, 380),    // Cable Bridge approach
        new THREE.Vector3(290, 12.5, 350),    // Durgam Cheruvu Cable-Stayed Bridge main span
        new THREE.Vector3(380, 12.0, 230),    // Lake crossing descent
        new THREE.Vector3(360, 9.0, 90),      // Madhapur interchange sweeper
        new THREE.Vector3(280, 7.5, -20),     // Charminar gateway arch straight
        new THREE.Vector3(230, 6.0, -140),    // Technical S-curve
        new THREE.Vector3(140, 7.0, -260),    // Inorbit Mall flyover entry
        new THREE.Vector3(20, 8.5, -300),     // High-speed carousel
        new THREE.Vector3(-110, 8.0, -240),   // Knowledge City banking turn
        new THREE.Vector3(-160, 8.0, -120),   // West corridor straight
        new THREE.Vector3(-110, 8.0, -20),    // Final turn onto start gantry
      ];
    } else if (theme === 'buddh') {
      // Buddh International Circuit (BIC): Authentic Hermann Tilke F1 layout
      // Turn 1 hairpin, uphill crest to Turn 3, 1.06km parabolic back straight, banked Turn 10-11 bowl
      return [
        new THREE.Vector3(0, 0, 0),           // Start / Finish Main Straight
        new THREE.Vector3(0, 0, 150),         // Approach to Turn 1
        new THREE.Vector3(60, 1.0, 240),      // Turn 1 tight downhill hairpin
        new THREE.Vector3(120, 3.5, 290),     // Turn 2 uphill climb
        new THREE.Vector3(190, 6.5, 330),     // Turn 3 blind crest
        new THREE.Vector3(280, 5.0, 350),     // Entry to legendary 1.06km Parabolic Back Straight
        new THREE.Vector3(420, 3.0, 310),     // Back straight mid-point (highest top speeds in India)
        new THREE.Vector3(520, 1.5, 200),     // Back straight downhill compression
        new THREE.Vector3(490, 1.0, 60),      // Turn 4 heavy braking zone (hairpin)
        new THREE.Vector3(400, 2.0, -40),     // Turns 5-6 high-speed esses
        new THREE.Vector3(310, 3.5, -120),    // Turns 7-8 chicane
        new THREE.Vector3(210, 4.0, -210),    // Turn 9 sweeping downhill
        new THREE.Vector3(90, 2.5, -280),     // Approach to famous banked Parabolica (Turn 10-11)
        new THREE.Vector3(-40, 1.5, -310),    // Turn 10 multi-apex bowl
        new THREE.Vector3(-160, 2.0, -240),   // Turn 11 exit
        new THREE.Vector3(-210, 1.5, -120),   // Turns 12-14 stadium infield section
        new THREE.Vector3(-160, 0.5, -20),    // Turn 15-16 double right onto pit straight
      ];
    } else if (theme === 'monaco') {
      // Monaco Grand Prix: Harbor sweepers, swimming pool chicane, tunnel egress
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(10, 0, 130),
        new THREE.Vector3(65, 1.0, 220),
        new THREE.Vector3(140, 1.5, 260),
        new THREE.Vector3(220, 0.5, 210),
        new THREE.Vector3(240, 0.2, 100),
        new THREE.Vector3(180, 0.5, 0),
        new THREE.Vector3(160, 0.2, -110),
        new THREE.Vector3(110, 0.5, -220),
        new THREE.Vector3(10, 0.8, -260),
        new THREE.Vector3(-80, 0.5, -220),
        new THREE.Vector3(-140, 0.2, -120),
        new THREE.Vector3(-90, 0, 0),
      ];
    } else if (theme === 'silverstone') {
      // Silverstone Circuit: Copse, Maggotts, Becketts, Wellington Straight
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 180),
        new THREE.Vector3(80, 0.5, 320),
        new THREE.Vector3(190, 1.2, 400),
        new THREE.Vector3(330, 1.0, 350),
        new THREE.Vector3(380, 0.5, 210),
        new THREE.Vector3(310, 0.2, 70),
        new THREE.Vector3(220, 0.5, -80),
        new THREE.Vector3(140, 0.2, -220),
        new THREE.Vector3(20, 0.5, -300),
        new THREE.Vector3(-110, 0.8, -260),
        new THREE.Vector3(-180, 0.5, -130),
        new THREE.Vector3(-110, 0, -10),
      ];
    } else if (theme === 'swiss') {
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
    bCtx.fillText('MEANWHILE GRAND PRIX', 256, 80);

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

    if (config.theme === 'chennai') {
      // CHENNAI MARINA COAST: Bay of Bengal coast, Marina Lighthouse, Napier Bridge & Tamil signage
      // 1. Bay of Bengal Ocean Water Surface (Specular Water Reflection)
      const waterGeo = new THREE.PlaneGeometry(1200, 1200, 48, 48);
      waterGeo.rotateX(-Math.PI / 2);
      const waterPos = waterGeo.attributes.position;
      for (let k = 0; k < waterPos.count; k++) {
        const vx = waterPos.getX(k);
        const vz = waterPos.getZ(k);
        const wave = Math.sin(vx * 0.03 + vz * 0.02) * 0.8 + Math.cos(vz * 0.04) * 0.5;
        waterPos.setY(k, wave - 1.5);
      }
      waterGeo.computeVertexNormals();

      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x071e3d,
        roughness: 0.15,
        metalness: 0.85,
      });
      const ocean = new THREE.Mesh(waterGeo, waterMat);
      ocean.position.set(160, 0, 120);
      scenery.add(ocean);

      // Marina Beach Golden Sand Shoreline
      const sandGeo = new THREE.PlaneGeometry(350, 900, 16, 16);
      sandGeo.rotateX(-Math.PI / 2);
      const sandMat = new THREE.MeshStandardMaterial({ color: 0xc89b58, roughness: 0.95 });
      const beach = new THREE.Mesh(sandGeo, sandMat);
      beach.position.set(40, -0.2, 100);
      scenery.add(beach);

      // 2. Iconic Chennai Marina Lighthouse (Red & White Striped 38m Tower with Rotating Beacon)
      const lighthouseGroup = new THREE.Group();
      const lhBaseGeo = new THREE.CylinderGeometry(6, 7.5, 8, 16);
      const lhBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const lhBase = new THREE.Mesh(lhBaseGeo, lhBaseMat);
      lhBase.position.y = 4;
      lighthouseGroup.add(lhBase);

      // 4 Alternate Red and White Striped Cylinders
      for (let s = 0; s < 4; s++) {
        const segGeo = new THREE.CylinderGeometry(4.5 - s * 0.25, 4.8 - s * 0.25, 7, 16);
        const segMat = new THREE.MeshStandardMaterial({
          color: s % 2 === 0 ? 0xef4444 : 0xf8fafc,
          roughness: 0.4
        });
        const seg = new THREE.Mesh(segGeo, segMat);
        seg.position.y = 8 + s * 7 + 3.5;
        lighthouseGroup.add(seg);
      }

      // Lantern Room & Balcony
      const balconyGeo = new THREE.CylinderGeometry(5.2, 5.2, 1.2, 16);
      const balconyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const balcony = new THREE.Mesh(balconyGeo, balconyMat);
      balcony.position.y = 36.6;

      const glassGeo = new THREE.CylinderGeometry(3.6, 3.6, 4.5, 16);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.1, transparent: true, opacity: 0.75 });
      const lantern = new THREE.Mesh(glassGeo, glassMat);
      lantern.position.y = 39.2;

      // Dome Roof
      const domeGeo = new THREE.SphereGeometry(3.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.y = 41.4;

      // Rotating Spotlight Beam
      const beaconLight = new THREE.SpotLight(0x00f5ff, 4.0, 180, Math.PI / 6, 0.4, 1.0);
      beaconLight.position.set(0, 39.5, 0);
      const beaconTarget = new THREE.Object3D();
      beaconTarget.position.set(100, 39.5, 0);
      beaconLight.target = beaconTarget;
      lighthouseGroup.add(balcony, lantern, dome, beaconLight, beaconTarget);

      lighthouseGroup.position.set(130, 0, 420);
      scenery.add(lighthouseGroup);

      // 3. Napier Bridge (Bowstring Yellow Illuminated Arches over River Estuary)
      const napierPt = curve.getPointAt(0.68);
      const napierTangent = curve.getTangentAt(0.68).normalize();
      const napierBinormal = new THREE.Vector3().crossVectors(up, napierTangent).normalize();
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.copy(napierPt);

      const archMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.6,
        roughness: 0.3,
        emissive: 0xca8a04,
        emissiveIntensity: 0.25
      });

      // 4 Parallel Illuminated Bowstring Arch Ribs
      for (let a = -1; a <= 1; a += 2) {
        const archRibGeo = new THREE.TorusGeometry(18, 0.65, 12, 32, Math.PI);
        const archRib = new THREE.Mesh(archRibGeo, archMat);
        archRib.position.copy(napierBinormal).multiplyScalar(a * (roadWidth / 2 + 1.2));
        archRib.position.y += 2.0;
        archRib.rotation.y = Math.PI / 2;
        bridgeGroup.add(archRib);

        // Suspension Tie Cables
        for (let c = -4; c <= 4; c++) {
          const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 12, 6);
          const cableMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const cable = new THREE.Mesh(cableGeo, cableMat);
          cable.position.copy(napierBinormal).multiplyScalar(a * (roadWidth / 2 + 1.2));
          cable.position.x += c * 3.5;
          cable.position.y += 6.0;
          bridgeGroup.add(cable);
        }
      }
      scenery.add(bridgeGroup);

      // 4. Bilingual Tamil & English Coastal Highway Gantry Signboards
      const chennaiSigns = [
        { main: 'காமராஜர் சாலை', sub: 'KAMARAJAR SALAI (MARINA)', dest: 'சாந்தோம் SANTHOME • அண்ணா சதுக்கம் ANNA SQ' },
        { main: 'நெப்பியர் பாலம்', sub: 'NAPIER BRIDGE EXPRESSWAY', dest: 'துறைமுகம் CHENNAI PORT • மெரினா MARINA' },
      ];

      chennaiSigns.forEach((sign, idx) => {
        const t = idx === 0 ? 0.15 : 0.62;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        // NHAI Indian Highway Green Signboard
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, 496, 240);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(sign.main, 24, 65);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(sign.sub, 24, 125);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '24px sans-serif';
        ctx.fillText(sign.dest, 24, 195);

        const tex = new THREE.CanvasTexture(canvas);
        const signGeo = new THREE.BoxGeometry(roadWidth - 2.0, 3.2, 0.25);
        const signMesh = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: tex }));
        signMesh.position.set(pt.x, pt.y + 7.5, pt.z);
        signMesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

        const sTruss = new THREE.Mesh(new THREE.BoxGeometry(roadWidth + 2.0, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        sTruss.position.set(pt.x, pt.y + 9.2, pt.z);
        sTruss.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
        scenery.add(signMesh, sTruss);
      });

      // 5. Tropical Marina Beach Coastal Palm Trees & Sea-Breeze Promenade Lampposts
      const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const palmFrondMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
      const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

      for (let p = 0; p < 45; p++) {
        const t = p / 45;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const pPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, -(roadWidth / 2 + 5.0 + Math.random() * 8.0));
        const pHeight = 8.5 + Math.random() * 3.5;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, pHeight, 8), palmTrunkMat);
        trunk.position.set(pPos.x, pPos.y + pHeight / 2, pPos.z);

        const fronds = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.2, 8), palmFrondMat);
        fronds.position.set(pPos.x, pPos.y + pHeight, pPos.z);
        scenery.add(trunk, fronds);

        // Seaside Promenade Lamppost
        if (p % 2 === 0) {
          const lampPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 2.0);
          const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
          lampPole.position.set(lampPos.x, lampPos.y + 3.75, lampPos.z);

          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), cyanGlowMat);
          bulb.position.set(lampPos.x, lampPos.y + 7.5, lampPos.z);
          scenery.add(lampPole, bulb);
        }
      }

    } else if (config.theme === 'hyderabad') {
      // HYDERABAD CYBER PEARL: Durgam Cheruvu Cable-Stayed Bridge, HITEC City Towers, Charminar Arches
      // 1. Durgam Cheruvu Lake Water Surface
      const lakeGeo = new THREE.PlaneGeometry(600, 600, 24, 24);
      lakeGeo.rotateX(-Math.PI / 2);
      const lakeMat = new THREE.MeshStandardMaterial({ color: 0x090514, roughness: 0.2, metalness: 0.8 });
      const lake = new THREE.Mesh(lakeGeo, lakeMat);
      lake.position.set(280, 0, 320);
      scenery.add(lake);

      // 2. Durgam Cheruvu Cable-Stayed Suspension Bridge Pylons (48m Tower with Stay Cables)
      const pylonPt = curve.getPointAt(0.26);
      const pylonTangent = curve.getTangentAt(0.26).normalize();
      const pylonBinormal = new THREE.Vector3().crossVectors(up, pylonTangent).normalize();
      const pylonGroup = new THREE.Group();
      pylonGroup.position.copy(pylonPt);

      const pylonMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        metalness: 0.8,
        roughness: 0.25,
      });

      // Twin Inverted-Y Suspension Towers
      for (let side = -1; side <= 1; side += 2) {
        const legGeo = new THREE.CylinderGeometry(1.4, 2.2, 52, 8);
        const leg = new THREE.Mesh(legGeo, pylonMat);
        leg.position.copy(pylonBinormal).multiplyScalar(side * (roadWidth / 2 + 3.5));
        leg.position.y += 24;
        pylonGroup.add(leg);

        // Radiant Stay Cables fanning to road deck
        const cableMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        for (let c = -6; c <= 6; c++) {
          if (c === 0) continue;
          const cableGeo = new THREE.CylinderGeometry(0.06, 0.06, 32, 4);
          const cable = new THREE.Mesh(cableGeo, cableMat);
          cable.position.copy(pylonBinormal).multiplyScalar(side * (roadWidth / 2 + 1.5));
          cable.position.x += c * 4.5;
          cable.position.y += 20;
          cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(c * 0.2, 0.8, 0).normalize());
          pylonGroup.add(cable);
        }
      }
      scenery.add(pylonGroup);

      // 3. Charminar-Inspired Neo-Traditional Illuminated Gateway Arches
      const charminarPt = curve.getPointAt(0.55);
      const cTangent = curve.getTangentAt(0.55).normalize();
      const cBinormal = new THREE.Vector3().crossVectors(up, cTangent).normalize();
      const archGroup = new THREE.Group();
      archGroup.position.copy(charminarPt);

      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.6, metalness: 0.4 });
      const goldTrim = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

      // 4 Minarets (Spire Towers) on Arch Corners
      for (let mx = -1; mx <= 1; mx += 2) {
        for (let mz = -1; mz <= 1; mz += 2) {
          const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 22, 12), stoneMat);
          minaret.position.set(mx * (roadWidth / 2 + 3.0), 11, mz * 6.0);

          const minaretDome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), goldTrim);
          minaretDome.position.set(mx * (roadWidth / 2 + 3.0), 22, mz * 6.0);
          archGroup.add(minaret, minaretDome);
        }
      }

      // Grand Archway Header
      const headerGeo = new THREE.BoxGeometry(roadWidth + 7.0, 3.5, 8.0);
      const header = new THREE.Mesh(headerGeo, stoneMat);
      header.position.y = 15;
      archGroup.add(header);
      archGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), cTangent);
      scenery.add(archGroup);

      // 4. HITEC City Cyber Towers & Skyscraper Skyline
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x090514,
        roughness: 0.15,
        metalness: 0.9,
      });

      for (let b = 0; b < 45; b++) {
        const t = b / 45;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = b % 2 === 0 ? 1 : -1;
        const bPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * (roadWidth / 2 + 25 + Math.random() * 50));
        const bHeight = 40 + Math.random() * 95;
        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(18 + Math.random() * 15, bHeight, 18 + Math.random() * 15), glassMat);
        bMesh.position.set(bPos.x, bPos.y + bHeight / 2 - 10, bPos.z);
        scenery.add(bMesh);
      }

      // 5. Bilingual Telugu & English Overhead Signboards
      const hydSigns = [
        { main: 'హైటెక్ సిటీ', sub: 'HITEC CITY IT CORRIDOR', dest: 'మాదాపూర్ MADHAPUR • గచ్చిబౌలి GACHIBOWLI' },
        { main: 'దుర్గం చెరువు కేబుల్ బ్రిడ్జి', sub: 'DURGAM CHERUVU CABLE BRIDGE', dest: 'మైండ్‌స్పేస్ MINDSPACE • జూబ్లీ హిల్స్ JUBILEE HILLS' }
      ];

      hydSigns.forEach((sign, idx) => {
        const t = idx === 0 ? 0.08 : 0.45;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, 496, 240);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(sign.main, 24, 65);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(sign.sub, 24, 125);

        ctx.fillStyle = '#a855f7';
        ctx.font = '24px sans-serif';
        ctx.fillText(sign.dest, 24, 195);

        const tex = new THREE.CanvasTexture(canvas);
        const signMesh = new THREE.Mesh(new THREE.BoxGeometry(roadWidth - 2.0, 3.2, 0.25), new THREE.MeshBasicMaterial({ map: tex }));
        signMesh.position.set(pt.x, pt.y + 11.5, pt.z);
        signMesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
        scenery.add(signMesh);
      });

    } else if (config.theme === 'buddh') {
      // BUDDH INTERNATIONAL CIRCUIT (BIC): Hermann Tilke F1 Stadium Grandstands & Pit Complex
      // 1. BIC Main Stadium Grandstand with Iconic Red/White Fabric Tensile Canopies
      const grandstandSeatMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const f1CanopyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

      for (let g = 0; g < 4; g++) {
        const t = 0.03 + g * 0.04;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const gPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, -(roadWidth / 2 + 18));
        const stand = new THREE.Mesh(new THREE.BoxGeometry(16, 7, 32), grandstandSeatMat);
        stand.position.set(gPos.x, gPos.y + 3.5, gPos.z);
        stand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        const canopy = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 34, 16, 1, false, 0, Math.PI / 2), f1CanopyMat);
        canopy.position.set(gPos.x, gPos.y + 13, gPos.z);
        canopy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        scenery.add(stand, canopy);
      }

      // 2. BIC Team Pit Building (24 Pit Garages, Paddock Club & Pit Divider Wall)
      for (let p = 0; p < 3; p++) {
        const t = 0.03 + p * 0.045;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const pitPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, (roadWidth / 2 + 16));
        const pitBldg = new THREE.Mesh(new THREE.BoxGeometry(14, 8.5, 34), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }));
        pitBldg.position.set(pitPos.x, pitPos.y + 4.25, pitPos.z);
        pitBldg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        // Pit Lane Divider Wall
        const wallPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, (roadWidth / 2 + 2.5));
        const pitWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 34), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        pitWall.position.set(wallPos.x, wallPos.y + 0.7, wallPos.z);
        pitWall.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        scenery.add(pitBldg, pitWall);
      }

      // 3. 1.06km Parabolic Back Straight DRS Activation Boards & Overhead Bridge
      const drsPt = curve.getPointAt(0.28);
      const drsTangent = curve.getTangentAt(0.28).normalize();
      const drsBinormal = new THREE.Vector3().crossVectors(up, drsTangent).normalize();

      const drsCanvas = document.createElement('canvas');
      drsCanvas.width = 512;
      drsCanvas.height = 128;
      const dCtx = drsCanvas.getContext('2d')!;
      dCtx.fillStyle = '#1e293b';
      dCtx.fillRect(0, 0, 512, 128);
      dCtx.fillStyle = '#00ff87';
      dCtx.font = 'bold 44px sans-serif';
      dCtx.textAlign = 'center';
      dCtx.fillText('DRS ZONE 1 // 1.06 KM STRAIGHT', 256, 75);

      const drsTex = new THREE.CanvasTexture(drsCanvas);
      const drsMesh = new THREE.Mesh(new THREE.BoxGeometry(roadWidth - 2.0, 1.8, 0.2), new THREE.MeshBasicMaterial({ map: drsTex }));
      drsMesh.position.set(drsPt.x, drsPt.y + 7.5, drsPt.z);
      drsMesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), drsBinormal);
      scenery.add(drsMesh);

      // 4. BIC Stadium Floodlight Gantries
      for (let f = 0; f < 20; f++) {
        const t = f / 20;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const fPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 10.0);
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 22, 8), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
        mast.position.set(fPos.x, fPos.y + 11, fPos.z);

        const bulb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.2), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        bulb.position.set(fPos.x - binormal.x * 0.3, fPos.y + 22, fPos.z - binormal.z * 0.3);
        bulb.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
        scenery.add(mast, bulb);
      }

    } else if (config.theme === 'monaco') {
      // MONACO GP HARBORSIDE: Superyachts, harbor sea plane, tunnel & stone quay walls
      const seaGeo = new THREE.PlaneGeometry(800, 800, 16, 16);
      seaGeo.rotateX(-Math.PI / 2);
      const seaMat = new THREE.MeshStandardMaterial({ color: 0x03254c, roughness: 0.2, metalness: 0.8 });
      const sea = new THREE.Mesh(seaGeo, seaMat);
      sea.position.set(120, -1.0, 60);
      scenery.add(sea);

      // Luxury Mega-Yachts along the marina
      const yachtHullMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
      const yachtGlassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 });
      for (let y = 0; y < 6; y++) {
        const yPos = new THREE.Vector3(80 + y * 28, 0, 90 + Math.sin(y) * 40);
        const hull = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 24), yachtHullMat);
        hull.position.copy(yPos);
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(7, 3.2, 14), yachtGlassMat);
        cabin.position.set(yPos.x, yPos.y + 3.8, yPos.z - 2);
        scenery.add(hull, cabin);
      }

    } else if (config.theme === 'silverstone') {
      // SILVERSTONE GP: The Wing Pit Complex, British green meadow outfield & Copse banners
      const meadowGeo = new THREE.PlaneGeometry(900, 900, 16, 16);
      meadowGeo.rotateX(-Math.PI / 2);
      const meadowMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 });
      const meadow = new THREE.Mesh(meadowGeo, meadowMat);
      meadow.position.set(0, -0.2, 0);
      scenery.add(meadow);

      // The Wing Pit Building
      const wingPt = curve.getPointAt(0.05);
      const wingTangent = curve.getTangentAt(0.05).normalize();
      const wingBinormal = new THREE.Vector3().crossVectors(up, wingTangent).normalize();
      const wingPos = new THREE.Vector3().copy(wingPt).addScaledVector(wingBinormal, roadWidth / 2 + 18);
      const theWing = new THREE.Mesh(new THREE.BoxGeometry(18, 9, 65), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
      theWing.position.set(wingPos.x, wingPos.y + 4.5, wingPos.z);
      theWing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), wingTangent);
      scenery.add(theWing);

    } else if (config.theme === 'tokyo') {
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

      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

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
      const terrainGeo = new THREE.PlaneGeometry(800, 800, 32, 32);
      terrainGeo.rotateX(-Math.PI / 2);
      const posAttr = terrainGeo.attributes.position;
      for (let k = 0; k < posAttr.count; k++) {
        const vx = posAttr.getX(k);
        const vz = posAttr.getZ(k);
        const distFromCenter = Math.sqrt(vx * vx + vz * vz);
        const peakHeight = Math.sin(vx * 0.015) * Math.cos(vz * 0.015) * 45 + (distFromCenter * 0.18) - 15;
        posAttr.setY(k, peakHeight);
      }
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        color: 0x1f3427,
        roughness: 0.95,
        metalness: 0.05,
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.position.set(0, -10, 0);
      scenery.add(terrainMesh);

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

        const trunkGeo = new THREE.CylinderGeometry(0.35 * treeScale, 0.6 * treeScale, 3.5 * treeScale);
        const trunk = new THREE.Mesh(trunkGeo, pineTrunkMat);
        trunk.position.set(pos.x, pos.y + 1.75 * treeScale, pos.z);

        const needleMat = i % 3 === 0 ? snowNeedleMat : pineNeedleMat;
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(3.2 * treeScale, 4.5 * treeScale, 7), needleMat);
        c1.position.set(pos.x, pos.y + 4.5 * treeScale, pos.z);

        const c2 = new THREE.Mesh(new THREE.ConeGeometry(2.3 * treeScale, 3.8 * treeScale, 7), needleMat);
        c2.position.set(pos.x, pos.y + 7.0 * treeScale, pos.z);

        const c3 = new THREE.Mesh(new THREE.ConeGeometry(1.4 * treeScale, 2.8 * treeScale, 7), needleMat);
        c3.position.set(pos.x, pos.y + 9.2 * treeScale, pos.z);

        scenery.add(trunk, c1, c2, c3);
      }

      const chaletWallMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
      const chaletRoofMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.7 });
      const warmWindowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

      for (let c = 0; c < 5; c++) {
        const t = (c + 0.3) / 5;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const chaletPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 32 + Math.random() * 15);
        const houseGeo = new THREE.BoxGeometry(10, 6, 8);
        const house = new THREE.Mesh(houseGeo, chaletWallMat);
        house.position.set(chaletPos.x, chaletPos.y + 3, chaletPos.z);

        const roofGeo = new THREE.ConeGeometry(8, 4.5, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeo, chaletRoofMat);
        roof.position.set(chaletPos.x, chaletPos.y + 7.5, chaletPos.z);

        const winGeo = new THREE.BoxGeometry(1.6, 1.6, 0.2);
        const win = new THREE.Mesh(winGeo, warmWindowMat);
        win.position.set(chaletPos.x, chaletPos.y + 3.2, chaletPos.z + 4.1);

        scenery.add(house, roof, win);
      }

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

      const floodlightMastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
      const floodlightBulbMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

      for (let i = 0; i < 18; i++) {
        const t = i / 18;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const fPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, roadWidth / 2 + 12);
        const mastHeight = 24.0;
        const mastGeo = new THREE.CylinderGeometry(0.35, 0.6, mastHeight, 8);
        const mast = new THREE.Mesh(mastGeo, floodlightMastMat);
        mast.position.set(fPos.x, fPos.y + mastHeight / 2, fPos.z);

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

      const grandstandSeatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

      for (let g = 0; g < 3; g++) {
        const t = 0.04 + g * 0.05;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const gPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, -(roadWidth / 2 + 18));
        const stand = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 28), grandstandSeatMat);
        stand.position.set(gPos.x, gPos.y + 3, gPos.z);
        stand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        const canopy = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 30, 16, 1, false, 0, Math.PI / 2), canopyMat);
        canopy.position.set(gPos.x, gPos.y + 11, gPos.z);
        canopy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

        scenery.add(stand, canopy);
      }

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

        const pHeight = 7 + Math.random() * 4;
        const pTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, pHeight, 8), palmTrunkMat);
        pTrunk.position.set(pPos.x, pPos.y + pHeight / 2, pPos.z);

        const fronds = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.8, 8), palmFrondMat);
        fronds.position.set(pPos.x, pPos.y + pHeight, pPos.z);

        scenery.add(pTrunk, fronds);
      }

      for (let d = 0; d < 35; d++) {
        const t = d / 35;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = d % 2 === 0 ? 1 : -1;
        const dPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * (roadWidth / 2 + 40 + Math.random() * 50));

        const duneRadius = 20 + Math.random() * 25;
        const dune = new THREE.Mesh(new THREE.SphereGeometry(duneRadius, 14, 8), duneMat);
        dune.scale.set(1.9, 0.35, 1.9);
        dune.position.set(dPos.x, dPos.y - 4, dPos.z);
        scenery.add(dune);
      }
    }

    return scenery;
  }
}
