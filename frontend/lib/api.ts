/**
 * ProjectSense AI — API Client
 * Centralized Axios-style fetch wrapper for all backend calls.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ps_token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  // Return raw Response for blob downloads
  if (res.headers.get("Content-Type")?.includes("application/pdf")) {
    return res as unknown as T;
  }

  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
  }) => apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) => {
    const form = new URLSearchParams({ username: email, password });
    return apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: form.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  me: () => apiFetch<UserProfile>("/api/auth/me"),
};

// ── Student ─────────────────────────────────────────────────────────────────
export const studentApi = {
  submit: (formData: FormData) =>
    apiFetch<SubmitResponse>("/api/student/submit", { method: "POST", body: formData }),

  listProjects: () => apiFetch<ProjectSummary[]>("/api/student/projects"),

  getResults: (id: number) => apiFetch<EvaluationResult>(`/api/student/results/${id}`),

  exportPdf: async (id: number): Promise<void> => {
    const res = await apiFetch<Response>(`/api/student/export/${id}`);
    const blob = await (res as unknown as Response).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ── Teacher ──────────────────────────────────────────────────────────────────
export const teacherApi = {
  listProjects: () => apiFetch<TeacherProject[]>("/api/teacher/projects"),
  getProject: (id: number) => apiFetch<TeacherProjectDetail>(`/api/teacher/projects/${id}`),
  review: (id: number, data: ReviewPayload) =>
    apiFetch(`/api/teacher/review/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  listRubrics: () => apiFetch<Rubric[]>("/api/teacher/rubrics"),
  createRubric: (data: RubricPayload) =>
    apiFetch("/api/teacher/rubrics", { method: "POST", body: JSON.stringify(data) }),
  updateRubric: (id: number, data: RubricPayload) =>
    apiFetch(`/api/teacher/rubrics/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteRubric: (id: number) =>
    apiFetch(`/api/teacher/rubrics/${id}`, { method: "DELETE" }),
  exportPdf: async (id: number): Promise<void> => {
    const res = await apiFetch<Response>(`/api/teacher/export/${id}`);
    const blob = await (res as unknown as Response).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  listUsers: () => apiFetch<AdminUser[]>("/api/admin/users"),
  updateUser: (id: number, data: Partial<AdminUser>) =>
    apiFetch(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: number) => apiFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
  analytics: () => apiFetch<Analytics>("/api/admin/analytics"),
};

// ── Types ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  department?: string;
  is_active: boolean;
}

export interface ProjectSummary {
  id: number;
  title: string;
  status: "pending" | "processing" | "evaluated" | "reviewed";
  submitted_at: string;
  has_report: boolean;
  has_code: boolean;
  has_ppt: boolean;
}

export interface SubmitResponse {
  project_id: number;
  status: string;
  message: string;
}

export interface EvaluationResult {
  project_id: number;
  title: string;
  status: string;
  scores: {
    report: number | null;
    code: number | null;
    documentation: number | null;
    innovation: number | null;
    presentation: number | null;
  };
  predicted_marks: Record<string, { score: number; max: number; justification: string }> | null;
  total_predicted: number | null;
  total_max: number | null;
  converted_percentage: number | null;
  difficulty_level: string | null;
  is_clone: boolean | null;
  overall_feedback: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  missing_sections: string[] | null;
  improvement_suggestions: string[] | null;
  viva_questions: {
    basic: Array<{ question: string; expected_answer_hint?: string }>;
    intermediate: Array<{ question: string; expected_answer_hint?: string }>;
    advanced: Array<{ question: string; expected_answer_hint?: string }>;
  } | null;
  code_analysis: {
    complexity?: string;
    naming_conventions?: number;
    documentation_coverage?: number;
    bugs?: string[];
    security_issues?: string[];
    folder_structure?: string;
    total_files?: number;
    total_lines?: number;
    has_tests?: boolean;
    pylint_score?: number;
  } | null;
  teacher_comments?: string;
  teacher_final_score?: number;
}

export interface TeacherProject {
  id: number;
  title: string;
  student: { id: number; name: string; email: string; department?: string };
  status: string;
  submitted_at: string;
  overall_score: number | null;
  difficulty_level: string | null;
  teacher_reviewed: boolean;
}

export interface TeacherProjectDetail extends TeacherProject {
  description?: string;
  github_url?: string;
  has_report: boolean;
  has_code: boolean;
  has_ppt: boolean;
  evaluation: EvaluationResult["scores"] extends infer S ? {
    scores: S;
    predicted_marks: EvaluationResult["predicted_marks"];
    total_predicted: number | null;
    total_max: number | null;
    converted_percentage: number | null;
    difficulty_level: string | null;
    is_clone: boolean | null;
    overall_feedback: string | null;
    strengths: string[] | null;
    weaknesses: string[] | null;
    missing_sections: string[] | null;
    improvement_suggestions: string[] | null;
    viva_questions: EvaluationResult["viva_questions"];
    code_analysis: EvaluationResult["code_analysis"];
    teacher_adjusted_marks: EvaluationResult["predicted_marks"];
    teacher_comments: string | null;
    teacher_final_score: number | null;
  } : never;
}

export interface ReviewPayload {
  adjusted_marks?: Record<string, unknown>;
  teacher_comments?: string;
  final_score?: number;
}

export interface Rubric {
  id: number;
  name: string;
  description?: string;
  is_default: boolean;
  total_marks: number;
  criteria: Array<{ name: string; max_marks: number; description?: string }>;
  created_at: string;
}

export interface RubricPayload {
  name: string;
  description?: string;
  is_default: boolean;
  criteria: Array<{ name: string; max_marks: number; description?: string }>;
  total_marks: number;
}

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface Analytics {
  users: { total: number; students: number; teachers: number; admins: number };
  projects: { total: number; pending: number; processing: number; evaluated: number; reviewed: number };
  average_scores: { report: number; code: number; innovation: number; overall: number };
  difficulty_distribution: Record<string, number>;
  recent_projects: Array<{ id: number; title: string; status: string; submitted_at: string }>;
}
