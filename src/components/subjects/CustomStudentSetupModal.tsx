import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  Plus,
  Sliders,
  Sparkles,
  Target,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

const COLOR_PRESETS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
];

interface CustomSubjectRow {
  name: string;
  code: string;
  faculty: string;
  credits: number;
  weeklyCount: number;
  targetPercentage: number;
  color: string;
}

interface CustomStudentSetupModalProps {
  onClose: () => void;
}

export const CustomStudentSetupModal: React.FC<CustomStudentSetupModalProps> = ({ onClose }) => {
  const { profile, subjects, addMultipleSubjects, setAllSubjectsTargetGoal, showToast } =
    useAttendance();

  const [activeTab, setActiveTab] = useState<'batch' | 'target'>('batch');

  // Multi-subject builder rows
  const [rows, setRows] = useState<CustomSubjectRow[]>([
    {
      name: '',
      code: '',
      faculty: '',
      credits: 3,
      weeklyCount: 3,
      targetPercentage: profile.targetGoalDefault || 75,
      color: COLOR_PRESETS[0],
    },
  ]);

  // Student global custom target
  const [globalTarget, setGlobalTarget] = useState<number>(profile.targetGoalDefault || 75);

  const handleAddRow = () => {
    const nextColor = COLOR_PRESETS[rows.length % COLOR_PRESETS.length];
    setRows([
      ...rows,
      {
        name: '',
        code: '',
        faculty: '',
        credits: 3,
        weeklyCount: 3,
        targetPercentage: profile.targetGoalDefault || 75,
        color: nextColor,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) {
      showToast('At least one subject row is required', undefined, 'warning');
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: keyof CustomSubjectRow, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((r) => r.name.trim() !== '');
    if (validRows.length === 0) {
      showToast('Please enter at least one subject name', undefined, 'warning');
      return;
    }

    addMultipleSubjects(
      validRows.map((r, idx) => ({
        name: r.name.trim(),
        code: r.code.trim() || `SUB-${idx + 1}`,
        faculty: r.faculty.trim() || 'Custom Faculty',
        credits: Number(r.credits) || 3,
        weeklyCount: Number(r.weeklyCount) || 3,
        targetPercentage: Number(r.targetPercentage) || 75,
        color: r.color,
      }))
    );
    onClose();
  };

  const handleApplyGlobalTarget = () => {
    if (subjects.length === 0) {
      showToast('No existing subjects to update. Add subjects first!', undefined, 'warning');
      return;
    }
    setAllSubjectsTargetGoal(globalTarget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative text-slate-900 dark:text-white my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl bg-slate-100 dark:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Student Profile Info Header */}
        <div className="flex items-center space-x-3 mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Custom Student Subject Setup
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Unlimited Subjects
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {profile.name || 'Student'}'s Academic Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.college || 'Institution'} • {profile.branch || 'Branch'} • {subjects.length} current subjects
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200/60 dark:border-white/10 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'batch'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Multi-Subject Quick Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('target')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'target'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Set Global Goal Target</span>
          </button>
        </div>

        {/* TAB 1: BATCH CUSTOM SUBJECT ADDER */}
        {activeTab === 'batch' && (
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Add any number of custom subjects tailored to your student curriculum:
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-500/30 flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Subject Row</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 space-y-3 backdrop-blur-md relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      Subject #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Subject Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Advanced AI & Machine Learning"
                        value={row.name}
                        onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        placeholder="CS501"
                        value={row.code}
                        onChange={(e) => handleRowChange(index, 'code', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Faculty
                      </label>
                      <input
                        type="text"
                        placeholder="Prof. Name"
                        value={row.faculty}
                        onChange={(e) => handleRowChange(index, 'faculty', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Credits
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="100"
                        value={row.credits}
                        onChange={(e) => handleRowChange(index, 'credits', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Classes / Wk
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={row.weeklyCount}
                        onChange={(e) => handleRowChange(index, 'weeklyCount', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Target Goal %
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={row.targetPercentage}
                        onChange={(e) => handleRowChange(index, 'targetPercentage', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Subject</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save {rows.length} Custom Subject(s)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: GLOBAL TARGET GOAL SETTER */}
        {activeTab === 'target' && (
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200 space-y-2">
              <h3 className="font-extrabold text-sm flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>Bulk Update Target Goal for {profile.name || 'Student'}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-indigo-300">
                Apply a uniform target attendance goal across all currently created subjects ({subjects.length} subjects).
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                Select Target Percentage Goal:
              </label>
              <div className="flex items-center space-x-3 mb-4">
                {[60, 75, 80, 85, 90].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setGlobalTarget(pct)}
                    className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all ${
                      globalTarget === pct
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-500">Custom Goal:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={globalTarget}
                  onChange={(e) => setGlobalTarget(Number(e.target.value))}
                  className="w-28 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyGlobalTarget}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply {globalTarget}% Goal to All Subjects</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
