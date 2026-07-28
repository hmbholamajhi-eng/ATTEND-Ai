import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MinusCircle,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Tag,
  User,
  XCircle,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceStatus, DayOfWeek } from '../../types';
import { formatDateString, getTodayISOString } from '../../utils/mathEngine';

export const AttendanceMarkingView: React.FC = () => {
  const {
    subjects,
    timetable,
    records,
    selectedDate,
    setSelectedDate,
    markAttendance,
    bulkMarkDayAttendance,
    deleteAttendanceRecord,
  } = useAttendance();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [editingNoteForRecord, setEditingNoteForRecord] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const todayISO = getTodayISOString();

  // Helper to change date relative to selectedDate
  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Determine day of week for selectedDate
  const dayOfWeekNames: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dateObj = new Date(selectedDate);
  const dayName = dayOfWeekNames[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1] || 'Monday';

  // Get scheduled timetable slots for this selected date
  const daySlots = timetable
    .filter((s) => s.day === dayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Filter slots if subject filter active
  const filteredSlots =
    selectedSubjectFilter === 'all'
      ? daySlots
      : daySlots.filter((s) => s.subjectId === selectedSubjectFilter);

  // Helper to get record for slot
  const getRecordForSlot = (slotId: string, subjectId: string) => {
    return records.find(
      (r) => r.date === selectedDate && r.subjectId === subjectId && r.timetableSlotId === slotId
    );
  };

  const handleSaveNote = (recordId: string, subjectId: string, slotId: string, currentStatus: AttendanceStatus) => {
    markAttendance(subjectId, selectedDate, currentStatus, slotId, noteText);
    setEditingNoteForRecord(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Date Navigation & Selector Header */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span>Mark Daily Attendance</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tap or swipe to record attendance. Changes are saved offline instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Shift Buttons */}
          <div className="flex items-center space-x-1 bg-white/50 dark:bg-white/5 backdrop-blur-md p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-1.5 hover:bg-white/80 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer px-1"
            />

            <button
              onClick={() => changeDateByDays(1)}
              className="p-1.5 hover:bg-white/80 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {selectedDate !== todayISO && (
            <button
              onClick={() => setSelectedDate(todayISO)}
              className="px-3 py-1.5 bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-semibold text-xs rounded-xl hover:bg-blue-500/20 transition-all backdrop-blur-md"
            >
              Jump to Today
            </button>
          )}

          {/* Bulk Action */}
          <button
            onClick={() => bulkMarkDayAttendance(selectedDate, 'present')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Present</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white/40 dark:bg-white/5 backdrop-blur-md p-3 rounded-xl border border-slate-200/60 dark:border-white/10">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter Subject:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Scheduled Subjects ({daySlots.length})</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:block">
          {formatDateString(selectedDate)} ({dayName})
        </div>
      </div>

      {/* Class Slots List */}
      {filteredSlots.length === 0 ? (
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
          <Clock className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Classes Scheduled for {dayName}
          </h3>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            You can add class slots in the Timetable tab or mark an extra class manually below.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSlots.map((slot) => {
            const sub = subjects.find((s) => s.id === slot.subjectId);
            const record = getRecordForSlot(slot.id, slot.subjectId);
            const currentStatus = record ? record.status : null;

            return (
              <div
                key={slot.id}
                className={`bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border rounded-2xl p-5 shadow-xl shadow-black/5 transition-all relative overflow-hidden ${
                  currentStatus === 'present'
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : currentStatus === 'absent'
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : currentStatus === 'cancelled'
                    ? 'border-slate-500/30 bg-slate-500/10'
                    : 'border-slate-200/60 dark:border-white/10'
                }`}
              >
                {/* Left accent border */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-2"
                  style={{ backgroundColor: sub?.color || '#3b82f6' }}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Class Info */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {sub?.code || 'SUB'} • {sub?.name || 'Subject'}
                      </span>
                      {slot.batch && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-white/10">
                          {slot.batch}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </span>

                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.faculty || sub?.faculty || 'Faculty'}</span>
                      </span>

                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {slot.room}
                      </span>
                    </div>

                    {record?.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 px-2.5 py-1 rounded-lg mt-2 inline-block backdrop-blur-md">
                        Note: "{record.note}"
                      </p>
                    )}
                  </div>

                  {/* One-Tap Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => sub && markAttendance(sub.id, selectedDate, 'present', slot.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                          : 'bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white backdrop-blur-md'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Present</span>
                    </button>

                    <button
                      onClick={() => sub && markAttendance(sub.id, selectedDate, 'absent', slot.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                          : 'bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-rose-600 hover:text-white backdrop-blur-md'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Absent</span>
                    </button>

                    <button
                      onClick={() => sub && markAttendance(sub.id, selectedDate, 'cancelled', slot.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        currentStatus === 'cancelled'
                          ? 'bg-slate-700 text-white'
                          : 'bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 backdrop-blur-md'
                      }`}
                    >
                      Cancelled
                    </button>

                    {/* Note/Edit Modal toggle */}
                    {record && sub && (
                      <button
                        onClick={() => {
                          setEditingNoteForRecord(record.id);
                          setNoteText(record.note || '');
                        }}
                        className="p-2 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                        title="Add/Edit Note"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Note Editor if opened */}
                {record && editingNoteForRecord === record.id && sub && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add custom note for this class..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 rounded-lg text-xs font-medium focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveNote(record.id, sub.id, slot.id, record.status)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setEditingNoteForRecord(null)}
                      className="px-2 py-1.5 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Extra Class Manual Section */}
      <div className="bg-white/50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
            <PlusCircle className="w-4 h-4 text-purple-500" />
            <span>Attended Extra Class or Lab?</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record unscheduled extra classes to boost your total present count!
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            id="extra-class-subject-select"
            className="bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const selectEl = document.getElementById(
                'extra-class-subject-select'
              ) as HTMLSelectElement;
              if (selectEl && selectEl.value) {
                markAttendance(selectEl.value, selectedDate, 'extra', undefined, 'Extra Class');
              }
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all shrink-0"
          >
            + Add Extra Class
          </button>
        </div>
      </div>
    </div>
  );
};
