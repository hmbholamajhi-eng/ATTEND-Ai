import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AttendanceRecord, StudentProfile, Subject, TimetableSlot } from '../types';

export interface CloudSyncResult {
  success: boolean;
  message: string;
  syncedAt?: number;
}

/**
 * Syncs local attendance data to Cloud Firestore under /users/{userId}/...
 */
export async function syncLocalToFirestore(
  userId: string,
  profile: StudentProfile,
  subjects: Subject[],
  timetable: TimetableSlot[],
  records: AttendanceRecord[]
): Promise<CloudSyncResult> {
  if (!userId) {
    return { success: false, message: 'User not logged in' };
  }

  try {
    const batch = writeBatch(db);

    // 1. Sync Profile
    const profileRef = doc(db, 'users', userId, 'profile', 'main');
    batch.set(profileRef, {
      ...profile,
      updatedAt: Date.now(),
    });

    // 2. Sync Subjects
    for (const sub of subjects) {
      const subRef = doc(db, 'users', userId, 'subjects', sub.id);
      batch.set(subRef, {
        ...sub,
        updatedAt: Date.now(),
      });
    }

    // 3. Sync Timetable
    for (const slot of timetable) {
      const slotRef = doc(db, 'users', userId, 'timetable', slot.id);
      batch.set(slotRef, {
        ...slot,
        updatedAt: Date.now(),
      });
    }

    // 4. Sync Attendance Records
    for (const rec of records) {
      const recRef = doc(db, 'users', userId, 'records', rec.id);
      batch.set(recRef, {
        ...rec,
        timestamp: rec.timestamp || Date.now(),
      });
    }

    await batch.commit();

    return {
      success: true,
      message: 'Successfully backed up data to Cloud Firestore',
      syncedAt: Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `/users/${userId}`);
  }
}

/**
 * Downloads data from Firestore for signed in user
 */
export async function downloadFromFirestore(userId: string): Promise<{
  profile?: StudentProfile;
  subjects?: Subject[];
  timetable?: TimetableSlot[];
  records?: AttendanceRecord[];
} | null> {
  if (!userId) return null;

  try {
    // Subjects
    const subSnap = await getDocs(collection(db, 'users', userId, 'subjects'));
    const subjects: Subject[] = subSnap.docs.map((d) => d.data() as Subject);

    // Timetable
    const timeSnap = await getDocs(collection(db, 'users', userId, 'timetable'));
    const timetable: TimetableSlot[] = timeSnap.docs.map((d) => d.data() as TimetableSlot);

    // Records
    const recSnap = await getDocs(collection(db, 'users', userId, 'records'));
    const records: AttendanceRecord[] = recSnap.docs.map((d) => d.data() as AttendanceRecord);

    return { subjects, timetable, records };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `/users/${userId}`);
  }
}
