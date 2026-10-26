import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { api } from '../../services/supabase.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { ArrowLeft, Edit3, Sparkles, Check, ChevronRight } from 'lucide-react';

export const ProfileScreen = () => {
  const { setView, profile, setProfile } = useGameStore();
  const [recentRaces, setRecentRaces] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(profile?.username || 'rishi');
  const [editBio, setEditBio] = useState(profile?.bio || 'Typing today. Racing meanwhile.');

  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || '👤');

  const avatarOptions = ['🏎️', '⚡', '🏁', '👤', '🎌', '🌟', '🔥', '✨', '🚀', '🛸'];

  useEffect(() => {
    api.getRecentRaces(profile?.id).then(races => setRecentRaces(races));
  }, [profile?.id]);

  const handleSaveProfile = () => {
    soundEngine.playButtonClick();
    const updated = {
      ...profile,
      username: editUsername.trim() || profile.username,
      bio: editBio.trim() || profile.bio,
      avatar: selectedAvatar,
      avatar_url: selectedAvatar
    };
    setProfile(updated);
    api.updateProfile(profile?.id, updated);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    soundEngine.playButtonClick();
    await api.signOut();
    const guestProfile = await api.getProfile();
    setProfile(guestProfile);
  };

  const isGuest = profile?.isGuest || !profile?.email;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a13] px-6 lg:px-14 py-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Top Header matching Reference UI */}
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

        {/* Profile Card Header matching Reference UI */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1222] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-3xl shadow-inner">
              {profile?.avatar || '👤'}
            </div>

            {/* User Meta */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#f8fafc]">
                  {profile?.username || 'rishi'}
                </h2>
                <span className="w-4 h-4 rounded-full bg-sky-400/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                {!isGuest && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Cloud Synced
                  </span>
                )}
                {isGuest && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Guest Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
                {profile?.bio || 'Typing today. Racing meanwhile.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-semibold text-[#f8fafc] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>

            {!isGuest ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  useGameStore.getState().setAuthModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Edit Modal / Expandable Form */}
        {isEditing && (
          <div className="p-6 rounded-2xl bg-[#0c1222] border border-amber-400/30 space-y-4">
            <h3 className="text-sm font-bold text-[#f8fafc]">Edit Racer Profile</h3>
            
            {/* Avatar Picker */}
            <div>
              <label className="text-xs text-[#94a3b8] block mb-2 font-semibold">Choose Avatar</label>
              <div className="flex items-center gap-2 flex-wrap">
                {avatarOptions.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-amber-400/20 border-2 border-amber-400 scale-110 shadow-lg'
                        : 'bg-black/40 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#94a3b8] block mb-1">Racer Handle</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-[#f8fafc] focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-[#94a3b8] block mb-1">Status / Bio</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-[#f8fafc] focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2 rounded-full bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
            >
              Save Profile
            </button>
          </div>
        )}

        {/* 5 Metric Cards featuring Overall All-Race Ending Average WPM */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
          {/* 1. OVERALL ALL-RACE ENDING AVERAGE WPM (HIGHLIGHTED HERO CARD) */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border-2 border-amber-400/40 relative overflow-hidden shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)] text-center group">
            <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
              All-Time
            </div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-amber-400">
              Overall Avg WPM
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-white mt-1">
              {profile?.averageWpm || api.getOverallAverageWpm()}
            </div>
            <span className="text-[10px] text-amber-300/80 mt-0.5 block font-medium">
              Race Ending Mean
            </span>
          </div>

          {/* 2. BEST WPM */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Best WPM
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {profile?.bestWpm || 134}
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block font-medium">
              Peak Record
            </span>
          </div>

          {/* 3. ACCURACY */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Accuracy
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {profile?.accuracy || 96}%
            </div>
            <span className="text-[10px] text-[#94a3b8] mt-0.5 block">
              Precision Rate
            </span>
          </div>

          {/* 4. TOTAL RACES */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Total Races
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {profile?.totalRaces || 310}
            </div>
            <span className="text-[10px] text-sky-400 mt-0.5 block font-medium">
              Finishes
            </span>
          </div>

          {/* 5. GLOBAL RANK */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Global Rank
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-amber-400 mt-1">
              #{profile?.globalRank || 4}
            </div>
            <span className="text-[10px] text-amber-300/80 mt-0.5 block font-medium">
              Top Tier
            </span>
          </div>
        </div>

        {/* Recent Races List matching Reference UI */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1222] border border-white/[0.08] shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">Recent Race Finishes</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Overall ending average: <span className="text-amber-400 font-bold font-mono-num">{profile?.averageWpm || api.getOverallAverageWpm()} WPM</span> across all completed tracks.
              </p>
            </div>
            <span className="text-xs text-amber-400/90 hover:text-amber-300 cursor-pointer font-semibold">
              Live Synced
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {recentRaces.map((race) => (
              <div key={race.id} className="py-3.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold text-[#f8fafc]">{race.track}</span>
                </div>

                <div className="flex items-center gap-6 font-mono-num">
                  <span className={`font-bold ${race.position === '1st' ? 'text-amber-400' : 'text-slate-300'}`}>
                    {race.position}
                  </span>
                  <span className="text-amber-300 font-bold">{race.wpm} WPM</span>
                  <span className="text-[#64748b]">{race.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
