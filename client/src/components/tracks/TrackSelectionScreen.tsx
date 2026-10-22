import React from 'react';
import { TRACKS, TrackConfig } from '../../three/types.js';
import { ArrowLeft, Check, Compass } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.js';

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
  const { isLight } = useTheme();

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 select-none"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Grid
        </button>

        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Circuit Selection
          </span>
        </div>

        <span className="text-xs font-num" style={{ color: 'var(--text-muted)' }}>
          {TRACKS.length} Circuits Available
        </span>
      </header>

      {/* Main Track Grid */}
      <main className="w-full max-w-6xl mx-auto my-auto py-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Championship Circuits
          </h2>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Each circuit incorporates distinct banking gradients, elevation changes, and environmental lighting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRACKS.map((track) => {
            const isSelected = track.id === selectedTrackId;

            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'ring-2' : 'hover:border-white/20'
                }`}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                  outlineColor: 'var(--accent)'
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-num uppercase" style={{ color: 'var(--text-muted)' }}>
                      {track.location}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-mono capitalize"
                      style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                    >
                      {track.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {track.name}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {track.description}
                  </p>

                  <div className="mt-6 pt-4 border-t flex justify-between items-center text-xs font-num" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Track Distance</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{track.lengthMeters} Meters</span>
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectTrack(track.id); }}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      isSelected ? 'v-btn-primary' : 'v-btn-secondary'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                    {isSelected ? 'Currently Selected' : 'Select Track'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-num" style={{ color: 'var(--text-muted)' }}>
        <span>MEANWHILE CIRCUITS</span>
        <span>STANDARDIZED 4-LANE GEOMETRY</span>
      </footer>
    </div>
  );
};
