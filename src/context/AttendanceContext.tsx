import confetti from 'canvas-confetti';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AttendanceRecord,
  AttendanceStats,
  AttendanceStatus,
  OverallStats,
  SmartInsight,
  StudentProfile,
  Subject,
  TimetableSlot,
} from '../types';
import { generateSmartInsights } from '../utils/insights';
import { calculateOverallStats, calculateSubjectStats, getTodayISOString } from '../utils/mathEngine';
import {
  clearAllData as storageClearAllData,
  loadProfile,
  loadRecords,
  loadSubjects,
  loadTimetable,
  resetToDemoData,
  saveProfile,
  saveRecords,
  saveSubjects,
  saveTimetable,
} from '../utils/storage';

interface SnackbarState {
  show: boolean;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  undoAction?: () => void;
}

interface AttendanceContextType {
  profile: StudentProfile;
  subjects: Subject[];
  timetable: TimetableSlot[];
  records: AttendanceRecord[];
  theme: 'light' | 'dark';
  selectedDate: string; // YYYY-MM-DD
  snackbar: SnackbarState;

  // Derived stats
  subjectStats: AttendanceStats[];
  overallStats: OverallStats;
  smartInsights: SmartInsight[];

  // Setters & Actions
  setSelectedDate: (date: string) => void;
  markAttendance: (
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    slotId?: string,
    note?: string
  ) => void;
  bulkMarkDayAttendance: (date: string, status: AttendanceStatus) => void;
  deleteAttendanceRecord: (recordId: string) => void;
  updateProfile: (profile: StudentProfile) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addMultipleSubjects: (subjects: Omit<Subject, 'id'>[]) => void;
  editSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  setAllSubjectsTargetGoal: (targetPercentage: number) => void;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  editTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (id: string) => void;
  toggleTheme: () => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  showToast: (
    message: string,
    undoAction?: () => void,
    type?: 'info' | 'success' | 'warning' | 'error'
  ) => void;
  hideToast: () => void;
  triggerConfetti: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<StudentProfile>(loadProfile);
  const [subjects, setSubjectsState] = useState<Subject[]>(loadSubjects);
  const [timetable, setTimetableState] = useState<TimetableSlot[]>(loadTimetable);
  const [records, setRecordsState] = useState<AttendanceRecord[]>(loadRecords);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISOString());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('attendai_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : 'light';
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({ show: false, message: '' });

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('attendai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (
    message: string,
    undoAction?: () => void,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setSnackbar({ show: true, message, undoAction, type });
  };

  const hideToast = () => {
    setSnackbar((prev) => ({ ...prev, show: false }));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn('Confetti failed to trigger', e);
    }
  };

  // Helper to persist profile
  const updateProfile = (newProfile: StudentProfile) => {
    setProfileState(newProfile);
    saveProfile(newProfile);
    showToast('Student profile updated', undefined, 'success');
  };

  // Subjects CRUD
  const addSubject = (newSub: Omit<Subject, 'id'>) => {
    const created: Subject = { ...newSub, id: `sub-${Date.now()}` };
    const updated = [...subjects, created];
    setSubjectsState(updated);
    saveSubjects(updated);
    showToast(`Added subject: ${created.name}`, undefined, 'success');
  };

  const addMultipleSubjects = (newSubs: Omit<Subject, 'id'>[]) => {
    const createdList: Subject[] = newSubs.map((s, idx) => ({
      ...s,
      id: `sub-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    const updated = [...subjects, ...createdList];
    setSubjectsState(updated);
    saveSubjects(updated);
    showToast(`Added ${createdList.length} custom subjects`, undefined, 'success');
  };

  const editSubject = (updatedSub: Subject) => {
    const updated = subjects.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    setSubjectsState(updated);
    saveSubjects(updated);
    showToast(`Updated subject: ${updatedSub.name}`, undefined, 'success');
  };

  const setAllSubjectsTargetGoal = (targetPct: number) => {
    const updated = subjects.map((s) => ({ ...s, targetPercentage: targetPct }));
    setSubjectsState(updated);
    saveSubjects(updated);
    showToast(`Updated target goal to ${targetPct}% for all subjects`, undefined, 'success');
  };

  const deleteSubject = (id: string) => {
    const deletedSub = subjects.find((s) => s.id === id);
    const updatedSubjects = subjects.filter((s) => s.id !== id);
    const updatedTimetable = timetable.filter((s) => s.subjectId !== id);
    const updatedRecords = records.filter((r) => r.subjectId !== id);

    setSubjectsState(updatedSubjects);
    saveSubjects(updatedSubjects);
    setTimetableState(updatedTimetable);
    saveTimetable(updatedTimetable);
    setRecordsState(updatedRecords);
    saveRecords(updatedRecords);

    showToast(`Deleted ${deletedSub?.name || 'subject'}`, undefined, 'warning');
  };

  // Timetable CRUD
  const addTimetableSlot = (newSlot: Omit<TimetableSlot, 'id'>) => {
    const created: TimetableSlot = { ...newSlot, id: `slot-${Date.now()}` };
    const updated = [...timetable, created];
    setTimetableState(updated);
    saveTimetable(updated);
    showToast('Added class slot to weekly timetable', undefined, 'success');
  };

  const editTimetableSlot = (updatedSlot: TimetableSlot) => {
    const updated = timetable.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));
    setTimetableState(updated);
    saveTimetable(updated);
    showToast('Updated timetable class slot', undefined, 'success');
  };

  const deleteTimetableSlot = (id: string) => {
    const updated = timetable.filter((s) => s.id !== id);
    setTimetableState(updated);
    saveTimetable(updated);
    showToast('Removed class slot from timetable', undefined, 'info');
  };

  // Attendance Marking with Undo capability!
  const markAttendance = (
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    slotId?: string,
    note?: string
  ) => {
    const existingIndex = records.findIndex(
      (r) => r.subjectId === subjectId && r.date === date && (slotId ? r.timetableSlotId === slotId : true)
    );

    const oldRecord = existingIndex >= 0 ? { ...records[existingIndex] } : null;

    let updatedRecords: AttendanceRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...records];
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        status,
        note: note !== undefined ? note : updatedRecords[existingIndex].note,
        timestamp: Date.now(),
      };
    } else {
      const newRecord: AttendanceRecord = {
        id: `rec-${date}-${subjectId}-${slotId || Date.now()}`,
        date,
        subjectId,
        timetableSlotId: slotId,
        status,
        note,
        timestamp: Date.now(),
      };
      updatedRecords = [newRecord, ...records];
    }

    setRecordsState(updatedRecords);
    saveRecords(updatedRecords);

    // Undo action handler
    const undoAction = () => {
      let reverted: AttendanceRecord[];
      if (oldRecord) {
        reverted = records.map((r) => (r.id === oldRecord.id ? oldRecord : r));
      } else {
        reverted = records.filter(
          (r) => !(r.subjectId === subjectId && r.date === date && (slotId ? r.timetableSlotId === slotId : true))
        );
      }
      setRecordsState(reverted);
      saveRecords(reverted);
      showToast('Attendance marking undone', undefined, 'info');
    };

    const statusLabel =
      status === 'present'
        ? 'Present ✅'
        : status === 'absent'
        ? 'Absent ❌'
        : status === 'cancelled'
        ? 'Cancelled 🚫'
        : 'Extra Class 🌟';

    const sub = subjects.find((s) => s.id === subjectId);
    showToast(`Marked ${sub?.code || 'Class'} as ${statusLabel}`, undoAction, 'success');

    if (status === 'present') {
      const subStats = calculateSubjectStats(sub || subjects[0], updatedRecords, timetable, profile);
      if (subStats.attendancePercentage >= subStats.targetPercentage && subStats.presentCount >= 10) {
        triggerConfetti();
      }
    }
  };

  const bulkMarkDayAttendance = (date: string, status: AttendanceStatus) => {
    const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(date);
    const dayName = dayOfWeekNames[d.getDay() === 0 ? 6 : d.getDay() - 1];

    const daySlots = timetable.filter((s) => s.day === dayName);
    if (daySlots.length === 0) {
      showToast(`No scheduled classes on ${date}`, undefined, 'warning');
      return;
    }

    const previousRecords = [...records];
    const newRecords = [...records];

    for (const slot of daySlots) {
      const existingIdx = newRecords.findIndex((r) => r.date === date && r.timetableSlotId === slot.id);
      if (existingIdx >= 0) {
        newRecords[existingIdx] = {
          ...newRecords[existingIdx],
          status,
          timestamp: Date.now(),
        };
      } else {
        newRecords.push({
          id: `rec-${date}-${slot.subjectId}-${slot.id}`,
          date,
          subjectId: slot.subjectId,
          timetableSlotId: slot.id,
          status,
          timestamp: Date.now(),
        });
      }
    }

    setRecordsState(newRecords);
    saveRecords(newRecords);

    const undoAction = () => {
      setRecordsState(previousRecords);
      saveRecords(previousRecords);
      showToast('Bulk marking undone', undefined, 'info');
    };

    showToast(`Marked all ${daySlots.length} classes for ${date} as ${status}`, undoAction, 'success');
  };

  const deleteAttendanceRecord = (recordId: string) => {
    const target = records.find((r) => r.id === recordId);
    if (!target) return;

    const previous = [...records];
    const updated = records.filter((r) => r.id !== recordId);
    setRecordsState(updated);
    saveRecords(updated);

    const undoAction = () => {
      setRecordsState(previous);
      saveRecords(previous);
    };

    showToast('Attendance record deleted', undoAction, 'info');
  };

  const loadDemoData = () => {
    resetToDemoData();
    setProfileState(loadProfile());
    setSubjectsState(loadSubjects());
    setTimetableState(loadTimetable());
    setRecordsState(loadRecords());
    showToast('Loaded Engineering Demo Data', undefined, 'success');
  };

  const clearAllData = () => {
    storageClearAllData();
    setProfileState(loadProfile());
    setSubjectsState([]);
    setTimetableState([]);
    setRecordsState([]);
    showToast('Cleared all attendance data', undefined, 'warning');
  };

  // Derived calculations
  const subjectStats = useMemo(() => {
    return subjects.map((s) => calculateSubjectStats(s, records, timetable, profile));
  }, [subjects, records, timetable, profile]);

  const overallStats = useMemo(() => {
    return calculateOverallStats(subjects, records, timetable, profile);
  }, [subjects, records, timetable, profile]);

  const smartInsights = useMemo(() => {
    return generateSmartInsights(subjects, subjectStats, records, timetable);
  }, [subjects, subjectStats, records, timetable]);

  return (
    <AttendanceContext.Provider
      value={{
        profile,
        subjects,
        timetable,
        records,
        theme,
        selectedDate,
        snackbar,
        subjectStats,
        overallStats,
        smartInsights,
        setSelectedDate,
        markAttendance,
        bulkMarkDayAttendance,
        deleteAttendanceRecord,
        updateProfile,
        addSubject,
        addMultipleSubjects,
        editSubject,
        deleteSubject,
        setAllSubjectsTargetGoal,
        addTimetableSlot,
        editTimetableSlot,
        deleteTimetableSlot,
        toggleTheme,
        loadDemoData,
        clearAllData,
        showToast,
        hideToast,
        triggerConfetti,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
