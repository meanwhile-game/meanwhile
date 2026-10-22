import React from 'react';
import { TRACKS, TrackConfig } from '../../three/types.js';
import { ArrowLeft, Check, Compass, MapPin, Gauge, Mountain, Sun, CloudRain, Trophy, Sparkles } from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
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
      className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 select-none bg-slate-950 text-white bg-cyber-grid"
    >
      {/* 1. Top Navbar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => {
            sound.playKeystroke(50, true);
            onBack();
          }}
          className="px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md transition-all hover:border-slate-500"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Return to Grid
        </button>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="font-extrabold text-sm tracking-tight text-white">
            CHAMPIONSHIP CIRCUITS
          </span>
        </div>

        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          {TRACKS.length} GLOBAL VENUES
        </span>
      </header>

      {/* 2. Main Track Grid */}
      <main className="w-full max-w-6xl mx-auto my-auto py-8 z-10">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono mb-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FIA SPECIFICATION 4-LANE TARMAC CIRCUITS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Select Competition Track
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Featuring India's premier motorsport circuits (Buddh International Circuit, Chennai Marina, Hyderabad Cyber Pearl) alongside legendary global Grand Prix destinations.
            </p>
          </div>

          {/* Regional Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeFilter === 'all' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL ({TRACKS.length})
            </button>
            <button
              onClick={() => setActiveFilter('indian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeFilter === 'indian' ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 INDIAN GP (3)
            </button>
            <button
              onClick={() => setActiveFilter('global')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeFilter === 'global' ? 'bg-sky-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌍 GLOBAL GP (5)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRACKS.filter((track) => {
            if (activeFilter === 'indian') return ['chennai', 'hyderabad', 'buddh'].includes(track.id);
            if (activeFilter === 'global') return !['chennai', 'hyderabad', 'buddh'].includes(track.id);
            return true;
          }).map((track) => {
            const isSelected = track.id === selectedTrackId;
            const details = getTrackDetails(track.id);
            const WeatherIcon = details.weatherIcon;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track.id)}
                className={`rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group shadow-2xl backdrop-blur-md ${
                  isSelected 
                    ? 'border-emerald-400 ring-2 ring-emerald-400/80 shadow-[0_0_35px_rgba(0,255,135,0.35)] scale-[1.02]' 
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:-translate-y-1'
                }`}
                style={{ minHeight: '440px' }}
              >
                {/* Circuit Art Banner Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  {details.bgImage ? (
                    <img 
                      src={details.bgImage} 
                      alt={track.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative p-4 text-center">
                      <div className="absolute inset-0 bg-cyber-grid opacity-30" />
                      <div className="text-4xl mb-1">{details.flag}</div>
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">{details.badge}</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {track.location}
                    </span>

                    <span 
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase backdrop-blur-md"
                      style={{ 
                        backgroundColor: `${details.themeAccent}25`,
                        color: details.themeAccent,
                        border: `1px solid ${details.themeAccent}60`
                      }}
                    >
                      {track.difficulty}
                    </span>
                  </div>

                  {/* Selected Indicator Ribbon */}
                  {isSelected && (
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-emerald-400 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-lg">
                      <Check className="w-3.5 h-3.5" />
                      SELECTED
                    </div>
                  )}
                </div>

                {/* Track Details & Telemetry */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-slate-900/90">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{details.flag}</span>
                      <h3 className="text-xl font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                        {track.name}
                      </h3>
                    </div>

                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {track.description}
                    </p>

                    {/* Circuit Telemetry Grid */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">LENGTH</span>
                        <span className="font-bold text-white">{track.lengthMeters} Meters</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">ELEVATION</span>
                        <span className="font-bold text-cyan-300">{details.elevation}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">CHICANES</span>
                        <span className="font-bold text-amber-300">{details.corners}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase">WEATHER</span>
                        <span className="font-bold text-slate-300 flex items-center gap-1">
                          <WeatherIcon className="w-3 h-3 text-emerald-400" />
                          {details.weather.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Circuit Record */}
                    <div className="mt-3 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800/90 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Trophy className="w-3 h-3 text-amber-400" /> RECORD
                      </span>
                      <span className="font-bold text-amber-300">{details.record}</span>
                    </div>
                  </div>

                  {/* Deploy Button */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleTrackClick(track.id); 
                      }}
                      className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(0,255,135,0.4)]' 
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : null}
                      {isSelected ? 'Circuit Active' : 'Deploy to Circuit'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-4 z-10">
        <span>MEANWHILE GLOBAL CIRCUIT DIRECTORY</span>
        <span>SLICK COLD TARMAC PHYSICS ACTIVE</span>
      </footer>
    </div>
  );
};
