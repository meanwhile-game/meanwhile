import React, { useState } from 'react';
import { UserProfile, updateProfile } from '../../services/api.js';
import { sound } from '../../sound/soundEngine.js';
import { useTheme } from '../../theme/ThemeContext.js';
import { THEMES, ACCENTS, ThemeId, AccentId } from '../../theme/theme.js';
import { X, Volume2, Monitor, User, Check, Palette } from 'lucide-react';

interface SettingsModalProps {
  profile: UserProfile;
  graphicsQuality: 'low' | 'medium' | 'high';
  onUpdateQuality: (q: 'low' | 'medium' | 'high') => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

const AVATARS = ['🏎️', '⚡', '🔥', '🏍️', '🤖', '👾', '🏆', '👑', '🎯', '🚀', '🌌', '🏁'];

type SettingsTab = 'appearance' | 'graphics' | 'audio' | 'profile';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  graphicsQuality,
  onUpdateQuality,
  onUpdateProfile,
  onClose
}) => {
  const { themeId, accentId, setTheme, setAccent, previewTheme, resetPreview } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [username, setUsername] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [masterVolume, setMasterVolume] = useState(sound.getMasterVolume());
  const [isSaved, setIsSaved] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMasterVolume(val);
    sound.setMasterVolume(val);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateProfile(profile.id, {
        username: username.trim() || profile.username,
        avatar: selectedAvatar
      });
      onUpdateProfile(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      const localUpdated = { ...profile, username: username.trim(), avatar: selectedAvatar };
      onUpdateProfile(localUpdated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div 
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              Settings & Customization
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="px-6 pt-3 flex gap-2 border-b"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
        >
          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-2.5 px-2 text-xs font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'appearance' ? 'border-current font-semibold' : 'border-transparent'
            }`}
            style={{ color: activeTab === 'appearance' ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </button>

          <button
            onClick={() => setActiveTab('graphics')}
            className={`pb-2.5 px-2 text-xs font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'graphics' ? 'border-current font-semibold' : 'border-transparent'
            }`}
            style={{ color: activeTab === 'graphics' ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <Monitor className="w-3.5 h-3.5" />
            Graphics
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-2.5 px-2 text-xs font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audio' ? 'border-current font-semibold' : 'border-transparent'
            }`}
            style={{ color: activeTab === 'audio' ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Audio
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-2 text-xs font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'border-current font-semibold' : 'border-transparent'
            }`}
            style={{ color: activeTab === 'profile' ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            <User className="w-3.5 h-3.5" />
            Pilot Identity
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 1. Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="flex flex-col gap-6">
              {/* Base Theme Selector */}
              <div>
                <label className="text-xs font-medium block mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Base Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {THEMES.map((t) => {
                    const isSelected = themeId === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        onMouseEnter={() => previewTheme(t.id)}
                        onMouseLeave={resetPreview}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'ring-2'
                            : 'hover:border-white/20'
                        }`}
                        style={{
                          backgroundColor: t.previewBg,
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                          outlineColor: 'var(--accent)'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="text-xs font-semibold"
                            style={{ color: t.category === 'light' ? '#111317' : '#f4f4f6' }}
                          >
                            {t.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
                        </div>
                        <p 
                          className="text-[11px] leading-relaxed"
                          style={{ color: t.category === 'light' ? '#525866' : '#9ca3af' }}
                        >
                          {t.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <label className="text-xs font-medium block mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Interface Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCENTS.map((accent) => {
                    const isSelected = accentId === accent.id;

                    return (
                      <button
                        key={accent.id}
                        onClick={() => setAccent(accent.id)}
                        className={`px-3 py-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected ? 'font-semibold' : ''
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                          borderColor: isSelected ? accent.hex : 'var(--border-subtle)'
                        }}
                      >
                        <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accent.hex }} />
                          {accent.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5" style={{ color: accent.hex }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. Graphics Tab */}
          {activeTab === 'graphics' && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  3D Render Quality
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['low', 'medium', 'high'] as const).map((q) => {
                    const isSelected = graphicsQuality === q;
                    return (
                      <button
                        key={q}
                        onClick={() => onUpdateQuality(q)}
                        className={`p-3 rounded-xl border text-center text-xs font-medium capitalize cursor-pointer transition-all ${
                          isSelected ? 'font-semibold' : ''
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                          color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)'
                        }}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div 
                className="p-3.5 rounded-xl border text-xs leading-relaxed"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {graphicsQuality === 'high' && 'High Precision (60 FPS)'}
                  {graphicsQuality === 'medium' && 'Balanced Precision'}
                  {graphicsQuality === 'low' && 'Performance Priority'}
                </div>
                {graphicsQuality === 'high' && 'Full soft-shadow maps, 2x pixel ratio, and dynamic chase camera acceleration.'}
                {graphicsQuality === 'medium' && 'Standard shadow map with optimized geometry.'}
                {graphicsQuality === 'low' && 'Disables dynamic shadows for high frame rates on low-power devices.'}
              </div>
            </div>
          )}

          {/* 3. Audio Tab */}
          {activeTab === 'audio' && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Master Audio Output</span>
                  <span className="font-num font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVolume}
                  onChange={handleVolumeChange}
                  className="w-full accent-current cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                />
              </div>

              <div 
                className="p-3.5 rounded-xl border text-xs"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                Synthesized Web Audio: Pitch modulates dynamically in real-time based on your validated words-per-minute.
              </div>
            </div>
          )}

          {/* 4. Pilot Identity Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Driver Call-sign
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={18}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Avatar Badge
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`h-10 rounded-lg border flex items-center justify-center text-lg cursor-pointer transition-transform ${
                        selectedAvatar === av ? 'scale-105' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: selectedAvatar === av ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                        borderColor: selectedAvatar === av ? 'var(--accent)' : 'var(--border-subtle)'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="v-btn-primary px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                  {isSaved ? 'Identity Saved' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
