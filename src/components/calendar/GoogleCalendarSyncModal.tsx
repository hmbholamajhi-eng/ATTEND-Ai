import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import {
  createCalendarEvent,
  fetchUpcomingCalendarEvents,
  getNextDateForDay,
  GoogleCalendarEvent,
} from '../../services/googleCalendarService';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accessToken, signInWithGoogle } = useAuth();
  const { timetable, subjects, showToast } = useAttendance();

  const [loading, setLoading] = useState(false);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number>(10);
  const [upcomingEvents, setUpcomingEvents] = useState<GoogleCalendarEvent[]>([]);
  const [hasFetchedUpcoming, setHasFetchedUpcoming] = useState(false);

  // Confirmation dialog state
  const [showConfirmSync, setShowConfirmSync] = useState(false);

  if (!isOpen) return null;

  const handleFetchUpcoming = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const events = await fetchUpcomingCalendarEvents(accessToken);
      setUpcomingEvents(events);
      setHasFetchedUpcoming(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch calendar events', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeTimetableSync = async () => {
    if (!accessToken || timetable.length === 0) return;

    try {
      setLoading(true);
      setShowConfirmSync(false);

      let createdCount = 0;

      for (const slot of timetable) {
        const sub = subjects.find((s) => s.id === slot.subjectId);
        const subName = sub ? `${sub.name} (${sub.code})` : 'Class Session';

        // Calculate target upcoming date for slot.day
        const classDate = getNextDateForDay(slot.day);
        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);

        const startDate = new Date(classDate);
        startDate.setHours(startH, startM, 0, 0);

        const endDate = new Date(classDate);
        endDate.setHours(endH, endM, 0, 0);

        await createCalendarEvent(accessToken, {
          summary: `[AttendAI] ${subName}`,
          description: `Scheduled Class Slot\nFaculty: ${slot.faculty || 'N/A'}\nRoom: ${
            slot.room || 'N/A'
          }`,
          location: slot.room ? `Room ${slot.room}` : undefined,
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: leadTimeMinutes }],
          },
        });

        createdCount++;
      }

      showToast(`Added ${createdCount} class events to Google Calendar! 📅`, undefined, 'success');
      handleFetchUpcoming();
    } catch (err: any) {
      showToast(err.message || 'Failed to sync with Google Calendar', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Google Calendar Sync
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Schedule your weekly timetable slots directly as events on Google Calendar.
            </p>
          </div>
        </div>

        {!accessToken ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You need to connect your Google Account to enable Google Calendar synchronization.
            </p>
            <button
              onClick={signInWithGoogle}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              Connect Google Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sync Configuration Box */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Timetable Slots Ready: {timetable.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Will schedule events for your upcoming class schedule.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Reminder Lead Time:
                  </label>
                  <select
                    value={leadTimeMinutes}
                    onChange={(e) => setLeadTimeMinutes(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                  >
                    <option value={5}>5 mins before</option>
                    <option value={10}>10 mins before</option>
                    <option value={15}>15 mins before</option>
                    <option value={30}>30 mins before</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowConfirmSync(true)}
                disabled={loading || timetable.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Sync {timetable.length} Classes to Google Calendar</span>
              </button>
            </div>

            {/* Upcoming Calendar Events View */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Upcoming Google Calendar Events
                </h4>
                <button
                  onClick={handleFetchUpcoming}
                  disabled={loading}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{hasFetchedUpcoming ? 'Refresh' : 'Fetch Events'}</span>
                </button>
              </div>

              {hasFetchedUpcoming && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                      No upcoming events found on your Google Calendar.
                    </p>
                  ) : (
                    upcomingEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-between space-x-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {evt.summary}
                          </p>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span>
                                {evt.start.dateTime
                                  ? new Date(evt.start.dateTime).toLocaleString()
                                  : evt.start.date}
                              </span>
                            </span>
                            {evt.location && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-amber-500" />
                                <span>{evt.location}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                            title="View in Google Calendar"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sync Confirmation Dialog */}
        {showConfirmSync && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirm Calendar Sync
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                This will add {timetable.length} class slots from your AttendAI timetable into your Google Calendar for upcoming days, with a {leadTimeMinutes}-minute notification pop-up.
              </p>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowConfirmSync(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeTimetableSync}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  Proceed & Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
