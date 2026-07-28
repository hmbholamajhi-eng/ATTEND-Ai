import React, { useState } from 'react';
import { Cloud, CloudCheck, LogIn, LogOut, Moon, RefreshCw, Sun, UserCheck, Zap } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { syncLocalToFirestore } from '../services/firestoreSync';
import { ProfileModal } from './profile/ProfileModal';

export const Header: React.FC = () => {
  const { profile, subjects, timetable, records, overallStats, theme, toggleTheme, showToast } =
    useAttendance();
  const { currentUser, signInWithGoogle, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isSafe = overallStats.overallPercentage >= overallStats.targetPercentage;

  const handleCloudSync = async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      const res = await syncLocalToFirestore(currentUser.uid, profile, subjects, timetable, records);
      if (res?.success) {
        showToast('Synced data to Cloud Firestore! ☁️', undefined, 'success');
      }
    } catch (err: any) {
      showToast('Failed to sync to Cloud Firestore', undefined, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Offline/Cloud Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 font-black text-lg">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold tracking-tight text-lg text-slate-900 dark:text-slate-100">
                  Attend<span className="text-blue-500 dark:text-blue-400 font-light underline underline-offset-4 decoration-1">AI</span>
                </span>
                {currentUser ? (
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 backdrop-blur-md">
                    <Cloud className="w-3 h-3 mr-1 text-sky-500" /> Firebase Cloud Sync
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mr-1.5"></span> Offline First
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                {profile.name} • {profile.semester || 'Semester'}
              </p>
            </div>
          </div>

          {/* Center: Live Attendance Pill */}
          <div className="hidden md:flex items-center space-x-3 px-3.5 py-1.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Overall:</span>
            <span
              className={`text-sm font-bold ${
                isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {overallStats.overallPercentage}%
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Target: {overallStats.targetPercentage}%
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Google Login / Cloud Sync button */}
            {currentUser ? (
              <button
                onClick={handleCloudSync}
                disabled={isSyncing}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 backdrop-blur-md transition-all cursor-pointer"
                title="Sync data with Firebase Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Cloud</span>
              </button>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 backdrop-blur-md transition-all cursor-pointer"
                title="Sign in with Google to sync Tasks & Calendar"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  profile.name ? profile.name.charAt(0) : 'S'
                )}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
                {currentUser?.displayName || profile.name || 'Profile'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
