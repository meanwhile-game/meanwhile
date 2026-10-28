import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { AdSlot } from '../common/AdSlot.jsx';
import { TRACKS } from '../../data/tracks.js';
import { VEHICLES } from '../../data/vehicles.js';
import { ArrowRight, Zap, Target, Gauge, Sparkles } from 'lucide-react';

export const HomeShowcase = () => {
  const { setView, setSelectedTrackId, setSelectedVehicleId } = useGameStore();

  return (
    <div className="w-full bg-[#070a13] px-6 lg:px-14 py-16 space-y-20 border-t border-white/[0.06]">
      {/* 1. Optional AdSlot between homepage sections (gracefully hidden when ads disabled) */}
      <div className="max-w-5xl mx-auto">
        <AdSlot slotId="home-between-sections" format="horizontal-banner" />
      </div>

      {/* 2. How Meanwhile Works Section */}
      <section className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Engine Mechanics
          </span>
          <h2 className="text-3xl font-black text-[#f8fafc] mt-2">
            Mindful speed, translated into 3D asphalt.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl bg-[#0c1222] border border-white/[0.08] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-lg font-bold text-[#f8fafc]">Typing to Velocity</h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Every clean character typed ramps engine RPM and forward acceleration. Stopping typing smoothly decelerates the vehicle.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0c1222] border border-white/[0.08] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-lg font-bold text-[#f8fafc]">Accuracy Multiplier</h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              High accuracy grants aerodynamic stability and bonus top speed. Typing mistakes produce a momentary throttle stutter.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0c1222] border border-white/[0.08] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-lg font-bold text-[#f8fafc]">Global Multiplayer</h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Host private rooms with custom codes or challenge bots in Quick Race. Supabase Realtime delivers synchronized starts.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Track Environments Preview */}
      <section className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#64748b]">
              Circuits
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#f8fafc] mt-1">
              Curated Escapes
            </h2>
          </div>

          <button
            onClick={() => setView('tracks')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRACKS.filter(t => !t.isLocked).map((track) => (
            <div
              key={track.id}
              onClick={() => {
                setSelectedTrackId(track.id);
                setView('tracks');
              }}
              className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] hover:border-amber-400/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-[#64748b] mb-3">
                <span className="font-semibold text-amber-400 font-mono-num">{track.circuitNumber} · {track.difficulty}</span>
                <span>{track.distanceKm} KM</span>
              </div>
              <h3 className="text-base font-bold text-[#f8fafc] group-hover:text-amber-400 transition-colors">
                {track.name}
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">
                {track.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Garage Teaser */}
      <section className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-[#0c1222] via-[#12192e] to-[#0c1222] border border-white/[0.08] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-lg space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Custom Garage
          </span>
          <h2 className="text-3xl font-black text-[#f8fafc]">
            Unlock machines. Define your style.
          </h2>
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            From the balanced Vortex GT to the prototype Cyber Drift, tune your machine with custom automotive lacquers and test them in real-time 3D showroom lighting.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setView('garage')}
              className="px-6 py-3 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Visit Garage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          {VEHICLES.map((v) => (
            <div
              key={v.id}
              onClick={() => {
                setSelectedVehicleId(v.id);
                setView('garage');
              }}
              className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 hover:border-amber-400/40 transition-colors cursor-pointer text-center"
            >
              <span className="text-xs font-bold text-[#f8fafc] block">{v.name}</span>
              <span className="text-[10px] text-amber-400 font-mono-num">{v.topSpeedKmh} KM/H</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
