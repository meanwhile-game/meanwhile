import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { VEHICLES, getVehicleById } from '../../data/vehicles.js';
import { Garage3DView } from './Garage3DView.jsx';
import { soundEngine } from '../../sound/soundEngine.js';
import { ArrowLeft, Sparkles, Check, ChevronRight } from 'lucide-react';

export const GarageScreen = () => {
  const { 
    setView, 
    selectedVehicleId, 
    setSelectedVehicleId, 
    selectedPaint, 
    setSelectedPaint,
    profile 
  } = useGameStore();

  const currentVehicle = getVehicleById(selectedVehicleId);

  const handleSelectCar = (id) => {
    soundEngine.playButtonClick();
    setSelectedVehicleId(id);
    const car = getVehicleById(id);
    if (car && car.defaultColor) {
      setSelectedPaint(car.defaultColor);
    }
  };

  const handleSelectPaint = (hex) => {
    soundEngine.playButtonClick();
    setSelectedPaint(hex);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a13] px-6 lg:px-14 py-8 flex flex-col justify-between">
      {/* Top Header matching Reference UI */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-[#f8fafc]">meanwhile</span>
          </button>

          {/* Currency Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono-num text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{profile?.coins?.toLocaleString() || '2,450'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400/60" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="pt-6 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f8fafc]">
            Garage
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Find your style.
          </p>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: 3D Turntable Car Studio */}
          <div className="lg:col-span-7 h-[360px] sm:h-[440px] w-full rounded-2xl bg-gradient-to-b from-[#0c1222] to-[#070a13] border border-white/[0.08] relative overflow-hidden flex items-center justify-center shadow-2xl">
            <Garage3DView color={selectedPaint} vehicleId={selectedVehicleId} />

            {/* Hint overlay */}
            <div className="absolute bottom-3 left-4 text-[11px] text-[#64748b] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5 pointer-events-none">
              Click & drag to rotate view
            </div>
          </div>

          {/* Right Column: Car Details, Performance Specs & Paint Swatches */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Vehicle Title & Category */}
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-bold text-[#f8fafc]">
                  {currentVehicle.name}
                </h2>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  {currentVehicle.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-2 leading-relaxed">
                {currentVehicle.tagline}
              </p>

              {/* Performance Spec Bars matching Reference UI */}
              <div className="space-y-4 pt-6">
                {/* Speed */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-[#94a3b8] mb-1.5">
                    <span>Speed</span>
                    <span className="font-mono-num text-slate-300">{currentVehicle.speed}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-slate-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${currentVehicle.speed}%` }}
                    />
                  </div>
                </div>

                {/* Acceleration */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-[#94a3b8] mb-1.5">
                    <span>Acceleration</span>
                    <span className="font-mono-num text-slate-300">{currentVehicle.acceleration}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-slate-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${currentVehicle.acceleration}%` }}
                    />
                  </div>
                </div>

                {/* Handling */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-[#94a3b8] mb-1.5">
                    <span>Handling</span>
                    <span className="font-mono-num text-slate-300">{currentVehicle.handling}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-slate-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${currentVehicle.handling}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Paint Picker Swatches matching Reference UI */}
              <div className="pt-6">
                <span className="text-xs uppercase tracking-wider text-[#64748b] font-semibold block mb-3">
                  Paint
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {currentVehicle.palette.map((color) => {
                    const isSelected = selectedPaint.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        onClick={() => handleSelectPaint(color.hex)}
                        title={color.name}
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-white scale-110 shadow-lg'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <span className={`w-1.5 h-1.5 rounded-full ${color.hex === '#f8fafc' ? 'bg-black' : 'bg-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Equipped Button */}
            <div className="pt-2">
              <button
                className="w-full py-3.5 rounded-xl bg-white/[0.08] border border-white/20 text-[#f8fafc] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:bg-white/[0.14] transition-all"
              >
                <span>Equipped</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Car Carousel Selection */}
      <div className="max-w-7xl mx-auto w-full pt-8 pb-4 border-t border-white/[0.06] mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VEHICLES.map((car) => {
            const isSelected = selectedVehicleId === car.id;
            return (
              <div
                key={car.id}
                onClick={() => handleSelectCar(car.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-400/80 bg-white/[0.07] shadow-md scale-[1.02]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f8fafc]">{car.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono-num">{car.topSpeedKmh} KM/H</span>
                </div>
                <p className="text-[10px] text-[#64748b] mt-0.5 truncate">{car.category}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
