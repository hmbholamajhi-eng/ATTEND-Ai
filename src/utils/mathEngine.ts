import { AttendanceRecord, AttendanceStats, OverallStats, StudentProfile, Subject, TimetableSlot } from '../types';

/**
 * Calculates exact attendance statistics for a single subject based on attendance records and profile semester bounds.
 */
export function calculateSubjectStats(
  subject: Subject,
  records: AttendanceRecord[],
  timetableSlots: TimetableSlot[],
  profile: StudentProfile
): AttendanceStats {
  const subjectRecords = records.filter((r) => r.subjectId === subject.id);

  let presentCount = 0;
  let absentCount = 0;
  let cancelledCount = 0;
  let extraCount = 0;

  for (const rec of subjectRecords) {
    if (rec.status === 'present') presentCount++;
    else if (rec.status === 'absent') absentCount++;
    else if (rec.status === 'cancelled') cancelledCount++;
    else if (rec.status === 'extra') {
      extraCount++;
      presentCount++; // Extra class attended counts as present
    }
  }

  // Effective total evaluated for percentage
  // Cancelled classes do NOT count in denominator T
  const totalClasses = presentCount + absentCount; // Note: extraCount is already included in presentCount
  const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 100;

  const targetPercentage = subject.targetPercentage || profile.targetGoalDefault || 75;
  const G = targetPercentage / 100;

  // Estimate remaining classes for this subject in the active semester
  const subjectSlotsPerWeek = timetableSlots.filter((s) => s.subjectId === subject.id).length || subject.weeklyCount || 1;
  const remainingWeeks = calculateRemainingWeeks(profile.semesterStartDate, profile.semesterEndDate);
  const remainingClassesEstimated = Math.max(0, Math.ceil(remainingWeeks * subjectSlotsPerWeek));

  // Max possible percentage if user attends 100% of remaining classes
  const maxPossibleNumerator = presentCount + remainingClassesEstimated;
  const maxPossibleDenominator = totalClasses + remainingClassesEstimated;
  const maxPossiblePercentage =
    maxPossibleDenominator > 0 ? (maxPossibleNumerator / maxPossibleDenominator) * 100 : 100;

  // Check if target goal is achievable
  const isGoalAchievable = maxPossiblePercentage >= targetPercentage - 0.001;

  // Classes needed to reach goal
  let classesNeededForGoal = 0;
  if (attendancePercentage < targetPercentage) {
    if (G < 1) {
      const rawNeeded = (G * totalClasses - presentCount) / (1 - G);
      classesNeededForGoal = Math.max(0, Math.ceil(rawNeeded));
    } else {
      // 100% target goal
      classesNeededForGoal = absentCount > 0 ? Infinity : 0;
    }
  }

  // Safe bunk count
  let safeBunkCount = 0;
  if (attendancePercentage >= targetPercentage && G > 0) {
    const rawSafe = presentCount / G - totalClasses;
    safeBunkCount = Math.max(0, Math.floor(rawSafe));
  }

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (attendancePercentage < targetPercentage) {
    status = 'danger';
  } else if (attendancePercentage < targetPercentage + 5 || safeBunkCount <= 1) {
    status = 'warning';
  }

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    color: subject.color,
    targetPercentage,
    presentCount,
    absentCount,
    cancelledCount,
    extraCount,
    totalClasses,
    attendancePercentage: Math.round(attendancePercentage * 10) / 10,
    status,
    classesNeededForGoal,
    isGoalAchievable,
    maxPossiblePercentage: Math.round(maxPossiblePercentage * 10) / 10,
    safeBunkCount,
    remainingClassesEstimated,
  };
}

/**
 * Calculates aggregate stats across all subjects.
 */
export function calculateOverallStats(
  subjects: Subject[],
  records: AttendanceRecord[],
  timetableSlots: TimetableSlot[],
  profile: StudentProfile
): OverallStats {
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalCancelled = 0;
  let totalExtra = 0;

  for (const rec of records) {
    if (rec.status === 'present') totalPresent++;
    else if (rec.status === 'absent') totalAbsent++;
    else if (rec.status === 'cancelled') totalCancelled++;
    else if (rec.status === 'extra') {
      totalExtra++;
      totalPresent++;
    }
  }

  const totalEffective = totalPresent + totalAbsent;
  const overallPercentage = totalEffective > 0 ? (totalPresent / totalEffective) * 100 : 100;
  const targetPercentage = profile.targetGoalDefault || 75;
  const G = targetPercentage / 100;

  // Calculate overall semester remaining classes estimate
  const slotsPerWeek = timetableSlots.length || subjects.reduce((acc, s) => acc + (s.weeklyCount || 0), 0);
  const remainingWeeks = calculateRemainingWeeks(profile.semesterStartDate, profile.semesterEndDate);
  const classesRemaining = Math.max(0, Math.ceil(remainingWeeks * slotsPerWeek));
  const classesCompleted = records.length;
  const totalSemesterClassesPlanned = classesCompleted + classesRemaining;

  const maxPossibleNumerator = totalPresent + classesRemaining;
  const maxPossibleDenominator = totalEffective + classesRemaining;
  const maxPossiblePercentage =
    maxPossibleDenominator > 0 ? (maxPossibleNumerator / maxPossibleDenominator) * 100 : 100;

  const isGoalAchievable = maxPossiblePercentage >= targetPercentage - 0.001;

  let overallClassesNeeded = 0;
  if (overallPercentage < targetPercentage && G < 1) {
    const rawNeeded = (G * totalEffective - totalPresent) / (1 - G);
    overallClassesNeeded = Math.max(0, Math.ceil(rawNeeded));
  }

  let overallSafeBunks = 0;
  if (overallPercentage >= targetPercentage && G > 0) {
    const rawSafe = totalPresent / G - totalEffective;
    overallSafeBunks = Math.max(0, Math.floor(rawSafe));
  }

  return {
    totalPresent,
    totalAbsent,
    totalCancelled,
    totalExtra,
    totalEffective,
    overallPercentage: Math.round(overallPercentage * 10) / 10,
    targetPercentage,
    overallClassesNeeded,
    overallSafeBunks,
    isGoalAchievable,
    maxPossiblePercentage: Math.round(maxPossiblePercentage * 10) / 10,
    totalSemesterClassesPlanned,
    classesCompleted,
    classesRemaining,
  };
}

/**
 * Predicts percentage & bunks for hypothetical future attended/missed classes.
 */
export function predictAttendance(
  currentPresent: number,
  currentTotal: number,
  futureAttended: number,
  futureMissed: number,
  targetPercentage: number
) {
  const newPresent = currentPresent + futureAttended;
  const newTotal = currentTotal + futureAttended + futureMissed;
  const newPercentage = newTotal > 0 ? (newPresent / newTotal) * 100 : 100;

  const G = targetPercentage / 100;
  let classesNeeded = 0;
  if (newPercentage < targetPercentage && G < 1) {
    classesNeeded = Math.max(0, Math.ceil((G * newTotal - newPresent) / (1 - G)));
  }

  let safeBunks = 0;
  if (newPercentage >= targetPercentage && G > 0) {
    safeBunks = Math.max(0, Math.floor(newPresent / G - newTotal));
  }

  return {
    newPresent,
    newTotal,
    newPercentage: Math.round(newPercentage * 10) / 10,
    classesNeeded,
    safeBunks,
  };
}

/**
 * Calculates remaining weeks in the active semester from today.
 */
export function calculateRemainingWeeks(startDateStr: string, endDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = endDateStr ? new Date(endDateStr) : new Date(today.getTime() + 90 * 86400000);
  end.setHours(23, 59, 59, 999);

  if (today >= end) return 0;

  const diffMs = end.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(0, diffDays / 7);
}

/**
 * Formats ISO date YYYY-MM-DD into human readable string
 */
export function formatDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Get current day of week string
 */
export function getTodayDayOfWeek(): import('../types').DayOfWeek {
  const days: import('../types').DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayIndex = new Date().getDay();
  return days[todayIndex];
}

/**
 * Get YYYY-MM-DD for today in local time
 */
export function getTodayISOString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
