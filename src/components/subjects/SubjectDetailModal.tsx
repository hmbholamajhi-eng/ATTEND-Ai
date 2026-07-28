import React, { useState } from 'react';
import {
  AlertOctagon,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  ListTodo,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import { createGoogleTask } from '../../services/googleTasksService';
import { AttendanceStatus, Subject, SyllabusItem, SubjectResource } from '../../types';
import { getTodayISOString } from '../../utils/mathEngine';

interface SubjectDetailModalProps {
  subject: Subject;
  onClose: () => void;
  onEdit: (sub: Subject) => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  onClose,
  onEdit,
}) => {
  const {
    subjectStats,
    records,
    timetable,
    markAttendance,
    deleteAttendanceRecord,
    editSubject,
    showToast,
  } = useAttendance();

  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'resources' | 'history'>(
    'overview'
  );

  const handleCreateSyllabusTask = async (topicTitle: string) => {
    if (!accessToken) {
      showToast('Please sign in with Google to create Google Tasks', undefined, 'warning');
      return;
    }
    try {
      await createGoogleTask(accessToken, {
        title: `Study: ${topicTitle} (${subject.code})`,
        notes: `Syllabus topic for ${subject.name} (${subject.code}).`,
      });
      showToast('Added syllabus topic to Google Tasks! 📋', undefined, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create Google Task', undefined, 'error');
    }
  };

  // Stats for this subject
  const stats = subjectStats.find((s) => s.subjectId === subject.id);
  const subjectRecords = records.filter((r) => r.subjectId === subject.id);
  const subjectSlots = timetable.filter((s) => s.subjectId === subject.id);

  // Quick Attendance Form State
  const [logDate, setLogDate] = useState<string>(getTodayISOString());
  const [logNote, setLogNote] = useState<string>('');

  // Syllabus Form State
  const [newTopic, setNewTopic] = useState<string>('');

  // Resource Form State
  const [newResTitle, setNewResTitle] = useState<string>('');
  const [newResUrl, setNewResUrl] = useState<string>('');
  const [newResNote, setNewResNote] = useState<string>('');

  // Syllabus handlers
  const handleAddSyllabusItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newItem: SyllabusItem = {
      id: `syl-${Date.now()}`,
      title: newTopic.trim(),
      completed: false,
    };

    const updatedSyllabus = [...(subject.syllabus || []), newItem];
    editSubject({ ...subject, syllabus: updatedSyllabus });
    setNewTopic('');
    showToast('Syllabus topic added', undefined, 'success');
  };

  const handleToggleSyllabusItem = (itemId: string) => {
    const updatedSyllabus = (subject.syllabus || []).map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    editSubject({ ...subject, syllabus: updatedSyllabus });
  };

  const handleDeleteSyllabusItem = (itemId: string) => {
    const updatedSyllabus = (subject.syllabus || []).filter((item) => item.id !== itemId);
    editSubject({ ...subject, syllabus: updatedSyllabus });
    showToast('Syllabus topic removed', undefined, 'info');
  };

  // Resource handlers
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;

    const newRes: SubjectResource = {
      id: `res-${Date.now()}`,
      title: newResTitle.trim(),
      url: newResUrl.trim() || undefined,
      note: newResNote.trim() || undefined,
    };

    const updatedResources = [...(subject.resources || []), newRes];
    editSubject({ ...subject, resources: updatedResources });
    setNewResTitle('');
    setNewResUrl('');
    setNewResNote('');
    showToast('Note/Resource added', undefined, 'success');
  };

  const handleDeleteResource = (resId: string) => {
    const updatedResources = (subject.resources || []).filter((r) => r.id !== resId);
    editSubject({ ...subject, resources: updatedResources });
    showToast('Resource removed', undefined, 'info');
  };

  const isSafe = stats ? stats.attendancePercentage >= stats.targetPercentage : true;
  const syllabusList = subject.syllabus || [];
  const completedTopics = syllabusList.filter((s) => s.completed).length;
  const syllabusProgress = syllabusList.length > 0 ? Math.round((completedTopics / syllabusList.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-2xl max-w-2xl w-full my-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Color Top Accent */}
        <div className="h-2.5 w-full shrink-0" style={{ backgroundColor: subject.color }} />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200/60 dark:border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                {subject.code}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {subject.credits} Credits • {subject.weeklyCount} Classes/Wk
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {subject.name}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <User className="w-3.5 h-3.5" />
              <span>{subject.faculty || 'No faculty assigned'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onEdit(subject)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              Edit Details
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 p-2 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-white/10 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview & Math</span>
          </button>

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'syllabus'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Syllabus ({syllabusProgress}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes & Resources ({subject.resources?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Class Logs ({subjectRecords.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW & MATH */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Primary Gauge Banner */}
              <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Current Attendance Status
                  </div>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span
                      className={`text-3xl font-black ${
                        isSafe
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {stats.attendancePercentage}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Target: {subject.targetPercentage}%
                    </span>
                  </div>
                  <div className="w-48 bg-slate-200/80 dark:bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
                    />
                  </div>
                </div>

                <div className="sm:text-right">
                  {isSafe ? (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center space-x-1 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Safe Bunk Reserve</span>
                      </div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Can miss {stats.safeBunkCount} classes
                      </div>
                    </div>
                  ) : stats.isGoalAchievable ? (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                      <div className="flex items-center space-x-1 font-bold text-xs">
                        <TrendingUp className="w-4 h-4" />
                        <span>Goal Deficit</span>
                      </div>
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                        Must attend next {stats.classesNeededForGoal} classes
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300">
                      <div className="flex items-center space-x-1 font-bold text-xs">
                        <AlertOctagon className="w-4 h-4" />
                        <span>Impossible Target</span>
                      </div>
                      <div className="text-xs mt-0.5">
                        Max possible: {stats.maxPossiblePercentage}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <div className="text-slate-400 font-medium">Attended</div>
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {stats.presentCount}
                  </div>
                </div>

                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <div className="text-slate-400 font-medium">Missed (Absent)</div>
                  <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    {stats.absentCount}
                  </div>
                </div>

                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <div className="text-slate-400 font-medium">Extra Classes</div>
                  <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                    {stats.extraCount}
                  </div>
                </div>

                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                  <div className="text-slate-400 font-medium">Cancelled</div>
                  <div className="text-lg font-extrabold text-slate-600 dark:text-slate-400 mt-0.5">
                    {stats.cancelledCount}
                  </div>
                </div>
              </div>

              {/* Quick Class Attendance Logging Widget */}
              <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Log Class Attendance for {subject.code}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Class Date
                    </label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Optional Note / Topic Covered
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Midterm revision, Lab test"
                      value={logNote}
                      onChange={(e) => setLogNote(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      markAttendance(subject.id, logDate, 'present', undefined, logNote);
                      setLogNote('');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center space-x-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Present</span>
                  </button>

                  <button
                    onClick={() => {
                      markAttendance(subject.id, logDate, 'absent', undefined, logNote);
                      setLogNote('');
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center space-x-1 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Mark Absent</span>
                  </button>

                  <button
                    onClick={() => {
                      markAttendance(subject.id, logDate, 'extra', undefined, logNote);
                      setLogNote('');
                    }}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center space-x-1 transition-all"
                  >
                    <span>+ Extra Class</span>
                  </button>

                  <button
                    onClick={() => {
                      markAttendance(subject.id, logDate, 'cancelled', undefined, logNote);
                      setLogNote('');
                    }}
                    className="px-3.5 py-2 bg-slate-600 hover:bg-slate-500 text-white font-bold text-xs rounded-xl shadow-md shadow-slate-500/20 flex items-center space-x-1 transition-all"
                  >
                    <span>Cancelled</span>
                  </button>
                </div>
              </div>

              {/* Weekly Timetable Slots */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Weekly Class Slots ({subjectSlots.length})
                </h3>

                {subjectSlots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No class slots assigned in weekly timetable yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subjectSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{slot.day}</span>
                          <div className="text-[11px] text-slate-400">
                            {slot.startTime} - {slot.endTime} • {slot.room}
                          </div>
                        </div>
                        {slot.batch && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
                            {slot.batch}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SYLLABUS TRACKER */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              {/* Syllabus Progress Header */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Syllabus Completion
                  </span>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {completedTopics} / {syllabusList.length} Topics ({syllabusProgress}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${syllabusProgress}%` }}
                  />
                </div>
              </div>

              {/* Add New Topic Form */}
              <form onSubmit={handleAddSyllabusItem} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Unit 3: Graph Algorithms & Minimum Spanning Trees"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Topic</span>
                </button>
              </form>

              {/* Topics List */}
              {syllabusList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No syllabus topics added yet. Add units or chapters above to track your exam prep progress!
                </div>
              ) : (
                <div className="space-y-2">
                  {syllabusList.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        item.completed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                          : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <label className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleSyllabusItem(item.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span
                          className={`text-xs font-semibold truncate ${
                            item.completed ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {item.title}
                        </span>
                      </label>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleCreateSyllabusTask(item.title)}
                          className="p-1 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                          title="Add to Google Tasks"
                        >
                          <ListTodo className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSyllabusItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="Delete topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTES & RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Add Resource Form */}
              <form onSubmit={handleAddResource} className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 space-y-3">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Add Study Note or Resource Link
                </h3>

                <input
                  type="text"
                  required
                  placeholder="Title (e.g. Google Drive Lecture Slides)"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-medium"
                />

                <input
                  type="url"
                  placeholder="Web Link URL (optional, e.g. https://drive.google.com/...)"
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-medium"
                />

                <textarea
                  rows={2}
                  placeholder="Notes, key formulas, or submission instructions (optional)"
                  value={newResNote}
                  onChange={(e) => setNewResNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-medium"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Resource</span>
                </button>
              </form>

              {/* Resource List */}
              {(subject.resources || []).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No notes or resource links saved for this subject yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {(subject.resources || []).map((res) => (
                    <div
                      key={res.id}
                      className="p-4 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {res.title}
                          </h4>
                        </div>

                        {res.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pl-6">
                            {res.note}
                          </p>
                        )}

                        {res.url && (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 pl-6 pt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-xs">{res.url}</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLASS HISTORY LOG */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>All Attendance Records ({subjectRecords.length})</span>
                <span>Sorted Newest First</span>
              </div>

              {subjectRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No attendance records logged for {subject.code} yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200/50 dark:border-white/10 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Note</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/40 dark:divide-white/5">
                      {subjectRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-white/40 dark:hover:bg-white/5">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {rec.date}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                rec.status === 'present'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                  : rec.status === 'absent'
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                  : rec.status === 'cancelled'
                                  ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                                  : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                            {rec.note || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteAttendanceRecord(rec.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
