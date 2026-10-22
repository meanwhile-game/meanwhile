import * as THREE from 'three';

export interface VehicleMeshObject extends THREE.Group {
  wheels: THREE.Mesh[];
  type: string;
  underglow?: THREE.Mesh;
  exhaustFires?: THREE.Mesh[];
}

export class VehicleFactory {
  /**
   * Builds a genuine, high-detail 3D vehicle mesh with animated wheels and lighting
   */
  public static createVehicle(vehicleId: string, colorHex: string): VehicleMeshObject {
    const group = new THREE.Group() as VehicleMeshObject;
    group.wheels = [];
    group.type = vehicleId;
    group.exhaustFires = [];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.25,
      metalness: 0.85,
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#151821'),
      roughness: 0.5,
      metalness: 0.3,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0a1120'),
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1c1e24'),
      roughness: 0.8,
      metalness: 0.1,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#cbd5e1'),
      roughness: 0.3,
      metalness: 0.9,
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e0f2fe'),
      emissive: new THREE.Color('#38bdf8'),
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ff2244'),
      emissive: new THREE.Color('#ff0033'),
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });

    const underglowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.6,
    });

    if (vehicleId === 'phantom-bike') {
      // --- FUTURISTIC MOTORCYCLE ---
      this.buildMotorcycle(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, headlightMat, taillightMat, underglowMat);
    } else if (vehicleId === 'apex-hyper') {
      // --- LE MANS / FORMULA HYPERCAR ---
      this.buildHypercar(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, headlightMat, taillightMat, underglowMat);
    } else if (vehicleId === 'ronin-turbo') {
      // --- JDM WIDEBODY TUNER ---
      this.buildTuner(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, headlightMat, taillightMat, underglowMat);
    } else {
      // --- CYBER GT SUPERCAR (Default) ---
      this.buildSupercar(group, bodyMat, carbonMat, glassMat, tireMat, rimMat, headlightMat, taillightMat, underglowMat);
    }

    // Cast shadows for all meshes
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  // --- CYBER GT SUPERCAR ---
  private static buildSupercar(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    headlightMat: THREE.Material,
    taillightMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Main lower chassis
    const chassisGeo = new THREE.BoxGeometry(2.0, 0.42, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.45;
    root.add(chassis);

    // Aerodynamic wedge nose
    const noseGeo = new THREE.BoxGeometry(1.85, 0.32, 1.2);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.38, 2.5);
    nose.rotation.x = 0.08;
    root.add(nose);

    // Front carbon splitter
    const splitterGeo = new THREE.BoxGeometry(2.1, 0.06, 1.0);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.2, 2.7);
    root.add(splitter);

    // Cabin greenhouse / roof
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.5, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.85, -0.1);
    root.add(cabin);

    // Roof scoop
    const scoopGeo = new THREE.BoxGeometry(0.35, 0.15, 0.8);
    const scoop = new THREE.Mesh(scoopGeo, carbonMat);
    scoop.position.set(0, 1.15, -0.3);
    root.add(scoop);

    // Rear engine cover
    const deckGeo = new THREE.BoxGeometry(1.7, 0.38, 1.3);
    const deck = new THREE.Mesh(deckGeo, bodyMat);
    deck.position.set(0, 0.6, -1.6);
    root.add(deck);

    // Rear carbon wing
    const wingBladeGeo = new THREE.BoxGeometry(2.1, 0.06, 0.45);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
    wingBlade.position.set(0, 1.1, -2.1);
    root.add(wingBlade);

    // Wing struts
    const strutGeo = new THREE.BoxGeometry(0.06, 0.45, 0.15);
    const leftStrut = new THREE.Mesh(strutGeo, carbonMat);
    leftStrut.position.set(-0.55, 0.85, -2.05);
    const rightStrut = leftStrut.clone();
    rightStrut.position.x = 0.55;
    root.add(leftStrut, rightStrut);

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.4, 0.08, 0.1);
    const hlLeft = new THREE.Mesh(hlGeo, headlightMat);
    hlLeft.position.set(-0.7, 0.45, 3.05);
    const hlRight = hlLeft.clone();
    hlRight.position.x = 0.7;
    root.add(hlLeft, hlRight);

    // Rear taillights strip
    const tlGeo = new THREE.BoxGeometry(1.7, 0.08, 0.1);
    const tl = new THREE.Mesh(tlGeo, taillightMat);
    tl.position.set(0, 0.55, -2.22);
    root.add(tl);

    // Exhaust ports with nitro glow
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const exLeft = new THREE.Mesh(exhaustGeo, exhaustMat);
    exLeft.position.set(-0.35, 0.32, -2.25);
    const exRight = exLeft.clone();
    exRight.position.x = 0.35;
    root.add(exLeft, exRight);
    root.exhaustFires = [exLeft, exRight];

    // Underglow neon
    const ugGeo = new THREE.PlaneGeometry(1.8, 3.8);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.08;
    root.add(underglow);
    root.underglow = underglow;

    // 4 Wheels
    const wheelPositions: [number, number, number][] = [
      [-1.02, 0.35, 1.45],  // Front Left
      [1.02, 0.35, 1.45],   // Front Right
      [-1.05, 0.38, -1.35], // Rear Left
      [1.05, 0.38, -1.35],  // Rear Right
    ];

    wheelPositions.forEach((pos, idx) => {
      const wheel = this.createWheel(tireMat, rimMat, idx % 2 === 1);
      wheel.position.set(pos[0], pos[1], pos[2]);
      root.add(wheel);
      root.wheels.push(wheel);
    });
  }

  // --- LE MANS / FORMULA HYPERCAR ---
  private static buildHypercar(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    headlightMat: THREE.Material,
    taillightMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Low central monocoque
    const monoGeo = new THREE.BoxGeometry(1.2, 0.36, 4.6);
    const mono = new THREE.Mesh(monoGeo, bodyMat);
    mono.position.y = 0.4;
    root.add(mono);

    // Wide aero side pods
    const podGeo = new THREE.BoxGeometry(0.5, 0.3, 2.2);
    const podLeft = new THREE.Mesh(podGeo, bodyMat);
    podLeft.position.set(-0.85, 0.38, 0.1);
    const podRight = podLeft.clone();
    podRight.position.x = 0.85;
    root.add(podLeft, podRight);

    // Cockpit bubble canopy
    const canopyGeo = new THREE.SphereGeometry(0.65, 16, 12);
    canopyGeo.scale(0.9, 0.8, 1.8);
    const canopy = new THREE.Mesh(canopyGeo, glassMat);
    canopy.position.set(0, 0.65, 0.3);
    root.add(canopy);

    // Central shark fin
    const finGeo = new THREE.BoxGeometry(0.05, 0.5, 2.0);
    const fin = new THREE.Mesh(finGeo, carbonMat);
    fin.position.set(0, 0.85, -1.0);
    root.add(fin);

    // Monster rear wing
    const wingGeo = new THREE.BoxGeometry(2.3, 0.05, 0.5);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 0.95, -2.2);
    root.add(wing);

    // Front Le Mans high-intensity vertical LED blade lights
    const hlGeo = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const hlLeft = new THREE.Mesh(hlGeo, headlightMat);
    hlLeft.position.set(-0.9, 0.38, 2.2);
    const hlRight = hlLeft.clone();
    hlRight.position.x = 0.9;
    root.add(hlLeft, hlRight);

    // Central F1 rain light
    const rainLightGeo = new THREE.BoxGeometry(0.2, 0.15, 0.08);
    const rainLight = new THREE.Mesh(rainLightGeo, taillightMat);
    rainLight.position.set(0, 0.32, -2.32);
    root.add(rainLight);

    // Underglow neon
    const ugGeo = new THREE.PlaneGeometry(1.8, 4.0);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.08;
    root.add(underglow);
    root.underglow = underglow;

    // 4 Open/Semi-open Wheels
    const wheelPositions: [number, number, number][] = [
      [-1.1, 0.36, 1.6],
      [1.1, 0.36, 1.6],
      [-1.15, 0.38, -1.4],
      [1.15, 0.38, -1.4],
    ];

    wheelPositions.forEach((pos, idx) => {
      const wheel = this.createWheel(tireMat, rimMat, idx % 2 === 1);
      wheel.position.set(pos[0], pos[1], pos[2]);
      root.add(wheel);
      root.wheels.push(wheel);
    });
  }

  // --- FUTURISTIC SUPERBIKE / MOTORCYCLE ---
  private static buildMotorcycle(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    headlightMat: THREE.Material,
    taillightMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Lean motorcycle frame
    const frameGeo = new THREE.BoxGeometry(0.48, 0.55, 2.2);
    const frame = new THREE.Mesh(frameGeo, bodyMat);
    frame.position.y = 0.65;
    root.add(frame);

    // Front fairing & aerodynamic windscreen
    const cowlGeo = new THREE.ConeGeometry(0.35, 0.9, 8);
    cowlGeo.rotateX(-Math.PI / 2);
    const cowl = new THREE.Mesh(cowlGeo, bodyMat);
    cowl.position.set(0, 0.72, 1.15);
    root.add(cowl);

    const screenGeo = new THREE.BoxGeometry(0.3, 0.28, 0.45);
    screenGeo.rotateX(0.4);
    const screen = new THREE.Mesh(screenGeo, glassMat);
    screen.position.set(0, 0.98, 0.85);
    root.add(screen);

    // Handlebars
    const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8);
    barGeo.rotateZ(Math.PI / 2);
    const bars = new THREE.Mesh(barGeo, carbonMat);
    bars.position.set(0, 0.88, 0.75);
    root.add(bars);

    // Rider seat
    const seatGeo = new THREE.BoxGeometry(0.36, 0.15, 0.7);
    const seat = new THREE.Mesh(seatGeo, carbonMat);
    seat.position.set(0, 0.75, -0.2);
    root.add(seat);

    // High twin exhaust pipes
    const pipeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    pipeGeo.rotateX(Math.PI / 2);
    const pipeLeft = new THREE.Mesh(pipeGeo, carbonMat);
    pipeLeft.position.set(-0.2, 0.7, -1.0);
    const pipeRight = pipeLeft.clone();
    pipeRight.position.x = 0.2;
    root.add(pipeLeft, pipeRight);

    // Headlight
    const hlGeo = new THREE.BoxGeometry(0.24, 0.08, 0.08);
    const hl = new THREE.Mesh(hlGeo, headlightMat);
    hl.position.set(0, 0.65, 1.6);
    root.add(hl);

    // Tail LED
    const tlGeo = new THREE.BoxGeometry(0.2, 0.06, 0.06);
    const tl = new THREE.Mesh(tlGeo, taillightMat);
    tl.position.set(0, 0.8, -1.25);
    root.add(tl);

    // Underglow neon
    const ugGeo = new THREE.PlaneGeometry(0.8, 2.5);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.08;
    root.add(underglow);
    root.underglow = underglow;

    // 2 Large motorcycle wheels (Front & Rear)
    const frontWheel = this.createBikeWheel(tireMat, rimMat);
    frontWheel.position.set(0, 0.45, 1.25);
    root.add(frontWheel);
    root.wheels.push(frontWheel);

    const rearWheel = this.createBikeWheel(tireMat, rimMat);
    rearWheel.position.set(0, 0.45, -1.05);
    root.add(rearWheel);
    root.wheels.push(rearWheel);
  }

  // --- JDM WIDEBODY TUNER ---
  private static buildTuner(
    root: VehicleMeshObject,
    bodyMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    tireMat: THREE.Material,
    rimMat: THREE.Material,
    headlightMat: THREE.Material,
    taillightMat: THREE.Material,
    underglowMat: THREE.Material
  ) {
    // Muscular sports body
    const bodyGeo = new THREE.BoxGeometry(2.05, 0.5, 4.3);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.48;
    root.add(body);

    // Carbon fiber hood
    const hoodGeo = new THREE.BoxGeometry(1.65, 0.06, 1.4);
    const hood = new THREE.Mesh(hoodGeo, carbonMat);
    hood.position.set(0, 0.74, 1.2);
    root.add(hood);

    // Fastback roof & greenhouse
    const roofGeo = new THREE.BoxGeometry(1.5, 0.55, 1.9);
    const roof = new THREE.Mesh(roofGeo, glassMat);
    roof.position.set(0, 0.95, -0.2);
    root.add(roof);

    // Big GT wing
    const wingGeo = new THREE.BoxGeometry(2.0, 0.06, 0.4);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.15, -2.05);
    root.add(wing);

    const strutGeo = new THREE.BoxGeometry(0.06, 0.45, 0.1);
    const s1 = new THREE.Mesh(strutGeo, carbonMat);
    s1.position.set(-0.6, 0.92, -2.0);
    const s2 = s1.clone();
    s2.position.x = 0.6;
    root.add(s1, s2);

    // Quad LED headlights
    const hlGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
    hlGeo.rotateX(Math.PI / 2);
    const hl1 = new THREE.Mesh(hlGeo, headlightMat);
    hl1.position.set(-0.65, 0.55, 2.16);
    const hl2 = hl1.clone();
    hl2.position.x = -0.45;
    const hl3 = hl1.clone();
    hl3.position.x = 0.45;
    const hl4 = hl1.clone();
    hl4.position.x = 0.65;
    root.add(hl1, hl2, hl3, hl4);

    // Quad round taillights
    const tlGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
    tlGeo.rotateX(Math.PI / 2);
    const tl1 = new THREE.Mesh(tlGeo, taillightMat);
    tl1.position.set(-0.65, 0.55, -2.16);
    const tl2 = tl1.clone();
    tl2.position.x = -0.4;
    const tl3 = tl1.clone();
    tl3.position.x = 0.4;
    const tl4 = tl1.clone();
    tl4.position.x = 0.65;
    root.add(tl1, tl2, tl3, tl4);

    // Giant single tuner exhaust cannon
    const exhaustGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(0.65, 0.28, -2.2);
    root.add(exhaust);
    root.exhaustFires = [exhaust];

    // Underglow neon
    const ugGeo = new THREE.PlaneGeometry(1.9, 3.8);
    ugGeo.rotateX(-Math.PI / 2);
    const underglow = new THREE.Mesh(ugGeo, underglowMat);
    underglow.position.y = 0.08;
    root.add(underglow);
    root.underglow = underglow;

    // 4 Wide Wheels
    const wheelPositions: [number, number, number][] = [
      [-1.05, 0.36, 1.35],
      [1.05, 0.36, 1.35],
      [-1.08, 0.38, -1.35],
      [1.08, 0.38, -1.35],
    ];

    wheelPositions.forEach((pos, idx) => {
      const wheel = this.createWheel(tireMat, rimMat, idx % 2 === 1);
      wheel.position.set(pos[0], pos[1], pos[2]);
      root.add(wheel);
      root.wheels.push(wheel);
    });
  }

  // --- WHEEL BUILDER HELPERS ---
  private static createWheel(tireMat: THREE.Material, rimMat: THREE.Material, isRightSide: boolean): THREE.Mesh {
    const wheelGroup = new THREE.Group();

    // Tire
    const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.26, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);

    // Rim hub
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.27, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);

    // Alloy spokes
    const spokeGeo = new THREE.BoxGeometry(0.04, 0.38, 0.04);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.x = (i * Math.PI) / 2.5;
      spoke.position.x = isRightSide ? 0.08 : -0.08;
      wheelGroup.add(spoke);
    }

    wheelGroup.add(tire, rim);

    // Wrap in an outer mesh to satisfy TypeScript and allow easy .rotation.x manipulation
    const wrapper = new THREE.Mesh();
    wrapper.add(wheelGroup);
    return wrapper;
  }

  private static createBikeWheel(tireMat: THREE.Material, rimMat: THREE.Material): THREE.Mesh {
    const wheelGroup = new THREE.Group();

    const tireGeo = new THREE.TorusGeometry(0.42, 0.12, 12, 24);
    tireGeo.rotateY(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);

    const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.14, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);

    wheelGroup.add(tire, rim);

    const wrapper = new THREE.Mesh();
    wrapper.add(wheelGroup);
    return wrapper;
  }
}
