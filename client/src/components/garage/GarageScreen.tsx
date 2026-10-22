import React, { useEffect, useRef, useState } from 'react';
import { VEHICLES, VehicleConfig } from '../../three/types.js';
import { GarageSceneManager } from '../../three/GarageScene.js';
import { ArrowLeft, Check, Gauge, Zap } from 'lucide-react';
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
    setSelectedVehicle(vehicle);
    setSelectedColor(vehicle.defaultColor);
    setIsEquipped(vehicle.id === currentVehicleId && vehicle.defaultColor === currentColor);
    sceneManagerRef.current?.loadVehicle(vehicle.id, vehicle.defaultColor);
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setIsEquipped(selectedVehicle.id === currentVehicleId && color === currentColor);
    sceneManagerRef.current?.updateColor(selectedVehicle.id, color);
  };

  const handleEquip = () => {
    onSelectVehicle(selectedVehicle.id, selectedColor);
    setIsEquipped(true);
  };

  const isUnlocked = playerLevel >= selectedVehicle.unlockLevel;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-charcoal-950 text-white select-none">
      {/* 3D Turntable Canvas Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header */}
      <header className="relative z-10 w-full p-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Grid
        </button>

        <div 
          className="px-3.5 py-1.5 rounded-lg border text-xs font-num"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          Drag to orbit • 360° Showroom
        </div>
      </header>

      {/* Bottom Floating Control Bar */}
      <div className="absolute left-6 right-6 bottom-6 z-10 flex justify-center pointer-events-none">
        <div 
          className="pointer-events-auto w-full max-w-4xl p-5 rounded-2xl border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
        >
          {/* Machine Name & Class */}
          <div className="flex flex-col text-left min-w-[180px]">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {selectedVehicle.name}
              </h2>
            </div>
            <span className="text-xs font-num capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {selectedVehicle.type} Class • {selectedVehicle.topSpeedKmh} KM/H Top
            </span>

            {/* Spec Numbers */}
            <div className="flex items-center gap-4 mt-2 text-xs font-num" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                {selectedVehicle.topSpeedKmh} KM/H
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                {selectedVehicle.accelerationRating} / 10
              </span>
            </div>
          </div>

          {/* Vehicle Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
            {VEHICLES.map((vehicle) => {
              const active = vehicle.id === selectedVehicle.id;

              return (
                <button
                  key={vehicle.id}
                  onClick={() => handleSelectVehicle(vehicle)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                    active ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: active ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    borderColor: active ? 'var(--accent)' : 'var(--border-subtle)',
                    color: active ? 'var(--accent-text)' : 'var(--text-primary)'
                  }}
                >
                  {vehicle.name}
                </button>
              );
            })}
          </div>

          {/* Paint Swatches & Action Button */}
          <div className="flex items-center gap-4">
            {/* Color circles */}
            <div className="flex items-center gap-1.5">
              {selectedVehicle.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleSelectColor(color)}
                  className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                    selectedColor === color ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color, borderColor: 'var(--border-default)' }}
                  title={color}
                />
              ))}
            </div>

            {/* Equip Button */}
            {isUnlocked ? (
              <button
                onClick={handleEquip}
                disabled={isEquipped}
                className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all ${
                  isEquipped
                    ? 'opacity-60 cursor-default'
                    : 'v-btn-primary'
                }`}
                style={isEquipped ? { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' } : {}}
              >
                {isEquipped ? <Check className="w-3.5 h-3.5" /> : null}
                {isEquipped ? 'Equipped' : 'Equip'}
              </button>
            ) : (
              <div 
                className="px-3 py-2 rounded-lg text-xs font-num"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
              >
                Lvl {selectedVehicle.unlockLevel} Req.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
