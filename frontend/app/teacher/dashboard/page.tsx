"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { teacherApi, type TeacherProject } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  pending:    { label: "Pending",    cls: "badge-pending",    icon: "⏳" },
  processing: { label: "Evaluating", cls: "badge-processing", icon: "🔄" },
  evaluated:  { label: "Evaluated",  cls: "badge-evaluated",  icon: "✅" },
  reviewed:   { label: "Reviewed",   cls: "badge-reviewed",   icon: "👨‍🏫" },
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<TeacherProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "evaluated" | "reviewed" | "pending">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    teacherApi.listProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchFilter =
      filter === "all" ? true :
      filter === "evaluated" ? p.status === "evaluated" :
      filter === "reviewed"  ? p.status === "reviewed"  :
      p.status === "pending" || p.status === "processing";
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.student.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total:       projects.length,
    pending:     projects.filter((p) => p.status === "evaluated").length,
    reviewed:    projects.filter((p) => p.status === "reviewed").length,
    avgScore:    projects.filter((p) => p.overall_score != null).length > 0
      ? Math.round(projects.reduce((a, b) => a + (b.overall_score ?? 0), 0) / projects.filter((p) => p.overall_score != null).length)
      : 0,
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
          👨‍🏫 Teacher Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Welcome back, {user?.full_name}. Review AI evaluations and manage your rubrics.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Projects",  value: stats.total,    icon: "📁", color: "#6366f1" },
          { label: "Needs Review",    value: stats.pending,  icon: "📋", color: "#f59e0b" },
          { label: "Reviewed",        value: stats.reviewed, icon: "✅", color: "#10b981" },
          { label: "Avg. Score",      value: `${stats.avgScore}%`, icon: "📊", color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
            >
              {s.icon}
            </div>
            <div>
              <p className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link href="/teacher/rubrics" className="btn-primary">
          📋 Manage Rubrics
        </Link>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="input-field max-w-xs"
          placeholder="Search projects or students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {(["all", "evaluated", "reviewed", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize"
              style={
                filter === f
                  ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }
                  : { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--surface-border)" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Projects table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>No projects found.</div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Project</th>
                <th>Student</th>
                <th>Status</th>
                <th>AI Score</th>
                <th>Difficulty</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={p.id}>
                    <td>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.title}</p>
                    </td>
                    <td>
                      <p style={{ color: "var(--text-secondary)" }}>{p.student.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.student.email}</p>
                    </td>
                    <td><span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span></td>
                    <td>
                      {p.overall_score != null ? (
                        <span className="font-bold" style={{ color: p.overall_score >= 80 ? "#10b981" : p.overall_score >= 60 ? "#f59e0b" : "#ef4444" }}>
                          {p.overall_score.toFixed(1)}%
                        </span>
                      ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td>
                      {p.difficulty_level
                        ? <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{p.difficulty_level}</span>
                        : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                      {new Date(p.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <Link
                        href={`/teacher/review/${p.id}`}
                        className="btn-secondary"
                        style={{ padding: "0.375rem 0.875rem", fontSize: "0.8125rem" }}
                      >
                        {p.teacher_reviewed ? "View" : "Review →"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
