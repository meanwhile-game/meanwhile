import * as THREE from 'three';
import { TrackConfig, TRACKS } from './types.js';
import { TrackBuilder, BuiltTrack } from './TrackBuilder.js';
import { VehicleFactory, VehicleMeshObject } from './VehicleFactory.js';

export interface RacerDisplayData {
  id: string;
  vehicleId: string;
  vehicleColor: string;
  isLocal: boolean;
  targetProgress: number;
  currentProgress: number;
  laneIndex: number;
  wpm: number;
}

export class RaceSceneManager {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  private builtTrack: BuiltTrack | null = null;
  private trackConfig: TrackConfig;
  private dirLight: THREE.DirectionalLight | null = null;
  private ambLight: THREE.AmbientLight | null = null;
  private vehicleHeadlight: THREE.SpotLight | null = null;
  private headlightTarget: THREE.Object3D | null = null;

  // Racers map: racerId -> { mesh, data }
  private racerMeshes: Map<string, { mesh: VehicleMeshObject; data: RacerDisplayData }> = new Map();
  private localPlayerId: string | null = null;

  private lastTime: number = performance.now();
  private currentCountdown: number = -1;
  private graphicsQuality: 'low' | 'medium' | 'high' = 'high';

  constructor(container: HTMLDivElement, trackId: string = 'tokyo', quality: 'low' | 'medium' | 'high' = 'high') {
    this.container = container;
    this.graphicsQuality = quality;
    const config = TRACKS.find(t => t.id === trackId) || TRACKS[0];
    this.trackConfig = config;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.skyColor);
    this.scene.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar);

    // Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.5, 600);
    this.camera.position.set(0, 10, -20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: quality !== 'low',
      powerPreference: 'high-performance',
      precision: quality === 'low' ? 'mediump' : 'highp'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    if (quality !== 'low') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = quality === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    }

    container.appendChild(this.renderer.domElement);

    // Setup Lighting & Track
    this.setupLighting();
    this.loadTrack(config);

    // Start Render Loop
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    this.animate();
  }

  private setupLighting(): void {
    const config = this.trackConfig;

    this.ambLight = new THREE.AmbientLight(config.ambientLightColor, 1.2);
    this.scene.add(this.ambLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111122, 0.6);
    this.scene.add(hemiLight);

    this.dirLight = new THREE.DirectionalLight(config.sunColor, 2.2);
    this.dirLight.position.set(config.sunPosition[0], config.sunPosition[1], config.sunPosition[2]);
    this.dirLight.castShadow = this.graphicsQuality !== 'low';

    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = this.graphicsQuality === 'high' ? 2048 : 1024;
      this.dirLight.shadow.mapSize.height = this.graphicsQuality === 'high' ? 2048 : 1024;
      this.dirLight.shadow.camera.near = 10;
      this.dirLight.shadow.camera.far = 400;
      const d = 120;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
    }

    this.scene.add(this.dirLight);

    // Vehicle forward projection headlight
    this.headlightTarget = new THREE.Object3D();
    this.scene.add(this.headlightTarget);

    this.vehicleHeadlight = new THREE.SpotLight(0xfff6eb, 2.5, 75, Math.PI / 5, 0.5, 1.2);
    this.vehicleHeadlight.target = this.headlightTarget;
    this.scene.add(this.vehicleHeadlight);
  }

  public loadTrack(config: TrackConfig): void {
    if (this.builtTrack) {
      this.scene.remove(this.builtTrack.trackGroup);
    }
    this.trackConfig = config;
    this.scene.background = new THREE.Color(config.skyColor);
    this.scene.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar);

    this.builtTrack = TrackBuilder.buildTrack(config);
    this.scene.add(this.builtTrack.trackGroup);
  }

  public setRacers(racers: RacerDisplayData[], localId: string): void {
    this.localPlayerId = localId;

    const currentIds = new Set(racers.map(r => r.id));

    // Remove obsolete meshes
    for (const [id, item] of this.racerMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(item.mesh);
        this.racerMeshes.delete(id);
      }
    }

    // Add or update racers
    racers.forEach((r, idx) => {
      const laneIndex = r.laneIndex !== undefined ? r.laneIndex : (idx % 4);
      let existing = this.racerMeshes.get(r.id);

      if (!existing || existing.data.vehicleId !== r.vehicleId || existing.data.vehicleColor !== r.vehicleColor) {
        if (existing) {
          this.scene.remove(existing.mesh);
        }
        const mesh = VehicleFactory.createVehicle(r.vehicleId, r.vehicleColor);
        this.scene.add(mesh);
        existing = {
          mesh,
          data: {
            ...r,
            laneIndex,
            currentProgress: r.targetProgress || 0
          }
        };
        this.racerMeshes.set(r.id, existing);
      } else {
        existing.data.targetProgress = r.targetProgress;
        existing.data.wpm = r.wpm;
        existing.data.laneIndex = laneIndex;
      }
    });
  }

  public updateProgress(racerId: string, progress: number, wpm: number): void {
    const racer = this.racerMeshes.get(racerId);
    if (racer) {
      racer.data.targetProgress = Math.max(0, Math.min(1, progress));
      racer.data.wpm = wpm;
    }
  }

  public setCountdown(count: number): void {
    this.currentCountdown = count;
    if (!this.builtTrack) return;

    const lights = this.builtTrack.startLightMeshes;
    if (!lights || lights.length === 0) return;

    if (count === 3) {
      // 2 red lights
      lights.forEach((l, i) => {
        (l.material as THREE.MeshBasicMaterial).color.setHex(i < 2 ? 0xff0033 : 0x220005);
      });
    } else if (count === 2) {
      // 4 red lights
      lights.forEach((l, i) => {
        (l.material as THREE.MeshBasicMaterial).color.setHex(i < 4 ? 0xff0033 : 0x220005);
      });
    } else if (count === 1) {
      // All 5 red lights
      lights.forEach(l => {
        (l.material as THREE.MeshBasicMaterial).color.setHex(0xff0033);
      });
    } else if (count === 0) {
      // ALL GREEN: GO!
      lights.forEach(l => {
        (l.material as THREE.MeshBasicMaterial).color.setHex(0x00ff87);
      });
    } else {
      // Off / dim
      lights.forEach(l => {
        (l.material as THREE.MeshBasicMaterial).color.setHex(0x220005);
      });
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.builtTrack) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const curve = this.builtTrack.curve;
    const up = new THREE.Vector3(0, 1, 0);

    // Lane offsets: 4 distinct lanes (-4.5, -1.5, +1.5, +4.5)
    const laneOffsets = [-4.5, -1.5, 1.5, 4.5];

    let localVehiclePos: THREE.Vector3 | null = null;
    let localVehicleTangent: THREE.Vector3 | null = null;
    let localWpm: number = 0;

    // Update Racers
    for (const [id, { mesh, data }] of this.racerMeshes.entries()) {
      // Smooth lerp progress towards target
      const lerpSpeed = dt * 10;
      data.currentProgress += (data.targetProgress - data.currentProgress) * lerpSpeed;
      const t = Math.max(0, Math.min(0.999, data.currentProgress));

      // Calculate track position & orientation
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      const laneOffset = laneOffsets[data.laneIndex % 4];
      const vehiclePos = new THREE.Vector3().copy(pt).addScaledVector(binormal, laneOffset);

      mesh.position.copy(vehiclePos);

      // Orient forward along tangent
      const lookTarget = new THREE.Vector3().copy(vehiclePos).add(tangent);
      mesh.lookAt(lookTarget);

      // Motorcycle lean / car roll into corners
      const nextT = Math.min(0.999, t + 0.01);
      const nextTangent = curve.getTangentAt(nextT).normalize();
      const curvature = tangent.clone().cross(nextTangent).y;

      if (data.vehicleId === 'phantom-bike') {
        mesh.rotation.z = -curvature * 18.0; // Dynamic motorcycle lean
      } else {
        mesh.rotation.z = -curvature * 3.5;  // Subtle car roll
      }

      // Rotate wheels based on motion
      const wheelSpeed = Math.max(1.0, data.wpm * 0.15);
      mesh.wheels.forEach(w => {
        w.rotation.x += wheelSpeed * dt * 15;
      });

      // Underglow & exhaust flare
      if (mesh.exhaustFires && mesh.exhaustFires.length > 0) {
        const flareScale = 0.8 + Math.sin(now / 50) * 0.3 * (data.wpm > 60 ? 1.5 : 0.5);
        mesh.exhaustFires.forEach(f => f.scale.set(flareScale, flareScale, flareScale));
      }

      if (id === this.localPlayerId) {
        localVehiclePos = vehiclePos;
        localVehicleTangent = tangent;
        localWpm = data.wpm;
      }
    }

    // Dynamic Chase Camera
    if (localVehiclePos && localVehicleTangent) {
      // Speed-dependent camera offset
      const speedFactor = Math.min(1.0, localWpm / 120);
      const camDist = 7.8 + speedFactor * 2.4;
      const camHeight = 3.0 + speedFactor * 0.4;

      const targetCamPos = new THREE.Vector3()
        .copy(localVehiclePos)
        .addScaledVector(localVehicleTangent, -camDist);
      targetCamPos.y += camHeight;

      // Micro camera shake at extreme speed (> 85 WPM)
      if (localWpm > 85) {
        targetCamPos.x += (Math.random() - 0.5) * 0.05;
        targetCamPos.y += (Math.random() - 0.5) * 0.03;
      }

      // Smooth camera interpolation
      this.camera.position.lerp(targetCamPos, dt * 8);

      const lookAhead = 15.0;
      const camLookTarget = new THREE.Vector3()
        .copy(localVehiclePos)
        .addScaledVector(localVehicleTangent, lookAhead);
      camLookTarget.y += 0.8;

      this.camera.lookAt(camLookTarget);

      // Dynamic FOV for speed sensation (60 up to 72)
      const targetFov = 60 + speedFactor * 12;
      this.camera.fov += (targetFov - this.camera.fov) * dt * 3;
      this.camera.updateProjectionMatrix();

      // Shadow light follows player vehicle
      if (this.dirLight) {
        this.dirLight.position.set(
          localVehiclePos.x + this.trackConfig.sunPosition[0] * 0.5,
          localVehiclePos.y + this.trackConfig.sunPosition[1] * 0.5,
          localVehiclePos.z + this.trackConfig.sunPosition[2] * 0.5
        );
        this.dirLight.target.position.copy(localVehiclePos);
        this.dirLight.target.updateMatrixWorld();
      }

      // Update forward headlight beam
      if (this.vehicleHeadlight && this.headlightTarget) {
        this.vehicleHeadlight.position.copy(localVehiclePos).addScaledVector(localVehicleTangent, 1.6);
        this.vehicleHeadlight.position.y += 0.9;
        this.headlightTarget.position.copy(localVehiclePos).addScaledVector(localVehicleTangent, 40.0);
        this.headlightTarget.position.y += 0.2;
        this.headlightTarget.updateMatrixWorld();
      }
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

  public setQuality(quality: 'low' | 'medium' | 'high'): void {
    this.graphicsQuality = quality;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5));
    if (this.dirLight) {
      this.dirLight.castShadow = quality !== 'low';
    }
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);

    this.racerMeshes.forEach(({ mesh }) => {
      this.scene.remove(mesh);
    });
    this.racerMeshes.clear();

    if (this.builtTrack) {
      this.scene.remove(this.builtTrack.trackGroup);
    }

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
