import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  CheckSquare,
  Circle,
  ListTodo,
  Plus,
  RefreshCw,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import {
  createGoogleTask,
  deleteGoogleTask,
  fetchTasks,
  GoogleTask,
  updateGoogleTask,
} from '../../services/googleTasksService';

export const GoogleTasksView: React.FC = () => {
  const { accessToken, currentUser, signInWithGoogle } = useAuth();
  const { subjects, subjectStats, showToast } = useAttendance();

  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New task form state
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Confirmation modal state for task deletion
  const [taskToDelete, setTaskToDelete] = useState<GoogleTask | null>(null);

  const loadTasks = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchTasks(accessToken);
      setTasks(fetched);
    } catch (err: any) {
      console.error('Failed to load Google Tasks:', err);
      setError(err.message || 'Failed to fetch Google Tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadTasks();
    }
  }, [accessToken]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !accessToken) return;

    try {
      setLoading(true);
      const sub = subjects.find((s) => s.id === selectedSubjectId);
      const combinedNotes = `${notes}${sub ? `\n\nSubject: ${sub.name} (${sub.code})` : ''}`.trim();

      const newTask = await createGoogleTask(accessToken, {
        title: title.trim(),
        notes: combinedNotes,
        due: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setTasks((prev) => [newTask, ...prev]);
      setTitle('');
      setNotes('');
      setDueDate('');
      setSelectedSubjectId('');
      setIsAdding(false);
      showToast('Created Google Task successfully', undefined, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create Google Task', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: GoogleTask) => {
    if (!accessToken) return;
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateGoogleTask(accessToken, task.id, { status: newStatus });
      showToast(
        newStatus === 'completed' ? 'Marked task as completed ✅' : 'Reopened Google Task',
        undefined,
        'info'
      );
    } catch (err: any) {
      // Revert on error
      loadTasks();
      showToast(err.message || 'Failed to update Google Task', undefined, 'error');
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete || !accessToken) return;

    try {
      setLoading(true);
      await deleteGoogleTask(accessToken, taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      showToast('Deleted task from Google Tasks', undefined, 'warning');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', undefined, 'error');
    } finally {
      setTaskToDelete(null);
      setLoading(false);
    }
  };

  // Quick generator for low attendance subjects
  const handleCreateAttendanceAlertTask = async (subName: string, subCode: string, requiredCount: number) => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const task = await createGoogleTask(accessToken, {
        title: `Attend next ${requiredCount} classes for ${subCode}`,
        notes: `Attendance goal deficit for ${subName} (${subCode}). You need to attend at least ${requiredCount} consecutive classes to reach target attendance percentage.`,
      });
      setTasks((prev) => [task, ...prev]);
      showToast(`Added Google Task for ${subCode}`, undefined, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !accessToken) {
    return (
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/10 p-8 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
          <ListTodo className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Connect Google Tasks
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
          Sign in with your Google Account to sync attendance warnings, syllabus study tasks, and homework assignments directly with Google Tasks.
        </p>
        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Sign In & Authorize Google Tasks</span>
        </button>
      </div>
    );
  }

  const lowAttendanceSubs = subjectStats.filter((s) => s.attendancePercentage < s.targetPercentage);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Google Tasks Sync
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Synced
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your study tasks and attendance reminders directly connected with your Google Tasks account.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={loadTasks}
            disabled={loading}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl border border-slate-200/60 dark:border-white/10 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Recommended Quick Actions for Low Attendance */}
      {lowAttendanceSubs.length > 0 && (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-5">
          <div className="flex items-center space-x-2 mb-3 text-amber-800 dark:text-amber-300 font-semibold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Recommended Actions for Deficit Subjects</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
            Click to auto-create a Google Task for subjects below your target attendance goal:
          </p>
          <div className="flex flex-wrap gap-2">
            {lowAttendanceSubs.map((sub) => (
              <button
                key={sub.subjectId}
                onClick={() =>
                  handleCreateAttendanceAlertTask(
                    sub.subjectName,
                    sub.subjectCode,
                    sub.requiredToTarget
                  )
                }
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-500/40 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {sub.subjectCode}: Attend next {sub.requiredToTarget} classes
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal / Expanded Card */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <ListTodo className="w-5 h-5 text-blue-500" />
            <span>Add New Google Task</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Lab Report for CS301"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Link Subject (Optional)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">-- No Subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Notes / Description
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, instructions, or target class counts..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              Save Google Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/10 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
            No Google Tasks found in your list.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Click "New Task" above or add task reminders for your subjects!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 flex items-start justify-between space-x-4 transition-all hover:border-blue-500/30 ${
                  isDone ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-slate-400 hover:text-blue-500 transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                        isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    {task.due && (
                      <div className="flex items-center space-x-1 mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span>Due: {new Date(task.due).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setTaskToDelete(task)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Task Deletion */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Delete Google Task?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Are you sure you want to permanently delete "{taskToDelete.title}" from Google Tasks? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
