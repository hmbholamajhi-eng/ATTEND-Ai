export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  status?: string;
}

export interface GoogleCalendarEventPayload {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: 'email' | 'popup'; minutes: number }[];
  };
}

const BASE_URL = 'https://www.googleapis.com/calendar/v3';

async function fetchWithAuth(url: string, accessToken: string, options: RequestInit = {}) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    throw new Error('Google OAuth token expired or unauthorized. Please re-authenticate.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Calendar API error: ${response.statusText}`);
  }

  return response;
}

export async function fetchUpcomingCalendarEvents(
  accessToken: string,
  timeMin: string = new Date().toISOString()
): Promise<GoogleCalendarEvent[]> {
  const url = `${BASE_URL}/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&singleEvents=true&orderBy=startTime&maxResults=50`;
  const response = await fetchWithAuth(url, accessToken);
  const data = await response.json();
  return data.items || [];
}

export async function createCalendarEvent(
  accessToken: string,
  payload: GoogleCalendarEventPayload
): Promise<GoogleCalendarEvent> {
  const url = `${BASE_URL}/calendars/primary/events`;
  const response = await fetchWithAuth(url, accessToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return await response.json();
}

export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  const url = `${BASE_URL}/calendars/primary/events/${encodeURIComponent(eventId)}`;
  await fetchWithAuth(url, accessToken, { method: 'DELETE' });
}

/**
 * Helper to calculate upcoming date for a day name (e.g. 'Monday')
 */
export function getNextDateForDay(dayName: string): Date {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIdx = days.findIndex((d) => d.toLowerCase() === dayName.toLowerCase());
  const today = new Date();
  const currentDayIdx = today.getDay();

  let distance = targetDayIdx - currentDayIdx;
  if (distance <= 0) distance += 7;

  const result = new Date(today);
  result.setDate(today.getDate() + distance);
  return result;
}
