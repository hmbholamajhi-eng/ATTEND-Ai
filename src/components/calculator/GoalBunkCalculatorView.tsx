import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { predictAttendance } from '../../utils/mathEngine';

export const GoalBunkCalculatorView: React.FC = () => {
  const { subjects, subjectStats, overallStats, profile } = useAttendance();

  const [selectedGoalPreset, setSelectedGoalPreset] = useState<number>(profile.targetGoalDefault || 75);
  const [futureAttend, setFutureAttend] = useState<number>(3);
  const [futureMiss, setFutureMiss] = useState<number>(0);

  // Run predictor simulation on overall stats
  const simulationResult = predictAttendance(
    overallStats.totalPresent,
    overallStats.totalEffective,
    futureAttend,
    futureMiss,
    selectedGoalPreset
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span>Goal & Safe Bunk Math Calculator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Exact mathematical formulas calculating classes needed to reach target % or max missable bunks.
          </p>
        </div>

        {/* Preset Target Selectors */}
        <div className="flex items-center space-x-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/60 dark:border-white/10">
          <span className="text-xs font-bold text-slate-500 px-2">Target Goal:</span>
          {[75, 80, 85, 90, 95].map((preset) => (
            <button
              key={preset}
              onClick={() => setSelectedGoalPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                selectedGoalPreset === preset
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Simulator / Predictor Box */}
      <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-slate-900/80 backdrop-blur-2xl text-white rounded-2xl p-6 shadow-2xl border border-blue-500/30 relative overflow-hidden">
        <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Interactive Attendance Predictor</span>
        </div>

        <h2 className="text-lg font-bold">Simulate Future Attendance Outcome</h2>
        <p className="text-xs text-blue-200 mt-1 max-w-xl">
          "What if I attend or skip my upcoming classes?" Test different scenarios live before making decisions!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Controls: Attending Next N */}
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2">
            <label className="block text-xs font-bold text-emerald-300">
              If I attend next N classes:
            </label>
            <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
              <button
                onClick={() => setFutureAttend(Math.max(0, futureAttend - 1))}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-black">{futureAttend} classes</span>
              <button
                onClick={() => setFutureAttend(futureAttend + 1)}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls: Missing Next N */}
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2">
            <label className="block text-xs font-bold text-rose-300">
              If I bunk/miss next N classes:
            </label>
            <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
              <button
                onClick={() => setFutureMiss(Math.max(0, futureMiss - 1))}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-black">{futureMiss} classes</span>
              <button
                onClick={() => setFutureMiss(futureMiss + 1)}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Result Outcome Box */}
          <div className="bg-blue-500/20 backdrop-blur-md p-4 rounded-xl border border-blue-400/30 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                Projected Attendance %
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-black text-white">{simulationResult.newPercentage}%</span>
                <span className="text-xs text-blue-200">
                  ({simulationResult.newPresent} / {simulationResult.newTotal})
                </span>
              </div>
            </div>

            <div className="text-xs mt-3 pt-2 border-t border-blue-400/20 font-semibold">
              {simulationResult.newPercentage >= selectedGoalPreset ? (
                <span className="text-emerald-300 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Above target! Safe bunks left: {simulationResult.safeBunks}</span>
                </span>
              ) : (
                <span className="text-rose-300 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Below target! Need {simulationResult.classesNeeded} more classes</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Subject Math Breakdowns */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
          Subject-by-Subject Attendance Analysis (Goal: {selectedGoalPreset}%)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectStats.map((stats) => {
            const sub = subjects.find((s) => s.id === stats.subjectId);
            const isGoalAchieved = stats.attendancePercentage >= selectedGoalPreset;

            return (
              <div
                key={stats.subjectId}
                className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 relative overflow-hidden flex flex-col justify-between"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: stats.color }}
                />

                <div className="space-y-3 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {stats.subjectCode}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                        {stats.subjectName}
                      </h4>
                    </div>

                    <span
                      className={`text-lg font-black ${
                        isGoalAchieved
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {stats.attendancePercentage}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
                    <span>Evaluated Classes: {stats.totalClasses}</span>
                    <span>Attended: {stats.presentCount}</span>
                  </div>

                  {/* Impossible Goal Card vs Normal Goal/Bunk Card */}
                  {!stats.isGoalAchievable && !isGoalAchieved ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 backdrop-blur-md border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-rose-700 dark:text-rose-300">
                        <AlertOctagon className="w-4 h-4 shrink-0" />
                        <span>Impossible Goal Warning</span>
                      </div>
                      <p className="font-semibold">
                        Not achievable this semester, max possible is {stats.maxPossiblePercentage}%
                      </p>
                    </div>
                  ) : isGoalAchieved ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/15 backdrop-blur-md border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Safe Bunk Margin</span>
                      </div>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        You can safely miss {stats.safeBunkCount} classes
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                        Without dropping below {selectedGoalPreset}%
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-500/15 backdrop-blur-md border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-700 dark:text-amber-300">
                        <TrendingUp className="w-4 h-4 shrink-0" />
                        <span>Goal Deficit Recovery</span>
                      </div>
                      <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                        Must attend next {stats.classesNeededForGoal} classes
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                        Consecutively to reach {selectedGoalPreset}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Est. Remaining in sem: {stats.remainingClassesEstimated}</span>
                  <span>Formula: Exact PRD Math</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
