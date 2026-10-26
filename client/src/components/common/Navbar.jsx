import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { Volume2, VolumeX, User, ArrowRight, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { view, setView, profile, setAuthModalOpen, setMultiplayerModalOpen } = useGameStore();
  const [isMuted, setIsMuted] = React.useState(soundEngine.isMuted);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const navItems = [
    { id: 'home', label: 'Play' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'multiplayer', label: 'Multiplayer', isModal: true },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'garage', label: 'Garage' },
    { id: 'profile', label: 'Profile' }
  ];

  const handleNavClick = (item) => {
    soundEngine.playButtonClick();
    if (item.isModal && item.id === 'multiplayer') {
      setMultiplayerModalOpen(true);
    } else {
      setView(item.id);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070a13]/85 backdrop-blur-xl border-b border-white/[0.07] px-6 lg:px-12 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <span className="text-xl font-bold tracking-tight text-[#f8fafc] group-hover:text-amber-400 transition-colors">
            meanwhile
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 group-hover:scale-125 transition-transform" />
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`transition-colors cursor-pointer py-1 relative ${
                  isActive
                    ? 'text-[#f8fafc]'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400/80 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-full text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400/80" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Currency Pill */}
          <button
            onClick={() => setView('garage')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono-num text-amber-300 hover:bg-amber-400/20 transition-all cursor-pointer"
            title="Earned Meanwhile Credits"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{profile?.coins?.toLocaleString() || '2,450'}</span>
          </button>

          {/* User Sign In / Profile Pill with Dropdown */}
          {profile?.username && !profile?.isGuest ? (
            <div className="relative group">
              <button
                onClick={() => setView('profile')}
                className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-[#f8fafc] transition-all cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                  {profile.avatar || '👤'}
                </span>
                <span>{profile.username}</span>
              </button>

              {/* Hover Dropdown */}
              <div className="absolute right-0 top-full pt-2 w-44 hidden group-hover:block z-50">
                <div className="rounded-xl bg-[#0c1222] border border-white/10 shadow-2xl p-1.5 text-xs flex flex-col gap-0.5">
                  <div className="px-3 py-2 border-b border-white/[0.06]">
                    <div className="font-bold text-[#f8fafc] truncate">{profile.username}</div>
                    <div className="text-[10px] text-amber-400 font-mono-num">{profile.coins?.toLocaleString() || '2,450'} CR</div>
                  </div>
                  <button
                    onClick={() => setView('profile')}
                    className="w-full px-3 py-2 text-left rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    Driver Profile
                  </button>
                  <button
                    onClick={() => setView('garage')}
                    className="w-full px-3 py-2 text-left rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    Vehicle Garage
                  </button>
                  <button
                    onClick={async () => {
                      soundEngine.playButtonClick();
                      await api.signOut();
                      const guestProfile = await api.getProfile();
                      setProfile(guestProfile);
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer border-t border-white/[0.06] mt-0.5"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
