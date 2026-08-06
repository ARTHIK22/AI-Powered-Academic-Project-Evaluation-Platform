"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { teacherApi, type TeacherProjectDetail } from "@/lib/api";
import { ScoreRing, ScoreBar } from "@/components/ui/ScoreRing";
import { VivaQuestionsPanel } from "@/components/ui/VivaQuestionsPanel";

export default function TeacherReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<TeacherProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "viva" | "marks" | "review">("overview");

  // Teacher review form state
  const [comments, setComments]   = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [adjMarks, setAdjMarks]   = useState<Record<string, number>>({});

  useEffect(() => {
    teacherApi.getProject(Number(id))
      .then((d) => {
        setData(d);
        if (d.evaluation?.teacher_comments) setComments(d.evaluation.teacher_comments);
        if (d.evaluation?.teacher_final_score != null) setFinalScore(String(d.evaluation.teacher_final_score));
        if (d.evaluation?.teacher_adjusted_marks) {
          const adj: Record<string, number> = {};
          for (const [k, v] of Object.entries(d.evaluation.teacher_adjusted_marks || {})) {
            adj[k] = (v as { score: number }).score;
          }
          setAdjMarks(adj);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const adjusted: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(adjMarks)) {
        const max = (data?.evaluation?.predicted_marks as Record<string, { max: number }>)?.[k]?.max ?? 100;
        adjusted[k] = { score: v, max, justification: "Teacher adjusted" };
      }
      await teacherApi.review(Number(id), {
        adjusted_marks: Object.keys(adjusted).length ? adjusted : undefined,
        teacher_comments: comments || undefined,
        final_score: finalScore ? Number(finalScore) : undefined,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try { await teacherApi.exportPdf(Number(id)); }
    finally { setExporting(false); }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p style={{ color: "var(--text-muted)" }}>Loading project...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: "var(--text-muted)" }}>Project not found.</p>
      </div>
    );
  }

  const ev = data.evaluation;
  const TABS = [
    { id: "overview" as const, label: "Overview",  icon: "📊" },
    { id: "marks"    as const, label: "Marks",      icon: "🎯" },
    { id: "viva"     as const, label: "Viva Qs",    icon: "🎤" },
    { id: "review"   as const, label: "My Review",  icon: "✏️" },
  ];

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm mb-3 flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to Projects
          </button>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
            {data.title}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            By <strong>{data.student.name}</strong> · {data.student.department ?? data.student.email}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {ev?.difficulty_level && (
              <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                📈 {ev.difficulty_level}
              </span>
            )}
            {ev?.is_clone === false && (
              <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                💡 Original
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary"
            disabled={exporting}
          >
            {exporting ? "Generating..." : "⬇️ Export PDF"}
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : saved ? "✅ Saved!" : "💾 Save Review"}
          </button>
        </div>
      </div>

      {/* Score summary */}
      {ev && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-6 justify-center">
            <ScoreRing score={ev.scores?.report ?? 0}        label="Report"        size={100} />
            <ScoreRing score={ev.scores?.code ?? 0}          label="Code"          size={100} color="#8b5cf6" />
            <ScoreRing score={ev.scores?.documentation ?? 0} label="Docs"          size={100} color="#f59e0b" />
            <ScoreRing score={ev.scores?.innovation ?? 0}    label="Innovation"    size={100} color="#10b981" />
            <ScoreRing score={ev.scores?.presentation ?? 0}  label="Presentation"  size={100} color="#a78bfa" />
          </div>
          {ev.converted_percentage != null && (
            <div className="text-center mt-4">
              <p className="font-display font-black text-4xl gradient-text">
                {ev.converted_percentage.toFixed(1)}%
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                AI Predicted Overall
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.04)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={
              activeTab === t.id
                ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }
                : { color: "var(--text-muted)" }
            }
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && ev && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          {ev.overall_feedback && (
            <div className="glass-card rounded-2xl p-6 md:col-span-2">
              <h3 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>💬 AI Feedback</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>{ev.overall_feedback}</p>
            </div>
          )}
          {ev.strengths && ev.strengths.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <h3 className="font-bold mb-3 text-green-400">✅ Strengths</h3>
              {ev.strengths.map((s, i) => <p key={i} className="text-sm py-0.5" style={{ color: "var(--text-secondary)" }}>• {s}</p>)}
            </div>
          )}
          {ev.weaknesses && ev.weaknesses.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <h3 className="font-bold mb-3 text-yellow-400">⚠️ Weaknesses</h3>
              {ev.weaknesses.map((w, i) => <p key={i} className="text-sm py-0.5" style={{ color: "var(--text-secondary)" }}>• {w}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Marks tab */}
      {activeTab === "marks" && ev?.predicted_marks && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
              🎯 AI Predicted vs. Your Adjustments
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Edit the right column to adjust marks</p>
          </div>
          <table className="table-base">
            <thead>
              <tr>
                <th>Criterion</th>
                <th>AI Score</th>
                <th>Max</th>
                <th>Your Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ev.predicted_marks).map(([criterion, d]) => (
                <tr key={criterion}>
                  <td className="font-semibold" style={{ color: "var(--text-primary)" }}>{criterion}</td>
                  <td style={{ color: "#818cf8" }}>{d.score}</td>
                  <td style={{ color: "var(--text-muted)" }}>{d.max}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={d.max}
                      className="input-field w-20 text-center"
                      style={{ padding: "0.375rem 0.5rem" }}
                      value={adjMarks[criterion] ?? d.score}
                      onChange={(e) =>
                        setAdjMarks({ ...adjMarks, [criterion]: Number(e.target.value) })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-2">
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>AI Total: {ev.total_predicted} / {ev.total_max}</p>
              <p className="font-bold gradient-text">
                Your Total: {Object.values(adjMarks).reduce((a, b) => a + b, ev.total_predicted ?? 0) - (ev.total_predicted ?? 0) + Object.values(adjMarks).reduce((a, b) => a + b, 0) === 0
                  ? ev.total_predicted
                  : Object.values(adjMarks).reduce((a, b) => a + b, 0)
                } / {ev.total_max}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Viva tab */}
      {activeTab === "viva" && ev?.viva_questions && (
        <div className="animate-fade-in">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Use these questions during the viva examination.
          </p>
          <VivaQuestionsPanel questions={ev.viva_questions} />
        </div>
      )}

      {/* Review tab */}
      {activeTab === "review" && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in space-y-6">
          <h3 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
            ✏️ Your Review
          </h3>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
              COMMENTS / FEEDBACK FOR STUDENT
            </label>
            <textarea
              id="teacher-comments"
              rows={6}
              className="input-field"
              placeholder="Write your feedback here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
              FINAL SCORE (OPTIONAL — OVERRIDES AI PREDICTION)
            </label>
            <input
              id="final-score"
              type="number"
              min={0}
              max={100}
              className="input-field max-w-xs"
              placeholder="e.g. 85"
              value={finalScore}
              onChange={(e) => setFinalScore(e.target.value)}
            />
          </div>

          {saved && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}
            >
              ✅ Review saved successfully! The student can now see your feedback.
            </div>
          )}

          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "💾 Save Review"}
          </button>
        </div>
      )}
    </div>
  );
}
