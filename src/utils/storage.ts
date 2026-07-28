import { AttendanceRecord, StudentProfile, Subject, TimetableSlot } from '../types';
import { getTodayISOString } from './mathEngine';

const STORAGE_KEYS = {
  PROFILE: 'attendai_profile_v1',
  SUBJECTS: 'attendai_subjects_v1',
  TIMETABLE: 'attendai_timetable_v1',
  RECORDS: 'attendai_records_v1',
  THEME: 'attendai_theme_v1',
};

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'Alex Rivers',
  rollNumber: '21BCE048',
  college: 'National Institute of Technology',
  branch: 'Computer Science & Engineering',
  semester: 'Semester 5',
  targetGoalDefault: 75,
  semesterStartDate: '2026-07-01',
  semesterEndDate: '2026-11-30',
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    faculty: 'Dr. Aris Vance',
    credits: 4,
    weeklyCount: 4,
    color: '#3b82f6',
    targetPercentage: 75,
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    code: 'CS302',
    faculty: 'Prof. Sarah Jenkins',
    credits: 4,
    weeklyCount: 4,
    color: '#10b981',
    targetPercentage: 75,
  },
  {
    id: 'sub-dbms',
    name: 'Database Management Systems',
    code: 'CS303',
    faculty: 'Dr. Marcus Brody',
    credits: 3,
    weeklyCount: 3,
    color: '#f59e0b',
    targetPercentage: 80,
  },
  {
    id: 'sub-cn',
    name: 'Computer Networks',
    code: 'CS304',
    faculty: 'Prof. Elena Rostova',
    credits: 3,
    weeklyCount: 3,
    color: '#8b5cf6',
    targetPercentage: 75,
  },
  {
    id: 'sub-ml',
    name: 'Machine Learning Essentials',
    code: 'CS305',
    faculty: 'Dr. Kabir Sharma',
    credits: 3,
    weeklyCount: 3,
    color: '#ec4899',
    targetPercentage: 75,
  },
  {
    id: 'sub-ethics',
    name: 'Humanities & Professional Ethics',
    code: 'HU301',
    faculty: 'Prof. Claire Underwood',
    credits: 2,
    weeklyCount: 2,
    color: '#64748b',
    targetPercentage: 75,
  },
];

export const DEFAULT_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'slot-mon-1', subjectId: 'sub-dsa', day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'LT-101', faculty: 'Dr. Aris Vance' },
  { id: 'slot-mon-2', subjectId: 'sub-os', day: 'Monday', startTime: '10:15', endTime: '11:15', room: 'LT-102', faculty: 'Prof. Sarah Jenkins' },
  { id: 'slot-mon-3', subjectId: 'sub-dbms', day: 'Monday', startTime: '11:30', endTime: '12:30', room: 'LT-101', faculty: 'Dr. Marcus Brody' },
  { id: 'slot-mon-4', subjectId: 'sub-cn', day: 'Monday', startTime: '14:00', endTime: '15:30', room: 'Net-Lab 2', faculty: 'Prof. Elena Rostova', batch: 'Batch A' },

  // Tuesday
  { id: 'slot-tue-1', subjectId: 'sub-ml', day: 'Tuesday', startTime: '09:00', endTime: '10:00', room: 'LT-103', faculty: 'Dr. Kabir Sharma' },
  { id: 'slot-tue-2', subjectId: 'sub-dsa', day: 'Tuesday', startTime: '10:15', endTime: '11:15', room: 'LT-101', faculty: 'Dr. Aris Vance' },
  { id: 'slot-tue-3', subjectId: 'sub-ethics', day: 'Tuesday', startTime: '11:30', endTime: '12:30', room: 'LT-104', faculty: 'Prof. Claire Underwood' },
  { id: 'slot-tue-4', subjectId: 'sub-os', day: 'Tuesday', startTime: '14:00', endTime: '16:00', room: 'OS-Lab 1', faculty: 'Prof. Sarah Jenkins', batch: 'Batch A' },

  // Wednesday
  { id: 'slot-wed-1', subjectId: 'sub-dbms', day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'LT-101', faculty: 'Dr. Marcus Brody' },
  { id: 'slot-wed-2', subjectId: 'sub-cn', day: 'Wednesday', startTime: '10:15', endTime: '11:15', room: 'LT-102', faculty: 'Prof. Elena Rostova' },
  { id: 'slot-wed-3', subjectId: 'sub-ml', day: 'Wednesday', startTime: '11:30', endTime: '12:30', room: 'LT-103', faculty: 'Dr. Kabir Sharma' },
  { id: 'slot-wed-4', subjectId: 'sub-dsa', day: 'Wednesday', startTime: '14:00', endTime: '16:00', room: 'CS-Lab 3', faculty: 'Dr. Aris Vance', batch: 'Batch A' },

  // Thursday
  { id: 'slot-thu-1', subjectId: 'sub-os', day: 'Thursday', startTime: '09:00', endTime: '10:00', room: 'LT-102', faculty: 'Prof. Sarah Jenkins' },
  { id: 'slot-thu-2', subjectId: 'sub-cn', day: 'Thursday', startTime: '10:15', endTime: '11:15', room: 'LT-102', faculty: 'Prof. Elena Rostova' },
  { id: 'slot-thu-3', subjectId: 'sub-ethics', day: 'Thursday', startTime: '11:30', endTime: '12:30', room: 'LT-104', faculty: 'Prof. Claire Underwood' },
  { id: 'slot-thu-4', subjectId: 'sub-dbms', day: 'Thursday', startTime: '14:00', endTime: '16:00', room: 'DB-Lab 2', faculty: 'Dr. Marcus Brody', batch: 'Batch A' },

  // Friday
  { id: 'slot-fri-1', subjectId: 'sub-ml', day: 'Friday', startTime: '09:00', endTime: '10:00', room: 'LT-103', faculty: 'Dr. Kabir Sharma' },
  { id: 'slot-fri-2', subjectId: 'sub-dsa', day: 'Friday', startTime: '10:15', endTime: '11:15', room: 'LT-101', faculty: 'Dr. Aris Vance' },
  { id: 'slot-fri-3', subjectId: 'sub-os', day: 'Friday', startTime: '11:30', endTime: '12:30', room: 'LT-102', faculty: 'Prof. Sarah Jenkins' },
];

/**
 * Generate sample attendance records for the past 3 weeks leading up to today
 */
export function generateSampleRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Loop back 21 days
  for (let i = 21; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayNum}`;
    const dayName = dayOfWeekNames[date.getDay()];

    const slotsForDay = DEFAULT_TIMETABLE.filter((s) => s.day === dayName);

    slotsForDay.forEach((slot, index) => {
      // Deterministic realistic attendance distribution
      // Most classes attended, occasional absent or cancelled
      let status: 'present' | 'absent' | 'cancelled' | 'extra' = 'present';

      // Slight variance per subject/day
      if (slot.subjectId === 'sub-dbms' && (i === 12 || i === 5)) {
        status = 'absent';
      } else if (slot.subjectId === 'sub-ethics' && i % 7 === 2) {
        status = 'absent';
      } else if (slot.subjectId === 'sub-dsa' && i === 14) {
        status = 'cancelled';
      } else if (slot.subjectId === 'sub-os' && i === 8) {
        status = 'absent';
      } else if (i === 3 && index === 2) {
        status = 'cancelled';
      }

      records.push({
        id: `rec-${dateStr}-${slot.id}`,
        date: dateStr,
        timetableSlotId: slot.id,
        subjectId: slot.subjectId,
        status,
        timestamp: date.getTime(),
      });
    });
  }

  return records;
}

// Local Storage helpers
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

export function loadProfile(): StudentProfile {
  return loadFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export function saveProfile(profile: StudentProfile): void {
  saveToStorage(STORAGE_KEYS.PROFILE, profile);
}

export function loadSubjects(): Subject[] {
  return loadFromStorage(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
}

export function saveSubjects(subjects: Subject[]): void {
  saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
}

export function loadTimetable(): TimetableSlot[] {
  return loadFromStorage(STORAGE_KEYS.TIMETABLE, DEFAULT_TIMETABLE);
}

export function saveTimetable(timetable: TimetableSlot[]): void {
  saveToStorage(STORAGE_KEYS.TIMETABLE, timetable);
}

export function loadRecords(): AttendanceRecord[] {
  const records = loadFromStorage<AttendanceRecord[] | null>(STORAGE_KEYS.RECORDS, null);
  if (!records) {
    const sampleRecords = generateSampleRecords();
    saveToStorage(STORAGE_KEYS.RECORDS, sampleRecords);
    return sampleRecords;
  }
  return records;
}

export function saveRecords(records: AttendanceRecord[]): void {
  saveToStorage(STORAGE_KEYS.RECORDS, records);
}

export function exportBackupDataJSON(): string {
  const backup = {
    app: 'AttendAI',
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: loadProfile(),
    subjects: loadSubjects(),
    timetable: loadTimetable(),
    records: loadRecords(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupDataJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.profile && data.subjects && data.timetable && data.records) {
      saveProfile(data.profile);
      saveSubjects(data.subjects);
      saveTimetable(data.timetable);
      saveRecords(data.records);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to parse backup JSON', e);
    return false;
  }
}

export function resetToDemoData(): void {
  saveProfile(DEFAULT_PROFILE);
  saveSubjects(DEFAULT_SUBJECTS);
  saveTimetable(DEFAULT_TIMETABLE);
  saveRecords(generateSampleRecords());
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
  localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
}
