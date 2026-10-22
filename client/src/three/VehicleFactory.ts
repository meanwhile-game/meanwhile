import * as THREE from 'three';

export interface VehicleMeshObject extends THREE.Group {
  wheels: THREE.Mesh[];
  type: string;
  underglow?: THREE.Mesh;
  exhaustFires?: THREE.Mesh[];
}

// Procedural Carbon Fiber Texture Generator
function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#1b2230';
    for (let i = 0; i < 64; i += 8) {
      for (let j = 0; j < 64; j += 8) {
        if ((i + j) % 16 === 0) {
          ctx.fillRect(i, j, 8, 4);
          ctx.fillRect(i + 4, j + 4, 4, 4);
        }
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

// Procedural Cross-Drilled Brake Rotor Texture Generator
function createRotorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 128, 128);
    const center = 64;
    // Radial grooves
    for (let r = 24; r < 58; r += 2) {
      ctx.strokeStyle = r % 4 === 0 ? '#64748b' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Cross-drilled cooling holes
    ctx.fillStyle = '#090d16';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x1 = center + Math.cos(a) * 36;
      const y1 = center + Math.sin(a) * 36;
      const x2 = center + Math.cos(a + 0.22) * 48;
      const y2 = center + Math.sin(a + 0.22) * 48;
      ctx.beginPath();
      ctx.arc(x1, y1, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return new THREE.CanvasTexture(canvas);
}

// Cached textures
let cachedCarbonTex: THREE.CanvasTexture | null = null;
let cachedRotorTex: THREE.CanvasTexture | null = null;

function getCarbonTexture(): THREE.CanvasTexture {
  if (!cachedCarbonTex) cachedCarbonTex = createCarbonTexture();
  return cachedCarbonTex;
}

function getRotorTexture(): THREE.CanvasTexture {
  if (!cachedRotorTex) cachedRotorTex = createRotorTexture();
  return cachedRotorTex;
}

export class VehicleFactory {
  /**
   * Builds an authentic, high-fidelity 3D vehicle mesh with clearcoat automotive paint,
   * sculpted beveled aerodynamic profiles, hollow-barrel forged wheels, brake calipers, and cockpits.
   */
  public static createVehicle(vehicleId: string, colorHex: string): VehicleMeshObject {
    const group = new THREE.Group() as VehicleMeshObject;
    group.wheels = [];
    group.type = vehicleId;
    group.exhaustFires = [];

    const carbonTex = getCarbonTexture();
    const rotorTex = getRotorTexture();

    // 1. Premium Automotive Paint (MeshPhysicalMaterial with clearcoat reflection)
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.88,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95
    });

    // 2. High-Tech Carbon Fiber (Bump-mapped weave pattern)
    const carbonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0c1017'),
      roughness: 0.35,
      metalness: 0.25,
      bumpMap: carbonTex,
      bumpScale: 0.04
    });

    // 3. Deep Polycarbonate Glass (With transparent transmission)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#060b17'),
      roughness: 0.04,
      metalness: 0.1,
      transmission: 0.84,
      ior: 1.52,
      transparent: true,
      opacity: 0.92
    });

    // 4. Matte Racing Tire Rubber
    const tireMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#14161b'),
      roughness: 0.85,
      metalness: 0.05
    });

    // 5. Forged Alloy Rims (Silver or Gold for JDM)
    const rimMat = new THREE.MeshStandardMaterial({
      color: vehicleId === 'ronin-turbo' ? new THREE.Color('#d4af37') : new THREE.Color('#e2e8f0'),
      roughness: 0.2,
      metalness: 0.95
    });

    // 6. Cross-Drilled Metallic Brake Rotors
    const rotorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94a3b8'),
      map: rotorTex,
      metalness: 0.85,
      roughness: 0.28,
      side: THREE.DoubleSide
    });

    // 7. Fluorescent Racing Brake Calipers
    const caliperMat = new THREE.MeshStandardMaterial({
      color: vehicleId === 'ronin-turbo' ? new THREE.Color('#ef4444') : new THREE.Color('#00ff87'),
      roughness: 0.25,
      metalness: 0.6
    });

    // 8. Projector Headlights with Glowing LED Daytime-Running Halo
    const headlightCoreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      emissive: new THREE.Color('#38bdf8'),
      emissiveIntensity: 3.2,
      roughness: 0.05
    });

    const headlightLensMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e0f2fe'),
      transmission: 0.9,
      transparent: true,
      opacity: 0.85,
      roughness: 0.05
    });

    // 9. OLED Neon Taillight Blade
    const taillightMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ff0033'),
      emissive: new THREE.Color('#ff0044'),
      emissiveIntensity: 3.0,
      roughness: 0.15
    });

    // 10. Burnt Titanium Exhaust Tips (With heat bluing)
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0284c7'),
      metalness: 0.95,
      roughness: 0.15
    });

    // 11. Cockpit Interior (Alcantara & dashboard)
    const interiorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f121a'),
      roughness: 0.9,
      metalness: 0.1
    });

    // 12. Soft Radial Underglow Neon
    const underglowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.65
    });

    // Dispatch vehicle construction based on model
    if (vehicleId === 'phantom-bike') {
      this.buildMotorcycle(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, taillightMat, underglowMat);
    } else if (vehicleId === 'apex-hyper') {
      this.buildHypercar(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, headlightLensMat, taillightMat, titaniumMat, interiorMat, underglowMat);
    } else if (vehicleId === 'ronin-turbo') {
      this.buildTuner(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, headlightLensMat, taillightMat, titaniumMat, interiorMat, underglowMat);
    } else {
      this.buildSupercar(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, headlightLensMat, taillightMat, titaniumMat, interiorMat, underglowMat);
    }

    // Enable soft realistic shadows for all components
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  // ==========================================
  // 1. CYBER GT SUPERCAR (BEVELED SCULPTED PROFILE)
  // ==========================================
  private static buildSupercar(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    rotorMat: THREE.Material,
    caliperMat: THREE.Material,
    headlightCoreMat: THREE.Material,
    headlightLensMat: THREE.Material,
    taillightMat: THREE.Material,
    titaniumMat: THREE.Material,
    interiorMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Sculpted Main Fuselage Silhouette using ExtrudeGeometry
    const shape = new THREE.Shape();
    shape.moveTo(2.35, 0.18);   // Front splitter tip
    shape.lineTo(2.35, 0.36);   // Front bumper upright
    shape.lineTo(2.05, 0.44);   // Nose cone apex
    shape.lineTo(0.95, 0.58);   // Sloped hood to cowl
    shape.lineTo(0.15, 0.96);   // Slanted windshield
    shape.lineTo(-0.45, 0.96);  // Aerodynamic roofline
    shape.lineTo(-1.35, 0.68);  // Fastback rear glass
    shape.lineTo(-2.15, 0.64);  // Rear deck lid
    shape.lineTo(-2.20, 0.28);  // Rear vertical drop
    shape.lineTo(-1.95, 0.20);  // Diffuser upsweep
    shape.lineTo(2.35, 0.18);   // Flat floor to front

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 1.84,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 3
    };

    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.rotateY(Math.PI / 2);
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.56, 0.05);
    root.add(bodyMesh);

    // Front Slanted Hood Carbon Heat Extractors
    const louverGeo = new THREE.BoxGeometry(0.36, 0.04, 0.45);
    const louverLeft = new THREE.Mesh(louverGeo, carbonMat);
    louverLeft.position.set(-0.45, 0.65, 1.45);
    louverLeft.rotation.x = 0.12;
    const louverRight = louverLeft.clone();
    louverRight.position.x = 0.45;
    root.add(louverLeft, louverRight);

    // Front Carbon Splitter Blade with Aerodynamic Winglets
    const splitterGeo = new THREE.BoxGeometry(2.18, 0.06, 0.95);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.18, 2.35);
    root.add(splitter);

    // Splitter endplate winglets
    const wingletGeo = new THREE.BoxGeometry(0.06, 0.24, 0.38);
    const wingletLeft = new THREE.Mesh(wingletGeo, carbonMat);
    wingletLeft.position.set(-1.10, 0.28, 2.5);
    const wingletRight = wingletLeft.clone();
    wingletRight.position.x = 1.10;
    root.add(wingletLeft, wingletRight);

    // Front Honeycomb Lower Intake Mouth
    const grillGeo = new THREE.BoxGeometry(1.45, 0.22, 0.15);
    const grill = new THREE.Mesh(grillGeo, carbonMat);
    grill.position.set(0, 0.28, 2.36);
    root.add(grill);

    // Widebody Curving Wheel Arches (Front & Rear Haunches)
    const archGeo = new THREE.BoxGeometry(0.18, 0.38, 0.95);
    // Front Arches
    const fArchLeft = new THREE.Mesh(archGeo, bodyMat);
    fArchLeft.position.set(-1.03, 0.52, 1.4);
    const fArchRight = fArchLeft.clone();
    fArchRight.position.x = 1.03;
    // Rear Arches
    const rArchLeft = new THREE.Mesh(archGeo, bodyMat);
    rArchLeft.position.set(-1.06, 0.54, -1.35);
    const rArchRight = rArchLeft.clone();
    rArchRight.position.x = 1.06;
    root.add(fArchLeft, fArchRight, rArchLeft, rArchRight);

    // Carbon Side Skirts with vortex strakes
    const skirtGeo = new THREE.BoxGeometry(2.14, 0.05, 1.95);
    const skirt = new THREE.Mesh(skirtGeo, carbonMat);
    skirt.position.set(0, 0.2, 0.05);
    root.add(skirt);

    // Raked Polycarbonate Windshield & Side Windows
    const cabinGeo = new THREE.BoxGeometry(1.50, 0.44, 1.75);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.86, -0.05);
    root.add(cabin);

    // Interior Cockpit: Dual Racing Bucket Seats
    const seatGeo = new THREE.BoxGeometry(0.42, 0.42, 0.38);
    const seatLeft = new THREE.Mesh(seatGeo, interiorMat);
    seatLeft.position.set(-0.35, 0.72, -0.15);
    const seatRight = seatLeft.clone();
    seatRight.position.x = 0.35;
    // Headrests
    const headGeo = new THREE.BoxGeometry(0.24, 0.18, 0.14);
    const headLeft = new THREE.Mesh(headGeo, interiorMat);
    headLeft.position.set(-0.35, 0.96, -0.25);
    const headRight = headLeft.clone();
    headRight.position.x = 0.35;
    // F1 Steering Wheel
    const steerGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
    const steer = new THREE.Mesh(steerGeo, carbonMat);
    steer.position.set(-0.35, 0.78, 0.35);
    steer.rotation.x = -Math.PI / 6;
    root.add(seatLeft, seatRight, headLeft, headRight, steer);

    // Aerodynamic Carbon Side Mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.24, 0.12, 0.14);
    const mirrorLeft = new THREE.Mesh(mirrorGeo, carbonMat);
    mirrorLeft.position.set(-0.96, 0.78, 0.55);
    const mirrorRight = mirrorLeft.clone();
    mirrorRight.position.x = 0.96;
    root.add(mirrorLeft, mirrorRight);

    // High-Mounted GT Wing with Swan-Neck Pylons
    const wingBladeGeo = new THREE.BoxGeometry(2.22, 0.05, 0.48);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
    wingBlade.position.set(0, 1.15, -2.05);
    root.add(wingBlade);

    // Swan-neck aerodynamic wing pylons
    const pylonGeo = new THREE.BoxGeometry(0.05, 0.52, 0.22);
    const pylonLeft = new THREE.Mesh(pylonGeo, carbonMat);
    pylonLeft.position.set(-0.52, 0.90, -1.95);
    pylonLeft.rotation.x = -0.15;
    const pylonRight = pylonLeft.clone();
    pylonRight.position.x = 0.52;
    root.add(pylonLeft, pylonRight);

    // 4-Channel Carbon Ground-Effect Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.92, 0.24, 0.6);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, 0.28, -2.15);
    diffuser.rotation.x = -0.15;
    root.add(diffuser);

    // Dual Projector LED Headlights with Outer Lenses
    const hlHousingGeo = new THREE.BoxGeometry(0.42, 0.08, 0.12);
    const hlLeftHousing = new THREE.Mesh(hlHousingGeo, headlightCoreMat);
    hlLeftHousing.position.set(-0.68, 0.48, 2.38);
    const hlRightHousing = hlLeftHousing.clone();
    hlRightHousing.position.x = 0.68;

    const lensGeo = new THREE.BoxGeometry(0.46, 0.12, 0.08);
    const lensLeft = new THREE.Mesh(lensGeo, headlightLensMat);
    lensLeft.position.set(-0.68, 0.48, 2.44);
    const lensRight = lensLeft.clone();
    lensRight.position.x = 0.68;
    root.add(hlLeftHousing, hlRightHousing, lensLeft, lensRight);

    // Continuous Rear 3D OLED Tail Blade
    const tlGeo = new THREE.BoxGeometry(1.85, 0.06, 0.1);
    const tl = new THREE.Mesh(tlGeo, taillightMat);
    tl.position.set(0, 0.58, -2.18);
    root.add(tl);

    // Dual Titanium Exhaust Cannons with Nitro Flames
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.32, 16);
    exhaustGeo.rotateX(Math.PI / 2);
    const exLeft = new THREE.Mesh(exhaustGeo, titaniumMat);
    exLeft.position.set(-0.38, 0.34, -2.25);
    const exRight = exLeft.clone();
    exRight.position.x = 0.38;

    const flameGeo = new THREE.ConeGeometry(0.08, 0.45, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const flameLeft = new THREE.Mesh(flameGeo, flameMat);
    flameLeft.position.set(-0.38, 0.34, -2.42);
    const flameRight = flameLeft.clone();
    flameRight.position.x = 0.38;

    root.add(exLeft, exRight, flameLeft, flameRight);
    root.exhaustFires = [flameLeft, flameRight];

    // Soft Radial Neon Underglow
    const ugGeo = new THREE.PlaneGeometry(1.9, 4.0);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.06;
    root.add(underglow);
    root.underglow = underglow;

    // Four High-Detail Wheels with Rotors & Calipers
    const wheelPositions: [number, number, number][] = [
      [-1.02, 0.34, 1.4],   // Front Left
      [1.02, 0.34, 1.4],    // Front Right
      [-1.05, 0.36, -1.35], // Rear Left
      [1.05, 0.36, -1.35],  // Rear Right
    ];

    wheelPositions.forEach((pos, idx) => {
      const isRight = idx % 2 === 1;
      const isRear = idx >= 2;
      const wheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, isRight, isRear);
      wheel.position.set(pos[0], pos[1], pos[2]);
      root.add(wheel);
      root.wheels.push(wheel);
    });
  }

  // ==========================================
  // 2. LE MANS / FORMULA HYPERCAR (APEX HYPERION)
  // ==========================================
  private static buildHypercar(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    rotorMat: THREE.Material,
    caliperMat: THREE.Material,
    headlightCoreMat: THREE.Material,
    headlightLensMat: THREE.Material,
    taillightMat: THREE.Material,
    titaniumMat: THREE.Material,
    interiorMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Ultra-low central monocoque tub
    const monoGeo = new THREE.BoxGeometry(1.15, 0.34, 4.65);
    const mono = new THREE.Mesh(monoGeo, bodyMat);
    mono.position.y = 0.36;
    root.add(mono);

    // Front pontoons (wheel-covering pods)
    const pontoonGeo = new THREE.BoxGeometry(0.48, 0.32, 1.5);
    const pontoonLeft = new THREE.Mesh(pontoonGeo, bodyMat);
    pontoonLeft.position.set(-0.84, 0.42, 1.5);
    const pontoonRight = pontoonLeft.clone();
    pontoonRight.position.x = 0.84;
    root.add(pontoonLeft, pontoonRight);

    // Aerodynamic wheel-arch louvers on top of pontoons
    const louverGeo = new THREE.BoxGeometry(0.32, 0.04, 0.4);
    const louverLeft = new THREE.Mesh(louverGeo, carbonMat);
    louverLeft.position.set(-0.84, 0.58, 1.4);
    const louverRight = louverLeft.clone();
    louverRight.position.x = 0.84;
    root.add(louverLeft, louverRight);

    // Front high-downforce dual canards
    const canardGeo = new THREE.BoxGeometry(0.35, 0.04, 0.25);
    const canardLeft = new THREE.Mesh(canardGeo, carbonMat);
    canardLeft.position.set(-1.02, 0.36, 2.1);
    canardLeft.rotation.z = -0.15;
    const canardRight = canardLeft.clone();
    canardRight.position.x = 1.02;
    canardRight.rotation.z = 0.15;
    root.add(canardLeft, canardRight);

    // Central high-tech front wing nose
    const noseGeo = new THREE.BoxGeometry(0.9, 0.12, 1.0);
    const nose = new THREE.Mesh(noseGeo, carbonMat);
    nose.position.set(0, 0.22, 2.35);
    root.add(nose);

    // Wide aero side pods with radiator duct openings
    const podGeo = new THREE.BoxGeometry(0.5, 0.3, 2.1);
    const podLeft = new THREE.Mesh(podGeo, bodyMat);
    podLeft.position.set(-0.82, 0.36, 0.05);
    const podRight = podLeft.clone();
    podRight.position.x = 0.82;
    root.add(podLeft, podRight);

    // Fighter-jet bubble cockpit canopy
    const canopyGeo = new THREE.SphereGeometry(0.68, 24, 16);
    canopyGeo.scale(0.85, 0.82, 1.75);
    const canopy = new THREE.Mesh(canopyGeo, glassMat);
    canopy.position.set(0, 0.62, 0.3);
    root.add(canopy);

    // Single central formula racing cockpit
    const seatGeo = new THREE.BoxGeometry(0.4, 0.45, 0.4);
    const seat = new THREE.Mesh(seatGeo, interiorMat);
    seat.position.set(0, 0.55, 0.2);
    root.add(seat);

    // Central LMP1 shark fin
    const finGeo = new THREE.BoxGeometry(0.04, 0.52, 2.1);
    const fin = new THREE.Mesh(finGeo, carbonMat);
    fin.position.set(0, 0.82, -1.0);
    root.add(fin);

    // Two-tier Le Mans monster rear wing
    const wingGeo = new THREE.BoxGeometry(2.32, 0.05, 0.54);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 0.98, -2.15);

    // Wing vertical endplates
    const endplateGeo = new THREE.BoxGeometry(0.05, 0.45, 0.65);
    const epLeft = new THREE.Mesh(endplateGeo, carbonMat);
    epLeft.position.set(-1.14, 0.98, -2.15);
    const epRight = epLeft.clone();
    epRight.position.x = 1.14;
    root.add(wing, epLeft, epRight);

    // High-intensity vertical LED blade headlights
    const hlGeo = new THREE.BoxGeometry(0.08, 0.28, 0.08);
    const hlLeft = new THREE.Mesh(hlGeo, headlightCoreMat);
    hlLeft.position.set(-0.88, 0.38, 2.2);
    const hlRight = hlLeft.clone();
    hlRight.position.x = 0.88;
    root.add(hlLeft, hlRight);

    // Rear diffuser tunnels
    const diffuserGeo = new THREE.BoxGeometry(1.85, 0.25, 0.8);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, 0.24, -2.05);
    diffuser.rotation.x = -0.2;
    root.add(diffuser);

    // High top-mounted twin exhaust exits
    const exGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.24, 12);
    exGeo.rotateX(Math.PI / 2);
    const exLeft = new THREE.Mesh(exGeo, titaniumMat);
    exLeft.position.set(-0.25, 0.65, -1.65);
    const exRight = exLeft.clone();
    exRight.position.x = 0.25;

    // Nitro flames
    const flameGeo = new THREE.ConeGeometry(0.07, 0.45, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const flameLeft = new THREE.Mesh(flameGeo, flameMat);
    flameLeft.position.set(-0.25, 0.65, -1.82);
    const flameRight = flameLeft.clone();
    flameRight.position.x = 0.25;

    root.add(exLeft, exRight, flameLeft, flameRight);
    root.exhaustFires = [flameLeft, flameRight];

    // Rear tail strip
    const tlGeo = new THREE.BoxGeometry(1.8, 0.05, 0.08);
    const tl = new THREE.Mesh(tlGeo, taillightMat);
    tl.position.set(0, 0.52, -2.3);
    root.add(tl);

    // Underglow
    const ugGeo = new THREE.PlaneGeometry(2.0, 4.2);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.05;
    root.add(underglow);
    root.underglow = underglow;

    // 4 LMP1 Center-Lock Wheels
    const wheelPositions: [number, number, number][] = [
      [-0.98, 0.34, 1.45],
      [0.98, 0.34, 1.45],
      [-1.02, 0.36, -1.35],
      [1.02, 0.36, -1.35],
    ];

    wheelPositions.forEach((pos, idx) => {
      const isRight = idx % 2 === 1;
      const isRear = idx >= 2;
      const wheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, isRight, isRear);
      wheel.position.set(pos[0], pos[1], pos[2]);
      root.add(wheel);
      root.wheels.push(wheel);
    });
  }

  // ==========================================
  // 3. JDM WIDEBODY TUNER (RONIN SPEC-V)
  // ==========================================
  private static buildTuner(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    rotorMat: THREE.Material,
    caliperMat: THREE.Material,
    headlightCoreMat: THREE.Material,
    headlightLensMat: THREE.Material,
    taillightMat: THREE.Material,
    titaniumMat: THREE.Material,
    interiorMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Muscular sports coupe lower chassis
    const chassisGeo = new THREE.BoxGeometry(1.95, 0.44, 4.2);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.44;
    root.add(chassis);

    // Aggressive bolt-on widebody box-flare fenders
    const flareGeo = new THREE.BoxGeometry(0.24, 0.38, 1.05);
    // Front flares
    const fFlareLeft = new THREE.Mesh(flareGeo, bodyMat);
    fFlareLeft.position.set(-1.02, 0.48, 1.35);
    const fFlareRight = fFlareLeft.clone();
    fFlareRight.position.x = 1.02;
    // Rear massive flares
    const rFlareLeft = new THREE.Mesh(flareGeo, bodyMat);
    rFlareLeft.position.set(-1.04, 0.5, -1.3);
    const rFlareRight = rFlareLeft.clone();
    rFlareRight.position.x = 1.04;
    root.add(fFlareLeft, fFlareRight, rFlareLeft, rFlareRight);

    // Front high-flow intercooler (aluminum fins visible through bumper)
    const icGeo = new THREE.BoxGeometry(1.3, 0.28, 0.15);
    const icMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
    const ic = new THREE.Mesh(icGeo, icMat);
    ic.position.set(0, 0.28, 2.12);
    root.add(ic);

    // Front bumper air dam & carbon front lip
    const lipGeo = new THREE.BoxGeometry(2.08, 0.06, 0.85);
    const lip = new THREE.Mesh(lipGeo, carbonMat);
    lip.position.set(0, 0.16, 2.2);
    root.add(lip);

    // Vented carbon hood with dual NACA ducts
    const hoodGeo = new THREE.BoxGeometry(1.8, 0.24, 1.3);
    const hood = new THREE.Mesh(hoodGeo, carbonMat);
    hood.position.set(0, 0.54, 1.55);
    hood.rotation.x = 0.07;
    root.add(hood);

    // Tuner greenhouse cabin & fastback roofline
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.52, 1.95);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.86, -0.05);
    root.add(cabin);

    // Interior roll-cage & bucket seats
    const rollBarGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.3, 8);
    rollBarGeo.rotateZ(Math.PI / 2);
    const cageMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
    const rollBar = new THREE.Mesh(rollBarGeo, cageMat);
    rollBar.position.set(0, 0.95, -0.4);
    root.add(rollBar);

    // Integrated rear ducktail trunk spoiler PLUS high-mount GT wing
    const ducktailGeo = new THREE.BoxGeometry(1.7, 0.12, 0.35);
    const ducktail = new THREE.Mesh(ducktailGeo, carbonMat);
    ducktail.position.set(0, 0.72, -1.95);
    ducktail.rotation.x = 0.3;

    const wingBladeGeo = new THREE.BoxGeometry(2.05, 0.05, 0.42);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
    wingBlade.position.set(0, 1.08, -2.05);

    const wingStalkGeo = new THREE.BoxGeometry(0.06, 0.42, 0.15);
    const wsLeft = new THREE.Mesh(wingStalkGeo, carbonMat);
    wsLeft.position.set(-0.55, 0.86, -2.0);
    const wsRight = wsLeft.clone();
    wsRight.position.x = 0.55;
    root.add(ducktail, wingBlade, wsLeft, wsRight);

    // Quad burnt-titanium exhaust cannons (staggered dual-exit)
    const exGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.3, 12);
    exGeo.rotateX(Math.PI / 2);
    const ex1 = new THREE.Mesh(exGeo, titaniumMat);
    ex1.position.set(-0.65, 0.28, -2.15);
    const ex2 = new THREE.Mesh(exGeo, titaniumMat);
    ex2.position.set(-0.48, 0.28, -2.15);
    const ex3 = new THREE.Mesh(exGeo, titaniumMat);
    ex3.position.set(0.48, 0.28, -2.15);
    const ex4 = new THREE.Mesh(exGeo, titaniumMat);
    ex4.position.set(0.65, 0.28, -2.15);

    // Nitro flames
    const flameGeo = new THREE.ConeGeometry(0.065, 0.4, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const f1 = new THREE.Mesh(flameGeo, flameMat);
    f1.position.set(-0.65, 0.28, -2.32);
    const f2 = new THREE.Mesh(flameGeo, flameMat);
    f2.position.set(-0.48, 0.28, -2.32);
    const f3 = new THREE.Mesh(flameGeo, flameMat);
    f3.position.set(0.48, 0.28, -2.32);
    const f4 = new THREE.Mesh(flameGeo, flameMat);
    f4.position.set(0.65, 0.28, -2.32);

    root.add(ex1, ex2, ex3, ex4, f1, f2, f3, f4);
    root.exhaustFires = [f1, f2, f3, f4];

    // Twin rectangular headlights & twin rear round taillights (Skyline style)
    const hlGeo = new THREE.BoxGeometry(0.38, 0.1, 0.1);
    const hlLeft = new THREE.Mesh(hlGeo, headlightCoreMat);
    hlLeft.position.set(-0.65, 0.48, 2.12);
    const hlRight = hlLeft.clone();
    hlRight.position.x = 0.65;
    root.add(hlLeft, hlRight);

    // Iconic twin round taillights
    const roundTlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    roundTlGeo.rotateX(Math.PI / 2);
    const tl1 = new THREE.Mesh(roundTlGeo, taillightMat);
    tl1.position.set(-0.62, 0.52, -2.12);
    const tl2 = new THREE.Mesh(roundTlGeo, taillightMat);
    tl2.position.set(-0.35, 0.52, -2.12);
    const tl3 = new THREE.Mesh(roundTlGeo, taillightMat);
    tl3.position.set(0.35, 0.52, -2.12);
    const tl4 = new THREE.Mesh(roundTlGeo, taillightMat);
    tl4.position.set(0.62, 0.52, -2.12);
    root.add(tl1, tl2, tl3, tl4);

    // Underglow
    const ugGeo = new THREE.PlaneGeometry(2.0, 3.9);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.06;
    root.add(underglow);
    root.underglow = underglow;

    // 4 Deep-Dish Wheels
    const wheelPositions: [number, number, number][] = [
      [-1.02, 0.34, 1.35],
      [1.02, 0.34, 1.35],
      [-1.05, 0.36, -1.3],
      [1.05, 0.36, -1.3],
    ];

    wheelPositions.forEach((pos, idx) => {
      const isRight = idx % 2 === 1;
      const isRear = idx >= 2;
      const wheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, isRight, isRear);
      wheel.position.set(pos[0], pos[1], pos[2]);
      root.add(wheel);
      root.wheels.push(wheel);
    });
  }

  // ==========================================
  // 4. FUTURISTIC SUPERBIKE (PHANTOM BLADE 1200)
  // ==========================================
  private static buildMotorcycle(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    rotorMat: THREE.Material,
    caliperMat: THREE.Material,
    headlightCoreMat: THREE.Material,
    taillightMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Central electric monocoque battery chassis
    const frameGeo = new THREE.BoxGeometry(0.52, 0.48, 1.85);
    const frame = new THREE.Mesh(frameGeo, bodyMat);
    frame.position.set(0, 0.55, 0);
    root.add(frame);

    // Motor cooling heat sink fins
    const finGeo = new THREE.BoxGeometry(0.56, 0.04, 0.8);
    for (let f = 0; f < 4; f++) {
      const fin = new THREE.Mesh(finGeo, carbonMat);
      fin.position.set(0, 0.42 + f * 0.08, -0.1);
      root.add(fin);
    }

    // Sculpted angular front aerodynamic fairing
    const fairingGeo = new THREE.BoxGeometry(0.58, 0.55, 1.1);
    const fairing = new THREE.Mesh(fairingGeo, bodyMat);
    fairing.position.set(0, 0.78, 0.85);
    fairing.rotation.x = -0.22;
    root.add(fairing);

    // Windshield windscreen
    const screenGeo = new THREE.BoxGeometry(0.42, 0.3, 0.55);
    const screen = new THREE.Mesh(screenGeo, glassMat);
    screen.position.set(0, 1.05, 0.75);
    screen.rotation.x = -0.35;
    root.add(screen);

    // Low clip-on handlebars with brake levers
    const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.82, 8);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, carbonMat);
    bar.position.set(0, 0.88, 0.65);
    root.add(bar);

    // Rider seat & sharp aerodynamic tail cowl
    const seatGeo = new THREE.BoxGeometry(0.38, 0.16, 0.75);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.72, -0.2);
    root.add(seat);

    const cowlGeo = new THREE.BoxGeometry(0.42, 0.28, 0.95);
    const cowl = new THREE.Mesh(cowlGeo, bodyMat);
    cowl.position.set(0, 0.82, -0.85);
    cowl.rotation.x = 0.15;
    root.add(cowl);

    // Twin laser slit headlights
    const hlGeo = new THREE.BoxGeometry(0.22, 0.04, 0.08);
    const hlLeft = new THREE.Mesh(hlGeo, headlightCoreMat);
    hlLeft.position.set(-0.16, 0.68, 1.38);
    const hlRight = hlLeft.clone();
    hlRight.position.x = 0.16;
    root.add(hlLeft, hlRight);

    // Twin vertical OLED tail fin lights
    const tlGeo = new THREE.BoxGeometry(0.04, 0.22, 0.08);
    const tlLeft = new THREE.Mesh(tlGeo, taillightMat);
    tlLeft.position.set(-0.14, 0.82, -1.35);
    const tlRight = tlLeft.clone();
    tlRight.position.x = 0.14;
    root.add(tlLeft, tlRight);

    // Single-sided swingarm rear mount
    const armGeo = new THREE.BoxGeometry(0.12, 0.16, 1.2);
    const arm = new THREE.Mesh(armGeo, carbonMat);
    arm.position.set(0.18, 0.42, -0.85);
    arm.rotation.x = -0.12;
    root.add(arm);

    // Front inverted forks
    const forkGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12);
    forkGeo.rotateX(0.25);
    const forkMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const forkLeft = new THREE.Mesh(forkGeo, forkMat);
    forkLeft.position.set(-0.18, 0.52, 1.25);
    const forkRight = forkLeft.clone();
    forkRight.position.x = 0.18;
    root.add(forkLeft, forkRight);

    // Underglow neon
    const ugGeo = new THREE.PlaneGeometry(0.8, 2.6);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.06;
    root.add(underglow);
    root.underglow = underglow;

    // Hubless futuristic wheels with neon glowing inner rings
    const frontWheel = this.createBikeWheel(tireMat, rimMat);
    frontWheel.position.set(0, 0.42, 1.55);
    root.add(frontWheel);
    root.wheels.push(frontWheel);

    const rearWheel = this.createBikeWheel(tireMat, rimMat);
    rearWheel.position.set(0, 0.44, -1.35);
    root.add(rearWheel);
    root.wheels.push(rearWheel);
  }

  // ==========================================
  // WHEEL & BRAKE ROTOR BUILDER HELPERS
  // ==========================================
  private static createHighDetailWheel(
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    rotorMat: THREE.Material,
    caliperMat: THREE.Material,
    isRightSide: boolean,
    isRear: boolean
  ): THREE.Mesh {
    const wheelGroup = new THREE.Group();

    // 1. Performance Chamfered Radial Tire
    const tireRadius = isRear ? 0.38 : 0.35;
    const tireWidth = isRear ? 0.32 : 0.28;
    const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    wheelGroup.add(tire);

    // 2. Open-Ended Hollow Rim Barrel (allows rotor & caliper visibility)
    const rimRadius = tireRadius * 0.74;
    const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, tireWidth + 0.01, 24, 1, true);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rim);

    // Concave stepped outer rim lip
    const lipGeo = new THREE.RingGeometry(rimRadius * 0.88, rimRadius * 0.99, 24);
    lipGeo.rotateY(Math.PI / 2);
    const lipMesh = new THREE.Mesh(lipGeo, rimMat);
    lipMesh.position.x = isRightSide ? (tireWidth / 2) : (-tireWidth / 2);
    wheelGroup.add(lipMesh);

    // 3. Forged Multi-Spoke Geometry (5-split star spokes)
    const spokeOffset = isRightSide ? 0.10 : -0.10;
    const spokeGeo = new THREE.BoxGeometry(0.035, rimRadius * 1.75, 0.035);
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI) / 2.5;
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.x = angle;
      spoke.position.x = spokeOffset;
      wheelGroup.add(spoke);
    }

    // 4. Center-Lock Aluminum Hub Cap
    const hubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 16);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xff0044, metalness: 0.9, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.x = isRightSide ? 0.12 : -0.12;
    wheelGroup.add(hub);

    // 5. Visible Cross-Drilled Metallic Brake Rotor
    const rotorRadius = rimRadius * 0.82;
    const rotorGeo = new THREE.CylinderGeometry(rotorRadius, rotorRadius, 0.02, 24);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.x = isRightSide ? 0.03 : -0.03;
    wheelGroup.add(rotor);

    // 6. Fluorescent Racing Brake Caliper (Clamped at 10 o'clock)
    const caliperGeo = new THREE.BoxGeometry(0.06, 0.18, 0.11);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(isRightSide ? 0.04 : -0.04, 0.16, 0.1);
    caliper.rotation.x = -Math.PI / 5;
    wheelGroup.add(caliper);

    // Outer mesh wrapper for rotational axis during racing
    const wrapper = new THREE.Mesh();
    wrapper.add(wheelGroup);
    return wrapper;
  }

  private static createBikeWheel(tireMat: THREE.Material, rimMat: THREE.Material): THREE.Mesh {
    const wheelGroup = new THREE.Group();

    // Hubless Torus Tire
    const tireGeo = new THREE.TorusGeometry(0.44, 0.12, 16, 32);
    tireGeo.rotateY(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);

    // Rim ring
    const rimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 24, 1, true);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);

    // Inner Glowing Cyan Hubless Neon Ring
    const neonRingGeo = new THREE.TorusGeometry(0.26, 0.025, 8, 24);
    neonRingGeo.rotateY(Math.PI / 2);
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const neonRing = new THREE.Mesh(neonRingGeo, neonMat);

    wheelGroup.add(tire, rim, neonRing);

    const wrapper = new THREE.Mesh();
    wrapper.add(wheelGroup);
    return wrapper;
  }
}
