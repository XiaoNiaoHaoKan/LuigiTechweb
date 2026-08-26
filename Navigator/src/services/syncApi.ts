type SyncParticipant = {
  name: string;
  joinedAt?: string;
  lastSeen?: string;
};

type SyncRequest = {
  studentName: string;
  stepIndex: number;
  itemId?: string;
  requestType: string;
  requestedDuration?: string;
  requestedLanguageLevel?: string;
  createdAt?: string;
};

type SyncQuizQuestion = {
  question: string;
  answers: string[];
  correctIndex?: number;
};

type SyncVisit = {
  _id: string;
  title: string;
  syncCode: string;
  active: boolean;
  currentIndex: number;
  isPlaying: boolean;
  quizOpen: boolean;
  sequence: Array<{
    itemId: {
      _id: string;
      title: string;
      text: string;
      duration?: number | string;
      languageLevel?: string;
      room?: string;
    };
    order: number;
  }>;
  participants: SyncParticipant[];
  requests: SyncRequest[];
  quiz: SyncQuizQuestion[];
  quizAnswers?: Array<{
    studentName: string;
    answers: number[];
    score: number;
  }>;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function sendJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function encodeCode(code: string) {
  return encodeURIComponent(code.trim());
}

export const syncApi = {
  getVisit(code: string): Promise<SyncVisit> {
    return getJson<SyncVisit>(`/api/visits/sync/${encodeCode(code)}`);
  },

  activateVisit(code: string): Promise<SyncVisit> {
    return sendJson<SyncVisit>(
      `/api/visits/sync/${encodeCode(code)}/activate`,
      "PUT"
    );
  },

  joinVisit(code: string, studentName: string): Promise<SyncVisit> {
    return sendJson<SyncVisit>(
      `/api/visits/sync/${encodeCode(code)}/join`,
      "POST",
      { studentName }
    );
  },

  updateState(
    code: string,
    payload: {
      currentIndex?: number;
      isPlaying?: boolean;
    }
  ): Promise<SyncVisit> {
    return sendJson<SyncVisit>(
      `/api/visits/sync/${encodeCode(code)}/state`,
      "PUT",
      payload
    );
  },

  createRequest(
    code: string,
    payload: {
      studentName: string;
      stepIndex: number;
      itemId?: string;
      requestType: string;
      requestedDuration?: string;
      requestedLanguageLevel?: string;
    }
  ): Promise<SyncVisit> {
    return sendJson<SyncVisit>(
      `/api/visits/sync/${encodeCode(code)}/request`,
      "POST",
      payload
    );
  },

  setQuizOpen(code: string, quizOpen: boolean): Promise<SyncVisit> {
    return sendJson<SyncVisit>(
      `/api/visits/sync/${encodeCode(code)}/quiz`,
      "PUT",
      { quizOpen }
    );
  },

  submitQuizAnswer(
    code: string,
    payload: {
      studentName: string;
      answers: number[];
    }
  ): Promise<{
    studentName: string;
    score: number;
    total: number;
  }> {
    return sendJson(
      `/api/visits/sync/${encodeCode(code)}/quiz-answer`,
      "POST",
      payload
    );
  }
};

export type { SyncVisit, SyncParticipant, SyncRequest, SyncQuizQuestion };