export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

const BASE_URL = 'https://www.googleapis.com/tasks/v1';

async function fetchWithAuth(url: string, accessToken: string, options: RequestInit = {}) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    throw new Error('Google OAuth token expired or unauthorized. Please sign in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Tasks API error: ${response.statusText}`);
  }

  return response;
}

export async function fetchTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const response = await fetchWithAuth(`${BASE_URL}/users/@default/lists`, accessToken);
  const data = await response.json();
  return data.items || [];
}

export async function fetchTasks(accessToken: string, tasklistId: string = '@default'): Promise<GoogleTask[]> {
  const response = await fetchWithAuth(
    `${BASE_URL}/lists/${encodeURIComponent(tasklistId)}/tasks?showCompleted=true&showHidden=true`,
    accessToken
  );
  const data = await response.json();
  return data.items || [];
}

export async function createGoogleTask(
  accessToken: string,
  taskData: { title: string; notes?: string; due?: string },
  tasklistId: string = '@default'
): Promise<GoogleTask> {
  const response = await fetchWithAuth(`${BASE_URL}/lists/${encodeURIComponent(tasklistId)}/tasks`, accessToken, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
  return await response.json();
}

export async function updateGoogleTask(
  accessToken: string,
  taskId: string,
  taskData: { title?: string; notes?: string; status?: 'needsAction' | 'completed'; due?: string },
  tasklistId: string = '@default'
): Promise<GoogleTask> {
  const response = await fetchWithAuth(
    `${BASE_URL}/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    }
  );
  return await response.json();
}

export async function deleteGoogleTask(
  accessToken: string,
  taskId: string,
  tasklistId: string = '@default'
): Promise<void> {
  await fetchWithAuth(
    `${BASE_URL}/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
    accessToken,
    {
      method: 'DELETE',
    }
  );
}
