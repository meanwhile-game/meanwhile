import React, { useEffect, useRef, useState } from 'react';
import {
  VEHICLES,
  VehicleConfig,
  VehicleCustomization,
  getDefaultCustomization,
  PaintFinishType,
  LiveryStyle,
  SpoilerStyle,
  WindowTintStyle,
  UnderglowMode
} from '../../three/types.js';
import { GarageSceneManager, CameraPreset } from '../../three/GarageScene.js';
import {
  ArrowLeft,
  Check,
  Gauge,
  Zap,
  Volume2,
  Sparkles,
  ChevronRight,
  RotateCw,
  Award,
  Palette,
  Flag,
  CircleDot,
  Wind,
  Lightbulb,
  Camera,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { AdBanner } from '../common/AdBanner.js';

interface GarageScreenProps {
  currentVehicleId: string;
  currentColor: string;
  playerLevel: number;
  onSelectVehicle: (vehicleId: string, color: string, customization?: VehicleCustomization) => void;
  onBack: () => void;
}

type TuningTab = 'paint' | 'livery' | 'wheels' | 'aero' | 'underglow';

const RIM_COLORS = [
  { name: 'Chrome Silver', hex: '#f1f5f9' },
  { name: 'Forged Gold', hex: '#d4af37' },
  { name: 'Stealth Black', hex: '#0f172a' },
  { name: 'Gunmetal', hex: '#475569' },
  { name: 'Hyper Cyan', hex: '#00e5ff' }
];

const CALIPER_COLORS = [
  { name: 'Acid Lime', hex: '#00ff87' },
  { name: 'Rosso Red', hex: '#ef4444' },
  { name: 'Electric Blue', hex: '#38bdf8' },
  { name: 'Sunburst Gold', hex: '#f59e0b' },
  { name: 'Steel Silver', hex: '#94a3b8' }
];

const UNDERGLOW_COLORS = [
  { name: 'Acid Green', hex: '#00ff87' },
  { name: 'Electric Cyan', hex: '#00e5ff' },
  { name: 'Neon Magenta', hex: '#ff007f' },
  { name: 'Cyber Violet', hex: '#a855f7' },
  { name: 'Amber Sun', hex: '#ffaa00' },
  { name: 'Ice White', hex: '#ffffff' },
  { name: 'Stealth Off', hex: 'none' }
];

function loadSavedCustomization(vehicleId: string, defaultColor: string): VehicleCustomization {
  try {
    const raw = localStorage.getItem(`meanwhile_custom_${vehicleId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return getDefaultCustomization(vehicleId, defaultColor);
}

export const GarageScreen: React.FC<GarageScreenProps> = ({
  currentVehicleId,
  currentColor,
  playerLevel,
  onSelectVehicle,
  onBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<GarageSceneManager | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleConfig>(() => {
    return VEHICLES.find(v => v.id === currentVehicleId) || VEHICLES[0];
  });

  const [customization, setCustomization] = useState<VehicleCustomization>(() => {
    return loadSavedCustomization(selectedVehicle.id, currentColor);
  });

  const [activeTab, setActiveTab] = useState<TuningTab>('paint');
  const [activeCamera, setActiveCamera] = useState<CameraPreset>('hero');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isEquipped, setIsEquipped] = useState<boolean>(selectedVehicle.id === currentVehicleId);
  const [isRevving, setIsRevving] = useState<boolean>(false);

  // Initialize 3D Showroom Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new GarageSceneManager(
      containerRef.current,
      selectedVehicle.id,
      customization
    );
    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  const handleSelectVehicle = (vehicle: VehicleConfig) => {
    sound.playKeystroke(60, true);
    setSelectedVehicle(vehicle);

    const saved = loadSavedCustomization(vehicle.id, vehicle.defaultColor);
    setCustomization(saved);
    setIsEquipped(vehicle.id === currentVehicleId);
    sceneManagerRef.current?.loadVehicle(vehicle.id, saved);
  };

  const updateTuning = (updater: (prev: VehicleCustomization) => VehicleCustomization) => {
    sound.playKeystroke(80, true);
    setCustomization((prev) => {
      const next = updater(prev);
      sceneManagerRef.current?.updateCustomization(selectedVehicle.id, next);
      try {
        localStorage.setItem(`meanwhile_custom_${selectedVehicle.id}`, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
    setIsEquipped(false);
  };

  const handleCameraChange = (preset: CameraPreset) => {
    sound.playKeystroke(50, true);
    setActiveCamera(preset);
    sceneManagerRef.current?.setCameraPreset(preset);
  };

  const handleToggleAutoRotate = () => {
    sound.playKeystroke(50, true);
    const next = !autoRotate;
    setAutoRotate(next);
    sceneManagerRef.current?.setAutoRotate(next);
  };

  const handleRevEngine = () => {
    setIsRevving(true);
    sound.startEngine();
    sound.playKeystroke(140, true);
    sceneManagerRef.current?.revThrottle(1.0);

    setTimeout(() => {
      sound.stopEngine();
      setIsRevving(false);
    }, 2000);
  };

  const handleEquip = () => {
    sound.playCountdownTick(0);
    onSelectVehicle(selectedVehicle.id, customization.color, customization);
    setIsEquipped(true);
    try {
      localStorage.setItem('meanwhile_vehicle_id', selectedVehicle.id);
      localStorage.setItem('meanwhile_vehicle_color', customization.color);
      localStorage.setItem(`meanwhile_custom_${selectedVehicle.id}`, JSON.stringify(customization));
    } catch (e) {
      // ignore
    }
  };

  const isUnlocked = playerLevel >= selectedVehicle.unlockLevel;

  // Dynamic Aero & Downforce spec calculation based on tuning
  const calculatedDownforce = customization.spoilerStyle === 'gt-wing'
    ? 440
    : customization.spoilerStyle === 'ducktail'
    ? 290
    : 160;

  const calculatedGrip = customization.spoilerStyle === 'gt-wing'
    ? '1.92 G'
    : '1.85 G';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-slate-900 select-none">
      {/* 3D Turntable Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Vignette & Grid */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

      {/* 1. Top Unified Meanwhile Header */}
      <header className="relative z-10 w-full px-6 py-3.5 bg-[#10304f] border-b border-[#1b4b7a] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playKeystroke(50, true);
              onBack();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border border-white/15 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-300" />
            Return to Grid
          </button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏎️</span>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                MEANWHILE <span className="text-emerald-400 text-xs">GARAGE</span>
              </span>
              <span className="text-[10px] text-slate-300">Customization Studio & Engineering</span>
            </div>
          </div>
        </div>

        {/* Studio Camera & Inspection Presets */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-slate-300 px-2 flex items-center gap-1">
            <Camera className="w-3 h-3 text-cyan-300" /> ANGLE:
          </span>
          {[
            { id: 'hero', label: 'Showroom Hero' },
            { id: 'wheels', label: 'Wheels & Brakes' },
            { id: 'aero', label: 'Aero & Exhaust' },
            { id: 'front', label: 'Front Fascia' }
          ].map((cam) => {
            const active = activeCamera === cam.id;
            return (
              <button
                key={cam.id}
                onClick={() => handleCameraChange(cam.id as CameraPreset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#2ea44f] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cam.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Turntable Auto-Rotate Toggle */}
          <button
            onClick={handleToggleAutoRotate}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              autoRotate
                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                : 'bg-white/10 border-white/15 text-slate-200 hover:text-white'
            }`}
            title="Toggle 360° Showroom Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin text-sky-300' : 'text-slate-300'}`} style={{ animationDuration: '8s' }} />
            <span className="hidden sm:inline">360° ORBIT</span>
          </button>

          {/* Interactive Rev Throttle */}
          <button
            onClick={handleRevEngine}
            className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              isRevving
                ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse'
                : 'bg-white/10 border-white/15 text-slate-200 hover:text-white'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isRevving ? 'text-rose-400 animate-spin' : 'text-amber-300'}`} />
            <span>{isRevving ? 'REDLINE // 9,000 RPM' : 'TEST THROTTLE'}</span>
          </button>
        </div>
      </header>

      {/* 2. Left Machine Lineup Sidebar */}
      <div className="absolute left-6 top-20 bottom-64 z-10 w-72 flex flex-col gap-2.5 pointer-events-none hidden md:flex">
        <div className="px-3 py-2 rounded-xl bg-white/95 border border-slate-200 text-[10px] font-mono font-bold text-[#16426a] uppercase tracking-wider shadow-md flex items-center justify-between backdrop-blur-md">
          <span>CHAMPIONSHIP MACHINERY</span>
          <span className="text-[#2ea44f] font-bold">{VEHICLES.length} RIGS</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pointer-events-auto pr-1">
          {VEHICLES.map((vehicle) => {
            const active = vehicle.id === selectedVehicle.id;
            const unlocked = playerLevel >= vehicle.unlockLevel;

            return (
              <div
                key={vehicle.id}
                onClick={() => handleSelectVehicle(vehicle)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md flex items-center justify-between group ${
                  active
                    ? 'bg-slate-50 border-[#2ea44f] shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${vehicle.defaultColor}20`,
                      border: `1px solid ${vehicle.defaultColor}40`
                    }}
                  >
                    🏎️
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-xs font-bold ${active ? 'text-[#16426a]' : 'text-slate-900 group-hover:text-black'}`}>
                      {vehicle.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 capitalize">
                      {vehicle.type} • {vehicle.topSpeedKmh} KM/H
                    </span>
                  </div>
                </div>

                {unlocked ? (
                  active ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ea44f] animate-pulse" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  )
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    LVL {vehicle.unlockLevel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Right Technical Telemetry Card */}
      <div className="absolute right-6 top-20 z-10 w-64 pointer-events-none hidden lg:flex flex-col gap-3">
        <div className="p-4 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl pointer-events-auto text-slate-900">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-3">
            <span>AERODYNAMIC PROFILE</span>
            <span className="text-[#2ea44f] font-bold">{selectedVehicle.type}</span>
          </div>

          <div className="space-y-3">
            {/* Top Speed Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-600 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-[#2ea44f]" /> Top Speed
                </span>
                <span className="font-bold text-[#16426a]">{selectedVehicle.topSpeedKmh} KM/H</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2ea44f] rounded-full"
                  style={{ width: `${Math.min(100, (selectedVehicle.topSpeedKmh / 385) * 100)}%` }}
                />
              </div>
            </div>

            {/* Acceleration Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-600 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Acceleration
                </span>
                <span className="font-bold text-[#16426a]">{selectedVehicle.accelerationRating} / 10</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${selectedVehicle.accelerationRating * 10}%` }}
                />
              </div>
            </div>

            {/* Dynamic Telemetry Specs */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">DOWNFORCE</span>
                <span className="font-bold text-[#16426a]">{calculatedDownforce} KG</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">LATERAL GRIP</span>
                <span className="font-bold text-purple-700">{calculatedGrip}</span>
              </div>
            </div>

            {/* Active Tuning Specs */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>PAINT FINISH:</span>
                <span className="text-[#16426a] font-bold capitalize">{customization.paintFinish}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>LIVERY DECAL:</span>
                <span className="text-[#16426a] font-bold capitalize">{customization.livery}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>AERO WING:</span>
                <span className="text-[#16426a] font-bold capitalize">{customization.spoilerStyle}</span>
              </div>
            </div>

            {/* SPONSORED RECTANGLE AD (300x250) */}
            <AdBanner
              slotId="ad-garage-sidebar-rectangle"
              format="rectangle"
              className="mt-3 w-full"
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom Supercar Customization Studio Console */}
      <div className="absolute left-6 right-6 bottom-5 z-10 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-slate-900">
          {/* Studio Tab Navigation Bar */}
          <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'paint', label: 'Paint & Finish', icon: Palette },
                { id: 'livery', label: 'Racing Livery', icon: Flag },
                { id: 'wheels', label: 'Wheels & Brakes', icon: CircleDot },
                { id: 'aero', label: 'Aero & Glass', icon: Wind },
                { id: 'underglow', label: 'Underglow Neon', icon: Lightbulb }
              ].map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sound.playKeystroke(60, true);
                      setActiveTab(tab.id as TuningTab);
                      if (tab.id === 'wheels') handleCameraChange('wheels');
                      if (tab.id === 'aero') handleCameraChange('aero');
                      if (tab.id === 'paint') handleCameraChange('hero');
                    }}
                    className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'border-[#2ea44f] text-[#16426a] bg-emerald-50'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#2ea44f]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Car Info */}
            <div className="hidden sm:flex items-center gap-2 text-right">
              <span className="text-xs font-bold text-[#16426a]">{selectedVehicle.name}</span>
              <span className="text-[10px] font-mono text-[#2ea44f] font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                {selectedVehicle.type.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Studio Tab Content Panel */}
          <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Panel 1: PAINT & FINISH */}
            {activeTab === 'paint' && (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Primary Colors */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    PRIMARY AUTOMOTIVE COLOR
                  </span>
                  <div className="flex items-center gap-2.5">
                    {selectedVehicle.colors.map((color) => {
                      const isCurrent = customization.color === color;
                      return (
                        <button
                          key={color}
                          onClick={() => updateTuning((prev) => ({ ...prev, color }))}
                          className={`w-7 h-7 rounded-lg transition-transform cursor-pointer flex items-center justify-center ${
                            isCurrent
                              ? 'scale-125 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                              : 'hover:scale-110 opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Finish Style */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    SURFACE FINISH SPEC
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'gloss', label: 'Gloss Clearcoat' },
                      { id: 'matte', label: 'Satin Matte' },
                      { id: 'metallic', label: 'Metallic Flake' },
                      { id: 'carbon', label: 'Forged Carbon' }
                    ].map((finish) => {
                      const active = customization.paintFinish === finish.id;
                      return (
                        <button
                          key={finish.id}
                          onClick={() => updateTuning((prev) => ({ ...prev, paintFinish: finish.id as PaintFinishType }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {finish.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 2: RACING LIVERY */}
            {activeTab === 'livery' && (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    CHAMPIONSHIP LIVERY DECALS
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'clean', label: 'Clean Factory Spec', desc: 'Pure Showroom Finish' },
                      { id: 'stripes', label: 'GT Dual Stripes', desc: 'Center Racing Ribbons' },
                      { id: 'cyber', label: 'Cyber Synthwave', desc: 'Geometric Speed Strakes' },
                      { id: 'esports', label: 'Apex Esports #07', desc: 'Competition Roundel' }
                    ].map((liv) => {
                      const active = customization.livery === liv.id;
                      return (
                        <button
                          key={liv.id}
                          onClick={() => updateTuning((prev) => ({ ...prev, livery: liv.id as LiveryStyle }))}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,255,135,0.25)]'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold block">{liv.label}</span>
                          <span className="text-[9px] font-mono text-slate-400 block">{liv.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 3: WHEELS & BRAKES */}
            {activeTab === 'wheels' && (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                {/* Forged Rims */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    FORGED RIM ALLOY FINISH
                  </span>
                  <div className="flex items-center gap-2.5">
                    {RIM_COLORS.map((rim) => {
                      const active = customization.rimColor === rim.hex;
                      return (
                        <button
                          key={rim.hex}
                          onClick={() => updateTuning((prev) => ({ ...prev, rimColor: rim.hex }))}
                          className={`w-7 h-7 rounded-lg transition-transform cursor-pointer border flex items-center justify-center ${
                            active
                              ? 'scale-125 ring-2 ring-emerald-400 border-white shadow-[0_0_15px_rgba(0,255,135,0.4)]'
                              : 'border-slate-700 opacity-70 hover:opacity-100 hover:scale-110'
                          }`}
                          style={{ backgroundColor: rim.hex }}
                          title={rim.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Caliper Color */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    BREMBO RACING BRAKE CALIPER
                  </span>
                  <div className="flex items-center gap-2.5">
                    {CALIPER_COLORS.map((cal) => {
                      const active = customization.caliperColor === cal.hex;
                      return (
                        <button
                          key={cal.hex}
                          onClick={() => updateTuning((prev) => ({ ...prev, caliperColor: cal.hex }))}
                          className={`w-7 h-7 rounded-lg transition-transform cursor-pointer border flex items-center justify-center ${
                            active
                              ? 'scale-125 ring-2 ring-white border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                              : 'border-slate-700 opacity-70 hover:opacity-100 hover:scale-110'
                          }`}
                          style={{ backgroundColor: cal.hex }}
                          title={cal.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 4: AERO & GLASS */}
            {activeTab === 'aero' && (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                {/* Aero Spoiler */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    AERODYNAMIC REAR WING
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'gt-wing', label: 'Swan-Neck GT Wing' },
                      { id: 'ducktail', label: 'Kick-Up Ducktail' },
                      { id: 'stock', label: 'Low-Drag Lip' }
                    ].map((sp) => {
                      const active = customization.spoilerStyle === sp.id;
                      return (
                        <button
                          key={sp.id}
                          onClick={() => updateTuning((prev) => ({ ...prev, spoilerStyle: sp.id as SpoilerStyle }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {sp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Window Tint */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    POLYCARBONATE WINDOW TINT
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'smoke', label: 'Smoke 50%' },
                      { id: 'dark-limo', label: 'Limo 95%' },
                      { id: 'chameleon', label: 'Chameleon' },
                      { id: 'clear', label: 'Clear Spec' }
                    ].map((tint) => {
                      const active = customization.windowTint === tint.id;
                      return (
                        <button
                          key={tint.id}
                          onClick={() => updateTuning((prev) => ({ ...prev, windowTint: tint.id as WindowTintStyle }))}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {tint.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Panel 5: UNDERGLOW NEON */}
            {activeTab === 'underglow' && (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                {/* Underglow Color */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    NEON GROUND ILLUMINATION
                  </span>
                  <div className="flex items-center gap-2.5">
                    {UNDERGLOW_COLORS.map((ug) => {
                      const active = customization.underglowColor === ug.hex;
                      return (
                        <button
                          key={ug.hex}
                          onClick={() => updateTuning((prev) => ({
                            ...prev,
                            underglowColor: ug.hex,
                            underglowMode: ug.hex === 'none' ? 'none' : prev.underglowMode === 'none' ? 'solid' : prev.underglowMode
                          }))}
                          className={`w-7 h-7 rounded-lg transition-transform cursor-pointer border flex items-center justify-center ${
                            active
                              ? 'scale-125 ring-2 ring-white border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                              : 'border-slate-700 opacity-70 hover:opacity-100 hover:scale-110'
                          }`}
                          style={{ backgroundColor: ug.hex === 'none' ? '#18181b' : ug.hex }}
                          title={ug.name}
                        >
                          {ug.hex === 'none' && <span className="text-[10px] font-bold text-rose-400">✕</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Underglow Mode */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    ILLUMINATION MODE
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'solid', label: 'Solid Glow' },
                      { id: 'pulse', label: 'Breathing Pulse' },
                      { id: 'none', label: 'Deactivated' }
                    ].map((mode) => {
                      const active = customization.underglowMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => updateTuning((prev) => ({ ...prev, underglowMode: mode.id as UnderglowMode }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-400 text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Equip / Install Action Button */}
            <div className="flex-shrink-0 pt-2 sm:pt-0">
              {isUnlocked ? (
                <button
                  onClick={handleEquip}
                  disabled={isEquipped}
                  className={`px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                    isEquipped
                      ? 'bg-slate-100 border border-slate-300 text-slate-500 cursor-default opacity-90'
                      : 'bg-[#2ea44f] hover:bg-[#2c974b] text-white shadow-lg shadow-emerald-500/25 transform hover:-translate-y-0.5'
                  }`}
                >
                  {isEquipped ? <Check className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4" />}
                  {isEquipped ? 'Equipped to Rig' : 'Install to Active Rig'}
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono text-amber-700 font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  License Level {selectedVehicle.unlockLevel} Required
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
