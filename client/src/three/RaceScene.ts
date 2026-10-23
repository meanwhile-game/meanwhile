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

export interface RacerPhysicsState {
  velocity: number;
  actualProgress: number;
  pitch: number;
  roll: number;
  steerAngle: number;
  wheelRotation: number;
  brakeDive: number;
  brakeFlareTimer: number;
  accelG: number;
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
  private racerPhysics: Map<string, RacerPhysicsState> = new Map();
  private localPlayerId: string | null = null;
  private cameraSnapped: boolean = false;
  private cameraMode: 'chase' | 'broadcast' = 'chase';
  private speedLinesMesh: THREE.LineSegments | null = null;

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
    this.camera = new THREE.PerspectiveCamera(54, aspect, 0.1, 1200);
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
    this.renderer.toneMappingExposure = 1.15;

    if (quality !== 'low') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = quality === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    }

    container.appendChild(this.renderer.domElement);

    // Setup Lighting & Track
    this.setupLighting();
    this.loadTrack(config);
    this.initSpeedLines();

    // Start Render Loop
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    this.animate();
  }

  private initSpeedLines(): void {
    const lineCount = 48;
    const positions: number[] = [];
    for (let i = 0; i < lineCount; i++) {
      const rx = (Math.random() - 0.5) * 9.0;
      const ry = 0.4 + Math.random() * 3.6;
      const rz = (Math.random() - 0.5) * 18.0;
      const len = 2.5 + Math.random() * 5.0;
      positions.push(rx, ry, rz);
      positions.push(rx, ry, rz + len);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.speedLinesMesh = new THREE.LineSegments(geo, mat);
    this.scene.add(this.speedLinesMesh);
  }

  public toggleCameraMode(): 'chase' | 'broadcast' {
    this.cameraMode = this.cameraMode === 'chase' ? 'broadcast' : 'chase';
    return this.cameraMode;
  }

  public setCameraMode(mode: 'chase' | 'broadcast'): void {
    this.cameraMode = mode;
  }

  public getCameraMode(): 'chase' | 'broadcast' {
    return this.cameraMode;
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
      this.dirLight.shadow.bias = -0.0003;
      this.dirLight.shadow.normalBias = 0.02;
      const d = 120;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
    }

    this.scene.add(this.dirLight);

    // Vehicle forward projection headlight (spotlight)
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
    this.cameraSnapped = false;

    this.builtTrack = TrackBuilder.buildTrack(config);
    this.scene.add(this.builtTrack.trackGroup);
  }

  public setRacers(racers: RacerDisplayData[], localId?: string): void {
    // 1. Determine local racer with ironclad fallback:
    const localRacer = racers.find(r => r.isLocal)
      || (localId ? racers.find(r => r.id === localId) : undefined)
      || racers.find(r => !r.id.startsWith('ai_'))
      || racers[0];

    this.localPlayerId = localRacer ? localRacer.id : (localId || null);

    const currentIds = new Set(racers.map(r => r.id));

    // Remove obsolete meshes
    for (const [id, item] of this.racerMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(item.mesh);
        this.racerMeshes.delete(id);
        this.racerPhysics.delete(id);
      }
    }

    // Add or update racers
    racers.forEach((r, idx) => {
      const isLocal = r.id === this.localPlayerId || r.isLocal || (!this.localPlayerId && !r.id.startsWith('ai_'));
      const laneIndex = r.laneIndex !== undefined ? r.laneIndex : (idx % 4);
      let existing = this.racerMeshes.get(r.id);

      if (!existing || existing.data.vehicleId !== r.vehicleId || existing.data.vehicleColor !== r.vehicleColor) {
        if (existing) {
          this.scene.remove(existing.mesh);
        }
        // If this is the local racer, check for custom tuning options
        let customParam: any = r.vehicleColor;
        if (isLocal) {
          try {
            const raw = localStorage.getItem(`meanwhile_custom_${r.vehicleId}`);
            if (raw) customParam = JSON.parse(raw);
          } catch (e) {
            // fallback to color
          }
        }
        const mesh = VehicleFactory.createVehicle(r.vehicleId, customParam);
        this.scene.add(mesh);
        existing = {
          mesh,
          data: {
            ...r,
            isLocal,
            laneIndex,
            currentProgress: r.targetProgress || 0
          }
        };
        this.racerMeshes.set(r.id, existing);
      } else {
        existing.data.targetProgress = r.targetProgress;
        existing.data.wpm = r.wpm;
        existing.data.laneIndex = laneIndex;
        existing.data.isLocal = isLocal;
      }
    });
  }

  public updateProgress(racerId: string, progress: number, wpm: number): void {
    let racer = this.racerMeshes.get(racerId);
    if (!racer && this.localPlayerId) {
      racer = this.racerMeshes.get(this.localPlayerId);
    }
    if (racer) {
      const prevProgress = racer.data.targetProgress || 0;
      racer.data.targetProgress = Math.max(0, Math.min(1, progress));
      racer.data.wpm = wpm;

      if (progress > prevProgress) {
        const p = this.racerPhysics.get(racer.data.id);
        if (p) {
          p.accelG = Math.min(1.0, p.accelG + 0.35);
        }
      }
    }
  }

  public triggerBrakeDive(racerId?: string): void {
    const id = racerId || this.localPlayerId;
    if (!id) return;
    const p = this.racerPhysics.get(id);
    if (p) {
      p.brakeDive = -0.055;
      p.brakeFlareTimer = 0.65;
      p.accelG = -0.75;
    }
  }

  public triggerThrottleSurge(racerId?: string): void {
    const id = racerId || this.localPlayerId;
    if (!id) return;
    const p = this.racerPhysics.get(id);
    if (p) {
      p.accelG = Math.min(1.0, p.accelG + 0.45);
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
    const trackLength = this.builtTrack.length || 1400;
    const up = new THREE.Vector3(0, 1, 0);

    // Lane offsets: 4 distinct lanes (-4.5, -1.5, +1.5, +4.5)
    const laneOffsets = [-4.5, -1.5, 1.5, 4.5];

    let localVehiclePos: THREE.Vector3 | null = null;
    let localVehicleTangent: THREE.Vector3 | null = null;
    let localVehicleNormal: THREE.Vector3 | null = null;
    let localVehicleBinormal: THREE.Vector3 | null = null;
    let localPhysics: RacerPhysicsState | null = null;
    let localWpm: number = 0;

    // Update Racers with continuous momentum physics and road-normal banking
    for (const [id, { mesh, data }] of this.racerMeshes.entries()) {
      let p = this.racerPhysics.get(id);
      if (!p) {
        p = {
          velocity: 0,
          actualProgress: data.targetProgress || 0,
          pitch: 0,
          roll: 0,
          steerAngle: 0,
          wheelRotation: 0,
          brakeDive: 0,
          brakeFlareTimer: 0,
          accelG: 0,
        };
        this.racerPhysics.set(id, p);
      }

      // Physics momentum towards target
      const targetP = Math.max(0, Math.min(1, data.targetProgress));
      const distToTarget = targetP - p.actualProgress;

      if (distToTarget > 0.0001) {
        // Accelerate smoothly to close gap
        const desiredSpeed = Math.max(distToTarget * 4.8, (data.wpm / 60) * 0.015);
        p.velocity = THREE.MathUtils.lerp(p.velocity, desiredSpeed, dt * 7.5);
      } else {
        // Coasting with smooth aerodynamic and mechanical drag
        p.velocity = THREE.MathUtils.lerp(p.velocity, 0, dt * 2.2);
      }

      // Recover suspension dive & timers
      if (p.brakeDive < 0) {
        p.brakeDive = THREE.MathUtils.lerp(p.brakeDive, 0, dt * 6.0);
      }
      if (p.brakeFlareTimer > 0) {
        p.brakeFlareTimer -= dt;
      }
      p.accelG = THREE.MathUtils.lerp(p.accelG, 0, dt * 4.0);

      // Advance actual progress
      const deltaProgress = Math.min(distToTarget, Math.max(0, p.velocity * dt));
      p.actualProgress += deltaProgress;
      p.actualProgress = Math.max(0, Math.min(0.999, p.actualProgress));
      data.currentProgress = p.actualProgress;

      const t = p.actualProgress;

      // 1. Calculate Track Tangent, Binormal, Bank Angle & True Road Normal
      const pt = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(up, tangent).normalize();

      // Lookahead curvature & banking (matching TrackBuilder formula)
      const nextT = (t + 0.010) % 1.0;
      const nextTangent = curve.getTangentAt(nextT).normalize();
      const curvature = tangent.clone().cross(nextTangent).y;
      const bankAngle = THREE.MathUtils.clamp(-curvature * 10.0, -0.14, 0.14);
      const bankedBinormal = binormal.clone().applyAxisAngle(tangent, bankAngle).normalize();
      const roadNormal = new THREE.Vector3().crossVectors(tangent, bankedBinormal).normalize();

      // 2. Position vehicle on banked road surface
      const laneOffset = laneOffsets[data.laneIndex % 4];
      const vehiclePos = pt.clone()
        .addScaledVector(bankedBinormal, laneOffset)
        .addScaledVector(roadNormal, 0.035); // 3.5cm wheel contact offset

      mesh.position.copy(vehiclePos);

      // 3. True 3D Camber & Slope Orientation (Matrix basis [X: bankedBinormal, Y: roadNormal, Z: tangent])
      const rotMatrix = new THREE.Matrix4().makeBasis(bankedBinormal, roadNormal, tangent);
      mesh.quaternion.setFromRotationMatrix(rotMatrix);

      // 4. Front Wheels Steering (smooth turn in to upcoming apex)
      const targetSteer = THREE.MathUtils.clamp(-curvature * 24.0, -0.42, 0.42);
      p.steerAngle = THREE.MathUtils.lerp(p.steerAngle, targetSteer, dt * 14.0);
      if (mesh.frontSteerNodes && mesh.frontSteerNodes.length > 0) {
        mesh.frontSteerNodes.forEach(node => {
          node.rotation.y = p.steerAngle;
        });
      }

      // 5. Chassis Articulation (Squat, Dive, Centrifugal Roll, Rumble)
      const speedFactor = Math.min(1.0, data.wpm / 115);
      const isAccelerating = distToTarget > 0.001 && data.wpm > 8;
      const targetSquat = isAccelerating ? 0.022 * speedFactor : 0.0;
      const totalPitch = targetSquat + p.brakeDive;
      p.pitch = THREE.MathUtils.lerp(p.pitch, totalPitch, dt * 8.5);

      const targetRoll = -curvature * 14.0 * Math.max(0.25, speedFactor);
      p.roll = THREE.MathUtils.lerp(p.roll, targetRoll, dt * 9.0);

      if (mesh.chassisGroup) {
        mesh.chassisGroup.rotation.x = p.pitch;
        mesh.chassisGroup.rotation.z = p.roll;

        // Rumble vibration: subtle idle engine pulse when stopped, tire tread vibration at high speed
        if (data.wpm < 5) {
          mesh.chassisGroup.position.y = Math.sin(now * 0.04) * 0.006;
        } else {
          mesh.chassisGroup.position.y = (Math.random() - 0.5) * 0.006 * speedFactor;
        }
      } else if (data.vehicleId === 'phantom-bike') {
        const leanFactor = Math.min(1.0, Math.max(0.3, data.wpm / 60));
        const bikeRoll = -Math.sign(curvature) * Math.min(Math.PI / 4.2, Math.abs(curvature) * 26.0 * leanFactor);
        mesh.rotateZ(bikeRoll);
      }

      // 6. Wheels Physical Rotation: exactly 1:1 with ground speed
      const deltaMeters = deltaProgress * trackLength;
      const deltaWheelRad = deltaMeters / 0.35; // 0.35m wheel radius
      p.wheelRotation += deltaWheelRad;
      mesh.wheels.forEach(w => {
        w.rotation.x = p.wheelRotation;
      });

      // 7. Taillight Flare on Braking / Typo
      const isBraking = p.brakeFlareTimer > 0;
      if (mesh.taillightMeshes && mesh.taillightMeshes.length > 0) {
        mesh.taillightMeshes.forEach(tl => {
          const mat = tl.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.emissiveIntensity = isBraking ? 6.0 : 1.8;
            if (isBraking) {
              mat.emissive.setHex(0xff1133);
            } else {
              mat.emissive.setHex(0xbb0022);
            }
          }
        });
      }

      // 8. Nitro Exhaust Flames
      if (mesh.exhaustFires && mesh.exhaustFires.length > 0) {
        if (data.wpm > 25 && isAccelerating) {
          const flicker = 0.85 + Math.sin(now * 0.09) * 0.3;
          const flameLen = THREE.MathUtils.clamp(data.wpm / 70, 0.7, 2.0);
          mesh.exhaustFires.forEach(f => {
            f.visible = true;
            f.scale.set(flicker, flicker, flameLen * flicker);
          });
        } else {
          mesh.exhaustFires.forEach(f => {
            f.visible = false;
          });
        }
      }

      if (mesh.underglowMode === 'pulse' && mesh.underglow) {
        (mesh.underglow.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.35 * Math.sin(now * 0.008);
      }

      if (id === this.localPlayerId || data.isLocal || (!localVehiclePos && !id.startsWith('ai_'))) {
        localVehiclePos = vehiclePos;
        localVehicleTangent = tangent;
        localVehicleNormal = roadNormal;
        localVehicleBinormal = bankedBinormal;
        localPhysics = p;
        localWpm = data.wpm;
      }
    }

    // Dynamic Spring-Loaded Camera (3D Chase View OR 2.5D Speedway Broadcast View)
    if (localVehiclePos && localVehicleTangent && localVehicleNormal && localVehicleBinormal && localPhysics) {
      const speedFactor = Math.min(1.0, localWpm / 120);

      if (this.cameraMode === 'broadcast') {
        // 2.5D Speedway Elevated Broadcast View
        const targetCamPos = localVehiclePos.clone()
          .addScaledVector(localVehicleTangent, -14.0)
          .addScaledVector(localVehicleBinormal, 12.0)
          .addScaledVector(localVehicleNormal, 14.0);

        const camLookTarget = localVehiclePos.clone()
          .addScaledVector(localVehicleTangent, 10.0)
          .addScaledVector(localVehicleNormal, 0.5);

        if (!this.cameraSnapped) {
          this.camera.position.copy(targetCamPos);
          this.cameraSnapped = true;
        } else {
          this.camera.position.lerp(targetCamPos, dt * 7.0);
        }
        this.camera.up.lerp(localVehicleNormal, dt * 6.0);
        this.camera.lookAt(camLookTarget);
      } else {
        // Immersive 3D Chase Camera with G-Force Acceleration Pushback & Road Banking
        const gPushback = localPhysics.accelG * 0.45;
        const camDist = 5.6 + speedFactor * 1.3 + gPushback;
        const camHeight = 2.2 + speedFactor * 0.25;

        const targetCamPos = localVehiclePos.clone()
          .sub(localVehicleTangent.clone().multiplyScalar(camDist))
          .add(localVehicleNormal.clone().multiplyScalar(camHeight));

        // High-speed cockpit rumble
        if (localWpm > 75) {
          const rumble = (speedFactor - 0.6) * 0.025;
          targetCamPos.addScaledVector(localVehicleBinormal, (Math.random() - 0.5) * rumble);
          targetCamPos.addScaledVector(localVehicleNormal, (Math.random() - 0.5) * rumble * 0.5);
        }

        // Dynamic speed tunnel vision FOV
        const targetFov = 54 + speedFactor * 9;
        if (Math.abs(this.camera.fov - targetFov) > 0.1) {
          this.camera.fov += (targetFov - this.camera.fov) * dt * 4;
          this.camera.updateProjectionMatrix();
        }

        if (!this.cameraSnapped) {
          this.camera.position.copy(targetCamPos);
          this.camera.up.copy(localVehicleNormal);
          this.cameraSnapped = true;
        } else {
          this.camera.position.lerp(targetCamPos, dt * 9.0);
          this.camera.up.lerp(localVehicleNormal, dt * 7.0);
        }

        // Forward eye-level lookahead along the track toward the horizon
        const lookAhead = 26.0 + speedFactor * 6.0;
        const camLookTarget = localVehiclePos.clone()
          .addScaledVector(localVehicleTangent, lookAhead)
          .addScaledVector(localVehicleNormal, 0.95);

        this.camera.lookAt(camLookTarget);
      }

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

      // Forward projector headlight beam
      if (this.vehicleHeadlight && this.headlightTarget) {
        this.vehicleHeadlight.position.copy(localVehiclePos).addScaledVector(localVehicleTangent, 1.6);
        this.vehicleHeadlight.position.addScaledVector(localVehicleNormal, 0.8);
        this.headlightTarget.position.copy(localVehiclePos).addScaledVector(localVehicleTangent, 40.0);
        this.headlightTarget.position.addScaledVector(localVehicleNormal, 0.2);
        this.headlightTarget.updateMatrixWorld();
      }

      // High-speed wind stream particles
      if (this.speedLinesMesh) {
        if (localWpm > 45) {
          this.speedLinesMesh.visible = true;
          (this.speedLinesMesh.material as THREE.LineBasicMaterial).opacity = Math.min(0.65, (localWpm - 45) / 55);
          this.speedLinesMesh.position.copy(localVehiclePos);
          this.speedLinesMesh.quaternion.setFromRotationMatrix(
            new THREE.Matrix4().makeBasis(localVehicleBinormal, localVehicleNormal, localVehicleTangent)
          );
        } else {
          this.speedLinesMesh.visible = false;
        }
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
    this.racerPhysics.clear();

    if (this.speedLinesMesh) {
      this.scene.remove(this.speedLinesMesh);
    }

    if (this.builtTrack) {
      this.scene.remove(this.builtTrack.trackGroup);
    }

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
