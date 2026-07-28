import { AttendanceRecord, AttendanceStats, DayOfWeek, SmartInsight, Subject, TimetableSlot } from '../types';

export function generateSmartInsights(
  subjects: Subject[],
  subjectStats: AttendanceStats[],
  records: AttendanceRecord[],
  timetable: TimetableSlot[]
): SmartInsight[] {
  const insights: SmartInsight[] = [];

  // 1. Danger Territory Alert
  for (const stats of subjectStats) {
    if (stats.attendancePercentage < stats.targetPercentage) {
      if (!stats.isGoalAchievable) {
        insights.push({
          id: `ins-imp-${stats.subjectId}`,
          type: 'danger',
          title: `Impossible Target: ${stats.subjectCode}`,
          message: `Target of ${stats.targetPercentage}% is mathematically unreachable this semester. Maximum possible attendance is ${stats.maxPossiblePercentage}%.`,
          subjectId: stats.subjectId,
        });
      } else {
        insights.push({
          id: `ins-danger-${stats.subjectId}`,
          type: 'danger',
          title: `Goal Deficit: ${stats.subjectName}`,
          message: `Current attendance is ${stats.attendancePercentage}% (target ${stats.targetPercentage}%). You must attend the next ${stats.classesNeededForGoal} consecutive classes to recover.`,
          subjectId: stats.subjectId,
        });
      }
    } else if (stats.safeBunkCount >= 3) {
      insights.push({
        id: `ins-bunk-${stats.subjectId}`,
        type: 'success',
        title: `Safe Bunk Margin: ${stats.subjectCode}`,
        message: `Great attendance buffer! (${stats.attendancePercentage}%). You can safely miss up to ${stats.safeBunkCount} classes without dropping below ${stats.targetPercentage}%.`,
        subjectId: stats.subjectId,
      });
    }
  }

  // 2. Day-of-week Pattern Detection
  const dayBunks: Record<string, number> = {};
  const dayNames: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (const rec of records) {
    if (rec.status === 'absent') {
      const date = new Date(rec.date);
      const dayName = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Convert 0=Sun to DayOfWeek
      if (dayName) {
        dayBunks[dayName] = (dayBunks[dayName] || 0) + 1;
      }
    }
  }

  let highestBunkDay = '';
  let maxBunks = 0;
  for (const [day, count] of Object.entries(dayBunks)) {
    if (count > maxBunks) {
      maxBunks = count;
      highestBunkDay = day;
    }
  }

  if (maxBunks >= 3) {
    insights.push({
      id: `ins-day-pattern`,
      type: 'warning',
      title: `Pattern Detected: ${highestBunkDay} Absences`,
      message: `You have missed ${maxBunks} classes on ${highestBunkDay}s. Consider setting extra reminders or adjusting morning routines for ${highestBunkDay}s.`,
    });
  }

  // 3. Perfect Streak Check
  const perfectSubjects = subjectStats.filter((s) => s.attendancePercentage === 100 && s.totalClasses >= 3);
  if (perfectSubjects.length > 0) {
    const subNames = perfectSubjects.map((s) => s.subjectCode).join(', ');
    insights.push({
      id: `ins-perfect-streak`,
      type: 'success',
      title: 'Flawless Record 🌟',
      message: `100% attendance maintained in ${subNames}! Keep up the consistent streak.`,
    });
  }

  return insights;
}
