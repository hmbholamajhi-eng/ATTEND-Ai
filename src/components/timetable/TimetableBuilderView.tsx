import React, { useState } from 'react';
import {
  Clock,
  Edit2,
  MapPin,
  Plus,
  PlusCircle,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { DayOfWeek, TimetableSlot } from '../../types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TimetableBuilderView: React.FC = () => {
  const { subjects, timetable, addTimetableSlot, editTimetableSlot, deleteTimetableSlot } = useAttendance();

  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formDay, setFormDay] = useState<DayOfWeek>('Monday');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formRoom, setFormRoom] = useState('LT-101');
  const [formFaculty, setFormFaculty] = useState('');
  const [formBatch, setFormBatch] = useState('');

  const activeDaySlots = timetable
    .filter((s) => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleOpenAddModal = () => {
    setEditingSlot(null);
    setFormSubjectId(subjects[0]?.id || '');
    setFormDay(activeDay);
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormRoom('LT-101');
    setFormFaculty('');
    setFormBatch('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormSubjectId(slot.subjectId);
    setFormDay(slot.day);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormRoom(slot.room);
    setFormFaculty(slot.faculty || '');
    setFormBatch(slot.batch || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot) {
      editTimetableSlot({
        ...editingSlot,
        subjectId: formSubjectId,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        faculty: formFaculty,
        batch: formBatch,
      });
    } else {
      addTimetableSlot({
        subjectId: formSubjectId,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom,
        faculty: formFaculty,
        batch: formBatch,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span>Weekly Timetable Builder</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Build your weekly schedule per day, room, and time slot.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class Slot</span>
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((day) => {
          const count = timetable.filter((s) => s.day === day).length;
          const isActive = activeDay === day;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center space-x-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10'
              }`}
            >
              <span>{day}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/60 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots List for Active Day */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-white/10">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {activeDay}'s Schedule ({activeDaySlots.length} Classes)
          </h3>
        </div>

        {activeDaySlots.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-slate-400" />
            <p className="text-sm font-semibold">No classes scheduled for {activeDay}.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-500/30 backdrop-blur-md"
            >
              + Add First Class Slot
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDaySlots.map((slot) => {
              const sub = subjects.find((s) => s.id === slot.subjectId);

              return (
                <div
                  key={slot.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md hover:border-slate-300 dark:hover:border-white/20 transition-all gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: sub?.color || '#3b82f6' }}
                    />

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {sub?.code || 'SUB'} - {sub?.name || 'Class'}
                        </span>
                        {slot.batch && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-white/10">
                            {slot.batch}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </span>

                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.room}</span>
                        </span>

                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.faculty || sub?.faculty || 'Faculty'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEditModal(slot)}
                      className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                      title="Edit Slot"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTimetableSlot(slot.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Timetable Modal */}
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
              {editingSlot ? 'Edit Class Slot' : 'Add Class Slot to Timetable'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Select Subject
                </label>
                <select
                  required
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="LT-101 or Lab 3"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Faculty (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Override faculty"
                    value={formFaculty}
                    onChange={(e) => setFormFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Batch / Slot Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Batch A"
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-xl text-sm font-medium"
                  />
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
                  {editingSlot ? 'Save Changes' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
