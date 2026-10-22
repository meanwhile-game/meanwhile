import React, { useEffect, useRef, useState } from 'react';
import { VEHICLES, VehicleConfig } from '../../three/types.js';
import { GarageSceneManager } from '../../three/GarageScene.js';
import { ArrowLeft, Check, Gauge, Zap, Volume2, ShieldCheck, Sparkles, ChevronRight, RotateCw, Award } from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { useTheme } from '../../theme/ThemeContext.js';

interface GarageScreenProps {
  currentVehicleId: string;
  currentColor: string;
  playerLevel: number;
  onSelectVehicle: (vehicleId: string, color: string) => void;
  onBack: () => void;
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
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const [isEquipped, setIsEquipped] = useState<boolean>(
    selectedVehicle.id === currentVehicleId && selectedColor === currentColor
  );
  const [isRevving, setIsRevving] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new GarageSceneManager(
      containerRef.current,
      selectedVehicle.id,
      selectedColor
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
    setSelectedColor(vehicle.defaultColor);
    setIsEquipped(vehicle.id === currentVehicleId && vehicle.defaultColor === currentColor);
    sceneManagerRef.current?.loadVehicle(vehicle.id, vehicle.defaultColor);
  };

  const handleSelectColor = (color: string) => {
    sound.playKeystroke(80, true);
    setSelectedColor(color);
    setIsEquipped(selectedVehicle.id === currentVehicleId && color === currentColor);
    sceneManagerRef.current?.updateColor(selectedVehicle.id, color);
  };

  const handleEquip = () => {
    sound.playCountdownTick(0);
    onSelectVehicle(selectedVehicle.id, selectedColor);
    setIsEquipped(true);
  };

  const handleRevEngine = () => {
    setIsRevving(true);
    sound.startEngine();
    sound.playKeystroke(140, true);
    setTimeout(() => {
      sound.stopEngine();
      setIsRevving(false);
    }, 1800);
  };

  const isUnlocked = playerLevel >= selectedVehicle.unlockLevel;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-white select-none">
      {/* 3D Turntable Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Vignette & Grid */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />

      {/* 1. Top HUD Header */}
      <header className="relative z-10 w-full p-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => {
            sound.playKeystroke(50, true);
            onBack();
          }}
          className="pointer-events-auto px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md transition-all hover:border-slate-500"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Return to Grid
        </button>

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Interactive Rev Button */}
          <button
            onClick={handleRevEngine}
            className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              isRevving
                ? 'bg-rose-500/30 border-rose-400 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isRevving ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
            <span>{isRevving ? 'REV REDLINE // 9,000 RPM' : 'TEST THROTTLE'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-400 backdrop-blur-md">
            <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>DRAG TO ORBIT 360°</span>
          </div>
        </div>
      </header>

      {/* 2. Left Machine Lineup Sidebar */}
      <div className="absolute left-6 top-24 bottom-28 z-10 w-72 flex flex-col gap-2.5 pointer-events-none hidden md:flex">
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest backdrop-blur-md">
          CHAMPIONSHIP MACHINERY
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
                    ? 'bg-slate-900/95 border-emerald-400/80 shadow-[0_0_25px_rgba(0,255,135,0.25)]'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
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
                    <span className={`text-xs font-bold ${active ? 'text-emerald-300' : 'text-white group-hover:text-slate-200'}`}>
                      {vehicle.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 capitalize">
                      {vehicle.type} • {vehicle.topSpeedKmh} KM/H
                    </span>
                  </div>
                </div>

                {unlocked ? (
                  active ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  )
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    LVL {vehicle.unlockLevel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Right Technical Telemetry Card */}
      <div className="absolute right-6 top-24 z-10 w-64 pointer-events-none hidden lg:flex flex-col gap-3">
        <div className="p-4 rounded-2xl border border-slate-800/90 bg-slate-950/80 backdrop-blur-md shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-3">
            <span>AERODYNAMIC PROFILE</span>
            <span className="text-emerald-400 font-bold">{selectedVehicle.type}</span>
          </div>

          <div className="space-y-3">
            {/* Top Speed Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-emerald-400" /> Top Speed
                </span>
                <span className="font-bold text-white">{selectedVehicle.topSpeedKmh} KM/H</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${Math.min(100, (selectedVehicle.topSpeedKmh / 360) * 100)}%` }}
                />
              </div>
            </div>

            {/* Acceleration Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Acceleration
                </span>
                <span className="font-bold text-white">{selectedVehicle.accelerationRating} / 10</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${selectedVehicle.accelerationRating * 10}%` }}
                />
              </div>
            </div>

            {/* G-Force Spec */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">LATERAL GRIP</span>
                <span className="font-bold text-cyan-300">1.85 G</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CURB WEIGHT</span>
                <span className="font-bold text-purple-300">1,180 KG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Floating Tuning Console Bar */}
      <div className="absolute left-6 right-6 bottom-6 z-10 flex justify-center pointer-events-none">
        <div 
          className="pointer-events-auto w-full max-w-4xl p-5 rounded-2xl border border-slate-800 bg-slate-950/90 shadow-[0_15px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-5"
        >
          {/* Active Machine Name & Stats */}
          <div className="flex items-center gap-4 text-left min-w-[200px]">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: `${selectedColor}20`, border: `1px solid ${selectedColor}50` }}
            >
              🏎️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {selectedVehicle.name}
                </h2>
                {isEquipped && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    EQUIPPED
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400 capitalize">
                {selectedVehicle.type} Class • {selectedVehicle.topSpeedKmh} KM/H Redline
              </span>
            </div>
          </div>

          {/* Color Livery Palette Dock */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              CUSTOM LIVERY COLOR
            </span>
            <div className="flex items-center gap-2">
              {selectedVehicle.colors.map((color) => {
                const isCurrent = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => handleSelectColor(color)}
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

          {/* Action Equip Button */}
          <div>
            {isUnlocked ? (
              <button
                onClick={handleEquip}
                disabled={isEquipped}
                className={`px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                  isEquipped
                    ? 'bg-slate-900 border border-slate-700 text-slate-400 cursor-default opacity-80'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-[0_0_25px_rgba(0,255,135,0.4)] hover:shadow-[0_0_35px_rgba(0,255,135,0.6)] transform hover:-translate-y-0.5'
                }`}
              >
                {isEquipped ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
                {isEquipped ? 'Equipped to Rig' : 'Install to Active Rig'}
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                License Level {selectedVehicle.unlockLevel} Required
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
