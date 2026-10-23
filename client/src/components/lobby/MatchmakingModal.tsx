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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm select-none animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden bg-white text-slate-900"
      >
        {/* --- TACTICAL RADAR DISH SCANNER --- */}
        <div className="relative w-28 h-28 flex items-center justify-center mt-1">
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-sky-200" />
          <div className="absolute inset-3 rounded-full border border-sky-300/60" />
          <div className="absolute inset-6 rounded-full border border-sky-400/80" />

          {/* Sweeping Radar Beam */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div 
              className="w-full h-full animate-spin"
              style={{
                animationDuration: '2.4s',
                background: 'conic-gradient(from 0deg, rgba(46, 164, 79, 0.45) 0deg, rgba(46, 164, 79, 0.0) 70deg, transparent 360deg)'
              }}
            />
          </div>

          {/* Center Radio Ping */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-[#10304f] border border-[#1b4b7a] flex items-center justify-center shadow-lg shadow-sky-900/30">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>

          {/* Simulated Ping Dots */}
          <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          <div className="absolute bottom-5 left-5 w-2 h-2 rounded-full bg-sky-500 animate-ping opacity-60" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Title & Status */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-[#16426a] uppercase tracking-wider mb-2 font-bold">
            <Users className="w-3.5 h-3.5 text-[#2ea44f]" />
            Grand Prix Matchmaking
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-[#16426a] uppercase">
            Scanning For Drivers
          </h3>
          <p className="mt-1 text-xs text-slate-600 max-w-xs mx-auto">
            {botCountdown > 0 ? (
              <span>Matching live competitors... Auto-filling bots in <strong className="text-[#2ea44f] font-mono font-bold">{botCountdown}s</strong></span>
            ) : (
              <span className="text-[#2ea44f] font-bold animate-pulse flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Grid filled! Launching Grand Prix...
              </span>
            )}
          </p>
        </div>

        {/* --- 4-SLOT TACTICAL RACER PREVIEW --- */}
        <div className="w-full grid grid-cols-4 gap-2">
          {/* Slot 1: Local Player */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-[#2ea44f]/20 border border-[#2ea44f]/40 flex items-center justify-center text-[#2ea44f]">
              <Crosshair className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-900 truncate max-w-full font-mono">{username}</span>
            <span className="text-[8px] font-mono uppercase text-[#2ea44f] font-black flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-[#2ea44f]" /> YOU
            </span>
          </div>

          {/* Slot 2: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="w-7 h-7 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-600">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-800 font-bold truncate font-mono">Apex_Ghost</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-slate-500' : 'text-[#2ea44f]'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>

          {/* Slot 3: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="w-7 h-7 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-600">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-800 font-bold truncate font-mono">Viper_99</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-slate-500' : 'text-[#2ea44f]'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>

          {/* Slot 4: Competitor / AI */}
          <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all duration-300 ${botCountdown > 0 ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="w-7 h-7 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-600">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-800 font-bold truncate font-mono">CyberStig</span>
            <span className={`text-[8px] font-mono font-bold ${botCountdown > 0 ? 'text-slate-500' : 'text-[#2ea44f]'}`}>
              {botCountdown > 0 ? 'SEARCH' : 'READY [AI]'}
            </span>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="w-full py-2 px-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
          <div>
            <span className="text-[10px] block text-slate-400 font-bold">RADAR TIME</span>
            <span className="font-semibold text-slate-900 font-mono">{formatElapsed(elapsed)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] block text-slate-400 font-bold">GRID PROTOCOL</span>
            <span className="font-semibold text-[#16426a]">60Hz AUTHORITATIVE</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Instant AI Race Button */}
          <button
            onClick={handleInstantBots}
            className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 bg-[#2ea44f] hover:bg-[#2c974b] text-white shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            Race Now with AI Bots (Instant Launch)
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Cancel Matchmaking
          </button>
        </div>
      </div>
    </div>
  );
};
