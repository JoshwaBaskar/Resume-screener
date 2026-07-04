const API_BASE = "/api";

export function getAuthToken(): string | null {
  return localStorage.getItem("screener_auth_token");
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("screener_auth_token", token);
  } else {
    localStorage.removeItem("screener_auth_token");
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { error: text || "Unknown network error" };
  }

  if (!response.ok) {
    throw new Error(data.error || `Server responded with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload: any) => request("/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: any) => request("/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/me"),
  logout: () => {
    setAuthToken(null);
    return Promise.resolve();
  },

  // Candidate Resume
  uploadResume: (resumeText: string, fileName: string) =>
    request("/uploadResume", { method: "POST", body: JSON.stringify({ resumeText, fileName }) }),
  getResume: () => request("/resume"),
  deleteResume: () => request("/resume", { method: "DELETE" }),
  updateResume: (payload: any) => request("/resume", { method: "PUT", body: JSON.stringify(payload) }),

  // Recruiter Jobs
  createJob: (payload: any) => request("/jobs", { method: "POST", body: JSON.stringify(payload) }),
  fetchJobs: () => request("/jobs"),
  deleteJob: (jobId: string) => request(`/job/${jobId}`, { method: "DELETE" }),
  updateJob: (jobId: string, payload: any) => request(`/job/${jobId}`, { method: "PUT", body: JSON.stringify(payload) }),

  // Matching
  triggerMatch: (resumeId: string, jobId: string) =>
    request("/match", { method: "POST", body: JSON.stringify({ resumeId, jobId }) }),
  fetchTopCandidates: (jobId: string) => request(`/topCandidates?jobId=${jobId}`),
  updateMatchStatus: (reportId: string, status: string) =>
    request("/match/status", { method: "POST", body: JSON.stringify({ reportId, status }) }),
  fetchRanking: () => request("/ranking"),

  // AI Features
  generateInterview: (resumeId: string, jobId: string) =>
    request("/generate-interview", { method: "POST", body: JSON.stringify({ resumeId, jobId }) }),
  careerAdvice: (resumeId: string, jobId: string) =>
    request("/career-advice", { method: "POST", body: JSON.stringify({ resumeId, jobId }) }),
  generateCoverLetter: (resumeId: string, jobId: string) =>
    request("/cover-letter", { method: "POST", body: JSON.stringify({ resumeId, jobId }) }),
  generateEmail: (reportId: string, interviewDetails: string) =>
    request("/email-generator", { method: "POST", body: JSON.stringify({ reportId, interviewDetails }) }),
  chatBot: (query: string, history: any[]) =>
    request("/recruiter-chatbot", { method: "POST", body: JSON.stringify({ query, history }) }),
  bulkUpload: (resumesList: { name: string; text: string; fileName: string }[]) =>
    request("/bulk-upload", { method: "POST", body: JSON.stringify({ resumesList }) }),

  // Notifications
  fetchNotifications: () => request("/notifications"),
  markNotificationsAsRead: () => request("/notifications/read", { method: "POST" }),
};
