import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  ArrowRight, 
  Play, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Zap, 
  Gauge, 
  Compass, 
  ShieldCheck, 
  BookOpen, 
  Music, 
  Flame, 
  RotateCw,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.js';
import { sound } from '../../sound/soundEngine.js';
import { VEHICLES, TRACKS } from '../../three/types.js';
import { VehicleFactory, VehicleMeshObject } from '../../three/VehicleFactory.js';
import heroBg from '../../assets/hero-bg.jpg';
import swissTrack from '../../assets/swiss-track.jpg';

interface LandingPageProps {
  onEnterGrid: () => void;
  onStartSolo?: () => void;
  onlineCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onEnterGrid, 
  onStartSolo, 
  onlineCount 
}) => {
  const { isLight } = useTheme();
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Interactive Mini-Rev Typing Test State
  const revPrompt = "Shift into gear and release the clutch.";
  const [revInput, setRevInput] = useState('');
  const [revRpm, setRevRpm] = useState(1200);
  const [revSpeed, setRevSpeed] = useState(0);
  const [revCompleted, setRevCompleted] = useState(false);

  // 3D Vehicle Showcase State
  const [activeVehicleId, setActiveVehicleId] = useState('cyber-gt');
  const [activeVehicleColor, setActiveVehicleColor] = useState('#00ff87');
  const showcaseContainerRef = useRef<HTMLDivElement>(null);
  const showcaseSceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    vehicleGroup: VehicleMeshObject | null;
    turntable: THREE.Group;
    animId: number | null;
  } | null>(null);

  // Handle Mute toggle
  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playCountdownTick(0);
    }
  };

  // Mini-Rev Typing Handler
  const handleRevTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only accept correct prefix
    if (!revPrompt.startsWith(val)) {
      sound.playKeyError();
      return;
    }

    setRevInput(val);
    sound.playKeyClick(false);

    const progress = val.length / revPrompt.length;
    const currentRpm = Math.floor(1200 + progress * 7800);
    const currentSpeed = Math.floor(progress * 345);
    setRevRpm(currentRpm);
    setRevSpeed(currentSpeed);

    // Audio pitch scaled to RPM
    if (!isMuted) {
      sound.updateEnginePitch(Math.floor(progress * 120));
    }

    if (val === revPrompt && !revCompleted) {
      setRevCompleted(true);
      sound.playFinishSound();
    }
  };

  // Reset Mini-Rev
  const handleResetRev = () => {
    setRevInput('');
    setRevRpm(1200);
    setRevSpeed(0);
    setRevCompleted(false);
  };

  // 3D Vehicle Turntable Setup
  useEffect(() => {
    const container = showcaseContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 6.2);
    camera.lookAt(0, 0.45, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Studio Softbox & Multi-Angle Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.2);
    const topSoftbox = new THREE.DirectionalLight(0xffffff, 3.2);
    topSoftbox.position.set(0, 10, 2);
    const keyLight = new THREE.DirectionalLight(0x00e5ff, 2.5);
    keyLight.position.set(5, 7, 7);
    const rimLight = new THREE.DirectionalLight(0xff0066, 2.8);
    rimLight.position.set(-6, 5, -5);
    scene.add(amb, topSoftbox, keyLight, rimLight);

    // Holographic Turntable Pedestal
    const turntable = new THREE.Group();
    const discGeo = new THREE.CylinderGeometry(3.4, 3.4, 0.12, 48);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.2,
      metalness: 0.9,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.06;

    // Glowing Neon Rim
    const ringGeo = new THREE.TorusGeometry(3.42, 0.05, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff87 });
    const ring = new THREE.Mesh(ringGeo, ringMat);

    turntable.add(disc, ring);
    scene.add(turntable);

    // Spawn 3D Vehicle
    let vehicleGroup = VehicleFactory.createVehicle(activeVehicleId, activeVehicleColor);
    turntable.add(vehicleGroup);

    // Drag to Orbit
    let isDragging = false;
    let prevX = 0;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      turntable.rotation.y += dx * 0.012;
    };
    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Render Loop
    let animId: number = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        turntable.rotation.y += 0.007; // Smooth idle rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    showcaseSceneRef.current = {
      renderer,
      scene,
      camera,
      vehicleGroup,
      turntable,
      animId,
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update vehicle in 3D turntable when selected
  useEffect(() => {
    if (!showcaseSceneRef.current) return;
    const { turntable, vehicleGroup } = showcaseSceneRef.current;
    if (vehicleGroup) {
      turntable.remove(vehicleGroup);
    }
    const newVehicle = VehicleFactory.createVehicle(activeVehicleId, activeVehicleColor);
    turntable.add(newVehicle);
    showcaseSceneRef.current.vehicleGroup = newVehicle;
  }, [activeVehicleId, activeVehicleColor]);

  const activeVehicle = VEHICLES.find(v => v.id === activeVehicleId) || VEHICLES[0];

  return (
    <div className="relative w-full min-h-screen bg-[#04060a] text-slate-100 overflow-x-hidden selection:bg-emerald-400 selection:text-black">
      
      {/* 1. Global Esports Ticker Bar */}
      <div className="w-full bg-black/80 backdrop-blur-md border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-[11px] font-mono z-50 relative">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE SERVER
          </span>
          <span className="text-slate-400 hidden sm:inline">60 FPS AUTHORITATIVE ENGINE • TICK RATE 15 HZ</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            RECORD: ApexPredator 154 WPM
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            {onlineCount || 14} Drivers on Grid
          </span>
          <button 
            onClick={toggleAudio}
            className="p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-white"
            title={isMuted ? "Unmute Engine Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-40">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(0,255,135,0.4)]">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tighter text-white">Meanwhile</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PRO</span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 block -mt-1 uppercase">3D Multiplayer Typing Racing</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onStartSolo && (
            <button
              onClick={() => {
                sound.playCountdownTick(2);
                onStartSolo();
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-slate-900/90 hover:bg-amber-500/10 hover:border-amber-400 text-xs font-bold text-amber-300 cursor-pointer transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              Solo Practice
            </button>
          )}

          <button
            onClick={() => {
              sound.playKeystroke(60, true);
              onEnterGrid();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_0_25px_rgba(0,255,135,0.45)] hover:shadow-[0_0_35px_rgba(0,255,135,0.7)] transition-all transform hover:-translate-y-0.5"
          >
            Launch Grid
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Hero Section with Cinematic Background & Live Interactive Teaser */}
      <section className="relative w-full min-h-[82vh] flex items-center justify-center px-6 py-12 overflow-hidden">
        {/* Cinematic Backdrop Image with Dark Radial Vignette */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Meanwhile Tokyo Night Expressway" 
            className="w-full h-full object-cover object-center filter brightness-60 scale-105 transform animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04060a] via-[#04060a]/70 to-[#04060a]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.15)_0%,rgba(0,0,0,0.85)_75%)]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">
          
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,135,0.2)]">
            <Zap className="w-4 h-4 animate-bounce" />
            <span>ACCELERATION GOVERNED BY PURE KEYSTROKE VELOCITY</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white uppercase leading-[0.95] max-w-4xl drop-shadow-2xl">
            TYPE FAST. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
              DRIVE FASTER.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed drop-shadow">
            Race engineered supercars and superbikes across Tokyo, the Swiss Alps, and Dubai. 
            Validated typing accuracy and words-per-minute directly translate into mechanical horsepower.
          </p>

          {/* Interactive "TYPE TO REV" In-Hero Playable Teaser */}
          <div className="mt-10 w-full max-w-xl bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {/* Telemetry Tachometer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-semibold uppercase">Cockpit Throttle Test</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  RPM: <strong className="text-emerald-400 font-bold">{revRpm.toLocaleString()}</strong>
                </span>
                <span className="text-slate-400">
                  SPEED: <strong className="text-cyan-400 font-bold">{revSpeed} KM/H</strong>
                </span>
              </div>
            </div>

            {/* Tachometer Visual Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-500"
                style={{ width: `${(revRpm / 9000) * 100}%` }}
              />
            </div>

            {/* Typing Prompt Box */}
            <div className="mt-4 text-left">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">
                TYPE THIS TO REV THE ENGINE:
              </span>
              <div className="p-3 rounded-xl bg-black/60 border border-slate-700 font-mono text-sm tracking-wide">
                <span className="text-emerald-400 font-bold">{revInput}</span>
                <span className="text-slate-500">{revPrompt.slice(revInput.length)}</span>
              </div>

              <input
                type="text"
                value={revInput}
                onChange={handleRevTyping}
                placeholder="Click here and type to engage throttle..."
                className="w-full mt-2.5 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                autoFocus={false}
              />
            </div>

            {/* Rev Result Alert */}
            {revCompleted ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>REDLINE PEAKED! ENGINE ENGAGED AT 9,000 RPM</span>
                </div>
                <button
                  onClick={onEnterGrid}
                  className="px-4 py-1.5 rounded-lg bg-emerald-400 text-black font-extrabold text-xs uppercase cursor-pointer hover:bg-emerald-300 shadow-md"
                >
                  Enter Grid Now →
                </button>
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{revPrompt.length - revInput.length} characters remaining</span>
                {revInput.length > 0 && (
                  <button onClick={handleResetRev} className="hover:text-slate-300 cursor-pointer flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                sound.playKeystroke(60, true);
                onEnterGrid();
              }}
              className="px-8 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-black uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_35px_rgba(0,255,135,0.45)] hover:shadow-[0_0_50px_rgba(0,255,135,0.7)] cursor-pointer transform hover:-translate-y-0.5 transition-all"
            >
              Enter Matchmaking Grid
              <ArrowRight className="w-4 h-4" />
            </button>

            {onStartSolo && (
              <button
                onClick={() => {
                  sound.playCountdownTick(2);
                  onStartSolo();
                }}
                className="px-8 py-4 rounded-xl border border-amber-500/50 bg-slate-900/90 hover:bg-amber-500/10 hover:border-amber-400 text-amber-300 text-sm font-black uppercase tracking-wider flex items-center gap-2.5 cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-current text-amber-400" />
                Solo AI Practice
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. Interactive 3D Machine Turntable Showcase */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              HIGH-PERFORMANCE MACHINERY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Select Your Racing Machine
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Drag to orbit and inspect each vehicle in real-time 3D. Tailor bodywork aero colors before deployment.
            </p>
          </div>

          {/* Vehicle Selector Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
            {VEHICLES.map(v => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVehicleId(v.id);
                  setActiveVehicleColor(v.defaultColor);
                  sound.playKeyClick(false);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  activeVehicleId === v.id
                    ? 'bg-emerald-400 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Turntable Grid Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
          {/* Left: 3D Canvas */}
          <div className="lg:col-span-7 relative h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-center">
            <div ref={showcaseContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            
            <div className="absolute top-4 left-4 pointer-events-none">
              <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-black/70 text-slate-300 border border-slate-700">
                DRAG MOUSE TO ORBIT 360°
              </span>
            </div>

            {/* Color Swatches */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-2 rounded-xl bg-black/60 backdrop-blur-md border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 pl-2">LIVERY PAINT:</span>
              <div className="flex items-center gap-1.5">
                {activeVehicle.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveVehicleColor(c);
                      sound.playKeyClick(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      activeVehicleColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Vehicle Telemetry Specs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  {activeVehicle.type.toUpperCase()} CLASS
                </span>
                <span className="text-xs text-slate-400 font-mono">LEVEL {activeVehicle.unlockLevel} UNLOCK</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{activeVehicle.name}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{activeVehicle.description}</p>
            </div>

            {/* Telemetry Spec Bars */}
            <div className="space-y-4 p-5 rounded-2xl bg-black/40 border border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">TOP SPEED INDEX</span>
                  <span className="text-emerald-400 font-bold">{activeVehicle.topSpeedKmh} KM/H</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full" 
                    style={{ width: `${(activeVehicle.topSpeedKmh / 400) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">THROTTLE ACCELERATION</span>
                  <span className="text-cyan-400 font-bold">{activeVehicle.accelerationRating} / 10</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 rounded-full" 
                    style={{ width: `${(activeVehicle.accelerationRating / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">AERODYNAMIC DOWNFORCE</span>
                  <span className="text-amber-400 font-bold">ACTIVE WING</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[88%]" />
                </div>
              </div>
            </div>

            <button
              onClick={onEnterGrid}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700"
            >
              Equip Machine on Grid
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Global Circuits Showcase */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            3 GLOBAL CIRCUITS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Engineered Global Tarmac
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Each track features authentic 4-lane Catmull-Rom spline curvature, dynamic banking into apexes, and 3D FIA rumble strips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Circuit 1: Tokyo */}
          <div className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 transition-all duration-300">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={heroBg} 
                alt="Tokyo Night Run" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                MEDIUM
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                Tokyo Night Run
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Shuto Expressway, Tokyo, Japan</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                Elevated highway viaducts winding between neon skyscrapers with rainy wet asphalt reflections and sharp chicanes.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
                <span>DISTANCE: 1,200m</span>
                <span className="text-emerald-400">4 LANES</span>
              </div>
            </div>
          </div>

          {/* Circuit 2: Swiss Alps */}
          <div className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 transition-all duration-300">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={swissTrack} 
                alt="Swiss Alpine Pass" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                HARD
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Swiss Alpine Pass
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Furka Pass, Swiss Alps</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                High-altitude mountain road flanked by towering granite peaks, dense Norwegian pine forests, and dramatic hairpin curves.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
                <span>DISTANCE: 1,400m</span>
                <span className="text-amber-400">ELEVATION 52m</span>
              </div>
            </div>
          </div>

          {/* Circuit 3: Dubai */}
          <div className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 transition-all duration-300">
            <div className="h-48 overflow-hidden relative bg-gradient-to-br from-amber-900/40 via-slate-900 to-black flex items-center justify-center">
              <div className="text-center p-4">
                <Compass className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <span className="text-xs font-mono text-slate-300 uppercase">FIA Grade 1 Sweeper</span>
              </div>
              <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold">
                EASY
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Dubai Grand Circuit
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Desert Perimeter, Dubai, UAE</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                High-speed parabolic desert sweepers flanked by illuminated floodlight masts, turquoise runoff zones, and sunset dunes.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
                <span>DISTANCE: 1,100m</span>
                <span className="text-cyan-400">HIGH-SPEED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Literary & Musical Passages Showcase */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            CULTURE & PROVENANCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Racing Powered by Masterpieces
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every race passage is curated from renowned literature, legendary music, and landmark speeches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold mb-3 border border-emerald-500/20">
                <BookOpen className="w-3 h-3" /> Book
              </span>
              <h4 className="text-base font-bold text-white">"The Great Gatsby"</h4>
              <p className="text-xs text-slate-400 font-mono mb-3">F. Scott Fitzgerald (1925)</p>
              <p className="text-xs text-slate-300 italic border-l-2 border-emerald-400 pl-3 leading-relaxed">
                "So we beat on, boats against the current, borne back ceaselessly into the past."
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-4 block">Classic Literature</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold mb-3 border border-cyan-500/20">
                <BookOpen className="w-3 h-3" /> Sci-Fi
              </span>
              <h4 className="text-base font-bold text-white">"Dune"</h4>
              <p className="text-xs text-slate-400 font-mono mb-3">Frank Herbert (1965)</p>
              <p className="text-xs text-slate-300 italic border-l-2 border-cyan-400 pl-3 leading-relaxed">
                "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration."
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-4 block">Litany Against Fear</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold mb-3 border border-amber-500/20">
                <Music className="w-3 h-3" /> Song
              </span>
              <h4 className="text-base font-bold text-white">"Bohemian Rhapsody"</h4>
              <p className="text-xs text-slate-400 font-mono mb-3">Queen (1975)</p>
              <p className="text-xs text-slate-300 italic border-l-2 border-amber-400 pl-3 leading-relaxed">
                "Is this the real life? Is this just fantasy? Caught in a landslide, no escape from reality."
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-4 block">Classic Rock</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold mb-3 border border-purple-500/20">
                <Zap className="w-3 h-3" /> Speech
              </span>
              <h4 className="text-base font-bold text-white">"Pale Blue Dot"</h4>
              <p className="text-xs text-slate-400 font-mono mb-3">Carl Sagan (1994)</p>
              <p className="text-xs text-slate-300 italic border-l-2 border-purple-400 pl-3 leading-relaxed">
                "Look again at that dot. That's here. That's home. That's us. On it everyone you love..."
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-4 block">Cosmology & Philosophy</span>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action Grid */}
      <section className="w-full max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="relative rounded-3xl p-10 sm:p-16 border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-black overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,135,0.15),transparent_70%)]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-3">
              THE GRID AWAITS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
              Ready to Claim the Pole Position?
            </h2>
            <p className="mt-4 text-slate-300 max-w-lg text-sm sm:text-base">
              No downloads required. Join racers worldwide in real-time authoritative 3D typing battles right in your browser.
            </p>

            <button
              onClick={onEnterGrid}
              className="mt-8 px-10 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_35px_rgba(0,255,135,0.5)] transform hover:-translate-y-1 transition-all"
            >
              Enter Grid Dispatch
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. Global Gaming Footer */}
      <footer className="w-full border-t border-slate-800 bg-black/90 px-6 py-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">MEANWHILE RACING SOFTWARE</span>
            <span>•</span>
            <span>PROPRIETARY 3D MULTIPLAYER ENGINE</span>
          </div>
          <div>
            <span>AUTONOMOUS LOW-LATENCY WEBSOCKET PROTOCOL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
