"use client";
import { useEffect, useState } from "react";
import { adminApi, type Analytics } from "@/lib/api";

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.analytics()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p style={{ color: "var(--text-muted)" }}>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
          ⚡ Admin Analytics & Overview
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Monitor user adoption, evaluation statistics, and system usage.
        </p>
      </div>

      {/* Users Stats */}
      <h2 className="font-display font-bold text-xl mb-4" style={{ color: "var(--text-primary)" }}>
        👥 Platform Users
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users",  value: data.users.total,    icon: "👥", color: "#6366f1" },
          { label: "Students",     value: data.users.students, icon: "👨‍🎓", color: "#8b5cf6" },
          { label: "Teachers",     value: data.users.teachers, icon: "👨‍🏫", color: "#10b981" },
          { label: "Admins",       value: data.users.admins,   icon: "⚙️", color: "#f59e0b" },
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

      {/* Submissions & Performance */}
      <h2 className="font-display font-bold text-xl mb-4" style={{ color: "var(--text-primary)" }}>
        📊 Submissions & Evaluation Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Project status breakdown */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Project Statuses</h3>
          <div className="space-y-3">
            {[
              { label: "Evaluated",  value: data.projects.evaluated,  total: data.projects.total, color: "#10b981" },
              { label: "Reviewed",   value: data.projects.reviewed,   total: data.projects.total, color: "#8b5cf6" },
              { label: "Processing", value: data.projects.processing, total: data.projects.total, color: "#6366f1" },
              { label: "Pending",    value: data.projects.pending,    total: data.projects.total, color: "#f59e0b" },
            ].map((st) => (
              <div key={st.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--text-secondary)" }}>{st.label}</span>
                  <span className="font-bold" style={{ color: st.color }}>{st.value}</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${st.total ? (st.value / st.total) * 100 : 0}%`,
                      background: st.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Category Scores */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Average Scores Across Platform</h3>
          <div className="space-y-4">
            {[
              { label: "Overall Score", value: data.average_scores.overall,    color: "#6366f1" },
              { label: "Report Score",  value: data.average_scores.report,     color: "#8b5cf6" },
              { label: "Code Score",    value: data.average_scores.code,       color: "#10b981" },
              { label: "Innovation",    value: data.average_scores.innovation, color: "#f59e0b" },
            ].map((sc) => (
              <div key={sc.label} className="flex justify-between items-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{sc.label}</span>
                <span className="font-display font-black text-xl" style={{ color: sc.color }}>
                  {sc.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="font-display font-bold text-xl mb-4" style={{ color: "var(--text-primary)" }}>
        🕒 Recent Submissions
      </h2>
      <div className="glass-card rounded-2xl overflow-hidden">
        {data.recent_projects.length === 0 ? (
          <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>No submissions recorded yet.</div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_projects.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>#{p.id}</td>
                  <td className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.title}</td>
                  <td>
                    <span className="badge badge-evaluated">{p.status}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {new Date(p.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
