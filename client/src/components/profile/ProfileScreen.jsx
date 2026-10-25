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

  useEffect(() => {
    api.getRecentRaces(profile?.id).then(races => setRecentRaces(races));
  }, [profile?.id]);

  const handleSaveProfile = () => {
    soundEngine.playButtonClick();
    const updated = {
      ...profile,
      username: editUsername.trim() || profile.username,
      bio: editBio.trim() || profile.bio
    };
    setProfile(updated);
    api.updateProfile(profile?.id, updated);
    setIsEditing(false);
  };

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
              </div>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
                {profile?.bio || 'Typing today. Racing meanwhile.'}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-semibold text-[#f8fafc] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Edit Modal / Expandable Form */}
        {isEditing && (
          <div className="p-6 rounded-2xl bg-[#0c1222] border border-amber-400/30 space-y-4">
            <h3 className="text-sm font-bold text-[#f8fafc]">Edit Racer Profile</h3>
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
              className="px-6 py-2 rounded-full bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        )}

        {/* 4 Metric Cards matching Reference UI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Best WPM
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {profile?.bestWpm || 134}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Accuracy
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {profile?.accuracy || 68}%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Races
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {profile?.totalRaces || 310}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Global Rank
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-amber-400 mt-1">
              #{profile?.globalRank || 4}
            </div>
          </div>
        </div>

        {/* Recent Races List matching Reference UI */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1222] border border-white/[0.08] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-base font-bold text-[#f8fafc]">Recent Races</h3>
            <span className="text-xs text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer">
              View All →
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
                  <span className="text-slate-300">{race.wpm} WPM</span>
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
