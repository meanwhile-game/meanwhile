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

    // 0. Celestial Atmospheric Sky Dome (Twilight gradient, stars, horizon skyline)
    const skyDome = this.createSkyDome(config);
    trackGroup.add(skyDome);

    // 1. Vast Motorsport Terrain / Ground Foundation
    const groundGeo = new THREE.PlaneGeometry(2400, 2400);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.98,
      metalness: 0.05
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -3.5;
    groundMesh.receiveShadow = true;
    trackGroup.add(groundMesh);

    // 2. Realistic 3D Road Surface with Solid Thickness & Viaduct Underbelly
    const roadMesh = this.generateRealisticRoadMesh(curve, roadWidth, config);
    trackGroup.add(roadMesh);

    // 3. Continuous FIA Rumble Strips (Kerbs) and Turf Runoff Shoulders
    const curbsAndRunoffs = this.generateContinuousCurbsAndRunoff(curve, roadWidth, config);
    trackGroup.add(curbsAndRunoffs);

    // 4. Realistic Armco Steel Crash Barriers & Tire Walls (along outer perimeter)
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

    // 8. Highway Street Light Poles with Conical Illuminated Light Pools on Road
    const streetLights = this.generateStreetLightsWithLightPools(curve, roadWidth, config);
    trackGroup.add(streetLights);

    // 9. Local Area Roadside Directional Signboards & Overhead Highway Gantries
    const localSigns = this.generateLocalAreaSignboardsAndGantries(curve, roadWidth, config);
    trackGroup.add(localSigns);

    return {
      curve,
      trackGroup,
      roadWidth,
      length,
      startLightMeshes: lights
    };
  }

  // --- SPLINE POINTS WITH REALISTIC RACING FLOW & STRAIGHT START/FINISH ---
  private static generateTrackPoints(theme: TrackConfig['theme']): THREE.Vector3[] {
    if (theme === 'chennai') {
      // Chennai Marina Coast: Long seaside straight along Kamarajar Salai, coastal esses & Napier Bridge sweep
      return [
        new THREE.Vector3(0, 0, 0),           // Start / Finish Line (Straight)
        new THREE.Vector3(0, 0, 180),         // Seaside acceleration straightaway (Kamarajar Salai)
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
        new THREE.Vector3(-160, 0.2, -150),   // Coastal return lane
        new THREE.Vector3(-70, 0, -140),      // Final corner entry onto main straight
        new THREE.Vector3(0, 0, -100),        // Start straightaway alignment
      ];
    } else if (theme === 'mumbai') {
      // Mumbai Sea Link Sprint: Ocean viaduct over Arabian sea, Bandra toll gate straight, Worli curve
      return [
        new THREE.Vector3(0, 4, 0),           // Start / Finish Line along Bandra reclamation
        new THREE.Vector3(0, 4, 180),         // High-speed sprint toward Sea Link toll plaza
        new THREE.Vector3(45, 6, 360),        // Ramp ascent onto Bandra-Worli Sea Link main deck
        new THREE.Vector3(130, 8.5, 490),     // Sweeping cable bridge span over Arabian Sea
        new THREE.Vector3(250, 9.0, 460),     // Ocean pylon turnaround
        new THREE.Vector3(300, 7.5, 320),     // Worli sea face descent
        new THREE.Vector3(260, 5.0, 180),     // Coastal promenade chicane
        new THREE.Vector3(280, 3.5, 40),      // Fast ocean sweep
        new THREE.Vector3(240, 2.0, -100),    // Approach to Marine Drive esses
        new THREE.Vector3(160, 1.5, -220),    // Marine Drive curve
        new THREE.Vector3(50, 1.5, -290),     // Queens Necklace return loop
        new THREE.Vector3(-60, 2.0, -300),    // Nariman Point turnaround
        new THREE.Vector3(-160, 2.5, -220),   // Harbor sweep back north
        new THREE.Vector3(-150, 3.0, -130),   // Bandra link road sweeper
        new THREE.Vector3(-60, 3.5, -120),    // Final right into start straight
        new THREE.Vector3(0, 4, -90),         // Main straight run-in
      ];
    } else if (theme === 'hyderabad') {
      // Hyderabad Cyber Pearl: High-speed highway through HITEC City, over Durgam Cheruvu Cable Bridge
      return [
        new THREE.Vector3(0, 8, 0),           // Elevated Mindspace flyover Start/Finish
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
        new THREE.Vector3(-150, 8.0, -150),   // West corridor return
        new THREE.Vector3(-70, 8.0, -140),    // Final turn entry
        new THREE.Vector3(0, 8.0, -100),      // Straightaway run-in to Start Line
      ];
    } else if (theme === 'buddh') {
      // Buddh International Circuit (BIC): Authentic Hermann Tilke F1 layout
      return [
        new THREE.Vector3(0, 0, 0),           // Start / Finish Main Straight
        new THREE.Vector3(0, 0, 160),         // Approach to Turn 1
        new THREE.Vector3(60, 1.0, 250),      // Turn 1 tight downhill hairpin
        new THREE.Vector3(120, 3.5, 300),     // Turn 2 uphill climb
        new THREE.Vector3(190, 6.5, 340),     // Turn 3 blind crest
        new THREE.Vector3(280, 5.0, 360),     // Entry to legendary 1.06km Parabolic Back Straight
        new THREE.Vector3(420, 3.0, 310),     // Back straight mid-point
        new THREE.Vector3(520, 1.5, 200),     // Back straight downhill compression
        new THREE.Vector3(490, 1.0, 60),      // Turn 4 heavy braking zone (hairpin)
        new THREE.Vector3(400, 2.0, -40),     // Turns 5-6 high-speed esses
        new THREE.Vector3(310, 3.5, -120),    // Turns 7-8 chicane
        new THREE.Vector3(210, 4.0, -210),    // Turn 9 sweeping downhill
        new THREE.Vector3(90, 2.5, -280),     // Approach to famous banked Parabolica
        new THREE.Vector3(-40, 1.5, -310),    // Turn 10 multi-apex bowl
        new THREE.Vector3(-160, 2.0, -240),   // Turn 11 exit
        new THREE.Vector3(-180, 1.5, -150),   // Turns 12-14 stadium infield section
        new THREE.Vector3(-80, 0.5, -140),    // Turn 15-16 double right onto pit straight
        new THREE.Vector3(0, 0, -90),         // Straightaway run-in to Start Line
      ];
    } else if (theme === 'monaco') {
      // Monaco Grand Prix: Harbor sweepers, swimming pool chicane, tunnel egress
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 140),
        new THREE.Vector3(65, 1.0, 230),
        new THREE.Vector3(140, 1.5, 270),
        new THREE.Vector3(220, 0.5, 210),
        new THREE.Vector3(240, 0.2, 100),
        new THREE.Vector3(180, 0.5, 0),
        new THREE.Vector3(160, 0.2, -110),
        new THREE.Vector3(110, 0.5, -220),
        new THREE.Vector3(10, 0.8, -260),
        new THREE.Vector3(-80, 0.5, -220),
        new THREE.Vector3(-140, 0.2, -150),
        new THREE.Vector3(-70, 0, -140),
        new THREE.Vector3(0, 0, -90),
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
        new THREE.Vector3(-170, 0.5, -160),
        new THREE.Vector3(-70, 0, -140),
        new THREE.Vector3(0, 0, -90),
      ];
    } else if (theme === 'swiss') {
      // High-altitude mountain pass with sweeping hairpins, elevation ascents & descents
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 140),
        new THREE.Vector3(65, 8, 230),
        new THREE.Vector3(150, 18, 260),
        new THREE.Vector3(220, 28, 230),
        new THREE.Vector3(230, 36, 140),
        new THREE.Vector3(190, 42, 40),
        new THREE.Vector3(130, 48, -50),
        new THREE.Vector3(50, 52, -140),
        new THREE.Vector3(-40, 46, -200),
        new THREE.Vector3(-140, 38, -230),
        new THREE.Vector3(-220, 28, -170),
        new THREE.Vector3(-240, 18, -120),
        new THREE.Vector3(-160, 8, -150),
        new THREE.Vector3(-70, 2, -120),
        new THREE.Vector3(0, 0, -80),
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
        new THREE.Vector3(-180, 1.5, -170),
        new THREE.Vector3(-80, 0.5, -140),
        new THREE.Vector3(0, 0, -90),
      ];
    } else {
      // Tokyo Night Run: Elevated Shuto expressway with bridges, tunnels & urban viaducts
      return [
        new THREE.Vector3(0, 0, 0),           // Main Start/Finish Straight (Ground level / Viaduct start)
        new THREE.Vector3(0, 0, 160),         // High-speed expressway sprint
        new THREE.Vector3(45, 1.5, 280),      // Sweeping right past neon towers
        new THREE.Vector3(120, 3.5, 360),     // Elevated viaduct rise
        new THREE.Vector3(230, 4.5, 370),     // Tokyo bay turnaround
        new THREE.Vector3(320, 3.5, 280),     // Rainbow bridge approach
        new THREE.Vector3(335, 2.5, 180),     // Waterfront curve
        new THREE.Vector3(265, 1.5, 70),      // Ginza interchange
        new THREE.Vector3(230, 1.0, -30),     // Shinjuku tunnel entry
        new THREE.Vector3(250, 2.0, -150),    // Viaduct elevation
        new THREE.Vector3(195, 3.0, -250),    // High curve
        new THREE.Vector3(110, 2.5, -310),    // Carousel
        new THREE.Vector3(5, 1.5, -290),      // Return descent
        new THREE.Vector3(-95, 0.5, -210),    // West expressway
        new THREE.Vector3(-145, 0.2, -140),   // Final turn entry
        new THREE.Vector3(-60, 0, -150),      // Corner exit onto main straight
        new THREE.Vector3(0, 0, -100),        // Straightaway run-in to Start Line
      ];
    }
  }

  // --- 0. CELESTIAL ATMOSPHERIC SKY DOME WITH HORIZON GLOW & STARS ---
  private static createSkyDome(config: TrackConfig): THREE.Mesh {
    const skyGeo = new THREE.SphereGeometry(850, 48, 32);
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Vertical Atmospheric Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    if (config.theme === 'tokyo') {
      grad.addColorStop(0.0, '#02040a');
      grad.addColorStop(0.45, '#070d1e');
      grad.addColorStop(0.72, '#0c2340');
      grad.addColorStop(0.88, '#1e1b4b');
      grad.addColorStop(0.96, '#00e5ff');
      grad.addColorStop(1.0, '#070913');
    } else if (config.theme === 'chennai') {
      grad.addColorStop(0.0, '#020611');
      grad.addColorStop(0.50, '#08172e');
      grad.addColorStop(0.75, '#0f2b48');
      grad.addColorStop(0.90, '#1e3a8a');
      grad.addColorStop(0.97, '#0284c7');
      grad.addColorStop(1.0, '#060d19');
    } else if (config.theme === 'hyderabad') {
      grad.addColorStop(0.0, '#03020c');
      grad.addColorStop(0.45, '#0c0721');
      grad.addColorStop(0.72, '#1e133e');
      grad.addColorStop(0.88, '#4a154b');
      grad.addColorStop(0.96, '#a855f7');
      grad.addColorStop(1.0, '#0b081e');
    } else if (config.theme === 'buddh') {
      grad.addColorStop(0.0, '#030712');
      grad.addColorStop(0.48, '#0b1528');
      grad.addColorStop(0.76, '#1e293b');
      grad.addColorStop(0.90, '#334155');
      grad.addColorStop(0.97, '#f59e0b');
      grad.addColorStop(1.0, '#0f172a');
    } else if (config.theme === 'swiss') {
      grad.addColorStop(0.0, '#020611');
      grad.addColorStop(0.48, '#071829');
      grad.addColorStop(0.76, '#0f344d');
      grad.addColorStop(0.90, '#1b5275');
      grad.addColorStop(0.97, '#38bdf8');
      grad.addColorStop(1.0, '#061320');
    } else {
      grad.addColorStop(0.0, '#030712');
      grad.addColorStop(0.50, '#0a192f');
      grad.addColorStop(0.78, '#143152');
      grad.addColorStop(0.92, '#1e40af');
      grad.addColorStop(0.98, '#38bdf8');
      grad.addColorStop(1.0, '#080e1a');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Stars in the celestial dome
    ctx.fillStyle = '#ffffff';
    for (let s = 0; s < 700; s++) {
      const sx = Math.random() * 2048;
      const sy = Math.random() * 600;
      const rad = Math.random() * 1.5 + 0.4;
      ctx.globalAlpha = Math.random() * 0.7 + 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Distant skyline silhouette along the horizon
    ctx.fillStyle = 'rgba(5, 8, 18, 0.96)';
    let curX = 0;
    while (curX < 2048) {
      const bWidth = 20 + Math.random() * 45;
      const bHeight = 35 + Math.random() * 95;
      ctx.fillRect(curX, 980 - bHeight, bWidth, bHeight + 50);
      curX += bWidth + 2;
    }

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false
    });
    return new THREE.Mesh(skyGeo, skyMat);
  }

  // --- REALISTIC ROAD MESH WITH SOLID THICKNESS & CONCRETE UNDERBELLY ---
  private static generateRealisticRoadMesh(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const roadGroup = new THREE.Group();
    const numSteps = 600;
    const halfWidth = roadWidth / 2;
    const up = new THREE.Vector3(0, 1, 0);

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Viaduct underside & barrier side walls
    const deckPositions: number[] = [];
    const deckIndices: number[] = [];

    for (let i = 0; i <= numSteps; i++) {
      const stepIdx = i % numSteps;
      const t = stepIdx / numSteps;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      // Gentle banking into corners
      const nextT = (stepIdx + 4) % numSteps / numSteps;
      const nextTangent = curve.getTangentAt(nextT).normalize();
      const curvature = tangent.clone().cross(nextTangent).y;
      const bankAngle = THREE.MathUtils.clamp(-curvature * 10.0, -0.12, 0.12);
      const bankedBinormal = binormal.clone().applyAxisAngle(tangent, bankAngle);

      // Road Surface Left and Right
      const leftPos = point.clone().addScaledVector(bankedBinormal, -halfWidth);
      const rightPos = point.clone().addScaledVector(bankedBinormal, halfWidth);

      positions.push(leftPos.x, leftPos.y, leftPos.z);
      positions.push(rightPos.x, rightPos.y, rightPos.z);
      uvs.push(0, t);
      uvs.push(1, t);

      // Road Viaduct Underside (dropped by 0.45m)
      const deckLeft = leftPos.clone();
      deckLeft.y -= 0.45;
      const deckRight = rightPos.clone();
      deckRight.y -= 0.45;

      // 4 deck vertices per cross section: leftTop, leftBottom, rightBottom, rightTop
      deckPositions.push(leftPos.x, leftPos.y, leftPos.z);
      deckPositions.push(deckLeft.x, deckLeft.y, deckLeft.z);
      deckPositions.push(deckRight.x, deckRight.y, deckRight.z);
      deckPositions.push(rightPos.x, rightPos.y, rightPos.z);

      if (i < numSteps) {
        const v1 = i * 2;
        const v2 = i * 2 + 1;
        const v3 = (i + 1) * 2;
        const v4 = (i + 1) * 2 + 1;

        indices.push(v1, v3, v2);
        indices.push(v2, v3, v4);

        // Deck side skirts and bottom
        const dBase = i * 4;
        const dNext = (i + 1) * 4;
        // Left side skirt
        deckIndices.push(dBase, dNext, dBase + 1);
        deckIndices.push(dBase + 1, dNext, dNext + 1);
        // Bottom deck
        deckIndices.push(dBase + 1, dNext + 1, dBase + 2);
        deckIndices.push(dBase + 2, dNext + 1, dNext + 2);
        // Right side skirt
        deckIndices.push(dBase + 2, dNext + 2, dBase + 3);
        deckIndices.push(dBase + 3, dNext + 2, dNext + 3);
      }
    }

    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadTextures = this.createRealisticRoadTexture(config);
    roadTextures.map.wrapS = THREE.RepeatWrapping;
    roadTextures.map.wrapT = THREE.RepeatWrapping;
    roadTextures.map.repeat.set(1, 110);

    roadTextures.bumpMap.wrapS = THREE.RepeatWrapping;
    roadTextures.bumpMap.wrapT = THREE.RepeatWrapping;
    roadTextures.bumpMap.repeat.set(1, 110);

    const roadMaterial = new THREE.MeshStandardMaterial({
      map: roadTextures.map,
      bumpMap: roadTextures.bumpMap,
      bumpScale: 0.042,
      roughness: 0.58,
      metalness: 0.10,
      side: THREE.DoubleSide
    });

    const roadMesh = new THREE.Mesh(roadGeo, roadMaterial);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Concrete Deck Underbody
    const deckGeo = new THREE.BufferGeometry();
    deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(deckPositions, 3));
    deckGeo.setIndex(deckIndices);
    deckGeo.computeVertexNormals();
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.2
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.receiveShadow = true;
    roadGroup.add(deckMesh);

    return roadGroup;
  }

  // --- CONTINUOUS FIA RUMBLE STRIPS (KERBS) & TURF RUNOFF SHOULDERS ---
  private static generateContinuousCurbsAndRunoff(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const group = new THREE.Group();
    const numSteps = 600;
    const halfWidth = roadWidth / 2;
    const curbWidth = 1.2;
    const runoffWidth = 5.2;
    const up = new THREE.Vector3(0, 1, 0);

    // 1. Procedural Red & White Kerb Texture
    const kerbCanvas = document.createElement('canvas');
    kerbCanvas.width = 128;
    kerbCanvas.height = 256;
    const kCtx = kerbCanvas.getContext('2d')!;
    const isIndian = config.theme === 'chennai' || config.theme === 'hyderabad' || config.theme === 'buddh';
    const cColor1 = isIndian ? '#f59e0b' : (config.theme === 'tokyo' ? '#00e5ff' : '#dc2626');
    const cColor2 = config.theme === 'tokyo' ? '#0f172a' : '#f8fafc';
    kCtx.fillStyle = cColor1;
    kCtx.fillRect(0, 0, 128, 128);
    kCtx.fillStyle = cColor2;
    kCtx.fillRect(0, 128, 128, 128);

    const kerbTex = new THREE.CanvasTexture(kerbCanvas);
    kerbTex.wrapS = THREE.RepeatWrapping;
    kerbTex.wrapT = THREE.RepeatWrapping;
    kerbTex.repeat.set(1, 120);

    const kerbMat = new THREE.MeshStandardMaterial({
      map: kerbTex,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // 2. Procedural AstroTurf / Runoff Gravel Texture
    const turfCanvas = document.createElement('canvas');
    turfCanvas.width = 256;
    turfCanvas.height = 256;
    const tCtx = turfCanvas.getContext('2d')!;
    const turfBase = config.theme === 'swiss' ? '#143722' : (isIndian ? '#1b2c21' : '#111c16');
    tCtx.fillStyle = turfBase;
    tCtx.fillRect(0, 0, 256, 256);
    for (let g = 0; g < 2000; g++) {
      tCtx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(0, 0, 0, 0.12)';
      tCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const turfTex = new THREE.CanvasTexture(turfCanvas);
    turfTex.wrapS = THREE.RepeatWrapping;
    turfTex.wrapT = THREE.RepeatWrapping;
    turfTex.repeat.set(2, 80);

    const turfMat = new THREE.MeshStandardMaterial({
      map: turfTex,
      roughness: 0.9,
      metalness: 0.04,
      side: THREE.DoubleSide
    });

    // Kerbs Ribbon (Left & Right)
    const kPos: number[] = [];
    const kUvs: number[] = [];
    const kIdx: number[] = [];

    // Runoff Ribbon (Left & Right)
    const rPos: number[] = [];
    const rUvs: number[] = [];
    const rIdx: number[] = [];

    for (let i = 0; i <= numSteps; i++) {
      const stepIdx = i % numSteps;
      const t = stepIdx / numSteps;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      // Left curb: outer edge at -(halfWidth + curbWidth), inner edge at -halfWidth
      const kLeftOuter = point.clone().addScaledVector(binormal, -(halfWidth + curbWidth));
      kLeftOuter.y += 0.04;
      const kLeftInner = point.clone().addScaledVector(binormal, -halfWidth);
      kLeftInner.y += 0.01;

      // Right curb: inner edge at +halfWidth, outer edge at +(halfWidth + curbWidth)
      const kRightInner = point.clone().addScaledVector(binormal, halfWidth);
      kRightInner.y += 0.01;
      const kRightOuter = point.clone().addScaledVector(binormal, halfWidth + curbWidth);
      kRightOuter.y += 0.04;

      // Left runoff: outer edge at -(halfWidth + curbWidth + runoffWidth), inner edge at -(halfWidth + curbWidth)
      const rLeftOuter = point.clone().addScaledVector(binormal, -(halfWidth + curbWidth + runoffWidth));
      rLeftOuter.y -= 0.02;
      const rLeftInner = kLeftOuter.clone();

      // Right runoff: inner edge at +(halfWidth + curbWidth), outer edge at +(halfWidth + curbWidth + runoffWidth)
      const rRightInner = kRightOuter.clone();
      const rRightOuter = point.clone().addScaledVector(binormal, halfWidth + curbWidth + runoffWidth);
      rRightOuter.y -= 0.02;

      // Left Kerb vertices (0, 1) & Right Kerb vertices (2, 3)
      kPos.push(kLeftOuter.x, kLeftOuter.y, kLeftOuter.z);
      kPos.push(kLeftInner.x, kLeftInner.y, kLeftInner.z);
      kUvs.push(0, t);
      kUvs.push(1, t);

      kPos.push(kRightInner.x, kRightInner.y, kRightInner.z);
      kPos.push(kRightOuter.x, kRightOuter.y, kRightOuter.z);
      kUvs.push(0, t);
      kUvs.push(1, t);

      // Left Runoff vertices (0, 1) & Right Runoff vertices (2, 3)
      rPos.push(rLeftOuter.x, rLeftOuter.y, rLeftOuter.z);
      rPos.push(rLeftInner.x, rLeftInner.y, rLeftInner.z);
      rUvs.push(0, t);
      rUvs.push(1, t);

      rPos.push(rRightInner.x, rRightInner.y, rRightInner.z);
      rPos.push(rRightOuter.x, rRightOuter.y, rRightOuter.z);
      rUvs.push(0, t);
      rUvs.push(1, t);

      if (i < numSteps) {
        // Left kerb indices
        const baseK = i * 4;
        const nextK = (i + 1) * 4;
        kIdx.push(baseK, baseK + 1, nextK);
        kIdx.push(baseK + 1, nextK + 1, nextK);

        // Right kerb indices
        kIdx.push(baseK + 2, baseK + 3, nextK + 2);
        kIdx.push(baseK + 3, nextK + 3, nextK + 2);

        // Left runoff indices
        const baseR = i * 4;
        const nextR = (i + 1) * 4;
        rIdx.push(baseR, baseR + 1, nextR);
        rIdx.push(baseR + 1, nextR + 1, nextR);

        // Right runoff indices
        rIdx.push(baseR + 2, baseR + 3, nextR + 2);
        rIdx.push(baseR + 3, nextR + 3, nextR + 2);
      }
    }

    const kerbGeo = new THREE.BufferGeometry();
    kerbGeo.setAttribute('position', new THREE.Float32BufferAttribute(kPos, 3));
    kerbGeo.setAttribute('uv', new THREE.Float32BufferAttribute(kUvs, 2));
    kerbGeo.setIndex(kIdx);
    kerbGeo.computeVertexNormals();
    const kerbMesh = new THREE.Mesh(kerbGeo, kerbMat);
    kerbMesh.receiveShadow = true;

    const runoffGeo = new THREE.BufferGeometry();
    runoffGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
    runoffGeo.setAttribute('uv', new THREE.Float32BufferAttribute(rUvs, 2));
    runoffGeo.setIndex(rIdx);
    runoffGeo.computeVertexNormals();
    const runoffMesh = new THREE.Mesh(runoffGeo, turfMat);
    runoffMesh.receiveShadow = true;

    group.add(kerbMesh, runoffMesh);
    return group;
  }

  // --- PROCEDURAL PUBG / FREE FIRE REALISTIC ROAD TEXTURE & BUMP SYSTEM ---
  private static createRealisticRoadTexture(config: TrackConfig): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
    const W = 2048;
    const H = 1024;

    // 1. Color Map Canvas
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // 2. Bump Map Canvas
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = W;
    bumpCanvas.height = H;
    const bCtx = bumpCanvas.getContext('2d')!;

    // Base asphalt tone - weathered tactical dark tarmac (PUBG / Free Fire battleground asphalt)
    const baseColor = config.roadColor || '#151821';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, W, H);

    bCtx.fillStyle = '#808080'; // Neutral 50% grey for bump map
    bCtx.fillRect(0, 0, W, H);

    // Weathered Asphalt Tonal Gradient / Road Crown (slight crowning curve in center)
    const crownGrad = ctx.createLinearGradient(0, 0, W, 0);
    crownGrad.addColorStop(0, 'rgba(30, 24, 18, 0.45)'); // dusty shoulder
    crownGrad.addColorStop(0.04, 'rgba(0, 0, 0, 0.15)');
    crownGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)'); // slight center crown highlight
    crownGrad.addColorStop(0.96, 'rgba(0, 0, 0, 0.15)');
    crownGrad.addColorStop(1, 'rgba(30, 24, 18, 0.45)');
    ctx.fillStyle = crownGrad;
    ctx.fillRect(0, 0, W, H);

    // High-Density Crushed Aggregate Stone Noise (18,000 multi-tone gravel particles)
    for (let i = 0; i < 18000; i++) {
      const rx = Math.random() * W;
      const ry = Math.random() * H;
      const size = Math.random() * 2.2 + 0.8;
      const rnd = Math.random();

      // Diffuse color noise
      if (rnd > 0.65) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        bCtx.fillStyle = 'rgba(255, 255, 255, 0.22)'; // bump highlight
      } else if (rnd > 0.3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        bCtx.fillStyle = 'rgba(0, 0, 0, 0.25)'; // bump depression
      } else {
        ctx.fillStyle = 'rgba(180, 160, 130, 0.05)'; // gravel stone tint
        bCtx.fillStyle = 'rgba(200, 200, 200, 0.15)';
      }
      ctx.fillRect(rx, ry, size, size);
      bCtx.fillRect(rx, ry, size, size);
    }

    // PUBG / Free Fire Signature: Dual Tire Wear Grooves for all 4 lanes
    // Center positions for the 4 lanes across width W (2048):
    // Lane 0: ~340, Lane 1: ~790, Lane 2: ~1250, Lane 3: ~1700
    const laneCenters = [340, 790, 1250, 1700];
    const wheelHalfWidth = 110; // distance from lane center to each tire track

    laneCenters.forEach(cx => {
      const leftTire = cx - wheelHalfWidth;
      const rightTire = cx + wheelHalfWidth;

      [leftTire, rightTire].forEach(tx => {
        // Dark polished rubber rut
        const rutGrad = ctx.createLinearGradient(tx - 45, 0, tx + 45, 0);
        rutGrad.addColorStop(0, 'rgba(5, 7, 10, 0)');
        rutGrad.addColorStop(0.3, 'rgba(5, 7, 10, 0.42)');
        rutGrad.addColorStop(0.5, 'rgba(5, 7, 10, 0.55)');
        rutGrad.addColorStop(0.7, 'rgba(5, 7, 10, 0.42)');
        rutGrad.addColorStop(1, 'rgba(5, 7, 10, 0)');
        ctx.fillStyle = rutGrad;
        ctx.fillRect(tx - 45, 0, 90, H);

        // Smooth polished rut in bump map
        const bRut = bCtx.createLinearGradient(tx - 45, 0, tx + 45, 0);
        bRut.addColorStop(0, 'rgba(128, 128, 128, 0)');
        bRut.addColorStop(0.5, 'rgba(100, 100, 100, 0.25)'); // slightly lower depression
        bRut.addColorStop(1, 'rgba(128, 128, 128, 0)');
        bCtx.fillStyle = bRut;
        bCtx.fillRect(tx - 45, 0, 90, H);
      });

      // Subtle center oil drip / grime streak between tires
      const oilGrad = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0);
      oilGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      oilGrad.addColorStop(0.5, 'rgba(8, 10, 14, 0.22)');
      oilGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = oilGrad;
      ctx.fillRect(cx - 30, 0, 60, H);
    });

    // Realistic Battleground Asphalt Hairline Fracture Cracks
    ctx.strokeStyle = 'rgba(6, 8, 12, 0.65)';
    ctx.lineWidth = 1.6;
    bCtx.strokeStyle = 'rgba(20, 20, 20, 0.8)';
    bCtx.lineWidth = 2.0;

    const crackCount = 7;
    for (let c = 0; c < crackCount; c++) {
      let x = Math.random() * (W - 200) + 100;
      let y = Math.random() * (H - 200) + 100;
      ctx.beginPath();
      bCtx.beginPath();
      ctx.moveTo(x, y);
      bCtx.moveTo(x, y);

      const segments = Math.floor(Math.random() * 5 + 4);
      for (let s = 0; s < segments; s++) {
        x += (Math.random() - 0.5) * 60;
        y += Math.random() * 45 + 15;
        ctx.lineTo(x, y);
        bCtx.lineTo(x, y);
      }
      ctx.stroke();
      bCtx.stroke();
    }

    // Heavy High-Speed Vehicle Skid Marks (Battlefield tire locks & drift marks)
    ctx.fillStyle = 'rgba(8, 10, 14, 0.55)';
    for (let k = 0; k < 6; k++) {
      const laneIdx = k % 4;
      const baseCenter = laneCenters[laneIdx];
      const isLeft = Math.random() > 0.5;
      const sx = baseCenter + (isLeft ? -wheelHalfWidth : wheelHalfWidth);
      const sy = Math.random() * 600;
      const len = 140 + Math.random() * 180;
      const width = 16 + Math.random() * 8;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((Math.random() - 0.5) * 0.08); // subtle drift curve
      ctx.fillRect(-width / 2, 0, width, len);
      ctx.restore();
    }

    // Weathered Painted Markings (Chipped, stippled edges, asphalt bleed)
    const isIndianTrack = config.theme === 'chennai' || config.theme === 'hyderabad' || config.theme === 'buddh';
    const centerColor = isIndianTrack ? '#f59e0b' : '#f8fafc';
    const dashColor = 'rgba(240, 244, 250, 0.90)';

    // Solid Outer Road Boundary Stripes (with weathered edge erosion)
    const edgeOffset = 80;
    const edgeWidth = 22;

    [edgeOffset, W - edgeOffset - edgeWidth].forEach(x => {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x, 0, edgeWidth, H);

      // Chipped paint wear along edges
      for (let y = 0; y < H; y += 4) {
        if (Math.random() > 0.6) {
          ctx.fillStyle = baseColor;
          ctx.fillRect(x + (Math.random() > 0.5 ? 0 : edgeWidth - 4), y, 4, 3);
        }
      }
    });

    // Center Double Line (Separating Lane 1 and 2)
    const centerX = W / 2; // 1024
    const doubleWidth = 10;
    const doubleGap = 16;

    if (isIndianTrack) {
      // Continuous double yellow with subtle battle wear
      ctx.fillStyle = centerColor;
      ctx.fillRect(centerX - doubleGap / 2 - doubleWidth, 0, doubleWidth, H);
      ctx.fillRect(centerX + doubleGap / 2, 0, doubleWidth, H);
    } else {
      // Heavy double dash
      const cDash = 110;
      const cGap = 65;
      const cCycle = cDash + cGap;
      ctx.fillStyle = centerColor;
      for (let y = 0; y < H; y += cCycle) {
        ctx.fillRect(centerX - doubleGap / 2 - doubleWidth, y, doubleWidth, cDash);
        ctx.fillRect(centerX + doubleGap / 2, y, doubleWidth, cDash);
      }
    }

    // Lane Dividers (Dashed stripes between 0-1 and 2-3)
    // Divider 0-1 at x ~ 565, Divider 2-3 at x ~ 1475
    const laneDividers = [565, 1475];
    const lDash = 105;
    const lGap = 75;
    const lCycle = lDash + lGap;
    ctx.fillStyle = dashColor;

    laneDividers.forEach(divX => {
      for (let y = 0; y < H; y += lCycle) {
        ctx.fillRect(divX - 6, y, 12, lDash);
        // Paint weathering micro-scuffs
        if (Math.random() > 0.5) {
          ctx.fillStyle = baseColor;
          ctx.fillRect(divX - 6, y + Math.random() * lDash, 4, 3);
          ctx.fillStyle = dashColor;
        }
      }
    });

    // Outer Dust / Shoulder Bleed
    const leftDust = ctx.createLinearGradient(0, 0, 70, 0);
    leftDust.addColorStop(0, 'rgba(55, 45, 30, 0.45)');
    leftDust.addColorStop(1, 'rgba(55, 45, 30, 0)');
    ctx.fillStyle = leftDust;
    ctx.fillRect(0, 0, 70, H);

    const rightDust = ctx.createLinearGradient(W, 0, W - 70, 0);
    rightDust.addColorStop(0, 'rgba(55, 45, 30, 0.45)');
    rightDust.addColorStop(1, 'rgba(55, 45, 30, 0)');
    ctx.fillStyle = rightDust;
    ctx.fillRect(W - 70, 0, 70, H);

    const map = new THREE.CanvasTexture(canvas);
    const bumpMap = new THREE.CanvasTexture(bumpCanvas);

    return { map, bumpMap };
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
    const halfWidth = roadWidth / 2 + 6.4;
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

    const gantryT = 0.022;
    const startPt = curve.getPointAt(gantryT);
    const tangent = curve.getTangentAt(gantryT).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.8,
    });

    const halfW = roadWidth / 2 + 3.5;
    const height = 7.5;

    // Upright pillars (set wide so camera and racers never clip)
    const pillarGeo = new THREE.BoxGeometry(0.9, height, 0.9);
    const leftPillar = new THREE.Mesh(pillarGeo, trussMat);
    leftPillar.position.copy(startPt).addScaledVector(binormal, -halfW);
    leftPillar.position.y += height / 2;

    const rightPillar = new THREE.Mesh(pillarGeo, trussMat);
    rightPillar.position.copy(startPt).addScaledVector(binormal, halfW);
    rightPillar.position.y += height / 2;

    // Crossbeam truss
    const beamGeo = new THREE.BoxGeometry(roadWidth + 7.0, 1.1, 1.1);
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
    const finishPt = curve.getPointAt(0.95);
    const tangent = curve.getTangentAt(0.95).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });

    const halfW = roadWidth / 2 + 5.5;
    const height = 8.8;

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
    const bannerGeo = new THREE.BoxGeometry(roadWidth + 11.0, 1.8, 0.6);
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.copy(finishPt);
    banner.position.y += height;
    banner.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);

    arch.add(lp, rp, banner);
    return arch;
  }

  // Verify that an arbitrary world position is completely clear of all track road ribbons
  private static isPositionSafeFromTrack(
    pos: THREE.Vector3,
    curve: THREE.CatmullRomCurve3,
    minDistance: number
  ): boolean {
    const samples = 140;
    const minDistSq = minDistance * minDistance;
    for (let s = 0; s < samples; s++) {
      const pt = curve.getPointAt(s / samples);
      const dx = pt.x - pos.x;
      const dz = pt.z - pos.z;
      if (dx * dx + dz * dz < minDistSq) {
        return false;
      }
    }
    return true;
  }

  // --- THEMED SCENERY (TOKYO, SWISS, DUBAI) WITH PHOTOREALISTIC DETAILS ---
  private static generateThemeScenery(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const scenery = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);

    if (config.theme === 'chennai' || config.theme === 'mumbai') {
      // CHENNAI & MUMBAI COASTAL CIRCUITS: Bay of Bengal & Arabian Sea coast, promenades, bridges, lighthouses
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

      // Marina Beach Golden Sand Shoreline (along the coast toward Bay of Bengal)
      const sandGeo = new THREE.PlaneGeometry(220, 850, 16, 16);
      sandGeo.rotateX(-Math.PI / 2);
      const sandMat = new THREE.MeshStandardMaterial({
        color: 0x9a6b32,
        roughness: 0.98,
        metalness: 0.02
      });
      const beach = new THREE.Mesh(sandGeo, sandMat);
      beach.position.set(110, -0.4, 120);
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
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.75,
      });

      for (let b = 0; b < 45; b++) {
        const t = b / 45;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = b % 2 === 0 ? 1 : -1;
        const bPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * (roadWidth / 2 + 55 + Math.random() * 55));
        const bW = 18 + Math.random() * 15;
        const bD = 18 + Math.random() * 15;
        const bHeight = 40 + Math.random() * 95;

        const safeClearance = roadWidth / 2 + Math.max(bW, bD) * 0.75 + 18.0;
        if (!this.isPositionSafeFromTrack(bPos, curve, safeClearance)) {
          continue;
        }

        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bW, bHeight, bD), glassMat);
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
      // 1. Realistic Japanese Overhead Expressway Route Direction Signs
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
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.75,
      });

      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

      for (let i = 0; i < 50; i++) {
        const t = (i / 50);
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = roadWidth / 2 + 55 + Math.random() * 55;
        const bPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, side * dist);

        const bWidth = 16 + Math.random() * 22;
        const bDepth = 16 + Math.random() * 22;
        const bHeight = 45 + Math.random() * 110;

        // Ensure skyscraper is completely clear of any track road ribbon across the entire circuit
        const safeClearance = roadWidth / 2 + Math.max(bWidth, bDepth) * 0.75 + 18.0;
        if (!this.isPositionSafeFromTrack(bPos, curve, safeClearance)) {
          continue;
        }

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

  // --- 8. RAISED CONCRETE SIDEWALK CURBS (INDIAN CITY & GP PAVEMENT) ---
  private static generateSidewalkPavements(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const sidewalkGroup = new THREE.Group();
    const numSteps = 420;
    const halfWidth = roadWidth / 2;
    const sidewalkWidth = 2.6;
    const curbHeight = 0.22;
    const up = new THREE.Vector3(0, 1, 0);

    // High-resolution procedural sidewalk flagstone & beveled curb texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Concrete Base
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 512, 512);

    // Concrete slabs / flagstone grid
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Alternating Indian Curb Stone Edge (Yellow & Black or White & Black segments)
    const isIndian = config.theme === 'chennai' || config.theme === 'hyderabad' || config.theme === 'buddh';
    const curbColor1 = isIndian ? '#f59e0b' : '#f8fafc';
    const curbColor2 = '#1e293b';

    for (let y = 0; y < 512; y += 64) {
      ctx.fillStyle = (y / 64) % 2 === 0 ? curbColor1 : curbColor2;
      ctx.fillRect(0, y, 42, 64);
      ctx.fillRect(512 - 42, y, 42, 64);
    }

    const sidewalkTex = new THREE.CanvasTexture(canvas);
    sidewalkTex.wrapS = THREE.RepeatWrapping;
    sidewalkTex.wrapT = THREE.RepeatWrapping;
    sidewalkTex.repeat.set(1, 110);

    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      roughness: 0.65,
      metalness: 0.08,
    });

    // Generate Left Sidewalk and Right Sidewalk ribbon geometries
    const createSidewalkMesh = (sideMultiplier: number) => {
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= numSteps; i++) {
        const t = i / numSteps;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const innerDist = sideMultiplier * halfWidth;
        const outerDist = sideMultiplier * (halfWidth + sidewalkWidth);

        const innerPt = new THREE.Vector3().copy(pt).addScaledVector(binormal, innerDist);
        innerPt.y += curbHeight;
        const outerPt = new THREE.Vector3().copy(pt).addScaledVector(binormal, outerDist);
        outerPt.y += curbHeight;

        positions.push(innerPt.x, innerPt.y, innerPt.z);
        normals.push(0, 1, 0);
        uvs.push(0, t * 110);

        positions.push(outerPt.x, outerPt.y, outerPt.z);
        normals.push(0, 1, 0);
        uvs.push(1, t * 110);

        if (i < numSteps) {
          const v1 = i * 2;
          const v2 = i * 2 + 1;
          const v3 = (i + 1) * 2;
          const v4 = (i + 1) * 2 + 1;
          indices.push(v1, v2, v3);
          indices.push(v2, v4, v3);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, sidewalkMat);
      mesh.receiveShadow = true;
      return mesh;
    };

    sidewalkGroup.add(createSidewalkMesh(-1)); // Left sidewalk
    sidewalkGroup.add(createSidewalkMesh(1));  // Right sidewalk

    return sidewalkGroup;
  }

  // --- 9. HIGHWAY STREET LIGHT POLES WITH CONICAL ILLUMINATED LIGHT POOLS ON ROAD ---
  private static generateStreetLightsWithLightPools(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const lightGroup = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);
    const numPoles = 48;

    // Materials
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.25,
    });
    const luminaireMat = new THREE.MeshBasicMaterial({
      color: config.theme === 'tokyo' ? 0x00e5ff : 0xfffaed,
    });

    // Create Soft Conical Radial Light Pool Texture for the Road Surface
    const poolCanvas = document.createElement('canvas');
    poolCanvas.width = 256;
    poolCanvas.height = 256;
    const poolCtx = poolCanvas.getContext('2d')!;
    const poolGrad = poolCtx.createRadialGradient(128, 128, 5, 128, 128, 124);
    poolGrad.addColorStop(0, 'rgba(255, 250, 230, 0.65)');
    poolGrad.addColorStop(0.35, 'rgba(255, 245, 210, 0.35)');
    poolGrad.addColorStop(0.7, 'rgba(255, 240, 200, 0.12)');
    poolGrad.addColorStop(1, 'rgba(255, 240, 200, 0)');
    poolCtx.fillStyle = poolGrad;
    poolCtx.beginPath();
    poolCtx.arc(128, 128, 128, 0, Math.PI * 2);
    poolCtx.fill();

    const poolTexture = new THREE.CanvasTexture(poolCanvas);
    const poolMat = new THREE.MeshBasicMaterial({
      map: poolTexture,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const poolGeo = new THREE.PlaneGeometry(10.5, 10.5);
    poolGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < numPoles; i++) {
      const t = i / numPoles;
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      // Alternate left and right sidewalk placement
      const side = i % 2 === 0 ? 1 : -1;
      const poleOffset = side * (roadWidth / 2 + 1.8);
      const poleBase = new THREE.Vector3().copy(pt).addScaledVector(binormal, poleOffset);

      // 1. Vertical Pole
      const poleHeight = 8.2;
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, poleHeight, 8);
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);
      poleMesh.position.set(poleBase.x, poleBase.y + poleHeight / 2, poleBase.z);

      // 2. Cantilever Arm extending toward the road
      const armLength = 2.4;
      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, armLength, 6);
      armGeo.rotateZ(side * Math.PI / 3.2);
      const armMesh = new THREE.Mesh(armGeo, poleMat);
      armMesh.position.set(
        poleBase.x - side * binormal.x * (armLength * 0.4),
        poleBase.y + poleHeight - 0.2,
        poleBase.z - side * binormal.z * (armLength * 0.4)
      );

      // 3. Glowing Luminaire Head
      const lampPos = new THREE.Vector3().copy(poleBase)
        .addScaledVector(binormal, -side * 1.6);
      lampPos.y += poleHeight - 0.5;

      const lampGeo = new THREE.BoxGeometry(0.7, 0.18, 0.4);
      const lampMesh = new THREE.Mesh(lampGeo, luminaireMat);
      lampMesh.position.copy(lampPos);

      // 4. Ground Conical Light Pool Decal directly under the lamp (Matching reference photo!)
      const poolMesh = new THREE.Mesh(poolGeo, poolMat);
      const poolCenter = new THREE.Vector3().copy(pt).addScaledVector(binormal, -side * (roadWidth / 4));
      poolMesh.position.set(poolCenter.x, poolCenter.y + 0.06, poolCenter.z);

      lightGroup.add(poleMesh, armMesh, lampMesh, poolMesh);
    }

    return lightGroup;
  }

  // --- 10. AUTHENTIC LOCAL AREA ROADSIDE SIGNBOARDS & OVERHEAD HIGHWAY GANTRIES ---
  private static generateLocalAreaSignboardsAndGantries(
    curve: THREE.CatmullRomCurve3,
    roadWidth: number,
    config: TrackConfig
  ): THREE.Group {
    const landmarkGroup = new THREE.Group();
    const up = new THREE.Vector3(0, 1, 0);

    interface RoadsideSpec {
      t: number;
      side: number; // -1 for left, 1 for right
      badge: string;
      mainText: string;
      distance: string;
      subText: string;
      isIndian?: boolean;
    }

    interface GantrySpec {
      t: number;
      code: string;
      leftText: string;
      rightText: string;
    }

    let roadsideList: RoadsideSpec[] = [];
    let gantryList: GantrySpec[] = [];

    if (config.theme === 'chennai') {
      roadsideList = [
        { t: 0.05, side: -1, badge: 'TAMIL NADU HIGHWAYS • NH 48', mainText: '↑ VELACHERY', distance: '3.2 KM', subText: 'VIA 100 FT VELACHERY BYPASS', isIndian: true },
        { t: 0.16, side: 1,  badge: 'GREATER CHENNAI ARTERIAL', mainText: '↑ ALWARPET', distance: '2.4 KM', subText: 'TTK ROAD / ELDAMS ROAD', isIndian: true },
        { t: 0.28, side: -1, badge: 'HIGHWAYS DEPARTMENT • NH 45', mainText: '↗ GUINDY KATHIPARA', distance: '4.5 KM', subText: 'MULTI-LEVEL FLYOVER INTERCHANGE', isIndian: true },
        { t: 0.42, side: 1,  badge: 'SMART CITY COMMERCIAL HUB', mainText: '↑ T. NAGAR', distance: '3.8 KM', subText: 'PONDY BAZAAR PEDESTRIAN PLAZA', isIndian: true },
        { t: 0.55, side: -1, badge: 'COASTAL PROMENADE DRIVE', mainText: '↑ MARINA BEACH', distance: '500 M', subText: 'KAMARAJAR SALAI BAYVIEW', isIndian: true },
        { t: 0.68, side: 1,  badge: 'HISTORIC METRO TRANSIT', mainText: '↑ NAPIER BRIDGE', distance: '400 M', subText: 'COOUM ESTUARY CROSSING', isIndian: true },
        { t: 0.80, side: -1, badge: 'SOUTH CHENNAI ARTERIAL', mainText: '↗ ADYAR SIGNAL', distance: '1.8 KM', subText: 'LATTICE BRIDGE ROAD JUNCTION', isIndian: true },
        { t: 0.92, side: 1,  badge: 'IT EXPRESSWAY CORRIDOR', mainText: '↑ OMR IT CORRIDOR', distance: '5.2 KM', subText: 'TIDEL PARK / VELACHERY MAIN RD', isIndian: true },
      ];
      gantryList = [
        { t: 0.10, code: 'NH 48 • GRAND SOUTHERN TRUNK', leftText: '↑ VELACHERY 3.2 KM', rightText: '↗ ALWARPET 2.4 KM' },
        { t: 0.36, code: 'CHENNAI INNER RING ROAD', leftText: '↑ GUINDY 4.5 KM', rightText: '↗ T. NAGAR 3.8 KM' },
        { t: 0.62, code: 'EAST COAST HIGHWAY', leftText: '↑ MARINA BEACH 500M', rightText: '↗ ADYAR 1.8 KM' },
        { t: 0.85, code: 'RAJIV GANDHI EXPRESSWAY', leftText: '↑ OMR IT CORRIDOR', rightText: '↗ VELACHERY BYPASS' },
      ];
    } else if (config.theme === 'mumbai') {
      roadsideList = [
        { t: 0.06, side: -1, badge: 'MUMBAI METROPOLIS', mainText: '↑ BANDRA (WEST)', distance: '1.5 KM', subText: 'LINKING ROAD / HILL ROAD', isIndian: true },
        { t: 0.18, side: 1,  badge: 'MSRDC FREEWAY TOLLWAY', mainText: '↑ BANDRA-WORLI SEA LINK', distance: '2.2 KM', subText: 'CABLE STAYED ARABIAN SEA BRIDGE', isIndian: true },
        { t: 0.30, side: -1, badge: 'FINANCIAL DISTRICT', mainText: '↗ BKC (BANDRA KURLA)', distance: '3.0 KM', subText: 'COMMERCIAL BUSINESS COMPLEX', isIndian: true },
        { t: 0.44, side: 1,  badge: 'MUMBAI SOUTH PROMENADE', mainText: '↑ WORLI SEA FACE', distance: '3.5 KM', subText: 'COASTAL PROMENADE DRIVE', isIndian: true },
        { t: 0.58, side: -1, badge: 'QUEENS NECKLACE BOULEVARD', mainText: '↑ MARINE DRIVE', distance: '5.8 KM', subText: 'SEASIDE HERITAGE PROMENADE', isIndian: true },
        { t: 0.72, side: 1,  badge: 'CENTRAL ARTERIAL TRANSIT', mainText: '↑ DADAR TT CIRCLE', distance: '4.0 KM', subText: 'DR. AMBEDKAR ROAD', isIndian: true },
        { t: 0.84, side: -1, badge: 'BUSINESS CENTRAL', mainText: '↑ NARIMAN POINT', distance: '7.2 KM', subText: 'EXPRESS TOWERS / AIR INDIA BLDG', isIndian: true },
        { t: 0.94, side: 1,  badge: 'WESTERN SUBURBS', mainText: '↗ ANDHERI LINK ROAD', distance: '5.5 KM', subText: 'JUHU CIRCLE ARTERIAL', isIndian: true },
      ];
      gantryList = [
        { t: 0.12, code: 'WESTERN EXPRESS HIGHWAY', leftText: '↑ BANDRA (WEST) 1.5 KM', rightText: '↗ SEA LINK 2.2 KM' },
        { t: 0.38, code: 'BANDRA KURLA FREEWAY', leftText: '↑ BKC 3.0 KM', rightText: '↗ WORLI SEA FACE 3.5 KM' },
        { t: 0.65, code: 'MUMBAI COASTAL FREEWAY', leftText: '↑ MARINE DRIVE', rightText: '↗ NARIMAN POINT' },
      ];
    } else if (config.theme === 'hyderabad') {
      roadsideList = [
        { t: 0.06, side: -1, badge: 'CYBERABAD IT CORRIDOR', mainText: '↑ HITEC CITY', distance: '1.2 KM', subText: 'CYBER TOWERS / MINDSPACE', isIndian: true },
        { t: 0.20, side: 1,  badge: 'ORR EXPRESSWAY', mainText: '↗ GACHIBOWLI', distance: '3.4 KM', subText: 'FINANCIAL DISTRICT & STADIUM', isIndian: true },
        { t: 0.35, side: -1, badge: 'HYDERABAD METRO', mainText: '↑ MADHAPUR', distance: '2.0 KM', subText: '100 FEET MAIN ROAD', isIndian: true },
        { t: 0.50, side: 1,  badge: 'URBAN FREEWAY', mainText: '↑ JUBILEE HILLS', distance: '4.1 KM', subText: 'ROAD NO. 36 & CHECK POST', isIndian: true },
        { t: 0.65, side: -1, badge: 'CABLE SUSPENSION', mainText: '↑ DURGAM CHERUVU', distance: '800 M', subText: 'CABLE-STAYED LAKE BRIDGE', isIndian: true },
        { t: 0.80, side: 1,  badge: 'CENTRAL ARTERIAL', mainText: '↑ BANJARA HILLS', distance: '5.2 KM', subText: 'ROAD NO. 1 & TAJ KRISHNA', isIndian: true },
        { t: 0.92, side: -1, badge: 'KNOWLEDGE HUB', mainText: '↗ KNOWLEDGE CITY', distance: '1.5 KM', subText: 'INORBIT MALL FLYOVER', isIndian: true },
      ];
      gantryList = [
        { t: 0.12, code: 'CYBERABAD EXPRESSWAY', leftText: '↑ HITEC CITY 1.2 KM', rightText: '↗ GACHIBOWLI 3.4 KM' },
        { t: 0.42, code: 'HYDERABAD INNER RING ROAD', leftText: '↑ MADHAPUR 2.0 KM', rightText: '↗ JUBILEE HILLS' },
        { t: 0.72, code: 'DURGAM CHERUVU CORRIDOR', leftText: '↑ CABLE BRIDGE', rightText: '↗ BANJARA HILLS' },
      ];
    } else if (config.theme === 'buddh') {
      roadsideList = [
        { t: 0.08, side: -1, badge: 'EXPRESSWAY AUTHORITY', mainText: '↑ YAMUNA EXPRESSWAY', distance: '2.0 KM', subText: 'NOIDA-AGRA HIGH SPEED TOLLWAY', isIndian: true },
        { t: 0.25, side: 1,  badge: 'GREATER NOIDA TRANSIT', mainText: '↗ PARI CHOWK', distance: '3.8 KM', subText: 'EXPRESSWAY ROUNDABOUT', isIndian: true },
        { t: 0.45, side: -1, badge: 'NOIDA ARTERIAL', mainText: '↑ NOIDA SECTOR 18', distance: '8.2 KM', subText: 'ATTA MARKET / MALL OF INDIA', isIndian: true },
        { t: 0.65, side: 1,  badge: 'INTERSTATE TOLLWAY', mainText: '↑ DND FLYWAY / DELHI', distance: '14 KM', subText: 'DIRECT FLYWAY TO ASHRAM', isIndian: true },
        { t: 0.85, side: -1, badge: 'CONVENTION HUB', mainText: '↗ INDIA EXPO MART', distance: '4.5 KM', subText: 'GREATER NOIDA EXPO CENTRE', isIndian: true },
      ];
      gantryList = [
        { t: 0.15, code: 'TAJ EXPRESSWAY • 6 LANES', leftText: '↑ YAMUNA EXP 2.0 KM', rightText: '↗ PARI CHOWK 3.8 KM' },
        { t: 0.55, code: 'NCR ARTERIAL FREEWAY', leftText: '↑ NOIDA SECTOR 18', rightText: '↗ DND FLYWAY / DELHI' },
      ];
    } else if (config.theme === 'tokyo') {
      roadsideList = [
        { t: 0.08, side: -1, badge: 'SHUTO EXPRESSWAY • C1', mainText: '↑ SHIBUYA CROSSING', distance: '800 M', subText: 'HACHIKO SQUARE • ROUTE 3' },
        { t: 0.26, side: 1,  badge: 'METROPOLITAN TOKYO', mainText: '↑ SHINJUKU', distance: '2.5 KM', subText: 'KABUKICHO / SKYSCRAPERS' },
        { t: 0.45, side: -1, badge: 'TOKYO EXPRESS', mainText: '↑ ROPPONGI HILLS', distance: '3.1 KM', subText: 'MORI TOWER • AZABU' },
        { t: 0.65, side: 1,  badge: 'PREMIER BOULEVARD', mainText: '↑ GINZA 4-CHOME', distance: '4.2 KM', subText: 'CHUO-DORI AVENUE' },
        { t: 0.85, side: -1, badge: 'ELECTRIC CITY', mainText: '↑ AKIHABARA', distance: '5.0 KM', subText: 'CHUO STREET TECH HUB' },
      ];
      gantryList = [
        { t: 0.15, code: 'SHUTO C1 INNER CIRCULAR', leftText: '↑ SHIBUYA 800 M', rightText: '↗ ROPPONGI 2.4 KM' },
        { t: 0.52, code: 'WANGAN BAYSIDE EXPRESS', leftText: '↑ SHINJUKU 2.5 KM', rightText: '↗ RAINBOW BRIDGE' },
      ];
    } else {
      roadsideList = [
        { t: 0.08, side: -1, badge: 'CIRCUIT SECTOR 1', mainText: '↑ GRAND PRIX STRAIGHT', distance: '1.2 KM', subText: 'PIT STRAIGHT ACCELERATION' },
        { t: 0.30, side: 1,  badge: 'TECHNICAL APEX', mainText: '↑ CHICANE APEX', distance: '600 M', subText: 'HEAVY BRAKING ZONE' },
        { t: 0.55, side: -1, badge: 'SPEED TRAP CORRIDOR', mainText: '↑ BACK STRAIGHTAWAY', distance: '1.5 KM', subText: 'MAX VELOCITY SECTOR' },
        { t: 0.80, side: 1,  badge: 'FINAL TURN', mainText: '↑ PARABOLICA SWEEPER', distance: '400 M', subText: 'RUN-IN TO START LINE' },
      ];
      gantryList = [
        { t: 0.15, code: 'FIA INTERNATIONAL CIRCUIT', leftText: '↑ MAIN TRACK SECTOR 1', rightText: '↗ PIT LANE ENTRY' },
        { t: 0.55, code: 'HIGH SPEED TRAP 300+ KM/H', leftText: '↑ BACK STRAIGHTAWAY', rightText: '↗ ESCAPE ROAD' },
      ];
    }

    // --- 1. BUILD ROADSIDE MILESTONE & DIRECTIONAL BOARDS ---
    roadsideList.forEach((spec) => {
      const pt = curve.getPointAt(spec.t);
      const tangent = curve.getTangentAt(spec.t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      const offsetDist = spec.side * (roadWidth / 2 + 3.8);
      const signPos = new THREE.Vector3().copy(pt).addScaledVector(binormal, offsetDist);
      signPos.y += 2.8;

      // Draw high-resolution 1024x480 highway signboard canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;

      // Background: Deep Highway Green
      ctx.fillStyle = '#064e3b';
      ctx.roundRect(12, 12, 1000, 456, 32);
      ctx.fill();

      // Bold reflective white border
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#f8fafc';
      ctx.roundRect(12, 12, 1000, 456, 32);
      ctx.stroke();

      // Inner subtle border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#34d399';
      ctx.roundRect(24, 24, 976, 432, 24);
      ctx.stroke();

      // Top route pill badge
      ctx.fillStyle = '#022c22';
      ctx.roundRect(40, 42, 540, 56, 16);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`📍 ${spec.badge}`, 58, 80);

      // Huge Bold Destination Name
      ctx.font = '900 64px "Inter", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(spec.mainText, 44, 200);
      ctx.shadowBlur = 0;

      // Distance Badge in Glowing Gold/Amber
      ctx.font = '900 52px "JetBrains Mono", monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(spec.distance, 44, 285);

      // Dividing Line
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(44, 325);
      ctx.lineTo(960, 325);
      ctx.stroke();

      // Subtext / Secondary route
      ctx.font = 'bold 30px "JetBrains Mono", monospace';
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText(spec.subText, 44, 385);

      const signTex = new THREE.CanvasTexture(canvas);
      const signMat = new THREE.MeshBasicMaterial({
        map: signTex,
        transparent: true,
      });

      const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.3), signMat);
      signBoard.position.copy(signPos);

      // Angled toward oncoming cars on the spline
      const lookTarget = new THREE.Vector3().copy(pt).add(tangent.clone().multiplyScalar(14));
      signBoard.lookAt(lookTarget);

      // Support Dual Steel Posts
      const postMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.2 });
      const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 4.2, 8), postMat);
      post1.position.set(signPos.x, signPos.y - 1.5, signPos.z);
      landmarkGroup.add(signBoard, post1);

      // Add 3D Auto-Rickshaw model near Indian transit stops
      if (spec.isIndian && (spec.side > 0 ? spec.t > 0.4 : spec.t < 0.4)) {
        const rickshaw = new THREE.Group();
        const rickBody = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 1.2, 2.2),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
        );
        rickBody.position.y = 0.8;
        const rickTop = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.4, 2.0),
          new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 })
        );
        rickTop.position.y = 1.5;
        rickshaw.add(rickBody, rickTop);
        rickshaw.position.set(signPos.x + 2.8 * spec.side, signPos.y - 2.4, signPos.z + 4);
        landmarkGroup.add(rickshaw);
      }
    });

    // --- 2. BUILD OVERHEAD HIGHWAY TRUSS GANTRIES ---
    gantryList.forEach((spec) => {
      const pt = curve.getPointAt(spec.t);
      const tangent = curve.getTangentAt(spec.t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      const gantryGroup = new THREE.Group();
      gantryGroup.position.copy(pt);

      const trussMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.25
      });

      // Dual side vertical steel pillars outside the road width
      const pillarDist = roadWidth / 2 + 2.8;
      const pillarHeight = 8.5;
      const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, pillarHeight, 8), trussMat);
      leftPillar.position.set(-binormal.x * pillarDist, pillarHeight / 2, -binormal.z * pillarDist);

      const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, pillarHeight, 8), trussMat);
      rightPillar.position.set(binormal.x * pillarDist, pillarHeight / 2, binormal.z * pillarDist);

      // Horizontal Spanning Steel Truss Beam
      const spanLength = roadWidth + 6.0;
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(spanLength, 0.7, 0.7), trussMat);
      crossBeam.position.set(0, 7.6, 0);

      // Orientation matching track tangent
      const rotMatrix = new THREE.Matrix4().makeBasis(binormal, up, tangent);
      gantryGroup.quaternion.setFromRotationMatrix(rotMatrix);

      // Large Overhead Highway Green Directional Signboard
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Highway green background
      ctx.fillStyle = '#065f46';
      ctx.roundRect(8, 8, 1008, 240, 20);
      ctx.fill();

      // Crisp white reflective border
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#ffffff';
      ctx.roundRect(8, 8, 1008, 240, 20);
      ctx.stroke();

      // Top route banner
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`🛣️ ${spec.code}`, 36, 42);

      // Center Divider line
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(512, 55);
      ctx.lineTo(512, 230);
      ctx.stroke();

      // Left Lane Box
      ctx.font = '900 42px "Inter", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(spec.leftText, 40, 140);

      // Right Lane Box
      ctx.fillStyle = '#ffffff';
      ctx.fillText(spec.rightText, 540, 140);

      // Subtext lane tags
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText('THROUGH TRAFFIC', 40, 195);
      ctx.fillText('EXIT LANE ONLY ↗', 540, 195);

      const boardTex = new THREE.CanvasTexture(canvas);
      const boardMat = new THREE.MeshBasicMaterial({
        map: boardTex,
        transparent: true
      });

      const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth * 0.75, 2.5), boardMat);
      boardMesh.position.set(0, 7.6, 0.4);

      // Downward floodlight spot illuminating the road underneath
      const gantrySpot = new THREE.SpotLight(0x38bdf8, 2.0, 24, Math.PI / 4, 0.5, 1.2);
      gantrySpot.position.set(0, 7.5, 0);
      gantrySpot.target.position.set(0, 0, 0);

      gantryGroup.add(leftPillar, rightPillar, crossBeam, boardMesh, gantrySpot, gantrySpot.target);
      landmarkGroup.add(gantryGroup);
    });

    return landmarkGroup;
  }
}


