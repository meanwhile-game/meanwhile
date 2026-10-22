import * as THREE from 'three';
import { VehicleFactory, VehicleMeshObject } from './VehicleFactory.js';

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

  constructor(container: HTMLDivElement, vehicleId: string, colorHex: string) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06070a);
    this.scene.fog = new THREE.Fog(0x06070a, 12, 35);

    // Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(3.8, 1.8, 4.8);
    this.camera.lookAt(0, 0.5, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    container.appendChild(this.renderer.domElement);

    // Turntable platform
    this.turntable = new THREE.Group();
    this.scene.add(this.turntable);

    this.setupStudioFloor();
    this.setupStudioLighting();
    this.loadVehicle(vehicleId, colorHex);

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
    // Floor grid
    const floorGeo = new THREE.CylinderGeometry(4.0, 4.2, 0.2, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d1117,
      roughness: 0.2,
      metalness: 0.7,
    });
    const platform = new THREE.Mesh(floorGeo, floorMat);
    platform.position.y = -0.1;
    platform.receiveShadow = true;
    this.turntable.add(platform);

    // Glowing rim ring
    const ringGeo = new THREE.TorusGeometry(4.1, 0.04, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    this.turntable.add(ring);
  }

  private setupStudioLighting(): void {
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambLight);

    // Overhead Studio Softbox Light (highlights vehicle hood & roof lines)
    const topLight = new THREE.DirectionalLight(0xffffff, 3.5);
    topLight.position.set(0, 10, 0);
    this.scene.add(topLight);

    // Front-Right Studio Key Spotlight
    const spotKey = new THREE.SpotLight(0xffffff, 5.0);
    spotKey.position.set(6, 7, 6);
    spotKey.angle = Math.PI / 4;
    spotKey.penumbra = 0.6;
    spotKey.castShadow = true;
    spotKey.shadow.mapSize.width = 1024;
    spotKey.shadow.mapSize.height = 1024;
    this.scene.add(spotKey);

    // Cyan Rim Light (edges & side aero)
    const spotRim = new THREE.SpotLight(0x00e5ff, 4.5);
    spotRim.position.set(-7, 6, -6);
    spotRim.angle = Math.PI / 3;
    spotRim.penumbra = 0.8;
    this.scene.add(spotRim);

    // Warm Coral Accent Rim Light
    const rimAccent = new THREE.SpotLight(0xff0066, 3.2);
    rimAccent.position.set(6, 4, -7);
    rimAccent.angle = Math.PI / 3;
    rimAccent.penumbra = 0.7;
    this.scene.add(rimAccent);

    // Front Fill Light
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    fillLight.position.set(0, 2, 6);
    this.scene.add(fillLight);
  }

  public loadVehicle(vehicleId: string, colorHex: string): void {
    if (this.vehicleMesh) {
      this.turntable.remove(this.vehicleMesh);
    }
    this.vehicleMesh = VehicleFactory.createVehicle(vehicleId, colorHex);
    this.turntable.add(this.vehicleMesh);
  }

  public updateColor(vehicleId: string, colorHex: string): void {
    this.loadVehicle(vehicleId, colorHex);
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

    if (!this.isUserInteracting) {
      // Gentle idle turntable rotation
      this.targetRotationY += 0.004;
    }

    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;
    this.turntable.rotation.y = this.currentRotationY;

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
