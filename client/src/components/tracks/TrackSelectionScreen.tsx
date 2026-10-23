import React from 'react';
import { TRACKS, TrackConfig } from '../../three/types.js';
import { ArrowLeft, Check, Compass, MapPin, Gauge, Mountain, Sun, CloudRain, Trophy, Sparkles } from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { AdBanner } from '../common/AdBanner.js';
import heroBg from '../../assets/hero-bg.jpg';
import swissTrackImg from '../../assets/swiss-track.jpg';

interface TrackSelectionScreenProps {
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onBack: () => void;
}

export const TrackSelectionScreen: React.FC<TrackSelectionScreenProps> = ({
  selectedTrackId,
  onSelectTrack,
  onBack
}) => {
  const handleTrackClick = (trackId: string) => {
    sound.playKeystroke(60, true);
    onSelectTrack(trackId);
  };

  const [activeFilter, setActiveFilter] = React.useState<'all' | 'indian' | 'global'>('all');

  const getTrackDetails = (id: string) => {
    switch (id) {
      case 'chennai':
        return {
          bgImage: null,
          flag: '🇮🇳',
          badge: 'INDIAN MOTORSPORT HERITAGE',
          weather: 'Marina Night // Sea Breeze & Wet Tarmac',
          weatherIcon: CloudRain,
          elevation: '+4.5m Coastal Surge',
          corners: '15 Turns',
          record: 'KarunChandhok • 152 WPM',
          themeAccent: '#00f5ff',
          surfaceGrip: '96% High Grip'
        };
      case 'hyderabad':
        return {
          bgImage: null,
          flag: '🇮🇳',
          badge: 'CYBER STREET CIRCUIT',
          weather: 'Neon Dusk // Durgam Cheruvu Lake Mist',
          weatherIcon: Sparkles,
          elevation: '+12.5m Bridge Span',
          corners: '14 Turns',
          record: 'CyberRacer • 156 WPM',
          themeAccent: '#c084fc',
          surfaceGrip: '95% Street Grip'
        };
      case 'buddh':
        return {
          bgImage: null,
          flag: '🇮🇳',
          badge: 'FIA GRADE 1 F1 CIRCUIT',
          weather: 'Formula 1 Twilight // High Downforce',
          weatherIcon: Sun,
          elevation: '+14m Crest // Turn 3 Drop',
          corners: '16 Grand Prix Turns',
          record: 'NarainKarthikeyan • 161 WPM',
          themeAccent: '#f59e0b',
          surfaceGrip: '99% FIA Race Grade'
        };
      case 'monaco':
        return {
          bgImage: null,
          flag: '🇲🇨',
          badge: 'TRIPLE CROWN CROWN JEWEL',
          weather: 'Riviera Harbor Sunset // Tight Barriers',
          weatherIcon: Sun,
          elevation: '+42m Stepped Hill',
          corners: '19 Precision Turns',
          record: 'SennaGhost • 158 WPM',
          themeAccent: '#38bdf8',
          surfaceGrip: '91% Low Margin'
        };
      case 'silverstone':
        return {
          bgImage: null,
          flag: '🇬🇧',
          badge: 'HOME OF BRITISH MOTORSPORT',
          weather: 'Brisk Meadow Air // Fast Sweep',
          weatherIcon: Mountain,
          elevation: '+11m Rolling Hills',
          corners: '18 High-G Turns',
          record: 'ApexPredator • 159 WPM',
          themeAccent: '#60a5fa',
          surfaceGrip: '98% High Speed'
        };
      case 'tokyo':
        return {
          bgImage: heroBg,
          flag: '🇯🇵',
          badge: 'URBAN NIGHT SPRINT',
          weather: 'Rain Night // Wet Asphalt',
          weatherIcon: CloudRain,
          elevation: '+18m Viaduct',
          corners: '14 Turns',
          record: 'ApexPredator • 154 WPM',
          themeAccent: '#00ff87',
          surfaceGrip: '94% Grip'
        };
      case 'swiss':
        return {
          bgImage: swissTrackImg,
          flag: '🇨🇭',
          badge: 'ALPINE MOUNTAIN PASS',
          weather: 'Alpine Sunny // Cold Crisp Air',
          weatherIcon: Mountain,
          elevation: '+142m Gradient',
          corners: '22 Hairpins',
          record: 'Frostbite • 142 WPM',
          themeAccent: '#38bdf8',
          surfaceGrip: '89% Cold Tarmac'
        };
      case 'dubai':
      default:
        return {
          bgImage: null,
          flag: '🇦🇪',
          badge: 'DESERT SUPERCIRCUIT',
          weather: 'Desert Dusk // Floodlit Yas Runoff',
          weatherIcon: Sun,
          elevation: '+8m Flat',
          corners: '8 Wide Sweepers',
          record: 'SultanOfSpeed • 149 WPM',
          themeAccent: '#f59e0b',
          surfaceGrip: '97% High Grip'
        };
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between bg-[#194269] text-slate-100 select-none overflow-x-hidden font-sans"
    >
      {/* 1. Top Navbar Matching Home Page */}
      <nav className="w-full bg-[#10304f] border-b border-[#1b4b7a] px-4 sm:px-8 py-2.5 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="px-3.5 py-1.5 rounded-lg border border-[#1b4b7a] bg-[#0b2239] hover:bg-[#153a5e] text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow transition-all hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            Return to Grid
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onBack()}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow">
              <Compass className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-xl font-black tracking-tight text-white lowercase">
              meanwhile <span className="text-xs uppercase font-bold text-cyan-300 font-mono tracking-wider ml-1">Circuits</span>
            </span>
          </div>
        </div>

        {/* Regional Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#0b2239] p-1 rounded-lg border border-[#1b4b7a]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-all ${
              activeFilter === 'all' ? 'bg-[#2ea44f] text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            ALL ({TRACKS.length})
          </button>
          <button
            onClick={() => setActiveFilter('indian')}
            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeFilter === 'indian' ? 'bg-[#f6c344] text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🇮🇳 INDIAN GP (4)
          </button>
          <button
            onClick={() => setActiveFilter('global')}
            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeFilter === 'global' ? 'bg-cyan-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🌍 GLOBAL GP (5)
          </button>
        </div>
      </nav>

      {/* 2. Main Track Grid */}
      <main className="w-full max-w-6xl mx-auto my-auto px-4 py-6 md:py-8 z-10 flex flex-col gap-6">
        {/* Banner Card */}
        <div className="w-full rounded-2xl bg-white text-slate-900 p-6 shadow-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>FIA OFFICIAL 4-LANE TARMAC VENUES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16426a]">
              Select Championship Circuit
            </h1>
            <p className="mt-1 text-sm text-slate-600 font-medium">
              Choose from India's premier motorsport circuits (Chennai Marina, Mumbai Sea Link, Hyderabad Cyber Pearl, Buddh) alongside legendary global Grand Prix tracks.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
            {TRACKS.length} ACTIVE TRACKS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRACKS.filter((track) => {
            if (activeFilter === 'indian') return ['chennai', 'mumbai', 'hyderabad', 'buddh'].includes(track.id);
            if (activeFilter === 'global') return !['chennai', 'mumbai', 'hyderabad', 'buddh'].includes(track.id);
            return true;
          }).map((track) => {
            const isSelected = track.id === selectedTrackId;
            const details = getTrackDetails(track.id);
            const WeatherIcon = details.weatherIcon;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track.id)}
                className={`rounded-2xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group shadow-xl ${
                  isSelected 
                    ? 'border-2 border-[#2ea44f] ring-4 ring-emerald-500/20 bg-white shadow-2xl scale-[1.01]' 
                    : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xl hover:-translate-y-0.5'
                }`}
                style={{ minHeight: '440px' }}
              >
                {/* Circuit Art Banner Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  {details.bgImage ? (
                    <img 
                      src={details.bgImage} 
                      alt={track.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#10304f] via-[#16426a] to-[#194269] flex flex-col items-center justify-center relative p-4 text-center">
                      <div className="text-4xl mb-1">{details.flag}</div>
                      <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase">{details.badge}</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {track.location}
                    </span>

                    <span 
                      className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase backdrop-blur-md bg-black/60 text-white border border-white/20"
                    >
                      {track.difficulty}
                    </span>
                  </div>

                  {/* Selected Indicator Ribbon */}
                  {isSelected && (
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-[#2ea44f] text-white font-extrabold text-xs uppercase flex items-center gap-1.5 shadow-lg">
                      <Check className="w-3.5 h-3.5" />
                      ACTIVE
                    </div>
                  )}
                </div>

                {/* Track Details & Telemetry */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white text-slate-900">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{details.flag}</span>
                      <h3 className="text-xl font-extrabold tracking-tight text-[#16426a]">
                        {track.name}
                      </h3>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                      {track.description}
                    </p>

                    {/* Circuit Telemetry Grid */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">LENGTH</span>
                        <span className="font-bold text-slate-900">{track.lengthMeters} Meters</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">ELEVATION</span>
                        <span className="font-bold text-[#16426a]">{details.elevation}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">CHICANES</span>
                        <span className="font-bold text-slate-900">{details.corners}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">WEATHER</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <WeatherIcon className="w-3 h-3 text-cyan-600" />
                          {details.weather.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Circuit Record */}
                    <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-amber-800 font-bold flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" /> LAP RECORD
                      </span>
                      <span className="font-black text-amber-900">{details.record}</span>
                    </div>
                  </div>

                  {/* Deploy Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleTrackClick(track.id); 
                      }}
                      className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow ${
                        isSelected 
                          ? 'bg-[#2ea44f] hover:bg-[#2c974b] text-white shadow-emerald-900/20' 
                          : 'bg-[#194269] hover:bg-[#163b5e] text-white'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : null}
                      {isSelected ? 'Circuit Active' : 'Select Circuit'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* SPONSORED CIRCUIT LEADERBOARD BANNER (728x90) */}
      <AdBanner
        slotId="ad-tracks-footer-leaderboard"
        format="leaderboard"
        className="max-w-4xl mx-auto my-3 z-10"
      />

      {/* 3. Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-4 z-10">
        <span>MEANWHILE GLOBAL CIRCUIT DIRECTORY</span>
        <span>SLICK COLD TARMAC PHYSICS ACTIVE</span>
      </footer>
    </div>
  );
};
