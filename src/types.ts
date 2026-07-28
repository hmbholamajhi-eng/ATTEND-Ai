export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'extra';

export interface SyllabusItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface SubjectResource {
  id: string;
  title: string;
  url?: string;
  note?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  faculty: string;
  credits: number;
  weeklyCount: number;
  color: string; // Hex color code or tailwind color name
  targetPercentage: number; // Default 75
  icon?: string;
  syllabus?: SyllabusItem[];
  resources?: SubjectResource[];
}

export interface TimetableSlot {
  id: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  room: string;      // e.g. "Lab 302" or "LT-1"
  faculty?: string;
  batch?: string;    // e.g. "A1" or "All"
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  timetableSlotId?: string;
  subjectId: string;
  status: AttendanceStatus;
  note?: string;
  timestamp: number; // Unix epoch ms
}

export interface StudentProfile {
  name: string;
  rollNumber: string;
  college: string;
  branch: string;
  semester: string;
  targetGoalDefault: number; // e.g. 75
  semesterStartDate: string; // YYYY-MM-DD
  semesterEndDate: string;   // YYYY-MM-DD
}

export interface SmartInsight {
  id: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  subjectId?: string;
}

export interface ClassReminder {
  id: string;
  timetableSlotId: string;
  subjectName: string;
  startTime: string;
  room: string;
  reminderMinutes: number;
  triggered: boolean;
}

export interface AttendanceStats {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  color: string;
  targetPercentage: number;
  presentCount: number;
  absentCount: number;
  cancelledCount: number;
  extraCount: number;
  totalClasses: number; // Effective total evaluated for percentage (Present + Absent + Extra)
  attendancePercentage: number;
  status: 'safe' | 'warning' | 'danger';
  
  // Math Engine outputs
  classesNeededForGoal: number;
  isGoalAchievable: boolean;
  maxPossiblePercentage: number;
  safeBunkCount: number;
  remainingClassesEstimated: number;
}

export interface OverallStats {
  totalPresent: number;
  totalAbsent: number;
  totalCancelled: number;
  totalExtra: number;
  totalEffective: number;
  overallPercentage: number;
  targetPercentage: number;
  overallClassesNeeded: number;
  overallSafeBunks: number;
  isGoalAchievable: boolean;
  maxPossiblePercentage: number;
  totalSemesterClassesPlanned: number;
  classesCompleted: number;
  classesRemaining: number;
}
