import * as THREE from 'three';
import { VehicleFactory, VehicleMeshObject } from './VehicleFactory.js';
import { VehicleCustomization, getDefaultCustomization } from './types.js';

export type CameraPreset = 'hero' | 'wheels' | 'aero' | 'front';

export class GarageSceneManager {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  private vehicleMesh: VehicleMeshObject | null = null;
  private turntable: THREE.Group;
  private isUserInteracting: boolean = false;
  private mouseX: number = 0;
  private targetRotationY: number = 0;
  private currentRotationY: number = 0;
  private autoRotate: boolean = true;

  // Dynamic Camera Controls
  private targetCamPos: THREE.Vector3 = new THREE.Vector3(3.8, 1.8, 4.8);
  private currentCamLookAt: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0);
  private targetCamLookAt: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0);

  // Wheel Rev State
  private wheelSpinSpeed: number = 0;
  private lastTime: number = performance.now();

  constructor(
    container: HTMLDivElement,
    vehicleId: string,
    customizationOrColor: string | VehicleCustomization
  ) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06070a);
    this.scene.fog = new THREE.Fog(0x06070a, 12, 35);

    // Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.copy(this.targetCamPos);
    this.camera.lookAt(this.currentCamLookAt);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    container.appendChild(this.renderer.domElement);

    // Turntable platform
    this.turntable = new THREE.Group();
    this.scene.add(this.turntable);

    this.setupStudioFloor();
    this.setupStudioLighting();
    this.loadVehicle(vehicleId, customizationOrColor);

    // Bind interaction events
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    window.addEventListener('resize', this.handleResize);
    container.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);

    this.animate();
  }

  private setupStudioFloor(): void {
    // Holographic Turntable Pedestal
    const floorGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.22, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e17,
      roughness: 0.18,
      metalness: 0.85,
    });
    const platform = new THREE.Mesh(floorGeo, floorMat);
    platform.position.y = -0.11;
    platform.receiveShadow = true;
    this.turntable.add(platform);

    // Glowing Neon Rim Ring
    const ringGeo = new THREE.TorusGeometry(4.25, 0.045, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    this.turntable.add(ring);

    // Subtly lit radial ring markings
    const innerRingGeo = new THREE.RingGeometry(2.2, 2.24, 48);
    innerRingGeo.rotateX(-Math.PI / 2);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.4 });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.position.y = 0.015;
    this.turntable.add(innerRing);
  }

  private setupStudioLighting(): void {
    const ambLight = new THREE.AmbientLight(0xffffff, 1.3);
    this.scene.add(ambLight);

    // Overhead Studio Softbox Light (highlights vehicle hood & roof lines)
    const topLight = new THREE.DirectionalLight(0xffffff, 3.8);
    topLight.position.set(0, 10, 0);
    this.scene.add(topLight);

    // Front-Right Studio Key Spotlight
    const spotKey = new THREE.SpotLight(0xffffff, 5.2);
    spotKey.position.set(6, 7, 6);
    spotKey.angle = Math.PI / 4;
    spotKey.penumbra = 0.6;
    spotKey.castShadow = true;
    spotKey.shadow.mapSize.width = 1024;
    spotKey.shadow.mapSize.height = 1024;
    this.scene.add(spotKey);

    // Cyan Rim Light (edges & side aero)
    const spotRim = new THREE.SpotLight(0x00e5ff, 4.8);
    spotRim.position.set(-7, 6, -6);
    spotRim.angle = Math.PI / 3;
    spotRim.penumbra = 0.8;
    this.scene.add(spotRim);

    // Warm Coral Accent Rim Light
    const rimAccent = new THREE.SpotLight(0xff0066, 3.4);
    rimAccent.position.set(6, 4, -7);
    rimAccent.angle = Math.PI / 3;
    rimAccent.penumbra = 0.7;
    this.scene.add(rimAccent);

    // Front Fill Light
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
    fillLight.position.set(0, 2, 6);
    this.scene.add(fillLight);
  }

  public loadVehicle(
    vehicleId: string,
    customizationOrColor: string | VehicleCustomization
  ): void {
    if (this.vehicleMesh) {
      this.turntable.remove(this.vehicleMesh);
    }
    this.vehicleMesh = VehicleFactory.createVehicle(vehicleId, customizationOrColor);
    this.turntable.add(this.vehicleMesh);
  }

  public updateColor(vehicleId: string, colorHex: string): void {
    this.loadVehicle(vehicleId, colorHex);
  }

  public updateCustomization(vehicleId: string, customization: VehicleCustomization): void {
    this.loadVehicle(vehicleId, customization);
  }

  /**
   * Smoothly animates the studio camera to inspect specific vehicle zones:
   * 'hero' = overall 3/4 beauty angle
   * 'wheels' = close-up on front forged rim, drilled rotor, and caliper
   * 'aero' = rear spoiler, diffuser, and exhaust tips
   * 'front' = low-angle front fascia, splitter, headlights
   */
  public setCameraPreset(preset: CameraPreset): void {
    switch (preset) {
      case 'hero':
        this.targetCamPos.set(3.8, 1.8, 4.8);
        this.targetCamLookAt.set(0, 0.5, 0);
        break;
      case 'wheels':
        this.targetCamPos.set(1.9, 0.65, 2.2);
        this.targetCamLookAt.set(1.02, 0.35, 1.4);
        break;
      case 'aero':
        this.targetCamPos.set(2.4, 1.45, -2.9);
        this.targetCamLookAt.set(0, 0.85, -1.8);
        break;
      case 'front':
        this.targetCamPos.set(0, 0.85, 4.1);
        this.targetCamLookAt.set(0, 0.45, 1.5);
        break;
    }
  }

  public setAutoRotate(enabled: boolean): void {
    this.autoRotate = enabled;
  }

  public revThrottle(rpmRatio: number): void {
    this.wheelSpinSpeed = rpmRatio * 45;
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isUserInteracting = true;
    this.mouseX = e.clientX;
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isUserInteracting) return;
    const delta = e.clientX - this.mouseX;
    this.mouseX = e.clientX;
    this.targetRotationY += delta * 0.008;
  }

  private handleMouseUp(): void {
    this.isUserInteracting = false;
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.isUserInteracting && this.autoRotate) {
      // Gentle idle turntable rotation
      this.targetRotationY += 0.005;
    }

    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;
    this.turntable.rotation.y = this.currentRotationY;

    // Smooth camera interpolation
    this.camera.position.lerp(this.targetCamPos, dt * 4.5);
    this.currentCamLookAt.lerp(this.targetCamLookAt, dt * 4.5);
    this.camera.lookAt(this.currentCamLookAt);

    // Dynamic wheel spinning when throttle is revved
    if (this.wheelSpinSpeed > 0 && this.vehicleMesh) {
      this.vehicleMesh.wheels.forEach((w) => {
        w.rotation.x -= this.wheelSpinSpeed * dt;
      });
      this.wheelSpinSpeed = Math.max(0, this.wheelSpinSpeed - dt * 25);
    }

    // Dynamic underglow pulsing
    if (this.vehicleMesh?.underglowMode === 'pulse' && this.vehicleMesh.underglow) {
      const mat = this.vehicleMesh.underglow.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.42 + 0.38 * Math.sin(now * 0.006);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
