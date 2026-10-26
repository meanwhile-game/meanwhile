import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { api } from '../../services/supabase.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { X, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, setProfile } = useGameStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundEngine.playButtonClick();
    setErrorMsg('');
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await api.signUp(username, password);
      } else {
        result = await api.signIn(username, password);
      }

      if (result?.profile) {
        setProfile(result.profile);
      } else {
        const activeProfile = await api.getProfile();
        setProfile(activeProfile);
      }

      // Reset form fields
      setUsername('');
      setPassword('');
      setAuthModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueGuest = () => {
    soundEngine.playButtonClick();
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c1222] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#f8fafc]">meanwhile</span>
            <span className="text-xs text-amber-400 font-mono">auth</span>
          </div>

          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1 rounded-full text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Title */}
        <div>
          <h2 className="text-xl font-bold text-[#f8fafc]">
            {isSignUp ? 'Create Racer Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            {isSignUp
              ? 'Choose a unique username and password to track your records.'
              : 'Log in with your username and password to access your stats.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#94a3b8] block mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                required
                autoComplete="username"
                minLength={3}
                maxLength={20}
                placeholder="e.g. ApexHunter"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#f8fafc] focus:outline-none focus:border-amber-400"
              />
            </div>
            {isSignUp && (
              <span className="text-[10px] text-[#64748b] mt-1 block">
                3–20 characters. Letters, numbers, and underscores only.
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94a3b8] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="password"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-[#f8fafc] focus:outline-none focus:border-amber-400"
              />
            </div>
            {isSignUp && (
              <span className="text-[10px] text-[#64748b] mt-1 block">
                Minimum 6 characters. Passwords are securely hashed with Supabase.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Login / Sign Up */}
        <div className="pt-2 text-center text-xs text-[#94a3b8]">
          <span>{isSignUp ? 'Already have an account? ' : "Don't have an account? "}</span>
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setIsSignUp(!isSignUp);
            }}
            className="text-amber-400 font-bold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Log In' : 'Create Account'}
          </button>
        </div>

        {/* Guest Play */}
        <div className="pt-3 border-t border-white/[0.08] text-center">
          <button
            type="button"
            onClick={handleContinueGuest}
            className="text-xs text-[#64748b] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            Continue as Guest Racer (No account needed) →
          </button>
        </div>
      </div>
    </div>
  );
};
