"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { studentApi, type ProjectSummary } from "@/lib/api";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    cls: "badge-pending",    icon: "⏳" },
  processing: { label: "Processing", cls: "badge-processing", icon: "🔄" },
  evaluated:  { label: "Evaluated",  cls: "badge-evaluated",  icon: "✅" },
  reviewed:   { label: "Reviewed",   cls: "badge-reviewed",   icon: "👨‍🏫" },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentApi.listProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Poll while any project is processing
    const interval = setInterval(async () => {
      const ps = await studentApi.listProjects().catch(() => []);
      setProjects(ps);
      if (!ps.some((p) => p.status === "processing" || p.status === "pending")) {
        clearInterval(interval);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total:     projects.length,
    evaluated: projects.filter((p) => p.status === "evaluated" || p.status === "reviewed").length,
    pending:   projects.filter((p) => p.status === "pending" || p.status === "processing").length,
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
          👋 Welcome, {user?.full_name?.split(" ")[0]}!
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Track your project submissions and evaluation results here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Submissions", value: stats.total, icon: "📁", color: "#6366f1" },
          { label: "Evaluated",         value: stats.evaluated, icon: "✅", color: "#10b981" },
          { label: "In Progress",       value: stats.pending,   icon: "⏳", color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
            >
              {s.icon}
            </div>
            <div>
              <p
                className="font-display font-black text-3xl"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mb-8">
        <Link href="/student/submit" className="btn-primary">
          📤 Submit New Project
        </Link>
      </div>

      {/* Projects list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: "var(--surface-border)" }}>
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            My Submissions
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
            Loading your projects...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-4">📂</p>
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No projects yet</p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Submit your first project to get an AI evaluation.
            </p>
            <Link href="/student/submit" className="btn-primary">
              Submit Project
            </Link>
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Files</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={p.id}>
                    <td>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {p.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        #{p.id}
                      </p>
                    </td>
                    <td>
                      <span className={`badge ${cfg.cls}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {new Date(p.submitted_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        {p.has_report && <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>📄</span>}
                        {p.has_code   && <span className="badge" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>💻</span>}
                        {p.has_ppt    && <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>📊</span>}
                      </div>
                    </td>
                    <td>
                      {p.status === "evaluated" || p.status === "reviewed" ? (
                        <Link
                          href={`/student/results/${p.id}`}
                          className="btn-primary"
                          style={{ padding: "0.375rem 1rem", fontSize: "0.8125rem" }}
                        >
                          View Results →
                        </Link>
                      ) : p.status === "processing" ? (
                        <span className="flex items-center gap-2 text-sm" style={{ color: "#818cf8" }}>
                          <span className="animate-spin">⟳</span> Evaluating...
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Queued</span>
                      )}
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
