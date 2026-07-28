import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Lightbulb,
  MapPin,
  MinusCircle,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceStatus, DayOfWeek, TimetableSlot } from '../../types';
import { formatDateString, getTodayDayOfWeek, getTodayISOString } from '../../utils/mathEngine';
import { TabType } from '../Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const {
    profile,
    subjects,
    timetable,
    records,
    overallStats,
    subjectStats,
    smartInsights,
    markAttendance,
    bulkMarkDayAttendance,
  } = useAttendance();

  const todayISO = getTodayISOString();
  const todayDayName = getTodayDayOfWeek();

  // Get today's scheduled classes from timetable
  const todaySlots = timetable
    .filter((slot) => slot.day === todayDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine current or next upcoming class
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentSlot: TimetableSlot | null = null;
  let nextSlot: TimetableSlot | null = null;

  for (const slot of todaySlots) {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const slotStartMin = startH * 60 + startM;
    const slotEndMin = endH * 60 + endM;

    if (currentMinutes >= slotStartMin && currentMinutes <= slotEndMin) {
      currentSlot = slot;
    } else if (currentMinutes < slotStartMin && !nextSlot) {
      nextSlot = slot;
    }
  }

  const activeFocusSlot = currentSlot || nextSlot || todaySlots[0] || null;
  const activeFocusSubject = activeFocusSlot
    ? subjects.find((s) => s.id === activeFocusSlot.subjectId)
    : null;

  // Check attendance status for today's slots
  const getSlotAttendanceStatus = (slotId: string) => {
    const record = records.find((r) => r.date === todayISO && r.timetableSlotId === slotId);
    return record ? record.status : null;
  };

  const isSafe = overallStats.overallPercentage >= overallStats.targetPercentage;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Greeting & Quick Summary */}
      <div className="bg-slate-900/80 dark:bg-black/40 backdrop-blur-2xl text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-[20%] bottom-[-30%] w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateString(todayISO)} • {todayDayName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.name || 'Student'}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {profile.college} ({profile.branch}) • {profile.semester}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div
                className={`text-3xl font-black ${
                  isSafe ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {overallStats.overallPercentage}%
              </div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Overall %
              </div>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="text-center px-2">
              <div className="text-3xl font-black text-sky-400">
                {overallStats.overallSafeBunks}
              </div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Safe Bunks
              </div>
            </div>

            {overallStats.overallClassesNeeded > 0 && (
              <>
                <div className="h-10 w-px bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-3xl font-black text-rose-400">
                    {overallStats.overallClassesNeeded}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    Classes Needed
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Smart Insights Banner (if available) */}
      {smartInsights.length > 0 && (
        <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 flex items-start space-x-3 text-slate-900 dark:text-amber-100">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Smart Attendance Insight
            </div>
            <p className="text-sm font-semibold mt-0.5">{smartInsights[0].title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {smartInsights[0].message}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('calculator')}
            className="px-3 py-1.5 text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl transition-all shrink-0 backdrop-blur-md"
          >
            Calculate
          </button>
        </div>
      )}

      {/* Focus Class & Today Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Active Focus Class & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Class Highlight Card */}
          {activeFocusSlot && activeFocusSubject ? (
            <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 bottom-0 w-2"
                style={{ backgroundColor: activeFocusSubject.color }}
              />

              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 backdrop-blur-md">
                  {currentSlot ? '🔴 Class In Session' : '⏰ Next Up Today'}
                </span>

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {activeFocusSlot.startTime} - {activeFocusSlot.endTime}
                  </span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {activeFocusSubject.code}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeFocusSubject.name}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeFocusSlot.faculty || activeFocusSubject.faculty}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeFocusSlot.room}</span>
                    </span>
                  </div>
                </div>

                {/* Instant Attendance Buttons for active slot */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() =>
                      markAttendance(activeFocusSubject.id, todayISO, 'present', activeFocusSlot.id)
                    }
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() =>
                      markAttendance(activeFocusSubject.id, todayISO, 'absent', activeFocusSlot.id)
                    }
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-rose-500/20 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Absent</span>
                  </button>

                  <button
                    onClick={() =>
                      markAttendance(activeFocusSubject.id, todayISO, 'cancelled', activeFocusSlot.id)
                    }
                    className="px-3 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10 text-xs font-semibold backdrop-blur-md"
                    title="Mark Class Cancelled"
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-sm">No scheduled classes for today!</p>
              <p className="text-xs mt-1">Enjoy your free day or review your timetable.</p>
            </div>
          )}

          {/* Today's Full Schedule Timeline */}
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Today's Class Schedule ({todaySlots.length})
                </h3>
              </div>

              {todaySlots.length > 0 && (
                <button
                  onClick={() => bulkMarkDayAttendance(todayISO, 'present')}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-500/15 hover:bg-blue-500/20 rounded-xl transition-all border border-blue-500/30 backdrop-blur-md"
                >
                  ⚡ Bulk Mark All Present
                </button>
              )}
            </div>

            {todaySlots.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No classes scheduled in timetable for {todayDayName}.
              </div>
            ) : (
              <div className="space-y-3">
                {todaySlots.map((slot) => {
                  const sub = subjects.find((s) => s.id === slot.subjectId);
                  const currentStatus = getSlotAttendanceStatus(slot.id);

                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all bg-white/40 dark:bg-white/5 backdrop-blur-md gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-2.5 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: sub?.color || '#3b82f6' }}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {sub?.code || 'SUB'} - {sub?.name || 'Class'}
                            </span>
                            {slot.batch && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-white/10">
                                {slot.batch}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3 mt-0.5">
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span>•</span>
                            <span>{slot.room}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges or Quick Buttons */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                        {currentStatus === 'present' && (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center space-x-1 backdrop-blur-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </span>
                        )}

                        {currentStatus === 'absent' && (
                          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center space-x-1 backdrop-blur-md">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </span>
                        )}

                        {currentStatus === 'cancelled' && (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/30 font-bold text-xs flex items-center space-x-1 backdrop-blur-md">
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span>Cancelled</span>
                          </span>
                        )}

                        {/* Direct action buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => sub && markAttendance(sub.id, todayISO, 'present', slot.id)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white'
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => sub && markAttendance(sub.id, todayISO, 'absent', slot.id)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-rose-500 hover:text-white'
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Subject Performance Quick Overview */}
        <div className="space-y-6">
          {/* Subject Attendance Status List */}
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Subjects Overview
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('subjects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {subjectStats.map((stats) => {
                const sub = subjects.find((s) => s.id === stats.subjectId);
                const isGoalMet = stats.attendancePercentage >= stats.targetPercentage;

                return (
                  <div
                    key={stats.subjectId}
                    className="p-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: stats.color }}
                        />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {stats.subjectCode}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-extrabold ${
                            isGoalMet
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {stats.attendancePercentage}%
                        </span>
                        <span className="text-[10px] text-slate-400">/ {stats.targetPercentage}%</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200/80 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isGoalMet ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        P: {stats.presentCount} / {stats.totalClasses}
                      </span>
                      {isGoalMet ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Safe bunks: {stats.safeBunkCount}
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          Need next: {stats.classesNeededForGoal}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('calculator')}
              className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 backdrop-blur-md text-left transition-all shadow-sm"
            >
              <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-2" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Goal Math</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Calculate Bunks</div>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 backdrop-blur-md text-left transition-all shadow-sm"
            >
              <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-2" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Analytics</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Charts & Trends</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
