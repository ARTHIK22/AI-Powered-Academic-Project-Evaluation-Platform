"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { studentApi, type EvaluationResult } from "@/lib/api";
import { ScoreRing, ScoreBar } from "@/components/ui/ScoreRing";
import { VivaQuestionsPanel } from "@/components/ui/VivaQuestionsPanel";

type Tab = "overview" | "code" | "viva" | "marks" | "suggestions";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const justSubmitted = params.get("submitted") === "1";

  const [data, setData]   = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [exporting, setExporting] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await studentApi.getResults(Number(id));
      setData(res);
      return res;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchResults().then((res) => {
      setLoading(false);
      if (!res || res.status === "pending" || res.status === "processing") {
        setPolling(true);
      }
    });
  }, [id]);

  // Poll while processing
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      const res = await fetchResults();
      if (res && res.status !== "pending" && res.status !== "processing") {
        setPolling(false);
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [polling]);

  const handleExport = async () => {
    setExporting(true);
    try { await studentApi.exportPdf(Number(id)); }
    finally { setExporting(false); }
  };

  const TABS: Array<{ id: Tab; label: string; icon: string }> = [
    { id: "overview",    label: "Overview",     icon: "📊" },
    { id: "marks",       label: "Marks",        icon: "🎯" },
    { id: "code",        label: "Code Analysis", icon: "💻" },
    { id: "viva",        label: "Viva Qs",      icon: "🎤" },
    { id: "suggestions", label: "Suggestions",  icon: "🚀" },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin-slow">⚙️</div>
          <p className="font-display font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>
            Loading Evaluation...
          </p>
        </div>
      </div>
    );
  }

  if (!data || (data.status === "pending" || data.status === "processing")) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="glass-card rounded-3xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">🤖</div>
          <h2 className="font-display font-bold text-2xl mb-3" style={{ color: "var(--text-primary)" }}>
            {justSubmitted ? "Project Submitted!" : "Evaluation in Progress"}
          </h2>
          <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
            Our AI is analyzing your project. This usually takes 30–60 seconds.
            This page will refresh automatically.
          </p>
          <div className="flex justify-center gap-2">
            {[0,1,2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: "#6366f1",
                  animation: `bounce 1.4s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
          <style jsx>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
              40% { transform: translateY(-10px); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  const scores = data.scores;
  const ev = data;

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
            {ev.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {ev.difficulty_level && (
              <span className="badge" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" }}>
                📈 {ev.difficulty_level}
              </span>
            )}
            {ev.is_clone === false && (
              <span className="badge" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}>
                💡 Original Project
              </span>
            )}
            {ev.teacher_final_score != null && (
              <span className="badge" style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
                👨‍🏫 Teacher Reviewed
              </span>
            )}
          </div>
        </div>
        <button
          id="export-pdf"
          className="btn-secondary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Generating..." : "⬇️ Export PDF"}
        </button>
      </div>

      {/* Score rings */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        <div className="flex flex-wrap gap-8 justify-center">
          <ScoreRing score={scores.report ?? 0}        label="Report"        size={110} />
          <ScoreRing score={scores.code ?? 0}          label="Code Quality"  size={110} color="#8b5cf6" />
          <ScoreRing score={scores.documentation ?? 0} label="Documentation" size={110} color="#f59e0b" />
          <ScoreRing score={scores.innovation ?? 0}    label="Innovation"    size={110} color="#10b981" />
          <ScoreRing score={scores.presentation ?? 0}  label="Presentation"  size={110} color="#a78bfa" />
        </div>

        {ev.converted_percentage != null && (
          <div className="mt-6 text-center">
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
              OVERALL PREDICTED SCORE
            </p>
            <p className="font-display font-black text-5xl gradient-text">
              {ev.converted_percentage.toFixed(1)}%
            </p>
            {ev.total_predicted != null && ev.total_max != null && (
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {ev.total_predicted} / {ev.total_max} marks
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
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

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          {/* Overall feedback */}
          {ev.overall_feedback && (
            <div className="glass-card rounded-2xl p-6 md:col-span-2">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                💬 AI Feedback
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
                {ev.overall_feedback}
              </p>
            </div>
          )}

          {/* Strengths */}
          {ev.strengths && ev.strengths.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <h3 className="font-bold mb-3 text-green-400">✅ Strengths</h3>
              <ul className="space-y-2">
                {ev.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="text-green-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {ev.weaknesses && ev.weaknesses.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <h3 className="font-bold mb-3 text-yellow-400">⚠️ Areas to Improve</h3>
              <ul className="space-y-2">
                {ev.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="text-yellow-400 mt-0.5">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing sections */}
          {ev.missing_sections && ev.missing_sections.length > 0 && (
            <div className="rounded-2xl p-6 md:col-span-2" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <h3 className="font-bold mb-3 text-red-400">❌ Missing Sections</h3>
              <div className="flex flex-wrap gap-2">
                {ev.missing_sections.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Teacher comment */}
          {ev.teacher_comments && (
            <div className="glass-card rounded-2xl p-6 md:col-span-2">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#a78bfa" }}>
                👨‍🏫 Teacher's Comment
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.7" }}>
                {ev.teacher_comments}
              </p>
              {ev.teacher_final_score != null && (
                <p className="mt-3 font-bold text-lg" style={{ color: "#a78bfa" }}>
                  Final Score: {ev.teacher_final_score}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "marks" && ev.predicted_marks && (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--surface-border)" }}>
            <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
              🎯 Predicted Marks Breakdown
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(ev.predicted_marks).map(([criterion, data]) => (
              <div key={criterion}>
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {criterion}
                    </span>
                    {data.justification && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {data.justification}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap ml-4" style={{ color: "#a5b4fc" }}>
                    {data.score} / {data.max}
                  </span>
                </div>
                <ScoreBar label="" score={data.score} max={data.max} />
              </div>
            ))}
            <div
              className="flex justify-between pt-4 border-t mt-4 font-display font-bold text-xl"
              style={{ borderColor: "var(--surface-border)" }}
            >
              <span style={{ color: "var(--text-primary)" }}>TOTAL</span>
              <span className="gradient-text">
                {ev.total_predicted} / {ev.total_max}
                {ev.converted_percentage != null && (
                  <span className="text-sm font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                    ({ev.converted_percentage.toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "code" && ev.code_analysis && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Files", value: ev.code_analysis.total_files ?? "—", icon: "📁" },
              { label: "Total Lines", value: ev.code_analysis.total_lines ?? "—", icon: "📝" },
              { label: "Complexity",  value: ev.code_analysis.complexity ?? "—", icon: "🔄" },
              { label: "Has Tests",   value: ev.code_analysis.has_tests ? "Yes ✅" : "No ❌", icon: "🧪" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-5 text-center">
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>Quality Metrics</h3>
            <ScoreBar label="Naming Conventions"     score={ev.code_analysis.naming_conventions ?? 0}      delay={0} />
            <ScoreBar label="Documentation Coverage" score={ev.code_analysis.documentation_coverage ?? 0}  delay={100} />
            {ev.code_analysis.pylint_score != null && (
              <ScoreBar label="Pylint Score" score={ev.code_analysis.pylint_score} delay={200} />
            )}
          </div>

          {ev.code_analysis.bugs && ev.code_analysis.bugs.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <h3 className="font-bold mb-3 text-red-400">🐛 Potential Bugs</h3>
              {ev.code_analysis.bugs.map((b, i) => (
                <p key={i} className="text-sm py-1" style={{ color: "var(--text-secondary)" }}>• {b}</p>
              ))}
            </div>
          )}

          {ev.code_analysis.security_issues && ev.code_analysis.security_issues.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <h3 className="font-bold mb-3 text-yellow-400">🔒 Security Issues</h3>
              {ev.code_analysis.security_issues.map((s, i) => (
                <p key={i} className="text-sm py-1" style={{ color: "var(--text-secondary)" }}>• {s}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "viva" && ev.viva_questions && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h3 className="font-display font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>
              🎤 Viva Questions
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Prepare for your viva with these AI-generated questions. Click a question to reveal the answer hint.
            </p>
          </div>
          <VivaQuestionsPanel questions={ev.viva_questions} />
        </div>
      )}

      {activeTab === "suggestions" && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <h3 className="font-display font-bold text-xl mb-6" style={{ color: "var(--text-primary)" }}>
            🚀 Improvement Suggestions
          </h3>
          {ev.improvement_suggestions && ev.improvement_suggestions.length > 0 ? (
            <div className="space-y-3">
              {ev.improvement_suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {s}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>No suggestions available.</p>
          )}
        </div>
      )}
    </div>
  );
}
