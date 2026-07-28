import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  MinusCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceStatus, DayOfWeek } from '../../types';
import { formatDateString, getTodayISOString } from '../../utils/mathEngine';
import { GoogleCalendarSyncModal } from './GoogleCalendarSyncModal';

export const CalendarView: React.FC = () => {
  const {
    subjects,
    timetable,
    records,
    selectedDate,
    setSelectedDate,
    markAttendance,
    bulkMarkDayAttendance,
  } = useAttendance();

  const [currentViewMonth, setCurrentViewMonth] = useState<Date>(() => new Date(selectedDate));
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);

  const todayISO = getTodayISOString();

  // Helper to get days in month
  const year = currentViewMonth.getFullYear();
  const month = currentViewMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDayOfMonth.getDate();

  // Shift month
  const changeMonth = (delta: number) => {
    setCurrentViewMonth(new Date(year, month + delta, 1));
  };

  // Build calendar cells array
  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const yStr = year;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarDays.push(`${yStr}-${mStr}-${dStr}`);
  }

  // Get records for a specific date
  const getRecordsForDate = (dateStr: string) => {
    return records.filter((r) => r.date === dateStr);
  };

  // Determine date overall status
  const getDateStatusSummary = (dateStr: string) => {
    const dayRecords = getRecordsForDate(dateStr);
    if (dayRecords.length === 0) return null;

    const hasAbsent = dayRecords.some((r) => r.status === 'absent');
    const allPresent = dayRecords.every((r) => r.status === 'present' || r.status === 'extra');
    const allCancelled = dayRecords.every((r) => r.status === 'cancelled');

    if (hasAbsent) return 'absent';
    if (allPresent) return 'present';
    if (allCancelled) return 'cancelled';
    return 'mixed';
  };

  // Get selected day's slots and records
  const selectedDateObj = new Date(selectedDate);
  const dayOfWeekNames: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const selectedDayName =
    dayOfWeekNames[selectedDateObj.getDay() === 0 ? 6 : selectedDateObj.getDay() - 1] || 'Monday';

  const selectedDaySlots = timetable
    .filter((s) => s.day === selectedDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Heatmap generation (past 12 weeks)
  const heatmapWeeks = [];
  const todayDate = new Date();
  for (let w = 11; w >= 0; w--) {
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + (6 - d);
      const target = new Date(todayDate);
      target.setDate(todayDate.getDate() - dayOffset);

      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, '0');
      const da = String(target.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${da}`;

      const recs = getRecordsForDate(iso);
      const presentCount = recs.filter((r) => r.status === 'present' || r.status === 'extra').length;

      weekDays.push({ iso, presentCount, total: recs.length });
    }
    heatmapWeeks.push(weekDays);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span>Monthly Attendance Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tap any date to inspect historical attendance or mark backdated records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCalendarSyncOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Sync Google Calendar</span>
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-bold text-slate-900 dark:text-white px-2">
              {currentViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-white/60 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Google Calendar Sync Modal */}
      <GoogleCalendarSyncModal
        isOpen={isCalendarSyncOpen}
        onClose={() => setIsCalendarSyncOpen(false)}
      />

      {/* GitHub-style Heatmap */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Attendance Heatmap (12 Weeks)</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-slate-200/80 dark:bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-300/80 dark:bg-emerald-900" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-max">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  let bgClass = 'bg-slate-200/80 dark:bg-white/10';
                  if (day.presentCount >= 3) bgClass = 'bg-emerald-600 dark:bg-emerald-500';
                  else if (day.presentCount === 2) bgClass = 'bg-emerald-400 dark:bg-emerald-700';
                  else if (day.presentCount === 1) bgClass = 'bg-emerald-300 dark:bg-emerald-900';

                  const isSelected = selectedDate === day.iso;

                  return (
                    <button
                      key={day.iso}
                      onClick={() => setSelectedDate(day.iso)}
                      className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 ${bgClass} ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                      title={`${day.iso}: ${day.presentCount} present`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Left Calendar Grid / Right Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Calendar Grid */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-16 rounded-xl bg-transparent" />;
              }

              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayISO;
              const statusSummary = getDateStatusSummary(dateStr);
              const dateNum = new Date(dateStr).getDate();

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 rounded-xl border p-2 flex flex-col justify-between transition-all relative text-left backdrop-blur-md ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/60 bg-blue-500/15'
                      : isToday
                      ? 'border-indigo-500/50 font-bold bg-indigo-500/10'
                      : 'border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 bg-white/40 dark:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dateNum}
                    </span>

                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </div>

                  {/* Status Indicator Dot */}
                  <div className="flex items-center space-x-1">
                    {statusSummary === 'present' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" title="All Present" />
                    )}
                    {statusSummary === 'absent' && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" title="Absent" />
                    )}
                    {statusSummary === 'cancelled' && (
                      <div className="w-2 h-2 rounded-full bg-slate-400" title="Cancelled" />
                    )}
                    {statusSummary === 'mixed' && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" title="Mixed Status" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 col): Selected Day Class Details */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
            <div>
              <div className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                {selectedDayName}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {formatDateString(selectedDate)}
              </h3>
            </div>

            {selectedDaySlots.length > 0 && (
              <button
                onClick={() => bulkMarkDayAttendance(selectedDate, 'present')}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/25 transition-all"
              >
                All Present
              </button>
            )}
          </div>

          {selectedDaySlots.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No classes scheduled on this day.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDaySlots.map((slot) => {
                const sub = subjects.find((s) => s.id === slot.subjectId);
                const rec = records.find(
                  (r) => r.date === selectedDate && r.timetableSlotId === slot.id
                );
                const status = rec ? rec.status : null;

                return (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {sub?.code} - {sub?.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{slot.room}</span>

                      {/* Quick Attendance Buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => sub && markAttendance(sub.id, selectedDate, 'present', slot.id)}
                          className={`p-1 rounded-md text-xs font-bold transition-all ${
                            status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => sub && markAttendance(sub.id, selectedDate, 'absent', slot.id)}
                          className={`p-1 rounded-md text-xs font-bold transition-all ${
                            status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
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
    </div>
  );
};
