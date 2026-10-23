import * as THREE from 'three';
import { VehicleCustomization, getDefaultCustomization } from './types.js';

export interface VehicleMeshObject extends THREE.Group {
  wheels: THREE.Mesh[];
  frontSteerNodes?: THREE.Group[];
  chassisGroup?: THREE.Group;
  type: string;
  underglow?: THREE.Mesh;
  underglowMode?: 'solid' | 'pulse' | 'none';
  exhaustFires?: THREE.Mesh[];
  shadowMesh?: THREE.Mesh;
  taillightMeshes?: THREE.Mesh[];
}

// Procedural Soft Contact Shadow Texture
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 128, 12, 64, 128, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
    grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.58)');
    grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.20)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);
  }
  return new THREE.CanvasTexture(canvas);
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
let cachedShadowTex: THREE.CanvasTexture | null = null;
let cachedCarbonTex: THREE.CanvasTexture | null = null;
let cachedRotorTex: THREE.CanvasTexture | null = null;

function getShadowTexture(): THREE.CanvasTexture {
  if (!cachedShadowTex) cachedShadowTex = createContactShadowTexture();
  return cachedShadowTex;
}

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
   * customizable finishes (gloss, satin matte, metallic, forged carbon), GT racing stripes/cyber decals,
   * modular aerodynamic wings, detailed interior cockpit, open-barrel forged wheels, rotors & calipers.
   */
  public static createVehicle(
    vehicleId: string,
    customizationOrColor: string | VehicleCustomization
  ): VehicleMeshObject {
    const group = new THREE.Group() as VehicleMeshObject;
    group.wheels = [];
    group.frontSteerNodes = [];
    group.type = vehicleId;
    group.exhaustFires = [];

    const customization: VehicleCustomization = typeof customizationOrColor === 'string'
      ? getDefaultCustomization(vehicleId, customizationOrColor)
      : customizationOrColor;

    group.underglowMode = customization.underglowMode;

    const carbonTex = getCarbonTexture();
    const rotorTex = getRotorTexture();

    // 1. Premium Automotive Paint (Configurable Finish: Gloss, Matte, Metallic, Forged Carbon)
    let bodyMat: THREE.Material;
    const baseColor = new THREE.Color(customization.color);

    if (customization.paintFinish === 'matte') {
      bodyMat = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 0.12,
        roughness: 0.82,
        clearcoat: 0.0,
        clearcoatRoughness: 1.0,
        reflectivity: 0.15
      });
    } else if (customization.paintFinish === 'metallic') {
      bodyMat = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 0.98,
        roughness: 0.20,
        clearcoat: 0.88,
        clearcoatRoughness: 0.08,
        reflectivity: 0.98
      });
    } else if (customization.paintFinish === 'carbon') {
      const darkColor = baseColor.clone().multiplyScalar(0.55);
      bodyMat = new THREE.MeshPhysicalMaterial({
        color: darkColor,
        metalness: 0.40,
        roughness: 0.35,
        bumpMap: carbonTex,
        bumpScale: 0.05,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        reflectivity: 0.90
      });
    } else {
      // Default: Ultra-reflective dual-layer clearcoat
      bodyMat = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 0.88,
        roughness: 0.16,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 0.95
      });
    }

    // 2. High-Tech Carbon Fiber (Bump-mapped weave pattern)
    const carbonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0b0e14'),
      roughness: 0.35,
      metalness: 0.25,
      bumpMap: carbonTex,
      bumpScale: 0.04
    });

    // 3. Polycarbonate Glass with Configurable Privacy Tint
    let glassMat: THREE.Material;
    if (customization.windowTint === 'clear') {
      glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#38bdf8'),
        roughness: 0.04,
        metalness: 0.1,
        transmission: 0.88,
        ior: 1.5,
        transparent: true,
        opacity: 0.55
      });
    } else if (customization.windowTint === 'dark-limo') {
      glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#020617'),
        roughness: 0.02,
        metalness: 0.3,
        transmission: 0.15,
        ior: 1.55,
        transparent: true,
        opacity: 0.96
      });
    } else if (customization.windowTint === 'chameleon') {
      glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ec4899'),
        roughness: 0.08,
        metalness: 0.65,
        transmission: 0.52,
        ior: 1.62,
        transparent: true,
        opacity: 0.85,
        reflectivity: 0.92
      });
    } else {
      // Default: Smoked glass
      glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#090e18'),
        roughness: 0.04,
        metalness: 0.15,
        transmission: 0.70,
        ior: 1.52,
        transparent: true,
        opacity: 0.88
      });
    }

    // 4. Matte Racing Tire Rubber
    const tireMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#14161b'),
      roughness: 0.85,
      metalness: 0.05
    });

    // 5. Forged Alloy Rims (Custom Color)
    const rimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.rimColor),
      roughness: 0.18,
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

    // 7. Fluorescent Racing Brake Calipers (Custom Color)
    const caliperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(customization.caliperColor),
      roughness: 0.25,
      metalness: 0.65
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
    const isUnderglowActive = customization.underglowColor !== 'none' && customization.underglowMode !== 'none';
    const underglowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(isUnderglowActive ? customization.underglowColor : '#000000'),
      transparent: true,
      opacity: isUnderglowActive ? 0.72 : 0.0
    });

    // Dispatch vehicle construction based on model
    if (vehicleId === 'phantom-bike') {
      this.buildMotorcycle(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, taillightMat, underglowMat, customization);
    } else if (vehicleId === 'f1-apex') {
      this.buildFormulaOne(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, taillightMat, titaniumMat, interiorMat, underglowMat, customization);
    } else if (vehicleId === 'apex-hyper') {
      this.buildHypercar(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, headlightLensMat, taillightMat, titaniumMat, interiorMat, underglowMat, customization);
    } else if (vehicleId === 'ronin-turbo') {
      this.buildTuner(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, headlightLensMat, taillightMat, titaniumMat, interiorMat, underglowMat, customization);
    } else {
      this.buildSupercar(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, rotorMat, caliperMat, headlightCoreMat, headlightLensMat, taillightMat, titaniumMat, interiorMat, underglowMat, customization);
    }

    // Add Livery Graphics (Stripes, Cyber, Esports #07) to articulated chassis
    const chassisTarget = group.chassisGroup || group;
    this.addLiveries(chassisTarget, vehicleId, customization);

    // Add Detailed Interior Cockpit
    if (vehicleId !== 'phantom-bike' && vehicleId !== 'f1-apex') {
      this.addInteriorCockpit(chassisTarget, interiorMat, carbonMat);
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
  // LIVERY DECAL OVERLAYS (STRIPES, CYBER, ESPORTS)
  // ==========================================
  private static addLiveries(root: THREE.Group, vehicleId: string, customization: VehicleCustomization): void {
    if (customization.livery === 'clean') return;

    const baseCol = new THREE.Color(customization.color);
    const luminance = baseCol.r * 0.299 + baseCol.g * 0.587 + baseCol.b * 0.114;
    // Contrasting stripe color
    const stripeHex = luminance > 0.55 ? 0x090d16 : 0xf8fafc;
    const accentHex = luminance > 0.55 ? 0xef4444 : 0x00e5ff;

    const stripeMat = new THREE.MeshStandardMaterial({
      color: stripeHex,
      roughness: 0.3,
      metalness: 0.1
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      roughness: 0.2,
      metalness: 0.5
    });

    if (customization.livery === 'stripes') {
      // 1. Dual Centerline GT Racing Stripes
      // Hood Stripes
      const hoodStripeGeo = new THREE.BoxGeometry(0.18, 0.02, 1.35);
      const hsLeft = new THREE.Mesh(hoodStripeGeo, stripeMat);
      hsLeft.position.set(-0.16, 0.67, 1.48);
      hsLeft.rotation.x = 0.08;
      const hsRight = hsLeft.clone();
      hsRight.position.x = 0.16;

      // Pinstripes
      const pinGeo = new THREE.BoxGeometry(0.025, 0.02, 1.35);
      const pinLeft = new THREE.Mesh(pinGeo, accentMat);
      pinLeft.position.set(-0.30, 0.67, 1.48);
      pinLeft.rotation.x = 0.08;
      const pinRight = pinLeft.clone();
      pinRight.position.x = 0.30;

      // Roof Stripes
      const roofStripeGeo = new THREE.BoxGeometry(0.18, 0.02, 0.95);
      const rsLeft = new THREE.Mesh(roofStripeGeo, stripeMat);
      rsLeft.position.set(-0.16, 1.05, -0.15);
      const rsRight = rsLeft.clone();
      rsRight.position.x = 0.16;

      // Rear Deck Stripes
      const rearStripeGeo = new THREE.BoxGeometry(0.18, 0.02, 0.75);
      const dsLeft = new THREE.Mesh(rearStripeGeo, stripeMat);
      dsLeft.position.set(-0.16, 0.76, -1.75);
      dsLeft.rotation.x = -0.12;
      const dsRight = dsLeft.clone();
      dsRight.position.x = 0.16;

      root.add(hsLeft, hsRight, pinLeft, pinRight, rsLeft, rsRight, dsLeft, dsRight);
    } else if (customization.livery === 'cyber') {
      // 2. High-Tech Cyber Synthwave Speed Strakes & Chevrons
      const strakeGeo = new THREE.BoxGeometry(0.04, 0.12, 1.2);
      strakeGeo.rotateZ(0.25);
      const strakeLeft = new THREE.Mesh(strakeGeo, accentMat);
      strakeLeft.position.set(-0.95, 0.62, 0.2);
      const strakeRight = strakeLeft.clone();
      strakeRight.position.x = 0.95;
      strakeRight.rotation.z = -0.25;

      // Front bumper cyber hash-marks
      const hashGeo = new THREE.BoxGeometry(0.28, 0.02, 0.08);
      for (let i = 0; i < 3; i++) {
        const hashL = new THREE.Mesh(hashGeo, accentMat);
        hashL.position.set(-0.7, 0.66 + i * 0.03, 1.8 - i * 0.12);
        hashL.rotation.y = 0.15;
        const hashR = hashL.clone();
        hashR.position.x = 0.7;
        hashR.rotation.y = -0.15;
        root.add(hashL, hashR);
      }

      // Roof Cyber Protocol Plaque
      const plaqueGeo = new THREE.BoxGeometry(0.65, 0.02, 0.35);
      const plaque = new THREE.Mesh(plaqueGeo, accentMat);
      plaque.position.set(0, 1.05, -0.1);
      root.add(strakeLeft, strakeRight, plaque);
    } else if (customization.livery === 'esports') {
      // 3. Official Apex Esports Championship Number #07 Roundel
      // Door roundels
      const roundelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.02, 32);
      roundelGeo.rotateZ(Math.PI / 2);
      const roundelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const rdLeft = new THREE.Mesh(roundelGeo, roundelMat);
      rdLeft.position.set(-0.95, 0.58, 0.1);

      // Number #07 bar
      const numGeo = new THREE.BoxGeometry(0.02, 0.3, 0.12);
      const numMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
      const numL = new THREE.Mesh(numGeo, numMat);
      numL.position.set(-0.96, 0.58, 0.1);

      const rdRight = rdLeft.clone();
      rdRight.position.x = 0.95;
      const numR = numL.clone();
      numR.position.x = 0.96;

      // Windshield Sunstrip Banner
      const bannerGeo = new THREE.BoxGeometry(1.42, 0.08, 0.02);
      const bannerMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1 });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(0, 0.95, 0.45);
      banner.rotation.x = -0.35;

      root.add(rdLeft, numL, rdRight, numR, banner);
    }
  }

  // ==========================================
  // DETAILED INTERIOR COCKPIT (BUCKET SEATS, ROLL CAGE, HUD)
  // ==========================================
  private static addInteriorCockpit(root: THREE.Group, interiorMat: THREE.Material, carbonMat: THREE.Material): void {
    const cockpitGroup = new THREE.Group();

    // Twin High-Bolster Racing Bucket Seats (Driver & Passenger)
    const seatBaseGeo = new THREE.BoxGeometry(0.42, 0.18, 0.52);
    const seatBackGeo = new THREE.BoxGeometry(0.40, 0.55, 0.14);
    const headrestGeo = new THREE.BoxGeometry(0.24, 0.16, 0.12);

    // Left Seat
    const sBaseL = new THREE.Mesh(seatBaseGeo, interiorMat);
    sBaseL.position.set(-0.35, 0.42, 0.0);
    const sBackL = new THREE.Mesh(seatBackGeo, interiorMat);
    sBackL.position.set(-0.35, 0.68, -0.22);
    sBackL.rotation.x = -0.15;
    const sHeadL = new THREE.Mesh(headrestGeo, interiorMat);
    sHeadL.position.set(-0.35, 0.98, -0.26);

    // Right Seat
    const sBaseR = sBaseL.clone();
    sBaseR.position.x = 0.35;
    const sBackR = sBackL.clone();
    sBackR.position.x = 0.35;
    const sHeadR = sHeadL.clone();
    sHeadR.position.x = 0.35;

    cockpitGroup.add(sBaseL, sBackL, sHeadL, sBaseR, sBackR, sHeadR);

    // Tubular Roll Cage Cross Bar
    const barGeo = new THREE.CylinderGeometry(0.028, 0.028, 1.45, 8);
    barGeo.rotateZ(Math.PI / 2);
    const cageMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const rollBar = new THREE.Mesh(barGeo, cageMat);
    rollBar.position.set(0, 0.88, -0.42);
    cockpitGroup.add(rollBar);

    // Center Console & Racing Shifter
    const consoleGeo = new THREE.BoxGeometry(0.22, 0.22, 0.85);
    const centerConsole = new THREE.Mesh(consoleGeo, carbonMat);
    centerConsole.position.set(0, 0.46, 0.15);
    cockpitGroup.add(centerConsole);

    // Digital Glowing Dashboard Display HUD
    const hudGeo = new THREE.BoxGeometry(0.45, 0.12, 0.04);
    const hudMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
    const hud = new THREE.Mesh(hudGeo, hudMat);
    hud.position.set(-0.35, 0.76, 0.52);
    hud.rotation.x = -0.3;
    cockpitGroup.add(hud);

    root.add(cockpitGroup);
  }

  // ==========================================
  // FORMULA 1 GRAND PRIX SINGLE-SEATER (MATCHING USER REFERENCE PHOTO 2)
  // ==========================================
  private static buildFormulaOne(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    _glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    rotorMat: THREE.Material,
    caliperMat: THREE.Material,
    _headlightCoreMat: THREE.Material,
    taillightMat: THREE.Material,
    titaniumMat: THREE.Material,
    interiorMat: THREE.Material,
    _underglowMat: THREE.Material,
    _customization: VehicleCustomization
  ) {
    const chassis = new THREE.Group();
    root.add(chassis);
    root.chassisGroup = chassis;

    // 1. Carbon Ground Effects Stepped Undertray & Tea Tray
    const floorGeo = new THREE.BoxGeometry(1.65, 0.04, 4.6);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(0, 0.10, 0);
    chassis.add(floor);

    // Side edge floor strakes / edge wings
    const strakeLGeo = new THREE.BoxGeometry(0.04, 0.08, 2.2);
    const strakeL = new THREE.Mesh(strakeLGeo, carbonMat);
    strakeL.position.set(-0.84, 0.12, 0.1);
    const strakeR = strakeL.clone();
    strakeR.position.x = 0.84;
    chassis.add(strakeL, strakeR);

    // 2. Central Monocoque Survival Cell
    const monoGeo = new THREE.BoxGeometry(0.72, 0.38, 2.4);
    const mono = new THREE.Mesh(monoGeo, bodyMat);
    mono.position.set(0, 0.32, 0.1);
    chassis.add(mono);

    // 3. Tapered Front Nosecone
    const noseGeo = new THREE.BoxGeometry(0.52, 0.26, 1.8);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.28, 1.9);
    nose.rotation.x = -0.06;
    chassis.add(nose);

    // Nose tip carbon crash structure
    const tipGeo = new THREE.BoxGeometry(0.28, 0.14, 0.4);
    const tip = new THREE.Mesh(tipGeo, carbonMat);
    tip.position.set(0, 0.21, 2.85);
    chassis.add(tip);

    // 4. Front Aerodynamic Wing Assembly (2.1m wide)
    const fwMainGeo = new THREE.BoxGeometry(2.1, 0.04, 0.45);
    const fwMain = new THREE.Mesh(fwMainGeo, carbonMat);
    fwMain.position.set(0, 0.12, 2.65);

    const fwUpperGeo = new THREE.BoxGeometry(1.95, 0.03, 0.32);
    const fwUpper = new THREE.Mesh(fwUpperGeo, bodyMat);
    fwUpper.position.set(0, 0.20, 2.62);
    fwUpper.rotation.x = 0.12;

    // Front Wing Vertical Endplates
    const fwEpGeo = new THREE.BoxGeometry(0.04, 0.28, 0.65);
    const fwEpL = new THREE.Mesh(fwEpGeo, carbonMat);
    fwEpL.position.set(-1.06, 0.20, 2.65);
    const fwEpR = fwEpL.clone();
    fwEpR.position.x = 1.06;

    chassis.add(fwMain, fwUpper, fwEpL, fwEpR);

    // 5. Radiator Sidepods with Sculpted Undercuts
    const podGeo = new THREE.BoxGeometry(0.44, 0.32, 1.9);
    const podL = new THREE.Mesh(podGeo, bodyMat);
    podL.position.set(-0.58, 0.30, -0.05);
    const podR = podL.clone();
    podR.position.x = 0.58;

    // Radiator Intake Inlets
    const intakeGeo = new THREE.BoxGeometry(0.38, 0.24, 0.08);
    const inL = new THREE.Mesh(intakeGeo, carbonMat);
    inL.position.set(-0.58, 0.30, 0.92);
    const inR = inL.clone();
    inR.position.x = 0.58;

    chassis.add(podL, podR, inL, inR);

    // 6. Cockpit & Driver Helmet
    const cockpitCutGeo = new THREE.BoxGeometry(0.48, 0.25, 0.85);
    const cockpitCut = new THREE.Mesh(cockpitCutGeo, interiorMat);
    cockpitCut.position.set(0, 0.40, 0.35);
    chassis.add(cockpitCut);

    // Driver Helmet (Visible in Photo 2)
    const helmetGeo = new THREE.SphereGeometry(0.14, 16, 12);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.3 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 0.58, 0.32);

    const visorGeo = new THREE.BoxGeometry(0.18, 0.07, 0.12);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.59, 0.40);
    chassis.add(helmet, visor);

    // 7. Titanium Halo Safety Structure (Arching over cockpit)
    const haloTriGeo = new THREE.BoxGeometry(0.04, 0.22, 0.04);
    const haloPillar = new THREE.Mesh(haloTriGeo, carbonMat);
    haloPillar.position.set(0, 0.62, 0.55);
    haloPillar.rotation.x = -0.25;

    const haloHoopGeo = new THREE.TorusGeometry(0.24, 0.025, 8, 16, Math.PI);
    haloHoopGeo.rotateX(Math.PI / 2);
    const haloHoop = new THREE.Mesh(haloHoopGeo, carbonMat);
    haloHoop.position.set(0, 0.72, 0.32);
    chassis.add(haloPillar, haloHoop);

    // 8. Engine Airbox / Induction Scoop (Above driver helmet)
    const airboxGeo = new THREE.BoxGeometry(0.28, 0.32, 1.4);
    const airbox = new THREE.Mesh(airboxGeo, bodyMat);
    airbox.position.set(0, 0.68, -0.45);
    airbox.rotation.x = -0.15;

    const scoopHoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16);
    scoopHoleGeo.rotateX(Math.PI / 2);
    const scoopHole = new THREE.Mesh(scoopHoleGeo, carbonMat);
    scoopHole.position.set(0, 0.82, 0.05);

    // Dorsal shark fin along engine cowl
    const finGeo = new THREE.BoxGeometry(0.02, 0.35, 1.2);
    const fin = new THREE.Mesh(finGeo, carbonMat);
    fin.position.set(0, 0.74, -1.0);
    chassis.add(airbox, scoopHole, fin);

    // 9. Massive High-Downforce Rear Wing (Matching Photo 2)
    const rwMainGeo = new THREE.BoxGeometry(1.68, 0.04, 0.42);
    const rwMain = new THREE.Mesh(rwMainGeo, carbonMat);
    rwMain.position.set(0, 0.88, -1.82);

    const rwFlapGeo = new THREE.BoxGeometry(1.68, 0.03, 0.24);
    const rwFlap = new THREE.Mesh(rwFlapGeo, bodyMat);
    rwFlap.position.set(0, 0.94, -1.78);
    rwFlap.rotation.x = -0.22;

    const rwPylonGeo = new THREE.BoxGeometry(0.04, 0.55, 0.16);
    const rwPylL = new THREE.Mesh(rwPylonGeo, carbonMat);
    rwPylL.position.set(-0.24, 0.62, -1.75);
    const rwPylR = rwPylL.clone();
    rwPylR.position.x = 0.24;

    // Large Vertical Rear Endplates
    const rwEpGeo = new THREE.BoxGeometry(0.04, 0.62, 0.68);
    const rwEpL = new THREE.Mesh(rwEpGeo, carbonMat);
    rwEpL.position.set(-0.85, 0.75, -1.82);
    const rwEpR = rwEpL.clone();
    rwEpR.position.x = 0.85;

    chassis.add(rwMain, rwFlap, rwPylL, rwPylR, rwEpL, rwEpR);

    // 10. Center Flashing Red LED Rain Light (Photo 2 Feature)
    const rainLightGeo = new THREE.BoxGeometry(0.12, 0.08, 0.05);
    const rainLight = new THREE.Mesh(rainLightGeo, taillightMat);
    rainLight.position.set(0, 0.32, -1.86);
    chassis.add(rainLight);
    root.taillightMeshes = [rainLight];

    // 11. Rear Ground Diffuser & Center F1 Exhaust
    const diffGeo = new THREE.BoxGeometry(1.4, 0.18, 0.65);
    const diff = new THREE.Mesh(diffGeo, carbonMat);
    diff.position.set(0, 0.18, -1.90);
    diff.rotation.x = -0.22;
    chassis.add(diff);

    // Diffuser vertical fins
    for (let f = -2; f <= 2; f++) {
      const vFinGeo = new THREE.BoxGeometry(0.02, 0.18, 0.55);
      const vFin = new THREE.Mesh(vFinGeo, carbonMat);
      vFin.position.set(f * 0.28, 0.18, -1.90);
      chassis.add(vFin);
    }

    // F1 Turbo Exhaust Exit
    const exGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16);
    exGeo.rotateX(Math.PI / 2);
    const ex = new THREE.Mesh(exGeo, titaniumMat);
    ex.position.set(0, 0.48, -1.82);

    const flameGeo = new THREE.ConeGeometry(0.07, 0.60, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.48, -2.15);
    chassis.add(ex, flame);
    root.exhaustFires = [flame];

    // 12. Carbon Suspension Wishbone Rods
    const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.48, 8);
    armGeo.rotateZ(Math.PI / 2);

    const fArmL1 = new THREE.Mesh(armGeo, carbonMat);
    fArmL1.position.set(-0.62, 0.38, 1.45);
    const fArmL2 = new THREE.Mesh(armGeo, carbonMat);
    fArmL2.position.set(-0.62, 0.24, 1.45);
    const fArmR1 = fArmL1.clone();
    fArmR1.position.x = 0.62;
    const fArmR2 = fArmL2.clone();
    fArmR2.position.x = 0.62;

    const rArmL1 = new THREE.Mesh(armGeo, carbonMat);
    rArmL1.position.set(-0.65, 0.38, -1.35);
    const rArmL2 = new THREE.Mesh(armGeo, carbonMat);
    rArmL2.position.set(-0.65, 0.24, -1.35);
    const rArmR1 = rArmL1.clone();
    rArmR1.position.x = 0.65;
    const rArmR2 = rArmL2.clone();
    rArmR2.position.x = 0.65;

    chassis.add(fArmL1, fArmL2, fArmR1, fArmR2, rArmL1, rArmL2, rArmR1, rArmR2);

    // 13. Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(2.4, 5.0);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.01;
    root.add(shadowMesh);
    root.shadowMesh = shadowMesh;

    // 14. Four Exposed Slick Tires (With Wide Rear Slicks matching Photo 2)
    root.frontSteerNodes = [];

    // Front Left Wheel with Steering Pivot
    const frontLWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, false, false);
    const steerL = new THREE.Group();
    steerL.position.set(-0.98, 0.35, 1.45);
    steerL.add(frontLWheel);
    root.add(steerL);
    root.frontSteerNodes.push(steerL);
    root.wheels.push(frontLWheel);

    // Front Right Wheel with Steering Pivot
    const frontRWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, true, false);
    const steerR = new THREE.Group();
    steerR.position.set(0.98, 0.35, 1.45);
    steerR.add(frontRWheel);
    root.add(steerR);
    root.frontSteerNodes.push(steerR);
    root.wheels.push(frontRWheel);

    // Massive Wide Rear Left Slick (Photo 2)
    const rearLWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, false, true);
    rearLWheel.position.set(-1.02, 0.36, -1.35);
    root.add(rearLWheel);
    root.wheels.push(rearLWheel);

    // Massive Wide Rear Right Slick (Photo 2)
    const rearRWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, true, true);
    rearRWheel.position.set(1.02, 0.36, -1.35);
    root.add(rearRWheel);
    root.wheels.push(rearRWheel);
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
    underglowMat: THREE.Material,
    customization: VehicleCustomization
  ) {
    const chassis = new THREE.Group();
    root.add(chassis);
    root.chassisGroup = chassis;

    // 1. Sleek Aerodynamic Ground Effects Floor
    const floorGeo = new THREE.BoxGeometry(1.92, 0.08, 4.3);
    const floor = new THREE.Mesh(floorGeo, carbonMat);
    floor.position.set(0, 0.12, 0);
    chassis.add(floor);

    // 2. Sculpted Lower Monocoque (Low, aggressive center of gravity)
    const bodyLowerGeo = new THREE.BoxGeometry(1.86, 0.30, 4.15);
    const bodyLower = new THREE.Mesh(bodyLowerGeo, bodyMat);
    bodyLower.position.set(0, 0.28, 0);
    chassis.add(bodyLower);

    // 3. Aerodynamic Sloping Front Hood (Drops smoothly toward nose)
    const hoodGeo = new THREE.BoxGeometry(1.68, 0.20, 1.55);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(0, 0.40, 1.25);
    hood.rotation.x = 0.11;
    chassis.add(hood);

    // 4. Aggressive Front Nose & Radiator Intake Mouth
    const noseGeo = new THREE.BoxGeometry(1.72, 0.24, 0.55);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.26, 2.08);
    chassis.add(nose);

    // 5. Front Carbon Splitter Blade with Side Dive Winglets
    const splitterGeo = new THREE.BoxGeometry(2.10, 0.05, 0.95);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.10, 2.22);
    chassis.add(splitter);

    const wingletGeo = new THREE.BoxGeometry(0.05, 0.22, 0.38);
    const wL = new THREE.Mesh(wingletGeo, carbonMat);
    wL.position.set(-1.06, 0.20, 2.32);
    const wR = wL.clone();
    wR.position.x = 1.06;
    chassis.add(wL, wR);

    // Front Grille & Red Motorsport Tow Hook
    const grillGeo = new THREE.BoxGeometry(1.35, 0.16, 0.12);
    const grill = new THREE.Mesh(grillGeo, carbonMat);
    grill.position.set(0, 0.22, 2.34);
    chassis.add(grill);

    const towGeo = new THREE.TorusGeometry(0.045, 0.012, 8, 16);
    const towMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const towLoop = new THREE.Mesh(towGeo, towMat);
    towLoop.position.set(0.55, 0.20, 2.40);
    chassis.add(towLoop);

    // Dual Hood Heat Extractor Louvers
    const ventGeo = new THREE.BoxGeometry(0.32, 0.03, 0.45);
    const ventL = new THREE.Mesh(ventGeo, carbonMat);
    ventL.position.set(-0.42, 0.51, 1.25);
    ventL.rotation.x = 0.11;
    const ventR = ventL.clone();
    ventR.position.x = 0.42;
    chassis.add(ventL, ventR);

    // 6. Flared Front Wheel Arches (Fenders)
    const fArchGeo = new THREE.BoxGeometry(0.24, 0.34, 1.05);
    const fArchL = new THREE.Mesh(fArchGeo, bodyMat);
    fArchL.position.set(-0.95, 0.38, 1.35);
    const fArchR = fArchL.clone();
    fArchR.position.x = 0.95;
    chassis.add(fArchL, fArchR);

    // 7. Muscular Rear Haunches (Widebody rear quarter panels)
    const rArchGeo = new THREE.BoxGeometry(0.26, 0.38, 1.15);
    const rArchL = new THREE.Mesh(rArchGeo, bodyMat);
    rArchL.position.set(-0.98, 0.42, -1.35);
    const rArchR = rArchL.clone();
    rArchR.position.x = 0.98;
    chassis.add(rArchL, rArchR);

    // 8. Sculpted Side Air Intake Scoops
    const scoopGeo = new THREE.BoxGeometry(0.12, 0.26, 0.75);
    const scoopL = new THREE.Mesh(scoopGeo, carbonMat);
    scoopL.position.set(-0.92, 0.34, -0.45);
    const scoopR = scoopL.clone();
    scoopR.position.x = 0.92;
    chassis.add(scoopL, scoopR);

    // 9. Aerodynamic Greenhouse Canopy (Sleek Raked Windshield & Fastback Roof)
    const wsGeo = new THREE.BoxGeometry(1.42, 0.04, 0.85);
    const ws = new THREE.Mesh(wsGeo, glassMat);
    ws.position.set(0, 0.68, 0.58);
    ws.rotation.x = -0.58;
    chassis.add(ws);

    const roofGeo = new THREE.BoxGeometry(1.36, 0.05, 0.95);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 0.88, -0.05);
    chassis.add(roof);

    const sideWinGeo = new THREE.BoxGeometry(0.04, 0.28, 1.15);
    const swL = new THREE.Mesh(sideWinGeo, glassMat);
    swL.position.set(-0.70, 0.72, 0.0);
    const swR = swL.clone();
    swR.position.x = 0.70;
    chassis.add(swL, swR);

    const rearGlassGeo = new THREE.BoxGeometry(1.32, 0.04, 0.85);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
    rearGlass.position.set(0, 0.72, -0.78);
    rearGlass.rotation.x = 0.44;
    chassis.add(rearGlass);

    const louverGeo = new THREE.BoxGeometry(1.24, 0.03, 0.70);
    const louver = new THREE.Mesh(louverGeo, carbonMat);
    louver.position.set(0, 0.60, -1.35);
    chassis.add(louver);

    const mirGeo = new THREE.BoxGeometry(0.22, 0.10, 0.14);
    const mirL = new THREE.Mesh(mirGeo, carbonMat);
    mirL.position.set(-0.88, 0.64, 0.45);
    const mirR = mirL.clone();
    mirR.position.x = 0.88;
    chassis.add(mirL, mirR);

    // 10. Projector LED Headlights with Glowing Halos
    const hlHousingGeo = new THREE.BoxGeometry(0.38, 0.09, 0.18);
    const hlL = new THREE.Mesh(hlHousingGeo, headlightCoreMat);
    hlL.position.set(-0.64, 0.40, 2.02);
    hlL.rotation.y = -0.15;
    const hlR = hlL.clone();
    hlR.position.x = 0.64;
    hlR.rotation.y = 0.15;

    const lensGeo = new THREE.BoxGeometry(0.42, 0.11, 0.08);
    const lensL = new THREE.Mesh(lensGeo, headlightLensMat);
    lensL.position.set(-0.64, 0.40, 2.12);
    lensL.rotation.y = -0.15;
    const lensR = lensL.clone();
    lensR.position.x = 0.64;
    lensR.rotation.y = 0.15;
    chassis.add(hlL, hlR, lensL, lensR);

    // 11. Full-Width 3D OLED Neon Red Taillight Blade
    const tlGeo = new THREE.BoxGeometry(1.82, 0.08, 0.08);
    const tl = new THREE.Mesh(tlGeo, taillightMat);
    tl.position.set(0, 0.50, -2.10);
    chassis.add(tl);
    root.taillightMeshes = [tl];

    // 12. Rear 4-Channel Carbon Aerodynamic Ground Diffuser
    const diffGeo = new THREE.BoxGeometry(1.88, 0.22, 0.65);
    const diff = new THREE.Mesh(diffGeo, carbonMat);
    diff.position.set(0, 0.20, -2.05);
    diff.rotation.x = -0.18;
    chassis.add(diff);

    for (let f = -2; f <= 2; f++) {
      if (f === 0) continue;
      const finGeo = new THREE.BoxGeometry(0.04, 0.18, 0.55);
      const fin = new THREE.Mesh(finGeo, carbonMat);
      fin.position.set(f * 0.36, 0.18, -2.10);
      chassis.add(fin);
    }

    // 13. Dual Burnt Titanium Exhaust Tips with Animated Nitro Flames
    const exGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.28, 16);
    exGeo.rotateX(Math.PI / 2);
    const exL = new THREE.Mesh(exGeo, titaniumMat);
    exL.position.set(-0.42, 0.28, -2.20);
    const exR = exL.clone();
    exR.position.x = 0.42;

    const flameGeo = new THREE.ConeGeometry(0.08, 0.55, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const flameL = new THREE.Mesh(flameGeo, flameMat);
    flameL.position.set(-0.42, 0.28, -2.50);
    const flameR = flameL.clone();
    flameR.position.x = 0.42;

    chassis.add(exL, exR, flameL, flameR);
    root.exhaustFires = [flameL, flameR];

    // 14. Modular GT3 Rear Wing / Spoiler
    if (customization.spoilerStyle === 'gt-wing') {
      const bladeGeo = new THREE.BoxGeometry(2.18, 0.05, 0.46);
      const blade = new THREE.Mesh(bladeGeo, carbonMat);
      blade.position.set(0, 1.04, -1.95);

      const pylonGeo = new THREE.BoxGeometry(0.05, 0.46, 0.20);
      const pylL = new THREE.Mesh(pylonGeo, carbonMat);
      pylL.position.set(-0.52, 0.78, -1.88);
      pylL.rotation.x = -0.15;
      const pylR = pylL.clone();
      pylR.position.x = 0.52;

      const epGeo = new THREE.BoxGeometry(0.04, 0.32, 0.52);
      const epL = new THREE.Mesh(epGeo, carbonMat);
      epL.position.set(-1.10, 1.04, -1.95);
      const epR = epL.clone();
      epR.position.x = 1.10;

      chassis.add(blade, pylL, pylR, epL, epR);
    } else if (customization.spoilerStyle === 'ducktail') {
      const dtGeo = new THREE.BoxGeometry(1.86, 0.18, 0.24);
      const dt = new THREE.Mesh(dtGeo, carbonMat);
      dt.position.set(0, 0.68, -2.04);
      dt.rotation.x = 0.42;
      chassis.add(dt);
    } else {
      const lipGeo = new THREE.BoxGeometry(1.75, 0.04, 0.16);
      const lip = new THREE.Mesh(lipGeo, carbonMat);
      lip.position.set(0, 0.64, -2.10);
      chassis.add(lip);
    }

    // 15. Ground Contact Shadow & Underglow
    const shadowGeo = new THREE.PlaneGeometry(2.35, 4.7);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.01;
    root.add(shadowMesh);
    root.shadowMesh = shadowMesh;

    const ugGeo = new THREE.PlaneGeometry(1.9, 4.0);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.04;
    root.add(underglow);
    root.underglow = underglow;

    // 16. Four High-Detail Alloy Wheels with Front Steering Pivots
    root.frontSteerNodes = [];

    // Front Left Wheel with Steering Pivot
    const frontLWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, false, false);
    const steerL = new THREE.Group();
    steerL.position.set(-1.02, 0.35, 1.35);
    steerL.add(frontLWheel);
    root.add(steerL);
    root.frontSteerNodes.push(steerL);
    root.wheels.push(frontLWheel);

    // Front Right Wheel with Steering Pivot
    const frontRWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, true, false);
    const steerR = new THREE.Group();
    steerR.position.set(1.02, 0.35, 1.35);
    steerR.add(frontRWheel);
    root.add(steerR);
    root.frontSteerNodes.push(steerR);
    root.wheels.push(frontRWheel);

    // Rear Left Wheel (Fixed hub)
    const rearLWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, false, true);
    rearLWheel.position.set(-1.04, 0.36, -1.35);
    root.add(rearLWheel);
    root.wheels.push(rearLWheel);

    // Rear Right Wheel (Fixed hub)
    const rearRWheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, true, true);
    rearRWheel.position.set(1.04, 0.36, -1.35);
    root.add(rearRWheel);
    root.wheels.push(rearRWheel);
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
    underglowMat: THREE.Material,
    customization: VehicleCustomization
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

    // Modular Rear Wing
    if (customization.spoilerStyle !== 'stock') {
      const wingGeo = new THREE.BoxGeometry(2.32, 0.05, 0.54);
      const wing = new THREE.Mesh(wingGeo, carbonMat);
      wing.position.set(0, 0.98, -2.15);

      const endplateGeo = new THREE.BoxGeometry(0.05, 0.45, 0.65);
      const epLeft = new THREE.Mesh(endplateGeo, carbonMat);
      epLeft.position.set(-1.14, 0.98, -2.15);
      const epRight = epLeft.clone();
      epRight.position.x = 1.14;
      root.add(wing, epLeft, epRight);
    } else {
      const lowWingGeo = new THREE.BoxGeometry(1.95, 0.05, 0.35);
      const lowWing = new THREE.Mesh(lowWingGeo, carbonMat);
      lowWing.position.set(0, 0.76, -2.15);
      root.add(lowWing);
    }

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
    root.taillightMeshes = [tl];

    // Contact shadow & underglow
    const shadowGeo = new THREE.PlaneGeometry(2.3, 4.8);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.01;
    root.add(shadowMesh);
    root.shadowMesh = shadowMesh;

    const ugGeo = new THREE.PlaneGeometry(2.0, 4.2);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.05;
    root.add(underglow);
    root.underglow = underglow;

    // 4 LMP1 Center-Lock Wheels with Front Steering Pivots
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
      if (!isRear) {
        const steerNode = new THREE.Group();
        steerNode.position.set(pos[0], pos[1], pos[2]);
        steerNode.add(wheel);
        root.add(steerNode);
        if (!root.frontSteerNodes) root.frontSteerNodes = [];
        root.frontSteerNodes.push(steerNode);
      } else {
        wheel.position.set(pos[0], pos[1], pos[2]);
        root.add(wheel);
      }
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
    underglowMat: THREE.Material,
    customization: VehicleCustomization
  ) {
    // Muscular sports coupe lower chassis
    const chassisGeo = new THREE.BoxGeometry(1.95, 0.44, 4.2);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.44;
    root.add(chassis);

    // Aggressive bolt-on widebody box-flare fenders
    const flareGeo = new THREE.BoxGeometry(0.24, 0.38, 1.05);
    const fFlareLeft = new THREE.Mesh(flareGeo, bodyMat);
    fFlareLeft.position.set(-1.02, 0.48, 1.35);
    const fFlareRight = fFlareLeft.clone();
    fFlareRight.position.x = 1.02;

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

    // Front Canards / Dive Planes
    const canardGeo = new THREE.BoxGeometry(0.24, 0.02, 0.18);
    const canardL = new THREE.Mesh(canardGeo, carbonMat);
    canardL.position.set(-1.04, 0.38, 2.05);
    canardL.rotation.z = -0.2;
    const canardR = canardL.clone();
    canardR.position.x = 1.04;
    canardR.rotation.z = 0.2;
    root.add(canardL, canardR);

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

    // Modular Rear Spoiler for Tuner
    if (customization.spoilerStyle === 'gt-wing') {
      const wingBladeGeo = new THREE.BoxGeometry(2.05, 0.05, 0.42);
      const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
      wingBlade.position.set(0, 1.08, -2.05);

      const wingStalkGeo = new THREE.BoxGeometry(0.06, 0.42, 0.15);
      const wsLeft = new THREE.Mesh(wingStalkGeo, carbonMat);
      wsLeft.position.set(-0.55, 0.86, -2.0);
      const wsRight = wsLeft.clone();
      wsRight.position.x = 0.55;
      root.add(wingBlade, wsLeft, wsRight);
    } else {
      // Ducktail trunk spoiler
      const ducktailGeo = new THREE.BoxGeometry(1.7, 0.14, 0.35);
      const ducktail = new THREE.Mesh(ducktailGeo, carbonMat);
      ducktail.position.set(0, 0.74, -1.95);
      ducktail.rotation.x = 0.35;
      root.add(ducktail);
    }

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
    root.taillightMeshes = [tl1, tl2, tl3, tl4];

    // Contact shadow & underglow
    const shadowGeo = new THREE.PlaneGeometry(2.35, 4.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.01;
    root.add(shadowMesh);
    root.shadowMesh = shadowMesh;

    const ugGeo = new THREE.PlaneGeometry(2.0, 3.9);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.05;
    root.add(underglow);
    root.underglow = underglow;

    // 4 Wide Custom Wheels with Front Steering Pivots
    const wheelPositions: [number, number, number][] = [
      [-1.02, 0.35, 1.35],
      [1.02, 0.35, 1.35],
      [-1.05, 0.37, -1.3],
      [1.05, 0.37, -1.3],
    ];

    wheelPositions.forEach((pos, idx) => {
      const isRight = idx % 2 === 1;
      const isRear = idx >= 2;
      const wheel = this.createHighDetailWheel(tireMat, rimMat, rotorMat, caliperMat, isRight, isRear);
      if (!isRear) {
        const steerNode = new THREE.Group();
        steerNode.position.set(pos[0], pos[1], pos[2]);
        steerNode.add(wheel);
        root.add(steerNode);
        if (!root.frontSteerNodes) root.frontSteerNodes = [];
        root.frontSteerNodes.push(steerNode);
      } else {
        wheel.position.set(pos[0], pos[1], pos[2]);
        root.add(wheel);
      }
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
    underglowMat: THREE.Material,
    customization: VehicleCustomization
  ) {
    // Ultra-slim composite spine & battery pack
    const spineGeo = new THREE.BoxGeometry(0.34, 0.45, 1.8);
    const spine = new THREE.Mesh(spineGeo, carbonMat);
    spine.position.set(0, 0.55, 0);
    root.add(spine);

    // Sharp aerodynamic front fairing cowl
    const fairingGeo = new THREE.ConeGeometry(0.36, 1.0, 16);
    fairingGeo.rotateX(-Math.PI / 2);
    const fairing = new THREE.Mesh(fairingGeo, bodyMat);
    fairing.position.set(0, 0.72, 1.05);
    fairing.scale.set(1.0, 0.8, 1.0);
    root.add(fairing);

    // Aerodynamic smoked windscreen
    const screenGeo = new THREE.BoxGeometry(0.28, 0.35, 0.04);
    const screen = new THREE.Mesh(screenGeo, glassMat);
    screen.position.set(0, 0.98, 0.9);
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

    // Front inverted gold forks
    const forkGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12);
    forkGeo.rotateX(0.25);
    const forkMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const forkLeft = new THREE.Mesh(forkGeo, forkMat);
    forkLeft.position.set(-0.18, 0.52, 1.25);
    const forkRight = forkLeft.clone();
    forkRight.position.x = 0.18;
    root.add(forkLeft, forkRight);

    // Contact shadow & underglow
    const shadowGeo = new THREE.PlaneGeometry(1.2, 3.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.01;
    root.add(shadowMesh);
    root.shadowMesh = shadowMesh;

    const ugGeo = new THREE.PlaneGeometry(0.8, 2.6);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.06;
    root.add(underglow);
    root.underglow = underglow;

    // Hubless futuristic wheels with neon glowing inner rings & front steering pivot
    const frontWheel = this.createBikeWheel(tireMat, rimMat);
    const steerNode = new THREE.Group();
    steerNode.position.set(0, 0.42, 1.55);
    steerNode.add(frontWheel);
    root.add(steerNode);
    if (!root.frontSteerNodes) root.frontSteerNodes = [];
    root.frontSteerNodes.push(steerNode);
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
