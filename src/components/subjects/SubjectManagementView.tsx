import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  Eye,
  Filter,
  Layers,
  ListTodo,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Subject } from '../../types';
import { SubjectDetailModal } from './SubjectDetailModal';
import { StreamPresetsModal } from './StreamPresetsModal';
import { CustomStudentSetupModal } from './CustomStudentSetupModal';
import { UserCheck } from 'lucide-react';

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

type FilterStatus = 'all' | 'at_risk' | 'safe' | 'high_credits';
type SortOption = 'name' | 'attendance_asc' | 'attendance_desc' | 'target' | 'credits';

export const SubjectManagementView: React.FC = () => {
  const {
    subjects,
    subjectStats,
    records,
    timetable,
    selectedDate,
    addSubject,
    editSubject,
    deleteSubject,
    markAttendance,
  } = useAttendance();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [detailSubject, setDetailSubject] = useState<Subject | null>(null);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCustomStudentSetupOpen, setIsCustomStudentSetupOpen] = useState(false);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formFaculty, setFormFaculty] = useState('');
  const [formCredits, setFormCredits] = useState(3);
  const [formWeeklyCount, setFormWeeklyCount] = useState(3);
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formTarget, setFormTarget] = useState(75);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setFormName('');
    setFormCode('');
    setFormFaculty('');
    setFormCredits(3);
    setFormWeeklyCount(3);
    setFormColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
    setFormTarget(75);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setFormName(sub.name);
    setFormCode(sub.code);
    setFormFaculty(sub.faculty);
    setFormCredits(sub.credits);
    setFormWeeklyCount(sub.weeklyCount);
    setFormColor(sub.color);
    setFormTarget(sub.targetPercentage);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      editSubject({
        ...editingSubject,
        name: formName,
        code: formCode,
        faculty: formFaculty,
        credits: Number(formCredits),
        weeklyCount: Number(formWeeklyCount),
        color: formColor,
        targetPercentage: Number(formTarget),
      });
    } else {
      addSubject({
        name: formName,
        code: formCode,
        faculty: formFaculty,
        credits: Number(formCredits),
        weeklyCount: Number(formWeeklyCount),
        color: formColor,
        targetPercentage: Number(formTarget),
      });
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmSubject) {
      deleteSubject(deleteConfirmSubject.id);
      setDeleteConfirmSubject(null);
      if (detailSubject?.id === deleteConfirmSubject.id) {
        setDetailSubject(null);
      }
    }
  };

  // Filter & Search subjects
  const filteredSubjects = subjects
    .filter((sub) => {
      const stats = subjectStats.find((s) => s.subjectId === sub.id);
      const isSafe = stats ? stats.attendancePercentage >= stats.targetPercentage : true;

      // Text match
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        sub.name.toLowerCase().includes(query) ||
        sub.code.toLowerCase().includes(query) ||
        sub.faculty.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Status match
      if (statusFilter === 'at_risk') return !isSafe;
      if (statusFilter === 'safe') return isSafe;
      if (statusFilter === 'high_credits') return sub.credits >= 3;

      return true;
    })
    .sort((a, b) => {
      const statsA = subjectStats.find((s) => s.subjectId === a.id);
      const statsB = subjectStats.find((s) => s.subjectId === b.id);
      const pctA = statsA ? statsA.attendancePercentage : 0;
      const pctB = statsB ? statsB.attendancePercentage : 0;

      if (sortBy === 'attendance_asc') return pctA - pctB;
      if (sortBy === 'attendance_desc') return pctB - pctA;
      if (sortBy === 'target') return b.targetPercentage - a.targetPercentage;
      if (sortBy === 'credits') return b.credits - a.credits;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span>Subject Management Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Configure subjects, faculty details, credit weights, syllabus trackers, and instant attendance logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCustomStudentSetupOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all"
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>Custom Student Setup</span>
          </button>

          <button
            onClick={() => setIsPresetsOpen(true)}
            className="px-3.5 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Stream Templates</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, subject, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/80'
            }`}
          >
            All ({subjects.length})
          </button>

          <button
            onClick={() => setStatusFilter('at_risk')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'at_risk'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/80'
            }`}
          >
            ⚠️ At Risk
          </button>

          <button
            onClick={() => setStatusFilter('safe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'safe'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/80'
            }`}
          >
            🛡️ Safe Goal
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="attendance_asc">Attendance % (Low to High)</option>
            <option value="attendance_desc">Attendance % (High to Low)</option>
            <option value="credits">Credits (High to Low)</option>
            <option value="target">Target Goal %</option>
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-12 text-center shadow-xl shadow-black/5 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No subjects match your criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query, or add new subjects to start tracking.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
            >
              + Create Subject
            </button>
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="px-4 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/30"
            >
              Import Stream Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => {
            const stats = subjectStats.find((s) => s.subjectId === sub.id);
            const isSafe = stats ? stats.attendancePercentage >= stats.targetPercentage : true;
            const syllabusCount = sub.syllabus?.length || 0;
            const syllabusDone = sub.syllabus?.filter((s) => s.completed).length || 0;

            return (
              <div
                key={sub.id}
                className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 hover:border-blue-500/30 transition-all relative overflow-hidden flex flex-col justify-between"
              >
                {/* Color Bar Accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: sub.color }}
                />

                <div>
                  {/* Header line */}
                  <div className="flex items-start justify-between mb-3 pt-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {sub.code} • {sub.credits} Credits
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                        {sub.name}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(sub)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSubject(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between mb-4">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sub.faculty || 'No faculty assigned'}</span>
                    </span>

                    {syllabusCount > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        Syllabus {syllabusDone}/{syllabusCount}
                      </span>
                    )}
                  </div>

                  {/* Percentage Stats Card */}
                  {stats && (
                    <div className="p-4 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Attendance Rate
                        </span>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-base font-black ${
                              isSafe
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {stats.attendancePercentage}%
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            (Target {sub.targetPercentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="bg-white/60 dark:bg-white/5 p-2 rounded-lg text-center border border-slate-200/40 dark:border-white/5 backdrop-blur-md">
                          <div className="text-slate-400 font-medium">Attended</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {stats.presentCount} / {stats.totalClasses}
                          </div>
                        </div>

                        <div className="bg-white/60 dark:bg-white/5 p-2 rounded-lg text-center border border-slate-200/40 dark:border-white/5 backdrop-blur-md">
                          {isSafe ? (
                            <>
                              <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Safe Bunks
                              </div>
                              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                {stats.safeBunkCount} classes
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-rose-600 dark:text-rose-400 font-medium">
                                Need Next
                              </div>
                              <div className="font-bold text-rose-600 dark:text-rose-400">
                                {stats.classesNeededForGoal} classes
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Attendance Logging Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Quick Log Today's Class</span>
                      <span>{selectedDate}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => markAttendance(sub.id, selectedDate, 'present')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1"
                        title="Mark Present Today"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        onClick={() => markAttendance(sub.id, selectedDate, 'absent')}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1"
                        title="Mark Absent Today"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      <button
                        onClick={() => setDetailSubject(sub)}
                        className="p-1.5 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200/60 dark:border-white/10 transition-all shrink-0"
                        title="Open Subject Hub"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Planned {sub.weeklyCount} classes / week</span>
                  <button
                    onClick={() => setDetailSubject(sub)}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Subject Hub & Notes &rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingSubject ? 'Edit Subject Details' : 'Add New Subject'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS301"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    placeholder="Prof. Smith"
                    value={formFaculty}
                    onChange={(e) => setFormFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Classes/Wk
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={formWeeklyCount}
                    onChange={(e) => setFormWeeklyCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Target %
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={formTarget}
                    onChange={(e) => setFormTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Card Theme Color
                </label>
                <div className="flex items-center space-x-2">
                  {COLOR_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setFormColor(hex)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        formColor === hex ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Delete {deleteConfirmSubject.name}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will permanently delete <span className="font-bold text-slate-800 dark:text-slate-200">{deleteConfirmSubject.code}</span> along with all its weekly timetable slots and attendance history logs.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmSubject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Subject Hub Modal */}
      {detailSubject && (
        <SubjectDetailModal
          subject={detailSubject}
          onClose={() => setDetailSubject(null)}
          onEdit={(sub) => {
            setDetailSubject(null);
            handleOpenEditModal(sub);
          }}
        />
      )}

      {/* Stream Presets Modal */}
      {isPresetsOpen && (
        <StreamPresetsModal onClose={() => setIsPresetsOpen(false)} />
      )}

      {/* Custom Student Setup Modal */}
      {isCustomStudentSetupOpen && (
        <CustomStudentSetupModal onClose={() => setIsCustomStudentSetupOpen(false)} />
      )}
    </div>
  );
};
