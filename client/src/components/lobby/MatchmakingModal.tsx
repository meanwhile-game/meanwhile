import React, { useState, useEffect } from 'react';
import { X, Bot, Zap, Radio, Users, CheckCircle2, Crosshair, Gauge, Shield } from 'lucide-react';
import { socketService } from '../../services/socket.js';
import { sound } from '../../sound/soundEngine.js';

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
  username = 'Pilot',
  avatar,
  onCancel,
  onInstantBotMatch,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const botCountdown = Math.max(0, 4 - elapsed);
  const autoTriggeredRef = React.useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (elapsed >= 4 && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      handleInstantBots();
    }
  }, [elapsed]);

  const handleInstantBots = () => {
    sound.playClick();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden bg-[#0a0d14]"
        style={{ 
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.12)' 
        }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none" />

        {/* --- TACTICAL RADAR DISH SCANNER --- */}
        <div className="relative w-32 h-32 flex items-center justify-center mt-2">
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20" />
          <div className="absolute inset-4 rounded-full border border-amber-500/30" />
          <div className="absolute inset-8 rounded-full border border-amber-500/40" />

          {/* Sweeping Radar Beam */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div 
              className="w-full h-full animate-spin"
              style={{
                animationDuration: '2.4s',
                background: 'conic-gradient(from 0deg, rgba(245, 158, 11, 0.45) 0deg, rgba(245, 158, 11, 0.0) 70deg, transparent 360deg)'
              }}
            />
          </div>

          {/* Center Radio Ping */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-amber-950/80 border border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>

          {/* Simulated Ping Dots */}
          <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
          <div className="absolute bottom-7 left-7 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Title & Status */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-[10px] font-mono text-amber-300 uppercase tracking-widest mb-2">
            <Users className="w-3 h-3 text-amber-400" />
            Tactical Matchmaking Grid
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
            Scanning For Drivers
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
            {botCountdown > 0 ? (
              <span>Matching live competitors... Auto-filling bots in <strong className="text-amber-400 font-mono">{botCountdown}s</strong></span>
            ) : (
              <span className="text-emerald-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Grid filled! Launching Grand Prix...
              </span>
            )}
          </p>
        </div>

        {/* --- 4-SLOT TACTICAL RACER PREVIEW --- */}
        <div className="w-full grid grid-cols-4 gap-2">
          {/* Slot 1: Local Player */}
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Crosshair className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-white truncate max-w-full font-mono">{username}</span>
            <span className="text-[8px] font-mono uppercase text-amber-300 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" /> YOU
            </span>
          </div>

          {/* Slot 2: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-[#121620] border-white/10' : 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-500/20'}`}>
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-200 font-bold truncate font-mono">Apex_Ghost</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>

          {/* Slot 3: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-[#121620] border-white/10' : 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-500/20'}`}>
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-200 font-bold truncate font-mono">Viper_99</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>

          {/* Slot 4: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-[#121620] border-white/10' : 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-500/20'}`}>
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-200 font-bold truncate font-mono">CyberStig</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="w-full py-2.5 px-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            <span className="text-[10px] block text-slate-500 font-bold">RADAR TIME</span>
            <span className="font-semibold text-white font-mono">{formatElapsed(elapsed)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] block text-slate-500 font-bold">TICK PROTOCOL</span>
            <span className="font-semibold text-amber-400">60Hz AUTHORITATIVE</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Instant AI Race Button */}
          <button
            onClick={handleInstantBots}
            className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-black" />
            Race Now with AI Bots (Instant Launch)
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Cancel Matchmaking
          </button>
        </div>
      </div>
    </div>
  );
};
