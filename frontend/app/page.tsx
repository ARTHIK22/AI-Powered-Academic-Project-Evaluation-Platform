import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProjectSense AI — AI-Powered Academic Project Evaluation",
  description:
    "Evaluate academic projects instantly with AI. Get predicted marks, viva questions, code analysis, and detailed feedback powered by Gemini AI.",
};

const features = [
  {
    icon: "📄",
    title: "Report Evaluation",
    desc: "AI checks grammar, formatting, abstract, methodology, references, and all required sections with precision.",
    color: "#6366f1",
  },
  {
    icon: "💻",
    title: "Code Analysis",
    desc: "Detects bugs, security issues, naming violations, complexity scores, and overall code quality.",
    color: "#8b5cf6",
  },
  {
    icon: "🎤",
    title: "Viva Questions",
    desc: "Generates tiered basic, intermediate, and advanced viva questions tailored to your specific project.",
    color: "#a78bfa",
  },
  {
    icon: "🎯",
    title: "Marks Prediction",
    desc: "Predicts scores across all rubric criteria — documentation, implementation, innovation, and more.",
    color: "#10b981",
  },
  {
    icon: "💡",
    title: "Innovation Detection",
    desc: "Evaluates whether your project is a clone or genuinely innovative, with difficulty level scoring.",
    color: "#f59e0b",
  },
  {
    icon: "🚀",
    title: "Improvement Suggestions",
    desc: "Actionable recommendations to boost your score before submission day.",
    color: "#ef4444",
  },
];

const stats = [
  { value: "99%", label: "Evaluation Accuracy" },
  { value: "<60s", label: "Average Turnaround" },
  { value: "10+", label: "AI Evaluation Criteria" },
  { value: "3 Tiers", label: "Viva Questions" },
];

const workflow = [
  { step: "01", title: "Upload Project", desc: "Submit your report (PDF/DOCX), source code (ZIP or GitHub), and PPT.", icon: "📤" },
  { step: "02", title: "AI Evaluates", desc: "Our Gemini-powered engine analyzes every aspect of your submission.", icon: "🤖" },
  { step: "03", title: "Receive Insights", desc: "Get predicted marks, strengths, weaknesses, and viva questions instantly.", icon: "📊" },
  { step: "04", title: "Teacher Reviews", desc: "Instructors review AI scores, adjust marks, add comments, and export PDF reports.", icon: "👨‍🏫" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(15,15,26,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--surface-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            PS
          </div>
          <span className="font-display font-bold text-lg gradient-text">
            ProjectSense AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Login
          </Link>
          <Link href="/login?tab=register" className="btn-primary" style={{ padding: "0.5rem 1.25rem" }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-24 px-6 text-center overflow-hidden"
        style={{ background: "var(--gradient-glow)" }}
      >
        {/* Background glow orbs */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #6366f1 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "#8b5cf6" }}
        />

        <div className="relative max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Powered by Google Gemini AI
          </div>

          <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
            <span style={{ color: "var(--text-primary)" }}>Evaluate Projects</span>
            <br />
            <span className="gradient-text">With AI Precision</span>
          </h1>

          <p
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Stop spending hours grading. ProjectSense AI evaluates reports, code,
            documentation, and generates personalized viva questions — in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?tab=register" className="btn-primary text-lg px-8 py-3">
              Start Evaluating Free →
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">
              Teacher Login
            </Link>
          </div>
        </div>

        {/* Hero stats */}
        <div className="relative max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
              <p
                className="font-display font-black text-3xl mb-1 gradient-text"
              >
                {s.value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="gradient-text">Everything You Need</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              10 powerful AI evaluation criteria built into one seamless platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass-card glass-card-hover rounded-2xl p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-display font-bold text-lg mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "var(--surface-muted)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              From upload to full report in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((w, i) => (
              <div key={w.step} className="relative">
                {i < workflow.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-8 left-full w-full h-px -z-0"
                    style={{
                      background: "linear-gradient(90deg, rgba(99,102,241,0.4), transparent)",
                      width: "calc(100% - 2rem)",
                      left: "calc(100% - 0rem)",
                    }}
                  />
                )}
                <div className="glass-card rounded-2xl p-6 text-center relative z-10">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                    style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    {w.icon}
                  </div>
                  <div
                    className="text-xs font-mono font-bold mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    STEP {w.step}
                  </div>
                  <h3
                    className="font-display font-bold text-base mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {w.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {w.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample Evaluation Preview ────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4">
              <span className="gradient-text">Sample Evaluation Output</span>
            </h2>
          </div>
          <div className="glass-card rounded-3xl p-8">
            <div className="flex flex-wrap gap-6 justify-center mb-8">
              {[
                { label: "Report", score: 88, color: "#6366f1" },
                { label: "Code", score: 92, color: "#8b5cf6" },
                { label: "Innovation", score: 76, color: "#10b981" },
                { label: "Documentation", score: 83, color: "#f59e0b" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle
                        cx="48" cy="48" r="38"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - s.score / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="font-bold text-xl" style={{ color: s.color }}>{s.score}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>/100</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mt-2" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <p className="text-xs font-bold mb-2 text-green-400">✅ STRENGTHS</p>
                {["Clean architecture", "Comprehensive API", "Well-documented code"].map(s => (
                  <p key={s} className="text-sm text-green-300/80 py-0.5">• {s}</p>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="text-xs font-bold mb-2 text-yellow-400">⚠️ IMPROVE</p>
                {["Add unit tests", "Expand literature review", "Include ER diagram"].map(s => (
                  <p key={s} className="text-sm text-yellow-300/80 py-0.5">• {s}</p>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <p className="text-xs font-bold mb-2 text-brand-400">🎤 VIVA SAMPLE</p>
                <p className="text-sm text-brand-300/80 py-0.5">• What is your project?</p>
                <p className="text-sm text-yellow-300/80 py-0.5">• Why FastAPI over Django?</p>
                <p className="text-sm text-red-300/80 py-0.5">• How would you scale to 10M users?</p>
              </div>
            </div>

            <div
              className="mt-6 p-4 rounded-xl text-sm"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", color: "var(--text-secondary)" }}
            >
              <strong style={{ color: "#818cf8" }}>AI Feedback: </strong>
              Excellent implementation with a clean architecture. Documentation is strong, but testing coverage is limited.
              Consider adding automated tests and deployment details.
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-3xl p-12"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 100%)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <h2 className="font-display font-black text-4xl mb-4 gradient-text">
              Ready to Evaluate Smarter?
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Join students and teachers already using ProjectSense AI to save time and improve academic outcomes.
            </p>
            <Link href="/login?tab=register" className="btn-primary text-lg px-10 py-4">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 text-center text-sm"
        style={{
          borderTop: "1px solid var(--surface-border)",
          color: "var(--text-muted)",
        }}
      >
        <p>© 2026 ProjectSense AI — AI-Powered Academic Project Evaluation Platform</p>
      </footer>
    </div>
  );
}
