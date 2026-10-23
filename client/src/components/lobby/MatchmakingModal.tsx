import React, { useState, useEffect } from 'react';
import { X, Bot, Zap, Radio, Users, CheckCircle2 } from 'lucide-react';
import { socketService } from '../../services/socket.js';

interface MatchmakingModalProps {
  queueLength: number;
  selectedTrackId?: string;
  username?: string;
  avatar?: string;
  onCancel: () => void;
  onInstantBotMatch?: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  queueLength,
  selectedTrackId = 'chennai',
  username = 'Driver',
  avatar = '🏎️',
  onCancel,
  onInstantBotMatch,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const botCountdown = Math.max(0, 5 - elapsed);
  const autoTriggeredRef = React.useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (elapsed >= 5 && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      handleInstantBots();
    }
  }, [elapsed]);

  const handleInstantBots = () => {
    if (onInstantBotMatch) {
      onInstantBotMatch();
    } else {
      socketService.instantBotMatch(selectedTrackId);
    }
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-3xl border shadow-2xl p-6 md:p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden"
        style={{ 
          backgroundColor: '#0a0f18', 
          borderColor: 'rgba(0, 245, 255, 0.25)',
          boxShadow: '0 0 50px rgba(0, 245, 255, 0.12)' 
        }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* --- RADAR DISH SCANNER --- */}
        <div className="relative w-32 h-32 flex items-center justify-center mt-2">
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="absolute inset-4 rounded-full border border-cyan-500/30" />
          <div className="absolute inset-8 rounded-full border border-cyan-500/40" />

          {/* Sweeping Radar Beam */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div 
              className="w-full h-full animate-spin"
              style={{
                animationDuration: '2.5s',
                background: 'conic-gradient(from 0deg, rgba(0, 245, 255, 0.45) 0deg, rgba(0, 245, 255, 0.0) 70deg, transparent 360deg)'
              }}
            />
          </div>

          {/* Center Radio Ping */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>

          {/* Simulated Ping Dots */}
          <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <div className="absolute bottom-7 left-7 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Title & Status */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 uppercase tracking-widest mb-2">
            <Users className="w-3 h-3 text-cyan-400" />
            Global Matchmaking Grid
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
            Searching For Contenders
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
            {botCountdown > 0 ? (
              <span>Matching human rivals... Auto-filling with AI bots in <strong className="text-amber-400 font-num">{botCountdown}s</strong></span>
            ) : (
              <span className="text-emerald-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Grid filled! Launching AI Grand Prix...
              </span>
            )}
          </p>
        </div>

        {/* --- 4-SLOT RACER PREVIEW --- */}
        <div className="w-full grid grid-cols-4 gap-2">
          {/* Slot 1: Local Player */}
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col items-center gap-1">
            <span className="text-lg">{avatar}</span>
            <span className="text-[10px] font-bold text-white truncate max-w-full">{username}</span>
            <span className="text-[8px] font-mono uppercase text-cyan-300 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" /> YOU
            </span>
          </div>

          {/* Slot 2: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-slate-900/60 border-slate-800' : 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-500/20'}`}>
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs animate-pulse">
              🏎️
            </div>
            <span className="text-[10px] text-slate-200 font-semibold truncate">Chennai Turbo</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>

          {/* Slot 3: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-slate-900/60 border-slate-800' : 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-500/20'}`}>
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs animate-pulse">
              ⚡
            </div>
            <span className="text-[10px] text-slate-200 font-semibold truncate">Marina Racer</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>

          {/* Slot 4: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-slate-900/60 border-slate-800' : 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-500/20'}`}>
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs animate-pulse">
              🤖
            </div>
            <span className="text-[10px] text-slate-200 font-semibold truncate">Deccan Drift</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            <span className="text-[10px] block text-slate-500">QUEUE TIME</span>
            <span className="font-semibold text-white font-num">{formatElapsed(elapsed)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] block text-slate-500">MATCH PROTOCOL</span>
            <span className="font-semibold text-cyan-400">LOW LATENCY (IN)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Instant AI Race Button */}
          <button
            onClick={handleInstantBots}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-black" />
            Race Now with AI Bots (Instant Start)
          </button>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 text-xs font-medium text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Cancel Matchmaking
          </button>
        </div>
      </div>
    </div>
  );
};
